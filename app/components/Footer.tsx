'use client'
import { LakiveLogo } from './LakiveLogo'

const NAV = [
  {
    title: 'Product',
    links: [
      { label: 'Calculate Cost', href: '/calculate' },
      { label: 'Compare Cities', href: '/compare' },
      { label: 'City Rankings', href: '/ranking' },
      { label: 'Subscribe', href: '/subscribe' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Lakive', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
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
    <footer style={{ background: '#070d1f', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '64px 32px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <a href="/" style={{ display: 'inline-block', marginBottom: 20, textDecoration: 'none' }}>
              <LakiveLogo size={26} theme="dark" />
            </a>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
              Find the city where your career, your family, and your life all fit.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 12, fontStyle: 'italic' }}>
              From Data to Belonging.
            </p>
          </div>

          {/* Nav columns */}
          {NAV.map(col => (
            <div key={col.title}>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(link => (
                  <a key={link.href} href={link.href}
                    style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 28,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
            © 2026 Lakive. All Rights Reserved.
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
            Data: StatCan · CMHC · CREA · CRA · Job Bank · CIHI
          </span>
        </div>

      </div>
    </footer>
  )
}
