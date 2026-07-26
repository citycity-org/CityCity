'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CA_CONFIG, US_CONFIG,
  rateInsight, cpiInsight, unemploymentInsight,
  type CountryConfig,
} from '@/lib/market-config'

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
function CompactRow({
  label, value, displayValue, prev, unit, date, isLive,
}: {
  label: string; value: number; displayValue: string; prev: number
  unit: string; date: string; isLive?: boolean
}) {
  const diff = value - prev
  const improved = diff < 0
  const unchanged = diff === 0
  const dotColor = unchanged ? 'rgba(255,255,255,0.22)' : improved ? '#14B8A6' : '#E86C2F'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0,
          animation: isLive ? 'boc-pulse 2s infinite' : undefined }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {displayValue}
        </span>
        <CompactDelta value={value} prev={prev} unit={unit} />
        {isLive && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#14B8A6', letterSpacing: '0.05em', background: 'rgba(20,184,166,0.12)', padding: '1px 5px', borderRadius: 4 }}>LIVE</span>
        )}
      </div>
    </div>
  )
}

// ── Country block (compact) ───────────────────────────────────────────────────
function CompactCountry({ config, liveRate }: { config: CountryConfig; liveRate?: number | null }) {
  const rate = liveRate ?? config.rate.value
  const rateDisplay = config.rate.rangeHigh ? `${rate}–${config.rate.rangeHigh}%` : `${rate}%`
  const isCA = config.name === 'Canada'

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{config.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)' }}>{config.name}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>· {config.currency}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <CompactRow label={`${config.centralBank.shortName} Rate`} value={rate} displayValue={rateDisplay}
          prev={config.rate.prev} unit="%" date={config.rate.date} isLive={isCA} />
        <CompactRow label="CPI" value={config.cpi.value} displayValue={`${config.cpi.value}%`}
          prev={config.cpi.prev} unit="%" date={config.cpi.date} />
        <CompactRow label="Unemployment" value={config.unemployment.value} displayValue={`${config.unemployment.value}%`}
          prev={config.unemployment.prev} unit="%" date={config.unemployment.date} />
      </div>
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

// All sources combined (shown in footer regardless of selected country)
const ALL_SOURCES = [
  'Bank of Canada', 'Statistics Canada', 'CMHC',
  'Federal Reserve', 'U.S. Bureau of Labor Statistics',
]

// ── Source footer ─────────────────────────────────────────────────────────────
function SourceFooter({ updatedAt }: { updatedAt: string }) {
  return (
    <div style={{
      marginTop: 20,
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      display: 'flex',
      gap: 32,
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: 4 }}>Updated</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontVariantNumeric: 'tabular-nums' }}>{updatedAt}</div>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: 4 }}>Sources</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px' }}>
          {ALL_SOURCES.map(s => (
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

  useEffect(() => {
    fetchBoCRate().then(r => { setBocRate(r); setLoading(false) })
  }, [])

  const liveRate = loading ? undefined : bocRate
  const active = COUNTRIES.find(c => c.code === selectedCode) ?? COUNTRIES[0]

  if (compact) {
    return (
      <section style={{ background: '#070d1f', padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <style>{`@keyframes boc-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: '#14B8A6' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Market Pulse</h2>
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

          {/* Single country data */}
          <CompactCountry
            config={active.config}
            liveRate={active.code === 'CA' ? liveRate : undefined}
          />

          {/* Source footer */}
          <SourceFooter updatedAt={CA_CONFIG.updatedAt} />
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: '#070d1f', padding: '56px 24px' }}>
      <style>{`@keyframes boc-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: '#14B8A6' }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Market Pulse</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)', margin: 0, marginTop: 2 }}>
                Macro indicators affecting housing affordability · Canada &amp; United States
              </p>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'right' }}>
            BoC rate: live API · Other data: monthly release
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          <FullCountry config={CA_CONFIG} liveRate={liveRate} />
          <FullCountry config={US_CONFIG} />
        </div>

        <SourceFooter updatedAt={CA_CONFIG.updatedAt} />

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
