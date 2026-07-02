'use client'
import { useState, useEffect, useRef } from 'react'

const CITY_NAMES: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}

const PT_NAMES: Record<string, string> = {
  '1br': '1 Bedroom', '2br': '2 Bedrooms', '3br': '3 Bedrooms', 'house': 'Detached House',
}

const OCC_GROUPS = [
  { label: 'Healthcare', occs: [
    { id: 'nurse',      name: 'Registered Nurse' },
    { id: 'doctor',     name: 'Family Physician' },
    { id: 'pharmacist', name: 'Pharmacist'        },
  ]},
  { label: 'Tech', occs: [
    { id: 'data_analyst',      name: 'Data Analyst'       },
    { id: 'software_engineer', name: 'Software Engineer'  },
    { id: 'it_support',        name: 'IT Support'         },
  ]},
  { label: 'Trades & Engineering', occs: [
    { id: 'engineer',           name: 'Civil Engineer'      },
    { id: 'electrician',        name: 'Electrician'         },
    { id: 'plumber',            name: 'Plumber'             },
    { id: 'carpenter',          name: 'Carpenter'           },
    { id: 'construction_worker',name: 'Construction Worker' },
  ]},
  { label: 'Education & Law', occs: [
    { id: 'teacher',      name: 'Secondary Teacher' },
    { id: 'lawyer',       name: 'Lawyer'            },
    { id: 'social_worker',name: 'Social Worker'     },
  ]},
  { label: 'Finance & Real Estate', occs: [
    { id: 'accountant',        name: 'Accountant'          },
    { id: 'financial_advisor', name: 'Financial Advisor'   },
    { id: 'real_estate_agent', name: 'Real Estate Agent'   },
  ]},
  { label: 'Services & Trades', occs: [
    { id: 'mechanic',        name: 'Auto Mechanic'        },
    { id: 'chef',            name: 'Chef'                 },
    { id: 'firefighter',     name: 'Firefighter'          },
    { id: 'police_officer',  name: 'Police Officer'       },
    { id: 'truck_driver',    name: 'Truck Driver'         },
    { id: 'retail_worker',   name: 'Retail Associate'     },
    { id: 'warehouse_worker',name: 'Warehouse Worker'     },
  ]},
  { label: 'Other', occs: [
    { id: 'self_employed', name: 'Self-Employed'                    },
    { id: 'freelancer',    name: 'Freelancer'                       },
    { id: 'unemployed',    name: 'Not Currently Employed'           },
    { id: 'retired',       name: 'Retired / Financially Independent'},
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

  const label = value ? findOccName(value) : 'Select occupation (optional)'

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
            >Skip occupation</div>
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

  const cityName = CITY_NAMES[city] || 'Vancouver'
  const occName  = occ ? findOccName(occ) : ''
  const ptName   = propType ? PT_NAMES[propType] : ''

  const hasProfile = !!(occ || propType)

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 18,
  }
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
      setError('Submission failed — please try again later')
    } finally {
      setLoading(false)
    }
  }

  const backLabel = fromPage === 'calculate' ? 'Cost Calculator'
                  : fromPage === 'compare'   ? 'City Compare'
                  : 'City Rankings'

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#0d1117 0%,#151827 60%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 38, marginBottom: 14 }}>📊</div>
        <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 10px' }}>Subscribe to City Intelligence</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          {hasProfile
            ? <>Receive personalised reports for <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{cityName}</span> · Free · No ads</>
            : <>Receive the latest city indices for <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600 }}>{cityName}</span> · Free · No ads</>
          }
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Back breadcrumb */}
        {fromPage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <a href={`/${fromPage}`} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none' }}>
              ← Back to {backLabel}
            </a>
          </div>
        )}

        {/* Profile card (if pre-filled data) */}
        {hasProfile && (
          <div style={{ ...card, background: 'rgba(20,184,166,0.06)', borderColor: 'rgba(20,184,166,0.20)' }}>
            <div style={{ padding: '14px 20px' }}>
              <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                Auto-filled from your search
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

        {/* City selection */}
        <div style={cardClip}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={sectionTitle}>Subscribe City</div>
              <div style={subText}>Select the city you care about most</div>
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

        {/* Occupation (optional) */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={sectionTitle}>Occupation <span style={{ color: 'rgba(255,255,255,0.30)', fontWeight: 400, fontSize: 12 }}>(optional)</span></div>
            <div style={subText}>Reports will be tailored to your profession if provided</div>
          </div>
          <div style={{ padding: 16 }}>
            <OccDropdown value={occ} onChange={setOcc} />
          </div>
        </div>

        {/* Subscription type */}
        <div style={cardClip}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={sectionTitle}>Choose Subscription Type</div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                id: 'quarterly' as const,
                label: 'Quarterly City Intelligence Report',
                sub: 'Deep dive: what happened in this city over the last 3 months? What does it mean for you? What should you do?',
                note: '4 issues per year · Free',
                tag: 'Recommended',
              },
              {
                id: 'monthly' as const,
                label: 'Monthly City Brief',
                sub: 'Lightweight: what changed in home prices, rent, and the job market this month?',
                note: '12 issues per year · Free',
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

        {/* Email / Success */}
        {!submitted ? (
          <div style={cardClip}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={sectionTitle}>Your Email</div>
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
                {loading ? 'Submitting...' : `Subscribe to ${cityName}${occName ? ` × ${occName}` : ''} →`}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 1.7 }}>
                🔒 Your email is only used to send reports — never sold or shared<br />
                Unsubscribe anytime · No ads · No promotions
              </p>
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>You're subscribed!</div>
            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.9 }}>
              Your {cityName}{occName ? ` × ${occName}` : ''}<br />
              {frequency === 'quarterly' ? 'Quarterly City Intelligence Report' : 'Monthly City Brief'}<br />
              will be sent to your inbox with the next issue<br />
              <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12 }}>Please check for a confirmation email</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <a href="/" style={{ padding: '12px 24px', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>
                Back to Home
              </a>
              {fromPage && (
                <a href={`/${fromPage}`} style={{ padding: '12px 24px', borderRadius: 12, color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.08)' }}>
                  Continue Exploring
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
