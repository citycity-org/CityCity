'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PRICE_ITEMS, type ItemCountry } from '@/lib/price-items'

// ── Data ──────────────────────────────────────────────────────────────────────

const CITIES = [
  { id: 'vancouver',     label: 'Vancouver',    country: 'CA' as ItemCountry, currency: 'CAD' },
  { id: 'toronto',       label: 'Toronto',      country: 'CA' as ItemCountry, currency: 'CAD' },
  { id: 'calgary',       label: 'Calgary',      country: 'CA' as ItemCountry, currency: 'CAD' },
  { id: 'montreal',      label: 'Montréal',     country: 'CA' as ItemCountry, currency: 'CAD' },
  { id: 'ottawa',        label: 'Ottawa',       country: 'CA' as ItemCountry, currency: 'CAD' },
  { id: 'seattle',       label: 'Seattle',      country: 'US' as ItemCountry, currency: 'USD' },
  { id: 'san-francisco', label: 'San Francisco',country: 'US' as ItemCountry, currency: 'USD' },
  { id: 'new-york',      label: 'New York',     country: 'US' as ItemCountry, currency: 'USD' },
  { id: 'boston',        label: 'Boston',       country: 'US' as ItemCountry, currency: 'USD' },
]

const CATEGORIES = [
  { key: 'grocery',    icon: '🛒', label: 'Grocery'    },
  { key: 'gas',        icon: '⛽', label: 'Gas'        },
  { key: 'restaurant', icon: '🍽', label: 'Restaurant' },
  { key: 'transit',    icon: '🚌', label: 'Transit'    },
] as const

interface PriceRow {
  city: string
  item_id: string
  item_label: string
  category: string
  avg_price: number
  sample_count: number
  last_seen: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function barColor(rank: number, total: number) {
  const pct = rank / total
  if (pct <= 0.33) return '#14B8A6'
  if (pct <= 0.66) return '#F59E0B'
  return '#EF4444'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricesPage() {
  const [country,    setCountry]    = useState<ItemCountry>('CA')
  const [selectedId, setSelectedId] = useState('')
  const [allRows,    setAllRows]    = useState<PriceRow[]>([])
  const [loading,    setLoading]    = useState(false)
  const [fetched,    setFetched]    = useState(false)

  // Items for selected country
  const countryItems = PRICE_ITEMS.filter(i => i.country === country)
  const selectedItem = PRICE_ITEMS.find(i => i.id === selectedId)

  // Cities for selected country
  const countryCities = CITIES.filter(c => c.country === country)

  // Filter fetched rows to selected item
  const rows = allRows.filter(r => r.item_id === selectedId)

  // Build per-city map
  const cityPrices = countryCities.map(city => {
    const row = rows.find(r => r.city === city.id)
    return { ...city, avg_price: row?.avg_price ?? null, sample_count: row?.sample_count ?? 0 }
  }).filter(c => c.avg_price !== null) as (typeof countryCities[0] & { avg_price: number; sample_count: number })[]

  cityPrices.sort((a, b) => a.avg_price - b.avg_price)
  const maxPrice = cityPrices.length ? Math.max(...cityPrices.map(c => c.avg_price)) : 1

  // Fetch all data for this country on mount / country change
  useEffect(() => {
    setFetched(false)
    setAllRows([])
    setSelectedId('')
    setLoading(true)
    const cityIds = CITIES.filter(c => c.country === country).map(c => c.id)
    supabase
      .from('price_aggregates')
      .select('city,item_id,item_label,category,avg_price,sample_count,last_seen')
      .in('city', cityIds)
      .then(({ data }) => {
        setAllRows(data ?? [])
        setLoading(false)
        setFetched(true)
      })
  }, [country])

  // Items that actually have data
  const itemsWithData = new Set(allRows.map(r => r.item_id))

  const currency = country === 'CA' ? 'CAD' : 'USD'

  return (
    <main style={{ background: '#070d1f', minHeight: '100vh', padding: '80px 24px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Community Data</div>
          <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800, marginBottom: 12, lineHeight: 1.15 }}>Price Comparison</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Compare real prices across cities — sourced from community submissions.
          </p>
        </div>

        {/* Country toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
          {(['CA', 'US'] as ItemCountry[]).map(c => (
            <button key={c} onClick={() => setCountry(c)}
              style={{
                padding: '10px 22px', borderRadius: 10, border: '1px solid',
                borderColor: country === c ? '#14B8A6' : 'rgba(255,255,255,0.12)',
                background: country === c ? 'rgba(20,184,166,0.1)' : 'transparent',
                color: country === c ? '#14B8A6' : 'rgba(255,255,255,0.45)',
                fontWeight: country === c ? 700 : 500,
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
              {c === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'}
            </button>
          ))}
        </div>

        {/* Item picker */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Select an item to compare</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CATEGORIES.map(cat => {
              const items = countryItems.filter(i => i.category === cat.key)
              if (!items.length) return null
              return (
                <div key={cat.key}>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 2px', marginBottom: 4 }}>
                    {cat.icon} {cat.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {items.map(item => {
                      const hasData = itemsWithData.has(item.id)
                      const isSelected = selectedId === item.id
                      return (
                        <button key={item.id} onClick={() => setSelectedId(item.id)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, border: '1px solid',
                            borderColor: isSelected ? '#14B8A6' : hasData ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(20,184,166,0.12)' : 'transparent',
                            color: isSelected ? '#14B8A6' : hasData ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)',
                            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                          {item.label}
                          {hasData && !isSelected && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#14B8A6', flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {fetched && itemsWithData.size === 0 && (
            <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              No community prices yet for {country === 'CA' ? 'Canadian' : 'US'} cities. <a href="/prices/submit" style={{ color: '#14B8A6', textDecoration: 'none' }}>Submit the first one →</a>
            </div>
          )}
        </div>

        {/* Comparison chart */}
        {selectedId && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{selectedItem?.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{selectedItem?.unit} · {currency} prices</div>
              </div>
              {cityPrices.length > 0 && (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                  {cityPrices.length} {cityPrices.length === 1 ? 'city' : 'cities'} reporting
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, padding: 24, textAlign: 'center' }}>Loading…</div>
            ) : cityPrices.length === 0 ? (
              <div style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 8 }}>No data yet for this item</div>
                <a href={`/prices/submit`} style={{ color: '#14B8A6', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  Submit a price →
                </a>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                {cityPrices.map((city, i) => {
                  const barPct = (city.avg_price / maxPrice) * 100
                  const color  = barColor(i, cityPrices.length)
                  return (
                    <div key={city.id} style={{ padding: '14px 20px', borderBottom: i < cityPrices.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.12)', padding: '1px 6px', borderRadius: 4 }}>LOWEST</span>}
                          {i === cityPrices.length - 1 && cityPrices.length > 1 && <span style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 4 }}>HIGHEST</span>}
                          <a href={`/city/${city.id}`} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                            {city.label}
                          </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ color: 'white', fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>
                            ${city.avg_price.toFixed(2)}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{city.sample_count} reports</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {cityPrices.length > 1 && (
              <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'right' }}>
                Difference: {((cityPrices[cityPrices.length-1].avg_price / cityPrices[0].avg_price - 1) * 100).toFixed(0)}% between lowest and highest
              </div>
            )}
          </div>
        )}

        {/* Submit CTA */}
        <div style={{ padding: '20px 24px', background: 'rgba(20,184,166,0.04)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Know what things cost?</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Submit a price and help grow this dataset.</div>
          </div>
          <a href="/prices/submit" style={{ display: 'inline-block', padding: '10px 20px', background: '#14B8A6', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Submit a price →
          </a>
        </div>

      </div>
    </main>
  )
}
