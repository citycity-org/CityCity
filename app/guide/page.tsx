import { Metadata } from 'next'
import Link from 'next/link'
import { LakiveLogo } from '../components/LakiveLogo'
import { OCCUPATIONS, CITIES, calcHpiYears, formatYears } from './_data'

export const metadata: Metadata = {
  title: 'City & Career Guides for Newcomers to Canada | Lakive',
  description: 'Free housing affordability and career guides for 30 occupations across 5 Canadian cities. Find out how long it takes to own a home on your salary — before you move.',
  alternates: { canonical: 'https://www.lakive.com/guide' },
}

const CATEGORIES = [
  { key: 'high-income', label: 'High Income',   icon: '💎' },
  { key: 'tech',        label: 'Technology',     icon: '💻' },
  { key: 'trades',      label: 'Skilled Trades', icon: '🔧' },
  { key: 'healthcare',  label: 'Healthcare',     icon: '🏥' },
  { key: 'professional',label: 'Professional',   icon: '📋' },
  { key: 'public',      label: 'Public Sector',  icon: '🏛️' },
  { key: 'service',     label: 'Service',        icon: '🛎️' },
]

export default function GuidePage() {
  const cities     = Object.keys(CITIES)
  const cityNames  = Object.fromEntries(Object.entries(CITIES).map(([k, v]) => [k, v.displayName]))

  return (
    <main className="max-w-5xl mx-auto px-4 py-10" style={{ color: 'white' }}>

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#14B8A6' }}>City &amp; Career Guides</div>
        <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: 'white' }}>
          How long does it take to own a home in Canada — on your salary?
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
          150 free guides covering 30 occupations across 5 major Canadian cities.
          Each guide includes years-to-own, rent burden, city comparison, and relocation analysis — all data-driven, updated for 2026.
        </p>
      </div>

      {/* Quick city nav */}
      <div className="flex flex-wrap gap-2 mb-10">
        {cities.map(c => (
          <Link key={c} href={`/city/${c}`}
            className="text-sm px-4 py-1.5 rounded-full transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.50)', background: 'rgba(255,255,255,0.04)' }}>
            {cityNames[c]}
          </Link>
        ))}
      </div>

      {/* Guides by category */}
      {CATEGORIES.map(cat => {
        const occs = Object.entries(OCCUPATIONS).filter(([, v]) => v.category === cat.key)
        if (occs.length === 0) return null
        return (
          <section key={cat.key} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{cat.icon}</span>
              <h2 className="text-base font-bold" style={{ color: 'white' }}>{cat.label}</h2>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>({occs.length} occupation{occs.length > 1 ? 's' : ''})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {occs.map(([occSlug, occ]) => {
                const calgaryYrs   = calcHpiYears(occSlug, 'calgary')
                const vancouverYrs = calcHpiYears(occSlug, 'vancouver')
                return (
                  <div key={occSlug} className="rounded-xl p-4 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="font-semibold text-sm mb-3" style={{ color: 'white' }}>{occ.name}</div>
                    <div className="flex items-center justify-between mb-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <span className="font-mono font-semibold" style={{ color: '#14B8A6' }}>{formatYears(calgaryYrs)} in Calgary</span>
                      <span>→</span>
                      <span className="font-mono font-semibold" style={{ color: '#F87171' }}>{formatYears(vancouverYrs)} in Vancouver</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cities.map(c => (
                        <Link key={c} href={`/guide/${occSlug}/${c}`}
                          className="text-[11px] px-2 py-0.5 rounded-md transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.40)', background: 'rgba(255,255,255,0.03)' }}>
                          {cityNames[c]}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Bottom CTA */}
      <div className="mt-4 rounded-2xl p-6 text-center" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.20)' }}>
        <div className="flex justify-center mb-3">
          <LakiveLogo size={20} theme="dark" />
        </div>
        <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Use the interactive calculator to model your specific salary, property type, and city — and get a personalised Lakive Insight.
        </p>
        <Link href="/"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: '#14B8A6' }}>
          Try the Calculator
        </Link>
      </div>

    </main>
  )
}
