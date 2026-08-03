'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  CA_CONFIG, US_CONFIG,
  rateInsight, cpiInsight, unemploymentInsight,
  type CountryConfig,
} from '@/lib/market-config'

// ── City news types ───────────────────────────────────────────────────────────
interface NewsItem  { title: string; link: string; date: string }
interface CityNews  { city: string; color: string; items: NewsItem[] }

// ── BoC Valet API ─────────────────────────────────────────────────────────────
const BOC_API = 'https://www.bankofcanada.ca/valet/observations/V39079/json?recent=1'

async function fetchBoCRate(): Promise<number | null> {
  try {
    const res = await fetch(BOC_API)
    if (!res.ok) return null
    const json = await res.json()
    const val = json?.observations?.[0]?.V39079?.v
    return val ? parseFloat(val) : null
  } catch {
    return null
  }
}

// ── Delta chip ────────────────────────────────────────────────────────────────
function Delta({ value, prev, unit = '%' }: { value: number; prev: number; unit?: string }) {
  const diff = parseFloat((value - prev).toFixed(2))
  if (diff === 0) return (
    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontWeight: 600 }}>— unchanged</span>
  )
  const up = diff > 0
  const color = up ? '#E86C2F' : '#14B8A6'
  return (
    <span style={{ color, fontSize: 12, fontWeight: 700 }}>
      {up ? '▲' : '▼'} {Math.abs(diff)}{unit} vs prior
    </span>
  )
}

// ── Full indicator card ───────────────────────────────────────────────────────
function IndicatorCard({
  label, value, displayValue, prev, unit, date, source, insight, isLive,
}: {
  label: string; value: number; displayValue: string; prev: number
  unit: string; date: string; source: string; insight: string; isLive?: boolean
}) {
  const diff = value - prev
  const improved = diff < 0
  const unchanged = diff === 0
  const dotColor = unchanged ? 'rgba(255,255,255,0.25)' : improved ? '#14B8A6' : '#E86C2F'

  return (
    <div style={{
      padding: '18px 20px', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
          {label}
        </span>
        {isLive && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#14B8A6', letterSpacing: '0.06em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#14B8A6', display: 'inline-block', animation: 'boc-pulse 2s infinite' }} />
            LIVE
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {displayValue}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
          <Delta value={value} prev={prev} unit={unit} />
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, margin: 0 }}>
        {insight}
      </p>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>
        {date} · {source}
      </div>
    </div>
  )
}

// ── Compact delta (no "vs prior" text) ────────────────────────────────────────
function CompactDelta({ value, prev, unit = '%' }: { value: number; prev: number; unit?: string }) {
  const diff = parseFloat((value - prev).toFixed(2))
  if (diff === 0) return (
    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 500 }}>—</span>
  )
  const up = diff > 0
  const color = up ? '#E86C2F' : '#14B8A6'
  return (
    <span style={{ color, fontSize: 12, fontWeight: 700 }}>
      {up ? '▲' : '▼'}{Math.abs(diff)}{unit}
    </span>
  )
}

// ── Compact indicator row (homepage) ──────────────────────────────────────────
type RowFreq = 'live' | 'monthly' | 'weekly'

const FREQ_STYLE: Record<RowFreq, { label: string; color: string; bg: string }> = {
  live:    { label: 'LIVE',    color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
  monthly: { label: 'Monthly', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.06)' },
  weekly:  { label: 'Weekly',  color: '#93C5FD', bg: 'rgba(147,197,253,0.10)' },
}

function CompactRow({
  label, value, displayValue, prev, unit, frequency,
}: {
  label: string; value: number; displayValue: string; prev: number
  unit: string; frequency: RowFreq
}) {
  const diff = value - prev
  const improved = diff < 0
  const unchanged = diff === 0
  const dotColor = unchanged ? 'rgba(255,255,255,0.22)' : improved ? '#14B8A6' : '#E86C2F'
  const freq = FREQ_STYLE[frequency]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 14px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0,
          animation: frequency === 'live' ? 'boc-pulse 2s infinite' : undefined,
        }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {displayValue}
        </span>
        <CompactDelta value={value} prev={prev} unit={unit} />
        <span style={{ fontSize: 10, fontWeight: 700, color: freq.color, background: freq.bg, padding: '1px 6px', borderRadius: 4, letterSpacing: '0.03em' }}>
          {freq.label}
        </span>
      </div>
    </div>
  )
}

// ── Compact card (one indicator, fills 1/3 width) ─────────────────────────────
function CompactCard({
  label, displayValue, value, prev, unit = '%', frequency,
}: {
  label: string; displayValue: string; value: number; prev: number
  unit?: string; frequency: RowFreq
}) {
  const diff = value - prev
  const improved = diff < 0
  const unchanged = diff === 0
  const dotColor = unchanged ? 'rgba(255,255,255,0.22)' : improved ? '#14B8A6' : '#E86C2F'
  const freq = FREQ_STYLE[frequency]

  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0,
          animation: frequency === 'live' ? 'boc-pulse 2s infinite' : undefined,
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>{label}</span>
      </div>
      {/* Value */}
      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: 10 }}>
        {displayValue}
      </div>
      {/* Delta + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CompactDelta value={value} prev={prev} unit={unit} />
        <span style={{ fontSize: 10, fontWeight: 700, color: freq.color, background: freq.bg, padding: '1px 6px', borderRadius: 4, letterSpacing: '0.03em' }}>
          {freq.label}
        </span>
      </div>
    </div>
  )
}

// ── 3-card grid for compact mode ──────────────────────────────────────────────
function CompactCards({ config, liveRate }: { config: CountryConfig; liveRate?: number | null }) {
  const rate = liveRate ?? config.rate.value
  const rateDisplay = config.rate.rangeHigh ? `${rate}–${config.rate.rangeHigh}%` : `${rate}%`
  const isCA = config.name === 'Canada'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <CompactCard label={`${config.centralBank.shortName} Rate`} displayValue={rateDisplay}
        value={rate} prev={config.rate.prev} frequency={isCA ? 'live' : 'monthly'} />
      <CompactCard label="CPI" displayValue={`${config.cpi.value}%`}
        value={config.cpi.value} prev={config.cpi.prev} frequency="monthly" />
      <CompactCard label="Unemployment" displayValue={`${config.unemployment.value}%`}
        value={config.unemployment.value} prev={config.unemployment.prev} frequency="monthly" />
    </div>
  )
}

// ── Country block (full) ──────────────────────────────────────────────────────
function FullCountry({ config, liveRate }: { config: CountryConfig; liveRate?: number | null }) {
  const country = config.name === 'Canada' ? 'CA' : 'US'
  const rate = liveRate ?? config.rate.value
  const rateDisplay = config.rate.rangeHigh ? `${rate}–${config.rate.rangeHigh}%` : `${rate}%`

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{config.flag}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{config.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', fontWeight: 500 }}>
            {config.centralBank.name} · {config.currency}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <IndicatorCard label={`${config.centralBank.shortName} Policy Rate`}
          value={rate} displayValue={rateDisplay} prev={config.rate.prev} unit="%"
          date={config.rate.date} source={config.rate.source}
          insight={rateInsight(country, rate, config.rate.prev)} isLive={country === 'CA'} />
        <IndicatorCard label="Inflation (CPI)"
          value={config.cpi.value} displayValue={`${config.cpi.value}%`} prev={config.cpi.prev} unit="%"
          date={config.cpi.date} source={config.cpi.source}
          insight={cpiInsight(country, config.cpi.value, config.cpi.prev)} />
        <IndicatorCard label="Unemployment Rate"
          value={config.unemployment.value} displayValue={`${config.unemployment.value}%`}
          prev={config.unemployment.prev} unit="%"
          date={config.unemployment.date} source={config.unemployment.source}
          insight={unemploymentInsight(country, config.unemployment.value, config.unemployment.prev)} />
      </div>
      <div style={{
        marginTop: 12, padding: '12px 16px',
        background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.12)',
        borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.55,
      }}>
        <span style={{ color: 'rgba(79,142,247,0.7)', fontWeight: 700, marginRight: 4 }}>🏠 Housing</span>
        {config.housingNote}
      </div>
    </div>
  )
}

// ── Country registry (extensible) ────────────────────────────────────────────
const COUNTRIES = [
  { code: 'CA', label: 'Canada',        flag: '🍁', config: CA_CONFIG },
  { code: 'US', label: 'United States', flag: '🇺🇸', config: US_CONFIG },
] as const

// ── Source footer ─────────────────────────────────────────────────────────────
function SourceFooter({ updatedAt, sources }: { updatedAt: string; sources: string[] }) {
  return (
    <div style={{
      marginTop: 12,
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      display: 'flex',
      gap: 28,
      flexWrap: 'wrap',
      alignItems: 'flex-start',
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: 3 }}>Updated</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontVariantNumeric: 'tabular-nums' }}>{updatedAt}</div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: 3 }}>Sources</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px' }}>
          {sources.map(s => (
            <span key={s} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function MarketPulse({ compact = false }: { compact?: boolean }) {
  const [bocRate, setBocRate]         = useState<number | null>(null)
  const [loading, setLoading]         = useState(true)
  const [selectedCode, setSelected]   = useState<string>('CA')

  // City news state
  const [news, setNews]               = useState<CityNews[]>([])
  const [newsCity, setNewsCity]       = useState(0)   // which city we're showing
  const [newsVisible, setNewsVisible] = useState(true) // for fade transition
  const newsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchBoCRate().then(r => { setBocRate(r); setLoading(false) })
  }, [])

  // Fetch city news once on mount
  useEffect(() => {
    fetch('/api/city-news')
      .then(r => r.ok ? r.json() : [])
      .then((data: CityNews[]) => { if (data.length) setNews(data) })
      .catch(() => {})
  }, [])

  // Rotate city every 8s with a fade transition
  useEffect(() => {
    if (news.length < 2) return
    const tick = () => {
      setNewsVisible(false)
      newsTimer.current = setTimeout(() => {
        setNewsCity(i => (i + 1) % news.length)
        setNewsVisible(true)
      }, 400) // 400ms fade-out before switching
    }
    const id = setInterval(tick, 8000)
    return () => { clearInterval(id); if (newsTimer.current) clearTimeout(newsTimer.current) }
  }, [news])

  const liveRate = loading ? undefined : bocRate
  const active = COUNTRIES.find(c => c.code === selectedCode) ?? COUNTRIES[0]

  if (compact) {
    return (
      <section style={{ background: '#070d1f', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <style>{`@keyframes boc-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: '#14B8A6' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>City Pulse</h2>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)' }}>Macro indicators</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Country switcher */}
              <select
                value={selectedCode}
                onChange={e => setSelected(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '6px 28px 6px 10px',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ffffff60' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#0d1f44' }}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
              <Link href="/pulse" style={{
                fontSize: 13, fontWeight: 600, color: '#4F8EF7', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                Full analysis <span style={{ opacity: 0.7 }}>→</span>
              </Link>
            </div>
          </div>

          {/* 3-card grid */}
          <CompactCards
            config={active.config}
            liveRate={active.code === 'CA' ? liveRate : undefined}
          />

          {/* Source footer — country-specific */}
          <SourceFooter updatedAt={active.config.updatedAt} sources={active.config.sources} />

          {/* ── City News Strip ─────────────────────────────────── */}
          {news.length > 0 && (() => {
            const current = news[newsCity]
            return (
              <div style={{
                marginTop: 14,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {/* Strip header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.01)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#EF4444',
                      display: 'inline-block', animation: 'boc-pulse 1.5s infinite', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                      City News
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>
                      Career · Housing · Prices · Business
                    </span>
                  </div>
                  {/* City dot nav */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {news.map((c, i) => (
                      <button
                        key={c.city}
                        onClick={() => { setNewsVisible(false); setTimeout(() => { setNewsCity(i); setNewsVisible(true) }, 200) }}
                        title={c.city}
                        style={{
                          width: i === newsCity ? 16 : 7,
                          height: 7,
                          borderRadius: 4,
                          background: i === newsCity ? c.color : 'rgba(255,255,255,0.18)',
                          border: 'none', cursor: 'pointer', padding: 0,
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Headlines — fade on city change */}
                <div style={{
                  padding: '12px 16px',
                  opacity: newsVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}>
                  {/* City badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: current.color, display: 'inline-block', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: current.color }}>
                      {current.city}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
                      via CBC News
                    </span>
                  </div>

                  {/* Up to 3 headlines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {current.items.slice(0, 3).map((item, j) => (
                      <a
                        key={j}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          textDecoration: 'none',
                          padding: '7px 10px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.025)',
                          border: `1px solid rgba(255,255,255,0.06)`,
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      >
                        <span style={{
                          width: 3, height: 3, borderRadius: '50%', background: current.color,
                          flexShrink: 0, marginTop: 6,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, display: 'block' }}>
                            {item.title}
                          </span>
                          {item.date && (
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2, display: 'block' }}>
                              {item.date}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: 2 }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>
    )
  }

  // shared country switcher select element
  const CountrySwitcher = () => (
    <select
      value={selectedCode}
      onChange={e => setSelected(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 8,
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        padding: '6px 28px 6px 10px',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ffffff60' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      {COUNTRIES.map(c => (
        <option key={c.code} value={c.code} style={{ background: '#0d1f44' }}>
          {c.flag} {c.label}
        </option>
      ))}
    </select>
  )

  return (
    <section style={{ background: '#070d1f', padding: '56px 24px' }}>
      <style>{`@keyframes boc-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: '#14B8A6' }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>City Pulse</h1>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)' }}>Macro indicators</span>
          </div>
          <CountrySwitcher />
        </div>

        <FullCountry
          config={active.config}
          liveRate={active.code === 'CA' ? liveRate : undefined}
        />

        <SourceFooter updatedAt={active.config.updatedAt} sources={active.config.sources} />

        <div style={{
          marginTop: 12, padding: '12px 18px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6,
        }}>
          Lakive housing scores (HPI Years, RPI) are updated separately, tied to CREA, CMHC, and Rentals.ca release calendars.
          Macro indicators provide economic context and do not automatically trigger score changes.
        </div>
      </div>
    </section>
  )
}
