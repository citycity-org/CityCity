'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const OCCUPATION_NAMES: Record<string, string> = {
  nurse: '注册护士',
  software_eng: '软件工程师',
  teacher: '中学教师',
  electrician: '电工',
  truck_driver: '卡车司机',
  accountant: '会计师',
  police: '警察',
  chef: '厨师',
  retail: '零售店员',
  engineer: '土木工程师',
}

const CITY_NAMES: Record<string, string> = {
  vancouver: '温哥华',
  toronto: '多伦多',
  calgary: '卡尔加里',
  montreal: '蒙特利尔',
  ottawa: '渥太华',
}

const PURPOSE_NAMES: Record<string, string> = {
  buy: '买房',
  rent: '租房',
  car: '买车',
}

const DIMS = [
  { id: 'hpi', icon: '🏠', name: '买房指数 HPI', score: 6, max: 30, label: '压垮性', level: 1 },
  { id: 'rpi', icon: '🔑', name: '租房指数 RPI', score: 3, max: 15, label: '难以为继', level: 1 },
  { id: 'cpi', icon: '🚗', name: '买车指数 CPI', score: 4, max: 8, label: '沉重', level: 3 },
  { id: 'eqi', icon: '🌿', name: '环境指数 EQI', score: 8, max: 10, label: '优秀', level: 5 },
  { id: 'edi', icon: '📚', name: '教育指数 EDI', score: 8, max: 10, label: '优秀', level: 5 },
  { id: 'hci', icon: '🏥', name: '医疗指数 HCI', score: 6, max: 10, label: '良好', level: 4 },
  { id: 'tci', icon: '🚇', name: '交通指数 TCI', score: 7, max: 10, label: '良好', level: 4 },
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
      if (step >= steps) {
        setCurrent(score)
        clearInterval(timer)
      } else {
        const progress = step / steps
        const eased = 1 - Math.pow(1 - progress, 3)
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
      <text x="48" y="44" textAnchor="middle" fill={color} fontSize="20" fontWeight="bold"
        fontFamily="monospace">{current}</text>
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
        <polyline points="4.5,7.5 6.5,9.5 10,5.5" fill="none" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  )
  return (
    <div style={{ background: bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="1.8" />
        <polyline points="4,7 6.5,9.5 10,5" fill="none" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') || 'vancouver'
  const purpose = searchParams.get('purpose') || 'buy'
  const occupation = searchParams.get('occupation') || 'nurse'

  const cityName = CITY_NAMES[city] || '温哥华'
  const purposeName = PURPOSE_NAMES[purpose] || '买房'
  const occupationName = OCCUPATION_NAMES[occupation] || '注册护士'

const [loaded, setLoaded] = useState(false)
const [years, setYears] = useState(0)
const [months, setMonths] = useState(0)
const [dbYears, setDbYears] = useState<number | null>(null)
const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

useEffect(() => {
  async function fetchData() {
    const { data, error } = await supabase
      .from('housing_years')
      .select('years_current, years_2019, years_1995')
      .eq('city_id', city)
      .eq('occupation_id', occupation)
      .eq('property_type', '2br_condo')
      .single()

    console.log('Supabase data:', data)
    console.log('Supabase error:', error)

    if (data && !error) {
      setDbYears(data.years_current)
    }
    setLoading(false)
  }
  fetchData()
}, [city, occupation])

  useEffect(() => {
    if (!loaded) return
  const targetYears = dbYears ? Math.floor(dbYears) : 10
  const targetMonths = dbYears ? Math.round((dbYears % 1) * 12) : 2
    const duration = 2500
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setYears(targetYears)
        setMonths(targetMonths)
        clearInterval(timer)
      } else {
        const progress = step / steps
        const eased = 1 - Math.pow(1 - progress, 3)
        setYears(Math.floor(eased * targetYears))
        setMonths(Math.floor(eased * targetMonths * 6) % 12)
      }
    }, interval)
    return () => clearInterval(timer)
  }, [loaded])

  const totalScore = 38

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
                style={{ background: 'rgba(79,142,247,0.2)' }}>🏠 {purposeName}</span>
              <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/50"
                style={{ background: 'rgba(255,255,255,0.05)' }}>{occupationName}</span>
            </div>
          </div>
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-1">
              <div className="text-7xl font-bold text-white leading-none mb-2"
                style={{ fontFamily: 'monospace', letterSpacing: '-3px' }}>
                {years}<span className="text-3xl text-white/55 ml-1">年 {months}月</span>
              </div>
              <div className="text-white/50 text-sm mb-2">才能买一套 2居室公寓</div>
              <div className="text-[#F59E0B] text-sm font-semibold">= 你职业生涯的四分之一</div>
            </div>
            <div className="flex-shrink-0 text-center">
              <ScoreRing score={totalScore} total={100} />
              <div className="text-white/25 text-xs mt-1 tracking-wider">综合指数</div>
            </div>
          </div>
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs text-white/25 uppercase tracking-widest mb-3">
              同一职业 · 三个时代 · 2居室公寓
            </div>
            <div className="space-y-3">
              {[
                { year: '1995', width: '38%', color: '#10B981', val: '4 年' },
                { year: '2019', width: '72%', color: '#F59E0B', val: '8 年', label: '疫情前' },
                { year: '2026', width: '100%', color: '#EF4444', val: '10.2 年', bold: true },
              ].map(row => (
                <div key={row.year} className="flex items-center gap-3">
                  <span className={`text-xs font-mono w-8 flex-shrink-0 ${row.bold ? 'text-white font-bold' : 'text-white/40'}`}>
                    {row.year}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: loaded ? row.width : '0%', background: row.color }} />
                  </div>
                  {row.label && <span className="text-xs text-white/25 w-12 flex-shrink-0">{row.label}</span>}
                  {!row.label && <span className="w-12 flex-shrink-0" />}
                  <span className="text-xs font-bold font-mono w-14 text-right flex-shrink-0"
                    style={{ color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">七维生活指数</div>
            <div className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: '#FEE2E2', color: '#DC2626' }}>38 / 100</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
              生存成本层 · 60分
            </div>
            <div className="space-y-2">
              {DIMS.filter(d => ['hpi', 'rpi', 'cpi'].includes(d.id)).map(dim => {
                const colors = LEVEL_COLORS[dim.level]
                return (
                  <div key={dim.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: '#F9FAFB' }}>
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
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
              环境指数层 · 40分
            </div>
            <div className="space-y-2">
              {DIMS.filter(d => ['eqi', 'edi', 'hci', 'tci'].includes(d.id)).map(dim => {
                const colors = LEVEL_COLORS[dim.level]
                return (
                  <div key={dim.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: '#F9FAFB' }}>
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
            <p className="text-xs text-[#D1D5DB]">数据来源：StatCan · CREA · CMHC · Health Canada · Fraser · CIHI · Walk Score</p>
            <p className="text-xs text-[#D1D5DB] mt-0.5">更新于 2026年Q1 · citycity.org</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
<a href={`/compare?city=${city}&occupation=${occupation}`}
  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center block"
  style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
  对比其他城市 →
</a>
          <a href={`/share?city=${city}&occupation=${occupation}`}
  className="px-4 py-3 rounded-xl text-sm font-medium text-[#374151] text-center"
  style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
  分享 ↗
</a>
        </div>
        <a href={`/subscribe?city=${city}&occupation=${occupation}`}
  className="w-full py-3 rounded-xl text-sm font-medium text-center mt-2 block"
  style={{ background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280' }}>
  📊 订阅城市生活报告
</a>
      </div>
    </main>
  )
}

export default function Results() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151827] flex items-center justify-center">
      <div className="text-white/50">加载中...</div>
    </div>}>
      <ResultsContent />
    </Suspense>
  )
}