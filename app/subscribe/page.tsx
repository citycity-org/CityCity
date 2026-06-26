'use client'
import { useState, useEffect, useRef } from 'react'

const CITY_NAMES: Record<string, string> = {
  vancouver: '温哥华', toronto: '多伦多', calgary: '卡尔加里',
  montreal: '蒙特利尔', ottawa: '渥太华',
}

const PT_NAMES: Record<string, string> = {
  '1br': '一居室', '2br': '两居室', '3br': '三居室', 'house': '独立屋',
}

const OCC_GROUPS = [
  { label: '医疗健康', occs: [
    { id: 'nurse',      name: '护士' },
    { id: 'doctor',     name: '医生' },
    { id: 'pharmacist', name: '药剂师' },
  ]},
  { label: '科技', occs: [
    { id: 'data_analyst',      name: '数据分析师' },
    { id: 'software_engineer', name: '软件工程师' },
    { id: 'it_support',        name: 'IT支持' },
  ]},
  { label: '工程与建筑', occs: [
    { id: 'engineer',           name: '工程师' },
    { id: 'electrician',        name: '电工' },
    { id: 'plumber',            name: '水管工' },
    { id: 'carpenter',          name: '木工' },
    { id: 'construction_worker',name: '建筑工人' },
  ]},
  { label: '教育与法律', occs: [
    { id: 'teacher',      name: '教师' },
    { id: 'lawyer',       name: '律师' },
    { id: 'social_worker',name: '社会工作者' },
  ]},
  { label: '金融与地产', occs: [
    { id: 'accountant',        name: '会计' },
    { id: 'financial_advisor', name: '金融顾问' },
    { id: 'real_estate_agent', name: '房产经纪' },
  ]},
  { label: '服务与技工', occs: [
    { id: 'mechanic',        name: '机修工' },
    { id: 'chef',            name: '厨师' },
    { id: 'firefighter',     name: '消防员' },
    { id: 'police_officer',  name: '警察' },
    { id: 'truck_driver',    name: '货车司机' },
    { id: 'retail_worker',   name: '零售从业者' },
    { id: 'warehouse_worker',name: '仓库工人' },
  ]},
  { label: '其他身份', occs: [
    { id: 'self_employed', name: '自雇 / 个体经营' },
    { id: 'freelancer',    name: '自由职业者' },
    { id: 'unemployed',    name: '暂未就业' },
    { id: 'retired',       name: '退休 / 财富自由' },
  ]},
]

function findOccName(id: string): string {
  for (const g of OCC_GROUPS) {
    const o = g.occs.find(x => x.id === id)
    if (o) return o.name
  }
  return id
}

function OccDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const label = value ? findOccName(value) : '选择职业（可选）'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)', color: value ? 'white' : 'rgba(255,255,255,0.40)',
          fontSize: 14, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#1a2035', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, overflow: 'hidden', zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.18) transparent' }}>
            {/* clear option */}
            <div
              onClick={() => { onChange(''); setOpen(false) }}
              style={{ padding: '10px 16px', fontSize: 13, color: 'rgba(255,255,255,0.40)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >不填写职业</div>
            {OCC_GROUPS.map(g => (
              <div key={g.label}>
                <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(0,0,0,0.2)' }}>
                  {g.label}
                </div>
                {g.occs.map(o => (
                  <div
                    key={o.id}
                    onClick={() => { onChange(o.id); setOpen(false) }}
                    style={{
                      padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                      color: value === o.id ? '#14B8A6' : 'rgba(255,255,255,0.75)',
                      background: value === o.id ? 'rgba(20,184,166,0.10)' : 'transparent',
                    }}
                  >{o.name}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SubscribeContent() {
  const [city,      setCity]      = useState('vancouver')
  const [occ,       setOcc]       = useState('')
  const [propType,  setPropType]  = useState('')
  const [frequency, setFrequency] = useState<'quarterly'|'monthly'>('quarterly')
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [fromPage,  setFromPage]  = useState('')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('city') && CITY_NAMES[p.get('city')!]) setCity(p.get('city')!)
    if (p.get('occ'))  setOcc(p.get('occ')!)
    if (p.get('pt'))   setPropType(p.get('pt')!)
    if (p.get('from')) setFromPage(p.get('from')!)
  }, [])

  const cityName = CITY_NAMES[city] || '温哥华'
  const occName  = occ ? findOccName(occ) : ''
  const ptName   = propType ? PT_NAMES[propType] : ''

  const hasProfile = !!(occ || propType)

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
  }
  // Cards that contain absolute-positioned dropdowns must NOT have overflow:hidden
  const cardClip: React.CSSProperties = { ...card, overflow: 'hidden' }

  const sectionTitle: React.CSSProperties = { color: 'white', fontSize: 14, fontWeight: 700 }
  const subText: React.CSSProperties = { color: 'rgba(255,255,255,0.42)', fontSize: 12, marginTop: 2 }

  const handleSubmit = async () => {
    if (!email || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city, occ, propType, frequency }),
      })
      if (!res.ok) throw new Error('failed')
      setSubmitted(true)
    } catch {
      setError('提交失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#0d1117 0%,#151827 60%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 38, marginBottom: 14 }}>📊</div>
        <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 10px' }}>订阅城市生活报告</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          {hasProfile
            ? <>定期收到 <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{cityName}</span> 的个性化城市报告 · 免费 · 无广告</>
            : <>定期收到 <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{cityName}</span> 的最新生活指数 · 免费 · 无广告</>
          }
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 来源面包屑 */}
        {fromPage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <a href={`/${fromPage}`} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none' }}>
              ← 返回{fromPage === 'calculate' ? '费用估算' : fromPage === 'compare' ? '城市对比' : '城市排名'}
            </a>
          </div>
        )}

        {/* 档案卡（如果有预填数据） */}
        {hasProfile && (
          <div style={{ ...card, background: 'rgba(20,184,166,0.06)', borderColor: 'rgba(20,184,166,0.20)' }}>
            <div style={{ padding: '14px 20px' }}>
              <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                根据你的查询自动填写
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(79,142,247,0.15)', color: '#93C5FD', fontSize: 13, fontWeight: 700 }}>
                  {cityName}
                </span>
                {occName && (
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(20,184,166,0.15)', color: '#5EEAD4', fontSize: 13, fontWeight: 700 }}>
                    {occName}
                  </span>
                )}
                {ptName && (
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700 }}>
                    {ptName}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 城市选择 */}
        <div style={cardClip}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={sectionTitle}>订阅城市</div>
              <div style={subText}>选择你最关注的城市</div>
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {Object.entries(CITY_NAMES).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setCity(id)}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: city === id ? '2px solid rgba(79,142,247,0.60)' : '2px solid rgba(255,255,255,0.10)',
                  background: city === id ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                  color: city === id ? '#93C5FD' : 'rgba(255,255,255,0.60)',
                  transition: 'all 0.15s',
                }}
              >{name}</button>
            ))}
          </div>
        </div>

        {/* 职业（可选） */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={sectionTitle}>职业 <span style={{ color: 'rgba(255,255,255,0.30)', fontWeight: 400, fontSize: 12 }}>（可选）</span></div>
            <div style={subText}>填写后报告将与你的职业结合分析</div>
          </div>
          <div style={{ padding: 16 }}>
            <OccDropdown value={occ} onChange={setOcc} />
          </div>
        </div>

        {/* 订阅频率 */}
        <div style={cardClip}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={sectionTitle}>选择订阅类型</div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                id: 'quarterly' as const,
                label: '季度城市情报报告',
                sub: '深度：这个城市 3 个月内发生了什么？对你意味着什么？该怎么做？',
                note: '每年 4 封 · 免费',
                tag: '推荐',
              },
              {
                id: 'monthly' as const,
                label: '月度城市简报',
                sub: '轻量：房价、租金、就业市场本月有什么变化？',
                note: '每年 12 封 · 免费',
                tag: '',
              },
            ].map(opt => {
              const active = frequency === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setFrequency(opt.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                    borderRadius: 12, border: `2px solid ${active ? 'rgba(79,142,247,0.45)' : 'rgba(255,255,255,0.09)'}`,
                    background: active ? 'rgba(79,142,247,0.10)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    border: `2px solid ${active ? '#4F8EF7' : 'rgba(255,255,255,0.25)'}`,
                    background: active ? '#4F8EF7' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: active ? '#93C5FD' : 'white', fontSize: 14, fontWeight: 700 }}>{opt.label}</span>
                      {opt.tag && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'white', padding: '2px 8px', borderRadius: 20, background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>{opt.tag}</span>
                      )}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.55 }}>{opt.sub}</div>
                    <div style={{ color: '#14B8A6', fontSize: 12, fontWeight: 600, marginTop: 6 }}>{opt.note}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 邮箱 / 成功 */}
        {!submitted ? (
          <div style={cardClip}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={sectionTitle}>你的邮箱</div>
            </div>
            <div style={{ padding: 16 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: 14, outline: 'none', marginBottom: 12,
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(79,142,247,0.60)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {error && (
                <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{error}</div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!email || loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: email && !loading ? 'pointer' : 'not-allowed',
                  background: email && !loading ? 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' : 'rgba(255,255,255,0.10)',
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? '提交中...' : `订阅 ${cityName}${occName ? ` × ${occName}` : ''} →`}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 1.7 }}>
                🔒 邮箱仅用于发送报告，不会出售或共享<br />
                随时可以一键退订 · 无广告 · 无推销
              </p>
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>订阅成功！</div>
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.9 }}>
              {cityName}{occName ? ` × ${occName}` : ''} 的<br />
              {frequency === 'quarterly' ? '季度城市情报报告' : '月度城市简报'}<br />
              将在下一期发送到你的邮箱<br />
              <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>请查收确认邮件</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <a href="/" style={{ padding: '12px 24px', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>
                返回首页
              </a>
              {fromPage && (
                <a href={`/${fromPage}`} style={{ padding: '12px 24px', borderRadius: 12, color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.08)' }}>
                  继续查询
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

export default function SubscribePage() {
  return <SubscribeContent />
}
