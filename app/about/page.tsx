export const metadata = {
  title: 'About Lakive — From Data to Belonging',
  description: 'To empower people to make smarter life decisions through transparent, trustworthy, and human-centered city intelligence.',
}

export default function AboutPage() {
  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>About Lakive</div>
          <h1 style={{ color: 'white', fontSize: 40, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
            Every city tells a story.
          </h1>
          <h1 style={{ color: 'rgba(255,255,255,0.45)', fontSize: 40, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            But not every story is yours.
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.9 }}>

          {/* Opening */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p>Every year, millions of people move to a new city in search of a better future. Some are looking for better careers. Others are seeking affordable housing, quality education, safer neighborhoods, or simply a place where their families can thrive.</p>
            <div>
              <p>Yet one question remains surprisingly difficult to answer:</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '16px 0 4px', fontStyle: 'italic' }}>
                "Which city is truly right for me?"
              </p>
            </div>
            <p>The internet offers endless rankings, travel guides, and cost-of-living calculators. But most of them describe cities in general — not how a city fits <em>you</em>. A city that is perfect for one person may be the wrong choice for another.</p>
            <p>At Lakive, we believe choosing a city is one of the most important decisions anyone can make. It shapes careers, finances, families, friendships, and ultimately, quality of life. That's why we built Lakive.</p>
          </div>

          {/* Beyond cost of living */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Beyond Cost of Living</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>Lakive goes beyond traditional city rankings. Instead of asking "Which city is the best?", we ask: "Which city is the best for someone like you?"</p>
              <p>We combine data across housing, income, employment, transportation, healthcare, education, taxation, safety, climate, and other essential indicators to help people understand the real experience of living in a city — not just visiting one.</p>
              <div>
                <p>Our goal isn't to tell you where to live.</p>
                <p style={{ color: 'white', fontWeight: 700, marginTop: 8 }}>Our goal is to help you make a better-informed decision.</p>
              </div>
            </div>
          </div>

          {/* From Data to Belonging */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 20 }}>From Data to Belonging</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p>Data alone doesn't change lives. <strong style={{ color: 'white' }}>Better decisions do.</strong></p>
              </div>
              <p>Every chart, every comparison, and every report on Lakive is designed with one purpose: helping people find a place where they can build a meaningful future.</p>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.85)' }}>Because the right city isn't simply where you earn more.</p>
                <p style={{ color: 'white', fontWeight: 700, marginTop: 12 }}>It's where you belong.</p>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ color: '#4F8EF7', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our Mission</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
                To empower people to make smarter life decisions through transparent, trustworthy, and human-centered city intelligence.
              </p>
            </div>
            <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our Vision</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8 }}>
                To become the world's most trusted platform for understanding how cities fit different people — not just through data, but through real-life opportunities, experiences, and community.
              </p>
            </div>
          </div>

          {/* Why Lakive */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Why "Lakive"?</h2>
            <p style={{ marginBottom: 20 }}>
              Lakive is inspired by two simple ideas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '8px 0 20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#4F8EF7', fontWeight: 900, fontSize: 20, minWidth: 52 }}>Laki</span>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>represents <strong style={{ color: 'white' }}>Lucky</strong> — the belief that better decisions create more fortunate lives.</p>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14B8A6', fontWeight: 900, fontSize: 20, minWidth: 52 }}>Live</span>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>represents <strong style={{ color: 'white' }}>the place where life happens.</strong></p>
                </div>
              </div>
            </div>
            <p>Together, Lakive reflects our belief that finding the right city isn't just about where you live. <strong style={{ color: 'white' }}>It's about where you can truly thrive.</strong></p>
          </div>

        </div>

        {/* Closing */}
        <div style={{ marginTop: 64, textAlign: 'center', padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 12 }}>Lakive</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 36 }}>From Data to Belonging.</div>
          <a href="/calculate"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', color: 'white', padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Find Your City →
          </a>
        </div>

      </div>
    </main>
  )
}
