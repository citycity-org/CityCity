import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay? | Lakive',
  description: 'A Lakive issue brief comparing EIU global livability rankings with occupation-based housing affordability, rent pressure, and after-tax income for Vancouver workers. H1 2026.',
  openGraph: {
    title: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay?',
    description: 'EIU ranks Vancouver #9 globally. But a nurse here needs 14.5 years of income to buy a 2BR. Lakive breaks down affordability by occupation.',
    url: 'https://www.lakive.com/reports/vancouver-livability-worker-affordability-2026',
    type: 'article',
  },
}

// ── All data is calculated from Lakive's published formulas ───────────────
// benchmarkHpi = 16.2 (Vancouver), avgRent2BR = $3,100 CAD, benchmark = $75K
// HPI Years = benchmarkHpi × (75000 / salary)
// RPI = (3100 × 12 / salary) × 100

const OCCUPATIONS = [
  { name: 'Family Physician',    salary: 230000, hpi: 5.3,  rpi: 16.2, verdict: 'Strongly Recommended',   color: '#14B8A6' },
  { name: 'Dentist',             salary: 185000, hpi: 6.6,  rpi: 20.1, verdict: 'Strongly Recommended',   color: '#14B8A6' },
  { name: 'Lawyer',              salary: 130000, hpi: 9.3,  rpi: 28.6, verdict: 'Recommended',             color: '#10B981' },
  { name: 'Software Engineer',   salary: 110000, hpi: 11.0, rpi: 33.8, verdict: 'Proceed with Caution',   color: '#F59E0B' },
  { name: 'Pharmacist',          salary: 105000, hpi: 11.6, rpi: 35.4, verdict: 'Proceed with Caution',   color: '#F59E0B' },
  { name: 'Civil Engineer',      salary: 90000,  hpi: 13.5, rpi: 41.3, verdict: 'Proceed with Caution',   color: '#F59E0B' },
  { name: 'Registered Nurse',    salary: 84000,  hpi: 14.5, rpi: 44.3, verdict: 'Difficult',              color: '#E86C2F' },
  { name: 'Electrician',         salary: 82000,  hpi: 14.8, rpi: 45.4, verdict: 'Difficult',              color: '#E86C2F' },
  { name: 'Data Analyst',        salary: 80000,  hpi: 15.2, rpi: 46.5, verdict: 'Difficult',              color: '#E86C2F' },
  { name: 'Secondary Teacher',   salary: 78000,  hpi: 15.6, rpi: 47.7, verdict: 'Difficult',              color: '#E86C2F' },
  { name: 'Social Worker',       salary: 65000,  hpi: 18.7, rpi: 57.2, verdict: 'Very Difficult',         color: '#EF4444' },
  { name: 'Retail Associate',    salary: 42000,  hpi: 28.9, rpi: 88.6, verdict: 'Not Realistic',          color: '#EF4444' },
]

const CALGARY_COMPARISON = [
  { name: 'Registered Nurse',  vanHpi: 14.5, calHpi: 7.6,  vanRpi: 44.3, calRpi: 27.1 },
  { name: 'Software Engineer', vanHpi: 11.0, calHpi: 5.8,  vanRpi: 33.8, calRpi: 20.7 },
  { name: 'Secondary Teacher', vanHpi: 15.6, calHpi: 8.2,  vanRpi: 47.7, calRpi: 29.2 },
  { name: 'Lawyer',            vanHpi: 9.3,  calHpi: 4.9,  vanRpi: 28.6, calRpi: 17.5 },
  { name: 'Electrician',       vanHpi: 14.8, calHpi: 7.8,  vanRpi: 45.4, calRpi: 27.8 },
  { name: 'Social Worker',     vanHpi: 18.7, calHpi: 9.8,  vanRpi: 57.2, calRpi: 35.1 },
]

function StatCallout({ value, label, sub, color = '#4F8EF7' }: { value: string; label: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: `${color}0D`, border: `1px solid ${color}30`, borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
      <div style={{ color, fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: 700, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function VancouverReportPage() {
  const difficult = OCCUPATIONS.filter(o => o.hpi >= 13).length
  const feasible  = OCCUPATIONS.filter(o => o.hpi < 10).length
  const highRent  = OCCUPATIONS.filter(o => o.rpi >= 40).length

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', color: 'white' }}>

      {/* ── Report meta bar ───────────────────────────────────────────── */}
      <div style={{ background: 'rgba(10,14,28,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/reports" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none' }}>← Reports</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.10)', padding: '3px 10px', borderRadius: 20 }}>Issue Brief</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>H1 2026</span>
          </div>
          <a
            href="/reports/pdf/vancouver-worker-affordability-2026.pdf"
            download
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#93C5FD', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}
          >
            ↓ Download PDF
          </a>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 48px', background: 'linear-gradient(160deg,#0d1117 0%,#111827 60%,#1a2035 100%)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.22)', padding: '4px 12px', borderRadius: 20 }}>Issue Brief</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.22)', padding: '4px 12px', borderRadius: 20 }}>Vancouver</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 20 }}>All Occupations</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', padding: '4px 12px' }}>H1 2026 · Lakive Semi-Annual</span>
          </div>

          <h1 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Vancouver Is a Top-10 Livable City —<br />
            <span style={{ color: '#F59E0B' }}>But Can Local Workers Afford to Stay?</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
            A Lakive issue brief comparing EIU global livability rankings with occupation-based housing
            affordability, rent pressure, and after-tax income for local workers. The EIU ranks Vancouver
            #9 in the world. The data tells a more complicated story.
          </p>
        </div>
      </section>

      <article style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Executive Summary ─────────────────────────────────────── */}
        <section style={{ padding: '48px 0 0' }}>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)', borderRadius: 20, padding: '28px 32px', marginBottom: 40 }}>
            <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Executive Summary</div>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.85, margin: '0 0 14px' }}>
              The Economist Intelligence Unit ranks Vancouver #9 among 173 global cities in 2026 — the only
              North American city in the top 10. The ranking reflects genuine strengths: political stability,
              world-class healthcare, natural beauty, and cultural infrastructure that few cities can match.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.85, margin: '0 0 14px' }}>
              But livability rankings don&apos;t measure whether a nurse can afford to stay. They don&apos;t
              calculate how many years of salary a teacher needs to save for a down payment, or what
              percentage of a social worker&apos;s income disappears into rent each month.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.85, margin: 0 }}>
              Lakive&apos;s analysis finds that <strong style={{ color: 'white' }}>only 3 of 12 occupations</strong> we
              modeled can realistically pursue homeownership in Vancouver on local wages.
              For the remaining <strong style={{ color: 'white' }}>9 occupations — representing the majority
              of Vancouver&apos;s workforce</strong> — the financial math is either difficult or not realistic
              at current price and income levels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 48 }}>
            <StatCallout value="#9" label="EIU Global Rank 2026" sub="Out of 173 cities" color="#14B8A6" />
            <StatCallout value="16.2 yrs" label="Benchmark HPI" sub="Median salary ($75K CAD)" color="#F59E0B" />
            <StatCallout value={`${difficult}/12`} label="Occupations rated Difficult+" sub="HPI Years ≥ 13" color="#EF4444" />
            <StatCallout value={`${highRent}/12`} label="Occupations with rent > 40%" sub="Of gross income" color="#E86C2F" />
          </div>
        </section>

        {/* ── Section 1: What EIU measures ─────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>What the EIU ranking actually measures</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            The EIU Global Liveability Index scores cities across five categories: stability (25%),
            healthcare (20%), culture and environment (25%), education (10%), and infrastructure (20%).
            Within each category, sub-factors assess institutional quality, freedom of expression,
            public transport reliability, availability of good restaurants, and dozens of other metrics
            that correlate with quality of urban life.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            Vancouver scores exceptionally well on these measures. Its political stability is among the
            highest globally. Its healthcare system, while strained by family doctor shortages, remains
            universal and high-quality. Stanley Park, the Seawall, and the North Shore mountains give
            it an environmental quality that Vienna and Copenhagen — perennial top-rankers — cannot
            replicate. These are real advantages that genuinely improve daily life.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 0 }}>
            What the EIU does not measure: whether a nurse earning $84,000 per year can afford a
            two-bedroom apartment without spending nearly half her income on rent. Whether a teacher
            on $78,000 can realistically accumulate a down payment on a median-priced home within
            a decade. These are not niche concerns — they describe the financial reality of most of
            Vancouver&apos;s working population.
          </p>
        </section>

        {/* ── Section 2: Occupation Data Table ────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 8px', letterSpacing: '-0.01em' }}>Vancouver affordability by occupation</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
            HPI Years = years of gross income needed to buy a median 2BR home. RPI = annual 2BR rent as % of gross salary.
            All figures based on 2025–2026 salary benchmarks and current market data.
          </p>

          {/* Table */}
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.10)' }}>
                  {['Occupation', 'Annual Salary', 'HPI Years', 'Rent Burden', 'Verdict'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Occupation' ? 'left' : 'center', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OCCUPATIONS.map((occ, i) => (
                  <tr key={occ.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{occ.name}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.50)', fontFamily: 'monospace', fontSize: 12 }}>
                      ${(occ.salary / 1000).toFixed(0)}K CAD
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: occ.color, fontWeight: 800, fontSize: 15 }}>
                      {occ.hpi}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: occ.rpi >= 40 ? '#EF4444' : occ.rpi >= 35 ? '#E86C2F' : occ.rpi >= 28 ? '#F59E0B' : '#14B8A6', fontWeight: 700 }}>
                      {occ.rpi}%
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: occ.color, background: `${occ.color}15`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>
                        {occ.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Verdict thresholds: </strong>
              Strongly Recommended: HPI &lt; 7 yrs &amp; RPI &lt; 30% · Recommended: HPI &lt; 10 yrs &amp; RPI &lt; 36% ·
              Proceed with Caution: HPI &lt; 13 yrs or RPI &lt; 42% · Difficult: HPI ≥ 13 yrs &amp; RPI ≥ 42% ·
              Very Difficult / Not Realistic: HPI ≥ 18 yrs
            </p>
          </div>
        </section>

        {/* ── Section 3: The Affordability Gap ─────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>The ownership threshold: who can actually afford to buy</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            At Vancouver&apos;s current price-to-income ratio, only workers earning above approximately $115,000
            per year can achieve an HPI Years score below 11 — the threshold where homeownership, while
            still demanding, becomes a realistic medium-term goal with disciplined saving.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            In practice, this means homeownership is realistically accessible to physicians, dentists,
            lawyers, and senior software engineers — professions that represent a small minority of
            Vancouver&apos;s total workforce. For the majority of the working population — nurses, teachers,
            tradespeople, social workers, data analysts — the math simply doesn&apos;t work on a single income.
          </p>

          {/* Pull quote */}
          <div style={{ borderLeft: '3px solid #F59E0B', paddingLeft: 24, margin: '28px 0', color: 'rgba(255,255,255,0.75)', fontSize: 16, fontStyle: 'italic', lineHeight: 1.7 }}>
            A nurse earning $84,000 per year in Vancouver faces a housing affordability ratio of 14.5 years —
            nearly twice the threshold at which Lakive rates a market &ldquo;Recommended.&rdquo; At a 20% savings rate
            on after-tax income, she would need over two decades to accumulate a standard down payment
            on a median-priced 2BR home.
          </div>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 0 }}>
            The rent situation offers little relief. For 8 of the 12 occupations we analyzed, annual
            rent on a median 2BR apartment exceeds 40% of gross income — a level that most financial
            planners consider the danger zone for long-term wealth accumulation. For social workers
            at 57.2% and retail workers at 88.6%, renting a standard family-sized apartment in
            Vancouver is not simply expensive: it leaves little room for savings, emergencies, or
            any meaningful progress toward financial stability.
          </p>
        </section>

        {/* ── Section 4: Calgary Comparison ────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>The Calgary alternative: same country, different math</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 28 }}>
            Calgary, which also ranks in the EIU&apos;s top 20 globally (#18 in 2025), illustrates how
            dramatically affordability can differ within the same country and immigration system.
            Calgary&apos;s benchmark HPI stands at 8.5 years — nearly half of Vancouver&apos;s 16.2.
            The city also offers Alberta&apos;s 0% provincial income tax, adding $5,000–$15,000 in
            annual take-home income for most professionals compared to British Columbia.
          </p>

          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.10)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Occupation</th>
                  <th colSpan={2} style={{ padding: '10px 16px', textAlign: 'center', color: '#93C5FD', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>HPI Years</th>
                  <th colSpan={2} style={{ padding: '10px 16px', textAlign: 'center', color: '#5EEAD4', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rent Burden</th>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ padding: '6px 16px' }} />
                  <th style={{ padding: '6px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}>Vancouver</th>
                  <th style={{ padding: '6px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}>Calgary</th>
                  <th style={{ padding: '6px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}>Vancouver</th>
                  <th style={{ padding: '6px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}>Calgary</th>
                </tr>
              </thead>
              <tbody>
                {CALGARY_COMPARISON.map((row, i) => (
                  <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#E86C2F', fontWeight: 700 }}>{row.vanHpi}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#14B8A6', fontWeight: 800 }}>{row.calHpi}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#E86C2F', fontWeight: 700 }}>{row.vanRpi}%</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#14B8A6', fontWeight: 800 }}>{row.calRpi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginTop: 24 }}>
            The difference is not marginal. A nurse in Calgary faces 7.6 years HPI and 27.1% rent burden —
            numbers that place her in &ldquo;Manageable&rdquo; territory. The same nurse in Vancouver faces
            14.5 years and 44.3% — firmly in the &ldquo;Difficult&rdquo; category. Both cities are livable
            by any reasonable standard. But only one of them makes financial sense for her.
          </p>
        </section>

        {/* ── Section 5: Who Vancouver works for ───────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>Who Vancouver actually works for</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 20 }}>
            This analysis is not a case against Vancouver. It is a case for honesty about who Vancouver
            is financially viable for, and who it is not.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.20)', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ color: '#14B8A6', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✓ Vancouver works financially for:</div>
              {[
                'High-income professionals (physicians, dentists, senior lawyers)',
                'Dual-income households with combined income above $180K',
                'Remote workers earning USD or high CAD tech salaries',
                'Those who purchased property before 2016 and hold equity',
                'Investors with existing capital seeking appreciation',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14B8A6', flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ color: '#EF4444', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✗ Vancouver is financially strained for:</div>
              {[
                'Single-income households earning below $120K',
                'Newcomers starting from zero without existing capital',
                'Public sector workers (teachers, nurses, social workers)',
                'Tradespeople and skilled workers in non-tech sectors',
                'Anyone expecting to own property within a reasonable timeframe on a single income',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85 }}>
            This distinction matters most for newcomers, who face the market with no existing equity,
            limited Canadian credit history, and often a credential recognition gap that temporarily
            suppresses their income. For this group, the decision of where to land in Canada
            has outsized long-term consequences. Landing in Vancouver at entry-level wages
            while paying 50%+ of income to rent leaves virtually no room to build the capital
            base needed to eventually transition to ownership.
          </p>
        </section>

        {/* ── Section 6: Outlook ────────────────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>Outlook</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            Vancouver&apos;s affordability crisis is structural, not cyclical. It is driven by supply
            constraints rooted in geography (mountains and ocean), political resistance to density
            in established neighbourhoods, and sustained demand from both domestic and international
            buyers. Interest rate movements can shift monthly carrying costs, but they do not
            address the fundamental price-to-income gap.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
            Meaningful improvement in the occupation-based affordability picture would require either
            a sustained increase in housing supply (particularly purpose-built rental and entry-level
            ownership), a significant rise in median wages for mid-income occupations, or a combination
            of both. Neither is likely to materialize rapidly. Provincial housing policy has
            accelerated rezoning and densification efforts since 2023, but new supply takes years
            to translate into price relief.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 0 }}>
            For workers and newcomers making location decisions in 2026, Vancouver&apos;s global
            livability ranking is one data point among many. It captures real quality of life
            advantages that matter. It does not capture whether those advantages are financially
            accessible to the majority of people who work there.
          </p>
        </section>

        {/* ── Methodology ───────────────────────────────────────────── */}
        <section style={{ padding: '8px 0 56px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '32px 0 14px', color: 'rgba(255,255,255,0.65)' }}>Methodology</h3>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.85 }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'rgba(255,255,255,0.55)' }}>HPI Years</strong> (Housing Price Index Years)
              is Lakive&apos;s primary affordability metric. It represents the number of years of gross income
              required to purchase a median 2-bedroom home in a given city, calculated as:
              <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 6, marginLeft: 6, fontFamily: 'monospace' }}>
                benchmarkHpi × (medianSalary / occupationSalary)
              </code>
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'rgba(255,255,255,0.55)' }}>RPI</strong> (Rent Pressure Index)
              measures annual median 2BR rent as a percentage of gross occupation salary:
              <code style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 6, marginLeft: 6, fontFamily: 'monospace' }}>
                (avgRent2BR × 12 / salary) × 100
              </code>
            </p>
            <p style={{ marginBottom: 10 }}>
              Vancouver benchmark: HPI 16.2 years at $75,000 CAD median salary · Average 2BR rent: $3,100 CAD/month.
              Salary data sourced from Statistics Canada, Government of Canada Job Bank, Indeed CA (2025–2026).
              Housing and rental data sourced from CMHC, Zumper, and local MLS data (2025–2026).
            </p>
            <p style={{ margin: 0 }}>
              EIU ranking sourced from the Economist Intelligence Unit Global Liveability Index 2026 official
              press release. Lakive is not affiliated with the EIU or The Economist Group.
            </p>
          </div>
        </section>

        {/* ── Footer CTAs ───────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 0 72px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 8 }}>Explore the data behind this report</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/guide/registered-nurse/vancouver" style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Nurse in Vancouver →
              </Link>
              <Link href="/compare?a=vancouver&b=calgary" style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Compare Vancouver vs. Calgary →
              </Link>
            </div>
          </div>
          <Link href="/subscribe" style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
            Get future reports →
          </Link>
        </section>

      </article>
    </main>
  )
}
