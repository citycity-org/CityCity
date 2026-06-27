import type { ReactNode } from 'react'

export const metadata = {
  title: 'Terms of Service — Lakive',
  description: 'Terms and conditions for using Lakive.',
}

export default function TermsPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Legal</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Effective date: June 26, 2026 · Last updated: June 27, 2026</p>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <Section title="1. Acceptance of Terms">
            By accessing or using Lakive ("the Platform"), including lakive.com and any related services, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
          </Section>

          <Section title="2. Use of the Platform">
            Lakive grants you a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes, unless otherwise expressly authorized by Lakive in writing. You agree to use the Platform only for lawful purposes and in accordance with these Terms.
          </Section>

          <Section title="3. Prohibited Activities">
            You may <strong style={{ color: 'white' }}>not</strong>:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Copy, reproduce, scrape, crawl, or redistribute any Lakive content, data, rankings, scores, or reports without explicit written permission</li>
              <li>Use automated tools (bots, scrapers, crawlers) to access the Platform</li>
              <li>Reverse-engineer, decompile, or extract our scoring methodologies, algorithms, or data models</li>
              <li>Use the Platform to build a competing product or service</li>
              <li>Misrepresent data sourced from Lakive without attribution</li>
              <li>Interfere with the security or integrity of the Platform</li>
              <li>Attempt to bypass subscription, payment, or access restrictions</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            All content on Lakive — including but not limited to the Lakive name, logo, city scores, proprietary scoring methodologies, analytical frameworks, composite indices, city intelligence reports, data visualizations, and AI-assisted analysis — is the exclusive intellectual property of Lakive.
            <br /><br />
            The names, structures, presentation, and methodologies of Lakive's proprietary scores, indices, and analytical models are protected intellectual property. Unauthorized reproduction of our scoring systems or analytical frameworks — in whole or in part — is strictly prohibited, regardless of whether the underlying data sources are public.
            <br /><br />
            © 2026 Lakive. All Rights Reserved.
            <br /><br />
            Unauthorized reproduction or distribution of any Lakive content is strictly prohibited and may result in legal action.
          </Section>

          <Section title="5. Informational Purpose Only">
            The Platform provides city intelligence data for <strong style={{ color: 'white' }}>informational purposes only</strong>. Nothing on Lakive constitutes:
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Investment or financial advice</li>
              <li>Immigration advice or legal counsel</li>
              <li>Real estate recommendations</li>
              <li>Employment guarantees</li>
            </ul>
            <br />
            City rankings, scores, and estimates are analytical tools to assist decision-making, not definitive guidance. Lakive does not guarantee that any particular city, occupation, or relocation decision will result in financial, professional, or personal outcomes. Always consult qualified professionals for major life decisions.
          </Section>

          <Section title="6. Data Accuracy">
            Lakive strives to maintain accurate, up-to-date data sourced from public authorities including, but not limited to, Statistics Canada, CMHC, CREA, CRA, Job Bank, and CIHI. However, we do not guarantee the absolute accuracy, completeness, or timeliness of any data. Data is provided "as is" and may not reflect real-time market conditions.
          </Section>

          <Section title="7. AI-Assisted Content">
            Certain reports or summaries on the Platform may be generated or assisted by artificial intelligence. While we strive to ensure quality, AI-assisted content may contain errors or omissions and should not be relied upon as the sole basis for important decisions. AI tools process aggregated public data only — your personal information is never used to train or prompt AI models.
          </Section>

          <Section title="8. Subscription & Email">
            By subscribing to Lakive reports, you consent to receive periodic email communications. You may unsubscribe at any time. We reserve the right to modify or discontinue the subscription service at any time with reasonable notice.
          </Section>

          <Section title="9. Limitation of Liability">
            To the maximum extent permitted by applicable law, Lakive shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including decisions made based on Lakive data or rankings.
          </Section>

          <Section title="10. User Responsibility">
            You are solely responsible for any decisions you make based on information provided by Lakive. We encourage you to verify data independently and consult appropriate professionals before making relocation, investment, or career decisions.
          </Section>

          <Section title="11. Termination">
            We reserve the right to suspend or terminate access to the Platform for users who violate these Terms or engage in activities that may harm Lakive or other users, including but not limited to unauthorized scraping, abuse of access restrictions, or interference with Platform security. Termination may occur without prior notice.
          </Section>

          <Section title="12. Modifications">
            We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
          </Section>

          <Section title="13. Governing Law">
            These Terms are governed by the laws of the Province of British Columbia and the applicable federal laws of Canada. Any disputes shall be resolved in the courts of British Columbia, Canada.
          </Section>

          <Section title="14. Contact">
            Questions about these Terms?
            <br /><br />
            Lakive<br />
            Email: <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a><br />
            Website: <a href="https://www.lakive.com" style={{ color: '#4F8EF7' }}>www.lakive.com</a>
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
