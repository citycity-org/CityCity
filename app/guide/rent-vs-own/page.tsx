'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LakiveLogo } from '../../components/LakiveLogo'
import { OCCUPATIONS, CITIES } from '../_data'

// ── Constants ─────────────────────────────────────────────────────────────────
const MORTGAGE_RATE     = 0.045   // 4.5% annual fixed
const AMORTIZATION      = 25      // years
const DOWN_PCT          = 0.20    // 20% down payment
const HOME_APPR         = 0.035   // 3.5% annual home appreciation (Canadian long-run avg)
const RENT_INCREASE     = 0.03    // 3% annual rent increase
const INV_RETURN        = 0.055   // 5.5% annual investment return (balanced portfolio)
const RENTER_INS        = 20      // $/month renters insurance
const TRANSACTION_COST  = 0.025   // 2.5% of home price (land transfer tax + legal + inspection)

// Municipal property tax rates (annual % of assessed home value)
const PROP_TAX: Record<string, number> = {
  vancouver: 0.0028,   // BC — low rate due to very high assessed values
  toronto:   0.0063,   // ON
  calgary:   0.0062,   // AB
  montreal:  0.0094,   // QC
  ottawa:    0.0100,   // ON
}

const CA_CITIES = ['calgary', 'ottawa', 'montreal', 'toronto', 'vancouver']

const CITY_FLAGS: Record<string, string> = {
  vancouver: '🌊', toronto: '🏙️', calgary: '🏔️', montreal: '🎭', ottawa: '🏛️',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt$(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

function fmtK(n: number): string {
  return '$' + Math.round(n / 1000) + 'K'
}

// Monthly mortgage payment (principal + interest)
function pmt(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 12
  const n = years * 12
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
}

// ── Core calculation ──────────────────────────────────────────────────────────
interface RentOwnResult {
  homePrice:          number
  downPayment:        number
  monthlyMortgage:    number
  monthlyTax:         number
  monthlyMaintenance: number
  monthlyInsurance:   number
  monthlyOwning:      number
  monthlyRent:        number
  monthlyCostGap:     number   // owning - renting (positive = owning costs more each month)
  breakevenYears:     number | null  // null = doesn't break even within 30 years
  yearlySnapshots:    { year: number; ownerNW: number; renterNW: number }[]
}

function computeRentOwn(occSlug: string, citySlug: string): RentOwnResult | null {
  const city = CITIES[citySlug]
  if (!city || city.country === 'US') return null

  const benchmarkSalary = city.benchmarkSalary ?? 75000
  const homePrice   = Math.round(city.benchmarkHpi * benchmarkSalary / 5000) * 5000
  const downPayment = homePrice * DOWN_PCT
  const mortgage    = homePrice * (1 - DOWN_PCT)

  const monthlyMortgage    = pmt(mortgage, MORTGAGE_RATE, AMORTIZATION)
  const monthlyTax         = homePrice * (PROP_TAX[citySlug] ?? 0.008) / 12
  const monthlyMaintenance = homePrice * 0.01 / 12   // 1%/yr strata + maintenance
  const monthlyInsurance   = 150
  const monthlyOwning      = monthlyMortgage + monthlyTax + monthlyMaintenance + monthlyInsurance
  const monthlyRent        = city.avgRent2BR + RENTER_INS

  // ── Year-by-year net worth simulation ─────────────────────────────────────
  // Buying incurs upfront transaction costs (land transfer tax, legal, inspection)
  const txCost = homePrice * TRANSACTION_COST  // permanent owner disadvantage at start

  let homeValue          = homePrice
  let mortgageBalance    = mortgage
  let downPaymentAccount = downPayment   // renter invests down payment
  let savingsAccount     = 0             // renter invests monthly savings (or pays extra rent)
  let currentRent        = monthlyRent
  let breakevenYears: number | null = null
  const yearlySnapshots: { year: number; ownerNW: number; renterNW: number }[] = []

  for (let year = 1; year <= 30; year++) {
    // Owner: home appreciates, mortgage balance decreases
    homeValue *= (1 + HOME_APPR)
    const annualInterest  = mortgageBalance * MORTGAGE_RATE
    const annualPrincipal = Math.min(mortgageBalance, monthlyMortgage * 12 - annualInterest)
    mortgageBalance = Math.max(0, mortgageBalance - annualPrincipal)
    // Deduct transaction costs from owner's effective equity (permanent sunk cost)
    const ownerNW = homeValue - mortgageBalance - txCost

    // Renter: down payment grows; positive gap = renter saves the difference,
    // negative gap (when rent exceeds ownership cost) = renter pays the extra
    downPaymentAccount *= (1 + INV_RETURN)
    const yearlyGap = (monthlyOwning - currentRent) * 12   // can be negative
    savingsAccount  = (savingsAccount + yearlyGap) * (1 + INV_RETURN)
    const renterNW  = downPaymentAccount + savingsAccount

    yearlySnapshots.push({ year, ownerNW, renterNW })

    if (ownerNW > renterNW && breakevenYears === null) {
      breakevenYears = year
    }

    currentRent *= (1 + RENT_INCREASE)
  }

  return {
    homePrice, downPayment, monthlyMortgage, monthlyTax,
    monthlyMaintenance, monthlyInsurance, monthlyOwning,
    monthlyRent, monthlyCostGap: monthlyOwning - monthlyRent,
    breakevenYears, yearlySnapshots,
  }
}

function breakevenColor(years: number | null): string {
  if (years === null) return '#EF4444'
  if (years <= 8)  return '#14B8A6'
  if (years <= 12) return '#10B981'
  if (years <= 18) return '#F59E0B'
  if (years <= 25) return '#E86C2F'
  return '#EF4444'
}

function breakevenLabel(years: number | null): string {
  if (years === null) return 'Does not break even within 30 years'
  if (years <= 5)  return 'Buying makes sense quickly'
  if (years <= 8)  return 'Good case for buying'
  if (years <= 12) return 'Moderate case for buying'
  if (years <= 18) return 'Patience required — long horizon'
  return 'Renting is likely better for most timelines'
}

// ── Occupation list (CA-relevant, sorted) ─────────────────────────────────────
const OCC_OPTIONS = Object.entries(OCCUPATIONS)
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([slug, data]) => ({ slug, name: data.name }))

// ── Component ─────────────────────────────────────────────────────────────────
function RentVsOwnContent() {
  const params = useSearchParams()
  const [selectedOcc,  setSelectedOcc]  = useState(params.get('occ')  || 'software-engineer')
  const [selectedCity, setSelectedCity] = useState(params.get('city') || 'vancouver')

  const result = useMemo(
    () => computeRentOwn(selectedOcc, selectedCity),
    [selectedOcc, selectedCity]
  )

  const allCityResults = useMemo(
    () => CA_CITIES.map(c => ({ city: c, data: computeRentOwn(selectedOcc, c) })),
    [selectedOcc]
  )

  // Simple bar chart: max ownerNW or renterNW across 30 years
  const chartMax = result
    ? Math.max(...result.yearlySnapshots.map(s => Math.max(s.ownerNW, s.renterNW)))
    : 1

  return (
    <div style={{ background: '#080c14', minHeight: '100vh', color: 'white' }}>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Logo + breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <LakiveLogo size={20} theme="dark" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Link href="/guide" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, textDecoration: 'none' }}>Guides</Link>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12 }}>Rent vs Own</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            Rent or Buy? The Math by Occupation.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 620 }}>
            Whether buying makes financial sense depends on your salary, your city, and how long you plan to stay.
            This tool runs a year-by-year simulation comparing the net worth of an owner vs a renter — for your specific occupation and city.
          </p>
        </div>

        {/* ── Selectors ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {/* Occupation */}
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              Occupation
            </label>
            <select
              value={selectedOcc}
              onChange={e => setSelectedOcc(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, cursor: 'pointer' }}
            >
              {OCC_OPTIONS.map(o => (
                <option key={o.slug} value={o.slug} style={{ background: '#1a2035' }}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div style={{ flex: '0 1 200px' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              City
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CA_CITIES.map(c => (
                <button key={c} onClick={() => setSelectedCity(c)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: c === selectedCity ? 'rgba(20,184,166,0.20)' : 'rgba(255,255,255,0.05)',
                    color: c === selectedCity ? '#14B8A6' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.15s',
                  }}>
                  {CITY_FLAGS[c]} {CITIES[c]?.displayName ?? c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* ── Main results card ────────────────────────────────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 20 }}>

              {/* Home price header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Median 2-Bedroom Home · {CITIES[selectedCity]?.displayName}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace' }}>{fmt$(result.homePrice)}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>
                    Down payment required: <strong style={{ color: 'white' }}>{fmt$(result.downPayment)}</strong>
                  </span>
                </div>
              </div>

              {/* Monthly cost comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>

                {/* Renting */}
                <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, color: '#4F8EF7', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Renting</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: '#4F8EF7', marginBottom: 4 }}>
                    {fmt$(result.monthlyRent)}<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
                    Rent: {fmt$(result.monthlyRent - RENTER_INS)}<br />
                    Insurance: ${RENTER_INS}/mo<br />
                    <strong style={{ color: 'rgba(79,142,247,0.60)' }}>Down payment → invests at 6%/yr</strong>
                  </div>
                </div>

                {/* Owning */}
                <div style={{ background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.18)', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, color: '#14B8A6', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Owning</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: '#14B8A6', marginBottom: 4 }}>
                    {fmt$(result.monthlyOwning)}<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
                    Mortgage: {fmt$(result.monthlyMortgage)}<br />
                    Property tax: {fmt$(result.monthlyTax)}<br />
                    Maintenance: {fmt$(result.monthlyMaintenance)}<br />
                    Insurance: {fmt$(result.monthlyInsurance)}
                  </div>
                </div>
              </div>

              {/* Monthly gap */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Monthly cost of owning vs renting</span>
                <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: result.monthlyCostGap > 0 ? '#F59E0B' : '#14B8A6' }}>
                  {result.monthlyCostGap > 0 ? '+' : ''}{fmt$(result.monthlyCostGap)}/mo
                </span>
              </div>

              {/* Breakeven verdict */}
              <div style={{
                border: `1.5px solid ${breakevenColor(result.breakevenYears)}33`,
                background: `${breakevenColor(result.breakevenYears)}11`,
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Breakeven Point
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>
                    {breakevenLabel(result.breakevenYears)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'monospace', color: breakevenColor(result.breakevenYears), lineHeight: 1 }}>
                    {result.breakevenYears === null ? '30+' : result.breakevenYears}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>years to stay</div>
                </div>
              </div>
            </div>

            {/* ── Net worth chart ───────────────────────────────────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 20 }}>
                Net Worth Over Time — Owner vs Renter
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                {[
                  { label: 'Owner equity', color: '#14B8A6' },
                  { label: 'Renter investments', color: '#4F8EF7' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 3, background: l.color, borderRadius: 2 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Bar chart (every 5 years) */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
                {result.yearlySnapshots
                  .filter(s => s.year % 5 === 0 || s.year === 1)
                  .map(s => {
                    const ownerH = Math.round((s.ownerNW / chartMax) * 100)
                    const renterH = Math.round((s.renterNW / chartMax) * 100)
                    const ownerAhead = s.ownerNW > s.renterNW
                    return (
                      <div key={s.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 100 }}>
                          <div style={{ flex: 1, background: ownerAhead ? '#14B8A6' : 'rgba(20,184,166,0.4)', borderRadius: '3px 3px 0 0', height: `${ownerH}%`, minHeight: 2, transition: 'height 0.3s' }} />
                          <div style={{ flex: 1, background: !ownerAhead ? '#4F8EF7' : 'rgba(79,142,247,0.4)', borderRadius: '3px 3px 0 0', height: `${renterH}%`, minHeight: 2, transition: 'height 0.3s' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>Yr {s.year}</div>
                      </div>
                    )
                  })}
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
                Brighter bar = higher net worth that year. Assumptions: 3.5% home appreciation, 3% annual rent increase, 5.5% investment return, 2.5% transaction costs at purchase.
              </div>
            </div>

            {/* ── City comparison table ─────────────────────────────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 20 }}>
                All Cities — {OCCUPATIONS[selectedOcc]?.name ?? selectedOcc}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allCityResults
                  .filter(r => r.data !== null)
                  .sort((a, b) => {
                    const ay = a.data?.breakevenYears ?? 99
                    const by = b.data?.breakevenYears ?? 99
                    return ay - by
                  })
                  .map(({ city, data }) => {
                    if (!data) return null
                    const isSelected = city === selectedCity
                    return (
                      <button key={city} onClick={() => setSelectedCity(city)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          background: isSelected ? 'rgba(20,184,166,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'rgba(20,184,166,0.25)' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18 }}>{CITY_FLAGS[city]}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: isSelected ? 700 : 400, color: 'white' }}>
                              {CITIES[city]?.displayName ?? city}
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                              {fmtK(data.homePrice)} home · {fmt$(data.monthlyOwning)}/mo to own · {fmt$(data.monthlyRent - RENTER_INS)}/mo to rent
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: breakevenColor(data.breakevenYears) }}>
                            {data.breakevenYears === null ? '30+' : data.breakevenYears} yr
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)' }}>breakeven</div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* ── Verdict box ───────────────────────────────────────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
                Quick Guide
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#4F8EF7', marginBottom: 8 }}>Renting makes sense if…</div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 2 }}>
                    <li>You plan to stay {result.breakevenYears !== null && result.breakevenYears <= 25 ? `less than ${result.breakevenYears} years` : 'fewer than 30 years'}</li>
                    <li>You want flexibility to move</li>
                    <li>You can invest the down payment</li>
                    <li>Your career is still in transition</li>
                  </ul>
                </div>
                <div style={{ background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#14B8A6', marginBottom: 8 }}>Buying makes sense if…</div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 2 }}>
                    <li>You plan to stay {result.breakevenYears !== null ? `${result.breakevenYears}+ years` : 'long-term'}</li>
                    <li>You want stable housing costs</li>
                    <li>You value building equity</li>
                    <li>You have the down payment ready</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Assumptions ───────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
            Model Assumptions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {[
              { label: 'Mortgage rate',      value: '4.5% fixed' },
              { label: 'Amortization',        value: '25 years' },
              { label: 'Down payment',        value: '20%' },
              { label: 'Home appreciation',   value: '3.5%/yr' },
              { label: 'Annual rent increase', value: '3%/yr' },
              { label: 'Investment return',   value: '5.5%/yr' },
              { label: 'Maintenance',         value: '1%/yr of home value' },
              { label: 'Transaction costs',   value: '2.5% of home price' },
              { label: 'Property',            value: '2-bedroom condo/home' },
            ].map(a => (
              <div key={a.label} style={{ minWidth: 160 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{a.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
            Home prices are based on median benchmark prices for each city (H1 2026). Transaction costs include land transfer tax, legal fees, and inspection (~2.5% of purchase price). This model is a simplified financial comparison and does not account for individual tax situations, condo fees, or market timing. It is for educational purposes only and not financial advice.
          </div>
        </div>

        {/* ── Related links ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/ranking" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none' }}>
            → City Rankings
          </Link>
          <Link href="/compare" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none' }}>
            → Compare Two Cities
          </Link>
          <Link href="/calculate" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none' }}>
            → City Fit Calculator
          </Link>
        </div>

      </main>
    </div>
  )
}

export default function RentVsOwnPage() {
  return (
    <Suspense>
      <RentVsOwnContent />
    </Suspense>
  )
}
