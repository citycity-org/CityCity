'use client'
import { useState, useEffect, use } from 'react'

const CITY_INFO: Record<string, {
  name: string
  province: string
  nameEn: string
  basePrice: number
  propertyTaxRate: number
  transferTax: (price: number) => number
  transferTaxNote: string
}> = {
  vancouver: {
    name: '温哥华', province: 'British Columbia', nameEn: 'Vancouver',
    basePrice: 880000,
    propertyTaxRate: 0.00278,
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
    basePrice: 820000,
    propertyTaxRate: 0.00715,
    transferTax: (price) => {
      let provincial = 0
      if (price <= 55000) provincial = price * 0.005
      else if (price <= 250000) provincial = 275 + (price - 55000) * 0.01
      else if (price <= 400000) provincial = 2225 + (price - 250000) * 0.015
      else if (price <= 2000000) provincial = 4475 + (price - 400000) * 0.02
      else provincial = 36475 + (price - 2000000) * 0.025
      return Math.round(provincial * 2)
    },
    transferTaxNote: 'Ontario省级+多伦多市级，双重征收',
  },
  calgary: {
    name: '卡尔加里', province: 'Alberta', nameEn: 'Calgary',
    basePrice: 520000,
    propertyTaxRate: 0.00657,
    transferTax: (price) => Math.round(50 + (price / 5000) * 2),
    transferTaxNote: 'AB省无地产转让税，仅土地登记费约$200-300',
  },
  montreal: {
    name: '蒙特利尔', province: 'Québec', nameEn: 'Montréal',
    basePrice: 580000,
    propertyTaxRate: 0.00531,
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
    basePrice: 620000,
    propertyTaxRate: 0.01230,
    transferTax: (price) => {
      let provincial = 0
      if (price <= 55000) provincial = price * 0.005
      else if (price <= 250000) provincial = 275 + (price - 55000) * 0.01
      else if (price <= 400000) provincial = 2225 + (price - 250000) * 0.015
      else if (price <= 2000000) provincial = 4475 + (price - 400000) * 0.02
      else provincial = 36475 + (price - 2000000) * 0.025
      return Math.round(provincial)
    },
    transferTaxNote: 'Ontario省级地产转让税（渥太华无市级）',
  },
}

const OCCUPATION_DATA: Record<string, { name: string; salary: number; baseYears: number }> = {
  nurse: { name: '注册护士', salary: 85000, baseYears: 10.2 },
  software_eng: { name: '软件工程师', salary: 110000, baseYears: 6.8 },
  teacher: { name: '中学教师', salary: 78000, baseYears: 11.4 },
  electrician: { name: '电工', salary: 82000, baseYears: 10.8 },
  truck_driver: { name: '卡车司机', salary: 68000, baseYears: 13.2 },
  accountant: { name: '会计师', salary: 72000, baseYears: 12.1 },
  police: { name: '警察', salary: 88000, baseYears: 9.8 },
  chef: { name: '厨师', salary: 52000, baseYears: 17.2 },
  retail: { name: '零售店员', salary: 42000, baseYears: 22.8 },
  engineer: { name: '土木工程师', salary: 95000, baseYears: 8.6 },
}

const PROPERTY_TYPES = [
  { name: '1居室公寓', multiplier: 0.72 },
  { name: '2居室公寓', multiplier: 1.0 },
  { name: '3居室公寓', multiplier: 1.28 },
  { name: '城市屋', multiplier: 1.55 },
  { name: '独立屋', multiplier: 2.1 },
]

const STRATA_FEES: Record<string, Record<number, { amount: string; note: string } | null>> = {
  vancouver: {
    0: { amount: '约$500–700', note: '1居室月费，楼盘而异' },
    1: { amount: '约$700–900', note: '2居室月费，楼盘而异' },
    2: { amount: '约$900–1,200', note: '3居室月费，楼盘而异' },
    3: { amount: '约$300–500', note: '城市屋月费，共用面积少' },
    4: null,
  },
  toronto: {
    0: { amount: '约$600–800', note: '1居室月费，楼盘而异' },
    1: { amount: '约$700–1,000', note: '2居室月费，楼盘而异' },
    2: { amount: '约$900–1,200', note: '3居室月费，楼盘而异' },
    3: { amount: '约$400–600', note: '城市屋月费，共用面积少' },
    4: null,
  },
  calgary: {
    0: { amount: '约$400–550', note: '1居室月费，楼盘而异' },
    1: { amount: '约$500–700', note: '2居室月费，楼盘而异' },
    2: { amount: '约$700–900', note: '3居室月费，楼盘而异' },
    3: { amount: '约$300–450', note: '城市屋月费，共用面积少' },
    4: null,
  },
  montreal: {
    0: { amount: '约$300–450', note: '1居室月费，楼盘而异' },
    1: { amount: '约$400–600', note: '2居室月费，楼盘而异' },
    2: { amount: '约$600–800', note: '3居室月费，楼盘而异' },
    3: { amount: '约$250–400', note: '城市屋月费，共用面积少' },
    4: null,
  },
  ottawa: {
    0: { amount: '约$400–550', note: '1居室月费，楼盘而异' },
    1: { amount: '约$550–750', note: '2居室月费，楼盘而异' },
    2: { amount: '约$750–950', note: '3居室月费，楼盘而异' },
    3: { amount: '约$300–500', note: '城市屋月费，共用面积少' },
    4: null,
  },
}

function getLabel(years: number) {
  if (years < 5) return { label: '可负担', color: '#059669', bg: '#D1FAE5' }
  if (years < 8) return { label: '可承受', color: '#65A30D', bg: '#ECFDF5' }
  if (years < 12) return { label: '沉重', color: '#D97706', bg: '#FEF3C7' }
  if (years < 16) return { label: '严峻', color: '#EA580C', bg: '#FEF0E7' }
  return { label: '压垮性', color: '#DC2626', bg: '#FEE2E2' }
}

export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const city = CITY_INFO[slug] || CITY_INFO.vancouver
  const [loaded, setLoaded] = useState(false)
  const [occupation, setOccupation] = useState('nurse')
  const [activeProperty, setActiveProperty] = useState(1)
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const occ = urlParams.get('occupation') || 'nurse'
    setOccupation(occ)
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  const occData = OCCUPATION_DATA[occupation] || OCCUPATION_DATA.nurse
  const CITY_MULTIPLIERS: Record<string, number> = {
  vancouver: 1.0,
  toronto: 0.94,
  calgary: 0.38,
  montreal: 0.72,
  ottawa: 0.66,
}
const cityMultiplier = CITY_MULTIPLIERS[slug] || 1.0
  const currentProp = PROPERTY_TYPES[activeProperty]
  const years = parseFloat((occData.baseYears * currentProp.multiplier * cityMultiplier).toFixed(1))
  const { label, color, bg } = getLabel(years)
  const price = Math.round(city.basePrice * currentProp.multiplier)
  const price2019 = Math.round(price * 0.72)
  const barWidth = Math.min((years / 25) * 100, 100)

  const transferTaxAmount = city.transferTax(price)
  const propertyTaxAmount = Math.round(price * city.propertyTaxRate)
  const cmhcAmount = Math.round(price * 0.031)
  const strataFee = STRATA_FEES[slug]?.[activeProperty]
  const strataAnnual = strataFee
    ? (activeProperty === 0 ? 7200 : activeProperty === 1 ? 9600 : activeProperty === 2 ? 12000 : 4800)
    : 0
  const totalHidden = transferTaxAmount + propertyTaxAmount + cmhcAmount + strataAnnual

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <a href="/" className="text-white/30 text-sm hover:text-white/50 transition-colors">首页</a>
            <span className="text-white/20">›</span>
            <span className="text-white/50 text-sm">城市真相</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1" style={{ letterSpacing: '-1px' }}>
                {city.name}
              </h1>
              <p className="text-white/40 text-sm">{city.province} · {city.nameEn}</p>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs mb-1">当前职业</div>
              <div className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ background: 'rgba(79,142,247,0.2)', border: '1px solid rgba(79,142,247,0.3)' }}>
                {occData.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* 区块A：职业 × 当前房型 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  {occData.name} · 买房需要多少年
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">
                  税前年薪 ${occData.salary.toLocaleString()} · 20%首付 · 25年摊销
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                  {currentProp.name}
                  <span className={`transition-transform duration-200 text-xs ${showPropertyDropdown ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {showPropertyDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
                    {PROPERTY_TYPES.map((prop, i) => (
                      <button key={i}
                        onClick={() => { setActiveProperty(i); setShowPropertyDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          activeProperty === i ? 'bg-blue-50 text-blue-600 font-medium' : 'text-[#374151] hover:bg-gray-50'
                        }`}>
                        {prop.name}
                        {activeProperty === i && <span className="float-right">✓</span>}
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
                <div className="text-sm font-bold px-3 py-1 rounded-full inline-block" style={{ background: bg, color }}>
                  {label}
                </div>
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
                const y = parseFloat((occData.baseYears * prop.multiplier * cityMultiplier).toFixed(1))
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
            <div className="text-xs text-[#9CA3AF] text-center">
              数据来源：StatCan NOC 2021 · CREA · 更新于 2026年Q1
            </div>
          </div>
        </div>

        {/* 区块B：历史价格趋势 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">历史价格趋势</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{currentProp.name} · 1995年至今</div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { year: '1995', pct: 0.18, color: '#10B981' },
              { year: '2000', pct: 0.22, color: '#10B981' },
              { year: '2005', pct: 0.32, color: '#F59E0B' },
              { year: '2010', pct: 0.45, color: '#F59E0B' },
              { year: '2015', pct: 0.58, color: '#F59E0B' },
              { year: '2019', pct: 0.72, color: '#EA580C' },
              { year: '2026', pct: 1.0, color: '#DC2626', bold: true },
            ].map(row => {
              const p = Math.round(price * row.pct)
              return (
                <div key={row.year} className="flex items-center gap-3">
                  <span className={`text-xs font-mono w-8 flex-shrink-0 ${row.bold ? 'font-bold text-[#111827]' : 'text-[#9CA3AF]'}`}>
                    {row.year}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: loaded ? `${row.pct * 100}%` : '0%', background: row.color }} />
                  </div>
                  <span className="text-xs font-mono font-bold w-16 text-right flex-shrink-0" style={{ color: row.color }}>
                    ${(p / 10000).toFixed(0)}万
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mx-5 mb-4 p-3 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xs text-[#9CA3AF] mb-0.5">2019</div>
                <div className="text-base font-bold text-[#EA580C]">${(price2019 / 10000).toFixed(0)}万</div>
              </div>
              <div className="text-[#D1D5DB] text-lg">→</div>
              <div className="text-center">
                <div className="text-xs text-[#9CA3AF] mb-0.5">2026</div>
                <div className="text-base font-bold text-[#DC2626]">${(price / 10000).toFixed(0)}万</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#9CA3AF] mb-0.5">涨幅</div>
                <div className="text-base font-bold text-[#DC2626]">+39%</div>
              </div>
            </div>
          </div>
        </div>

        {/* 区块C：隐性成本 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">隐性成本揭示</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{currentProp.name} · 这些费用不会出现在房价里</div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">

            {/* 地产转让税 — 按城市真实税率 */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">
                  {slug === 'calgary' ? '土地登记费' : '地产转让税'}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{city.transferTaxNote}</div>
              </div>
              <div className="text-sm font-bold flex-shrink-0 ml-4"
                style={{ color: slug === 'calgary' ? '#D97706' : '#DC2626' }}>
                约${transferTaxAmount.toLocaleString()}
              </div>
            </div>

            {/* 房产税 — 按城市真实税率 */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">房产税（年）</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">
                  {city.name}税率 {(city.propertyTaxRate * 100).toFixed(3)}%/年
                </div>
              </div>
              <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">
                约${propertyTaxAmount.toLocaleString()}/年
              </div>
            </div>

            {/* 物业管理费 — 独立屋没有，按城市和房型 */}
            {strataFee ? (
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-[#374151]">物业管理费（月）</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{strataFee.note}</div>
                </div>
                <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">
                  {strataFee.amount}/月
                </div>
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

            {/* CMHC */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="text-sm font-medium text-[#374151]">CMHC保险</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">首付{'<'}20%时必须缴纳，约房价3.1%</div>
              </div>
              <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">
                约${cmhcAmount.toLocaleString()}
              </div>
            </div>

          </div>

          {/* 合计 */}
          <div className="mx-5 my-3 p-3 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#DC2626]">首年额外支出合计（约）</div>
                <div className="text-xs text-[#EA580C] mt-0.5">
                  {activeProperty === 4 ? '不含物业管理费' : '含首年物业管理费'}
                </div>
              </div>
              <div className="text-lg font-bold text-[#DC2626]">
                约${totalHidden.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="px-5 pb-4">
            <div className="text-xs text-[#9CA3AF] text-center">
              数据来源：BC省税务局 · CMHC · 各市政府官网 · 以上均为估算，实际费用以成交为准
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pb-6">
          <a href={`/results?city=${slug}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            ← 返回结论
          </a>
          <a href={`/compare?city=${slug}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center text-white"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            对比其他城市 →
          </a>
        </div>

      </div>

      {showPropertyDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPropertyDropdown(false)} />
      )}
    </main>
  )
}