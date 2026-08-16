import { MarketPulse } from '@/components/MarketPulse'
import Link from 'next/link'

export const metadata = {
  title: 'Market Pulse · Lakive',
  description: 'Real-time macro indicators — Bank of Canada rate, CPI, unemployment — and their impact on housing affordability in Canada and the United States.',
}

export default function PulsePage() {
  return (
    <div style={{ background: '#04091a', minHeight: '100vh' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px 0', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.30)', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>Market Pulse</span>
        </div>
      </div>

      {/* ── Full Market Pulse widget ─────────────────────────────────────────── */}
      <MarketPulse />

      {/* ── Context footer ───────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16, marginTop: 8,
          }}>
            <ContextCard
              icon="📅"
              title="Update Schedule"
              body="BoC policy rate and CA CPI/unemployment are fetched live — no manual updates needed. StatsCan figures refresh automatically within hours of each official release. US figures (Fed rate, BLS CPI, BLS unemployment) are updated manually after each release."
            />
            <ContextCard
              icon="🏠"
              title="How This Affects Scores"
              body="Lakive city scores (HPI Years, RPI) are based on CREA, CMHC, and Rentals.ca data and are updated on a separate calendar. Macro indicators provide economic context and do not automatically change individual city scores."
            />
            <ContextCard
              icon="📊"
              title="Coming in Phase 2"
              body="Automated news digests from official central bank and statistics agency sources — Bank of Canada announcements, FOMC statements, and StatCan LFS releases — will appear here."
            />
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/ranking" style={{
              display: 'inline-block', padding: '12px 24px', borderRadius: 12,
              background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.28)',
              color: '#93C5FD', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              See how this affects city rankings →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ContextCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)' }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 1.65, margin: 0 }}>{body}</p>
    </div>
  )
}
