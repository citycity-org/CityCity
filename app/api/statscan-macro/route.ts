import { NextResponse } from 'next/server'

// ── Data sources ──────────────────────────────────────────────────────────────
// CPI:          BoC Valet API (proxies StatsCan V41690973) — monthly index values
// Unemployment: OECD Statistics API (Canada monthly harmonised rate) — 1-2 months lag
//
// Both are free, public, no API key required.
// StatsCan WDS direct endpoint returns 404 from Vercel IPs.

const BOC_CPI_URL = 'https://www.bankofcanada.ca/valet/observations/V41690973/json?recent=14'

// OECD SDMX-JSON: Canada (CAN), monthly (M), harmonised unemployment rate (LRUNTTTT)
const OECD_UNEMP_URL = 'https://stats.oecd.org/SDMX-JSON/data/STLABOUR/CAN.LRUNTTTT.M/all?lastNObservations=3'

// ── Static fallback ───────────────────────────────────────────────────────────
const FALLBACK_CPI   = { value: 3.0, prev: 2.8, date: 'Jul 2026', source: 'Statistics Canada · Manual' }
const FALLBACK_UNEMP = { value: 6.4, prev: 6.5, date: 'Jul 2026', source: 'Statistics Canada LFS · Manual' }

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
  let cpi: MacroIndicator
  let cpiLive = false
  if (cpiPts.length >= 14) {
    const cur  = (cpiPts[0].value / cpiPts[12].value - 1) * 100
    const prev = (cpiPts[1].value / cpiPts[13].value - 1) * 100
    if (cur >= -5 && cur <= 20) {
      cpi = { value: parseFloat(cur.toFixed(1)), prev: parseFloat(prev.toFixed(1)),
              date: fmtPeriod(cpiPts[0].refPer), source: 'Statistics Canada (auto)' }
      cpiLive = true
    } else { cpi = FALLBACK_CPI }
  } else { cpi = FALLBACK_CPI }

  // ── Unemployment (OECD rate, 1-2mo lag) ──────────────────────────────────
  let unemployment: MacroIndicator
  let unempLive = false
  if (unempPts.length >= 1) {
    const val  = parseFloat(unempPts[0].value.toFixed(1))
    const prev = unempPts.length > 1 ? parseFloat(unempPts[1].value.toFixed(1)) : val
    if (val >= 0 && val <= 25) {
      unemployment = { value: val, prev, date: fmtPeriod(unempPts[0].refPer),
                       source: 'OECD / Statistics Canada (auto)' }
      unempLive = true
    } else { unemployment = FALLBACK_UNEMP }
  } else { unemployment = FALLBACK_UNEMP }

  const live = cpiLive || unempLive
  const body: StatscanMacro = { cpi, unemployment, live, liveAt: new Date().toISOString() }
  const maxAge = live ? 14400 : 3600

  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=600` },
  })
}
