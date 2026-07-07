'use client'
import { useState } from 'react'
import Link from 'next/link'
import { LakiveLogo } from '../components/LakiveLogo'
import { OCCUPATIONS, CITIES, calcHpiYears, formatYears } from './_data'

// ── Occupation categories ─────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'high-income',  label: 'High Income',    icon: '💎' },
  { key: 'tech',         label: 'Technology',      icon: '💻' },
  { key: 'trades',       label: 'Skilled Trades',  icon: '🔧' },
  { key: 'healthcare',   label: 'Healthcare',      icon: '🏥' },
  { key: 'professional', label: 'Professional',    icon: '📋' },
  { key: 'public',       label: 'Public Sector',   icon: '🏛️' },
  { key: 'service',      label: 'Service',         icon: '🛎️' },
]

// ── Topic cards ───────────────────────────────────────────────────────────────
const TOPICS = [
  {
    icon: '🏠', label: 'Housing Affordability',
    desc: 'How many years of income does it take to own a home — by city and occupation?',
    links: [
      { label: 'Calgary vs Vancouver', href: '/guide/electrician/calgary' },
      { label: 'Nurse in Toronto', href: '/guide/registered-nurse/toronto' },
      { label: 'Software Engineer housing', href: '/guide/software-engineer/vancouver' },
    ],
    available: true,
  },
  {
    icon: '🧾', label: 'Tax Environment',
    desc: 'Alberta has no provincial income tax. What does that mean for your take-home pay?',
    links: [
      { label: 'Why Calgary saves you money', href: '/city/calgary' },
      { label: 'Engineer in Calgary', href: '/guide/civil-engineer/calgary' },
      { label: 'Accountant in Alberta', href: '/guide/accountant/calgary' },
    ],
    available: true,
  },
  {
    icon: '📈', label: 'Career Demand',
    desc: 'Which occupations are in shortage — and which cities are actively hiring?',
    links: [
      { label: 'Electrician demand', href: '/guide/electrician/calgary' },
      { label: 'Truck Driver shortage', href: '/guide/truck-driver/calgary' },
      { label: 'Nurse shortage by city', href: '/guide/registered-nurse/ottawa' },
    ],
    available: true,
  },
  {
    icon: '💰', label: 'Rent vs Own',
    desc: 'When does renting make more sense than buying? A city-by-city breakdown.',
    links: [],
    available: false,
  },
  {
    icon: '🎓', label: 'Education & Licensing',
    desc: 'Foreign credentials, bridging programs, and what it takes to practice your profession in Canada.',
    links: [],
    available: false,
  },
  {
    icon: '🌏', label: 'Newcomer Guide',
    desc: 'Landing in Canada as a skilled worker — what to expect in each city.',
    links: [],
    available: false,
  },
]

const CITY_STATS: Record<string, { label: string; hpi: number; rpi: number; note: string; currency?: string }> = {
  // Canada
  calgary:         { label: 'Calgary, AB',       hpi: 8.5,  rpi: 24.1, note: 'No provincial tax · Fastest growth' },
  seattle:         { label: 'Seattle, WA',        hpi: 8.8,  rpi: 21.3, note: 'No state income tax · Amazon/Microsoft', currency: 'USD' },
  ottawa:          { label: 'Ottawa, ON',         hpi: 9.8,  rpi: 28.4, note: 'Federal jobs · Stable market' },
  montreal:        { label: 'Montréal, QC',       hpi: 10.0, rpi: 30.2, note: 'Most affordable major city' },
  boston:          { label: 'Boston, MA',          hpi: 11.8, rpi: 24.4, note: 'Biotech & universities hub', currency: 'USD' },
  toronto:         { label: 'Toronto, ON',         hpi: 15.1, rpi: 41.2, note: 'Largest job market in Canada' },
  'new-york':      { label: 'New York City, NY',   hpi: 14.8, rpi: 29.2, note: 'Finance capital · Highest diversity', currency: 'USD' },
  'san-francisco': { label: 'San Francisco, CA',   hpi: 15.6, rpi: 27.6, note: 'Top tech salaries · Extreme housing', currency: 'USD' },
  vancouver:       { label: 'Vancouver, BC',       hpi: 16.2, rpi: 43.6, note: 'Tech hub · Highest housing cost' },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GuidePage() {
  const [mode, setMode]         = useState<'career' | 'city' | 'topic' | null>(null)
  const [selCat, setSelCat]     = useState<string | null>(null)
  const [selOcc, setSelOcc]     = useState<string | null>(null)

  const cities   = Object.keys(CITIES)
  const occsByCat = (cat: string) => Object.entries(OCCUPATIONS).filter(([, v]) => v.category === cat)

  function reset() { setMode(null); setSelCat(null); setSelOcc(null) }

  return (
    <div style={{ background: '#080c14', minHeight: '100vh' }}>
      <main className="max-w-3xl mx-auto px-4 py-12" style={{ color: 'white' }}>

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <LakiveLogo size={22} theme="dark" />
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: 'white' }}>
            What would you like to understand?
          </h1>
          <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Lakive helps you navigate Canada's cities with data — not opinions.
            Choose where to start.
          </p>
        </div>

        {/* ── Three entry cards ─────────────────────────────────────────────── */}
        {!mode && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { id: 'career', icon: '🎯', title: 'By Career',  sub: 'I know my profession' },
              { id: 'city',   icon: '🏙️', title: 'By City',    sub: 'I know where I want to go' },
              { id: 'topic',  icon: '📚', title: 'By Topic',   sub: 'I have a question' },
            ].map(e => (
              <button key={e.id} onClick={() => setMode(e.id as 'career' | 'city' | 'topic')}
                className="rounded-2xl p-6 text-left transition-all group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="text-3xl mb-4">{e.icon}</div>
                <div className="text-base font-bold mb-1" style={{ color: 'white' }}>{e.title}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>{e.sub}</div>
                <div className="mt-4 text-xs font-semibold" style={{ color: '#14B8A6' }}>Explore →</div>
              </button>
            ))}
          </div>
        )}

        {/* Back button */}
        {mode && (
          <button onClick={reset}
            className="flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'rgba(255,255,255,0.40)' }}>
            ← Back
          </button>
        )}

        {/* ── BY CAREER ─────────────────────────────────────────────────────── */}
        {mode === 'career' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Choose your occupation</h2>

            {/* Step 1: pick category */}
            {!selCat && (
              <div className="grid sm:grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const occs = occsByCat(cat.key)
                  if (!occs.length) return null
                  return (
                    <button key={cat.key} onClick={() => setSelCat(cat.key)}
                      className="rounded-xl p-4 text-left transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'white' }}>{cat.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{occs.length} occupation{occs.length > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2: pick occupation */}
            {selCat && !selOcc && (
              <div>
                <button onClick={() => setSelCat(null)} className="text-xs mb-5 block" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  ← All categories
                </button>
                <div className="grid sm:grid-cols-2 gap-3">
                  {occsByCat(selCat).map(([slug, occ]) => (
                    <button key={slug} onClick={() => setSelOcc(slug)}
                      className="rounded-xl p-4 text-left transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="font-semibold text-sm mb-1" style={{ color: 'white' }}>{occ.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {formatYears(calcHpiYears(slug, 'calgary'))} in Calgary · {formatYears(calcHpiYears(slug, 'vancouver'))} in Vancouver
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: pick city */}
            {selOcc && (
              <div>
                <button onClick={() => setSelOcc(null)} className="text-xs mb-5 block" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  ← {OCCUPATIONS[selOcc]?.name}
                </button>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Choose a city to compare
                </h3>
                <div className="space-y-3">
                  {cities
                    .map(c => ({ slug: c, years: calcHpiYears(selOcc, c) }))
                    .sort((a, b) => a.years - b.years)
                    .map(({ slug, years }) => {
                      const cs = CITY_STATS[slug]
                      const color = years < 8 ? '#14B8A6' : years < 12 ? '#F59E0B' : '#F87171'
                      return (
                        <Link key={slug} href={`/guide/${selOcc}/${slug}`}
                          className="flex items-center justify-between rounded-xl p-4 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: 'white' }}>{cs.label}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{cs.note}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg" style={{ color }}>{formatYears(years)}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>to own</div>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BY CITY ───────────────────────────────────────────────────────── */}
        {mode === 'city' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Choose a city</h2>
            <div className="space-y-3">
              {Object.entries(CITY_STATS)
                .sort((a, b) => a[1].hpi - b[1].hpi)
                .map(([slug, cs]) => (
                  <div key={slug} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold" style={{ color: 'white' }}>{cs.label}</div>
                          {cs.currency === 'USD' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(79,142,247,0.15)', color: '#4F8EF7' }}>USD</span>
                          )}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{cs.note}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold" style={{ color: cs.hpi < 10 ? '#14B8A6' : cs.hpi < 14 ? '#F59E0B' : '#F87171' }}>
                          {cs.hpi} yr
                        </div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>median HPI</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!cs.currency && (
                        <Link href={`/city/${slug}`}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                          style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.25)', textDecoration: 'none' }}>
                          City Overview
                        </Link>
                      )}
                      {['registered-nurse', 'software-engineer', 'electrician'].map(occ => (
                        <Link key={occ} href={`/guide/${occ}/${slug}`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                          {OCCUPATIONS[occ]?.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── BY TOPIC ──────────────────────────────────────────────────────── */}
        {mode === 'topic' && (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Choose a topic</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TOPICS.map(t => (
                <div key={t.label} className="rounded-xl p-5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.available ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`, opacity: t.available ? 1 : 0.5 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{t.icon}</span>
                    <span className="font-semibold text-sm" style={{ color: 'white' }}>{t.label}</span>
                    {!t.available && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{t.desc}</p>
                  {t.available && t.links.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {t.links.map(l => (
                        <Link key={l.href} href={l.href}
                          className="text-xs transition-colors"
                          style={{ color: '#14B8A6', textDecoration: 'none' }}>
                          → {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom browse all (only on landing) ───────────────────────────── */}
        {!mode && (
          <div className="mt-4 text-center">
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Or browse all 150 guides directly
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(CITIES).map(([slug, c]) => (
                <Link key={slug} href={`/city/${slug}`}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  {c.displayName}
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
