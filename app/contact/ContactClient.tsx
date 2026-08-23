'use client'
import SituationAdvisor from '@/components/SituationAdvisor'

const TAGS = ['Support', 'Business', 'Media', 'Privacy']

export default function ContactClient() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Contact</div>
          <h1 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 20, lineHeight: 1.15 }}>Get in Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.75, maxWidth: 480 }}>
            Whether you have a question, found a data issue, want to discuss a partnership, or simply have feedback — we'd love to hear from you.
          </p>
        </div>

        {/* AI quick-answer — resolves most city/data questions instantly */}
        <div style={{ marginBottom: 48, padding: '28px 28px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 20 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Have a city or career question?
          </div>
          <SituationAdvisor />
        </div>

        {/* Email card */}
        <a
          href="mailto:hello@lakive.com"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '28px 32px',
            textDecoration: 'none',
            marginBottom: 24,
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        >
          <div style={{ fontSize: 28 }}>✉️</div>
          <div>
            <div style={{ color: '#14B8A6', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>hello@lakive.com</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Typical response time: 1–2 business days</div>
          </div>
        </a>

        {/* Topic tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 56 }}>
          {TAGS.map(tag => (
            <a
              key={tag}
              href={`mailto:hello@lakive.com?subject=${encodeURIComponent(tag + ' — Lakive')}`}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#14B8A6'
                e.currentTarget.style.color = '#14B8A6'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              }}
            >
              {tag}
            </a>
          ))}
        </div>

        {/* Help improve box */}
        <div style={{
          background: 'rgba(20,184,166,0.06)',
          border: '1px solid rgba(20,184,166,0.18)',
          borderRadius: 20,
          padding: '28px 32px',
        }}>
          <div style={{ color: '#14B8A6', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Help Improve Lakive</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              'Found incorrect data?',
              'Want us to add your city?',
              'Have an idea to make Lakive better?',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
                <span style={{ color: '#14B8A6', fontSize: 12 }}>→</span>
                {item}
              </div>
            ))}
          </div>
          <a
            href="mailto:hello@lakive.com?subject=Feedback%20%E2%80%94%20Lakive"
            style={{ color: '#14B8A6', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Email us anytime →
          </a>
        </div>

      </div>
    </main>
  )
}
