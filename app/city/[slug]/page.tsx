'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: 'High'|'Mid'|'Low' }

// ── Score verdict ─────────────────────────────────────────────────────────────
function getVerdict(score: number, hpiYears?: number, rpi?: number) {
  const hasPressure = (hpiYears ?? 0) > 10 || (rpi ?? 0) > 38
  const note = (hpiYears ?? 0) > 10 ? ', high housing pressure' : (rpi ?? 0) > 38 ? ', elevated rent' : ''
  if (score >= 85) return { label: 'Highly Recommended', color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)' }
  if (score >= 70 && hasPressure) return { label: `Recommended${note}`, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)' }
  if (score >= 70) return { label: 'Recommended', color: '#14B8A6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.25)' }
  if (score >= 55) return { label: 'Neutral', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' }
  if (score >= 40) return { label: 'Caution', color: '#E86C2F', bg: 'rgba(232,108,47,0.10)', border: 'rgba(232,108,47,0.25)' }
  return { label: 'Not Recommended', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' }
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s: number) => s >= 80 ? '#14B8A6' : s >= 70 ? '#4F8EF7' : s >= 55 ? '#F59E0B' : s >= 40 ? '#E86C2F' : '#EF4444'
const hc = (y: number) => y<=5?'#14B8A6':y<=8?'#10B981':y<=12?'#F59E0B':y<=18?'#E86C2F':'#EF4444'
const hl = (y: number) => y<=5?'L1 Lower Pressure':y<=8?'L2 Manageable':y<=12?'L3 Under Pressure':y<=18?'L4 Difficult':'L5 Severe Pressure'
const rc = (r: number) => r<=25?'#14B8A6':r<=30?'#10B981':r<=38?'#F59E0B':r<=50?'#E86C2F':'#EF4444'
const rl = (r: number) => r<=25?'L1 Lower Pressure':r<=30?'L2 Manageable':r<=38?'L3 Under Pressure':r<=50?'L4 Difficult':'L5 Severe Pressure'
const dc = (v: number) => v >= 80 ? '#14B8A6' : v >= 65 ? '#60A5FA' : '#F59E0B'

// ── Dynamic headline ──────────────────────────────────────────────────────────
function getHeadline(cityName: string, occName: string, fit: OccFit) {
  if (fit.score >= 80) return `For ${occName}, ${cityName} is a serious option worth pursuing.`
  if (fit.score >= 70 && fit.hpiYears > 10) return `For ${occName} in ${cityName}, jobs aren't the issue — can income keep up with housing?`
  if (fit.score >= 70) return `For ${occName}, ${cityName} is decent overall, but a few key pressure points can't be ignored.`
  if (fit.score >= 55) return `For ${occName}, ${cityName} is a mix of opportunity and pressure — not an easy call.`
  return `For ${occName}, the cost of living in ${cityName} may be higher than you expect.`
}

// ── One-line summary ──────────────────────────────────────────────────────────
function getSummary(fit: OccFit, hpiYears: number, adjRpi: number): string {
  const job  = fit.eoi === 'High' ? 'Strong job market' : fit.eoi === 'Mid' ? 'Moderate job market' : 'Limited job market'
  const rent = adjRpi > 38 ? 'high rent pressure' : adjRpi > 30 ? 'elevated rent' : 'manageable rent'
  const buy  = hpiYears > 10 ? 'significant single-income housing burden' : hpiYears > 6 ? 'moderate buying pressure' : 'relatively accessible to buy'
  return `${job}, ${rent}, ${buy}.`
}

// ── Occupation-aware City Reality ─────────────────────────────────────────────
function getOccReality(cityName: string, occName: string, fit: OccFit) {
  const highHpi = fit.hpiYears > 10, highRpi = fit.rpi > 38, goodJob = fit.eoi === 'High'
  const bestFor = [
    goodJob ? `${occName}s with a stable employer or union pathway in ${cityName}` : `${occName}s with rare skills and a confirmed position in ${cityName}`,
    highHpi ? 'Dual-income households, or those with existing savings or family assets' : 'Those planning to buy soon and have already saved a down payment',
    highRpi ? 'People willing to co-rent or live in outer areas to lower costs' : 'Professionals wanting to live alone while maintaining reasonable savings',
    `Long-term settlers with a strong attachment to ${cityName}'s culture, nature, or community`,
  ]
  const hardFor = [
    highHpi ? `Single-income ${occName} households trying to buy in ${cityName}` : `Those with limited budget hoping to build a down payment quickly`,
    highRpi ? `Solo ${occName}s on lower-mid incomes who want to save aggressively` : 'Early-career earners carrying the full cost of living on their own',
    `Those who haven't yet built a local employer and project network`,
    'Single-income families hoping to own, save, and maintain quality of life within 5 years',
  ]
  let hiddenRisk: string
  if (highHpi && highRpi) hiddenRisk = `${occName} employment in ${cityName} is ${goodJob ? 'strong' : 'limited'}, but dual housing and rent pressure will steadily erode disposable income — long-term asset accumulation may lag other cities significantly.`
  else if (highHpi) hiddenRisk = `The core risk is housing cost. ${occName} price-to-income in ${cityName} is roughly ${fit.hpiYears}×. Without dual income or family assets, the path to ownership is long.`
  else if (highRpi) hiddenRisk = `Rent consumes ${fit.rpi}% of income, above the healthy 30% threshold. Even if buying is feasible, high rent during the transition period slows down savings.`
  else hiddenRisk = `Current data is relatively favorable, but watch long-term trends in home prices and rent, plus income volatility from industry cycles — these could shift today's advantage.`
  return { bestFor, hardFor, hiddenRisk }
}

// ── v4.0 composite score ──────────────────────────────────────────────────────
function computeScore(hpiYears: number, rpi: number, tai: number, eoi: number, hai: number, eqi: number, tci: number, psi: number): number {
  const hpiScore = hpiYears<6?92:hpiYears<8?82:hpiYears<10?70:hpiYears<12?58:hpiYears<16?45:30
  const rpiScore = rpi<25?90:rpi<30?82:rpi<35?72:rpi<40?60:rpi<45?48:35
  const housingScore = hpiScore * 0.55 + rpiScore * 0.45
  const cityScore    = eoi*0.22 + tai*0.20 + hai*0.20 + eqi*0.14 + tci*0.12 + psi*0.12
  return Math.max(10, Math.min(99, Math.round(housingScore * 0.52 + cityScore * 0.48)))
}

// ── Scenario-adjusted score ───────────────────────────────────────────────────
function getAdjScore(base: OccFit, priceMult: number, rentMult: number, tai: number, eoi: number, hai: number, eqi: number, tci: number, psi: number): number {
  const adjH = parseFloat((base.hpiYears * priceMult).toFixed(1))
  const adjR = Math.round(base.rpi * rentMult)
  return computeScore(adjH, adjR, tai, eoi, hai, eqi, tci, psi)
}

// ── Matrix tooltip ────────────────────────────────────────────────────────────
function getMatrixNote(occName: string, cityName: string, fit: OccFit) {
  const v   = getVerdict(fit.score, fit.hpiYears, fit.rpi)
  const job = fit.eoi === 'High' ? 'Strong job market' : fit.eoi === 'Mid' ? 'Decent job market' : 'Limited job market'
  const h   = fit.hpiYears > 14 ? `Price/income ${fit.hpiYears}×, extremely difficult to buy` : fit.hpiYears > 9 ? `Price/income ${fit.hpiYears}×, significant pressure` : `Price/income ${fit.hpiYears}× (relatively manageable)`
  return `${job}; ${h}; rent ${fit.rpi}% of income (${rl(fit.rpi)}). Overall: ${v.label}.`
}

// ── City base data ────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name: string; nameEn: string; province: string; short: string
  score: number; eoi: number; tai: number; hai: number; eqi: number; tci: number; psi: number; edi: number
  medianRent: number; basePrice: number; propertyTaxRate: number
  industries: string[]; winterC: number; summerC: number; sunnyDays: number; aqi: number; walkScore: number
  population: string; avgCommuteMin: number
  taiNote: string; taxSummary: string
  transferTax: (p: number) => number; transferTaxNote: string
}> = {
  vancouver: {
    name: 'Vancouver', nameEn: 'Vancouver', province: 'British Columbia', short: 'BC',
    score: 70, eoi: 80, tai: 72, hai: 88, eqi: 90, tci: 82, psi: 72, edi: 80,
    medianRent: 2950, basePrice: 1050000, propertyTaxRate: 0.00278,
    industries: ['Tech & Startups', 'Real Estate & Construction', 'Film & Creative', 'Port & Trade'],
    winterC: 4, summerC: 22, sunnyDays: 164, aqi: 42, walkScore: 82,
    population: '2.8M (metro)', avgCommuteMin: 30,
    taiNote: 'GST 5% + PST 7% (12% combined)',
    taxSummary: 'BC: GST 5% + PST 7%, non-HST province',
    transferTax: p => { let t = 0; if (p <= 200000) t = p * 0.01; else if (p <= 2000000) t = 2000 + (p - 200000) * 0.02; else t = 38000 + (p - 2000000) * 0.03; return Math.round(t) },
    transferTaxNote: 'BC PTT: 1% on first $200K, 2% on $200K–$2M, 3% above $2M',
  },
  toronto: {
    name: 'Toronto', nameEn: 'Toronto', province: 'Ontario', short: 'ON',
    score: 70, eoi: 92, tai: 68, hai: 90, eqi: 75, tci: 78, psi: 68, edi: 82,
    medianRent: 2750, basePrice: 980000, propertyTaxRate: 0.00715,
    industries: ['Finance & Banking', 'Tech & AI', 'Media & Entertainment', 'Manufacturing'],
    winterC: -4, summerC: 26, sunnyDays: 201, aqi: 48, walkScore: 78,
    population: '6.7M (metro)', avgCommuteMin: 34,
    taiNote: 'HST 13% (Ontario)',
    taxSummary: 'ON: HST 13%, Toronto also levies a municipal land transfer tax',
    transferTax: p => { let t = 0; if (p <= 55000) t = p * 0.005; else if (p <= 250000) t = 275 + (p - 55000) * 0.01; else if (p <= 400000) t = 2225 + (p - 250000) * 0.015; else if (p <= 2000000) t = 4475 + (p - 400000) * 0.02; else t = 36475 + (p - 2000000) * 0.025; return Math.round(t * 2) },
    transferTaxNote: 'Ontario + Toronto dual land transfer tax',
  },
  calgary: {
    name: 'Calgary', nameEn: 'Calgary', province: 'Alberta', short: 'AB',
    score: 72, eoi: 65, tai: 90, hai: 78, eqi: 82, tci: 48, psi: 78, edi: 72,
    medianRent: 1950, basePrice: 550000, propertyTaxRate: 0.00657,
    industries: ['Oil & Gas', 'Agriculture & Food', 'Tech & Startups', 'Construction & Infrastructure'],
    winterC: -9, summerC: 24, sunnyDays: 333, aqi: 32, walkScore: 48,
    population: '1.6M (metro)', avgCommuteMin: 26,
    taiNote: 'GST 5% only (no PST)',
    taxSummary: 'AB: No provincial sales tax (PST), only federal GST 5% — lowest combined tax in Canada',
    transferTax: p => Math.round(50 + (p / 5000) * 2),
    transferTaxNote: 'AB has no land transfer tax — only a land title registration fee (~$200–300)',
  },
  montreal: {
    name: 'Montréal', nameEn: 'Montréal', province: 'Québec', short: 'QC',
    score: 75, eoi: 72, tai: 42, hai: 75, eqi: 78, tci: 72, psi: 70, edi: 80,
    medianRent: 1850, basePrice: 580000, propertyTaxRate: 0.00531,
    industries: ['Aerospace', 'IT & Gaming', 'Pharma & Biotech', 'Finance & Insurance'],
    winterC: -10, summerC: 26, sunnyDays: 197, aqi: 39, walkScore: 72,
    population: '4.2M (metro)', avgCommuteMin: 32,
    taiNote: 'GST 5% + QST 9.975% (~15% combined)',
    taxSummary: 'QC: GST 5% + QST 9.975%; highest provincial income tax in Canada',
    transferTax: p => { let t = 0; if (p <= 61500) t = p * 0.005; else if (p <= 307800) t = 307.5 + (p - 61500) * 0.01; else if (p <= 552300) t = 2765.5 + (p - 307800) * 0.015; else t = 6432.5 + (p - 552300) * 0.02; return Math.round(t) },
    transferTaxNote: 'Québec Welcome Tax (Bienvenue Tax) — progressive rate',
  },
  ottawa: {
    name: 'Ottawa', nameEn: 'Ottawa', province: 'Ontario', short: 'ON',
    score: 73, eoi: 75, tai: 68, hai: 82, eqi: 80, tci: 55, psi: 82, edi: 85,
    medianRent: 2100, basePrice: 650000, propertyTaxRate: 0.01230,
    industries: ['Government & Public Service', 'High-Tech & Telecom', 'Tourism & Culture', 'Higher Education'],
    winterC: -10, summerC: 27, sunnyDays: 195, aqi: 35, walkScore: 55,
    population: '1.5M (metro)', avgCommuteMin: 28,
    taiNote: 'HST 13% (Ontario)',
    taxSummary: 'ON: HST 13%; Ottawa levies only provincial land transfer tax, no municipal surcharge',
    transferTax: p => { let t = 0; if (p <= 55000) t = p * 0.005; else if (p <= 250000) t = 275 + (p - 55000) * 0.01; else if (p <= 400000) t = 2225 + (p - 250000) * 0.015; else if (p <= 2000000) t = 4475 + (p - 400000) * 0.02; else t = 36475 + (p - 2000000) * 0.025; return Math.round(t) },
    transferTaxNote: 'Ontario land transfer tax (Ottawa has no municipal surcharge, unlike Toronto)',
  },
}

// ── Fit matrix ────────────────────────────────────────────────────────────────
const FIT_MATRIX: Record<string, Record<string, OccFit>> = {
  vancouver: {
    electrician:  { score: 72, hpiYears: 13.0, rpi: 42, eoi: 'High' },
    software_eng: { score: 84, hpiYears: 9.5,  rpi: 36, eoi: 'High' },
    nurse:        { score: 68, hpiYears: 12.8, rpi: 43, eoi: 'Mid'  },
    teacher:      { score: 62, hpiYears: 14.0, rpi: 46, eoi: 'Mid'  },
    truck_driver: { score: 52, hpiYears: 16.5, rpi: 54, eoi: 'Mid'  },
    accountant:   { score: 65, hpiYears: 15.2, rpi: 49, eoi: 'Mid'  },
    police:       { score: 70, hpiYears: 12.5, rpi: 41, eoi: 'High' },
    retail:       { score: 32, hpiYears: 26.0, rpi: 68, eoi: 'Mid'  },
  },
  toronto: {
    electrician:  { score: 70, hpiYears: 12.5, rpi: 40, eoi: 'High' },
    software_eng: { score: 88, hpiYears: 9.2,  rpi: 34, eoi: 'High' },
    nurse:        { score: 72, hpiYears: 12.0, rpi: 41, eoi: 'High' },
    teacher:      { score: 65, hpiYears: 13.2, rpi: 44, eoi: 'High' },
    truck_driver: { score: 55, hpiYears: 15.8, rpi: 52, eoi: 'Mid'  },
    accountant:   { score: 72, hpiYears: 13.8, rpi: 46, eoi: 'High' },
    police:       { score: 68, hpiYears: 11.8, rpi: 40, eoi: 'High' },
    retail:       { score: 30, hpiYears: 24.5, rpi: 65, eoi: 'Mid'  },
  },
  calgary: {
    electrician:  { score: 91, hpiYears: 3.9,  rpi: 24, eoi: 'High' },
    software_eng: { score: 78, hpiYears: 5.2,  rpi: 28, eoi: 'Mid'  },
    nurse:        { score: 86, hpiYears: 4.5,  rpi: 25, eoi: 'High' },
    teacher:      { score: 80, hpiYears: 5.8,  rpi: 28, eoi: 'Mid'  },
    truck_driver: { score: 82, hpiYears: 5.5,  rpi: 26, eoi: 'High' },
    accountant:   { score: 78, hpiYears: 6.2,  rpi: 30, eoi: 'Mid'  },
    police:       { score: 84, hpiYears: 4.8,  rpi: 25, eoi: 'High' },
    retail:       { score: 52, hpiYears: 13.2, rpi: 42, eoi: 'Mid'  },
  },
  montreal: {
    electrician:  { score: 68, hpiYears: 5.5,  rpi: 30, eoi: 'Mid' },
    software_eng: { score: 70, hpiYears: 5.2,  rpi: 28, eoi: 'Mid' },
    nurse:        { score: 65, hpiYears: 6.0,  rpi: 32, eoi: 'Mid' },
    teacher:      { score: 68, hpiYears: 5.8,  rpi: 30, eoi: 'Mid' },
    truck_driver: { score: 60, hpiYears: 7.2,  rpi: 36, eoi: 'Mid' },
    accountant:   { score: 62, hpiYears: 6.8,  rpi: 34, eoi: 'Mid' },
    police:       { score: 65, hpiYears: 6.5,  rpi: 32, eoi: 'Mid' },
    retail:       { score: 45, hpiYears: 13.5, rpi: 44, eoi: 'Low' },
  },
  ottawa: {
    electrician:  { score: 74, hpiYears: 6.8,  rpi: 28, eoi: 'Mid'  },
    software_eng: { score: 80, hpiYears: 6.2,  rpi: 26, eoi: 'High' },
    nurse:        { score: 82, hpiYears: 6.5,  rpi: 27, eoi: 'High' },
    teacher:      { score: 80, hpiYears: 7.0,  rpi: 28, eoi: 'High' },
    truck_driver: { score: 65, hpiYears: 8.5,  rpi: 34, eoi: 'Mid'  },
    accountant:   { score: 74, hpiYears: 7.8,  rpi: 30, eoi: 'Mid'  },
    police:       { score: 80, hpiYears: 6.8,  rpi: 28, eoi: 'High' },
    retail:       { score: 44, hpiYears: 16.0, rpi: 50, eoi: 'Low'  },
  },
}

const OCCUPATIONS = [
  { id: 'electrician',  name: 'Electrician'       },
  { id: 'software_eng', name: 'Software Engineer'  },
  { id: 'nurse',        name: 'Registered Nurse'   },
  { id: 'teacher',      name: 'Secondary Teacher'  },
  { id: 'truck_driver', name: 'Truck Driver'       },
  { id: 'accountant',   name: 'Accountant'         },
  { id: 'police',       name: 'Police Officer'     },
  { id: 'retail',       name: 'Retail Associate'   },
]
const OCC_NAMES: Record<string, string> = Object.fromEntries(OCCUPATIONS.map(o => [o.id, o.name]))

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1 Bedroom',     priceMult: 0.70, rentMult: 0.78, dbKey: '1br_condo' },
  { id: '2br',       label: '2 Bedrooms',    priceMult: 1.00, rentMult: 1.00, dbKey: '2br_condo' },
  { id: '3br',       label: '3 Bedrooms',    priceMult: 1.38, rentMult: 1.35, dbKey: '3br_condo' },
  { id: 'townhouse', label: 'Townhouse',      priceMult: 1.55, rentMult: 1.45, dbKey: '3br_condo' },
  { id: 'detached',  label: 'Detached House', priceMult: 2.20, rentMult: 1.70, dbKey: '3br_condo' },
]

// ── Section header ────────────────────────────────────────────────────────────
function SecHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 3, height: 22, borderRadius: 2, background: '#4F8EF7', flexShrink: 0 }} />
      <div>
        <h2 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{title}</h2>
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 500 }}>{sub}</span>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const city     = CITY_BASE[slug] ?? CITY_BASE.vancouver
  const matrix   = FIT_MATRIX[slug] ?? FIT_MATRIX.vancouver

  const [occ,        setOcc      ] = useState('electrician')
  const [propType,   setPropType ] = useState('2br')
  const [hoveredOcc, setHovered  ] = useState<string | null>(null)
  const [liveHpi,    setLiveHpi  ] = useState<number | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setOcc(p.get('occupation') ?? 'electrician')
  }, [])

  useEffect(() => {
    const pt = PROP_TYPES.find(p => p.id === propType)!
    setLiveHpi(null)
    supabase.from('housing_years').select('years_current')
      .eq('city_id', slug).eq('occupation_id', occ).eq('property_type', pt.dbKey)
      .single()
      .then(({ data }) => {
        const base = (matrix[occ] ?? matrix.electrician).hpiYears
        setLiveHpi(data
          ? parseFloat(String(data.years_current))
          : parseFloat((base * pt.priceMult).toFixed(1))
        )
      })
  }, [slug, occ, propType])

  const pt       = PROP_TYPES.find(p => p.id === propType)!
  const fit      = matrix[occ] ?? matrix.electrician
  const hpiYears = liveHpi ?? parseFloat((fit.hpiYears * pt.priceMult).toFixed(1))
  const adjPrice = Math.round(city.basePrice * pt.priceMult)
  const adjRent  = Math.round(city.medianRent * pt.rentMult)
  const adjRpi   = Math.round(fit.rpi * pt.rentMult)
  const occName  = OCC_NAMES[occ] ?? occ
  const ocrData  = getOccReality(city.name, occName, { ...fit, hpiYears, rpi: adjRpi })
  const headline = getHeadline(city.name, occName, { ...fit, hpiYears, rpi: adjRpi })
  const summary  = getSummary(fit, hpiYears, adjRpi)

  const taxAmt  = city.transferTax(adjPrice)
  const propTax = Math.round(adjPrice * city.propertyTaxRate)

  const tieredOccs = OCCUPATIONS.map(o => {
    const base     = matrix[o.id] ?? matrix.electrician
    const adjScore = getAdjScore(base, pt.priceMult, pt.rentMult, city.tai, city.eoi, city.hai, city.eqi, city.tci, city.psi)
    const adjHpi   = parseFloat((base.hpiYears * pt.priceMult).toFixed(1))
    const adjRpiO  = Math.round(base.rpi * pt.rentMult)
    return { ...o, fit: base, adjScore, adjHpi, adjRpiO }
  })
  const strongFit  = tieredOccs.filter(o => o.adjScore >= 75)
  const pressureZ  = tieredOccs.filter(o => o.adjScore >= 55 && o.adjScore < 75)
  const highRisk   = tieredOccs.filter(o => o.adjScore < 55)

  const ALL_CITY_IDS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']
  const rankList     = ALL_CITY_IDS
    .filter(id => FIT_MATRIX[id]?.[occ])
    .map(id => {
      const c = CITY_BASE[id]
      return { id, score: getAdjScore(FIT_MATRIX[id][occ], pt.priceMult, pt.rentMult, c.tai, c.eoi, c.hai, c.eqi, c.tci, c.psi) }
    })
    .sort((a, b) => b.score - a.score)
  const occRank     = rankList.findIndex(c => c.id === slug) + 1
  const totalCities = rankList.length
  const rankColor   = occRank === 1 ? '#14B8A6' : occRank === 2 ? '#60A5FA' : occRank === 3 ? '#F59E0B' : 'rgba(255,255,255,0.4)'

  const adjScore   = getAdjScore(fit, pt.priceMult, pt.rentMult, city.tai, city.eoi, city.hai, city.eqi, city.tci, city.psi)
  const vMain      = getVerdict(adjScore, hpiYears, adjRpi)

  const altSlug    = slug === 'vancouver' || slug === 'toronto' ? 'calgary' : 'vancouver'
  const altCity    = CITY_BASE[altSlug].name
  const isHighCost = hpiYears > 10 || adjRpi > 38
  const verdictLine = (() => {
    const c = city.name, o = occName
    if (propType === '1br') {
      if (adjScore >= 80) return `${c} has strong opportunities for ${o}. In the 1-bedroom scenario, housing pressure (${adjRpi}% / ${hpiYears} yrs income) is relatively manageable — a good starting option.`
      if (adjRpi > 38)    return `${c} still offers a solid foundation for ${o}, but rent at ${adjRpi}% of income in a 1BR will meaningfully limit savings pace.`
      if (hpiYears > 10)  return `For ${o} in ${c}, rent in a 1BR is acceptable, but price-to-income at ${hpiYears}× means buying still takes a long time.`
      return `For ${o} in ${c}, the 1BR scenario is broadly viable — a reasonable balance between opportunity and cost.`
    }
    if (propType === '3br') {
      if (hpiYears > 14)  return `For ${o} families needing space, ${c} raises the long-term bar for ownership significantly (${hpiYears} yrs income).`
      if (hpiYears > 10)  return `In a 3BR scenario, housing pressure in ${c} rises substantially (${hpiYears} yrs income) — typically requires dual income or existing assets.`
      if (adjRpi > 38)    return `${c} has family-sized space, but 3BR rent at ${adjRpi}% of income means the transitional cost before buying needs planning.`
      return `${c} in the 3BR scenario adds pressure, but remains a viable reference for ${o} families with stable dual income or asset support.`
    }
    if (propType === 'townhouse') {
      if (hpiYears > 16)  return `Townhouse ownership in ${c} requires ${hpiYears} yrs income — even dual-income ${o} households face a very long savings window.`
      if (hpiYears > 11)  return `${c} townhouse pressure is significant (${hpiYears} yrs income) — a key metric to assess before entering the family housing stage.`
      if (adjRpi > 40)    return `Townhouse rent is ${adjRpi}% of ${o} income. Short-term rental costs are high; factor buying into a 5–8 year plan.`
      return `${c} townhouse pressure is manageable for ${o} families with some existing savings — a realistic path to consider.`
    }
    if (propType === 'detached') {
      if (hpiYears > 18)  return `Detached homes in ${c} are beyond the realistic reach of most ${o}s (${hpiYears} yrs income). Consider another city or property type.`
      if (hpiYears > 12)  return `Buying a detached home in ${c} takes ${hpiYears} yrs income — typically requires strong dual income, existing assets, or 10+ years of savings.`
      if (adjRpi > 40)    return `Detached house rent is high (${adjRpi}% of income). For ${o}s, renting detached has poor cost-efficiency; plan for purchase.`
      return `Detached homes in ${c} are within reach in the current scenario — suited to ${o}s with a medium-long settlement plan and stable finances.`
    }
    // 2BR default
    if (adjScore >= 80) return `${c} is well-suited to ${o}s with an established career. Excellent fit score in the 2BR scenario.`
    if (adjScore >= 70 && isHighCost) return `${c} suits ${o}s with stable careers, dual income, or existing assets.`
    if (adjScore >= 70) return `${c} is broadly positive for ${o} — there's an actionable path, but key pressure points need advance planning.`
    if (adjScore >= 55) return `${c} isn't an easy choice for ${o} — opportunity and pressure coexist. Compare carefully before deciding.`
    return `From a cost-of-living perspective, ${c} is not the optimal city for ${o} — systemic pressure exceeds most people's tolerance.`
  })()

  return (
    <main style={{ minHeight: '100vh', background: '#0d1117' }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
        .score-sidebar { position: sticky; top: 24px; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .score-sidebar { position: relative !important; top: auto !important; }
        }
        .occ-btn { transition: all 0.15s; }
        .occ-btn:hover { opacity: 0.85; }
        .matrix-row:hover { background: rgba(79,142,247,0.06) !important; }
        .occ-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 600px) { .occ-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; } }
      `}</style>

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg,#0d1117 0%,#151827 70%,#1a2035 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 48px' }}>
          <a href="/ranking" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, display: 'inline-block', marginBottom: 28, textDecoration: 'none' }}>← Back to Rankings</a>

          <div className="hero-grid">
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', gap: 6, marginBottom: 18 }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#93C5FD', fontSize: 11, fontWeight: 600 }}>{city.province}</span>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{city.nameEn}</span>
              </div>

              <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, lineHeight: 1.3, marginBottom: 28, letterSpacing: '-0.3px', maxWidth: 520 }}>
                {headline}
              </h1>

              {/* Occupation selector */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Select Occupation</div>
                <div className="occ-tabs">
                  {OCCUPATIONS.map(o => {
                    const sel = occ === o.id
                    return (
                      <button key={o.id} className="occ-btn" onClick={() => setOcc(o.id)}
                        style={{
                          padding: '7px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                          fontWeight: sel ? 700 : 500, border: 'none', outline: 'none', whiteSpace: 'nowrap',
                          background: sel ? 'linear-gradient(135deg,#14B8A6,#4F8EF7)' : 'rgba(255,255,255,0.06)',
                          color: sel ? 'white' : 'rgba(255,255,255,0.5)',
                          boxShadow: sel ? '0 2px 12px rgba(20,184,166,0.25)' : 'none',
                        }}>
                        {o.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: score sidebar */}
            <div className="score-sidebar">
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: '24px 24px 20px', backdropFilter: 'blur(10px)' }}>

                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 12 }}>{occName} × {city.name}</div>

                {/* Property type toggle */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>Housing Scenario</span>
                    <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 10 }}>affects rent, price & housing pressure</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
                    {PROP_TYPES.slice(0,3).map(p => (
                      <button key={p.id} onClick={() => { setPropType(p.id); setLiveHpi(null) }}
                        style={{ padding: '6px 0', borderRadius: 7, fontSize: 12, fontWeight: p.id === propType ? 700 : 500, cursor: 'pointer', border: 'none', background: p.id === propType ? 'rgba(255,255,255,0.10)' : 'transparent', color: p.id === propType ? 'white' : 'rgba(255,255,255,0.30)', transition: 'all 0.15s' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, marginTop: 3 }}>
                    {PROP_TYPES.slice(3).map(p => (
                      <button key={p.id} onClick={() => { setPropType(p.id); setLiveHpi(null) }}
                        style={{ padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: p.id === propType ? 700 : 500, cursor: 'pointer', border: `1px solid ${p.id === propType ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`, background: p.id === propType ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.02)', color: p.id === propType ? 'white' : 'rgba(255,255,255,0.30)', transition: 'all 0.15s' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>
                    Current scenario: {pt.label} ·{' '}
                    {propType === '1br' ? 'Solo / Couple' :
                     propType === '2br' ? 'Small Family' :
                     propType === '3br' ? 'Larger Family' :
                     propType === 'townhouse' ? 'Row / Townhouse' : 'Private Yard'}
                  </div>
                </div>

                {/* Big score */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: sc(adjScore), fontSize: 68, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-4px' }}>
                    {adjScore}
                    <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>/100</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: vMain.bg, color: vMain.color, border: `1px solid ${vMain.border}` }}>
                      {vMain.label}
                    </span>
                    {occRank > 0 && (
                      <a href={`/ranking?occupation=${occ}&current=${slug}&housing=${propType}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: rankColor, textDecoration: 'none' }}>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>Rank</span>#{occRank}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>/{totalCities}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 3 key metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Employment',    value: fit.eoi,              sub: fit.eoi === 'High' ? 'Strong' : fit.eoi === 'Mid' ? 'Moderate' : 'Limited', color: fit.eoi === 'High' ? '#14B8A6' : fit.eoi === 'Mid' ? '#F59E0B' : '#EF4444' },
                    { label: 'Rent / Income', value: `${adjRpi}%`,         sub: rl(adjRpi), color: rc(adjRpi) },
                    { label: 'Years to Buy',  value: `${hpiYears} yrs`,    sub: hl(hpiYears), color: hc(hpiYears) },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 9 }}>
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{m.label}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: m.color, fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{m.value}</span>
                        <span style={{ color: m.color, fontSize: 10, marginLeft: 5, opacity: 0.75 }}>{m.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* One-line summary */}
                <div style={{ padding: '10px 12px', background: `${vMain.color}0E`, border: `1px solid ${vMain.color}22`, borderRadius: 10 }}>
                  <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{summary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* ── 2. OCCUPATION FIT MATRIX ──────────────────────────────────── */}
        <section>
          <SecHeader title="Occupation Fit Matrix" sub="Same city, very different outcomes by profession" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.8fr 0.7fr 0.6fr 1.2fr', gap: 8, padding: '6px 20px 10px', borderBottom: '1px solid rgba(255,255,255,0.10)', marginBottom: 4 }}>
            {['Occupation', `Fit Score · ${pt.label}`, 'Yrs to Buy', 'Rent %', 'Jobs', 'Verdict'].map(h => (
              <span key={h} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { tier: 'Strong Fit',                items: strongFit, color: '#14B8A6', bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.15)' },
              { tier: 'Recommended with Pressure', items: pressureZ, color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
              { tier: 'High Risk',                 items: highRisk,  color: '#EF4444', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.15)' },
            ].filter(t => t.items.length > 0).map(tier => (
              <div key={tier.tier} style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${tier.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tier.color }} />
                  <span style={{ color: tier.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>{tier.tier}</span>
                </div>
                {tier.items.map((o, i) => {
                  const v   = getVerdict(o.adjScore, o.adjHpi, o.adjRpiO)
                  const sel = occ === o.id
                  return (
                    <div key={o.id} className="matrix-row"
                      onClick={() => setOcc(o.id)}
                      onMouseEnter={() => setHovered(o.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.8fr 0.7fr 0.6fr 1.2fr', gap: 8, padding: '11px 20px', cursor: 'pointer', background: sel ? 'rgba(79,142,247,0.08)' : 'transparent', borderBottom: i < tier.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: sel ? '#FFFFFF' : 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: sel ? 700 : 400 }}>{o.name}</span>
                        {sel && <span style={{ fontSize: 8, color: '#93C5FD' }}>●</span>}
                      </div>
                      <div style={{ color: sc(o.adjScore), fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>{o.adjScore}</div>
                      <div style={{ color: hc(o.adjHpi), fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>{o.adjHpi}×</div>
                      <div style={{ color: rc(o.adjRpiO), fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>{o.adjRpiO}%</div>
                      <div style={{ color: o.fit.eoi === 'High' ? '#14B8A6' : o.fit.eoi === 'Mid' ? '#F59E0B' : '#EF4444', fontSize: 13, fontWeight: 700 }}>{o.fit.eoi}</div>
                      <div>
                        {hoveredOcc === o.id
                          ? <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, lineHeight: 1.4 }}>{getMatrixNote(o.name, city.name, { ...o.fit, hpiYears: o.adjHpi, rpi: o.adjRpiO, score: o.adjScore })}</span>
                          : <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>{v.label.split(',')[0]}</span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. CITY SNAPSHOT ──────────────────────────────────────────── */}
        <section>
          <SecHeader title="City Facts" sub="Geography, climate, commute & key industries" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { label: 'Metro Population', value: city.population },
              { label: 'Climate · Winter/Summer', value: `${city.winterC > 0 ? '+' : ''}${city.winterC}°C / +${city.summerC}°C` },
              { label: 'Sunny Days / Year', value: `${city.sunnyDays} days` },
              { label: 'Air Quality AQI', value: String(city.aqi), note: city.aqi < 40 ? 'Excellent' : city.aqi < 60 ? 'Good' : 'Moderate' },
              { label: 'Avg Commute', value: `${city.avgCommuteMin} min` },
              { label: 'Walk Score', value: `${city.walkScore} / 100` },
              { label: 'Sales Tax', value: city.taiNote.split('(')[0].trim() },
              { label: 'Key Industries', value: city.industries.slice(0, 2).join(' · ') },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 5 }}>{item.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
                {'note' in item && item.note && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 2 }}>{item.note}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. CITY REALITY ───────────────────────────────────────────── */}
        <section>
          <SecHeader title={`Reality Check: ${city.name} for ${occName}`} sub="Dynamically generated from your occupation perspective" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Best for */}
            <div style={{ background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.22)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ color: '#14B8A6', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>BEST FIT FOR</div>
              {ocrData.bestFor.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14B8A6', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Hard for */}
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ color: '#EF4444', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>HIGHER PRESSURE FOR</div>
              {ocrData.hardFor.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Hidden risk */}
          <div style={{ marginTop: 10, padding: '13px 16px', background: 'rgba(232,108,47,0.07)', border: '1px solid rgba(232,108,47,0.22)', borderRadius: 12, display: 'flex', gap: 10 }}>
            <span style={{ color: '#E86C2F', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Core Risk</span>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ocrData.hiddenRisk}</p>
          </div>
        </section>

        {/* ── 5. HOUSING REALITY ────────────────────────────────────────── */}
        <section>
          <SecHeader title="Housing Reality" sub="Renting and buying are very different calculations" />
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '14px 22px', borderRight: '1px solid rgba(255,255,255,0.06)', background: rc(adjRpi) + '0A' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Rent · {pt.label}</span>
                <span style={{ color: rc(adjRpi), fontWeight: 800, fontSize: 14, marginLeft: 10 }}>{rl(adjRpi)}</span>
              </div>
              <div style={{ padding: '14px 22px', background: hc(hpiYears) + '0A' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Buy · {pt.label}</span>
                <span style={{ color: hc(hpiYears), fontWeight: 800, fontSize: 14, marginLeft: 10 }}>{hl(hpiYears)}</span>
              </div>
            </div>

            {/* Data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* Rent panel */}
              <div style={{ padding: '20px 22px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                  {[
                    { label: '1 Bedroom', rent: Math.round(city.medianRent * 0.78), active: propType === '1br' },
                    { label: '2 Bedrooms', rent: city.medianRent,                   active: propType === '2br' },
                    { label: '3 Bedrooms', rent: Math.round(city.medianRent * 1.35),active: propType === '3br' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: r.active ? 'rgba(79,142,247,0.10)' : 'rgba(255,255,255,0.025)', border: r.active ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent', borderRadius: 9 }}>
                      <span style={{ color: r.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', fontSize: 12 }}>{r.label} median rent</span>
                      <span style={{ color: r.active ? 'white' : 'rgba(255,255,255,0.55)', fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>${r.rent.toLocaleString()}/mo</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', background: rc(adjRpi) + '0F', border: `1px solid ${rc(adjRpi)}22`, borderRadius: 10 }}>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginBottom: 3 }}>{occName} rent / income</div>
                  <div style={{ color: rc(adjRpi), fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>{adjRpi}%</div>
                  {/* Pressure bar */}
                  <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                    {[{max:30,c:'#14B8A6'},{max:38,c:'#F59E0B'},{max:45,c:'#E86C2F'},{max:60,c:'#EF4444'}].map((z,i) => {
                      const prev = [0,30,38,45][i]
                      return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: adjRpi > prev ? z.c : 'rgba(255,255,255,0.07)', opacity: adjRpi > z.max ? 0.3 : 1 }} />
                    })}
                  </div>
                </div>
              </div>

              {/* Buy panel */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: `${pt.label} reference price`, value: `$${adjPrice.toLocaleString()}`, color: 'rgba(255,255,255,0.75)' },
                    { label: `Est. PTT`, value: `$${taxAmt.toLocaleString()}`, color: 'rgba(255,255,255,0.50)', note: 'Excl. first-time buyer exemptions & other applicable taxes' },
                    { label: 'Est. Annual Property Tax', value: `$${propTax.toLocaleString()}`, color: 'rgba(255,255,255,0.50)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 9 }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12 }}>{r.label}</div>
                        {'note' in r && r.note && <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, marginTop: 2 }}>{r.note}</div>}
                      </div>
                      <span style={{ color: r.color, fontWeight: 800, fontSize: 14, fontFamily: 'monospace', flexShrink: 0 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', background: hc(hpiYears) + '0F', border: `1px solid ${hc(hpiYears)}22`, borderRadius: 10 }}>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginBottom: 3 }}>
                    Price / {occName} annual income
                  </div>
                  <div style={{ color: hc(hpiYears), fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>{hpiYears} yrs income</div>
                </div>
              </div>
            </div>

            {/* Ownership tiers */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Single income', risk: hpiYears > 12 ? 'High risk' : hpiYears > 8 ? 'Under pressure' : 'Feasible', color: hpiYears > 12 ? '#EF4444' : hpiYears > 8 ? '#E86C2F' : '#14B8A6', note: hpiYears > 12 ? 'High price-to-income ratio; both saving a down payment and carrying a mortgage require long-term planning on a single income.' : 'Requires tight expense management and a long-term financial plan.' },
                { label: 'Dual income',   risk: hpiYears > 14 ? 'Caution' : 'Feasible', color: hpiYears > 14 ? '#F59E0B' : '#14B8A6', note: hpiYears > 14 ? 'Housing costs are still high; pay close attention to the down payment pressure.' : 'Feasible on dual income. Recommend a 5–7 year financial plan.' },
                { label: 'Existing assets', risk: 'Significantly more viable', color: '#14B8A6', note: 'An existing down payment or asset base is a major advantage for buying in this city.' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: t.color + '08', border: `1px solid ${t.color}18`, borderRadius: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, minWidth: 80 }}>{t.label}</span>
                  <span style={{ color: t.color, fontWeight: 700, fontSize: 13, minWidth: 80 }}>{t.risk}</span>
                  <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.5 }}>{t.note}</span>
                </div>
              ))}
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '4px 0 0', paddingLeft: 4 }}>{city.transferTaxNote}</p>
            </div>

            {/* Bottom summary */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                {adjRpi <= 38
                  ? `For ${occName}, renting a ${pt.label} is within an acceptable range (${adjRpi}%), `
                  : `For ${occName}, renting a ${pt.label} is under significant pressure (${adjRpi}%), `
                }
                {hpiYears <= 6
                  ? `and buying requires only ${hpiYears} yrs income — a relatively affordable city.`
                  : hpiYears <= 10
                  ? `while buying takes ${hpiYears} yrs income — moderate pressure with a viable planning window.`
                  : `while buying takes ${hpiYears} yrs income. Single-income ownership typically requires a much longer savings period; dual income or existing assets significantly changes the picture.`
                }
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. CITY BASELINE SCORES ───────────────────────────────────── */}
        <section>
          <SecHeader title="City Index" sub="Occupation-specific metrics + city-fixed metrics" />

          {/* Group A: occupation + scenario sensitive */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
              OCCUPATION METRICS · vary by role and housing type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <DimCard label="Employment (EOI)" val={city.eoi} color={city.eoi >= 75 ? '#14B8A6' : '#F59E0B'} note={`${occName} job density & growth`} />
              <DimCard label="Tax Index (TAI)" val={city.tai} color={city.tai >= 80 ? '#14B8A6' : city.tai >= 60 ? '#F59E0B' : '#E86C2F'} note={city.taiNote.split('(')[0].trim()} />
              <DimCard label="Rent Pressure (RPI)" val={adjRpi} unit="%" color={rc(adjRpi)} note={`${pt.label} · ${rl(adjRpi)}`} />
              <DimCard label="Years to Buy (HPI)" val={hpiYears} unit=" yrs" color={hc(hpiYears)} note={`${pt.label} · ${hl(hpiYears)}`} />
            </div>
          </div>

          {/* Group B: city-fixed */}
          <div>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
              CITY METRICS · fixed regardless of occupation or housing type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {[
                { label: 'Healthcare (HAI)', val: city.hai, note: 'Wait times + coverage' },
                { label: 'Education (EDI)',   val: city.edi, note: 'Schools + universities' },
                { label: 'Environment (EQI)', val: city.eqi, note: 'Air + green space + water' },
                { label: 'Transit (TCI)',     val: city.tci, note: 'Walk + transit coverage' },
                { label: 'Safety (PSI)',      val: city.psi, note: 'Community safety index' },
              ].map(d => {
                const bc = d.val >= 85 ? '#60A5FA' : d.val >= 70 ? '#93C5FD' : d.val >= 55 ? '#F59E0B' : '#E86C2F'
                return <DimCard key={d.label} {...d} color={bc} />
              })}
            </div>
          </div>
        </section>

        {/* ── 7. OCCUPATION FIT RANKING ─────────────────────────────────── */}
        <section>
          <SecHeader title={`Occupation Rankings · ${city.name}`} sub="Same city, very different living space by profession" />
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 72px 64px', gap: 8, padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>Occupation</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>Score</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>Yrs to Buy</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>Jobs</span>
            </div>
            {Object.entries(matrix)
              .map(([id, fit]) => {
                const adjHpi = parseFloat((fit.hpiYears * (PROP_TYPES.find(p => p.id === propType)?.priceMult ?? 1)).toFixed(1))
                return { id, fit, adjHpi }
              })
              .sort((a, b) => b.fit.score - a.fit.score)
              .map(({ id, fit, adjHpi }, i) => {
                const isCurrent = id === occ
                const name = OCC_NAMES[id] ?? id
                return (
                  <a key={id} href={`/city/${slug}?occupation=${id}&housing=${propType}`}
                    onClick={e => { e.preventDefault(); setOcc(id) }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 56px 72px 64px', gap: 8, padding: '12px 20px', borderBottom: i < Object.keys(matrix).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isCurrent ? 'rgba(79,142,247,0.07)' : i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', alignItems: 'center', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.12s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: isCurrent ? 'white' : 'rgba(255,255,255,0.70)', fontSize: 13, fontWeight: isCurrent ? 700 : 500 }}>{name}</span>
                      {isCurrent && <span style={{ fontSize: 9, fontWeight: 700, color: '#4F8EF7', background: 'rgba(79,142,247,0.15)', padding: '1px 5px', borderRadius: 4 }}>You</span>}
                      {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#14B8A6', background: 'rgba(20,184,166,0.12)', padding: '1px 5px', borderRadius: 4 }}>Top</span>}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: sc(fit.score), fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>{fit.score}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: hc(adjHpi), fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{adjHpi} yrs</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: fit.eoi === 'High' ? '#14B8A6' : fit.eoi === 'Mid' ? '#F59E0B' : '#EF4444', fontSize: 12, fontWeight: 700 }}>{fit.eoi}</span>
                    </div>
                  </a>
                )
              })}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, margin: '8px 4px 0', lineHeight: 1.6 }}>
            Click any occupation to see its detailed fit analysis in {city.name}. Years to buy is based on {pt.label}. Higher score = more living room.
          </p>
        </section>

        {/* ── 8. FINAL VERDICT + CTAs ───────────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${vMain.color}28`, borderRadius: 20, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: vMain.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>FINAL VERDICT</span>
            {occRank > 0 && (
              <span style={{ marginLeft: 4, color: rankColor, fontSize: 12, fontWeight: 700 }}>
                · Canada {occName} · {pt.label} Rank #{occRank}/{totalCities}
              </span>
            )}
          </div>

          <p style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.5, margin: 0 }}>{verdictLine}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#14B8A6', fontSize: 12, fontWeight: 700, minWidth: 80, paddingTop: 1 }}>Consider if</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>
                {isHighCost ? 'You have a stable employer or union path, dual income support, or an existing down payment.' : 'You have a clear career goal and a realistic financial plan.'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700, minWidth: 80, paddingTop: 1 }}>Also compare</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6 }}>
                {altCity}
                {slug !== 'ottawa' && slug !== altSlug ? ', Ottawa' : ''}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
            <a href={`/compare?cities=${slug},${altSlug}&occupation=${occ}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#4F8EF7,#5B5CF0)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2 }}>Side-by-side</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{city.name} vs {altCity} →</div>
            </a>
            <a href={`/calculate?city=${slug}&occupation=${occ}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginBottom: 2 }}>Personalized</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 12 }}>Calculate My Numbers →</div>
            </a>
            <a href={`/ranking?occupation=${occ}&current=${slug}&housing=${propType}`}
              style={{ display: 'block', padding: '12px 14px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginBottom: 2 }}>Full rankings</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 12 }}>{occName} City Rankings →</div>
            </a>
          </div>
        </section>

        {/* ── Career Guides ─────────────────────────────────────────────── */}
        <section style={{ marginTop: 32 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Career Guides for {city.name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              ['registered-nurse',    'Registered Nurse'],
              ['family-physician',    'Family Physician'],
              ['pharmacist',          'Pharmacist'],
              ['dentist',             'Dentist'],
              ['software-engineer',   'Software Engineer'],
              ['data-analyst',        'Data Analyst'],
              ['electrician',         'Electrician'],
              ['plumber',             'Plumber'],
              ['carpenter',           'Carpenter'],
              ['welder',              'Welder'],
              ['auto-mechanic',       'Auto Mechanic'],
              ['civil-engineer',      'Civil Engineer'],
              ['lawyer',              'Lawyer'],
              ['accountant',          'Accountant'],
              ['financial-advisor',   'Financial Advisor'],
              ['secondary-teacher',   'Secondary Teacher'],
              ['firefighter',         'Firefighter'],
              ['police-officer',      'Police Officer'],
              ['truck-driver',        'Truck Driver'],
              ['commercial-pilot',    'Commercial Pilot'],
              ['social-worker',       'Social Worker'],
              ['it-support',          'IT Support'],
              ['marketing-specialist','Marketing Specialist'],
              ['hr-specialist',       'HR Specialist'],
              ['real-estate-agent',   'Real Estate Agent'],
              ['construction-worker', 'Construction Worker'],
              ['truck-driver',        'Truck Driver'],
              ['chef',                'Chef'],
              ['security-guard',      'Security Guard'],
              ['cleaner',             'Cleaner'],
            ].filter((v, i, a) => a.findIndex(x => x[0] === v[0]) === i).map(([id, name]) => (
              <a key={id} href={`/guide/${id}/${slug}`}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.40)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = '#14B8A6'; (e.target as HTMLAnchorElement).style.borderColor = 'rgba(20,184,166,0.4)' }}
                onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.40)'; (e.target as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.10)' }}>
                {name}
              </a>
            ))}
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, textAlign: 'center' }}>
          Data: CMHC · StatCan · CIHI · Environment Canada · Job Bank · CRA<br />
          Years to buy = {pt.label} reference price ÷ pre-tax occupation income. Lower = less housing burden.<br />
          Lakive Life System™ v4.2 · Q1 2026 · lakive.com
        </p>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function DimCard({ label, val, unit, color, note }: { label: string; val: number|string; unit?: string; color?: string; note?: string }) {
  const display = `${val}${unit ?? ''}`
  const numVal  = typeof val === 'number' ? val : null
  const c       = color ?? '#14B8A6'
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px' }}>
      <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginBottom: 8 }}>{label}</div>
      <div style={{ color: c, fontSize: 26, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, marginBottom: 8 }}>{display}</div>
      {numVal !== null && (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${numVal}%`, background: c, borderRadius: 2, opacity: 0.55 }} />
        </div>
      )}
      {note && <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11 }}>{note}</div>}
    </div>
  )
}
