'use client'
import { useState } from 'react'
import { PRICE_ITEMS } from '@/lib/price-items'

const CITIES = [
  { id: 'vancouver', label: 'Vancouver' },
  { id: 'toronto',   label: 'Toronto'   },
  { id: 'calgary',   label: 'Calgary'   },
  { id: 'montreal',  label: 'Montréal'  },
  { id: 'ottawa',    label: 'Ottawa'    },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: 'white',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.55)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 10,
}

export default function PriceSubmitPage() {
  const [city,       setCity]       = useState('')
  const [itemId,     setItemId]     = useState('')
  const [price,      setPrice]      = useState('')
  const [store,      setStore]      = useState('')
  const [email,      setEmail]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const selectedItem = PRICE_ITEMS.find(i => i.id === itemId)
  const canSubmit = city && itemId && price && !submitting

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
          item_id: itemId,
          price:   priceNum,
          store:   store.trim() || undefined,
          email:   email.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(20,184,166,0.12)', border: '2px solid rgba(20,184,166,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', fontSize: 28,
          }}>✓</div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Thanks for contributing!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
            Your submission helps Canadians understand the real cost of living. Once validated, it feeds into our city cost index.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSubmitted(false); setPrice(''); setStore(''); setEmail(''); setItemId('') }}
              style={{ padding: '12px 24px', background: '#14B8A6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
            >
              Submit another →
            </button>
            <a
              href="/ranking"
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
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
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
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
                    borderColor: city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.1)',
                    background:  city === c.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                    color:       city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.45)',
                    fontWeight:  city === c.id ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Item */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Item *</label>
            <select
              value={itemId}
              onChange={e => setItemId(e.target.value)}
              style={{
                ...inputStyle,
                color: itemId ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              <option value="">Select an item…</option>
              <optgroup label="🛒 Grocery">
                {PRICE_ITEMS.filter(i => i.category === 'grocery').map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </optgroup>
              <optgroup label="⛽ Gas">
                {PRICE_ITEMS.filter(i => i.category === 'gas').map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </optgroup>
              <optgroup label="🍽 Restaurant">
                {PRICE_ITEMS.filter(i => i.category === 'restaurant').map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </optgroup>
              <optgroup label="🚌 Transit">
                {PRICE_ITEMS.filter(i => i.category === 'transit').map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </optgroup>
            </select>
            {selectedItem && (
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
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
                color: 'rgba(255,255,255,0.35)', fontSize: 16, fontWeight: 600, pointerEvents: 'none',
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

          {/* Store */}
          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>
              Store{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.3)' }}>
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
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.3)' }}>
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
              marginBottom: 20,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              color: '#f87171',
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '15px',
              background: canSubmit ? '#14B8A6' : 'rgba(20,184,166,0.25)',
              color: canSubmit ? 'white' : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Price →'}
          </button>

          <p style={{ marginTop: 18, color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
            Anonymous by default · No account required · Submissions are validated before entering the dataset
          </p>
        </form>
      </div>
    </main>
  )
}
