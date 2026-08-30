'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRICE_ITEMS } from '@/lib/price-items'

// ── Constants ────────────────────────────────────────────────────────────────

const CITIES = [
  { id: 'vancouver', label: 'Vancouver' },
  { id: 'toronto',   label: 'Toronto'   },
  { id: 'calgary',   label: 'Calgary'   },
  { id: 'montreal',  label: 'Montréal'  },
  { id: 'ottawa',    label: 'Ottawa'    },
]

const CATEGORIES = [
  { key: 'grocery',    icon: '🛒', label: 'Grocery'    },
  { key: 'gas',        icon: '⛽', label: 'Gas'        },
  { key: 'restaurant', icon: '🍽', label: 'Restaurant' },
  { key: 'transit',    icon: '🚌', label: 'Transit'    },
] as const

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: 'white',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.65)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 10,
}

// ── Custom Item Dropdown ──────────────────────────────────────────────────────

function ItemDropdown({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = PRICE_ITEMS.find(i => i.id === value)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: selected ? 'white' : 'rgba(255,255,255,0.35)',
          textAlign: 'left',
        }}
      >
        <span>{selected ? selected.label : 'Select an item…'}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 5l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          zIndex: 200,
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          {CATEGORIES.map(cat => {
            const items = PRICE_ITEMS.filter(i => i.category === cat.key)
            return (
              <div key={cat.key}>
                <div style={{
                  padding: '8px 16px',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {cat.icon} {cat.label}
                </div>
                {items.map(item => (
                  <ItemRow
                    key={item.id}
                    label={item.label}
                    unit={item.unit}
                    selected={value === item.id}
                    onClick={() => { onChange(item.id); setOpen(false) }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItemRow({ label, unit, selected, onClick }: {
  label: string; unit: string; selected: boolean; onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '10px 16px 10px 24px',
        background: selected ? 'rgba(20,184,166,0.1)' : hover ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: selected ? '#14B8A6' : 'rgba(255,255,255,0.75)',
        fontSize: 14,
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'inherit',
        transition: 'background 0.1s',
      }}
    >
      <span>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginLeft: 12 }}>{unit}</span>
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

interface LastSubmission {
  city: string; item: string; price: string; store: string; date: string
}

function PriceSubmitContent() {
  const params = useSearchParams()
  const [city,         setCity]         = useState(params.get('city') || '')
  const [itemId,       setItemId]       = useState('')
  const [price,        setPrice]        = useState('')
  const [observedDate, setObservedDate] = useState(todayISO())
  const [store,        setStore]        = useState('')
  const [email,        setEmail]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [last,         setLast]         = useState<LastSubmission | null>(null)

  const selectedItem = PRICE_ITEMS.find(i => i.id === itemId)
  const selectedCity = CITIES.find(c => c.id === city)
  const canSubmit    = city && itemId && price && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          item_id:       itemId,
          price:         priceNum,
          observed_date: observedDate,
          store:         store.trim() || undefined,
          email:         email.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setLast({
          city:  selectedCity?.label ?? city,
          item:  selectedItem?.label ?? itemId,
          price: priceNum.toFixed(2),
          store: store.trim(),
          date:  formatDateLabel(observedDate),
        })
        setSubmitted(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSubmitted(false)
    setPrice('')
    setStore('')
    setItemId('')
    setObservedDate(todayISO())
    setError(null)
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(20,184,166,0.1)', border: '2px solid rgba(20,184,166,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16.5L13 22.5L25 10" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Thanks for contributing!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
            Your submission helps Canadians understand the real cost of living.
            Once validated, it contributes to Lakive&apos;s community cost-of-living data.
          </p>

          {/* Submission summary */}
          {last && (
            <div style={{
              margin: '0 auto 36px',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              textAlign: 'left',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>
                <span style={{ color: '#14B8A6', fontWeight: 600 }}>{last.city}</span>
                {' · '}{last.item}{' · '}
                <span style={{ color: 'white', fontWeight: 600 }}>${last.price}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 2 }}>
                {last.store ? `${last.store} · ` : ''}{last.date}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={resetForm}
              style={{ padding: '12px 24px', background: '#14B8A6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}
            >
              Submit another →
            </button>
            <a
              href="/ranking"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
            >
              View city rankings
            </a>
          </div>
        </div>
      </main>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.3); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
      `}</style>

      <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 44 }}>
            <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Community Data
            </div>
            <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800, marginBottom: 16, lineHeight: 1.15 }}>
              Submit a Price
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              Spotted a price at your local store? Submit it and help track the real cost of living across Canadian cities.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* City */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Your City *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CITIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCity(c.id)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.12)',
                      background:  city === c.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                      color:       city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.55)',
                      fontWeight:  city === c.id ? 700 : 500,
                      fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Item — custom dropdown */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Item *</label>
              <ItemDropdown value={itemId} onChange={setItemId} />
              {selectedItem && (
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                  {selectedItem.unit} · expected range: ${selectedItem.min}–${selectedItem.max} CAD
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Price (CAD) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 600, pointerEvents: 'none',
                }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, paddingLeft: 30 }}
                />
              </div>
            </div>

            {/* Date Seen */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Date Seen *</label>
              <input
                type="date"
                value={observedDate}
                max={todayISO()}
                min={(() => {
                  const d = new Date(); d.setDate(d.getDate() - 7)
                  return d.toISOString().split('T')[0]
                })()}
                onChange={e => setObservedDate(e.target.value)}
                style={inputStyle}
              />
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                Defaults to today · Change if you're reporting a price from yesterday or earlier this week
              </div>
            </div>

            {/* Store */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>
                Store{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.35)' }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={store}
                onChange={e => setStore(e.target.value)}
                placeholder="e.g. Costco, Walmart, T&T Supermarket"
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 40 }}>
              <label style={labelStyle}>
                Email{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.35)' }}>
                  (optional — for monthly cost-of-living reports)
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 20, padding: '12px 16px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, color: '#f87171', fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '15px',
                background: canSubmit ? '#14B8A6' : 'rgba(20,184,166,0.2)',
                color: canSubmit ? 'white' : 'rgba(255,255,255,0.25)',
                border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 16,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s', fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Price →'}
            </button>

            <p style={{ marginTop: 18, color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
              Anonymous by default · No account required · Submissions are validated before entering the dataset
            </p>
          </form>
        </div>
      </main>
    </>
  )
}

export default function PriceSubmitPage() {
  return (
    <Suspense>
      <PriceSubmitContent />
    </Suspense>
  )
}
