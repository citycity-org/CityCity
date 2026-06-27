'use client'
import LakiveLogo from './LakiveLogo'

const NAV = [
  {
    title: '产品',
    links: [
      { label: '算成本', href: '/calculate' },
      { label: '城市对比', href: '/compare' },
      { label: '城市排行榜', href: '/ranking' },
      { label: '订阅报告', href: '/subscribe' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: 'About Lakive', href: '/about' },
      { label: 'Report Methodology', href: '/methodology' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: '法律',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#070d1f', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ minWidth: 200, flex: '1 1 200px' }}>
            <a href="/" style={{ display: 'inline-block', marginBottom: 12, textDecoration: 'none' }}>
              <LakiveLogo size={22} theme="dark" />
            </a>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.8, maxWidth: 240 }}>
              Helping people find a place where they can build a meaningful future — not just where they earn more, but where they belong.
            </p>
          </div>

          {/* Nav columns */}
          {NAV.map(col => (
            <div key={col.title} style={{ minWidth: 140, flex: '1 1 140px' }}>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link.href} href={link.href}
                    style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12 }}>
            © 2026 Lakive. All Rights Reserved.
          </span>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>
            Data: StatCan · CMHC · CREA · CRA · Job Bank · CIHI
          </span>
        </div>
      </div>
    </footer>
  )
}
