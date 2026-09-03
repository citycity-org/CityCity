import { NextResponse } from 'next/server'
import { CA_CONFIG } from '@/lib/market-config'

// ── Data sources ──────────────────────────────────────────────────────────────
// CPI:          BoC Valet API (proxies StatsCan V41690973) — monthly index values
// Unemployment: OECD Statistics API (Canada monthly harmonised rate) — 1-2 months lag
//
// Both are free, public, no API key required.
// StatsCan WDS direct endpoint returns 404 from Vercel IPs.
//
// SINGLE SOURCE OF TRUTH RULE:
//   market-config.ts is always the authoritative floor.
//   Live API data only overrides if it represents a NEWER period than market-config.
//   This prevents stale API cache from rolling back a manual update.

const BOC_CPI_URL = 'https://www.bankofcanada.ca/valet/observations/V41690973/json?recent=14'

// OECD SDMX-JSON: Canada (CAN), monthly (M), harmonised unemployment rate (LRUNTTTT)
const OECD_UNEMP_URL = 'https://stats.oecd.org/SDMX-JSON/data/STLABOUR/CAN.LRUNTTTT.M/all?lastNObservations=3'

// ── Static fallback — always derived from market-config (single source of truth) ──
const FALLBACK_CPI: MacroIndicator = {
  value:  CA_CONFIG.cpi.value,
  prev:   CA_CONFIG.cpi.prev,
  date:   CA_CONFIG.cpi.date,
  source: `${CA_CONFIG.cpi.source} · Manual`,
}
const FALLBACK_UNEMP: MacroIndicator = {
  value:  CA_CONFIG.unemployment.value,
  prev:   CA_CONFIG.unemployment.prev,
  date:   CA_CONFIG.unemployment.date,
  source: `${CA_CONFIG.unemployment.source} · Manual`,
}

// Parse a human-readable date string like "Jul 2026" or "2026-07" to a sortable key "2026-07"
function parseDateKey(d: string): string {
  // Already ISO-style: "2026-07"
  if (/^\d{4}-\d{2}/.test(d)) return d.slice(0, 7)
  // Human-readable: "Jul 2026", "Jun 2026", etc.
  const months: Record<string, string> = {
    Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12',
  }
  const m = d.match(/([A-Za-z]{3})\s+(\d{4})/)
  if (m) return `${m[2]}-${months[m[1]] ?? '01'}`
  return ''
}

// Only use live data if it is strictly newer than the manual market-config value
function isNewerThan(liveDate: string, configDate: string): boolean {
  const l = parseDateKey(liveDate)
  const c = parseDateKey(configDate)
  return l > c
}

export interface MacroIndicator {
  value:  number
  prev:   number
  date:   string
  source: string
}

export interface StatscanMacro {
  cpi:          MacroIndicator
  unemployment: MacroIndicator
  live:         boolean
  liveAt:       string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface DataPoint { refPer: string; value: number }

// BoC Valet: { observations: [{ d: "2026-07-01", V41690973: { v: "162.4" } }] }
async function fetchBoCVector(url: string, seriesKey: string): Promise<DataPoint[]> {
  const res = await fetch(url)
  const text = await res.text()
  console.log(`[boc] ${seriesKey} status=${res.status} body=${text.slice(0, 300)}`)
  if (!res.ok) throw new Error(`BoC HTTP ${res.status}`)
  const json = JSON.parse(text) as { observations?: Array<Record<string, unknown>> }
  const obs = json.observations
  if (!obs?.length) throw new Error('No BoC observations')
  return obs
    .map(o => ({
      refPer: String(o['d'] ?? '').slice(0, 7),
      value:  parseFloat(String((o[seriesKey] as Record<string,string>)?.v ?? 'NaN')),
    }))
    .filter(p => p.refPer && !isNaN(p.value))
    .sort((a, b) => b.refPer.localeCompare(a.refPer))
}

// OECD SDMX-JSON: dataSets[0].series["0:0:0"].observations[i] maps to
// structure.dimensions.observation[0].values[i].id (time period)
async function fetchOECDUnemployment(): Promise<DataPoint[]> {
  const res = await fetch(OECD_UNEMP_URL)
  const text = await res.text()
  console.log(`[oecd] unemp status=${res.status} body=${text.slice(0, 300)}`)
  if (!res.ok) throw new Error(`OECD HTTP ${res.status}`)

  const json = JSON.parse(text) as {
    dataSets: Array<{ series: Record<string, { observations: Record<string, number[]> }> }>
    structure: { dimensions: { observation: Array<{ values: Array<{ id: string }> }> } }
  }

  const seriesKey = Object.keys(json.dataSets[0].series)[0]
  const obs       = json.dataSets[0].series[seriesKey].observations
  const periods   = json.structure.dimensions.observation[0].values

  return Object.entries(obs)
    .map(([idx, vals]) => ({
      refPer: periods[parseInt(idx)].id.slice(0, 7),
      value:  vals[0],
    }))
    .filter(p => p.refPer && !isNaN(p.value))
    .sort((a, b) => b.refPer.localeCompare(a.refPer))
}

function fmtPeriod(refPer: string): string {
  try {
    const [yr, mo] = refPer.split('-')
    return new Date(Number(yr), Number(mo) - 1, 1)
      .toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })
  } catch { return refPer }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const [cpiResult, unempResult] = await Promise.allSettled([
    fetchBoCVector(BOC_CPI_URL, 'V41690973'),
    fetchOECDUnemployment(),
  ])

  if (cpiResult.status   === 'rejected') console.error('[macro] CPI failed:',  String(cpiResult.reason))
  if (unempResult.status === 'rejected') console.error('[macro] Unemp failed:', String(unempResult.reason))

  const cpiPts   = cpiResult.status   === 'fulfilled' ? cpiResult.value : []
  const unempPts = unempResult.status === 'fulfilled' ? unempResult.value : []

  // ── CPI (YoY % from index) ────────────────────────────────────────────────
  // Only use live data if it is NEWER than market-config to prevent API lag rollback
  let cpi: MacroIndicator = FALLBACK_CPI
  let cpiLive = false
  if (cpiPts.length >= 14) {
    const cur  = (cpiPts[0].value / cpiPts[12].value - 1) * 100
    const prev = (cpiPts[1].value / cpiPts[13].value - 1) * 100
    const liveDate = fmtPeriod(cpiPts[0].refPer)
    if (cur >= -5 && cur <= 20 && isNewerThan(liveDate, CA_CONFIG.cpi.date)) {
      cpi = { value: parseFloat(cur.toFixed(1)), prev: parseFloat(prev.toFixed(1)),
              date: liveDate, source: 'Statistics Canada (auto)' }
      cpiLive = true
    }
  }

  // ── Unemployment (OECD rate, 1-2mo lag) ──────────────────────────────────
  // Only use live data if it is NEWER than market-config
  let unemployment: MacroIndicator = FALLBACK_UNEMP
  let unempLive = false
  if (unempPts.length >= 1) {
    const val  = parseFloat(unempPts[0].value.toFixed(1))
    const prev = unempPts.length > 1 ? parseFloat(unempPts[1].value.toFixed(1)) : val
    const liveDate = fmtPeriod(unempPts[0].refPer)
    if (val >= 0 && val <= 25 && isNewerThan(liveDate, CA_CONFIG.unemployment.date)) {
      unemployment = { value: val, prev, date: liveDate,
                       source: 'OECD / Statistics Canada (auto)' }
      unempLive = true
    }
  }

  const live = cpiLive || unempLive
  const body: StatscanMacro = { cpi, unemployment, live, liveAt: new Date().toISOString() }
  const maxAge = live ? 14400 : 3600

  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=600` },
  })
}
