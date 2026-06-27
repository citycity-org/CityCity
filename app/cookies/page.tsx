import type { ReactNode } from 'react'

export const metadata = {
  title: 'Cookie Policy — Lakive',
  description: 'How Lakive uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Legal</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Cookie Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Effective date: June 26, 2026 · Last updated: June 26, 2026</p>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <Section title="1. What Are Cookies">
            Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and function correctly.
          </Section>

          <Section title="2. Cookies We Use">
            Lakive uses only <strong style={{ color: 'white' }}>essential technical cookies</strong> required for the website to function:
            <br /><br />
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>Session cookies (Next.js)</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Used to maintain basic website functionality. Expire when you close your browser. No personal data is stored.</div>
            </div>
          </Section>

          <Section title="3. What We Do NOT Use">
            Lakive does <strong style={{ color: 'white' }}>not</strong> currently use:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Google Analytics or Google Tag Manager</li>
              <li>Microsoft Clarity or Hotjar</li>
              <li>Facebook Pixel or any Meta tracking</li>
              <li>Advertising or retargeting cookies</li>
              <li>Cross-site tracking technologies</li>
            </ul>
            <br />
            Your browsing behavior on Lakive is not tracked or shared with advertising networks.
          </Section>

          <Section title="4. Future Changes">
            If we introduce analytics or other cookie-based tools in the future, we will update this policy and provide appropriate notice to users. Where required by law, we will obtain your consent before setting non-essential cookies.
          </Section>

          <Section title="5. How to Control Cookies">
            You can control and delete cookies through your browser settings. Disabling essential cookies may affect the functionality of the Platform. Most browsers allow you to:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>View cookies stored on your device</li>
              <li>Block cookies from specific sites</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
          </Section>

          <Section title="6. Contact">
            Questions about our cookie practices? Email us at <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a>.
          </Section>

        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
      <div>{children}</div>
    </div>
  )
}
