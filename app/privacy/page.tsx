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
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Effective date: June 26, 2026 · Last updated: June 27, 2026</p>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <Section title="1. Who We Are">
            Lakive ("we", "our", "us") operates lakive.com, a city intelligence platform that helps people make better relocation and city-living decisions through trusted data and personalized insights. We are committed to protecting your personal information and being transparent about how we use it.
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

          <Section title="4. Data Sources">
            Lakive's city insights are generated using publicly available datasets, licensed data where applicable, and internally developed analytical models. We source data from reputable public authorities including Statistics Canada, CMHC, CREA, CRA, Job Bank, and CIHI. We do not use any user-submitted personal data to build our city intelligence models.
          </Section>

          <Section title="5. Use of AI">
            Lakive uses AI-assisted tools to help generate city intelligence reports and data summaries. These tools process aggregated, non-personal data (city statistics, market data). Your personal information (email, occupation, etc.) is not fed into AI models. AI-assisted content is generated using structured datasets and standardized prompts. We continuously monitor and improve output quality, but users should independently verify important decisions.
          </Section>

          <Section title="6. Cookies">
            Lakive currently uses only essential technical cookies required for the website to function (e.g., session management by Next.js). If we introduce analytics or performance cookies in the future, we will update this policy and request consent where required by applicable law.
          </Section>

          <Section title="7. Analytics & Tracking">
            Lakive currently does <strong style={{ color: 'white' }}>not</strong> use Google Analytics, Microsoft Clarity, Facebook Pixel, or any third-party behavioral tracking tools. Your browsing activity on lakive.com is not shared with advertising networks.
          </Section>

          <Section title="8. Data Sharing & Sale">
            We do <strong style={{ color: 'white' }}>not</strong> sell, rent, or trade your personal information to any third party. We may share data with:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong style={{ color: 'white' }}>Resend</strong> (resend.com) — our email delivery provider, used solely to send your reports</li>
              <li><strong style={{ color: 'white' }}>Supabase</strong> — our database provider, used to store platform data securely</li>
              <li><strong style={{ color: 'white' }}>Vercel</strong> — our hosting provider</li>
            </ul>
            <br />
            All providers are contractually bound to process your data only as instructed.
          </Section>

          <Section title="9. International Data Transfers">
            Your information may be processed or stored in countries outside your place of residence by our trusted service providers (Vercel, Supabase, Resend). We take reasonable measures to ensure appropriate safeguards are in place to protect your personal information in accordance with applicable privacy laws.
          </Section>

          <Section title="10. Children's Privacy">
            Lakive is not intended for children under the age of 13, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.
          </Section>

          <Section title="11. Data Retention">
            We retain your subscription data for as long as you remain subscribed. You may unsubscribe at any time via the link in any email we send, after which your data will be marked inactive. You may request full deletion at any time by contacting us.
          </Section>

          <Section title="12. Your Rights">
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

          <Section title="13. Applicable Law">
            This policy is governed by Canada's <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA). Users in the European Economic Area are also protected under GDPR. Users in California are protected under CCPA.
          </Section>

          <Section title="14. Changes to This Policy">
            We may update this policy as our platform evolves. Material changes will be communicated via email to subscribers. Continued use of Lakive after changes constitutes acceptance.
          </Section>

          <Section title="15. Contact">
            Questions about this policy?
            <br /><br />
            Lakive<br />
            Email: <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a><br />
            Website: <a href="https://www.lakive.com" style={{ color: '#4F8EF7' }}>www.lakive.com</a>
          </Section>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 32, marginTop: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.8 }}>
              At Lakive, we believe trust begins with transparency. Protecting your personal information is part of our commitment to helping you make better life decisions.
            </p>
          </div>

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
