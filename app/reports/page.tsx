import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'City Fit Reports · Lakive',
  description: 'Data-driven reports on how cities fit real people — by occupation, income, housing goals, family situation, and long-term financial outcomes.',
}

// ── Report catalogue ──────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'annual-index',
    icon: '📊',
    label: 'Annual Index',
    color: '#4F8EF7',
    bg: 'rgba(79,142,247,0.08)',
    border: 'rgba(79,142,247,0.22)',
    desc: 'Our annual occupation–city index comparing affordability, after-tax income, rent pressure, and job-market signals across major North American cities.',
  },
  {
    id: 'issue-briefs',
    icon: '📋',
    label: 'Issue Briefs',
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.08)',
    border: 'rgba(20,184,166,0.22)',
    desc: 'Short reports on timely city questions, affordability pressure, livability contradictions, and relocation trends.',
  },
  {
    id: 'newcomer-guides',
    icon: '🧭',
    label: 'Newcomer Guides',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.22)',
    desc: 'Practical financial survival guides for newcomers evaluating where to land, rent, work, and build stability.',
  },
  {
    id: 'canada-vs-us',
    icon: '🌐',
    label: 'Canada vs. U.S.',
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.22)',
    desc: 'Cross-border comparisons showing how the same career can lead to very different financial outcomes in Canadian and American cities.',
  },
]

const COMING_SOON = [
  {
    category: 'Annual Index',
    categoryColor: '#4F8EF7',
    title: '2026 Lakive City Fit Index',
    subtitle: 'Occupation-Based Affordability Rankings Across 9 Cities',
    tags: ['All Cities', 'All Occupations'],
    quarter: 'Q3 2026',
  },
  {
    category: 'Newcomer Guide',
    categoryColor: '#A78BFA',
    title: "Newcomer's Financial Survival Guide: Toronto vs. Vancouver",
    subtitle: 'Where to Land First — Rent, Income, and Your First Year',
    tags: ['Toronto', 'Vancouver', 'Newcomers'],
    quarter: 'Q3 2026',
  },
  {
    category: 'Canada vs. U.S.',
    categoryColor: '#FB923C',
    title: 'The Remote Worker City Arbitrage',
    subtitle: 'Earning USD, Living in Canada — How Much Better Off Are You?',
    tags: ['Remote Work', 'Cross-Border', 'Tech'],
    quarter: 'Q4 2026',
  },
  {
    category: 'Issue Brief',
    categoryColor: '#14B8A6',
    title: "Calgary's Quiet Advantage",
    subtitle: "How Alberta's Tax Gap Creates a Hidden Income Premium for Skilled Workers",
    tags: ['Calgary', 'Tax', 'After-Tax Income'],
    quarter: 'Q4 2026',
  },
]

function Tag({ label, color = 'rgba(255,255,255,0.50)', bg = 'rgba(255,255,255,0.07)' }: { label: string; color?: string; bg?: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  )
}

export default function ReportsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0d1117', color: 'white' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px 56px', background: 'linear-gradient(160deg,#0d1117 0%,#111827 60%,#1a2035 100%)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.25)', marginBottom: 24 }}>
            <span style={{ fontSize: 12 }}>📑</span>
            <span style={{ color: '#93C5FD', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>LAKIVE CITY FIT REPORTS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 900, margin: '0 0 18px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Data-driven reports on how<br />
            <span style={{ color: '#4F8EF7' }}>cities fit real people</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 15, lineHeight: 1.8, maxWidth: 620, margin: '0 0 28px' }}>
            By occupation, income, housing goals, family situation, and long-term financial outcomes.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.8, maxWidth: 620, margin: 0 }}>
            Generic livability rankings show how cities perform in general. Lakive reports go deeper.
            We analyze whether a city actually works for specific workers, newcomers, families, and
            professionals comparing life across Canada and the U.S.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Latest Report ─────────────────────────────────────────────── */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            Latest Report
          </div>

          <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(20,184,166,0.05))', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 24, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0 }}>
              <div style={{ width: 5, background: 'linear-gradient(to bottom,#EF4444,#14B8A6)', borderRadius: '4px 0 0 4px' }} />
              <div style={{ padding: '36px 36px 32px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                  <Tag label="National Report" color="#EF4444" bg="rgba(239,68,68,0.10)" />
                  <Tag label="5 Cities" color="#93C5FD" bg="rgba(79,142,247,0.10)" />
                  <Tag label="20 Occupations" color="#93C5FD" bg="rgba(79,142,247,0.10)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginLeft: 4 }}>July 2026</span>
                </div>
                <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, lineHeight: 1.25, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                  Canada&apos;s Cities on the Rise 2026 —<br />
                  Beyond Job Growth: Where Can You Actually Build a Life?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.75, maxWidth: 600, margin: '0 0 28px' }}>
                  A Lakive national report analyzing Vancouver, Toronto, Calgary, Montréal, and Ottawa across
                  Employment Opportunity Index, housing affordability, and City Fit Score — broken down by
                  occupation. Which city is actually rising for which workers, and why that matters for anyone
                  planning a career move in 2026.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.25)', color: '#14B8A6', fontSize: 12, fontWeight: 700 }}>
                    ✓ Published July 2026
                  </span>
                  <Link href="/reports/canada-cities-on-the-rise-2026" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 12, background: 'linear-gradient(135deg,#EF4444,#E86C2F)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Read report →
                  </Link>
                  <a href="/reports/pdf/Lakive_Canada_Cities_on_the_Rise_2026.pdf" download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    ↓ PDF
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20, marginTop: 40 }}>
            Also Published
          </div>

          <div style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.08),rgba(91,92,240,0.05))', border: '1px solid rgba(79,142,247,0.22)', borderRadius: 24, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0 }}>

              {/* Left accent bar */}
              <div style={{ width: 5, background: 'linear-gradient(to bottom,#4F8EF7,#5B5CF0)', borderRadius: '4px 0 0 4px' }} />

              {/* Content */}
              <div style={{ padding: '36px 36px 32px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                  <Tag label="Issue Brief" color="#14B8A6" bg="rgba(20,184,166,0.10)" />
                  <Tag label="Vancouver" color="#93C5FD" bg="rgba(79,142,247,0.10)" />
                  <Tag label="All Occupations" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginLeft: 4 }}>2026</span>
                </div>

                <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, lineHeight: 1.25, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                  Vancouver Is a Top-10 Livable City —<br />
                  But Can Local Workers Afford to Stay?
                </h2>

                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.75, maxWidth: 600, margin: '0 0 28px' }}>
                  A Lakive issue brief comparing global livability rankings with occupation-based housing
                  affordability, rent pressure, and after-tax income for local workers. When the EIU ranks
                  Vancouver #9 in the world — what does that mean for a nurse earning $95K? A teacher on $72K?
                  A newcomer starting their first job?
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.25)', color: '#14B8A6', fontSize: 12, fontWeight: 700 }}>
                    ✓ Published H1 2026
                  </span>
                  <Link href="/reports/vancouver-livability-worker-affordability-2026" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Read report →
                  </Link>
                  <a href="/reports/pdf/Lakive_Vancouver_Worker_Affordability_Issue_Brief_H1_2026.pdf" download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    ↓ PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Report Categories ─────────────────────────────────────────── */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            Report Categories
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={{ background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 18, padding: '22px 24px' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{cat.icon}</div>
                <div style={{ color: cat.color, fontSize: 13, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em' }}>{cat.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, lineHeight: 1.7 }}>{cat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Coming Soon reports ───────────────────────────────────────── */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Upcoming Reports
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>2026 pipeline</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {COMING_SOON.map((r, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.categoryColor, background: `${r.categoryColor}15`, padding: '3px 10px', borderRadius: 20 }}>
                    {r.category}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{r.quarter}</span>
                </div>

                <div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 800, lineHeight: 1.35, marginBottom: 6 }}>{r.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.6 }}>{r.subtitle}</div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {r.tags.map(t => <Tag key={t} label={t} />)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 12 }}>🔔</span>
                  <Link href="/subscribe" style={{ color: 'rgba(255,255,255,0.40)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    Get notified
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Methodology ───────────────────────────────────────────────── */}
        <section style={{ padding: '56px 0 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 40px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🔬</span>
                <span style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>Built on Transparent Methodology</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8, margin: '0 0 12px' }}>
                Lakive reports combine public data sources, occupation-level income benchmarks, after-tax income
                estimates, housing affordability metrics, rent pressure, job-market signals, and structured
                resident experience data where available.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                Cities, employers, or institutions <strong style={{ color: 'rgba(255,255,255,0.65)' }}>cannot</strong> buy better scores, suppress unfavorable findings,
                or influence Lakive&apos;s methodology.
              </p>
            </div>
            <Link href="/guide" style={{ flexShrink: 0, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              View data →
            </Link>
          </div>
        </section>

        {/* ── Newsletter CTA ────────────────────────────────────────────── */}
        <section style={{ padding: '56px 0 72px' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.10),rgba(91,92,240,0.07))', border: '1px solid rgba(79,142,247,0.22)', borderRadius: 24, padding: '44px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Get Future Reports</h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 28px' }}>
              Subscribe to receive Lakive&apos;s monthly City Fit Brief, new report releases, and
              Canada vs. U.S. city comparison insights.
            </p>
            <Link href="/subscribe" style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
              Subscribe free →
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, marginTop: 16 }}>
              Free · No ads · Unsubscribe anytime
            </p>
          </div>
        </section>

      </div>
    </main>
  )
}
