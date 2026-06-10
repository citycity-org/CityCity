'use client'
import { useState, useEffect, use } from 'react'

// ─── City profile data ──────────────────────────────────────────────────────
const CITY_PROFILES: Record<string, {
  tagline: string
  lat: string; lng: string; region: string; founded: number
  cityPop: string; metroPop: string; density: string
  medianIncome: string; unemployment: string; gdp: string
  industries: string[]
  aqi: number; aqiLabel: string; greenSpace: string; walkScore: number
  winterC: number; summerC: number; precip: string; snow: string; sunnyDays: number
  score: number; eqi: number; hci: number; tci: number; eoi: number; cli: number; psi: number
}> = {
  vancouver: {
    tagline: '太平洋明珠，加拿大的花园城市',
    lat: '49°15′N', lng: '123°7′W', region: '太平洋沿岸', founded: 1886,
    cityPop: '675,218', metroPop: '2,632,000', density: '5,493 人/km²',
    medianIncome: '$62,600', unemployment: '5.2%', gdp: '$148 B',
    industries: ['科技 & 创业', '房地产 & 建筑', '电影 & 创意产业', '港口贸易 & 物流'],
    aqi: 42, aqiLabel: '优良', greenSpace: '14%', walkScore: 82,
    winterC: 4, summerC: 22, precip: '1,154 mm/年', snow: '42 cm/年', sunnyDays: 164,
    score: 70, eqi: 90, hci: 88, tci: 60, eoi: 80, cli: 95, psi: 72,
  },
  toronto: {
    tagline: '加拿大金融之都，多元文化大都市',
    lat: '43°40′N', lng: '79°23′W', region: '五大湖区', founded: 1834,
    cityPop: '2,794,356', metroPop: '6,418,000', density: '4,456 人/km²',
    medianIncome: '$65,000', unemployment: '5.8%', gdp: '$374 B',
    industries: ['金融 & 银行', '科技 & AI', '媒体 & 娱乐', '制造业'],
    aqi: 48, aqiLabel: '良好', greenSpace: '10%', walkScore: 78,
    winterC: -4, summerC: 26, precip: '831 mm/年', snow: '122 cm/年', sunnyDays: 201,
    score: 70, eqi: 75, hci: 90, tci: 65, eoi: 92, cli: 68, psi: 68,
  },
  calgary: {
    tagline: '落基山脚，加拿大最阳光的大城市',
    lat: '51°3′N', lng: '114°4′W', region: '草原 / 落基山麓', founded: 1884,
    cityPop: '1,336,000', metroPop: '1,481,000', density: '1,554 人/km²',
    medianIncome: '$78,000', unemployment: '7.1%', gdp: '$110 B',
    industries: ['石油 & 天然气', '农业 & 食品加工', '科技 & 初创', '建筑 & 基建'],
    aqi: 32, aqiLabel: '优秀', greenSpace: '8%', walkScore: 48,
    winterC: -9, summerC: 24, precip: '413 mm/年', snow: '126 cm/年', sunnyDays: 333,
    score: 72, eqi: 82, hci: 78, tci: 82, eoi: 65, cli: 42, psi: 78,
  },
  montreal: {
    tagline: '法兰西风情，北美最具文化活力的城市',
    lat: '45°30′N', lng: '73°34′W', region: '圣劳伦斯河流域', founded: 1642,
    cityPop: '2,094,430', metroPop: '4,291,000', density: '4,916 人/km²',
    medianIncome: '$52,000', unemployment: '5.9%', gdp: '$205 B',
    industries: ['航空航天 & 防务', '信息技术 & 游戏', '制药 & 生物科技', '金融 & 保险'],
    aqi: 39, aqiLabel: '良好', greenSpace: '13%', walkScore: 72,
    winterC: -10, summerC: 26, precip: '1,000 mm/年', snow: '214 cm/年', sunnyDays: 197,
    score: 75, eqi: 78, hci: 75, tci: 72, eoi: 72, cli: 60, psi: 70,
  },
  ottawa: {
    tagline: '加拿大首都，政府与科技的交汇点',
    lat: '45°25′N', lng: '75°41′W', region: '渥太华河谷', founded: 1826,
    cityPop: '1,017,449', metroPop: '1,430,000', density: '353 人/km²',
    medianIncome: '$74,000', unemployment: '4.8%', gdp: '$86 B',
    industries: ['政府 & 公共服务', '高科技 & 通信', '旅游 & 文化', '高等教育'],
    aqi: 35, aqiLabel: '优良', greenSpace: '18%', walkScore: 55,
    winterC: -10, summerC: 27, precip: '923 mm/年', snow: '200 cm/年', sunnyDays: 195,
    score: 73, eqi: 80, hci: 82, tci: 75, eoi: 75, cli: 55, psi: 82,
  },
}

// ─── Housing calculator data (same as before) ──────────────────────────────
const CITY_INFO: Record<string, {
  name: string; province: string; nameEn: string
  basePrice: number; propertyTaxRate: number
  transferTax: (price: number) => number; transferTaxNote: string
}> = {
  vancouver: {
    name: '温哥华', province: 'British Columbia', nameEn: 'Vancouver',
    basePrice: 880000, propertyTaxRate: 0.00278,
    transferTax: (price) => {
      let tax = 0
      if (price <= 200000) tax = price * 0.01
      else if (price <= 2000000) tax = 2000 + (price - 200000) * 0.02
      else tax = 2000 + 36000 + (price - 2000000) * 0.03
      return Math.round(tax)
    },
    transferTaxNote: 'BC省PTT：1%+2%+3%累进税率',
  },
  toronto: {
    name: '多伦多', province: 'Ontario', nameEn: 'Toronto',
    basePrice: 820000, propertyTaxRate: 0.00715,
    transferTax: (price) => {
      let t = 0
      if (price <= 55000) t = price * 0.005
      else if (price <= 250000) t = 275 + (price - 55000) * 0.01
      else if (price <= 400000) t = 2225 + (price - 250000) * 0.015
      else if (price <= 2000000) t = 4475 + (price - 400000) * 0.02
      else t = 36475 + (price - 2000000) * 0.025
      return Math.round(t * 2)
    },
    transferTaxNote: 'Ontario省级+多伦多市级，双重征收',
  },
  calgary: {
    name: '卡尔加里', province: 'Alberta', nameEn: 'Calgary',
    basePrice: 520000, propertyTaxRate: 0.00657,
    transferTax: (price) => Math.round(50 + (price / 5000) * 2),
    transferTaxNote: 'AB省无地产转让税，仅土地登记费约$200–300',
  },
  montreal: {
    name: '蒙特利尔', province: 'Québec', nameEn: 'Montréal',
    basePrice: 580000, propertyTaxRate: 0.00531,
    transferTax: (price) => {
      let tax = 0
      if (price <= 61500) tax = price * 0.005
      else if (price <= 307800) tax = 307.5 + (price - 61500) * 0.01
      else if (price <= 552300) tax = 2765.5 + (price - 307800) * 0.015
      else if (price <= 1104700) tax = 6432.5 + (price - 552300) * 0.02
      else tax = 17480.5 + (price - 1104700) * 0.025
      return Math.round(tax)
    },
    transferTaxNote: 'Québec Welcome Tax（欢迎税）累进税率',
  },
  ottawa: {
    name: '渥太华', province: 'Ontario', nameEn: 'Ottawa',
    basePrice: 620000, propertyTaxRate: 0.01230,
    transferTax: (price) => {
      let t = 0
      if (price <= 55000) t = price * 0.005
      else if (price <= 250000) t = 275 + (price - 55000) * 0.01
      else if (price <= 400000) t = 2225 + (price - 250000) * 0.015
      else if (price <= 2000000) t = 4475 + (price - 400000) * 0.02
      else t = 36475 + (price - 2000000) * 0.025
      return Math.round(t)
    },
    transferTaxNote: 'Ontario省级地产转让税（渥太华无市级）',
  },
}

const OCCUPATION_DATA: Record<string, { name: string; salary: number; baseYears: number }> = {
  nurse:        { name: '注册护士',   salary: 85000,  baseYears: 10.2 },
  software_eng: { name: '软件工程师', salary: 110000, baseYears: 6.8 },
  teacher:      { name: '中学教师',   salary: 78000,  baseYears: 11.4 },
  electrician:  { name: '电工',       salary: 82000,  baseYears: 10.8 },
  truck_driver: { name: '卡车司机',   salary: 68000,  baseYears: 13.2 },
  accountant:   { name: '会计师',     salary: 72000,  baseYears: 12.1 },
  police:       { name: '警察',       salary: 88000,  baseYears: 9.8 },
  chef:         { name: '厨师',       salary: 52000,  baseYears: 17.2 },
  retail:       { name: '零售店员',   salary: 42000,  baseYears: 22.8 },
  engineer:     { name: '土木工程师', salary: 95000,  baseYears: 8.6 },
}

const PROPERTY_TYPES = [
  { name: '1居室公寓', multiplier: 0.72 },
  { name: '2居室公寓', multiplier: 1.0 },
  { name: '3居室公寓', multiplier: 1.28 },
  { name: '城市屋',    multiplier: 1.55 },
  { name: '独立屋',    multiplier: 2.1 },
]

const STRATA_FEES: Record<string, Record<number, { amount: string; note: string } | null>> = {
  vancouver: {
    0: { amount: '约$500–700', note: '1居室月费' }, 1: { amount: '约$700–900', note: '2居室月费' },
    2: { amount: '约$900–1,200', note: '3居室月费' }, 3: { amount: '约$300–500', note: '城市屋月费' }, 4: null,
  },
  toronto: {
    0: { amount: '约$600–800', note: '1居室月费' }, 1: { amount: '约$700–1,000', note: '2居室月费' },
    2: { amount: '约$900–1,200', note: '3居室月费' }, 3: { amount: '约$400–600', note: '城市屋月费' }, 4: null,
  },
  calgary: {
    0: { amount: '约$400–550', note: '1居室月费' }, 1: { amount: '约$500–700', note: '2居室月费' },
    2: { amount: '约$700–900', note: '3居室月费' }, 3: { amount: '约$300–450', note: '城市屋月费' }, 4: null,
  },
  montreal: {
    0: { amount: '约$300–450', note: '1居室月费' }, 1: { amount: '约$400–600', note: '2居室月费' },
    2: { amount: '约$600–800', note: '3居室月费' }, 3: { amount: '约$250–400', note: '城市屋月费' }, 4: null,
  },
  ottawa: {
    0: { amount: '约$400–550', note: '1居室月费' }, 1: { amount: '约$550–750', note: '2居室月费' },
    2: { amount: '约$750–950', note: '3居室月费' }, 3: { amount: '约$300–500', note: '城市屋月费' }, 4: null,
  },
}

const CITY_MULTIPLIERS: Record<string, number> = {
  vancouver: 1.0, toronto: 0.94, calgary: 0.38, montreal: 0.72, ottawa: 0.66,
}

function getLabel(years: number) {
  if (years < 5)  return { label: '可负担', color: '#059669', bg: '#D1FAE5' }
  if (years < 8)  return { label: '可承受', color: '#65A30D', bg: '#ECFDF5' }
  if (years < 12) return { label: '沉重',   color: '#D97706', bg: '#FEF3C7' }
  if (years < 16) return { label: '严峻',   color: '#EA580C', bg: '#FEF0E7' }
  return             { label: '压垮性', color: '#DC2626', bg: '#FEE2E2' }
}

// ─── Main page component ───────────────────────────────────────────────────
export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const city    = CITY_INFO[slug]    || CITY_INFO.vancouver
  const profile = CITY_PROFILES[slug] || CITY_PROFILES.vancouver

  const [loaded, setLoaded]       = useState(false)
  const [occupation, setOccupation] = useState('nurse')
  const [activeProperty, setActiveProperty] = useState(1)
  const [showPropDrop, setShowPropDrop]     = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setOccupation(p.get('occupation') || 'nurse')
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  const occData    = OCCUPATION_DATA[occupation] || OCCUPATION_DATA.nurse
  const cityMult   = CITY_MULTIPLIERS[slug] || 1.0
  const currentProp = PROPERTY_TYPES[activeProperty]
  const years      = parseFloat((occData.baseYears * currentProp.multiplier * cityMult).toFixed(1))
  const { label, color, bg } = getLabel(years)
  const price      = Math.round(city.basePrice * currentProp.multiplier)
  const price2019  = Math.round(price * 0.72)
  const barWidth   = Math.min((years / 25) * 100, 100)
  const transferTaxAmount  = city.transferTax(price)
  const propertyTaxAmount  = Math.round(price * city.propertyTaxRate)
  const cmhcAmount         = Math.round(price * 0.031)
  const strataFee          = STRATA_FEES[slug]?.[activeProperty]
  const strataAnnual       = strataFee
    ? (activeProperty === 0 ? 7200 : activeProperty === 1 ? 9600 : activeProperty === 2 ? 12000 : 4800)
    : 0
  const totalHidden = transferTaxAmount + propertyTaxAmount + cmhcAmount + strataAnnual

  const scoreColor = profile.score >= 73 ? '#059669' : profile.score >= 70 ? '#D97706' : '#DC2626'
  const winterColor = profile.winterC < -5 ? '#60A5FA' : profile.winterC < 0 ? '#93C5FD' : '#10B981'

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <a href="/" className="inline-flex items-center gap-1 text-white/30 text-sm mb-4 hover:text-white/50 transition-colors">
            ← 返回地球
          </a>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-white/40 text-sm mb-1">加拿大 · {city.province}</div>
              <h1 className="text-3xl font-bold text-white mb-0.5" style={{ letterSpacing: '-0.5px' }}>{city.name}</h1>
              <div className="text-white/50 text-sm">{city.nameEn}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold font-mono leading-none" style={{ color: scoreColor }}>{profile.score}</div>
              <div className="text-white/30 text-xs mt-1">综合生活指数</div>
            </div>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-4">{profile.tagline}</p>

          {/* Quick cost row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '买房', value: `10.2年`, c: '#EF4444' },
              { label: '租金占收入', value: `${slug === 'vancouver' ? 43.6 : slug === 'toronto' ? 41.2 : slug === 'calgary' ? 24.1 : slug === 'montreal' ? 30.2 : 28.4}%`, c: '#F59E0B' },
              { label: '年均晴天', value: `${profile.sunnyDays}天`, c: '#FDE047' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-lg font-bold font-mono" style={{ color: s.c }}>{s.value}</div>
                <div className="text-white/30 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

        {/* ── Section: 城市基本信息 ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>📍</span>
            <span className="text-sm font-semibold text-[#111827]">城市基本信息</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: '坐标', value: `${profile.lat}` },
              { label: '地理区域', value: profile.region },
              { label: '建城年份', value: String(profile.founded) },
              { label: '市区人口', value: profile.cityPop },
              { label: '大都会区人口', value: profile.metroPop },
              { label: '人口密度', value: profile.density },
            ].map(({ label, value }) => (
              <div key={label} className="p-3.5 rounded-xl border border-[#E5E7EB]">
                <div className="text-xs text-[#9CA3AF] mb-1">{label}</div>
                <div className="text-sm font-semibold text-[#111827] leading-tight">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section: 经济数据 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>💼</span>
            <span className="text-sm font-semibold text-[#111827]">经济数据</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: '家庭年收入中位数', value: profile.medianIncome, color: '#059669' },
                { label: '本地GDP（加元）',  value: profile.gdp,          color: '#059669' },
                { label: '失业率',
                  value: profile.unemployment,
                  color: parseFloat(profile.unemployment) > 6 ? '#DC2626' : '#059669' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3.5 rounded-xl border border-[#E5E7EB]">
                  <div className="text-xs text-[#9CA3AF] mb-1">{label}</div>
                  <div className="text-base font-bold font-mono" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF] mb-2">主要产业</div>
              <div className="flex flex-wrap gap-2">
                {profile.industries.map(ind => (
                  <span key={ind} className="px-3 py-1 rounded-full text-xs font-medium text-[#374151]"
                    style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>{ind}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: 环境数据 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>🌿</span>
            <span className="text-sm font-semibold text-[#111827]">环境数据</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">空气质量指数 (AQI)</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono" style={{
                  color: profile.aqi < 35 ? '#059669' : profile.aqi < 50 ? '#D97706' : '#DC2626'
                }}>{profile.aqi}</span>
                <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{
                  background: profile.aqi < 35 ? '#059669' : profile.aqi < 50 ? '#D97706' : '#DC2626'
                }}>{profile.aqiLabel}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">绿化覆盖率</div>
              <div className="text-xl font-bold font-mono text-[#059669]">{profile.greenSpace}</div>
            </div>
            <div className="col-span-2 p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-2">步行指数（Walk Score）</div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-mono" style={{
                  color: profile.walkScore > 70 ? '#059669' : profile.walkScore > 50 ? '#D97706' : '#DC2626'
                }}>{profile.walkScore}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${profile.walkScore}%`,
                    background: profile.walkScore > 70 ? '#059669' : profile.walkScore > 50 ? '#D97706' : '#DC2626'
                  }} />
                </div>
                <span className="text-xs text-[#9CA3AF]">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: 气候数据 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>🌤️</span>
            <span className="text-sm font-semibold text-[#111827]">气候数据</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">冬季平均气温</div>
              <div className="text-xl font-bold font-mono" style={{ color: winterColor }}>
                {profile.winterC > 0 ? '+' : ''}{profile.winterC}°C
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">夏季平均气温</div>
              <div className="text-xl font-bold font-mono text-[#F59E0B]">+{profile.summerC}°C</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">年降水量</div>
              <div className="text-base font-semibold text-[#374151]">{profile.precip}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-1">年降雪量</div>
              <div className="text-base font-semibold text-[#374151]">{profile.snow}</div>
            </div>
            <div className="col-span-2 p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="text-xs text-[#9CA3AF] mb-2">年均晴天数</div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-mono text-[#F59E0B]">{profile.sunnyDays}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(profile.sunnyDays / 365) * 100}%`,
                    background: 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  }} />
                </div>
                <span className="text-xs text-[#9CA3AF]">/ 365天</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: 生活综合指数 ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>📊</span>
            <span className="text-sm font-semibold text-[#111827]">10维生活指数</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: '环境质量 EQI', value: profile.eqi,  color: '#10B981' },
              { label: '医疗水平 HCI', value: profile.hci,  color: '#10B981' },
              { label: '就业机会 EOI', value: profile.eoi,  color: '#4F8EF7' },
              { label: '交通便利 TCI', value: profile.tci,  color: '#4F8EF7' },
              { label: '气候舒适 CLI', value: profile.cli,  color: '#F59E0B' },
              { label: '治安安全 PSI', value: profile.psi,  color: '#059669' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#374151]">{label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color }}>{value} / 100</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: loaded ? `${value}%` : '0%', background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-[#F3F4F6] text-center">
            <p className="text-xs text-[#D1D5DB]">数据来源：StatCan · CREA · CMHC · Maclean's · 更新于 2026年Q1</p>
          </div>
        </div>

        {/* ── Section: 买房计算器 ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span>🏠</span>
                  <div className="text-sm font-semibold text-[#111827]">
                    {occData.name} · 买房需要多少年
                  </div>
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  税前年薪 ${occData.salary.toLocaleString()} · 20%首付 · 25年摊销
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowPropDrop(!showPropDrop)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                  {currentProp.name}
                  <span className={`transition-transform duration-200 text-xs ${showPropDrop ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {showPropDrop && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
                    {PROPERTY_TYPES.map((prop, i) => (
                      <button key={i}
                        onClick={() => { setActiveProperty(i); setShowPropDrop(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          activeProperty === i ? 'bg-blue-50 text-blue-600 font-medium' : 'text-[#374151] hover:bg-gray-50'
                        }`}>
                        {prop.name}{activeProperty === i && <span className="float-right">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-[#111827] mb-1">{currentProp.name}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#374151]">现在 <span className="font-bold">${(price / 10000).toFixed(0)}万</span></span>
                  <span className="text-[#9CA3AF]">·</span>
                  <span className="text-[#9CA3AF]">2019 <span className="font-medium">${(price2019 / 10000).toFixed(0)}万</span></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold font-mono mb-1" style={{ color, letterSpacing: '-1.5px' }}>
                  {years}<span className="text-lg text-[#9CA3AF] ml-1">年</span>
                </div>
                <div className="text-sm font-bold px-3 py-1 rounded-full inline-block" style={{ background: bg, color }}>{label}</div>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: loaded ? `${barWidth}%` : '0%', background: color }} />
            </div>
          </div>

          <div className="px-5 pb-4">
            <div className="text-xs text-[#9CA3AF] mb-2">其他房型对比</div>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPES.filter((_, i) => i !== activeProperty).map((prop, i) => {
                const y = parseFloat((occData.baseYears * prop.multiplier * cityMult).toFixed(1))
                const { label: l, color: c, bg: b } = getLabel(y)
                return (
                  <button key={i}
                    onClick={() => setActiveProperty(PROPERTY_TYPES.indexOf(prop))}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#F3F4F6] hover:border-[#5B5CF0] transition-all text-left"
                    style={{ background: '#F9FAFB' }}>
                    <span className="text-xs text-[#6B7280]">{prop.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono" style={{ color: c }}>{y}年</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: b, color: c }}>{l}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-[#F3F4F6]" style={{ background: '#F9FAFB' }}>
            <div className="text-xs text-[#9CA3AF] text-center">数据来源：StatCan NOC 2021 · CREA · 更新于 2026年Q1</div>
          </div>
        </div>

        {/* ── Section: 隐性成本 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
            <span>💸</span>
            <span className="text-sm font-semibold text-[#111827]">隐性成本揭示</span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">{slug === 'calgary' ? '土地登记费' : '地产转让税'}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{city.transferTaxNote}</div>
              </div>
              <div className="text-sm font-bold flex-shrink-0 ml-4"
                style={{ color: slug === 'calgary' ? '#D97706' : '#DC2626' }}>
                约${transferTaxAmount.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">房产税（年）</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{city.name}税率 {(city.propertyTaxRate * 100).toFixed(3)}%/年</div>
              </div>
              <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">约${propertyTaxAmount.toLocaleString()}/年</div>
            </div>
            {strataFee ? (
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-[#374151]">物业管理费（月）</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{strataFee.note}</div>
                </div>
                <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">{strataFee.amount}/月</div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-[#374151]">物业管理费</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">独立屋无物业管理费</div>
                </div>
                <div className="text-sm font-medium text-[#9CA3AF] flex-shrink-0 ml-4">不适用</div>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">CMHC保险</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">首付{'<'}20%时必须缴纳，约房价3.1%</div>
              </div>
              <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">约${cmhcAmount.toLocaleString()}</div>
            </div>
          </div>
          <div className="mx-5 my-3 p-3 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#DC2626]">首年额外支出合计（约）</div>
                <div className="text-xs text-[#EA580C] mt-0.5">{activeProperty === 4 ? '不含物业管理费' : '含首年物业管理费'}</div>
              </div>
              <div className="text-lg font-bold text-[#DC2626]">约${totalHidden.toLocaleString()}</div>
            </div>
          </div>
          <div className="px-5 pb-4 text-center">
            <p className="text-xs text-[#9CA3AF]">数据来源：各省税务局 · CMHC · 各市政府官网</p>
          </div>
        </div>

        {/* ── CTAs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <a href={`/compare?city=${slug}&occupation=${occupation}`}
            className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            对比其他城市 →
          </a>
          <a href="/ranking"
            className="px-5 py-3.5 rounded-xl text-sm font-semibold text-center text-[#374151]"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
            排行榜
          </a>
        </div>

      </div>

      {showPropDrop && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPropDrop(false)} />
      )}
    </main>
  )
}
