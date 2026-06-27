import type { ReactNode } from 'react'

export const metadata = {
  title: 'Privacy Policy — Lakive',
  description: 'How Lakive collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Legal</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Effective date: June 26, 2026 · Last updated: June 26, 2026</p>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <Section title="1. Who We Are">
            Lakive ("we", "our", "us") operates lakive.com, a city intelligence platform that helps immigrants and newcomers make data-driven relocation decisions in Canada. We are committed to protecting your personal information and being transparent about how we use it.
            <br /><br />
            Contact: <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a>
          </Section>

          <Section title="2. Information We Collect">
            When you subscribe to our city reports, we collect:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong style={{ color: 'white' }}>Email address</strong> — to deliver your personalized reports</li>
              <li><strong style={{ color: 'white' }}>City preference</strong> — to customize your report content</li>
              <li><strong style={{ color: 'white' }}>Occupation</strong> — to calculate job market and income data relevant to you</li>
              <li><strong style={{ color: 'white' }}>Property type preference</strong> — to tailor housing cost estimates</li>
              <li><strong style={{ color: 'white' }}>Report frequency preference</strong> — monthly or quarterly</li>
            </ul>
            <br />
            We also collect standard server logs (IP address, browser type, pages visited, timestamps) for security and performance purposes. This data is not linked to your identity.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your information to:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Generate and deliver personalized city intelligence reports to your email</li>
              <li>Improve our data models and platform features</li>
              <li>Communicate product updates that are directly relevant to your subscription</li>
              <li>Comply with legal obligations</li>
            </ul>
            <br />
            We do <strong style={{ color: 'white' }}>not</strong> use your data for advertising, profiling, or automated decision-making that produces legal effects.
          </Section>

          <Section title="4. Cookies">
            Lakive uses only essential technical cookies required for the website to function (e.g., session management by Next.js). We do <strong style={{ color: 'white' }}>not</strong> use advertising cookies, tracking pixels, or third-party analytics cookies at this time.
            <br /><br />
            If we introduce analytics tools in the future, we will update this policy and provide appropriate notice.
          </Section>

          <Section title="5. Analytics & Tracking">
            Lakive currently does <strong style={{ color: 'white' }}>not</strong> use Google Analytics, Microsoft Clarity, Facebook Pixel, or any third-party behavioral tracking tools. Your browsing activity on lakive.com is not shared with advertising networks.
          </Section>

          <Section title="6. Use of AI">
            Lakive uses AI-assisted tools to help generate city intelligence reports and data summaries. These tools process aggregated, non-personal data (city statistics, market data). Your personal information (email, occupation, etc.) is not fed into AI models. AI-generated content is reviewed for accuracy before publication.
          </Section>

          <Section title="7. Data Sharing & Sale">
            We do <strong style={{ color: 'white' }}>not</strong> sell, rent, or trade your personal information to any third party. We may share data with:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong style={{ color: 'white' }}>Resend</strong> (resend.com) — our email delivery provider, used solely to send your reports</li>
              <li><strong style={{ color: 'white' }}>Supabase</strong> — our database provider, used to store platform data securely</li>
              <li><strong style={{ color: 'white' }}>Vercel</strong> — our hosting provider</li>
            </ul>
            <br />
            All providers are contractually bound to process your data only as instructed.
          </Section>

          <Section title="8. Data Retention">
            We retain your subscription data for as long as you remain subscribed. You may unsubscribe at any time via the link in any email we send, after which your data will be marked inactive. You may request full deletion at any time by contacting us.
          </Section>

          <Section title="9. Your Rights">
            Depending on your location, you may have the right to:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <br />
            To exercise any right, email us at <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a>. We will respond within 30 days.
          </Section>

          <Section title="10. Applicable Law">
            This policy is governed by Canada's <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA). Users in the European Economic Area are also protected under GDPR. Users in California are protected under CCPA.
          </Section>

          <Section title="11. Changes to This Policy">
            We may update this policy as our platform evolves. Material changes will be communicated via email to subscribers. Continued use of Lakive after changes constitutes acceptance.
          </Section>

          <Section title="12. Contact">
            Questions about this policy? Contact us at <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a>.
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
