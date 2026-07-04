import { Metadata } from 'next'
import Link from 'next/link'
import {
  OCCUPATIONS, CITIES,
  calcHpiYears, calcRpi,
  hpiLabel, rpiLabel, rankedCities,
  formatYears, formatSalary,
} from '../../_data'

// ── Static generation: all 150 combos ────────────────────────────────────────
export function generateStaticParams() {
  const params: { occupation: string; city: string }[] = []
  for (const occ of Object.keys(OCCUPATIONS)) {
    for (const city of Object.keys(CITIES)) {
      params.push({ occupation: occ, city })
    }
  }
  return params
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ occupation: string; city: string }> }
): Promise<Metadata> {
  const { occupation, city } = await params
  const occ  = OCCUPATIONS[occupation]
  const cty  = CITIES[city]
  if (!occ || !cty) return { title: 'Guide | Lakive' }

  const hpi  = calcHpiYears(occupation, city)
  const rpi  = calcRpi(occupation, city)
  const hl   = hpiLabel(hpi)

  const title       = `${occ.name} in ${cty.displayName}: Housing & Career Guide (2026)`
  const description = `A ${occ.name} in ${cty.displayName} needs ${formatYears(hpi)} of income to own a 2BR home, spending ${rpi}% of salary on rent. ${hl.text} housing market. Full data, city comparison, and relocation analysis.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.lakive.com/guide/${occupation}/${city}`,
      siteName: 'Lakive',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `https://www.lakive.com/guide/${occupation}/${city}` },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function overallVerdict(hpi: number, rpi: number, category: string): string {
  if (hpi < 7 && rpi < 30)  return 'Strongly Recommended'
  if (hpi < 10 && rpi < 36) return 'Recommended'
  if (hpi < 13 || rpi < 42) return 'Proceed with Caution'
  return 'Difficult — Compare Alternatives'
}

function verdictColor(v: string): string {
  if (v === 'Strongly Recommended') return '#14B8A6'
  if (v === 'Recommended')          return '#10B981'
  if (v === 'Proceed with Caution') return '#F59E0B'
  return '#EF4444'
}

function introText(occSlug: string, citySlug: string, hpi: number, rpi: number): string {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return ''

  const cat  = occ.category
  const hl   = hpiLabel(hpi)

  // City-specific lead
  const cityLead: Record<string, string> = {
    calgary:   `Alberta's zero provincial income tax gives ${occ.name}s an immediate take-home advantage of roughly ${formatSalary(Math.round(occ.salary * 0.08 / 1000) * 1000)} per year compared to BC or Ontario.`,
    vancouver: `Vancouver offers some of Canada's strongest salaries for ${cat === 'tech' ? 'tech workers' : cat === 'trades' ? 'skilled trades' : 'this profession'}, but the housing market is the most expensive in the country.`,
    toronto:   `Toronto is Canada's largest job market for most professions, giving ${occ.name}s broad choice — but housing pressure remains close to Vancouver levels.`,
    montreal:  `Montréal offers the most affordable housing among major Canadian cities, but French language requirements shape which roles are realistically accessible for newcomers.`,
    ottawa:    `Ottawa's federal government sector provides exceptional job stability for ${occ.name}s, with housing that is significantly more affordable than Toronto despite being in the same province.`,
  }

  const occLead: Partial<Record<string, string>> = {
    'high-income':   `At ${formatSalary(occ.salary)} average annual income, ${occ.name}s are among the highest earners in Canada — which meaningfully changes the housing math compared to median-wage workers.`,
    'tech':          `Demand for ${occ.name}s remains strong across Canada, with remote-first hiring expanding access to high-salary roles without requiring relocation to the most expensive markets.`,
    'trades':        `Skilled trades are in short supply across Canada. A licensed ${occ.name} can typically find work within weeks of arrival, making the relocation decision primarily a lifestyle and financial one.`,
    'healthcare':    `Healthcare shortages mean ${occ.name}s hold significant negotiating power when choosing where to settle. Province and city choice affects not just pay, but licensing timeline and scope of practice.`,
    'professional':  `${occ.name}s in Canada benefit from a credential recognition pathway, though timelines vary. Once established, income levels support a stable middle-class lifestyle in most Canadian cities.`,
    'public':        `Public sector ${occ.name} roles come with strong pensions and benefits that are often undervalued when comparing to private sector salaries.`,
    'service':       `Service industry roles provide accessible entry into the Canadian labour market, but housing affordability is a genuine challenge at this income level in expensive cities.`,
  }

  return [
    cityLead[citySlug] ?? '',
    occLead[cat] ?? '',
    `On the housing side, a ${occ.name} in ${city.displayName} faces a ${hl.text.toLowerCase()} market — requiring approximately ${formatYears(hpi)} of gross income to own a 2-bedroom condo, with rent consuming roughly ${rpi}% of pre-tax salary.`,
  ].filter(Boolean).join(' ')
}

function faqItems(occSlug: string, citySlug: string, hpi: number, rpi: number): { q: string; a: string }[] {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return []

  const altCities = rankedCities(occSlug, citySlug)
  const best      = altCities[0]
  const bestCity  = CITIES[best.slug]

  return [
    {
      q: `How long does it take a ${occ.name} to buy a home in ${city.displayName}?`,
      a: `Based on 2026 market data, a ${occ.name} earning approximately ${formatSalary(occ.salary)}/year needs around ${formatYears(hpi)} of gross income to afford a 2-bedroom condo in ${city.displayName}. This uses a standard savings and down-payment model. ${hpi > 12 ? `That timeline is among the longest in Canada for this occupation — ${bestCity?.displayName} offers a significantly shorter path at ${formatYears(best.years)}.` : `This is ${hpi < 8 ? 'one of the more accessible markets in Canada for this income level.' : 'a manageable timeline relative to other major Canadian cities.'}`}`,
    },
    {
      q: `What percentage of income does a ${occ.name} spend on rent in ${city.displayName}?`,
      a: `At current market rents, a ${occ.name} in ${city.displayName} spends approximately ${rpi}% of gross income on a 2-bedroom apartment. The widely-cited guideline is to keep housing costs below 30% of gross income. ${rpi > 38 ? `${city.displayName} significantly exceeds this threshold for ${occ.name}s — renting here places meaningful pressure on savings and financial flexibility.` : rpi > 30 ? `${city.displayName} is slightly above the guideline. Manageable, but leaves limited room for savings.` : `${city.displayName} is within or near the guideline — one of the healthier rent-to-income ratios for this occupation across Canadian cities.`}`,
    },
    {
      q: `Is ${city.displayName} a good city for ${occ.name}s to immigrate to?`,
      a: `${occ.demandNote} ${city.immigrantNote} ${hpi < 10 && rpi < 33 ? `From a financial standpoint, ${city.displayName} is one of the stronger options for ${occ.name}s — both the ownership timeline and rent burden are within reasonable range.` : hpi > 14 || rpi > 40 ? `The financial data suggests ${occ.name}s should weigh ${city.displayName} carefully — the housing cost relative to income is high. ${bestCity?.displayName} offers a comparably strong job market with significantly lower housing pressure.` : `${city.displayName} offers a reasonable balance of career opportunity and cost of living for ${occ.name}s, though it pays to model the numbers against your specific salary expectations.`}`,
    },
    occ.licenseNote ? {
      q: `Do ${occ.name}s need a Canadian licence to work in ${city.displayName}?`,
      a: `${occ.licenseNote} Credential recognition timelines vary — it is advisable to begin the process before arriving in Canada. ${city.province === 'Alberta' ? 'Alberta has generally streamlined pathways for internationally trained professionals in shortage occupations.' : city.province === 'British Columbia' ? 'BC\'s regulatory colleges process applications on a rolling basis — check with the relevant provincial body for current wait times.' : city.province === 'Ontario' ? 'Ontario has some of the more rigorous assessment processes. Factor in 6–18 months for credential recognition depending on your profession.' : city.province === 'Quebec' ? 'Quebec has its own regulatory bodies and French-language requirements that can extend the licensing timeline.' : ''}`,
    } : {
      q: `What is the job market like for ${occ.name}s in ${city.displayName}?`,
      a: `${occ.demandNote} ${city.sectorNote} ${occ.category === 'service' ? `Entry-level service roles are typically accessible within weeks of arriving. The challenge in ${city.displayName} is that wages in this category create a tight budget relative to local housing costs.` : `Most ${occ.name}s with relevant experience and Canadian language proficiency find positions within 3–6 months of arrival.`}`,
    },
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function GuidePage(
  { params }: { params: Promise<{ occupation: string; city: string }> }
) {
  const { occupation, city } = await params
  const occ  = OCCUPATIONS[occupation]
  const cty  = CITIES[city]
  if (!occ || !cty) return <div className="p-8 text-center text-gray-500">Guide not found.</div>

  const hpi     = calcHpiYears(occupation, city)
  const rpi     = calcRpi(occupation, city)
  const hpiLbl  = hpiLabel(hpi)
  const rpiLbl  = rpiLabel(rpi)
  const verdict = overallVerdict(hpi, rpi, occ.category)
  const vColor  = verdictColor(verdict)
  const alts    = rankedCities(occupation, city)
  const intro   = introText(occupation, city, hpi, rpi)
  const faqs    = faqItems(occupation, city, hpi, rpi)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${occ.name} in ${cty.displayName}: Housing & Career Guide (2026)`,
    description: `Housing affordability and career guide for ${occ.name}s in ${cty.displayName}, Canada. Years to own: ${formatYears(hpi)}. Rent burden: ${rpi}%.`,
    author: { '@type': 'Organization', name: 'Lakive' },
    publisher: { '@type': 'Organization', name: 'Lakive', url: 'https://www.lakive.com' },
    url: `https://www.lakive.com/guide/${occupation}/${city}`,
    dateModified: '2026-07-01',
    mainEntityOfPage: `https://www.lakive.com/guide/${occupation}/${city}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex flex-wrap gap-1 items-center">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/guide" className="hover:text-gray-600">Guides</Link>
          <span>/</span>
          <Link href={`/city/${city}`} className="hover:text-gray-600">{cty.displayName}</Link>
          <span>/</span>
          <span className="text-gray-600">{occ.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ background: `${vColor}18`, color: vColor, border: `1px solid ${vColor}40` }}>
            {verdict}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {occ.name} in {cty.displayName}
            <span className="block text-gray-400 font-normal text-lg mt-1">Housing &amp; Career Guide · 2026</span>
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">{intro}</p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Years to Own', value: formatYears(hpi), sub: '2BR condo', color: hpiLbl.color },
            { label: 'Rent Burden',  value: `${rpi}%`,        sub: 'of gross income', color: rpiLbl.color },
            { label: 'Avg Salary',   value: formatSalary(occ.salary), sub: 'annual gross', color: '#6B7280' },
            { label: 'Avg Rent 2BR', value: `$${(cty.avgRent2BR).toLocaleString()}`, sub: 'per month', color: '#6B7280' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* City comparison */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            How {cty.displayName} compares for {occ.name}s
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">City</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Yrs to Own</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Rent Burden</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Avg Rent</th>
                </tr>
              </thead>
              <tbody>
                {/* Current city first */}
                <tr className="border-b border-gray-50 bg-teal-50/40">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {cty.displayName}
                    <span className="ml-2 text-[10px] font-normal text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded-full">current</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: hpiLbl.color }}>{formatYears(hpi)}</td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: rpiLbl.color }}>{rpi}%</td>
                  <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">${cty.avgRent2BR.toLocaleString()}/mo</td>
                </tr>
                {/* Other cities sorted best→worst */}
                {alts.map(a => {
                  const ac   = CITIES[a.slug]
                  const aHl  = hpiLabel(a.years)
                  const aRl  = rpiLabel(a.rpi)
                  return (
                    <tr key={a.slug} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">
                        <Link href={`/guide/${occupation}/${a.slug}`} className="hover:text-teal-600 hover:underline">
                          {ac.displayName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: aHl.color }}>{formatYears(a.years)}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: aRl.color }}>{a.rpi}%</td>
                      <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">${ac.avgRent2BR.toLocaleString()}/mo</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-50">
              Years to own a 2BR condo · Rent burden = annual rent ÷ gross salary · Sources: CREA, CMHC, StatCan, Indeed CA (2025–2026)
            </div>
          </div>
        </section>

        {/* Tax & market context */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {cty.displayName} context for {occ.name}s
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Tax Environment', body: cty.taxNote,       icon: '🧾' },
              { title: 'Job Market',      body: cty.sectorNote,    icon: '💼' },
              { title: 'For Newcomers',   body: cty.immigrantNote, icon: '🌏' },
              { title: 'Job Demand',      body: occ.demandNote,    icon: '📊' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.title}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
          {occ.licenseNote && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>⚠️</span>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Licensing & Credential Recognition</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">{occ.licenseNote}</p>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0a1628] rounded-2xl p-6 text-center">
          <div className="text-sm font-light tracking-widest text-white/60 mb-2">
            <span style={{ color: '#14B8A6' }}>LA</span>KıVE
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            Get your personalised numbers
          </h2>
          <p className="text-sm text-white/50 mb-5 max-w-sm mx-auto">
            The figures above are based on market averages. Use the calculator to model your specific salary, property type, and timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/?occupation=${occ.id}&city=${city}`}
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#14B8A6' }}>
              Calculate My Numbers
            </Link>
            <Link
              href={`/city/${city}`}
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors">
              {cty.displayName} City Report
            </Link>
          </div>
        </section>

        {/* Related guides */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Related Guides</h2>
          <div className="flex flex-wrap gap-2">
            {alts.slice(0, 2).map(a => (
              <Link key={a.slug} href={`/guide/${occupation}/${a.slug}`}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
                {occ.name} in {CITIES[a.slug].displayName}
              </Link>
            ))}
            <Link href={`/guide/${occupation}/vancouver`}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
              {occ.name} in Vancouver
            </Link>
            <Link href="/guide"
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
              All Guides →
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
