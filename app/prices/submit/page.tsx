'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRICE_ITEMS, type ItemCountry } from '@/lib/price-items'

// ── Data ──────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { id: 'CA' as ItemCountry, label: 'Canada',        flag: '🇨🇦', currency: 'CAD' },
  { id: 'US' as ItemCountry, label: 'United States', flag: '🇺🇸', currency: 'USD' },
]

const ALL_CITIES = [
  { id: 'vancouver',     label: 'Vancouver',      country: 'CA' as ItemCountry },
  { id: 'toronto',       label: 'Toronto',         country: 'CA' as ItemCountry },
  { id: 'calgary',       label: 'Calgary',         country: 'CA' as ItemCountry },
  { id: 'montreal',      label: 'Montréal',        country: 'CA' as ItemCountry },
  { id: 'ottawa',        label: 'Ottawa',          country: 'CA' as ItemCountry },
  { id: 'seattle',       label: 'Seattle',         country: 'US' as ItemCountry },
  { id: 'san-francisco', label: 'San Francisco',   country: 'US' as ItemCountry },
  { id: 'new-york',      label: 'New York',        country: 'US' as ItemCountry },
  { id: 'boston',        label: 'Boston',          country: 'US' as ItemCountry },
]

const CATEGORIES = [
  { key: 'grocery',    icon: '🛒', label: 'Grocery'    },
  { key: 'gas',        icon: '⛽', label: 'Gas'        },
  { key: 'restaurant', icon: '🍽', label: 'Restaurant' },
  { key: 'transit',    icon: '🚌', label: 'Transit'    },
] as const

function getCityCountry(cityId: string): ItemCountry | '' {
  const found = ALL_CITIES.find(c => c.id === cityId)
  return found ? found.country : ''
}

function todayISO() { return new Date().toISOString().split('T')[0] }

function formatDateLabel(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10, color: 'white', fontSize: 15, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: 12,
  fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
}

// ── Custom Item Dropdown ──────────────────────────────────────────────────────

function ItemDropdown({ value, onChange, country }: { value: string; onChange: (id: string) => void; country: ItemCountry | '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = PRICE_ITEMS.find(i => i.id === value)
  const filtered = PRICE_ITEMS.filter(i => i.country === country)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', color: selected ? 'white' : 'rgba(255,255,255,0.35)', textAlign: 'left',
      }}>
        <span>{selected ? selected.label : 'Select an item…'}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 5l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: '#111827', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          {CATEGORIES.map(cat => {
            const items = filtered.filter(i => i.category === cat.key)
            if (!items.length) return null
            return (
              <div key={cat.key}>
                <div style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {cat.icon} {cat.label}
                </div>
                {items.map(item => (
                  <ItemRow key={item.id} label={item.label} unit={item.unit} selected={value === item.id}
                    onClick={() => { onChange(item.id); setOpen(false) }} />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItemRow({ label, unit, selected, onClick }: { label: string; unit: string; selected: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '10px 16px 10px 24px',
        background: selected ? 'rgba(20,184,166,0.1)' : hover ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: selected ? '#14B8A6' : 'rgba(255,255,255,0.75)',
        fontSize: 14, textAlign: 'left', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'inherit', transition: 'background 0.1s',
      }}>
      <span>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginLeft: 12 }}>{unit}</span>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface LastSubmission { country: string; city: string; item: string; price: string; currency: string; store: string; date: string }

function PriceSubmitContent() {
  const params = useSearchParams()
  const initialCity    = params.get('city') || ''
  const initialCountry = getCityCountry(initialCity)

  const [country,      setCountry]      = useState<ItemCountry | ''>(initialCountry)
  const [city,         setCity]         = useState(initialCity)
  const [itemId,       setItemId]       = useState('')
  const [price,        setPrice]        = useState('')
  const [observedDate, setObservedDate] = useState(todayISO())
  const [store,        setStore]        = useState('')
  const [email,        setEmail]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [last,         setLast]         = useState<LastSubmission | null>(null)

  const selectedItem    = PRICE_ITEMS.find(i => i.id === itemId)
  const selectedCity    = ALL_CITIES.find(c => c.id === city)
  const selectedCountry = COUNTRIES.find(c => c.id === country)
  const currencySymbol  = selectedCountry?.currency ?? 'CAD'
  const canSubmit       = country && city && itemId && price && !submitting

  // Reset city and item when country changes
  function handleCountryChange(c: ItemCountry) {
    setCountry(c)
    setCity('')
    setItemId('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) { setError('Please enter a valid price.'); return }

    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/prices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, item_id: itemId, price: priceNum, observed_date: observedDate, store: store.trim() || undefined, email: email.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.') }
      else {
        setLast({ country: selectedCountry?.label ?? '', city: selectedCity?.label ?? city, item: selectedItem?.label ?? itemId, price: priceNum.toFixed(2), currency: currencySymbol, store: store.trim(), date: formatDateLabel(observedDate) })
        setSubmitted(true)
      }
    } catch { setError('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  function resetForm() {
    setSubmitted(false); setPrice(''); setStore(''); setItemId('')
    setObservedDate(todayISO()); setError(null)
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(20,184,166,0.1)', border: '2px solid rgba(20,184,166,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16.5L13 22.5L25 10" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>Thanks for contributing!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
            Your submission helps people understand the real cost of living. Once validated, it contributes to Lakive&apos;s community cost-of-living data.
          </p>
          {last && (
            <div style={{ margin: '0 auto 36px', padding: '14px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, textAlign: 'left' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>
                <span style={{ color: '#14B8A6', fontWeight: 600 }}>{last.city}</span>
                {' · '}{last.item}{' · '}
                <span style={{ color: 'white', fontWeight: 600 }}>{last.currency} ${last.price}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 2 }}>
                {last.store ? `${last.store} · ` : ''}{last.date}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={resetForm} style={{ padding: '12px 24px', background: '#14B8A6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>Submit another →</button>
            <a href="/ranking" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>View city rankings</a>
          </div>
        </div>
      </main>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const cities = ALL_CITIES.filter(c => c.country === country)

  return (
    <>
      <style>{`input::placeholder { color: rgba(255,255,255,0.3); } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }`}</style>
      <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 44 }}>
            <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Community Data</div>
            <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800, marginBottom: 16, lineHeight: 1.15 }}>Submit a Price</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              Spotted a price at your local store? Submit it and help track the real cost of living across cities.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Country */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>Country *</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {COUNTRIES.map(c => (
                  <button key={c.id} type="button" onClick={() => handleCountryChange(c.id)}
                    style={{
                      flex: 1, padding: '14px 16px', borderRadius: 10, border: '1px solid',
                      borderColor: country === c.id ? '#14B8A6' : 'rgba(255,255,255,0.12)',
                      background: country === c.id ? 'rgba(20,184,166,0.1)' : 'transparent',
                      color: country === c.id ? '#14B8A6' : 'rgba(255,255,255,0.55)',
                      fontWeight: country === c.id ? 700 : 500,
                      fontSize: 15, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    <span style={{ fontSize: 20 }}>{c.flag}</span>
                    <span>{c.label}</span>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>({c.currency})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            {country && (
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>City *</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {cities.map(c => (
                    <button key={c.id} type="button" onClick={() => setCity(c.id)}
                      style={{
                        padding: '9px 18px', borderRadius: 8, border: '1px solid',
                        borderColor: city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.12)',
                        background: city === c.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                        color: city === c.id ? '#14B8A6' : 'rgba(255,255,255,0.55)',
                        fontWeight: city === c.id ? 700 : 500,
                        fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Item */}
            {city && (
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Item *</label>
                <ItemDropdown value={itemId} onChange={setItemId} country={country} />
                {selectedItem && (
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                    {selectedItem.unit} · expected range: {currencySymbol} ${selectedItem.min}–${selectedItem.max}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            {itemId && (
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Price ({currencySymbol}) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, pointerEvents: 'none' }}>
                    {currencySymbol} $
                  </span>
                  <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="0.00" style={{ ...inputStyle, paddingLeft: currencySymbol === 'CAD' ? 52 : 46 }} />
                </div>
              </div>
            )}

            {/* Date Seen */}
            {itemId && (
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Date Seen *</label>
                <input type="date" value={observedDate} max={todayISO()}
                  min={(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()}
                  onChange={e => setObservedDate(e.target.value)} style={inputStyle} />
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                  Defaults to today · Change if you're reporting an earlier price
                </div>
              </div>
            )}

            {/* Store */}
            {itemId && (
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Store <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.35)' }}>(optional)</span></label>
                <input type="text" value={store} onChange={e => setStore(e.target.value)}
                  placeholder={country === 'US' ? 'e.g. Whole Foods, Costco, Kroger' : 'e.g. Costco, Walmart, T&T Supermarket'}
                  style={inputStyle} />
              </div>
            )}

            {/* Email */}
            {itemId && (
              <div style={{ marginBottom: 40 }}>
                <label style={labelStyle}>Email <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.35)' }}>(optional — for monthly cost-of-living reports)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 14 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={!canSubmit}
              style={{
                width: '100%', padding: '15px',
                background: canSubmit ? '#14B8A6' : 'rgba(20,184,166,0.2)',
                color: canSubmit ? 'white' : 'rgba(255,255,255,0.25)',
                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16,
                cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 0.2s', fontFamily: 'inherit',
              }}>
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
