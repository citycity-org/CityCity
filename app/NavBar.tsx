'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LakiveLogo } from './components/LakiveLogo'

export default function NavBar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/ranking',    label: 'Rankings'   },
    { href: '/compare',    label: 'Compare'    },
    { href: '/guide',      label: 'Guides'     },
    { href: '/calculate',  label: 'Calculate'  },
    { href: '/reports',    label: 'Reports'    },
    { href: '/newsletter', label: 'Newsletter' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return path === '/'
    return path.startsWith(href)
  }

  // 路由变化时自动收起菜单
  useEffect(() => { setOpen(false) }, [path])

  // 菜单展开时锁定页面滚动
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const linkStyle = (href: string): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.15s',
    ...(isActive(href)
      ? { background: 'rgba(79,142,247,0.18)', color: '#93C5FD', border: '1px solid rgba(79,142,247,0.30)' }
      : { color: 'rgba(255,255,255,0.55)', border: '1px solid transparent' }),
  })

  return (
    <>
      <nav style={{
        background: 'rgba(10,14,28,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', gap: 2, flexShrink: 0 }}>
          <LakiveLogo size={24} theme="dark" />
          <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', lineHeight: 1, whiteSpace: 'nowrap' }}>
            From Data to Belonging
          </span>
        </a>

        {/* 桌面端：链接行 */}
        <div className="lk-desktop-only" style={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
          {links.map(({ href, label }) => (
            <a key={href} href={href} style={linkStyle(href)}>{label}</a>
          ))}
        </div>

        {/* 桌面端：Contact */}
        <a href="/contact" className="lk-desktop-only" style={{
          padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'rgba(79,142,247,0.15)', color: '#93C5FD',
          border: '1px solid rgba(79,142,247,0.25)', textDecoration: 'none',
          alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap',
        }}>Contact</a>

        {/* 移动端：汉堡按钮 */}
        <button
          className="lk-mobile-only"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            alignItems: 'center', justifyContent: 'center',
            background: open ? 'rgba(79,142,247,0.18)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${open ? 'rgba(79,142,247,0.30)' : 'rgba(255,255,255,0.10)'}`,
            cursor: 'pointer', padding: 0,
          }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 18 }}>
            <span style={{
              height: 2, borderRadius: 2, background: open ? '#93C5FD' : 'rgba(255,255,255,0.75)',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              height: 2, borderRadius: 2, background: open ? '#93C5FD' : 'rgba(255,255,255,0.75)',
              transition: 'opacity 0.2s', opacity: open ? 0 : 1,
            }} />
            <span style={{
              height: 2, borderRadius: 2, background: open ? '#93C5FD' : 'rgba(255,255,255,0.75)',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
            }} />
          </span>
        </button>
      </nav>

      {/* 移动端下拉面板 */}
      {open && (
        <>
          <div
            className="lk-mobile-only"
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: '64px 0 0 0', background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          <div className="lk-mobile-only" style={{
            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 45,
            flexDirection: 'column',
            background: 'rgba(10,14,28,0.98)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            padding: '12px 16px 20px',
            gap: 4,
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            animation: 'lk-menu-in 0.18s ease-out',
          }}>
            {links.map(({ href, label }) => (
              <a key={href} href={href} style={{
                ...linkStyle(href),
                display: 'block',
                padding: '13px 14px',
                fontSize: 15,
              }}>{label}</a>
            ))}
            <a href="/contact" style={{
              display: 'block', textAlign: 'center', marginTop: 8,
              padding: '13px 16px', borderRadius: 8, fontSize: 15, fontWeight: 600,
              background: 'rgba(79,142,247,0.15)', color: '#93C5FD',
              border: '1px solid rgba(79,142,247,0.25)', textDecoration: 'none',
            }}>Contact</a>
          </div>
        </>
      )}
    </>
  )
}
