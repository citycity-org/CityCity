import type { ReactNode } from 'react'

export const metadata = {
  title: 'Disclaimer — Lakive',
  description: 'Important disclaimers about Lakive data and city rankings.',
}

export default function DisclaimerPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Legal</div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Disclaimer</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Effective date: June 26, 2026 · Last updated: June 27, 2026</p>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <Section title="Informational Purpose Only">
            Lakive provides city intelligence data, scores, and rankings for <strong style={{ color: 'white' }}>informational and educational purposes only</strong>. The content on lakive.com does not constitute and should not be interpreted as professional advice of any kind.
          </Section>

          <Section title="Not Financial or Investment Advice">
            Nothing on Lakive constitutes financial or investment advice. City affordability scores, housing cost estimates, and salary data are analytical summaries based on public data sources. They do not represent personalized financial guidance. Consult a licensed financial advisor before making investment or major financial decisions.
          </Section>

          <Section title="Not Immigration or Legal Advice">
            Lakive does not provide immigration advice, legal counsel, or visa guidance. City suitability scores are general comparisons based on publicly available data and do not account for individual immigration eligibility, legal status, or specific circumstances. Consult a licensed immigration consultant or lawyer for personalized guidance.
          </Section>

          <Section title="Not Real Estate Advice">
            Housing price data and affordability estimates on Lakive are derived from public market data (CREA, CMHC) and are approximations. They do not represent current listing prices, guarantees of future value, or personalized real estate recommendations. Consult a licensed real estate professional for property-specific advice.
          </Section>

          <Section title="Not Employment Guarantees">
            Job market scores and salary estimates are based on national and regional averages from public sources (Statistics Canada, Job Bank). Individual earnings vary significantly by experience, qualifications, employer, and market conditions. Lakive makes no guarantee of employment outcomes.
          </Section>

          <Section title="Data Accuracy">
            While Lakive strives to maintain accurate, up-to-date information from reputable public sources (Statistics Canada, CMHC, CREA, CRA, CIHI, Job Bank), we cannot guarantee the absolute accuracy, completeness, or timeliness of any data. Data reflects conditions at the time of collection and may not reflect real-time changes. For decisions involving significant financial, legal, educational, or relocation commitments, users should verify information with official or primary sources.
          </Section>

          <Section title="AI-Assisted Content">
            Some reports, summaries, or explanations on Lakive may be generated or assisted by artificial intelligence. While we strive to ensure accuracy through structured data and quality review processes, AI-assisted content may contain errors or omissions and should not be relied upon as the sole basis for important decisions. Users are encouraged to cross-reference AI-generated insights with official sources and qualified professionals.
          </Section>

          <Section title="City Rankings Are Estimates">
            Lakive's composite city scores and rankings are proprietary analytical tools designed to assist in comparative decision-making. They are not official government rankings and should not be interpreted as definitive assessments of any city. Different users may reasonably reach different conclusions based on their personal priorities, values, occupations, and life circumstances.
          </Section>

          <Section title="Contact">
            Questions? Email us at <a href="mailto:hello@lakive.com" style={{ color: '#4F8EF7' }}>hello@lakive.com</a>.
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
