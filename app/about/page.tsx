export const metadata = {
  title: 'About Lakive — From Data to Belonging',
  description: 'To empower people to make smarter life decisions through transparent, trustworthy, and human-centered city intelligence.',
}

function Bilingual({ en, zh }: { en: string; zh: string }) {
  return (
    <p>
      {en}
      <span style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 6, lineHeight: 1.8 }}>{zh}</span>
    </p>
  )
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
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, fontWeight: 500 }}>每座城市都有它的故事。但不是每个故事，都属于你。</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.9 }}>

          {/* Opening */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Bilingual
              en="Every year, millions of people move to a new city in search of a better future. Some are looking for better careers. Others are seeking affordable housing, quality education, safer neighborhoods, or simply a place where their families can thrive."
              zh="每年，数百万人迁往一座新的城市，寻找更好的未来。有人追求更好的职业发展，有人寻找负担得起的住房、优质的教育、更安全的社区，或者只是一个家人能够安心生活的地方。"
            />
            <div>
              <p>Yet one question remains surprisingly difficult to answer:</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>然而有一个问题，始终出人意料地难以回答：</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '16px 0 4px', fontStyle: 'italic' }}>
                "Which city is truly right for me?"
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, fontStyle: 'italic' }}>"哪座城市，才真正适合我？"</p>
            </div>
            <Bilingual
              en="The internet offers endless rankings, travel guides, and cost-of-living calculators. But most of them describe cities in general — not how a city fits you. A city that is perfect for one person may be the wrong choice for another."
              zh="网上有无数排行榜、攻略和生活成本计算器。但它们描述的是城市的整体面貌——而不是这座城市是否适合你。对一个人来说完美的城市，对另一个人来说可能是错误的选择。"
            />
            <Bilingual
              en="At Lakive, we believe choosing a city is one of the most important decisions anyone can make. It shapes careers, finances, families, friendships, and ultimately, quality of life. That's why we built Lakive."
              zh="在 Lakive，我们相信选择一座城市是人生中最重要的决定之一。它决定了你的职业走向、财务状况、家庭生活、社交圈子，以及最终的生活品质。这就是我们创建 Lakive 的原因。"
            />
          </div>

          {/* Beyond cost of living */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Beyond Cost of Living</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 20 }}>不只是生活成本</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Bilingual
                en="Lakive goes beyond traditional city rankings. Instead of asking 'Which city is the best?', we ask: 'Which city is the best for someone like you?'"
                zh="Lakive 超越了传统的城市排名。我们不问'哪座城市最好'，我们问的是：'哪座城市最适合像你这样的人？'"
              />
              <Bilingual
                en="We combine data across housing, income, employment, transportation, healthcare, education, taxation, safety, climate, and other essential indicators to help people understand the real experience of living in a city — not just visiting one."
                zh="我们整合住房、收入、就业、交通、医疗、教育、税负、安全、气候等多项核心指标，帮助人们真正了解在一座城市生活的体验——而不只是旅游。"
              />
              <div>
                <Bilingual
                  en="Our goal isn't to tell you where to live."
                  zh="我们的目标不是告诉你该去哪里。"
                />
                <p style={{ color: 'white', fontWeight: 700, marginTop: 8 }}>Our goal is to help you make a better-informed decision.</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>我们的目标，是帮助你做出更明智的决定。</p>
              </div>
            </div>
          </div>

          {/* From Data to Belonging */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>From Data to Belonging</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 20 }}>从数据，到归属</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p>Data alone doesn't change lives. <strong style={{ color: 'white' }}>Better decisions do.</strong></p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>数据本身不能改变生活。<strong style={{ color: 'rgba(255,255,255,0.5)' }}>更好的决定才能。</strong></p>
              </div>
              <Bilingual
                en="Every chart, every comparison, and every report on Lakive is designed with one purpose: helping people find a place where they can build a meaningful future."
                zh="Lakive 上的每一张图表、每一次对比、每一份报告，都只有一个目的：帮助人们找到一个可以构建有意义未来的地方。"
              />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.85)' }}>Because the right city isn't simply where you earn more.</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 2 }}>因为最适合你的城市，不只是你收入最高的地方。</p>
                <p style={{ color: 'white', fontWeight: 700, marginTop: 12 }}>It's where you belong.</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 2 }}>而是你真正归属的地方。</p>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ color: '#4F8EF7', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our Mission · 使命</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, marginBottom: 10 }}>
                To empower people to make smarter life decisions through transparent, trustworthy, and human-centered city intelligence.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.7 }}>
                通过透明、可信、以人为本的城市数据智能，帮助每个人做出更明智的人生决策。
              </p>
            </div>
            <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our Vision · 愿景</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.8, marginBottom: 10 }}>
                To become the world's most trusted platform for understanding how cities fit different people — not just through data, but through real-life opportunities, experiences, and community.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.7 }}>
                成为全球最受信赖的城市匹配平台——不只靠数据，更通过真实的机遇、生活体验与社区连接，帮助人们找到属于自己的城市。
              </p>
            </div>
          </div>

          {/* Why Lakive */}
          <div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Why "Lakive"?</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 20 }}>为什么叫 Lakive？</p>
            <p style={{ marginBottom: 20 }}>
              Lakive is inspired by two simple ideas.
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4 }}>Lakive 源于两个简单的理念。</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '8px 0 20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#4F8EF7', fontWeight: 900, fontSize: 20, minWidth: 52 }}>Laki</span>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>represents <strong style={{ color: 'white' }}>Lucky</strong> — the belief that better decisions create more fortunate lives.</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>代表 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>幸运</strong>——相信更好的决定，能创造更幸运的人生。</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14B8A6', fontWeight: 900, fontSize: 20, minWidth: 52 }}>Live</span>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>represents <strong style={{ color: 'white' }}>the place where life happens.</strong></p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>代表 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>生活发生的地方。</strong></p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p>Together, Lakive reflects our belief that finding the right city isn't just about where you live. <strong style={{ color: 'white' }}>It's about where you can truly thrive.</strong></p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 6 }}>合在一起，Lakive 体现了我们的信念：找到合适的城市，不只是找一个住的地方，而是找到一个让你真正蓬勃生长的地方。</p>
            </div>
          </div>

        </div>

        {/* Closing */}
        <div style={{ marginTop: 64, textAlign: 'center', padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 12 }}>Lakive</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 6 }}>From Data to Belonging.</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 36 }}>从数据，到归属。</div>
          <a href="/calculate"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', color: 'white', padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            找到你的城市 →
          </a>
        </div>

      </div>
    </main>
  )
}
