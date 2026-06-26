'use client'
import { usePathname } from 'next/navigation'
import { LakiveLogo } from './components/LakiveLogo'

export default function NavBar() {
  const path = usePathname()

  const links = [
    { href: '/ranking',   label: '排行榜' },
    { href: '/compare',   label: '城市对比' },
    { href: '/calculate', label: '算成本' },
    { href: '/subscribe', label: '订阅' },
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
          From Data to Belonging · 从数据，到归属
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

      <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.07)', borderRadius:8, padding:3 }}>
        <a href="/" style={{ padding:'4px 12px', borderRadius:6, fontSize:13, fontWeight:600, background:'rgba(79,142,247,0.25)', color:'#93C5FD', textDecoration:'none' }}>中文</a>
        <a href="/en" style={{ padding:'4px 12px', borderRadius:6, fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.38)', textDecoration:'none' }}>EN</a>
      </div>
    </nav>
  )
}
