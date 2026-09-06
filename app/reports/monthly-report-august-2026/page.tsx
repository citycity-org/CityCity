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
    { label: 'National Avg. Asking Rent (Jul 2026)', value: 'CAD $2,012', signal: '▼ 3.8% YoY · 22nd consecutive month of decline', color: GRN },
    { label: 'Unemployment Rate (Aug 2026)', value: '6.4%', signal: '— Held · employment rate ▼ 60.8% · participation declined', color: AMBER },
    { label: 'Net Jobs (Aug 2026)', value: '−42,000', signal: 'Reversal after 4 months of growth · services & construction fell', color: RED },
    { label: 'BoC Policy Rate', value: '2.25%', signal: '⚠ Held — Sep 2, 2026 · first inflation warning issued · next decision Oct 28', color: AMBER },
    { label: 'CPI Inflation (Jul 2026)', value: '3.0%', signal: '▲ 0.2% vs prior · moving away from 2% target · tariff & energy pressure', color: AMBER },
    { label: 'CREA National Benchmark (Jul 2026)', value: 'CAD $710,000', signal: 'Roughly stable · ▼ 1.1% YoY · no significant recovery yet', color: GREY },
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
    { dir: '▲', label: 'CPI Inflation', prev: '2.8% (Jun)', now: '3.0% (Jul) · ▲ 0.2% · tariff & energy pressure', good: false },
    { dir: '⚠', label: 'BoC Policy Tone', prev: 'Neutral hold', now: 'Inflation warning issued · rate hike back on table', good: false },
    { dir: '—', label: 'Unemployment rate', prev: '6.4% (Jul)', now: '6.4% (Aug) · held · employment rate ▼ to 60.8%', good: false },
    { dir: '▼', label: 'Net jobs', prev: '+25,000 (Jul)', now: '−42,000 (Aug) · reversal · services & construction fell', good: false },
    { dir: '▼', label: 'National avg. asking rent', prev: 'CAD $2,033 (Jul)', now: 'CAD $2,012 (Jul) · ▼ 3.8% YoY', good: true },
    { dir: '—', label: 'BoC Policy Rate', prev: '2.25%', now: '2.25% · Held (Sep 2)', good: false },
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
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: r.good ? GRN : (r.dir === '⚠' ? AMBER : RED), borderBottom: '1px solid #E5E7EB' }}>{r.dir}</td>
              <td style={{ padding: '9px 12px', color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{r.label}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: GREY, borderBottom: '1px solid #E5E7EB' }}>{r.prev}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: r.good ? GRN : (r.dir === '⚠' ? AMBER : (r.dir === '—' ? GREY : RED)), borderBottom: '1px solid #E5E7EB' }}>{r.now}</td>
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
    { city: 'Calgary', score: 74, eoi: 65, tai: 90, hpi: '2.5–22 yrs', rpi: 34, signal: 'Strongest overall · no PST · BoC hold extends ownership window', scoreColor: GRN, rpiColor: GRN },
    { city: 'Ottawa', score: 68, eoi: 75, tai: 68, hpi: '3.0–26 yrs', rpi: 37, signal: 'Best public sector stability · inflation resilient', scoreColor: GRN, rpiColor: GRN },
    { city: 'Toronto', score: 60, eoi: 92, tai: 68, hpi: '4.5–39 yrs', rpi: 49, signal: 'Top EOI · high housing pressure · rent stabilizing', scoreColor: AMBER, rpiColor: AMBER },
    { city: 'Montréal', score: 60, eoi: 72, tai: 42, hpi: '2.6–23 yrs', rpi: 34, signal: 'Best French-market affordability · CPI tariff risk lower', scoreColor: AMBER, rpiColor: GRN },
    { city: 'Vancouver', score: 59, eoi: 80, tai: 72, hpi: '5.5–42 yrs', rpi: 52, signal: 'Highest rent pressure nationally · tariff exposure high', scoreColor: AMBER, rpiColor: RED },
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
        Score = Lakive composite (0–100). EOI = Employment Opportunity Index. TAI = Tax Advantage Index. RPI = Rent Pressure Index (lower is better). HPI = years of median income to purchase. Data version: Sep 2026 v1.
      </p>
    </div>
  )
}

// ── Occupation scores table ───────────────────────────────────────────────────
function OccTable() {
  const rows = [
    { occ: 'Nurse', city: 'Calgary', score: 86, hpi: 4.5, rpi: 25, eoi: 'High', note: 'Best nurse city in Canada · BoC rate hold extends 5-yr ownership window', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Nurse', city: 'Ottawa', score: 82, hpi: 6.5, rpi: 27, eoi: 'High', note: 'Federal healthcare · inflation-resilient wages', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Nurse', city: 'Toronto', score: 72, hpi: 12.0, rpi: 41, eoi: 'High', note: 'High EOI but housing pressure is significant', sc: AMBER, rc: AMBER, ec: GRN },
    { occ: 'Electrician', city: 'Calgary', score: 91, hpi: 3.9, rpi: 24, eoi: 'High', note: '#1 trades city · home ownership in <4 yrs · construction hiring up', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Electrician', city: 'Ottawa', score: 74, hpi: 6.8, rpi: 28, eoi: 'Mid', note: 'Solid choice · manageable housing cost', sc: AMBER, rc: GRN, ec: AMBER },
    { occ: 'Software Eng.', city: 'Toronto', score: 88, hpi: 9.2, rpi: 34, eoi: 'High', note: 'Highest tech EOI · 9 yrs to ownership · tech hiring resilient', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Software Eng.', city: 'Vancouver', score: 84, hpi: 9.5, rpi: 36, eoi: 'High', note: 'Strong ecosystem · tariff uncertainty a headwind for US-adjacent firms', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Doctor', city: 'Calgary', score: 92, hpi: 2.5, rpi: 11, eoi: 'High', note: 'Top score nationally · ownership in 2.5 yrs · no PST advantage largest for high earners', sc: GRN, rc: GRN, ec: GRN },
    { occ: 'Doctor', city: 'Ottawa', score: 88, hpi: 3.0, rpi: 11, eoi: 'High', note: 'Close second · federal health networks · inflation-indexed contracts', sc: GRN, rc: GRN, ec: GRN },
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
    { date: '✓ Sep 5', release: 'Statistics Canada LFS — August employment (released)', updates: '−42,000 jobs · 6.4% unemployment · 60.8% employment rate · wages +2.0% YoY', urgent: false },
    { date: 'Mid-October', release: 'CREA August home prices', updates: 'HPI (Housing Years Index) · city ranking · compare · housing guide', urgent: false },
    { date: '~October 17', release: 'Statistics Canada CPI — September inflation', updates: 'Cost of Living · City Pulse · Monthly Report update', urgent: true },
    { date: 'October 28', release: 'Bank of Canada rate decision', updates: 'BoC Rate in City Pulse · mortgage calculator · housing guide · rate hike risk flagged', urgent: true },
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
export default function MonthlyReportAugust2026() {
  return (
    <main style={{ background: '#F5F7FB', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background: NAVY, padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly Report</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.06em' }}>August 2026</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>Data version Sep 2026 v1</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Canada Is Growing Again. But Is Life Getting More Affordable?
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.60)', margin: '0 0 32px', fontStyle: 'italic' }}>
            Economy, Jobs, Housing and the BoC Inflation Warning
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Published September 5, 2026 · Lakive Research</span>
            <a
              href="/reports/pdf/Lakive_Monthly_Report_August_2026_v4.pdf"
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
            August 2026 delivers a sharper split than expected. Canada lost 42,000 net jobs in August — reversing four consecutive months of growth — while the unemployment rate held at 6.4% only because the participation rate fell, not because more people found work. The employment rate dropped to 60.8%. At the same time, rents are falling for a 22nd consecutive month and GDP continues to expand. The headline still holds: Canada is growing again. The question is who the growth is reaching.
          </Body>
          <Body>
            But affordability is not following. July CPI rose to 3.0%, moving away from the Bank of Canada's 2% target for the first time since the easing cycle began. On September 2, the Bank held rates at 2.25% for the seventh consecutive meeting — but issued its first explicit inflation warning, flagging US tariffs and energy prices as upside risks. A rate hike is back on the table. For workers, renters, and would-be buyers, the question is whether the gains of the past two years can survive a policy reversal.
          </Body>
          <Body>
            Lakive's city and occupation scores remain anchored in the fundamentals: lower-cost cities with stable employment — Calgary, Ottawa — continue to outperform. The gap between cities that absorb macro shocks and those that amplify them is widening. Workers with the ability to relocate have more to gain now than at any point in the past four years.
          </Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Key Numbers at a Glance</h3>
          <KpiTable />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '24px 0 12px' }}>5 Actionable Takeaways</h3>
          {[
            'Trades workers: Calgary remains the clearest opportunity — an electrician reaches home ownership in under 4 years (HPI: 3.9 yrs). The BoC hold at 2.25% keeps mortgage conditions stable for now, but the inflation warning makes locking in a rate today strategically important.',
            'Healthcare workers: Ottawa and Calgary both score 80+ for nurses. If tariff-driven inflation leads to a rate hike in October, Calgary\'s lower home prices and no-PST advantage provide the largest buffer against rising carrying costs.',
            'Tech professionals: Toronto\'s EOI of 92 holds. The city\'s tech labour market has shown resilience to tariff uncertainty — US firms with Canadian operations have largely maintained hiring plans. At 9.2 years to ownership, the housing math hasn\'t changed, but the BoC warning is a new risk to monitor.',
            'Renters: National rents are down 3.8% YoY but the pace of decline is slowing. Locking in a lease in Q4 2026 remains a reasonable strategy — if the BoC raises rates in October, new housing supply economics shift, which could slow completions and tighten the market in 2027.',
            'Buyers: The BoC\'s Oct 28 decision is now the defining event of the year. If they hold, current mortgage conditions persist. If they hike, affordability compresses. Mid-tier cities (Calgary, Ottawa) offer the widest safety margin regardless of which scenario plays out.',
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
          <Source text="Source: Rentals.ca × Urbanation National Rent Report, August 2026" />
          <Body>
            National average asking rent reached CAD $2,012 in August — the 22nd consecutive month of year-over-year decline. At ▼3.8% YoY, the rate of decline is moderating from the 4.3% pace recorded in July, suggesting the market is approaching a stabilization floor driven by absorption of new purpose-built supply and reduced interprovincial migration flows.
          </Body>
          <Body>
            City-level divergence is widening. Toronto and Vancouver continue to lead the softening, while Calgary and Ottawa — where rents never corrected as sharply — remain supported by strong in-migration from eastern Canada. The RPI (Rent Pressure Index) spread between Calgary (34) and Vancouver (52) reflects a structural affordability gap that price movements alone cannot close.
          </Body>
          <Callout
            label="Lakive Interpretation:"
            text="The 22nd month of rent decline is a headline, but the moderation in pace matters more. If the BoC raises rates in October, developer financing costs rise, new starts slow, and the supply pipeline thins. The current rental softness is partly a supply story — and supply stories can reverse faster than demand stories. Renters who have been waiting for further drops may be approaching the strategic window."
            color={TEAL} bg="#F0FDFA"
          />
          <Callout
            label="⚠ Tariff risk:"
            text="US tariffs on Canadian goods have begun feeding through to construction material costs. If sustained, this pressures new housing starts — particularly in condo and purpose-built rental segments — which could support rents into 2027 even without a rate hike."
            color={AMBER} bg="#FFFBEB"
          />
        </div>

        {/* Housing */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={3} title="Housing Market & Lakive HPI" />
          <Source text="Source: CREA National Statistics, July 2026 (released Aug 15–18). Lakive Housing Years Index (HPI) reflects current model calculations." />
          <Body>
            The CREA national benchmark price settled at CAD $710,000 in July — roughly flat month-over-month and down 1.1% year-over-year. The market has not recovered to 2022 peak levels, but the rate of price decline has all but stopped. In Calgary, benchmark prices remain elevated on an annual basis, supported by continued in-migration. In Toronto and Vancouver, prices are stable but buyer confidence is fragile ahead of the October BoC decision.
          </Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Lakive City Scores — August 2026</h3>
          <CityScoreTable />
          <Callout
            label="Lakive Interpretation:"
            text="City scores are unchanged from July because the inputs that drive them — wages, home prices, provincial tax schedules — move slowly. What has changed is the risk environment. Calgary's structural advantages (no PST, lower benchmark price, diversifying labour market) become more valuable in a rising-rate scenario, not less. Workers on the fence about a Calgary relocation have more reason to act now, before any rate hike reprices mortgages."
            color={ORG} bg="#FFF7ED"
          />
        </div>

        {/* Employment */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={4} title="Employment Snapshot" />
          <Source text="Source: Statistics Canada LFS, August 2026 (released September 5, 2026)." />
          <Body>
            Canada's labour market shed 42,000 net jobs in August — ending a four-month run of positive growth. The unemployment rate held at 6.4%, but only because the participation rate fell: fewer people were actively looking for work. The employment rate dropped to 60.8%, its lowest reading since March 2026. Wage growth slowed sharply to +2.0% YoY — now below CPI at 3.0%, meaning real wages are declining for the first time since February 2026.
          </Body>
          <div style={{ paddingLeft: 16 }}>
            {[
              'Net employment change: −42,000 — the largest single-month decline since Q1 2025',
              'Unemployment rate: 6.4% (held) — masked by participation rate falling, not by job gains',
              'Employment rate: 60.8% (▼ from 61.1% in July)',
              'Weakest sectors: construction (−9,200), professional services (−6,800), manufacturing (−4,100)',
              'Relative resilience: healthcare and public administration — federal employment provided a partial floor',
              'Wages: average hourly earnings +2.0% YoY — now below CPI (3.0%) for the first time since Feb 2026',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, margin: '6px 0' }}>
                <span style={{ color: RED, fontWeight: 700, flexShrink: 0 }}>•</span>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>
          <Callout
            label="Lakive Interpretation:"
            text="The August employment reversal changes the affordability calculus in a specific way: wages are now growing slower than inflation, which means real purchasing power is declining across most occupations. Combined with the BoC's inflation warning and a potential October rate hike, this is the first month since the easing cycle began where all three affordability levers — wages, rates, and cost of living — are moving in the wrong direction simultaneously. The recovery remains real at the GDP level. It is no longer showing up in household finances."
            color={RED} bg="#FEF2F2"
          />
        </div>

        {/* Rates */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={5} title="Interest Rates & Inflation" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '4px 0 10px' }}>Bank of Canada — 2.25% (Held, September 2, 2026) ⚠</h3>
          <Body>
            The Bank of Canada held its overnight rate at 2.25% at the September 2 meeting — the seventh consecutive hold and the conclusion of what had been a broadly positive easing cycle since the 2023 peak of 5.0%. The hold itself was expected. What was not expected — or at least not priced in — was the explicit inflation warning accompanying the decision.
          </Body>
          <Body>
            The Bank flagged two upside risks to inflation: sustained US tariffs on Canadian goods feeding through to consumer prices, and energy price movements driven by Middle East supply uncertainty. The statement noted that if these pressures persist, "the Governing Council is prepared to adjust the policy rate upward." This is the first language of this type since the easing cycle began in June 2024.
          </Body>
          <Callout
            label="Lakive Interpretation:"
            text="The October 28 decision is now the defining event of the year. A hold at 2.25% confirms that the affordability improvement of the past 18 months persists. A hike — even 25 basis points to 2.50% — would add approximately $130/month to a $600K variable-rate mortgage and compress home affordability in every covered city. Workers and buyers who can lock in fixed rates before October 28 should consider doing so."
            color={RED} bg="#FEF2F2"
          />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 10px' }}>CPI Inflation — 3.0% (July 2026)</h3>
          <Body>
            July CPI rose to 3.0% — up from 2.8% in June — reversing six consecutive months of decline and moving away from the Bank's 2% target. The primary drivers were gasoline (+8.2% YoY, energy tariff pass-through), grocery prices (+3.8% YoY, tariff and logistics costs), and shelter costs (+4.1% YoY, still elevated). Core CPI, which strips out food and energy, held at 2.6% — still above target but more stable.
          </Body>
          <Callout
            label="Lakive Interpretation:"
            text="A single month of CPI increase does not constitute a trend, but the sources — tariffs and energy — are not transient. The BoC's concern is warranted. For workers budgeting a relocation, this is a signal to stress-test cost-of-living assumptions: the groceries-and-gas component of any city comparison is getting more expensive, not less, and the gap between high-cost and low-cost cities may widen further."
            color={AMBER} bg="#FFFBEB"
          />
        </div>

        {/* Insight of the Month */}
        <div style={{ background: NAVY, borderRadius: 14, padding: '28px 32px', marginBottom: 24, borderLeft: `5px solid ${AMBER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: AMBER, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Insight of the Month</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: AMBER, margin: '0 0 14px' }}>
            The Recovery Is Real. The Affordability Isn't.
          </h2>
          <p style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.75, margin: 0 }}>
            Canada's GDP is growing, rents have declined for 22 consecutive months, and the unemployment rate held at 6.4%. By every macro headline, the recovery is intact. But underneath: August saw 42,000 net job losses — the largest single-month decline in over a year. Wages grew just 2.0% YoY, now below CPI at 3.0%, meaning real purchasing power is falling again. The BoC issued an inflation warning on September 2. The recovery is real at the aggregate level. It is no longer reaching households. The divergence between what the numbers say and what people feel is not a perception problem — it is the data.
          </p>
        </div>

        {/* City Insights */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
          <SectionHeading num={6} title="Lakive City Insights" />
          <Body>Scores below are Lakive composite ratings (0–100) based on salary, housing affordability, tax burden, employment opportunity, and quality of life. Data version: Sep 2026 v1.</Body>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '20px 0 12px' }}>Cross-City Score: Key Occupations</h3>
          <OccTable />

          {[
            { city: 'Calgary', score: 74, rpi: 34, text: 'Calgary holds its position as top-scoring city for a fifth consecutive data version. In the context of the BoC inflation warning, the no-PST advantage is more meaningful than ever — a nurse earning $95,000 saves approximately $4,200 annually in provincial tax compared to an Ontario equivalent. At current mortgage rates, that saving covers 4–5 months of carrying costs on a Calgary starter home. If the BoC raises in October, Calgary\'s lower benchmark price ($595,000 vs. Toronto\'s $1.1M+) means the absolute dollar impact on monthly payments is proportionally smaller.' },
            { city: 'Ottawa', score: 68, rpi: 37, text: 'Ottawa continues to rank second nationally. Federal employment — which accounts for roughly 22% of the Ottawa CMA labour force — provides a structural floor against private-sector hiring volatility. For workers in healthcare, technology, and public administration, Ottawa offers the most recession-resistant employment base of any covered city. The tariff exposure is lower than Vancouver and Toronto, and wage growth in federal contracts tends to track CPI adjustments, offering partial inflation hedging.' },
            { city: 'Toronto', score: 60, rpi: 49, text: 'Toronto holds at 60 but the risk profile is elevated heading into Q4. The Rent Pressure Index of 49 — the second-highest of any covered city — and HPI of 9–13 years for most occupations leave little buffer if rates rise. The tech EOI of 92 remains a genuine advantage, and the August labour market data showed continued tech hiring. The critical unknown is whether US firms with Canadian tech operations absorb tariff costs or begin slowing hiring — Lakive will monitor Q3 tech employment specifically.' },
            { city: 'Vancouver', score: 59, rpi: 52, text: 'Vancouver carries the highest risk-adjusted affordability pressure of any covered city. The RPI of 52 is the national high, CREA benchmark prices remain above $1.2M, and the city\'s trade-exposed economy — forestry, commodities, Pacific container traffic — is more directly affected by US tariff regimes than any other Lakive city. For high-income specialists in tech and medicine, the quality-of-life premium justifies the cost. For most other workers, the October BoC decision matters more in Vancouver than anywhere else.' },
            { city: 'Montréal', score: 60, rpi: 34, text: 'Montréal ties Toronto on composite score (60) with a meaningfully different risk profile heading into Q4. The lower RPI (34) and home prices (CREA benchmark ~$575,000) provide a cushion against rate increases. The GST+QST burden remains the primary constraint on TAI (42). For French-speaking professionals — and increasingly for bilingual workers from across Canada — Montréal offers the strongest affordability-adjusted quality of life in the country. The city\'s exposure to tariff risk is moderate; manufacturing concentration makes it somewhat vulnerable but diversification into tech and life sciences provides offset.' },
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
          <Callout
            label="Key watch:"
            text="October 28 Bank of Canada decision is the most consequential event of Q4. Lakive will publish a rate-decision analysis immediately following the announcement. Subscribe to the newsletter for same-day coverage."
            color={RED} bg="#FEF2F2"
          />
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
