import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Newsletter · Lakive City Intelligence',
  description: 'Quarterly and monthly city intelligence reports — personalised to your city and occupation. Free.',
}

// ── Sample report data (Calgary × Software Engineer) ──────────────────────
const SAMPLE = {
  city: 'Calgary',
  occ: 'Software Engineer',
  quarter: 'Q2 2026',
  hpiYears: 14.2,
  hpiDelta: -0.8,
  rpi: 28.4,
  rpiDelta: +1.1,
  eoi: 89,
  eoiDelta: +2,
  medianRent: 1980,
  rentDelta: +3.2,
  insights: [
    { icon: '🏠', label: 'Housing affordability improved', detail: 'HPI Years dropped 0.8 — equivalent to ~$6K less pressure on your deposit timeline.' },
    { icon: '💼', label: 'Tech hiring accelerated', detail: 'Software engineering postings up 14% QoQ as three fintech firms expanded Calgary operations.' },
    { icon: '📉', label: 'Rent growth slowing', detail: 'New purpose-built supply came online in Beltline; 2BR asking rents softened 1.4% from Q1 peak.' },
    { icon: '⚖️', label: 'Tax advantage intact', detail: 'Alberta\'s 0% provincial income tax continues to deliver ~$8–11K annual take-home advantage vs. Ontario peers.' },
  ],
}

function StatPill({ label, value, delta, unit = '' }: { label: string; value: string | number; delta?: number; unit?: string }) {
  const dir = delta !== undefined ? (delta > 0 ? '▲' : '▼') : null
  const col = delta !== undefined ? (delta > 0 ? '#34D399' : '#F87171') : 'rgba(255,255,255,0.55)'
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px' }}>
      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: 'white', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}{unit}</span>
        {dir && delta !== undefined && (
          <span style={{ color: col, fontSize: 12, fontWeight: 700 }}>{dir} {Math.abs(delta)}{unit}</span>
        )}
      </div>
    </div>
  )
}

export default function NewsletterPage() {
  const accent = '#4F8EF7'

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', color: 'white' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg,#0d1117 0%,#111827 55%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.25)', marginBottom: 24 }}>
          <span style={{ fontSize: 13 }}>📬</span>
          <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>FREE NEWSLETTER</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          City intelligence,<br />
          <span style={{ color: accent }}>personalised to your career</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 16, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
          Quarterly deep-dives and monthly briefs on housing, income, and job markets —
          tailored to your city and occupation. In English or 中文.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/subscribe" style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Subscribe free →
          </Link>
          <a href="#sample" style={{ padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            See a sample issue ↓
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 20 }}>No credit card · No ads · Unsubscribe anytime</p>
      </section>

      {/* ── Two products ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Two ways to stay informed</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.42)', fontSize: 14, marginBottom: 40 }}>Choose the cadence that fits your decision-making</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>

          {/* Quarterly */}
          <div style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.22)', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 800, color: 'white', padding: '3px 10px', borderRadius: 20, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', letterSpacing: '0.05em' }}>RECOMMENDED</div>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Quarterly City Intelligence Report</h3>
            <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              A comprehensive look at what happened in your city over the past quarter — housing affordability shifts, income trends, job market signals — and what it means for your specific profession.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              {[
                'HPI Years movement & interpretation',
                'Rent-to-income ratio trend',
                'Occupation-specific job market signal',
                'Cross-city comparison snapshot',
                'Editor\'s outlook for next quarter',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#4F8EF7', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, color: '#93C5FD', fontSize: 13, fontWeight: 700 }}>4 issues per year · Free</div>
          </div>

          {/* Monthly */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Monthly City Brief</h3>
            <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              A lightweight pulse check on your city — what moved in home prices, rents, and the job market this month. Fast to read, data-first, no fluff.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              {[
                'Month-over-month HPI change',
                'Median rent update',
                'Top employment signals',
                'One chart worth sharing',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#14B8A6', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, color: '#5EEAD4', fontSize: 13, fontWeight: 700 }}>12 issues per year · Free</div>
          </div>
        </div>
      </section>

      {/* ── Personalisation callout ──────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(20,184,166,0.04)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Not generic. Built for your profile.</h2>
          <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
            Every report is generated from your <strong style={{ color: 'rgba(255,255,255,0.80)' }}>city + occupation</strong> combination.
            A nurse in Calgary sees different data than a software engineer in Vancouver —
            because the housing affordability, income ratio, and job market signals that matter
            are different for each profession.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            {[
              { city: 'Vancouver', occ: 'Nurse', color: '#93C5FD' },
              { city: 'Calgary', occ: 'Software Engineer', color: '#5EEAD4' },
              { city: 'Toronto', occ: 'Lawyer', color: '#C4B5FD' },
              { city: 'Seattle', occ: 'Data Analyst', color: '#FDE68A' },
            ].map(p => (
              <div key={p.city + p.occ} style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', fontSize: 13 }}>
                <span style={{ color: p.color, fontWeight: 700 }}>{p.city}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 6px' }}>×</span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>{p.occ}</span>
              </div>
            ))}
            <div style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              + 24 occupations · 9 cities
            </div>
          </div>
        </div>
      </section>

      {/* ── Sample Issue ─────────────────────────────────────────────────── */}
      <section id="sample" style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Sample issue</h2>
          <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13 }}>Quarterly City Intelligence Report · {SAMPLE.city} × {SAMPLE.occ} · {SAMPLE.quarter}</p>
        </div>

        {/* Report card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 24, overflow: 'hidden' }}>

          {/* Report header */}
          <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(79,142,247,0.08),rgba(91,92,240,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Quarterly City Intelligence Report
                </div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {SAMPLE.city}
                  <span style={{ color: 'rgba(255,255,255,0.30)', margin: '0 8px', fontWeight: 400 }}>×</span>
                  <span style={{ color: '#93C5FD' }}>{SAMPLE.occ}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginBottom: 4 }}>Period</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{SAMPLE.quarter}</div>
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Key Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              <StatPill label="HPI Years" value={SAMPLE.hpiYears} delta={SAMPLE.hpiDelta} />
              <StatPill label="Rent-to-Income %" value={SAMPLE.rpi} delta={SAMPLE.rpiDelta} unit="%" />
              <StatPill label="Employment Index" value={SAMPLE.eoi} delta={SAMPLE.eoiDelta} />
              <StatPill label="Median 1BR Rent" value={`$${SAMPLE.medianRent.toLocaleString()}`} delta={SAMPLE.rentDelta} unit="%" />
            </div>
          </div>

          {/* Insights */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
              What changed this quarter
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SAMPLE.insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{ins.icon}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{ins.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 1.6 }}>{ins.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blurred section teaser */}
          <div style={{ padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Editor&apos;s Outlook · Q3 2026</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.75 }}>
                Calgary&apos;s housing market is showing early signs of stabilisation after 18 months of compression.
                For software engineers, the Q3 window represents the most favourable entry point since 2023.
                Our forward model suggests HPI Years will decline a further 0.4–0.9 points if interest rate
                trajectories hold and new condo completions continue on schedule.
                The key risk is oil sector volatility amplifying local employment sensitivity...
              </div>
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, transparent 0%, rgba(13,17,23,0.5) 40%, rgba(13,17,23,0.9) 100%)' }}>
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Full outlook in subscriber reports</div>
                <Link href="/subscribe" style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Subscribe free →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Language section ─────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20, fontSize: 32 }}>
            <span>🇨🇦</span><span>🇨🇳</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Available in English and 中文</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.75 }}>
            Reports are published in full in both languages. Choose your language at sign-up — or subscribe to both.
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.10),rgba(91,92,240,0.08))', borderTop: '1px solid rgba(79,142,247,0.20)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Start reading smarter about cities
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 32px' }}>
          Pick your city and occupation. We&apos;ll deliver the data that actually matters to you — quarterly or monthly, free.
        </p>
        <Link href="/subscribe" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 14, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 16, fontWeight: 800, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Subscribe — it&apos;s free →
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 16 }}>
          9 cities · 24+ occupations · English & 中文
        </p>
      </section>

    </main>
  )
}
