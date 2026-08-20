import { NextResponse } from 'next/server'

// ── Statistics Canada WDS API ─────────────────────────────────────────────────
// Same pattern as the BoC Valet API already in use.
// Vector IDs:
//   v41690973 — Table 18-10-0004-01, CPI All-items, Canada (index value)
//   v2062815  — Table 14-10-0017-01, Unemployment rate, Canada, both sexes 15+
//
// CPI is an INDEX value — we calculate YoY % from 14 periods (current vs 12m ago).
// Unemployment is returned directly as the rate %.
//
// Cache: 4h server-side (data changes at most once per month).

const WDS_BASE    = 'https://www150.statcan.gc.ca/t1/tbl1/en/downloadData/v2/getDataFromVectorsAndLatestNPeriods'
const CPI_VECTOR   = '41690973'   // CPI All-items index, Canada (numeric — no "v" prefix in URL)
const UNEMP_VECTOR = '2062815'    // Unemployment rate, Canada (numeric)

export interface MacroIndicator {
  value:  number
  prev:   number
  date:   string   // e.g. "Jul 2026"
  source: string
}

export interface StatscanMacro {
  cpi:          MacroIndicator
  unemployment: MacroIndicator
  liveAt:       string   // ISO timestamp of this fetch
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface DataPoint { refPer: string; value: number }

async function fetchVector(vectorId: string, latestN: number): Promise<DataPoint[]> {
  const url = `${WDS_BASE}?vectorIds=${vectorId}&latestN=${latestN}`
  const res = await fetch(url, {
    next: { revalidate: 14400 },   // 4-hour server cache
    headers: {
      Accept:       'application/json',
      'User-Agent': 'Lakive/1.0 (+https://lakive.com)',
    },
  })
  if (!res.ok) throw new Error(`StatsCan HTTP ${res.status} for ${vectorId}`)

  const json: unknown = await res.json()

  // Response is an array; each element wraps one vector
  const entry  = (Array.isArray(json) ? json[0] : json) as Record<string, unknown> | null
  const obj    = entry?.['object'] as Record<string, unknown> | undefined
  const pts    = obj?.['vectorDataPoint'] as Array<Record<string, unknown>> | undefined

  if (!pts?.length) throw new Error(`No data points returned for ${vectorId}`)

  // Sort newest-first (API may return oldest-first)
  return (pts as Array<{ refPerRaw?: string; refPer?: string; value: number }>)
    .map(p => ({
      refPer: (p.refPerRaw ?? p.refPer ?? '').toString().slice(0, 7),  // "2026-07"
      value:  p.value,
    }))
    .filter(p => p.refPer && !isNaN(p.value))
    .sort((a, b) => b.refPer.localeCompare(a.refPer))
}

// "2026-07" → "Jul 2026"
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
  try {
    // Fetch in parallel — CPI needs 14 periods to compute both current & prev YoY
    const [cpiPts, unempPts] = await Promise.all([
      fetchVector(CPI_VECTOR, 14),
      fetchVector(UNEMP_VECTOR, 2),
    ])

    // ── CPI: calculate YoY % from index values ───────────────────────────────
    // pts[0]  = most recent month's index
    // pts[12] = 12 months prior index  → YoY = (pts[0] / pts[12] - 1) * 100
    // pts[1]  = previous month's index → prev YoY = (pts[1] / pts[13] - 1) * 100
    if (cpiPts.length < 14) {
      throw new Error(`Insufficient CPI data — expected 14 points, got ${cpiPts.length}`)
    }

    const cpiCurrent = (cpiPts[0].value  / cpiPts[12].value - 1) * 100
    const cpiPrev    = (cpiPts[1].value  / cpiPts[13].value - 1) * 100

    // Sanity check — CPI should be within -5% … +20%
    if (cpiCurrent < -5 || cpiCurrent > 20) {
      throw new Error(`CPI out of expected range: ${cpiCurrent.toFixed(2)}%`)
    }

    const cpi: MacroIndicator = {
      value:  parseFloat(cpiCurrent.toFixed(1)),
      prev:   parseFloat(cpiPrev.toFixed(1)),
      date:   fmtPeriod(cpiPts[0].refPer),
      source: 'Statistics Canada (auto)',
    }

    // ── Unemployment: rate returned directly ─────────────────────────────────
    if (!unempPts.length) throw new Error('No unemployment data returned')

    const unempVal  = parseFloat(unempPts[0].value.toFixed(1))
    const unempPrev = unempPts.length > 1
      ? parseFloat(unempPts[1].value.toFixed(1))
      : unempVal

    // Sanity check — unemployment should be 0%–25%
    if (unempVal < 0 || unempVal > 25) {
      throw new Error(`Unemployment out of expected range: ${unempVal}%`)
    }

    const unemployment: MacroIndicator = {
      value:  unempVal,
      prev:   unempPrev,
      date:   fmtPeriod(unempPts[0].refPer),
      source: 'Statistics Canada LFS (auto)',
    }

    const body: StatscanMacro = { cpi, unemployment, liveAt: new Date().toISOString() }

    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=3600' },
    })

  } catch (err) {
    console.error('[statscan-macro] Error:', err)
    return NextResponse.json(
      { error: String(err) },
      {
        status: 503,
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
      }
    )
  }
}
