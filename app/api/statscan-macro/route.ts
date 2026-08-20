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
  unemployment: MacroIndicator | null   // null if vector unavailable
  liveAt:       string
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface DataPoint { refPer: string; value: number }

async function fetchVector(vectorId: string, latestN: number): Promise<DataPoint[]> {
  // StatsCan WDS API requires POST with JSON body — GET returns 404
  const res = await fetch(WDS_BASE, {
    method: 'POST',
    next: { revalidate: 14400 },   // 4-hour server cache
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      'User-Agent':   'Lakive/1.0 (+https://lakive.com)',
    },
    body: JSON.stringify([{ vectorId: parseInt(vectorId, 10), latestN }]),
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
    // Fetch independently so a single bad vector doesn't block the other
    const [cpiResult, unempResult] = await Promise.allSettled([
      fetchVector(CPI_VECTOR, 14),
      fetchVector(UNEMP_VECTOR, 2),
    ])

    const cpiPts   = cpiResult.status   === 'fulfilled' ? cpiResult.value   : []
    const unempPts = unempResult.status === 'fulfilled' ? unempResult.value  : []

    if (cpiResult.status === 'rejected') console.error('[statscan] CPI fetch failed:', cpiResult.reason)
    if (unempResult.status === 'rejected') console.error('[statscan] Unemp fetch failed:', unempResult.reason)

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

    // ── Unemployment: rate returned directly (optional — falls back to null) ───
    const unemployment: MacroIndicator | null = (() => {
      if (!unempPts.length) return null
      const val  = parseFloat(unempPts[0].value.toFixed(1))
      const prev = unempPts.length > 1 ? parseFloat(unempPts[1].value.toFixed(1)) : val
      if (val < 0 || val > 25) return null
      return { value: val, prev, date: fmtPeriod(unempPts[0].refPer), source: 'Statistics Canada LFS (auto)' }
    })()

    // Keep legacy variable names for the block below
    const unempVal  = unemployment?.value  ?? 0
    const unempPrev = unemployment?.prev   ?? 0

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
