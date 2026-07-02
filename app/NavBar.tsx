'use client'
import { usePathname } from 'next/navigation'
import { LakiveLogo } from './components/LakiveLogo'

export default function NavBar() {
  const path = usePathname()

  const links = [
    { href: '/ranking',   label: 'Rankings' },
    { href: '/compare',   label: 'Compare' },
    { href: '/calculate', label: 'Calculate' },
    { href: '/subscribe', label: 'Subscribe' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return path === '/'
    return path.startsWith(href)
  }

  return (
    <nav style={{ background:'rgba(10,14,28,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)', height:64, display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
      <a href="/" style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', textDecoration:'none', gap:2 }}>
        <LakiveLogo size={24} theme="dark" />
        <span style={{ fontSize:9, fontWeight:500, color:'rgba(255,255,255,0.28)', letterSpacing:'0.04em', lineHeight:1, whiteSpace:'nowrap' }}>
          From Data to Belonging
        </span>
      </a>

      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
        {links.map(({ href, label }) => (
          <a key={href} href={href}
            style={{
              padding:'7px 14px', borderRadius:8, fontSize:14, fontWeight:600, textDecoration:'none', transition:'all 0.15s',
              ...(isActive(href)
                ? { background:'rgba(79,142,247,0.18)', color:'#93C5FD', border:'1px solid rgba(79,142,247,0.30)' }
                : { color:'rgba(255,255,255,0.55)', border:'1px solid transparent' }),
            }}>
            {label}
          </a>
        ))}
      </div>

      <a href="/contact" style={{ padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:600, background:'rgba(79,142,247,0.15)', color:'#93C5FD', border:'1px solid rgba(79,142,247,0.25)', textDecoration:'none' }}>Contact</a>
    </nav>
  )
}
