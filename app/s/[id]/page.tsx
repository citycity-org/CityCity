import { notFound }    from 'next/navigation'
import { Metadata }     from 'next'
import Link             from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import type { SharedInsight, SharedCityResult } from '@/lib/types/share'

const SITE_URL        = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.lakive.com'
const CURRENT_CALC    = '1.0'
const CURRENT_DATA    = '2026-H1'

// ── Score → color ──────────────────────────────────────────────────────────────
function sc(s: number) {
  if (s >= 80) return '#14B8A6'
  if (s >= 70) return '#60A5FA'
  if (s >= 55) return '#F59E0B'
  if (s >= 40) return '#E86C2F'
  return '#EF4444'
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const db   = createServerClient()
  const { data } = await db
    .from('shared_insights')
    .select('occupation_name,highest_score_city,key_insight,id')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) return { title: 'City Fit | Lakive' }

  const title = `${data.occupation_name} City Fit — ${data.highest_score_city} leads | Lakive`
  const desc  = data.key_insight ?? `See how ${data.occupation_name} salaries compare across cities for housing affordability.`
  const ogUrl = `${SITE_URL}/s/${data.id}/opengraph-image`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/s/${data.id}`,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogUrl],
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function SharePage({ params }: { params: { id: string } }) {
  const db = createServerClient()
  const { data, error } = await db
    .from('shared_insights')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !data) notFound()

  const insight = data as SharedInsight

  // Fire-and-forget access tracking
  db.from('shared_insights')
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: (insight.access_count ?? 0) + 1,
    })
    .eq('id', params.id)
    .then()

  const sorted = [...insight.city_results].sort((a, b) => b.score - a.score)
  const best   = sorted[0]
  const isStale = insight.calculation_version !== CURRENT_CALC || insight.data_version !== CURRENT_DATA

  const propLabel = (id: string) => {
    const map: Record<string, string> = {
      '1br': '1-Bedroom Apt', '2br': '2-Bedroom Apt',
      '3br': '3-Bedroom Apt', 'townhouse': 'Townhouse', 'detached': 'Detached House',
    }
    return map[id] ?? id
  }

  const incomeLabel = () => {
    if (insight.income_display === 'range' && insight.income_range)
      return `Salary: ${insight.income_range}`
    if (insight.income_display === 'exact' && insight.income_exact)
      return `Salary: $${insight.income_exact.toLocaleString()}`
    return null
  }

  const createdDate = new Date(insight.created_at).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#14B8A6', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>Lakive</span>
        </Link>
        <Link href="/calculate" style={{ textDecoration: 'none', color: '#4F8EF7', fontSize: 13, fontWeight: 600 }}>
          Run your own City Fit →
        </Link>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 8, color: 'rgba(255,255,255,0.32)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          City Fit Engine · Shared Result
        </div>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 0 6px', lineHeight: 1.2 }}>
          {insight.occupation_name}
        </h1>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 4 }}>
          {propLabel(insight.housing_type)} · {insight.country_scope}
          {incomeLabel() && <> · <span style={{ color: 'rgba(255,255,255,0.35)' }}>{incomeLabel()}</span></>}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 32 }}>
          Shared {createdDate} · Data: {insight.data_version}
        </div>

        {/* Stale data notice */}
        {isStale && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 28, fontSize: 13, color: '#F59E0B', lineHeight: 1.5 }}>
            ⚠️ This snapshot was generated with an older version of Lakive&apos;s model or data.
            Numbers may differ from current calculations.{' '}
            <Link href="/calculate" style={{ color: '#F59E0B', fontWeight: 700 }}>Re-run for latest →</Link>
          </div>
        )}

        {/* Key insight */}
        {insight.key_insight && (
          <div style={{ background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: 12, padding: '14px 18px', marginBottom: 28, fontSize: 14, color: 'rgba(255,255,255,0.80)', lineHeight: 1.6 }}>
            💡 {insight.key_insight}
          </div>
        )}

        {/* City cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {sorted.map((city, i) => <CityCard key={city.cityId} city={city} rank={i + 1} isTop={i === 0} />)}
        </div>

        {/* CTA */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>
            Run your own comparison — free, no sign-up required
          </div>
          <Link href="/calculate" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-block', background: '#4F8EF7', color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10 }}>
              Calculate My City Fit →
            </div>
          </Link>
          <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, marginTop: 14 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>lakive.com</Link>
            {' · '}City Fit Engine · Data version {insight.data_version}
          </div>
        </div>

      </div>
    </main>
  )
}

// ── City card sub-component ────────────────────────────────────────────────────
function CityCard({ city, rank, isTop }: { city: SharedCityResult; rank: number; isTop: boolean }) {
  const color = sc(city.score)
  const barW  = `${city.score}%`

  return (
    <div style={{
      background: isTop ? 'rgba(79,142,247,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isTop ? 'rgba(79,142,247,0.22)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: isTop ? '#4F8EF7' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {rank}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{city.cityName}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{city.province}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{city.score}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{city.level}</div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: barW, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20 }}>
        <Stat label="Home Price (yrs income)" value={`${city.hpiYears}y`} />
        <Stat label="Rent (% gross income)" value={`${city.rpi}%`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{value}</div>
    </div>
  )
}
