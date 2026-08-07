'use client'
import Link from 'next/link'

const NAVY  = '#0d1f44'
const TEAL  = '#14B8A6'
const ORG   = '#E86C2F'
const BLUE  = '#4F8EF7'
const GRN   = '#059669'
const RED   = '#DC2626'
const AMBER = '#D97706'
const GREY  = '#64748B'

// ── Shared components ─────────────────────────────────────────────────────────

function SectionHeading({ num, title }: { num: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '48px 0 16px' }}>
      <div style={{ width: 4, height: 28, borderRadius: 2, background: TEAL, flexShrink: 0 }} />
      <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: 0 }}>
        {num}. {title}
      </h2>
    </div>
  )
}

function Source({ text }: { text: string }) {
  return <p style={{ fontSize: 12, color: GREY, fontStyle: 'italic', margin: '0 0 14px' }}>{text}</p>
}

function Body({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, margin: '0 0 14px' }}>{children}</p>
}

function Callout({ label, text, color = TEAL, bg = '#F0FDFA' }: { label: string; text: string; color?: string; bg?: string }) {
  return (
    <div style={{
      borderLeft: `4px solid ${color}`, background: bg,
      padding: '12px 16px', borderRadius: '0 8px 8px 0', margin: '16px 0',
    }}>
      <span style={{ fontWeight: 700, color, fontSize: 14 }}>{label} </span>
      <span style={{ fontSize: 14, color: '#1F2937', lineHeight: 1.6 }}>{text}</span>
    </div>
  )
}

// ── KPI summary table ─────────────────────────────────────────────────────────
function KpiTable() {
  const rows = [
    { label: 'National Avg. Asking Rent', value: 'CAD $2,033', signal: '▼ 4.3% YoY · 21st consecutive month of decline', color: GRN },
    { label: 'Unemployment Rate (Jun 2026)', value: '6.5%', signal: '▼ 0.3% vs prior month', color: GRN },
    { label: 'Net Jobs Added (Jun 2026)', value: '~18,000', signal: '3rd consecutive month of growth', color: GRN },
    { label: 'BoC Policy Rate', value: '2.25%', signal: 'Held — next decision Sep 2, 2026', color: GREY },
    { label: 'CPI Inflation (Jun 2026)', value: '2.8%', signal: '▼ 0.4% vs prior · approaching 2% target', color: GRN },
    { label: 'CREA Home Prices', value: 'Pending', signal: 'July 2026 data due Aug 15–18', color: AMBER },
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Indicator</th>
            <th style={{ padding: '10px 14px', textAlign: 'center', color: '#fff', fontWeight: 700 }}>Reading</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Signal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
              <td style={{ padding: '9px 14px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.label}</td>
              <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 700, color: NAVY, borderBottom: '1px solid #E5E7EB' }}>{r.value}</td>
              <td style={{ padding: '9px 14px', color: r.color, borderBottom: '1px solid #E5E7EB' }}>{r.signal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── What Changed This Month ────────────────────────────────────────────────────
function ChangesTable() {
  const rows = [
    { dir: '▼', label: 'National avg. asking rent', prev: 'CAD $2,121 (Jun)', now: 'CAD $2,033 (Jul) · ▼ 4.3% YoY', good: true },
    { dir: '▼', label: 'Unemployment rate', prev: '6.8% (May)', now: '6.5% (Jun) · ▼ 0.3%', good: true },
    { dir: '▼', label: 'CPI Inflation', prev: '3.2% (May)', now: '2.8% (Jun) · ▼ 0.4%', good: true },
    { dir: '—', label: 'BoC Policy Rate', prev: '2.25%', now: '2.25% · Held (Jul 15)', good: false },
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            <th style={{ padding: '9px 12px', color: '#fff', width: 36 }} />
            <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Indicator</th>
            <th style={{ padding: '9px 12px', textAlign: 'center', color: '#fff', fontWeight: 700 }}>Previous</th>
            <th style={{ padding: '9px 12px', textAlign: 'center', color: '#fff', fontWeight: 700 }}>Now</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} style={{ background: i % 2 === 0 ? '#F0FDF4' : '#fff' }}>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: r.good ? GRN : GREY, borderBottom: '1px solid #E5E7EB' }}>{r.dir}</td>
              <td style={{ padding: '9px 12px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.label}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: GREY, borderBottom: '1px solid #E5E7EB' }}>{r.prev}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: r.good ? GRN : GREY, borderBottom: '1px solid #E5E7EB' }}>{r.now}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── City scores table ─────────────────────────────────────────────────────────
function CityScoreTable() {
  const rows = [
    { city: 'Calgary', score: 74, eoi: 65, tai: 90, hpi: '2.5–22 yrs', rpi: 34, signal: 'Strongest overall · no PST', scoreColor: GRN, rpiColor: GRN },
    { city: 'Ottawa', score: 68, eoi: 75, tai: 68, hpi: '3.0–26 yrs', rpi: 37, signal: 'Best public sector stability', scoreColor: GRN, rpiColor: GRN },
    { city: 'Toronto', score: 60, eoi: 92, tai: 68, hpi: '4.5–39 yrs', rpi: 49, signal: 'Top EOI · high housing pressure', scoreColor: AMBER, rpiColor: AMBER },
    { city: 'Montréal', score: 60, eoi: 72, tai: 42, hpi: '2.6–23 yrs', rpi: 34, signal: 'Best French-market affordability', scoreColor: AMBER, rpiColor: GRN },
    { city: 'Vancouver', score: 59, eoi: 80, tai: 72, hpi: '5.5–42 yrs', rpi: 52, signal: 'Highest rent pressure nationally', scoreColor: AMBER, rpiColor: RED },
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {['City','Avg Score','EOI / TAI','HPI (yrs to buy)','Avg RPI','Key Signal'].map(h => (
              <th key={h} style={{ padding: '9px 12px', textAlign: h === 'City' || h === 'Key Signal' ? 'left' : 'center', color: '#fff', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.city} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: NAVY, borderBottom: '1px solid #E5E7EB' }}>{r.city}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800, color: r.scoreColor, borderBottom: '1px solid #E5E7EB' }}>{r.score}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.eoi} / {r.tai}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.hpi}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: r.rpiColor, borderBottom: '1px solid #E5E7EB' }}>{r.rpi}</td>
              <td style={{ padding: '9px 12px', color: GREY, fontSize: 13, borderBottom: '1px solid #E5E7EB' }}>{r.signal}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: GREY, fontStyle: 'italic', marginTop: 8 }}>
        Score = Lakive composite (0–100). EOI = Employment Opportunity Index. TAI = Tax Advantage Index. RPI = Rent Pressure Index (lower is better). HPI = years of median income to purchase. Data version: Aug 2026 v1.
      </p>
    </div>
  )
}

// ── Occupation scores table ───────────────────────────────────────────────────
function OccTable() {
  const rows = [
    { occ: 'Nurse', city: 'Calgary', score: 86, hpi: 4.5, rpi: 25, eoi: 'High', note: 'Best nurse city in Canada by Lakive score', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Nurse', city: 'Ottawa', score: 82, hpi: 6.5, rpi: 27, eoi: 'High', note: 'Federal healthcare · stable employment', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Nurse', city: 'Toronto', score: 72, hpi: 12.0, rpi: 41, eoi: 'High', note: 'High EOI but housing pressure is significant', sc: AMBER, rc: AMBER, ec: GRN },
    { occ: 'Electrician', city: 'Calgary', score: 91, hpi: 3.9, rpi: 24, eoi: 'High', note: '#1 trades city · home ownership in <4 yrs', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Electrician', city: 'Ottawa', score: 74, hpi: 6.8, rpi: 28, eoi: 'Mid', note: 'Solid choice · manageable housing cost', sc: AMBER, rc: GRN, ec: AMBER },
    { occ: 'Software Eng.', city: 'Toronto', score: 88, hpi: 9.2, rpi: 34, eoi: 'High', note: 'Highest tech EOI · 9 yrs to ownership', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Software Eng.', city: 'Vancouver', score: 84, hpi: 9.5, rpi: 36, eoi: 'High', note: 'Strong ecosystem · similar pressure to TO', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Doctor', city: 'Calgary', score: 92, hpi: 2.5, rpi: 11, eoi: 'High', note: 'Top score nationally · ownership in 2.5 yrs', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Doctor', city: 'Ottawa', score: 88, hpi: 3.0, rpi: 11, eoi: 'High', note: 'Close second · federal health networks', sc: GRN, rc: GRN, ec: GRN },
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            {['Occupation','City','Score','HPI (yrs)','RPI','EOI','Lakive Insight'].map(h => (
              <th key={h} style={{ padding: '9px 10px', textAlign: h === 'Occupation' || h === 'City' || h === 'Lakive Insight' ? 'left' : 'center', color: '#fff', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.occ}-${r.city}`} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: NAVY, borderBottom: '1px solid #E5E7EB' }}>{r.occ}</td>
              <td style={{ padding: '8px 10px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.city}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800, color: r.sc, borderBottom: '1px solid #E5E7EB' }}>{r.score}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.hpi}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: r.rc, borderBottom: '1px solid #E5E7EB' }}>{r.rpi}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: r.ec, borderBottom: '1px solid #E5E7EB' }}>{r.eoi}</td>
              <td style={{ padding: '8px 10px', color: GREY, borderBottom: '1px solid #E5E7EB' }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: GREY, fontStyle: 'italic', marginTop: 8 }}>
        HPI = Housing Years Index (years of after-tax income to 20% down payment). Full rankings at{' '}
        <Link href="/ranking" style={{ color: BLUE }}>lakive.com/ranking</Link>
      </p>
    </div>
  )
}

// ── Looking Ahead table ───────────────────────────────────────────────────────
function LookingAheadTable() {
  const rows = [
    { date: 'August 7', release: 'Statistics Canada LFS — July employment', updates: 'EOI scores · city job comparisons · salary trends', urgent: true },
    { date: 'August 15–18', release: 'CREA July home prices', updates: 'HPI (Housing Years Index) · city ranking · compare · housing guide', urgent: false },
    { date: 'August 17', release: 'Statistics Canada CPI — July inflation', updates: 'Cost of Living · City Pulse · Monthly Report update', urgent: true },
    { date: 'September 2', release: 'Bank of Canada rate decision', updates: 'BoC Rate in City Pulse · mortgage calculator · housing guide', urgent: false },
  ]
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: NAVY }}>
            <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700, width: 120 }}>Date</th>
            <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Release</th>
            <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Lakive Will Update</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.date} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: r.urgent ? RED : AMBER, borderBottom: '1px solid #E5E7EB' }}>{r.date}</td>
              <td style={{ padding: '9px 12px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.release}</td>
              <td style={{ padding: '9px 12px', color: GREY, fontSize: 13, borderBottom: '1px solid #E5E7EB' }}>{r.updates}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MonthlyReportJuly2026() {
  return (
    <main style={{ background: '#F5F7FB', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background: NAVY, padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly Report</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.06em' }}>July 2026</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>Data version Aug 2026 v1</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Canada's Rental Market Continues to Stabilize
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.60)', margin: '0 0 32px', fontStyle: 'italic' }}>
            Housing, Jobs and the Economy at a Glance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Published August 5, 2026 · Lakive Research</span>
            <a
              href="/reports/pdf/Lakive_Monthly_Report_July_2026_v2.pdf"
              target="_blank"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: TEAL, color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
              }}
            >
              ↓ Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* What Changed */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 What Changed This Month
          </h2>
          <ChangesTable />
        </div>

        {/* Executive Summary */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={1} title="Executive Summary" />
          <Body>
            July 2026 delivers a rare combination: rents falling for a 21st consecutive month, inflation tracking toward target, the unemployment rate declining, and interest rates stable at a three-year low. For Canadians weighing a relocation or career move, this is the most favourable macro environment since before the 2022 rate cycle.
          </Body>
          <Body>
            The data is directionally positive — but the gains are uneven across cities and occupations. Calgary continues to dominate Lakive's composite scoring, while Vancouver carries the highest rent pressure of any covered city. Workers in healthcare and trades are best positioned to act now; renters waiting for further price drops in Toronto may find the floor arriving sooner than expected.
          </Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Key Numbers at a Glance</h3>
          <KpiTable />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '24px 0 12px' }}>5 Actionable Takeaways</h3>
          {[
            'Trades workers: Calgary is the clearest opportunity — an electrician can reach home ownership in under 4 years (Lakive HPI: 3.9 yrs), with a composite score of 91/100.',
            'Healthcare workers: Ottawa and Calgary both score 80+ for nurses. Ottawa offers federal-sector stability; Calgary offers faster ownership timelines.',
            'Tech professionals: Toronto\'s EOI of 92 remains the highest in Canada. At 9.2 years to ownership, the housing gap vs. Calgary (5.2 yrs) is real but manageable for high earners.',
            'Renters: National rents are down 4.3% YoY and Toronto shows early stabilization signals. If you\'re planning to move, locking in a lease in late 2026 may beat waiting for further drops.',
            'Buyers: With BoC at 2.25% and no cut expected before September 2, mortgage conditions are stable. Mid-tier cities (Ottawa, Calgary, Montréal) offer the best entry points on a salary-adjusted basis.',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, margin: '8px 0' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: TEAL, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>

        {/* Rental */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={2} title="National Rental Market" />
          <Source text="Source: Rentals.ca × Urbanation National Rent Report, July 8, 2026" />
          <Body>
            National average asking rent reached CAD $2,033 in July — the 21st consecutive month of year-over-year decline. The sustained softening reflects elevated purpose-built completions, reduced interprovincial migration, and a structural shift in tenant leverage that has now lasted nearly two years.
          </Body>
          <Body>
            Month-over-month, rents edged slightly higher for a second consecutive month — an early signal that the correction floor is approaching. Toronto is the clearest example of this stabilization, driven by absorption of newly completed units in the GTA.
          </Body>
          <Callout
            label="Lakive Interpretation:"
            text="Renters in Toronto who have been waiting for the bottom may be close to it. In Calgary and Ottawa, rents never fell as sharply — affordability there is driven by income-to-rent ratios, not price drops. Our RPI (Rent Pressure Index) for Calgary sits at 34 vs. Vancouver's 52 — a 53% difference in rent burden relative to median income."
            color={TEAL} bg="#F0FDFA"
          />
        </div>

        {/* Housing */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={3} title="Housing Market & Lakive HPI" />
          <Source text="CREA July 2026 data pending (expected Aug 15–18). Lakive Housing Years Index (HPI) reflects current model calculations." />
          <Body>
            In the absence of July CREA benchmark prices, Lakive's proprietary Housing Years Index provides the most current city-level affordability picture. HPI measures how many years of median after-tax income a worker in a given occupation needs to accumulate a 20% down payment at current home prices.
          </Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Lakive City Scores — July 2026</h3>
          <CityScoreTable />
          <Callout
            label="Lakive Interpretation:"
            text="Calgary's average Lakive Score of 74 — 14 points above Toronto and Vancouver — reflects the compounding advantage of no PST, lower home prices, and a labour market that has absorbed energy-sector volatility without major job losses. For skilled workers, this gap is structural, not cyclical."
            color={ORG} bg="#FFF7ED"
          />
        </div>

        {/* Employment */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={4} title="Employment Snapshot" />
          <Source text="Source: Statistics Canada LFS, June 2026. July 2026 data releases August 7." />
          <Body>
            Canada's labour market added ~18,000 net jobs in June, marking a third consecutive month of positive growth. The unemployment rate fell to 6.5% — down 0.3 points from May — with youth employment improving for a second consecutive month.
          </Body>
          <div style={{ paddingLeft: 16 }}>
            {[
              'Strongest sectors: healthcare, public administration, professional services',
              'Weakest segment: manufacturing (-4,200), reflecting continued export softness',
              'Youth (15–24): unemployment declining, services and tech leading gains',
              'Participation rate: steady at 65.1%',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, margin: '6px 0' }}>
                <span style={{ color: TEAL, fontWeight: 700, flexShrink: 0 }}>•</span>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>
          <Callout
            label="Lakive Interpretation:"
            text="The sectors gaining jobs align directly with Lakive's highest-scoring city-occupation combinations. Healthcare hiring is concentrated in Ottawa and Calgary. Tech growth in Toronto continues to outpace other cities. Workers in these sectors who are geographically flexible have the most to gain from a relocation decision today."
            color={BLUE} bg="#EFF6FF"
          />
          <Callout
            label="⚠ Update pending:"
            text="July 2026 LFS data releases August 7. Lakive will update EOI scores and city job comparisons immediately upon release."
            color={AMBER} bg="#FFFBEB"
          />
        </div>

        {/* Rates */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={5} title="Interest Rates & Inflation" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '4px 0 10px' }}>Bank of Canada — 2.25% (Held, July 15, 2026)</h3>
          <Body>
            The Bank held its overnight rate at 2.25% at the July meeting — the third consecutive hold after a 275-basis-point easing cycle from the 5.0% peak in 2023. The Bank signalled continued confidence that inflation will return to 2%, while leaving flexibility for a September cut if data cooperates.
          </Body>
          <Callout
            label="Lakive Interpretation:"
            text="At 2.25%, a $500K mortgage at a 5-year fixed rate costs roughly $850/month less than it did at the 2023 peak. In Calgary and Ottawa — where home prices are lower — this rate environment materially expands the set of occupations for which ownership is achievable within 5–8 years."
            color={TEAL} bg="#F0FDFA"
          />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 10px' }}>CPI Inflation — 2.8% (June 2026)</h3>
          <Body>
            Inflation continued its descent toward the 2% target. Shelter costs remain elevated on an annual basis, though the monthly pace has slowed materially. July CPI data releases August 17.
          </Body>
        </div>

        {/* Insight of the Month */}
        <div style={{ background: NAVY, borderRadius: 14, padding: '28px 32px', marginBottom: 24, borderLeft: `5px solid ${TEAL}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Insight of the Month</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: TEAL, margin: '0 0 14px' }}>
            The Calgary Advantage Is Compounding
          </h2>
          <p style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.75, margin: 0 }}>
            In 2022, Calgary was seen as a boom-and-bust risk. In 2026, it scores highest in Lakive's model across 7 of 10 in-demand occupations. No provincial sales tax, median home prices ~40% below Vancouver, a diversifying economy beyond oil, and a labour market absorbing in-migration without significant wage compression. Workers who relocated to Calgary in 2023–2024 are now 2–3 years ahead on the ownership timeline compared to staying in Toronto or Vancouver. The gap is structural — and it's widening.
          </p>
        </div>

        {/* City Insights */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={6} title="Lakive City Insights" />
          <Body>Scores below are Lakive composite ratings (0–100) based on salary, housing affordability, tax burden, employment opportunity, and quality of life. Data version: Aug 2026 v1.</Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Cross-City Score: Key Occupations</h3>
          <OccTable />

          {[
            { city: 'Calgary', score: 74, rpi: 34, text: 'Calgary remains the top-scoring city in Lakive\'s model for the 4th consecutive data version. The no-PST advantage (TAI: 90) compounds over time — a nurse earning $95,000 takes home roughly $4,200 more annually in Calgary than an equivalent earner in Ontario. Combined with an HPI of 4.5 years for nurses, Calgary offers the fastest path to ownership of any major Canadian city.' },
            { city: 'Ottawa', score: 68, rpi: 37, text: 'Ottawa scores second nationally, with the highest Public Sector Stability Index (PSI: 82) of any covered city. Federal healthcare and technology employment is concentrated and recession-resistant. Housing Years Index for nurses (6.5 yrs) and software engineers (6.2 yrs) sits well below national averages. The best under-the-radar option for workers who want Toronto-level opportunity without Toronto-level pressure.' },
            { city: 'Toronto', score: 60, rpi: 49, text: 'Toronto carries the highest Employment Opportunity Index (EOI: 92) of any Lakive city — driven by concentration in finance, technology, and professional services. The trade-off is a Rent Pressure Index of 49 and HPI ranging from 9–13 years for most professional occupations. Software engineers score 88/100, the best tech score in Canada, but the housing math is unforgiving for median earners.' },
            { city: 'Vancouver', score: 59, rpi: 52, text: 'Vancouver holds the highest Environmental Quality Index (EQI: 90) but the weakest affordability metrics. The RPI of 52 is the highest of any covered city. Ownership timelines for trades and healthcare workers (12–13 years) price out most non-specialist earners. Best suited to high-income tech and healthcare workers who can absorb the cost premium.' },
            { city: 'Montréal', score: 60, rpi: 34, text: 'Montréal ties Toronto on average score (60) but via a different profile: low RPI (34, tied with Calgary), lower home prices (HPI 2.6–6.8 yrs for most occupations), but a significantly lower TAI (42) due to combined GST+QST. For French-speaking professionals, the city offers the strongest affordability package of any major Canadian market.' },
          ].map(c => (
            <div key={c.city} style={{ margin: '20px 0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: '0 0 6px' }}>
                {c.city} <span style={{ color: GREY, fontWeight: 500 }}>— Avg Score {c.score} · RPI {c.rpi}</span>
              </h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{c.text}</p>
            </div>
          ))}

          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/ranking" style={{ background: NAVY, color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>View Full Rankings →</Link>
            <Link href="/compare" style={{ border: `1px solid ${NAVY}`, color: NAVY, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Compare Cities →</Link>
          </div>
        </div>

        {/* Looking Ahead */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={7} title="Looking Ahead" />
          <LookingAheadTable />
        </div>

        {/* Data Sources */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 40, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={8} title="Data Sources" />
          <Body>
            Lakive's city scores (Score, HPI, RPI, EOI) are proprietary composites calculated from public government and industry data. Inputs include median occupational wages (Job Bank Canada), home benchmark prices (CREA), average asking rents (Rentals.ca × Urbanation), provincial tax schedules, and employment absorption rates (Statistics Canada). The composite weighting methodology is not disclosed. Scores are recalibrated with each major data release.
          </Body>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Source</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Rental Market', 'Rentals.ca × Urbanation', 'Monthly (~8th)'],
                  ['Employment', 'Statistics Canada LFS', 'Monthly (first Friday)'],
                  ['Home Prices', 'CREA National Statistics', 'Monthly (15–18th)'],
                  ['Inflation (CPI)', 'Statistics Canada', 'Monthly (15–18th)'],
                  ['Interest Rate', 'Bank of Canada', '8× per year'],
                  ['City Scores (HPI/RPI/EOI)', 'Lakive proprietary model', 'Updated each data release'],
                ].map(([cat, src, freq], i) => (
                  <tr key={cat} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#fff' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: NAVY, borderBottom: '1px solid #E5E7EB' }}>{cat}</td>
                    <td style={{ padding: '8px 12px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{src}</td>
                    <td style={{ padding: '8px 12px', color: GREY, borderBottom: '1px solid #E5E7EB' }}>{freq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: GREY, fontStyle: 'italic', marginTop: 16, lineHeight: 1.6 }}>
            © 2026 Lakive. All rights reserved. This report is for informational purposes only and does not constitute financial or investment advice. · <Link href="/reports" style={{ color: BLUE }}>All Reports</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
