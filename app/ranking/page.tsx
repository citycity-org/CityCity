'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const REGIONS = [
  { id: 'all', name: '全国' },
  { id: 'bc', name: 'BC' },
  { id: 'ab', name: 'AB' },
  { id: 'on', name: 'ON' },
  { id: 'qc', name: 'QC' },
]

const DIMS = [
  { id: 'overall', name: '综合指数' },
  { id: 'hpi', name: '买房指数 HPI' },
  { id: 'rpi', name: '租房指数 RPI' },
  { id: 'cpi', name: '买车指数 CPI' },
  { id: 'eqi', name: '环境质量 EQI' },
  { id: 'edi', name: '教育指数 EDI' },
  { id: 'hci', name: '医疗指数 HCI' },
  { id: 'tci', name: '交通指数 TCI' },
]

const OCCUPATION_NAMES: Record<string, string> = {
  nurse: '注册护士', doctor: '家庭医生', pharmacist: '药剂师', dentist: '牙医',
  software_eng: '软件工程师', data_analyst: '数据分析师', it_support: 'IT技术支持',
  teacher: '中学教师',
  engineer: '土木工程师', electrician: '电工', carpenter: '木工', plumber: '水管工', welder: '焊工',
  lawyer: '律师', accountant: '会计师', financial_advisor: '财务顾问',
  real_estate: '房产经纪', marketing: '市场营销专员', hr: '人力资源专员',
  police: '警察', firefighter: '消防员', social_worker: '社会工作者',
  chef: '厨师', chef_executive: '行政总厨',
  truck_driver: '卡车司机', retail: '零售店员', mechanic: '汽车技师',
  pilot: '商业飞行员', security: '保安', cleaner: '清洁工',
}

// Baseline city data (fallback values; HPI gets overridden by Supabase)
const CITIES_BASE = [
  {
    id: 'vancouver', name: '温哥华', province: 'British Columbia', region: 'bc',
    score: 38,
    hpi: { years: 10.2, label: '压垮性', color: '#DC2626', bg: '#FEE2E2' },
    rpi: { value: 43.6, label: '难以为继', color: '#DC2626', bg: '#FEE2E2' },
    cpi: { months: 7.6, label: '沉重', color: '#D97706', bg: '#FEF3C7' },
    eqi: { score: 9, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    edi: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    hci: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
    tci: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
  },
  {
    id: 'toronto', name: '多伦多', province: 'Ontario', region: 'on',
    score: 41,
    hpi: { years: 9.6, label: '压垮性', color: '#DC2626', bg: '#FEE2E2' },
    rpi: { value: 41.2, label: '难以为继', color: '#DC2626', bg: '#FEE2E2' },
    cpi: { months: 7.2, label: '沉重', color: '#D97706', bg: '#FEF3C7' },
    eqi: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
    edi: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    hci: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
    tci: { score: 9, label: '优秀', color: '#059669', bg: '#D1FAE5' },
  },
  {
    id: 'montreal', name: '蒙特利尔', province: 'Québec', region: 'qc',
    score: 55,
    hpi: { years: 7.4, label: '沉重', color: '#D97706', bg: '#FEF3C7' },
    rpi: { value: 30.2, label: '捉襟见肘', color: '#D97706', bg: '#FEF3C7' },
    cpi: { months: 6.8, label: '沉重', color: '#D97706', bg: '#FEF3C7' },
    eqi: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
    edi: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
    hci: { score: 6, label: '尚可', color: '#D97706', bg: '#FEF3C7' },
    tci: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
  },
  {
    id: 'ottawa', name: '渥太华', province: 'Ontario', region: 'on',
    score: 62,
    hpi: { years: 6.8, label: '严峻', color: '#EA580C', bg: '#FEF0E7' },
    rpi: { value: 28.4, label: '捉襟见肘', color: '#D97706', bg: '#FEF3C7' },
    cpi: { months: 6.2, label: '沉重', color: '#D97706', bg: '#FEF3C7' },
    eqi: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    edi: { score: 9, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    hci: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    tci: { score: 7, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
  },
  {
    id: 'calgary', name: '卡尔加里', province: 'Alberta', region: 'ab',
    score: 74,
    hpi: { years: 3.9, label: '可负担', color: '#059669', bg: '#D1FAE5' },
    rpi: { value: 24.1, label: '尚可', color: '#65A30D', bg: '#ECFDF5' },
    cpi: { months: 4.8, label: '可负担', color: '#059669', bg: '#D1FAE5' },
    eqi: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    edi: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    hci: { score: 8, label: '优秀', color: '#059669', bg: '#D1FAE5' },
    tci: { score: 6, label: '良好', color: '#65A30D', bg: '#ECFDF5' },
  },
]

function getHpiLabel(years: number): { label: string; color: string; bg: string } {
  if (years < 5) return { label: '可负担', color: '#059669', bg: '#D1FAE5' }
  if (years < 7) return { label: '可承受', color: '#65A30D', bg: '#ECFDF5' }
  if (years < 10) return { label: '沉重', color: '#D97706', bg: '#FEF3C7' }
  if (years < 13) return { label: '严峻', color: '#EA580C', bg: '#FEF0E7' }
  if (years < 17) return { label: '压垮性', color: '#DC2626', bg: '#FEE2E2' }
  return { label: '难以为继', color: '#9B1C1C', bg: '#FEE2E2' }
}

function getRankColor(rank: number) {
  if (rank === 1) return { bg: '#D1FAE5', text: '#065F46' }
  if (rank === 2) return { bg: '#ECFDF5', text: '#3F6212' }
  if (rank === 3) return { bg: '#FEF3C7', text: '#92400E' }
  if (rank === 4) return { bg: '#FEF0E7', text: '#9A3412' }
  return { bg: '#FEE2E2', text: '#991B1B' }
}

function getScoreColor(score: number) {
  if (score >= 70) return '#059669'
  if (score >= 60) return '#65A30D'
  if (score >= 50) return '#D97706'
  if (score >= 40) return '#EA580C'
  return '#DC2626'
}

interface OccRow { occupation_id: string; years_current: number }

export default function RankingPage() {
  const [currentOccupation, setCurrentOccupation] = useState('nurse')
  const [currentCity, setCurrentCity] = useState('vancouver')
  const [activeRegion, setActiveRegion] = useState('all')
  const [activeDim, setActiveDim] = useState('overall')
  const [expandedCity, setExpandedCity] = useState<string | null>(null)

  // Supabase: HPI years per city for the current occupation
  const [hpiByCity, setHpiByCity] = useState<Record<string, number>>({})
  // Supabase: all-occupation breakdown per city (lazy-loaded on expand)
  const [occData, setOccData] = useState<Record<string, OccRow[]>>({})
  const [occLoading, setOccLoading] = useState(false)

  // Read URL params on mount (avoids useSearchParams / Suspense)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setCurrentOccupation(p.get('occupation') || 'nurse')
    setCurrentCity(p.get('city') || 'vancouver')
  }, [])

  // Fetch HPI for current occupation across all cities
  useEffect(() => {
    async function fetchHpi() {
      const { data, error } = await supabase
        .from('housing_years')
        .select('city_id, years_current')
        .eq('occupation_id', currentOccupation)
        .eq('property_type', '2br_condo')
        .eq('purpose', 'buy')

      if (data && data.length > 0) {
        const m: Record<string, number> = {}
        data.forEach((r: { city_id: string; years_current: number }) => {
          m[r.city_id] = parseFloat(String(r.years_current))
        })
        setHpiByCity(m)
        return
      }

      // Fallback: purpose column may not exist yet
      if (error?.code === '42703' || !data || data.length === 0) {
        const { data: fb } = await supabase
          .from('housing_years')
          .select('city_id, years_current')
          .eq('occupation_id', currentOccupation)
          .eq('property_type', '2br_condo')
        if (fb && fb.length > 0) {
          const m: Record<string, number> = {}
          fb.forEach((r: { city_id: string; years_current: number }) => {
            m[r.city_id] = parseFloat(String(r.years_current))
          })
          setHpiByCity(m)
        }
      }
    }
    fetchHpi()
  }, [currentOccupation])

  // Reset occupation cache when occupation changes
  useEffect(() => {
    setOccData({})
  }, [currentOccupation])

  // Lazy-load all-occupation breakdown when a city is expanded
  useEffect(() => {
    if (!expandedCity || occData[expandedCity]) return
    setOccLoading(true)

    async function fetchOccs() {
      const { data, error } = await supabase
        .from('housing_years')
        .select('occupation_id, years_current')
        .eq('city_id', expandedCity!)
        .eq('property_type', '2br_condo')
        .eq('purpose', 'buy')
        .order('years_current', { ascending: true })

      if (data && data.length > 0) {
        setOccData(prev => ({ ...prev, [expandedCity!]: data }))
        setOccLoading(false)
        return
      }

      if (error?.code === '42703' || !data || data.length === 0) {
        const { data: fb } = await supabase
          .from('housing_years')
          .select('occupation_id, years_current')
          .eq('city_id', expandedCity!)
          .eq('property_type', '2br_condo')
          .order('years_current', { ascending: true })
        if (fb) setOccData(prev => ({ ...prev, [expandedCity!]: fb }))
      }
      setOccLoading(false)
    }
    fetchOccs()
  }, [expandedCity, occData])

  // Merge Supabase HPI into city data
  const cities = CITIES_BASE.map(c => {
    const liveYears = hpiByCity[c.id]
    if (liveYears == null) return c
    const { label, color, bg } = getHpiLabel(liveYears)
    return { ...c, hpi: { years: liveYears, label, color, bg } }
  })

  const filtered = activeRegion === 'all'
    ? cities
    : cities.filter(c => c.region === activeRegion)

  const sorted = [...filtered].sort((a, b) => {
    if (activeDim === 'overall') return b.score - a.score
    if (activeDim === 'hpi') return a.hpi.years - b.hpi.years
    if (activeDim === 'rpi') return a.rpi.value - b.rpi.value
    if (activeDim === 'cpi') return a.cpi.months - b.cpi.months
    if (activeDim === 'eqi') return b.eqi.score - a.eqi.score
    if (activeDim === 'edi') return b.edi.score - a.edi.score
    if (activeDim === 'hci') return b.hci.score - a.hci.score
    if (activeDim === 'tci') return b.tci.score - a.tci.score
    return b.score - a.score
  })

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-6"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-white/40 text-sm mb-1">城市排行榜</div>
          <h1 className="text-2xl font-bold text-white mb-1">加拿大城市生活指数排行榜</h1>
          <p className="text-white/40 text-sm">5个城市 · 8维生活指数 · 2026年Q1</p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-14 z-40">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* 当前职业状态条 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: '#EEF4FF', border: '1px solid rgba(91,92,240,0.15)' }}>
            <span className="text-xs font-semibold text-[#5B5CF0]">当前</span>
            <div className="flex gap-2 flex-1 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-white text-[#374151] border border-[#E5E7EB]">
                {OCCUPATION_NAMES[currentOccupation] || currentOccupation}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white text-[#374151] border border-[#E5E7EB]">
                2居室公寓
              </span>
            </div>
            <a href="/" className="text-xs text-[#5B5CF0] font-medium flex-shrink-0">切换 ▾</a>
          </div>

          {/* 区域筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {REGIONS.map(r => (
              <button key={r.id}
                onClick={() => setActiveRegion(r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeRegion === r.id ? 'text-white' : 'text-[#6B7280] bg-[#F3F4F6]'
                }`}
                style={activeRegion === r.id ? { background: '#111827' } : {}}>
                {r.name}
              </button>
            ))}
          </div>

          {/* 维度切换 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DIMS.map(d => (
              <button key={d.id}
                onClick={() => { setActiveDim(d.id); setExpandedCity(null) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                  activeDim === d.id
                    ? 'text-white border-transparent'
                    : 'text-[#6B7280] bg-white border-[#E5E7EB]'
                }`}
                style={activeDim === d.id ? { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', border: 'none' } : {}}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 排行榜主体 */}
      <div className="max-w-2xl mx-auto px-6 py-5 space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF] text-sm">
            该区域暂无城市数据
          </div>
        )}

        {sorted.map((city, index) => {
          const rank = index + 1
          const rankColors = getRankColor(rank)
          const isExpanded = expandedCity === city.id
          const isCurrent = city.id === currentCity
          const cityOccs = occData[city.id] || []

          return (
            <div key={city.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                isExpanded ? 'border-[#5B5CF0] shadow-md' : isCurrent ? 'border-[#4F8EF7]' : 'border-[#E5E7EB]'
              }`}
              onClick={() => setExpandedCity(isExpanded ? null : city.id)}>

              {isCurrent && (
                <div className="px-5 py-1.5 text-xs font-medium text-[#4F8EF7]"
                  style={{ background: '#EEF4FF', borderBottom: '1px solid #DBEAFE' }}>
                  ★ 你正在查询的城市
                </div>
              )}

              {/* 主行 */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: rankColors.bg, color: rankColors.text }}>
                  {rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111827]">{city.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{city.province}</div>
                </div>

                {/* 核心数字 — 随维度变化 */}
                <div className="text-right flex-shrink-0">
                  {activeDim === 'overall' && (
                    <>
                      <div className="text-2xl font-bold font-mono" style={{ color: getScoreColor(city.score), letterSpacing: '-0.5px' }}>
                        {city.score}
                      </div>
                      <div className="text-xs text-[#9CA3AF]">/ 100</div>
                      <div className="w-20 h-1 rounded-full mt-1 ml-auto overflow-hidden" style={{ background: '#F3F4F6' }}>
                        <div className="h-full rounded-full" style={{ width: `${city.score}%`, background: getScoreColor(city.score) }} />
                      </div>
                    </>
                  )}
                  {activeDim === 'hpi' && (
                    <>
                      <div className="text-2xl font-bold font-mono" style={{ color: city.hpi.color, letterSpacing: '-0.5px' }}>
                        {city.hpi.years}<span className="text-sm text-[#9CA3AF] ml-0.5">年</span>
                      </div>
                      <div className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: city.hpi.bg, color: city.hpi.color }}>{city.hpi.label}</div>
                    </>
                  )}
                  {activeDim === 'rpi' && (
                    <>
                      <div className="text-2xl font-bold font-mono" style={{ color: city.rpi.color, letterSpacing: '-0.5px' }}>
                        {city.rpi.value}<span className="text-sm text-[#9CA3AF] ml-0.5">%</span>
                      </div>
                      <div className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: city.rpi.bg, color: city.rpi.color }}>{city.rpi.label}</div>
                    </>
                  )}
                  {activeDim === 'cpi' && (
                    <>
                      <div className="text-2xl font-bold font-mono" style={{ color: city.cpi.color, letterSpacing: '-0.5px' }}>
                        {city.cpi.months}<span className="text-sm text-[#9CA3AF] ml-0.5">月薪</span>
                      </div>
                      <div className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: city.cpi.bg, color: city.cpi.color }}>{city.cpi.label}</div>
                    </>
                  )}
                  {(['eqi', 'edi', 'hci', 'tci'] as const).includes(activeDim as 'eqi' | 'edi' | 'hci' | 'tci') && (() => {
                    const d = city[activeDim as 'eqi' | 'edi' | 'hci' | 'tci']
                    return (
                      <>
                        <div className="text-2xl font-bold font-mono" style={{ color: d.color, letterSpacing: '-0.5px' }}>
                          {d.score}<span className="text-sm text-[#9CA3AF] ml-0.5">/10</span>
                        </div>
                        <div className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: d.bg, color: d.color }}>{d.label}</div>
                      </>
                    )
                  })()}
                </div>

                <div className={`text-[#9CA3AF] text-sm transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▾</div>
              </div>

              {/* 综合指数：显示四个核心指标概览 */}
              {activeDim === 'overall' && !isExpanded && (
                <div className="grid grid-cols-4 gap-2 px-5 pb-4">
                  {[
                    { icon: '🏠', name: '买房', val: `${city.hpi.years}年`, color: city.hpi.color, bg: city.hpi.bg, label: city.hpi.label },
                    { icon: '🔑', name: '租房', val: `${city.rpi.value}%`, color: city.rpi.color, bg: city.rpi.bg, label: city.rpi.label },
                    { icon: '🚗', name: '买车', val: `${city.cpi.months}月`, color: city.cpi.color, bg: city.cpi.bg, label: city.cpi.label },
                    { icon: '🌿', name: '环境', val: `${city.eqi.score}/10`, color: city.eqi.color, bg: city.eqi.bg, label: city.eqi.label },
                  ].map(item => (
                    <div key={item.name} className="text-center p-2 rounded-xl" style={{ background: '#F9FAFB' }}>
                      <div className="text-xs text-[#9CA3AF] mb-1">{item.icon} {item.name}</div>
                      <div className="text-xs font-bold" style={{ color: item.color }}>{item.val}</div>
                      <div className="text-xs font-medium mt-0.5" style={{ color: item.color }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 展开：30个职业的买房年数 */}
              {isExpanded && (
                <div className="border-t border-[#F3F4F6] px-5 py-4">
                  <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                    30个职业 · 买房年数（2居室公寓）
                  </div>

                  {occLoading ? (
                    <div className="text-center py-4 text-[#9CA3AF] text-xs">加载职业数据...</div>
                  ) : cityOccs.length > 0 ? (
                    <div className="space-y-1.5">
                      {cityOccs.map(occ => {
                        const name = OCCUPATION_NAMES[occ.occupation_id] || occ.occupation_id
                        const years = parseFloat(String(occ.years_current))
                        const { label, color, bg } = getHpiLabel(years)
                        const isCurOcc = occ.occupation_id === currentOccupation
                        return (
                          <div key={occ.occupation_id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl ${isCurOcc ? 'bg-[#EEF4FF]' : 'bg-[#F9FAFB]'}`}>
                            <div className="flex-1 text-sm font-medium text-[#374151]">
                              {name}
                              {isCurOcc && <span className="ml-1 text-[#5B5CF0]">★</span>}
                            </div>
                            <div className="w-24 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#E5E7EB' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min((years / 25) * 100, 100)}%`, background: color }} />
                            </div>
                            <div className="text-sm font-bold font-mono flex-shrink-0" style={{ color }}>{years}年</div>
                            <div className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: bg, color }}>{label}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // Fallback: show only a few from static data if Supabase returns nothing
                    <div className="text-center py-2 text-[#9CA3AF] text-xs">暂无详细职业数据</div>
                  )}

                  <div className="mt-3">
                    <a href={`/city/${city.id}?occupation=${currentOccupation}`}
                      onClick={e => e.stopPropagation()}
                      className="block w-full py-2 rounded-xl text-xs font-medium text-center text-white"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                      查看{city.name}城市真相 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div className="text-center py-3">
          <p className="text-xs text-[#D1D5DB]">数据来源：StatCan · CREA · CMHC · Health Canada · Fraser · CIHI · Walk Score</p>
          <p className="text-xs text-[#D1D5DB] mt-0.5">综合指数 = 生存成本60分 + 环境指数40分 · 更新于 2026年Q1 · citycity.org</p>
        </div>
      </div>
    </main>
  )
}
