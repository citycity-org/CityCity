import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase-server'
import type { SharedInsight, SharedCityResult } from '@/lib/types/share'

export const runtime     = 'nodejs'
export const contentType = 'image/png'
export const size        = { width: 1200, height: 630 }

function scoreColor(s: number): string {
  if (s >= 80) return '#14B8A6'
  if (s >= 70) return '#4F8EF7'
  if (s >= 55) return '#F59E0B'
  if (s >= 40) return '#E86C2F'
  return '#EF4444'
}

function scoreToLevel(s: number): string {
  if (s >= 80) return 'L1'
  if (s >= 70) return 'L2'
  if (s >= 55) return 'L3'
  if (s >= 40) return 'L4'
  return 'L5'
}

function propLabel(id: string): string {
  const map: Record<string, string> = {
    '1br': '1BR', '2br': '2BR', '3br': '3BR', 'townhouse': 'Townhouse', 'detached': 'Detached',
  }
  return map[id] ?? id
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServerClient()
  const { data } = await db
    .from('shared_insights')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!data) {
    // Fallback card
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#14B8A6', fontSize: 48, fontWeight: 900 }}>Lakive</div>
      </div>,
      size,
    )
  }

  const insight = data as SharedInsight
  const sorted  = [...insight.city_results].sort((a, b) => b.score - a.score)
  const best    = sorted[0]

  // Show at most 5 cities in the OG image
  const displayCities = sorted.slice(0, 5)
  const maxScore = displayCities[0]?.score ?? 99

  return new ImageResponse(
    <div
      style={{
        width: 1200, height: 630,
        background: 'linear-gradient(145deg, #0d1117 0%, #131b2e 55%, #162035 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        padding: '48px 56px 40px',
        position: 'relative',
      }}
    >
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: '#14B8A6', fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em' }}>Lakive</div>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            City Fit Engine
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          {insight.data_version}
        </div>
      </div>

      {/* ── Title area ── */}
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#fff', fontSize: 34, fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>
          {insight.occupation_name}
          {' '}
          <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 400, fontSize: 26 }}>
            · {propLabel(insight.housing_type)} · {insight.country_scope}
          </span>
        </div>
        {insight.key_insight && (
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.5 }}>
            {insight.key_insight}
          </div>
        )}
      </div>

      {/* ── City bars ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {displayCities.map((city, i) => {
          const barPct = Math.round((city.score / maxScore) * 100)
          const color  = scoreColor(city.score)
          const isTop  = i === 0
          return (
            <div
              key={city.cityId}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              {/* Rank badge */}
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                background: isTop ? '#4F8EF7' : 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>{i + 1}</div>

              {/* City name */}
              <div style={{ width: 148, color: isTop ? '#fff' : 'rgba(255,255,255,0.70)', fontSize: 15, fontWeight: isTop ? 700 : 500, flexShrink: 0 }}>
                {city.cityName}
              </div>

              {/* Bar */}
              <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${barPct}%`, background: color, borderRadius: 4 }} />
              </div>

              {/* Score + level */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100, flexShrink: 0, justifyContent: 'flex-end' }}>
                <div style={{ color, fontWeight: 800, fontSize: 20 }}>{city.score}</div>
                <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 11 }}>{scoreToLevel(city.score)}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 28, paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          lakive.com/s/{insight.id}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          Free housing affordability analysis · No sign-up required
        </div>
      </div>
    </div>,
    size,
  )
}
