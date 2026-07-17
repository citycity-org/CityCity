import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay? | Lakive',
  description: 'A Lakive issue brief comparing EIU global livability rankings with occupation-based housing affordability, rent pressure, and after-tax income for Vancouver workers. H1 2026.',
  openGraph: {
    title: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay?',
    description: 'EIU ranks Vancouver #9 globally. But a nurse here needs 13.1 years of income to buy a benchmark home. Lakive breaks down affordability by occupation.',
    url: 'https://www.lakive.com/reports/vancouver-livability-worker-affordability-2026',
    type: 'article',
    images: [
      {
        url: 'https://www.lakive.com/og/vancouver-issue-brief-2026.png',
        width: 1200,
        height: 630,
        alt: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay?',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vancouver Is a Top-10 Livable City — But Can Local Workers Afford to Stay?',
    description: 'EIU ranks Vancouver #9 globally. But a nurse here needs 13.1 years of income to buy a benchmark home. Lakive breaks down affordability by occupation.',
    images: ['https://www.lakive.com/og/vancouver-issue-brief-2026.png'],
  },
}

type Occupation = {
  name: string
  noc: string
  salary: number
  afterTax: number
  atIndicative?: boolean
  hpi: number
  rpiGross: number
  rpiNet: number
  level: 1 | 2 | 3 | 4 | 5
  note?: string
}

const LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: 'L1 Lower Pressure',  color: '#14B8A6' },
  2: { label: 'L2 Manageable',      color: '#10B981' },
  3: { label: 'L3 Under Pressure',  color: '#F59E0B' },
  4: { label: 'L4 Difficult',       color: '#E86C2F' },
  5: { label: 'L5 Severe Pressure', color: '#EF4444' },
}

const OCCUPATIONS: Occupation[] = [
  { name: 'Family Physician / GP', noc: '31102', salary: 160960, afterTax: 113346, atIndicative: true,  hpi: 7.5,  rpiGross: 23.1, rpiNet: 32.8, level: 2, note: '¹' },
  { name: 'Lawyer',                noc: '41101', salary: 129968, afterTax: 94716,                        hpi: 9.3,  rpiGross: 28.6, rpiNet: 39.3, level: 3 },
  { name: 'Software Developer',    noc: '21232', salary: 102180, afterTax: 76509,                        hpi: 11.9, rpiGross: 36.4, rpiNet: 48.6, level: 3 },
  { name: 'Pharmacist',            noc: '31120', salary: 97500,  afterTax: 73190,                        hpi: 12.5, rpiGross: 38.2, rpiNet: 50.8, level: 4 },
  { name: 'Civil Engineer',        noc: '21300', salary: 96993,  afterTax: 72826,                        hpi: 12.5, rpiGross: 38.4, rpiNet: 51.1, level: 4 },
  { name: 'Registered Nurse',      noc: '31301', salary: 92703,  afterTax: 69746,                        hpi: 13.1, rpiGross: 40.1, rpiNet: 53.3, level: 4 },
  { name: 'Data Analyst',          noc: '21223', salary: 87185,  afterTax: 65783,                        hpi: 13.9, rpiGross: 42.7, rpiNet: 56.5, level: 4 },
  { name: 'Secondary Teacher',     noc: '41220', salary: 86444,  afterTax: 65252,                        hpi: 14.1, rpiGross: 43.0, rpiNet: 57.0, level: 4 },
  { name: 'Dentist',               noc: '31110', salary: 78000,  afterTax: 59469,  atIndicative: true,  hpi: 15.6, rpiGross: 47.7, rpiNet: 62.6, level: 4, note: '²' },
  { name: 'Social Worker',         noc: '41300', salary: 71994,  afterTax: 55417,                        hpi: 16.9, rpiGross: 51.7, rpiNet: 67.1, level: 5 },
  { name: 'Electrician',           noc: '72200', salary: 67412,  afterTax: 52366,                        hpi: 18.0, rpiGross: 55.2, rpiNet: 71.0, level: 5 },
  { name: 'Retail Sales Associate',noc: '64100', salary: 37050,  afterTax: 30741,                        hpi: 32.8, rpiGross: 100.4,rpiNet: 121.0,level: 5 },
]

type CalgaryRow = {
  name: string
  vanHpi: number; calHpi: number
  vanRpi: number; calRpi: number
  vanRpiNet: number; calRpiNet: number
  vanLevel: 1|2|3|4|5; calLevel: 1|2|3|4|5
}

const CALGARY_COMPARISON: CalgaryRow[] = [
  { name: 'Registered Nurse',   vanHpi: 13.1, calHpi: 6.9, vanRpi: 40.1, calRpi: 24.6, vanRpiNet: 53.3, calRpiNet: 33.5, vanLevel: 4, calLevel: 2 },
  { name: 'Software Developer', vanHpi: 11.9, calHpi: 6.2, vanRpi: 36.4, calRpi: 22.3, vanRpiNet: 48.6, calRpiNet: 30.5, vanLevel: 3, calLevel: 2 },
  { name: 'Secondary Teacher',  vanHpi: 14.1, calHpi: 7.4, vanRpi: 43.0, calRpi: 26.4, vanRpiNet: 57.0, calRpiNet: 35.7, vanLevel: 4, calLevel: 2 },
  { name: 'Lawyer',             vanHpi: 9.3,  calHpi: 4.9, vanRpi: 28.6, calRpi: 17.5, vanRpiNet: 39.3, calRpiNet: 24.4, vanLevel: 3, calLevel: 1 },
  { name: 'Electrician',        vanHpi: 18.0, calHpi: 9.5, vanRpi: 55.2, calRpi: 33.8, vanRpiNet: 71.0, calRpiNet: 44.4, vanLevel: 5, calLevel: 3 },
  { name: 'Social Worker',      vanHpi: 16.9, calHpi: 8.9, vanRpi: 51.7, calRpi: 31.7, vanRpiNet: 67.1, calRpiNet: 42.0, vanLevel: 5, calLevel: 3 },
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
  const l1to3       = OCCUPATIONS.filter(o => o.level <= 3).length
  const l4to5       = OCCUPATIONS.filter(o => o.level >= 4).length
  const highRentNet = OCCUPATIONS.filter(o => o.rpiNet >= 50).length

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', color: 'white' }}>
      <style>{`
        .cal-table { display: table; width: 100%; }
        .cal-cards  { display: none; }
        .stat-grid  { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 640px) {
          .cal-table { display: none; }
          .cal-cards  { display: block; }
          .stat-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .occ-table-wrap { overflow-x: auto; }
        }
      `}</style>

      {/* ── Report meta bar ───────────────────────────────────────────── */}
      <div style={{ background: 'rgba(10,14,28,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/reports" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none' }}>← Reports</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.10)', padding: '3px 10px', borderRadius: 20 }}>Issue Brief</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>H1 2026</span>
          </div>
          <a
            href="/reports/pdf/Lakive_Vancouver_Worker_Affordability_Issue_Brief_H1_2026.pdf"
            download
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#93C5FD', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}
          >
            ↓ Download PDF
          </a>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 48px', background: 'linear-gradient(160deg,#0d1117 0%,#111827 60%,#1a2035 100%)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.22)', padding: '4px 12px', borderRadius: 20 }}>Issue Brief</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.22)', padding: '4px 12px', borderRadius: 20 }}>Vancouver</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', padding: '4px 12px' }}>H1 2026 · Lakive Semi-Annual</span>
          </div>

          <h1 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Vancouver Is a Top-10 Livable City —<br />
            <span style={{ color: '#F59E0B' }}>But Can Local Workers Afford to Stay?</span>
          </h1>

          {/* Core thesis */}
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 500, lineHeight: 1.7, maxWidth: 680, margin: '0 0 20px', borderLeft: '3px solid #F59E0B', paddingLeft: 16 }}>
            Vancouver ranks among the world&apos;s best cities — but remains financially out of reach for many of the workers who keep it running.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
            Salary data from Government of Canada Job Bank (Lower Mainland–Southwest Region, 2023–2024).
            Ratings based on Lakive&apos;s 5-level Housing Price Index and Rent Pressure Index system.
          </p>
        </div>
      </section>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Key Findings ──────────────────────────────────────────── */}
        <section style={{ padding: '48px 0 0' }}>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)', borderRadius: 20, padding: '28px 32px', marginBottom: 32 }}>
            <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 20 }}>Key Findings</div>

            {[
              {
                bold: `Only ${l1to3} of 12 occupations rate L3 Manageable or better.`,
                text: `The remaining ${l4to5} fall into L4 Stretched or L5 Very Difficult on Lakive's 5-level affordability scale.`,
              },
              {
                bold: 'Estimated after-tax rent burden exceeds 50% for most occupations.',
                text: `For ${highRentNet} of 12 occupations, a two-bedroom asking rent exceeds half of estimated take-home income — highlighting the cash-flow pressure behind the standardized gross-income rating.`,
              },
              {
                bold: 'Homeownership is a distant goal, not a medium-term one.',
                text: `Vancouver's composite benchmark HPI stands at 16.2 years at the $75,000 median salary. Only Family Physicians and Lawyers fall below 10 HPI Years.`,
              },
              {
                bold: 'Calgary offers measurably different outcomes.',
                text: `A composite benchmark HPI of ~8.5 years, $1,900/month reference asking rent versus $3,100, and lower provincial tax rates put most occupations one to two rating levels better.`,
              },
              {
                bold: 'Salary data for 10 of 12 occupations is from Government of Canada Job Bank.',
                text: 'Family Physician and Dentist use alternative official sources and carry specific data caveats. The $3,100 and $1,900 monthly figures represent new-tenant asking rates (Rentals.ca / Zumper, H1 2026), not CMHC occupied-unit averages.',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 4 ? 16 : 0, alignItems: 'flex-start' }}>
                <span style={{ color: '#F59E0B', fontWeight: 900, flexShrink: 0, marginTop: 2, fontSize: 13 }}>{i + 1}</span>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>{item.bold}</strong>{' '}{item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Stat cards */}
          <div className="stat-grid" style={{ display: 'grid', gap: 14, marginBottom: 48 }}>
            <StatCallout value="#9"                label="EIU Global Rank 2026"          sub="Out of 173 cities"       color="#14B8A6" />
            <StatCallout value="16.2 yrs"          label="Composite Benchmark HPI"       sub="At $75K median salary"   color="#F59E0B" />
            <StatCallout value={`${l4to5}/12`}     label="L4 Stretched or worse"         sub="By occupation"           color="#E86C2F" />
            <StatCallout value={`${highRentNet}/12`} label="Rent > 50% of after-tax"     sub="On a 2BR unit"           color="#EF4444" />
          </div>
        </section>

        {/* ── Section 1: What EIU measures ─────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>What the EIU ranking actually measures</h2>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
            The EIU Global Liveability Index scores 173 cities across stability, healthcare, culture, education, and infrastructure. Vancouver scores exceptionally well on all five. Its political institutions are stable, its healthcare is universal, and its natural environment — mountains, ocean, Stanley Park — is genuinely exceptional.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 0 }}>
            What the EIU does not measure: whether a nurse earning $92,703 can afford a two-bedroom apartment without spending the majority of her take-home income on rent. Whether a teacher on $86,444 can realistically save for a down payment within a decade. These are not niche concerns — they describe the financial reality of most of Vancouver&apos;s working population.
          </p>
        </section>

        {/* ── Section 2: Occupation Data Table ────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 8px', letterSpacing: '-0.01em' }}>Vancouver affordability by occupation</h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            Salaries from Government of Canada Job Bank, Lower Mainland–Southwest Region (2023–2024).
            After-tax income modelled for a T4 salaried employee under 2026 Federal and BC tax rules.
            Reference 2BR Asking Rent: $3,100/month (Rentals.ca / Zumper, H1 2026).
          </p>

          <div className="occ-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.10)' }}>
                  {[
                    { label: 'Occupation',        align: 'left'   },
                    { label: 'NOC',               align: 'center' },
                    { label: 'Gross',             align: 'center' },
                    { label: 'Est. After-Tax',    align: 'center' },
                    { label: 'HPI Yrs',           align: 'center' },
                    { label: 'RPI Gross',         align: 'center' },
                    { label: 'Est. RPI Net',      align: 'center' },
                    { label: 'Lakive Rating',     align: 'center' },
                  ].map(h => (
                    <th key={h.label} style={{ padding: '10px 12px', textAlign: h.align as 'left'|'center', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OCCUPATIONS.map((occ, i) => {
                  const meta = LEVEL_META[occ.level]
                  return (
                    <tr key={occ.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ padding: '13px 12px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                        {occ.name}{occ.note && <sup style={{ color: '#F59E0B', fontSize: 10, marginLeft: 2 }}>{occ.note}</sup>}
                      </td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.30)', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap' as const }}>{occ.noc}</td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: 12 }}>${(occ.salary / 1000).toFixed(0)}K</td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: occ.atIndicative ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)', fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
                        {occ.atIndicative && <span style={{ color: '#F59E0B', fontSize: 10, marginRight: 2 }}>~</span>}${(occ.afterTax / 1000).toFixed(0)}K
                      </td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: meta.color, fontWeight: 800, fontSize: 15 }}>{occ.hpi}</td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: occ.rpiGross >= 50 ? '#EF4444' : occ.rpiGross >= 38 ? '#E86C2F' : occ.rpiGross >= 30 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>{occ.rpiGross}%</td>
                      <td style={{ padding: '13px 12px', textAlign: 'center', color: occ.rpiNet >= 60 ? '#EF4444' : occ.rpiNet >= 50 ? '#E86C2F' : occ.rpiNet >= 38 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>{occ.rpiNet}%</td>
                      <td style={{ padding: '13px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: `${meta.color}15`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>{meta.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Rating legend */}
          <div style={{ marginTop: 14, padding: '12px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 1.8, display: 'flex', flexWrap: 'wrap', gap: '2px 18px' }}>
              {Object.entries(LEVEL_META).map(([lvl, m]) => (
                <span key={lvl}><span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>
                  {lvl === '1' && ' ≤5 HPI / ≤25% RPI'}
                  {lvl === '2' && ' ≤8 HPI / ≤30% RPI'}
                  {lvl === '3' && ' ≤12 HPI / ≤38% RPI'}
                  {lvl === '4' && ' ≤18 HPI / ≤50% RPI'}
                  {lvl === '5' && ' >18 HPI or >50% RPI'}
                </span>
              ))}
            </div>
          </div>

          {/* Rating methodology note */}
          <div style={{ marginTop: 10, padding: '11px 18px', background: 'rgba(79,142,247,0.04)', border: '1px solid rgba(79,142,247,0.12)', borderRadius: 10 }}>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, lineHeight: 1.75 }}>
              <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Lakive Rating</strong> is determined by the worse of HPI Years and RPI Gross. Gross-income rent pressure is used for rating because it provides a standardized, comparable basis across occupations and jurisdictions.{' '}
              <strong style={{ color: 'rgba(255,255,255,0.45)' }}>Est. After-Tax</strong> and <strong style={{ color: 'rgba(255,255,255,0.45)' }}>Est. RPI Net</strong> are supplementary cash-flow indicators and do not affect the rating.
            </div>
          </div>

          {/* Data notes */}
          <div style={{ marginTop: 10, padding: '11px 18px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
            <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, lineHeight: 1.75 }}>
              <sup style={{ color: '#F59E0B' }}>¹</sup> Family Physician: BC provincial median (CIHI / CMA, 2023–2024); no Lower Mainland regional breakdown. <span style={{ color: '#F59E0B' }}>~</span> After-tax is indicative only — physicians typically remunerate through incorporated practices.{' '}
              <sup style={{ color: '#F59E0B' }}>²</sup> Dentist: 2021 Census data; after-tax also indicative only for the same reason.
            </div>
          </div>
        </section>

        {/* ── Section 3: The Affordability Gap ─────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>The ownership threshold: how Vancouver stacks up by occupation</h2>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
            Reaching below 10 HPI Years — the range where homeownership becomes a realistic medium-term goal — requires earning roughly $120,000 or more in Vancouver.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
            Among occupations with verified Lower Mainland Job Bank salaries, only <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Lawyers ($129,968)</strong> meet this threshold at <strong style={{ color: 'rgba(255,255,255,0.85)' }}>9.3 HPI Years</strong>. Family Physicians also fall below 10 years at <strong style={{ color: 'rgba(255,255,255,0.85)' }}>7.5 HPI Years</strong>, but their figure is based on a BC-wide clinical income estimate — not a regional Job Bank salary. Software Developers sit just outside at <strong style={{ color: 'rgba(255,255,255,0.85)' }}>11.9 years</strong>.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 24 }}>
            Six occupations — Pharmacist, Civil Engineer, Registered Nurse, Data Analyst, Secondary Teacher, and Dentist — land in <strong style={{ color: '#E86C2F' }}>L4 Stretched</strong> at 12–16 HPI Years. Their salaries range from $78K to $97.5K. In most Canadian cities, these would represent comfortable, ownership-accessible incomes.
          </p>

          {/* Pull quote */}
          <div style={{ borderLeft: '3px solid #F59E0B', paddingLeft: 20, margin: '0 0 24px', color: 'rgba(255,255,255,0.72)', fontSize: 14, fontStyle: 'italic', lineHeight: 1.75 }}>
            A registered nurse earning $92,703 faces a composite benchmark HPI of <strong style={{ fontStyle: 'normal', color: '#F59E0B' }}>13.1 years</strong> and an after-tax rent burden of <strong style={{ fontStyle: 'normal', color: '#F59E0B' }}>53.3%</strong>. If 20% of the income remaining after rent were saved toward a down payment, accumulating a 20% deposit on a benchmark-priced home would take well over 15 years — a simplified static estimate that does not account for home-price growth or investment returns.
          </div>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 0 }}>
            For Social Workers, Electricians, and Retail Associates, after-tax rent burden exceeds <strong style={{ color: '#EF4444' }}>67%</strong> — leaving very little for food, transport, and savings, let alone wealth accumulation.
          </p>
        </section>

        {/* ── Section 4: Calgary Comparison ────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>The Calgary alternative: same country, different math</h2>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
            Calgary operates within the same national immigration, banking, and labour-market framework as Vancouver — but the housing and cost numbers are materially different.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Composite Benchmark HPI', van: '16.2 yrs', cal: '8.5 yrs' },
              { label: 'Reference 2BR Asking Rent', van: '$3,100/mo', cal: '$1,900/mo' },
              { label: 'Provincial Tax (top rate)', van: '20.5%', cal: '15%' },
              { label: 'Provincial Sales Tax', van: '7% PST', cal: 'None' },
            ].map(row => (
              <div key={row.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 8 }}>{row.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#E86C2F', fontWeight: 700, fontSize: 13 }}>{row.van}</span>
                  <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 11 }}>vs</span>
                  <span style={{ color: '#14B8A6', fontWeight: 800, fontSize: 13 }}>{row.cal}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
            Note: Alberta has provincial income tax (10–15% rates); the advantage is lower rates and no PST, not the absence of provincial tax.
          </p>

          {/* Calgary vs Vancouver table — desktop */}
          <div className="cal-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.10)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Occupation</th>
                  <th colSpan={2} style={{ padding: '10px 12px', textAlign: 'center', color: '#93C5FD', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>HPI Years</th>
                  <th colSpan={2} style={{ padding: '10px 12px', textAlign: 'center', color: '#5EEAD4', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Rent Burden (After-Tax)</th>
                  <th colSpan={2} style={{ padding: '10px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Rating</th>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ padding: '6px 12px' }} />
                  {['Van','Cal','Van','Cal','Van','Cal'].map((h, i) => (
                    <th key={i} style={{ padding: '6px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.30)', fontSize: 11, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CALGARY_COMPARISON.map((row, i) => {
                  const vm = LEVEL_META[row.vanLevel]
                  const cm = LEVEL_META[row.calLevel]
                  return (
                    <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', color: '#E86C2F', fontWeight: 700 }}>{row.vanHpi}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', color: '#14B8A6', fontWeight: 800 }}>{row.calHpi}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', color: '#E86C2F', fontWeight: 700 }}>{row.vanRpiNet}%</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', color: '#14B8A6', fontWeight: 800 }}>{row.calRpiNet}%</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: vm.color, background: `${vm.color}15`, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>{vm.label}</span>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cm.color, background: `${cm.color}15`, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>{cm.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Calgary vs Vancouver — mobile cards */}
          <div className="cal-cards">
            {CALGARY_COMPARISON.map(row => {
              const vm = LEVEL_META[row.vanLevel]
              const cm = LEVEL_META[row.calLevel]
              return (
                <div key={row.name} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 12 }}>{row.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'rgba(232,108,47,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 6 }}>VANCOUVER</div>
                      <div style={{ color: '#E86C2F', fontWeight: 700, fontSize: 13 }}>{row.vanHpi} yrs · {row.vanRpiNet}%</div>
                      <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: vm.color, background: `${vm.color}15`, padding: '2px 8px', borderRadius: 20 }}>{vm.label}</span></div>
                    </div>
                    <div style={{ background: 'rgba(20,184,166,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 6 }}>CALGARY</div>
                      <div style={{ color: '#14B8A6', fontWeight: 800, fontSize: 13 }}>{row.calHpi} yrs · {row.calRpiNet}%</div>
                      <div style={{ marginTop: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: cm.color, background: `${cm.color}15`, padding: '2px 8px', borderRadius: 20 }}>{cm.label}</span></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Calgary nurse callout */}
          <div style={{ margin: '24px 0 0', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.20)', borderRadius: 14, padding: '18px 22px' }}>
            <div style={{ color: '#5EEAD4', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Registered Nurse — Calgary vs. Vancouver</div>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Calgary reduces HPI Years from <strong style={{ color: '#E86C2F' }}>13.1</strong> to <strong style={{ color: '#14B8A6' }}>6.9</strong> and after-tax rent burden from <strong style={{ color: '#E86C2F' }}>53.3%</strong> to <strong style={{ color: '#14B8A6' }}>33.5%</strong> — moving from <strong style={{ color: '#E86C2F' }}>L4 Stretched</strong> to <strong style={{ color: '#10B981' }}>L2 Affordable</strong>.
            </p>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.85, marginTop: 20 }}>
            The gap is consistent across occupations. Calgary rates one to two levels better in every comparison shown, with five of the six occupations showing a two-level improvement. For workers in trades, public services, and mid-income professions, financial progress — savings, investment, eventual ownership — is significantly more difficult to achieve in Vancouver at current income and housing-cost levels.
          </p>
        </section>

        {/* ── Section 5: Who faces lower / higher pressure ──────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>Who faces lower — and higher — financial pressure in Vancouver</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.20)', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ color: '#14B8A6', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✓ Lower financial pressure</div>
              {[
                'High-income professionals — physicians, senior lawyers, executives',
                'Dual-income households with combined income above $180K',
                'Remote workers earning USD or premium CAD tech salaries',
                'Those who purchased property before 2016 with substantial existing equity',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14B8A6', flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ color: '#EF4444', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>✗ Higher financial pressure</div>
              {[
                'Single-income households earning below $130K',
                'Newcomers starting from zero without existing capital',
                'Public sector workers — nurses, teachers, social workers',
                'Tradespeople and skilled workers outside high-demand tech sectors',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.85 }}>
            This distinction matters most for newcomers, who enter the market with no existing equity, limited Canadian credit history, and often a credential recognition gap that temporarily suppresses income. Spending 50–70% of take-home income on rent in the early years leaves virtually no capital to build toward stability.
          </p>
        </section>

        {/* ── Section 6: Outlook ────────────────────────────────────── */}
        <section style={{ padding: '8px 0 48px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '32px 0 16px', letterSpacing: '-0.01em' }}>Outlook</h2>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85, marginBottom: 14 }}>
            Vancouver&apos;s affordability challenge is structural, not cyclical. Supply is constrained by geography, political resistance to density, and sustained demand. Interest rate movements can shift monthly carrying costs but do not change the underlying price-to-income gap.
          </p>

          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 1.85 }}>
            For workers and newcomers making location decisions in 2026, Vancouver&apos;s global livability ranking is one data point among many. It captures real quality-of-life advantages. It does not capture whether those advantages are financially accessible to many of the workers who sustain the city.
          </p>
        </section>

        {/* ── Footer CTAs ───────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '36px 0 64px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Explore the data behind this report</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/guide/registered-nurse/vancouver" style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Explore Nurses in Vancouver →
                </Link>
                <Link href="/compare?a=vancouver&b=calgary" style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Compare Vancouver and Calgary →
                </Link>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link href="/subscribe" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                Subscribe to future reports →
              </Link>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8 }}>New occupation and city reports, delivered periodically. No spam.</div>
            </div>
          </div>
        </section>

      </article>
    </main>
  )
}
