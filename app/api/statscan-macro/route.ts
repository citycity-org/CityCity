import { NextResponse } from 'next/server'

// ── Statistics Canada WDS API ─────────────────────────────────────────────────
// Vector IDs:
//   41690973 — Table 18-10-0004-01, CPI All-items, Canada (index value)
//   2062815  — Table 14-10-0017-01, Unemployment rate, Canada (returns 404 — wrong ID)
//
// CPI is an INDEX value — calculate YoY % from 14 periods (current vs 12m ago).
// Unemployment: correct vector ID still unknown; falls back to static config.
//
// If StatsCan API is unreachable (Vercel IP blocked / rate limited),
// the route returns static fallback values so MarketPulse always renders.

const WDS_BASE     = 'https://www150.statcan.gc.ca/t1/tbl1/en/downloadData/v2/getDataFromVectorsAndLatestNPeriods'
const CPI_VECTOR   = '41690973'
const UNEMP_VECTOR = '2062815'

// ── Static fallback (updated manually when auto-fetch fails) ──────────────────
const FALLBACK_CPI  = { value: 1.9, prev: 1.8, date: 'Jul 2026', source: 'Statistics Canada · Manual' }
const FALLBACK_UNEMP = null   // null → MarketPulse uses CA_CONFIG.unemployment

export interface MacroIndicator {
  value:  number
  prev:   number
  date:   string
  source: string
}

export interface StatscanMacro {
  cpi:          MacroIndicator
  unemployment: MacroIndicator | null
  live:         boolean          // true = fetched from API this request, false = fallback
  liveAt:       string
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface DataPoint { refPer: string; value: number }

async function fetchVector(vectorId: string, latestN: number): Promise<DataPoint[]> {
  const res = await fetch(WDS_BASE, {
    method: 'POST',
    // no next.revalidate here — caching at the HTTP response level instead
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      'User-Agent':   'Mozilla/5.0 (compatible; Lakive/1.0; +https://lakive.com)',
    },
    body: JSON.stringify([{ vectorId: parseInt(vectorId, 10), latestN }]),
  })

  const text = await res.text()
  console.log(`[statscan] vector ${vectorId} status=${res.status} body=${text.slice(0, 600)}`)

  if (!res.ok) throw new Error(`StatsCan HTTP ${res.status} for ${vectorId}`)

  const json: unknown = JSON.parse(text)

  // Handle both response shapes:
  //   [{status, object: {vectorDataPoint}}]
  //   [{responseStatusCode, vectorDataPoint}]
  const entry  = (Array.isArray(json) ? json[0] : json) as Record<string, unknown> | null
  const obj    = (entry?.['object'] ?? entry)          as Record<string, unknown> | undefined
  const pts    = obj?.['vectorDataPoint']               as Array<Record<string, unknown>> | undefined

  if (!pts?.length) throw new Error(`No data points for ${vectorId}`)

  return (pts as Array<{ refPerRaw?: string; refPer?: string; value: number }>)
    .map(p => ({
      refPer: (p.refPerRaw ?? p.refPer ?? '').toString().slice(0, 7),
      value:  p.value,
    }))
    .filter(p => p.refPer && !isNaN(p.value))
    .sort((a, b) => b.refPer.localeCompare(a.refPer))
}

function fmtPeriod(refPer: string): string {
  try {
    const [yr, mo] = refPer.split('-')
    return new Date(Number(yr), Number(mo) - 1, 1)
      .toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })
  } catch {
    return refPer
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const [cpiResult, unempResult] = await Promise.allSettled([
    fetchVector(CPI_VECTOR, 14),
    fetchVector(UNEMP_VECTOR, 2),
  ])

  if (cpiResult.status === 'rejected')
    console.error('[statscan] CPI fetch failed:', String(cpiResult.reason))
  if (unempResult.status === 'rejected')
    console.error('[statscan] Unemp fetch failed:', String(unempResult.reason))

  const cpiPts   = cpiResult.status   === 'fulfilled' ? cpiResult.value  : []
  const unempPts = unempResult.status === 'fulfilled' ? unempResult.value : []

  // ── CPI ─────────────────────────────────────────────────────────────────────
  let cpi: MacroIndicator
  let live = false

  if (cpiPts.length >= 14) {
    const cur  = (cpiPts[0].value  / cpiPts[12].value - 1) * 100
    const prev = (cpiPts[1].value  / cpiPts[13].value - 1) * 100
    if (cur >= -5 && cur <= 20) {
      cpi  = { value: parseFloat(cur.toFixed(1)), prev: parseFloat(prev.toFixed(1)),
               date: fmtPeriod(cpiPts[0].refPer), source: 'Statistics Canada (auto)' }
      live = true
    } else {
      console.warn(`[statscan] CPI out of range: ${cur.toFixed(2)}% — using fallback`)
      cpi = FALLBACK_CPI
    }
  } else {
    cpi = FALLBACK_CPI
  }

  // ── Unemployment ─────────────────────────────────────────────────────────────
  const unemployment: MacroIndicator | null = (() => {
    if (!unempPts.length) return FALLBACK_UNEMP
    const val  = parseFloat(unempPts[0].value.toFixed(1))
    const prev = unempPts.length > 1 ? parseFloat(unempPts[1].value.toFixed(1)) : val
    if (val < 0 || val > 25) return FALLBACK_UNEMP
    return { value: val, prev, date: fmtPeriod(unempPts[0].refPer), source: 'Statistics Canada LFS (auto)' }
  })()

  const body: StatscanMacro = { cpi, unemployment, live, liveAt: new Date().toISOString() }

  // Short cache when using fallback so we retry sooner
  const maxAge = live ? 14400 : 3600
  return NextResponse.json(body, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=600` },
  })
}
