import { NextRequest, NextResponse } from 'next/server'
import { createHash }                from 'crypto'
import { nanoid }                    from 'nanoid'
import { createServerClient }        from '@/lib/supabase-server'
import type { CreateSharePayload, SharedInsight, SharedCityResult } from '@/lib/types/share'

const CALC_VERSION = '1.0'
const DATA_VERSION = '2026-H1'
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.lakive.com'

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreToLevel(score: number): string {
  if (score >= 80) return 'L1 Lower Pressure'
  if (score >= 70) return 'L2 Manageable'
  if (score >= 55) return 'L3 Under Pressure'
  if (score >= 40) return 'L4 Difficult'
  return 'L5 Severe Pressure'
}

/** Bracket income to nearest $10K range, e.g. 82000 → '$80K–$90K' */
function toIncomeRange(income: number): string {
  const lo = Math.floor(income / 10000) * 10
  const hi = lo + 10
  return `$${lo}K–$${hi}K`
}

/** Canonical hash over the fields that define a unique computation */
function contentHash(payload: CreateSharePayload): string {
  const canonical = {
    occupation_id:       payload.occupation_id,
    housing_type:        payload.housing_type,
    city_ids:            payload.city_results.map(r => r.cityId).sort(),
    scores:              payload.city_results.map(r => r.score).sort((a, b) => a - b),
    calculation_version: CALC_VERSION,
    data_version:        DATA_VERSION,
  }
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex').slice(0, 32)
}

/** Generate a one-liner key insight from the city results */
function buildKeyInsight(
  cityResults: SharedCityResult[],
  occupationName: string,
): string {
  const sorted = [...cityResults].sort((a, b) => b.score - a.score)
  const best   = sorted[0]
  const worst  = sorted[sorted.length - 1]

  if (sorted.length === 1) {
    return `${best.cityName} scores ${best.score} points for ${occupationName}.`
  }

  const ratio = best.score / Math.max(worst.score, 1)
  if (ratio >= 1.4) {
    return `${best.cityName} is ${ratio.toFixed(1)}× ahead of ${worst.cityName} for ${occupationName}.`
  }

  const spread = best.score - worst.score
  if (spread <= 8) {
    return `All ${sorted.length} cities score within ${spread} points for ${occupationName}.`
  }

  return `${best.cityName} leads the pack for ${occupationName} with a score of ${best.score}.`
}

/** Determine country scope from city results */
function detectCountryScope(cityResults: SharedCityResult[]) {
  const US_PROVINCES = new Set(['Washington', 'California', 'New York', 'Massachusetts'])
  const hasCA = cityResults.some(r => !US_PROVINCES.has(r.province))
  const hasUS = cityResults.some(r =>  US_PROVINCES.has(r.province))
  if (hasCA && hasUS) return 'Canada + USA'
  if (hasUS)          return 'USA'
  return 'Canada'
}

// ── POST /api/share ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let payload: CreateSharePayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Basic validation
  if (!payload.occupation_id || !payload.housing_type || !Array.isArray(payload.city_results) || payload.city_results.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Enrich city_results with level labels (computed server-side, not trusted from client)
  const cityResults: SharedCityResult[] = payload.city_results.map(r => ({
    ...r,
    level: scoreToLevel(r.score),
  }))

  const hash          = contentHash(payload)
  const highestCity   = [...cityResults].sort((a, b) => b.score - a.score)[0]
  const keyInsight    = buildKeyInsight(cityResults, payload.occupation_name)
  const countryScope  = detectCountryScope(cityResults)

  // Income handling
  let income_display = payload.income_display ?? 'hidden'
  let income_range:  string | null = null
  let income_exact:  number | null = null

  if (income_display === 'range' && payload.income_value) {
    income_range = toIncomeRange(payload.income_value)
  } else if (income_display === 'exact' && payload.income_value) {
    income_exact = payload.income_value
  } else {
    income_display = 'hidden'
  }

  const db = createServerClient()

  // ── Deduplication: check if this exact computation already has a record ───────
  const { data: existing } = await db
    .from('shared_insights')
    .select('id')
    .eq('content_hash', hash)
    .maybeSingle()

  if (existing?.id) {
    return NextResponse.json({
      id:  existing.id,
      url: `${SITE_URL}/s/${existing.id}`,
      new: false,
    })
  }

  // ── Create new record ─────────────────────────────────────────────────────────
  const id = nanoid(8)

  const record: Omit<SharedInsight, 'last_accessed_at' | 'access_count' | 'created_at'> = {
    id,
    content_hash:        hash,
    occupation_id:       payload.occupation_id,
    occupation_name:     payload.occupation_name,
    country_scope:       countryScope,
    housing_type:        payload.housing_type,
    city_results:        cityResults,
    highest_score_city:  highestCity.cityName,
    key_insight:         keyInsight,
    income_display,
    income_range,
    income_exact,
    calculation_version: CALC_VERSION,
    data_version:        DATA_VERSION,
  }

  const { error } = await db.from('shared_insights').insert(record)

  if (error) {
    // Handle rare race-condition dedup (unique constraint on content_hash)
    if (error.code === '23505') {
      const { data: raceHit } = await db
        .from('shared_insights')
        .select('id')
        .eq('content_hash', hash)
        .maybeSingle()
      if (raceHit?.id) {
        return NextResponse.json({
          id:  raceHit.id,
          url: `${SITE_URL}/s/${raceHit.id}`,
          new: false,
        })
      }
    }
    console.error('[share] insert error', error)
    return NextResponse.json({ error: 'Failed to save share' }, { status: 500 })
  }

  return NextResponse.json(
    { id, url: `${SITE_URL}/s/${id}`, new: true },
    { status: 201 },
  )
}
