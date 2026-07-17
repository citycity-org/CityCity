import { Metadata } from 'next'
import Link from 'next/link'
import Comments from '../../_comments'
import { LakiveLogo } from '../../../components/LakiveLogo'
import {
  OCCUPATIONS, CITIES,
  calcHpiYears, calcRpi, calcLevel,
  LEVEL_META, hpiLabel, rpiLabel, rankedCities,
  formatYears, formatSalary, formatSalaryUS,
} from '../../_data'

// ── Static generation: all N combos ──────────────────────────────────────────
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
function overallVerdict(hpi: number, rpi: number): string {
  return LEVEL_META[calcLevel(hpi, rpi)].label
}

function verdictColor(hpi: number, rpi: number): string {
  return LEVEL_META[calcLevel(hpi, rpi)].color
}

function introText(occSlug: string, citySlug: string, hpi: number, rpi: number): string {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return ''

  const cat  = occ.category
  const hl   = hpiLabel(hpi)

  const isUS = city.country === 'US'
  const salaryStr = isUS ? formatSalaryUS(occ.salaryUS ?? 0) : formatSalary(occ.salary)

  // City-specific lead
  const cityLead: Record<string, string> = {
    calgary:        `Alberta's lower provincial income tax rates (10–15%) and no PST give ${occ.name}s a meaningful take-home advantage compared to BC or Ontario.`,
    vancouver:      `Vancouver offers some of Canada's strongest salaries for ${cat === 'tech' ? 'tech workers' : cat === 'trades' ? 'skilled trades' : 'this profession'}, but the housing market is the most expensive in the country.`,
    toronto:        `Toronto is Canada's largest job market for most professions, giving ${occ.name}s broad choice — but housing pressure remains close to Vancouver levels.`,
    montreal:       `Montréal offers the most affordable housing among major Canadian cities, but French language requirements shape which roles are realistically accessible for newcomers.`,
    ottawa:         `Ottawa's federal government sector provides exceptional job stability for ${occ.name}s, with housing that is significantly more affordable than Toronto despite being in the same province.`,
    seattle:        `Seattle's zero state income tax means ${occ.name}s keep significantly more of their ${salaryStr} salary than peers in California — a structural advantage that compounds over time.`,
    'san-francisco':`San Francisco pays some of the highest ${cat === 'tech' ? 'tech' : 'professional'} salaries in the world for ${occ.name}s, but California's 13.3% top state income tax and extreme housing costs demand careful financial planning.`,
    'new-york':     `New York City's finance-driven economy creates strong demand for ${occ.name}s across industries, though combined state and city income taxes (up to 14.8%) and high rents significantly compress take-home value.`,
    boston:         `Boston's concentration of world-class hospitals, biotech firms, and universities makes it one of the most opportunity-rich markets for ${cat === 'healthcare' || cat === 'tech' ? occ.name + 's' : 'professionals'} — with a more manageable cost of living than New York or San Francisco.`,
  }

  const occLead: Partial<Record<string, string>> = {
    'high-income':   isUS
      ? `At ${salaryStr} average, ${occ.name}s are among the highest earners in North America — significantly changing the housing equation compared to median-wage workers.`
      : `At ${salaryStr} average annual income, ${occ.name}s are among the highest earners in Canada — which meaningfully changes the housing math compared to median-wage workers.`,
    'tech':          isUS
      ? `US tech salaries for ${occ.name}s are among the highest in the world. The West Coast cities pay a premium over the East Coast — but so does the cost of living.`
      : `Demand for ${occ.name}s remains strong across Canada, with remote-first hiring expanding access to high-salary roles without requiring relocation to the most expensive markets.`,
    'trades':        isUS
      ? `Skilled trades shortages are acute across the US. A licensed ${occ.name} can typically find work quickly, making the relocation decision primarily a financial and lifestyle choice.`
      : `Skilled trades are in short supply across Canada. A licensed ${occ.name} can typically find work within weeks of arrival, making the relocation decision primarily a lifestyle and financial one.`,
    'healthcare':    isUS
      ? `Healthcare shortages give ${occ.name}s strong negotiating power across US cities. State and city choice affects licensing timelines, scope of practice, and take-home pay.`
      : `Healthcare shortages mean ${occ.name}s hold significant negotiating power when choosing where to settle. Province and city choice affects not just pay, but licensing timeline and scope of practice.`,
    'professional':  isUS
      ? `${occ.name}s in the US benefit from deep, competitive labour markets. Credential recognition timelines vary by state. Once established, income levels support a comfortable lifestyle in most cities.`
      : `${occ.name}s in Canada benefit from a credential recognition pathway, though timelines vary. Once established, income levels support a stable middle-class lifestyle in most Canadian cities.`,
    'public':        `Public sector ${occ.name} roles come with strong pensions and benefits that are often undervalued when comparing to private sector salaries.`,
    'service':       isUS
      ? `Service industry roles provide accessible entry into the US labour market, but housing affordability is a genuine challenge at this income level in major metros.`
      : `Service industry roles provide accessible entry into the Canadian labour market, but housing affordability is a genuine challenge at this income level in expensive cities.`,
  }

  return [
    cityLead[citySlug] ?? '',
    occLead[cat] ?? '',
    `On the housing side, a ${occ.name} in ${city.displayName} faces a ${hl.text.toLowerCase()} market — requiring approximately ${formatYears(hpi)} of gross income to own a 2-bedroom home, with rent consuming roughly ${rpi}% of pre-tax salary.`,
  ].filter(Boolean).join(' ')
}

function faqItems(occSlug: string, citySlug: string, hpi: number, rpi: number): { q: string; a: string }[] {
  const occ  = OCCUPATIONS[occSlug]
  const city = CITIES[citySlug]
  if (!occ || !city) return []

  const isUS      = city.country === 'US'
  const salaryStr = isUS ? formatSalaryUS(occ.salaryUS ?? 0) : formatSalary(occ.salary)
  const currency  = isUS ? 'USD' : 'CAD'
  const altCities = rankedCities(occSlug, citySlug)
  const best      = altCities[0]
  const bestCity  = CITIES[best.slug]

  const marketContext = isUS
    ? 'across major US cities'
    : 'across major Canadian cities'

  return [
    {
      q: `How long does it take a ${occ.name} to buy a home in ${city.displayName}?`,
      a: `Based on 2026 market data, a ${occ.name} earning approximately ${salaryStr}/year needs around ${formatYears(hpi)} of gross income to afford a 2-bedroom home in ${city.displayName}. This uses a standard savings and down-payment model. ${hpi > 12 ? `That timeline is among the longest ${marketContext} for this occupation — ${bestCity?.displayName} offers a significantly shorter path at ${formatYears(best.years)}.` : `This is ${hpi < 8 ? `one of the more accessible markets ${marketContext} for this income level.` : `a manageable timeline relative to other major cities.`}`}`,
    },
    {
      q: `What percentage of income does a ${occ.name} spend on rent in ${city.displayName}?`,
      a: `At current market rents ($${city.avgRent2BR.toLocaleString()} ${currency}/mo for a 2BR), a ${occ.name} in ${city.displayName} spends approximately ${rpi}% of gross income on a 2-bedroom apartment. The widely-cited guideline is to keep housing costs below 30% of gross income. ${rpi > 38 ? `${city.displayName} significantly exceeds this threshold for ${occ.name}s — renting here places meaningful pressure on savings and financial flexibility.` : rpi > 30 ? `${city.displayName} is slightly above the guideline. Manageable, but leaves limited room for savings.` : `${city.displayName} is within or near the guideline — one of the healthier rent-to-income ratios for this occupation.`}`,
    },
    {
      q: isUS
        ? `What visa options are available for ${occ.name}s moving to ${city.displayName}?`
        : `Is ${city.displayName} a good city for ${occ.name}s to immigrate to?`,
      a: isUS
        ? `${city.immigrantNote} Common visa pathways for ${occ.name}s include the H-1B (employer-sponsored, annual cap with lottery), O-1 (extraordinary ability), TN visa (for Canadian and Mexican nationals under USMCA), and EB-2/EB-3 green card categories through employer sponsorship. ${occ.category === 'healthcare' ? 'Healthcare workers may also qualify for the EB-3 (Schedule A shortage occupation) pathway, which bypasses the PERM labour certification step.' : ''} Processing timelines and backlogs vary significantly by nationality and category.`
        : `${occ.demandNote} ${city.immigrantNote} ${hpi < 10 && rpi < 33 ? `From a financial standpoint, ${city.displayName} is one of the stronger options for ${occ.name}s — both the ownership timeline and rent burden are within reasonable range.` : hpi > 14 || rpi > 40 ? `The financial data suggests ${occ.name}s should weigh ${city.displayName} carefully — the housing cost relative to income is high. ${bestCity?.displayName} offers a comparably strong job market with significantly lower housing pressure.` : `${city.displayName} offers a reasonable balance of career opportunity and cost of living for ${occ.name}s, though it pays to model the numbers against your specific salary expectations.`}`,
    },
    occ.licenseNote ? {
      q: `Do ${occ.name}s need a local licence to work in ${city.displayName}?`,
      a: isUS
        ? `${occ.licenseNote} US credential recognition timelines vary by state. It is advisable to begin the process before arriving. ${city.province === 'Washington State' ? 'Washington State has relatively streamlined processes for many licensed professions.' : city.province === 'California' ? 'California has some of the more rigorous assessment and licensing processes in the US — factor in additional time and fees.' : city.province === 'New York State' ? 'New York has distinct licensing requirements; some professions have reciprocity agreements with other states.' : city.province === 'Massachusetts' ? 'Massachusetts licensing boards process applications on a rolling basis — check with the relevant state authority for current wait times.' : ''}`
        : `${occ.licenseNote} Credential recognition timelines vary — it is advisable to begin the process before arriving in Canada. ${city.province === 'Alberta' ? 'Alberta has generally streamlined pathways for internationally trained professionals in shortage occupations.' : city.province === 'British Columbia' ? "BC's regulatory colleges process applications on a rolling basis — check with the relevant provincial body for current wait times." : city.province === 'Ontario' ? 'Ontario has some of the more rigorous assessment processes. Factor in 6–18 months for credential recognition depending on your profession.' : city.province === 'Quebec' ? 'Quebec has its own regulatory bodies and French-language requirements that can extend the licensing timeline.' : ''}`,
    } : {
      q: `What is the job market like for ${occ.name}s in ${city.displayName}?`,
      a: `${occ.demandNote} ${city.sectorNote} ${occ.category === 'service' ? `Entry-level service roles are typically accessible within weeks of arriving. The challenge in ${city.displayName} is that wages in this category create a tight budget relative to local housing costs.` : `Most ${occ.name}s with relevant experience find positions within 3–6 months of arrival.`}`,
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

  const hpi      = calcHpiYears(occupation, city)
  const rpi      = calcRpi(occupation, city)
  const hpiLbl   = hpiLabel(hpi)
  const rpiLbl   = rpiLabel(rpi)
  const verdict  = overallVerdict(hpi, rpi)
  const vColor   = verdictColor(hpi, rpi)
  const alts     = rankedCities(occupation, city)
  const intro    = introText(occupation, city, hpi, rpi)
  const faqs     = faqItems(occupation, city, hpi, rpi)
  const isUS     = cty.country === 'US'
  const currency = cty.currency ?? 'CAD'
  const salaryDisplay = isUS ? formatSalaryUS(occ.salaryUS ?? 0) : formatSalary(occ.salary)

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

      <div style={{ background: '#080c14', minHeight: '100vh' }}>
      <main className="max-w-3xl mx-auto px-4 py-10" style={{ color: 'white' }}>

        {/* Breadcrumb */}
        <nav className="text-xs mb-6 flex flex-wrap gap-1 items-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guide" className="hover:text-white/70 transition-colors">Guides</Link>
          <span>/</span>
          {isUS
            ? <span style={{ color: 'rgba(255,255,255,0.55)' }}>{cty.displayName}</span>
            : <Link href={`/city/${city}`} className="hover:text-white/70 transition-colors">{cty.displayName}</Link>
          }
          <span>/</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{occ.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${vColor}20`, color: vColor, border: `1px solid ${vColor}40` }}>
              {verdict}
            </div>
            {cty.eiuRank && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' }}>
                <span>🌍</span>
                <span>Global Liveability #{cty.eiuRank} / 173</span>
                <span style={{ color: 'rgba(245,158,11,0.55)', fontWeight: 400 }}>EIU {cty.eiuYear}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3" style={{ color: 'white' }}>
            {occ.name} in {cty.displayName}
            <span className="block font-normal text-lg mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>Housing &amp; Career Guide · 2026</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{intro}</p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Years to Own', value: formatYears(hpi), sub: '2BR condo', color: hpiLbl.color },
            { label: 'Rent Burden',  value: `${rpi}%`,        sub: 'of gross income', color: rpiLbl.color },
            { label: 'Avg Salary',   value: salaryDisplay, sub: `annual gross · ${currency}`, color: 'rgba(255,255,255,0.55)' },
            { label: 'Avg Rent 2BR', value: `$${(cty.avgRent2BR).toLocaleString()}`, sub: `per month · ${currency}`, color: 'rgba(255,255,255,0.55)' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* City comparison */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'white' }}>
            How {cty.displayName} compares for {occ.name}s
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className="text-left text-xs font-medium px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>City</th>
                  <th className="text-right text-xs font-medium px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Yrs to Own</th>
                  <th className="text-right text-xs font-medium px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Rent Burden</th>
                  <th className="text-right text-xs font-medium px-4 py-3 hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Rent</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(20,184,166,0.08)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'white' }}>
                    {cty.displayName}
                    <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 rounded-full" style={{ color: '#14B8A6', background: 'rgba(20,184,166,0.15)' }}>current</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: hpiLbl.color }}>{formatYears(hpi)}</td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: rpiLbl.color }}>{rpi}%</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.40)' }}>${cty.avgRent2BR.toLocaleString()} {currency}/mo</td>
                </tr>
                {alts.map(a => {
                  const ac   = CITIES[a.slug]
                  const aHl  = hpiLabel(a.years)
                  const aRl  = rpiLabel(a.rpi)
                  const aCur = ac?.currency ?? 'CAD'
                  return (
                    <tr key={a.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Link href={`/guide/${occupation}/${a.slug}`} style={{ color: 'rgba(255,255,255,0.65)' }} className="hover:text-teal-400 transition-colors">
                          {ac.displayName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: aHl.color }}>{formatYears(a.years)}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color: aRl.color }}>{a.rpi}%</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.30)' }}>${ac.avgRent2BR.toLocaleString()} {aCur}/mo</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.20)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              Years to own a 2BR home · Rent burden = annual rent ÷ gross salary · Sources: {isUS ? 'Zillow, BLS, Indeed US' : 'CREA, CMHC, StatCan, Indeed CA'} (2025–2026)
            </div>
          </div>
        </section>

        {/* Tax & market context */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'white' }}>
            {cty.displayName} context for {occ.name}s
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Tax Environment', body: cty.taxNote,       icon: '🧾' },
              { title: 'Job Market',      body: cty.sectorNote,    icon: '💼' },
              { title: 'For Newcomers',   body: cty.immigrantNote, icon: '🌏' },
              { title: 'Job Demand',      body: occ.demandNote,    icon: '📊' },
            ].map(c => (
              <div key={c.title} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.title}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{c.body}</p>
              </div>
            ))}
          </div>
          {occ.licenseNote && (
            <div className="mt-3 rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span>⚠️</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#F59E0B' }}>Licensing & Credential Recognition</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,158,11,0.85)' }}>{occ.licenseNote}</p>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'white' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'white' }}>{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-6 text-center" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.20)' }}>
          <div className="flex justify-center mb-3">
            <LakiveLogo size={20} theme="dark" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Get your personalised numbers</h2>
          <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            The figures above are based on market averages. Use the calculator to model your specific salary, property type, and timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isUS && (
              <Link href={`/?occupation=${occ.id}&city=${city}`}
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#14B8A6' }}>
                Calculate My Numbers
              </Link>
            )}
            {!isUS && (
              <Link href={`/city/${city}`}
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {cty.displayName} City Report
              </Link>
            )}
            <Link href="/guide"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Explore All Cities →
            </Link>
          </div>
        </section>

        {/* Comments */}
        <Comments
          occupation={occupation}
          city={city}
          occName={occ.name}
          cityName={cty.displayName}
        />

        {/* Related guides */}
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>Related Guides</h2>
          <div className="flex flex-wrap gap-2">
            {alts.slice(0, 2).map(a => (
              <Link key={a.slug} href={`/guide/${occupation}/${a.slug}`}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                {occ.name} in {CITIES[a.slug].displayName}
              </Link>
            ))}
            <Link href="/guide"
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              All Guides →
            </Link>
          </div>
        </section>

      </main>
      </div>
    </>
  )
}
