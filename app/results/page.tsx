'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const OCCUPATION_NAMES: Record<string, string> = {
  nurse: 'Registered Nurse', software_eng: 'Software Engineer', teacher: 'Secondary Teacher',
  electrician: 'Electrician', truck_driver: 'Truck Driver', accountant: 'Accountant',
  police: 'Police Officer', chef: 'Chef', retail: 'Retail Associate', engineer: 'Civil Engineer',
  doctor: 'Family Physician', pharmacist: 'Pharmacist', dentist: 'Dentist', lawyer: 'Lawyer',
  financial_advisor: 'Financial Advisor', real_estate: 'Real Estate Agent', mechanic: 'Auto Mechanic',
  carpenter: 'Carpenter', plumber: 'Plumber', welder: 'Welder', it_support: 'IT Support',
  data_analyst: 'Data Analyst', marketing: 'Marketing Specialist', hr: 'HR Specialist',
  social_worker: 'Social Worker', firefighter: 'Firefighter', pilot: 'Commercial Pilot',
  chef_executive: 'Executive Chef', security: 'Security Guard', cleaner: 'Cleaner',
}

const CITY_NAMES: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}

const PURPOSE_NAMES: Record<string, string> = {
  buy: 'Buy', rent: 'Rent', car: 'Car',
}

const PROPERTY_NAMES: Record<string, string> = {
  '1br_condo': '1-Bedroom Condo', '2br_condo': '2-Bedroom Condo', '3br_condo': '3-Bedroom Condo',
  townhouse: 'Townhouse', house: 'Detached House',
}

const VEHICLE_NAMES: Record<string, string> = {
  bmw_3series: 'BMW 3 Series', bmw_x3: 'BMW X3',
  chevrolet_equinox: 'Chevrolet Equinox', chevrolet_silverado: 'Chevrolet Silverado 1500',
  ford_bronco: 'Ford Bronco', ford_escape: 'Ford Escape', ford_f150: 'Ford F-150', ford_mustang: 'Ford Mustang',
  honda_civic: 'Honda Civic', honda_crv: 'Honda CR-V', honda_accord: 'Honda Accord',
  hyundai_elantra: 'Hyundai Elantra', hyundai_tucson: 'Hyundai Tucson',
  kia_sportage: 'Kia Sportage', kia_telluride: 'Kia Telluride',
  mazda_3: 'Mazda Mazda3', mazda_cx5: 'Mazda CX-5',
  nissan_rogue: 'Nissan Rogue', nissan_sentra: 'Nissan Sentra',
  ram_1500: 'Ram 1500', subaru_outback: 'Subaru Outback',
  tesla_model3: 'Tesla Model 3', tesla_modely: 'Tesla Model Y',
  toyota_camry: 'Toyota Camry', toyota_corolla: 'Toyota Corolla',
  toyota_highlander: 'Toyota Highlander', toyota_rav4: 'Toyota RAV4',
  toyota_tacoma: 'Toyota Tacoma', vw_golf: 'Volkswagen Golf', vw_tiguan: 'Volkswagen Tiguan',
}

const CITY_RPI: Record<string, number> = {
  vancouver: 43.6, toronto: 41.2, calgary: 24.1, montreal: 30.2, ottawa: 28.4,
}

const DIMS = [
  { id: 'hpi', icon: '🏠', name: 'Housing Index HPI',     score: 6, max: 30, label: 'Critical',    level: 1 },
  { id: 'rpi', icon: '🔑', name: 'Rent Index RPI',        score: 3, max: 15, label: 'Unsustainable',level: 1 },
  { id: 'cpi', icon: '🚗', name: 'Car Index CPI',         score: 4, max: 8,  label: 'Heavy',        level: 3 },
  { id: 'eqi', icon: '🌿', name: 'Environment Index EQI', score: 8, max: 10, label: 'Excellent',    level: 5 },
  { id: 'edi', icon: '📚', name: 'Education Index EDI',   score: 8, max: 10, label: 'Excellent',    level: 5 },
  { id: 'hci', icon: '🏥', name: 'Healthcare Index HCI',  score: 6, max: 10, label: 'Good',         level: 4 },
  { id: 'tci', icon: '🚇', name: 'Transit Index TCI',     score: 7, max: 10, label: 'Good',         level: 4 },
]

const LEVEL_COLORS: Record<number, { bg: string; text: string; bar: string }> = {
  1: { bg: '#FEE2E2', text: '#DC2626', bar: '#DC2626' },
  2: { bg: '#FEF0E7', text: '#EA580C', bar: '#EA580C' },
  3: { bg: '#FEF3C7', text: '#D97706', bar: '#D97706' },
  4: { bg: '#ECFDF5', text: '#65A30D', bar: '#65A30D' },
  5: { bg: '#D1FAE5', text: '#059669', bar: '#059669' },
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const [current, setCurrent] = useState(0)
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - current / total)
  const color = score < 40 ? '#EF4444' : score < 60 ? '#F59E0B' : '#059669'

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) { setCurrent(score); clearInterval(timer) }
      else {
        const eased = 1 - Math.pow(1 - step / steps, 3)
        setCurrent(Math.floor(eased * score))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [score])

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 48 48)" style={{ transition: 'stroke-dashoffset 0.05s ease' }} />
      <text x="48" y="44" textAnchor="middle" fill={color} fontSize="20" fontWeight="bold" fontFamily="monospace">{current}</text>
      <text x="48" y="58" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">/100</text>
    </svg>
  )
}

function DimIcon({ level }: { level: number }) {
  const color = LEVEL_COLORS[level]?.text || '#9CA3AF'
  const bg = LEVEL_COLORS[level]?.bg || '#F3F4F6'
  if (level === 1) return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="1.8" />
        <line x1="7" y1="4" x2="7" y2="7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="7" cy="9.5" r="0.9" fill={color} />
      </svg>
    </div>
  )
  if (level === 2) return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7 2 L13 12 L1 12 Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <line x1="7" y1="5.5" x2="7" y2="8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="7" cy="10" r="0.8" fill={color} />
      </svg>
    </div>
  )
  if (level === 3) return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect x="2" y="2" width="10" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.8" />
        <line x1="4.5" y1="7" x2="9.5" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
  if (level === 4) return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="1.8" />
        <polyline points="4.5,7.5 6.5,9.5 10,5.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  )
  return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="1.8" />
        <polyline points="4,7 6.5,9.5 10,5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') || 'vancouver'
  const purpose = searchParams.get('purpose') || 'buy'
  const property = searchParams.get('property') || '2br_condo'
  const occupation = searchParams.get('occupation') || 'nurse'

  const cityName = CITY_NAMES[city] || 'Vancouver'
  const purposeName = PURPOSE_NAMES[purpose] || 'Buy'
  const occupationName = OCCUPATION_NAMES[occupation] || 'Registered Nurse'
  const propertyLabel = purpose === 'car'
    ? (VEHICLE_NAMES[property] || property)
    : (PROPERTY_NAMES[property] || property)

  const [loaded, setLoaded] = useState(false)
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [dbCurrent, setDbCurrent] = useState<number | null>(null)
  const [db2019, setDb2019] = useState<number | null>(null)
  const [db1995, setDb1995] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (purpose === 'buy' || purpose === 'rent') {
        const { data, error } = await supabase
          .from('housing_years')
          .select('years_current, years_2019, years_1995')
          .eq('city_id', city)
          .eq('occupation_id', occupation)
          .eq('property_type', property)
          .eq('purpose', purpose)
          .single()

        if (data) {
          setDbCurrent(data.years_current)
          setDb2019(data.years_2019)
          setDb1995(data.years_1995)
        } else if (error?.code === '42703') {
          if (purpose === 'buy') {
            const { data: fallback } = await supabase
              .from('housing_years')
              .select('years_current, years_2019, years_1995')
              .eq('city_id', city)
              .eq('occupation_id', occupation)
              .eq('property_type', property)
              .single()
            if (fallback) {
              setDbCurrent(fallback.years_current)
              setDb2019(fallback.years_2019)
              setDb1995(fallback.years_1995)
            }
          } else {
            const base = CITY_RPI[city] ?? 35
            setDbCurrent(base)
            setDb2019(parseFloat((base * 0.92).toFixed(1)))
            setDb1995(parseFloat((base * 0.73).toFixed(1)))
          }
        }
      } else if (purpose === 'car') {
        const { data, error } = await supabase
          .from('vehicle_months')
          .select('months_current, months_2019, months_1995')
          .eq('city_id', city)
          .eq('occupation_id', occupation)
          .limit(1)
        console.log('[vehicle_months] params:', { city_id: city, occupation_id: occupation })
        console.log('[vehicle_months] row:', data?.[0], 'error:', error)
        const row = data?.[0]
        if (row) {
          setDbCurrent(parseFloat(row.months_current))
          setDb2019(parseFloat(row.months_2019))
          setDb1995(parseFloat(row.months_1995))
        }
      }
    }
    fetchData()
  }, [city, occupation, purpose, property])

  useEffect(() => {
    if (!loaded || dbCurrent === null) return
    const target = purpose === 'buy' ? Math.floor(dbCurrent) : Math.round(dbCurrent)
    const targetMonths = purpose === 'buy' ? Math.round((dbCurrent % 1) * 12) : 0
    const duration = 2500
    const steps = 60
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setYears(target)
        setMonths(targetMonths)
        clearInterval(timer)
      } else {
        const eased = 1 - Math.pow(1 - step / steps, 3)
        setYears(Math.floor(eased * target))
        setMonths(Math.floor(eased * targetMonths))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [loaded, dbCurrent, purpose])

  const totalScore = 38
  const maxVal = dbCurrent || 10
  const val1995 = db1995 || 0
  const val2019 = db2019 || 0
  const unit = purpose === 'car' ? ' mo salary' : 'yr'

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-white/60 text-sm">📍 {cityName}</span>
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70"
                style={{ background: 'rgba(79,142,247,0.2)' }}>{purposeName}</span>
              <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/50"
                style={{ background: 'rgba(255,255,255,0.05)' }}>{occupationName}</span>
            </div>
          </div>
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-1">
              <div className="text-7xl font-bold text-white leading-none mb-2"
                style={{ fontFamily: 'monospace', letterSpacing: '-3px' }}>
                {years}
                <span className="text-3xl text-white/55 ml-1">
                  {purpose === 'car' ? ' mo' : `yr ${months}mo`}
                </span>
              </div>
              <div className="text-white/50 text-sm mb-2">
                {purpose === 'car' ? `to buy a ${propertyLabel}` : `to buy a ${propertyLabel}`}
              </div>
              <div className="text-[#F59E0B] text-sm font-semibold">
                {purpose === 'car' ? 'Based on Edmunds 20/4/10 rule' : '= one quarter of your career'}
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <ScoreRing score={totalScore} total={100} />
              <div className="text-white/25 text-xs mt-1 tracking-wider">Overall Index</div>
            </div>
          </div>
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs text-white/25 uppercase tracking-widest mb-3">
              Same Occupation · Three Eras · {propertyLabel}
            </div>
            <div className="space-y-3">
              {[
                { year: '1995', val: val1995, color: '#10B981' },
                { year: '2019', val: val2019, color: '#F59E0B' },
                { year: '2026', val: maxVal, color: '#EF4444', bold: true },
              ].map(row => (
                <div key={row.year} className="flex items-center gap-3">
                  <span className={`text-xs font-mono w-8 flex-shrink-0 ${row.bold ? 'text-white font-bold' : 'text-white/40'}`}>
                    {row.year}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: loaded ? `${(row.val / maxVal) * 100}%` : '0%', background: row.color }} />
                  </div>
                  <span className="text-xs font-bold font-mono w-16 text-right flex-shrink-0"
                    style={{ color: row.color }}>
                    {purpose === 'buy'
                      ? `${Math.floor(row.val)}yr ${Math.round((row.val % 1) * 12)}mo`
                      : `${row.val}${unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">7-Dimension Life Index</div>
            <div className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: '#FEE2E2', color: '#DC2626' }}>38 / 100</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Cost of Living Layer · 60 pts</div>
            <div className="space-y-2">
              {DIMS.filter(d => ['hpi', 'rpi', 'cpi'].includes(d.id)).map(dim => {
                const colors = LEVEL_COLORS[dim.level]
                return (
                  <div key={dim.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: '#F9FAFB' }}>
                    <DimIcon level={dim.level} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#374151] mb-1">{dim.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full" style={{ background: '#E5E7EB' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: loaded ? `${(dim.score / dim.max) * 100}%` : '0%', background: colors.bar }} />
                        </div>
                        <span className="text-xs font-mono text-[#9CA3AF]">{dim.score}/{dim.max}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: colors.bg, color: colors.text }}>{dim.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="h-px bg-[#F3F4F6] mx-5" />
          <div className="px-5 py-4">
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Environment Layer · 40 pts</div>
            <div className="space-y-2">
              {DIMS.filter(d => ['eqi', 'edi', 'hci', 'tci'].includes(d.id)).map(dim => {
                const colors = LEVEL_COLORS[dim.level]
                return (
                  <div key={dim.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: '#F9FAFB' }}>
                    <DimIcon level={dim.level} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#374151] mb-1">{dim.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full" style={{ background: '#E5E7EB' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: loaded ? `${(dim.score / dim.max) * 100}%` : '0%', background: colors.bar }} />
                        </div>
                        <span className="text-xs font-mono text-[#9CA3AF]">{dim.score}/{dim.max}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: colors.bg, color: colors.text }}>{dim.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-[#F3F4F6] text-center">
            <p className="text-xs text-[#D1D5DB]">Data: StatCan · CREA · CMHC · Health Canada · Fraser · CIHI · Walk Score</p>
            <p className="text-xs text-[#D1D5DB] mt-0.5">Updated Q1 2026 · lakive.com</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <a href={`/compare?city=${city}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center block"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            Compare Other Cities →
          </a>
          <a href={`/share?city=${city}&occupation=${occupation}`}
            className="px-4 py-3 rounded-xl text-sm font-medium text-[#374151] text-center"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
            Share ↗
          </a>
        </div>
        <a href={`/subscribe?city=${city}&occupation=${occupation}`}
          className="w-full py-3 rounded-xl text-sm font-medium text-center mt-2 block"
          style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
          📊 Subscribe to City Intelligence Report
        </a>
      </div>
    </main>
  )
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151827] flex items-center justify-center">
      <div className="text-white/50">Loading...</div>
    </div>}>
      <ResultsContent />
    </Suspense>
  )
}
