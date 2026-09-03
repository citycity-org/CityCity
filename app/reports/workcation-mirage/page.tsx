import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'The Workcation Mirage · Lakive Research',
  description: 'What global city rankings miss about settling in Canada. A Lakive Research report comparing IWG workcation scores against occupation-specific housing affordability across five Canadian cities.',
}

const BLUE  = '#185FA5'
const LBLUE = '#EDF2FF'
const DARK  = '#2D2D2B'
const MUTED = '#888780'
const BG    = '#FAFAFA'
const WHITE = '#FFFFFF'

// ── Layout helpers ────────────────────────────────────────────────────────────

function Verdict({ city, text }: { city: string; text: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${BLUE}`, background: LBLUE, padding: '14px 20px', borderRadius: '0 10px 10px 0', margin: '24px 0 32px' }}>
      <span style={{ fontWeight: 800, color: BLUE, fontSize: 14 }}>{city} verdict: </span>
      <span style={{ fontSize: 14, color: DARK, fontStyle: 'italic', lineHeight: 1.7 }}>{text}</span>
    </div>
  )
}

function ScopeBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: `4px solid ${BLUE}`, background: LBLUE, padding: '16px 24px', borderRadius: '0 12px 12px 0', margin: '24px 0' }}>
      <span style={{ fontWeight: 800, color: BLUE, fontSize: 14 }}>Scope: </span>
      <span style={{ fontSize: 14, color: DARK, lineHeight: 1.8 }}>{children}</span>
    </div>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 800, color: BLUE, margin: '48px 0 16px', paddingTop: 8, borderTop: `1px solid rgba(24,95,165,0.12)` }}>
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: '32px 0 12px' }}>{children}</h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: DARK, lineHeight: 1.8, margin: '0 0 16px' }}>{children}</p>
}

// ── Tables ────────────────────────────────────────────────────────────────────

function VVSTable() {
  const rows = [
    ['Housing',     'Accommodation quality and price',         'Price-to-income ratio; years to ownership'],
    ['Transport',   'Airport connectivity',                    'Daily commute infrastructure'],
    ['Food & culture','Restaurants, nightlife, novelty',       'Grocery costs, community fit, language'],
    ['Climate',     'Weather during the visit',                'Year-round liveability and seasonal range'],
    ['Work',        'Wi-Fi speed, co-working availability',    'Employment demand, licensing, wage trajectory'],
    ['Taxes',       'Irrelevant',                              'Provincial income tax; total effective rate'],
    ['Healthcare',  'Travel insurance',                        'Wait times, proximity, coverage'],
    ['Education',   'Not applicable',                          'School quality, bilingual access'],
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: BLUE }}>
            {['', 'Visitors & Workcationers', 'Settlers & Long-term Residents'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: WHITE, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([cat, vis, set], i) => (
            <tr key={cat} style={{ background: i % 2 === 0 ? '#F4F7FC' : WHITE }}>
              <td style={{ padding: '9px 14px', fontWeight: 700, color: DARK, borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{cat}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{vis}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{set}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DataTable() {
  const rows = [
    ['Vancouver, BC',  '#5 globally',  '13.0 years', '84 / 100', '80'],
    ['Toronto, ON',    'Not ranked',   '9.6 years',  '72 / 100', '92'],
    ['Montréal, QC',   'Not ranked',   '5.5 years',  '65 / 100', '72'],
    ['Ottawa, ON',     'Not ranked',   '6.8 years',  '52 / 100', '75'],
    ['Calgary, AB',    'Not ranked',   '3.9 years',  '50 / 100', '65'],
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: BLUE }}>
            {['City', 'IWG 2026', 'HEY (years)', 'Lifestyle Appeal (LAS)', 'Employment Demand (EOI)'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: WHITE, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([city, iwg, hey, las, eoi], i) => (
            <tr key={city} style={{ background: i % 2 === 0 ? '#F4F7FC' : WHITE }}>
              <td style={{ padding: '9px 14px', fontWeight: 700, color: DARK, borderBottom: '1px solid #E5E7EB' }}>{city}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{iwg}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }}>{hey}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{las}</td>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{eoi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkcationMiragePage() {
  return (
    <main style={{ background: BG, minHeight: '100vh' }}>

      {/* ── Dark header ─────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg,#0d1f44 0%,#1a2a5e 60%,#0f2050 100%)', padding: '64px 24px 56px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/reports" style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13, textDecoration: 'none' }}>
              ← Reports
            </Link>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { label: 'Issue Brief', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
              { label: '5 Cities', color: '#93C5FD', bg: 'rgba(79,142,247,0.10)' },
              { label: 'Housing · Lifestyle · Employment', color: '#93C5FD', bg: 'rgba(79,142,247,0.10)' },
            ].map(t => (
              <span key={t.label} style={{ fontSize: 11, fontWeight: 700, color: t.color, background: t.bg, border: `1px solid ${t.color}30`, padding: '4px 12px', borderRadius: 20 }}>
                {t.label}
              </span>
            ))}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', alignSelf: 'center', marginLeft: 4 }}>August 2026</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: WHITE, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            The Workcation Mirage
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.60)', margin: '0 0 32px', fontStyle: 'italic', lineHeight: 1.5 }}>
            What Global City Rankings Miss About Settling in Canada
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)', margin: '0 0 32px' }}>
            A Lakive Research Report · August 2026
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="/reports/pdf/workcation-mirage.pdf"
              target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              ↓ Download PDF
            </a>
          </div>
        </div>
      </section>

      {/* ── White body ──────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Executive Summary ─────────────────────────────────────────────── */}
        <H2>Executive Summary</H2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '0 0 32px' }}>
          {[
            ['Vancouver ranks #5 globally for workcations but last among Canadian cities for housing affordability.', 'Its Housing Entry Barrier (HEY) of 13.0 years means a median earner needs over a decade of disciplined saving to reach a down payment — the highest of any major Canadian city.'],
            ['The IWG Work from Anywhere Index is structurally inaccessible to most workers.', 'Remote and nomadic work applies to roughly 15–20% of the Canadian labour force. Nurses, electricians, teachers, mechanics, and construction workers have no use for a workcation ranking.'],
            ['Calgary is the most underrated city in Canada for long-term settlement.', 'With a HEY of 3.9 years, no provincial sales tax (PST), and rising employment demand across trades and healthcare, it outperforms its global lifestyle ranking by a wide margin.'],
            ['Ottawa is the most consistently balanced city across occupation types.', 'It offers moderate housing pressure, stable government-anchored employment demand, and strong public infrastructure — without the extreme costs of Vancouver or Toronto.'],
            ['Global desirability and personal settlement suitability are often inversely correlated.', 'The cities that generate the most aspiration are not always the cities where most people will thrive over a 10- or 20-year horizon.'],
          ].map(([bold, rest], i) => (
            <div key={i} style={{ background: WHITE, border: '1px solid rgba(24,95,165,0.12)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14 }}>
              <div style={{ color: BLUE, fontWeight: 900, fontSize: 18, minWidth: 28, paddingTop: 2 }}>{i + 1}</div>
              <p style={{ margin: 0, fontSize: 14, color: DARK, lineHeight: 1.75 }}>
                <strong>{bold}</strong>{' '}{rest}
              </p>
            </div>
          ))}
        </div>

        <ScopeBox>
          This report compares five Canadian cities — Vancouver, Toronto, Montréal, Ottawa, and Calgary — across two analytical lenses: global lifestyle and workcation rankings (IWG 2026) and Lakive&apos;s occupation-specific settlement metrics (HEY, LAS, EOI). All housing affordability figures use 2BR condo benchmark prices and assume a 20% down payment saved from median occupation income after tax. Data reflects Lakive&apos;s August 2026 index update.
        </ScopeBox>

        {/* ── The Headline ──────────────────────────────────────────────────── */}
        <H2>The Headline That Misses the Point</H2>
        <P>In July 2026, International Workplace Group (IWG) published its fourth annual Work from Anywhere Index, naming Vancouver the fifth-best &quot;workcation&quot; city in the world — the only Canadian city in the global top 10, ahead of Budapest, Naples, Medellín, Lisbon, and Seoul.</P>
        <P>It&apos;s a flattering result. And for a certain kind of worker — a software engineer extending a holiday, a freelance designer working beachside for a week — it may even be accurate.</P>
        <P>But for the nurse choosing where to relocate for her career. For the electrician deciding whether to leave Toronto for somewhere he can actually buy a home. For the accountant comparing after-tax income across provinces. For anyone weighing a permanent move rather than a temporary escape, the IWG index tells them almost nothing useful.</P>
        <P>This report asks a different question: <strong>when it comes to building a life in Canada, which cities actually deliver?</strong></P>

        {/* ── Two Measures ─────────────────────────────────────────────────── */}
        <H2>Two Measures. Two Very Different Answers.</H2>
        <P>The IWG index scores cities on climate, broadband speed, accommodation, transport, food, culture, and the availability of flexible co-working spaces. These are reasonable criteria for someone passing through. They are largely irrelevant for someone staying.</P>
        <P>What matters depends entirely on your relationship with the city.</P>
        <VVSTable />
        <P>Lakive measures Canadian cities on a different set of variables: employment opportunity, tax efficiency, housing affordability, income-to-rent ratio, and environmental and social quality of life. Critically, Lakive scores these metrics <em>by occupation</em> — because a nurse&apos;s experience of Calgary is fundamentally different from a software engineer&apos;s, and a blanket city ranking obscures more than it reveals.</P>
        <P>What happens when you hold both lenses up to the same city?</P>
        <DataTable />
        <P>Vancouver leads the IWG index for Canada. It ranks last among Canadian cities in Lakive&apos;s housing affordability metric. The gap between global desirability and local livability is nowhere more stark.</P>

        {/* ── City Matrix ───────────────────────────────────────────────────── */}
        <H2>The Lakive City Matrix™: Visualising the Gap</H2>

        {/* Chart */}
        <div style={{ margin: '24px 0 8px', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(24,95,165,0.12)' }}>
          <Image
            src="/charts/city-matrix-aug2026.png"
            alt="The Lakive City Matrix™ — bubble chart mapping five Canadian cities by Lifestyle Appeal (LAS), Housing Entry Barrier (HEY), and Employment Demand (EOI)"
            width={1406}
            height={875}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <p style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', margin: '8px 0 24px' }}>
          HEY = Housing Entry Barrier (years) · LAS = Lifestyle Appeal Score · EOI = Employment Opportunity Index · Bubble size = EOI · Dashed lines = median values
        </p>

        <P>The chart above maps five Canadian cities across two axes: Housing Entry Barrier (HEY) on the horizontal and Lifestyle Appeal (LAS) on the vertical. Bubble size represents Employment Opportunity Index (EOI). The median HEY and median Lifestyle Appeal across this city set divide the chart into four quadrants.</P>
        <P>Vancouver and Toronto sit firmly in the <strong>Aspirational Cities</strong> quadrant — highly desirable, but with the highest housing entry barriers in the country. Calgary and Ottawa occupy the <strong>Settlement Sweet Spot</strong> — lower barriers, practical long-term potential. Montréal sits near the median intersection, offering genuine accessibility with conditions attached. No Canadian city currently sits in the <strong>Global Gems</strong> quadrant, where high appeal meets accessible housing.</P>

        {/* ── City by City ──────────────────────────────────────────────────── */}
        <H2>City by City: The Real Numbers</H2>

        <H3>Vancouver — The Beautiful Trap</H3>
        <P>Vancouver&apos;s credentials are real. Proximity to mountains and ocean, mild winters, strong sustainability infrastructure, a globally connected tech sector. It is objectively beautiful, and the IWG index captures that accurately.</P>
        <P>What it doesn&apos;t capture: a registered nurse working full-time at median BC wages would need approximately <strong>10.2 income years</strong> to save a down payment on a two-bedroom condo. For an electrician, it&apos;s <strong>13 years</strong>. For a teacher, longer still.</P>
        <P>Rent consumes between 35% and 50% of monthly take-home pay across most occupations, leaving little capacity to build savings. The city rewards those who arrived early or inherited equity. For newcomers, it is a long climb with an uncertain summit.</P>
        <Verdict city="Vancouver" text="Globally aspirational. Financially punishing for most occupations at the settlement stage." />

        <H3>Toronto — The High-Ceiling, High-Cost Capital</H3>
        <P>Toronto doesn&apos;t appear on the IWG index, but it arguably should — it has world-class infrastructure, one of the most diverse economies in North America, and employment demand that outpaces every other Canadian city across most occupation categories.</P>
        <P>The problem is the same one as Vancouver&apos;s: housing. A two-bedroom condo requires roughly <strong>9.6 income years</strong> to reach a down payment for median earners. Rent pressure is among the highest in the country.</P>
        <P>Toronto makes sense for occupations where income growth is fast and high — senior software engineers, lawyers, financial professionals. For trades, healthcare, or education, the economic maths are harder to make work long-term.</P>
        <Verdict city="Toronto" text="The highest employment ceiling in Canada. The cost of accessing it is steep and rising." />

        <H3>Calgary — The City the Rankings Overlook</H3>
        <P>Calgary appears on no global lifestyle ranking of note. It has no coastline, a reputation for cold winters, and a downtown that still bears the marks of the 2015 oil collapse.</P>
        <P>It also has no provincial sales tax (PST). A two-bedroom condo down payment takes approximately <strong>3.9 income years</strong> for a median earner — less than a third of Vancouver&apos;s equivalent figure. Rent consumes 22–28% of take-home pay across most occupations, leaving real capacity to save and invest.</P>
        <P>For trades and healthcare workers specifically, Calgary combines competitive wages with employment demand that has risen consistently since 2023, driven by infrastructure investment and population growth from interprovincial migration.</P>
        <P>The city is building quietly. It lacks Vancouver&apos;s scenery and Toronto&apos;s institutional prestige. What it offers instead is a more direct path from arrival to stability — and for many occupations, that is the more relevant metric.</P>
        <Verdict city="Calgary" text="Underrated by lifestyle indices, overperforming on the variables that determine long-term financial wellbeing." />

        <H3>Ottawa — The Stable Capital</H3>
        <P>Ottawa rarely generates headlines. It generates, instead, a remarkably consistent quality of life for the professionals who choose it.</P>
        <P>Government employment provides a stable demand floor across administration, healthcare, engineering, and education. Housing pressure sits in the moderate range, with a Housing Entry Barrier of <strong>6.8 years</strong> — meaningful, but manageable.</P>
        <P>Ottawa is not the city that maximises any single variable. It is the city that consistently scores well across all of them — a resilient choice for families and career-stage movers who prioritise stability over upside.</P>
        <Verdict city="Ottawa" text="The most consistently balanced city in Canada for a wide range of occupations and life stages." />

        <H3>Montréal — Affordable, With Conditions</H3>
        <P>Montréal&apos;s cost of living is the most accessible of Canada&apos;s major cities. Rent is lower, housing prices are more moderate, and the cultural density is high. A Housing Entry Barrier of approximately <strong>5.5 years</strong> for median earners reflects a more permissive financial environment.</P>
        <P>The condition attached is language. Québec&apos;s professional licensing environment, workplace norms, and daily life operate primarily in French. For French speakers, or those willing to learn, Montréal offers genuine value. For English-dominant newcomers, the practical barriers are real and worth weighing carefully before committing.</P>
        <Verdict city="Montréal" text="The most financially accessible major city in Canada, with a language prerequisite that is genuine, not incidental." />

        {/* ── IWG critique ──────────────────────────────────────────────────── */}
        <H2>What the IWG Index Is, and What It Isn&apos;t</H2>
        <P>IWG is a commercial operator of flexible workspace — Regus, Spaces, and related brands — with locations in over 120 countries. Its Work from Anywhere Index has a structural interest in the narrative that remote and nomadic work is expanding, because that narrative supports demand for its product.</P>
        <P>This is not a criticism of the report&apos;s accuracy within its stated scope. For the roughly 15–20% of the Canadian workforce in knowledge jobs that can be performed remotely, it offers useful comparative data.</P>
        <P>But work-from-anywhere policies are genuinely inaccessible to the majority of the labour market. Nurses cannot triage patients remotely. Electricians cannot wire buildings from a co-working space in Bangkok. Teachers, mechanics, police officers, construction workers, and retail staff — the occupations that form the backbone of a city&apos;s functional economy — have no use for a workcation ranking.</P>
        <P>For them, and for anyone making a permanent location decision rather than a temporary one, the relevant question has always been the same: <strong>which city gives my career the best foundation, and which city lets me build a life I can actually afford?</strong></P>

        {/* ── Conclusion ────────────────────────────────────────────────────── */}
        <H2>Conclusion: Settle Smarter</H2>
        <P>The cities that top global lifestyle and workcation rankings are not the same cities where most people will thrive over a 10- or 20-year horizon. Desirability is real but incomplete. It captures surface appeal — scenery, food, culture — while leaving the structural variables — income, taxes, housing trajectory, employment demand — largely invisible.</P>
        <P>Lakive exists to make those variables visible, and to make them occupation-specific. A globally attractive city and a personally optimal city are often different places. Knowing the difference before you move is not a small thing.</P>
        <P>The data is available. The decision is yours.</P>

        {/* ── Footer notes ──────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 48, paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, margin: '0 0 8px' }}>
            Data sources: Lakive city-occupation index (August 2026 update); Rentals.ca National Rent Report (August 2026); Statistics Canada Labour Force Survey (July 2026); IWG Work from Anywhere Index 2026.
          </p>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, margin: 0 }}>
            All housing affordability figures use 2BR condo benchmark prices and assume 20% down payment saved from median occupation income after tax. HEY, LAS, and EOI are Lakive proprietary indices — see lakive.com/dictionary for full definitions. © Lakive 2026 · lakive.com
          </p>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <div style={{ margin: '48px 0 0', background: 'linear-gradient(135deg,rgba(24,95,165,0.06),rgba(24,95,165,0.02))', border: '1px solid rgba(24,95,165,0.16)', borderRadius: 20, padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ fontWeight: 800, color: DARK, fontSize: 17, margin: '0 0 8px' }}>Get future reports in your inbox</p>
          <p style={{ color: MUTED, fontSize: 14, margin: '0 0 20px' }}>Monthly city data · New report releases · Canada vs. U.S. insights</p>
          <Link href="/subscribe" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 10, background: BLUE, color: WHITE, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Subscribe free →
          </Link>
        </div>

      </section>
    </main>
  )
}
