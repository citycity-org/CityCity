import { Metadata } from 'next'
import Link from 'next/link'
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
    <main className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3">City & Career Guides</div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
          How long does it take to own a home in Canada — on your salary?
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          150 free guides covering 30 occupations across 5 major Canadian cities.
          Each guide includes years-to-own, rent burden, city comparison, and relocation analysis — all data-driven, updated for 2026.
        </p>
      </div>

      {/* Quick city nav */}
      <div className="flex flex-wrap gap-2 mb-10">
        {cities.map(c => (
          <Link key={c} href={`/city/${c}`}
            className="text-sm px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
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
              <h2 className="text-base font-bold text-gray-800">{cat.label}</h2>
              <span className="text-xs text-gray-400">({occs.length} occupation{occs.length > 1 ? 's' : ''})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {occs.map(([occSlug, occ]) => {
                // Show Calgary (best) and Vancouver (worst) as teasers
                const calgaryYrs   = calcHpiYears(occSlug, 'calgary')
                const vancouverYrs = calcHpiYears(occSlug, 'vancouver')
                return (
                  <div key={occSlug} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-teal-200 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 text-sm mb-3">{occ.name}</div>
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                      <span className="font-mono text-teal-600 font-semibold">{formatYears(calgaryYrs)} in Calgary</span>
                      <span>→</span>
                      <span className="font-mono text-red-400 font-semibold">{formatYears(vancouverYrs)} in Vancouver</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cities.map(c => (
                        <Link key={c} href={`/guide/${occSlug}/${c}`}
                          className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
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
      <div className="mt-4 bg-[#0a1628] rounded-2xl p-6 text-center">
        <div className="text-sm font-light tracking-widest text-white/60 mb-2">
          <span style={{ color: '#14B8A6' }}>LA</span>KıVE
        </div>
        <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
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
