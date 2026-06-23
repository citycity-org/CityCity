'use client'
import { useState, useEffect } from 'react'

const CITY_NAMES: Record<string, string> = {
  vancouver: '温哥华',
  toronto:   '多伦多',
  calgary:   '卡尔加里',
  montreal:  '蒙特利尔',
  ottawa:    '渥太华',
}

const REPORT_ITEMS = [
  { icon: '🏠', text: '买房指数变化',   tag: '↑ 恶化', tagColor: '#EF4444', tagBg: 'rgba(239,68,68,0.12)' },
  { icon: '🔑', text: '租金占收入比变化', tag: '↑ 恶化', tagColor: '#EF4444', tagBg: 'rgba(239,68,68,0.12)' },
  { icon: '🚗', text: '买车指数变化',   tag: '↓ 改善', tagColor: '#14B8A6', tagBg: 'rgba(20,184,166,0.12)' },
  { icon: '🌿', text: '环境指数维持',   tag: '→ 持平', tagColor: 'rgba(255,255,255,0.45)', tagBg: 'rgba(255,255,255,0.07)' },
]

function SubscribeContent() {
  const [city,      setCity]      = useState('vancouver')
  const [frequency, setFrequency] = useState<'quarterly'|'monthly'>('quarterly')
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCity(params.get('city') || 'vancouver')
  }, [])

  const cityName = CITY_NAMES[city] || '温哥华'

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
    overflow: 'hidden',
  }

  const sectionTitle: React.CSSProperties = {
    color: 'white', fontSize: 14, fontWeight: 700,
  }

  const subText: React.CSSProperties = {
    color: 'rgba(255,255,255,0.42)', fontSize: 12, marginTop: 2,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#0d1117 0%,#151827 60%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 10px' }}>订阅城市生活报告</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          定期收到 <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{cityName}</span> 的最新生活指数<br />
          免费 · 无广告 · 随时退订
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 订阅城市 */}
        <div style={card}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={sectionTitle}>订阅城市</div>
              <div style={subText}>基于你的查询记录自动设置</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.28)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F8EF7' }} />
              <span style={{ color: '#93C5FD', fontSize: 14, fontWeight: 700 }}>{cityName}</span>
              <span style={{ color: '#60A5FA', fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(79,142,247,0.18)' }}>免费</span>
            </div>
          </div>
          <div style={{ margin: '0 16px 16px', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>🌆</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 12, fontWeight: 600 }}>多城市报告</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 2 }}>订阅多个城市的报告即将开放</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white', padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', flexShrink: 0 }}>即将推出</span>
          </div>
        </div>

        {/* 报告预览 */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={sectionTitle}>报告内容预览</div>
              <div style={subText}>{cityName} · 2026年Q1</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white', padding: '4px 12px', borderRadius: 20, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>Q1 2026</span>
          </div>
          <div style={{ margin: 16, borderRadius: 12, padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lakive 季报</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>2026年Q1</span>
            </div>
            {REPORT_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < REPORT_ITEMS.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{item.text}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
              </div>
            ))}
            <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 11, textAlign: 'center', marginTop: 14 }}>
              每季度第一周发送 · lakive.com
            </div>
          </div>
        </div>

        {/* 订阅频率 */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={sectionTitle}>选择订阅频率</div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'quarterly' as const, label: '季报（推荐）', sub: '每3个月收到一次，包含完整指数变化和趋势分析', note: '每年4封 · 免费' },
              { id: 'monthly'   as const, label: '月报',         sub: '每月收到房价和租金最新数据变化简报',             note: '每年12封 · 免费' },
            ].map(opt => {
              const active = frequency === opt.id
              return (
                <button key={opt.id} onClick={() => setFrequency(opt.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${active ? 'rgba(79,142,247,0.45)' : 'rgba(255,255,255,0.09)'}`, background: active ? 'rgba(79,142,247,0.10)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#4F8EF7' : 'rgba(255,255,255,0.25)'}`, background: active ? '#4F8EF7' : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: active ? '#93C5FD' : 'white', fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.5 }}>{opt.sub}</div>
                    <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 600, marginTop: 6 }}>{opt.note}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 邮箱 / 成功 */}
        {!submitted ? (
          <div style={card}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={sectionTitle}>你的邮箱地址</div>
            </div>
            <div style={{ padding: 16 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(79,142,247,0.60)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button
                onClick={() => email && setSubmitted(true)}
                disabled={!email}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: email ? 'pointer' : 'not-allowed', background: email ? 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' : 'rgba(255,255,255,0.10)', transition: 'opacity 0.15s' }}>
                订阅 →
              </button>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 1.7 }}>
                🔒 你的邮箱仅用于发送报告，不会出售给任何第三方<br />
                随时可以一键退订 · 无广告 · 无推销
              </p>
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>订阅成功！</div>
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.8 }}>
              下一期{frequency === 'quarterly' ? '季报' : '月报'}将在<br />
              {frequency === 'quarterly' ? '2026年Q2' : '2026年6月'}发送到你的邮箱<br />
              请查收确认邮件
            </div>
            <a href="/" style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>
              返回首页
            </a>
          </div>
        )}

      </div>
    </main>
  )
}

export default function SubscribePage() {
  return <SubscribeContent />
}
