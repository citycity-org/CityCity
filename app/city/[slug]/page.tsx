'use client'
import { useState, useEffect } from 'react'

const CITY_INFO: Record<string, { name: string; province: string; nameEn: string; basePrice: number }> = {
  vancouver: { name: '温哥华', province: 'British Columbia', nameEn: 'Vancouver', basePrice: 880000 },
  toronto: { name: '多伦多', province: 'Ontario', nameEn: 'Toronto', basePrice: 820000 },
  calgary: { name: '卡尔加里', province: 'Alberta', nameEn: 'Calgary', basePrice: 520000 },
  montreal: { name: '蒙特利尔', province: 'Québec', nameEn: 'Montréal', basePrice: 580000 },
  ottawa: { name: '渥太华', province: 'Ontario', nameEn: 'Ottawa', basePrice: 620000 },
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

const HIDDEN_COSTS = [
  { name: '地产转让税 PTT', amount: 14000, desc: '购房价格的约1.5%' },
  { name: '房产税（年）', amount: 6800, desc: '市政税率约0.25%/年' },
  { name: '物业管理费（月）', amount: 650, desc: '公寓平均月费' },
  { name: 'CMHC保险', amount: 28000, desc: '首付<20%时必须缴纳' },
]

function getLabel(years: number) {
  if (years < 5) return { label: '可负担', color: '#059669', bg: '#D1FAE5' }
  if (years < 8) return { label: '可承受', color: '#65A30D', bg: '#ECFDF5' }
  if (years < 12) return { label: '沉重', color: '#D97706', bg: '#FEF3C7' }
  if (years < 16) return { label: '严峻', color: '#EA580C', bg: '#FEF0E7' }
  return { label: '压垮性', color: '#DC2626', bg: '#FEE2E2' }
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = CITY_INFO[params.slug] || CITY_INFO.vancouver
  const [loaded, setLoaded] = useState(false)
  const [occupation, setOccupation] = useState('nurse')
  const [activeProperty, setActiveProperty] = useState(1) // 默认2居室
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const occ = urlParams.get('occupation') || 'nurse'
    setOccupation(occ)
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  const occData = OCCUPATION_DATA[occupation] || OCCUPATION_DATA.nurse
  const totalHiddenCosts = HIDDEN_COSTS.reduce((sum, c) => sum + c.amount, 0)

  const currentProp = PROPERTY_TYPES[activeProperty]
  const years = parseFloat((occData.baseYears * currentProp.multiplier).toFixed(1))
  const { label, color, bg } = getLabel(years)
  const price = Math.round(city.basePrice * currentProp.multiplier)
  const price2019 = Math.round(price * 0.72)
  const barWidth = Math.min((years / 25) * 100, 100)

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

              {/* 房型切换下拉 */}
              <div className="relative">
                <button
                  onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
                    border: 'none',
                    color: 'white'
                  }}>
                  {currentProp.name}
                  <span className={`transition-transform duration-200 text-xs ${showPropertyDropdown ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {showPropertyDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
                    {PROPERTY_TYPES.map((prop, i) => (
                      <button key={i}
                        onClick={() => { setActiveProperty(i); setShowPropertyDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          activeProperty === i
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-[#374151] hover:bg-gray-50'
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

          {/* 当前房型结果 */}
          <div className="px-5 py-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-[#111827] mb-1">{currentProp.name}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#374151]">
                    现在 <span className="font-bold">${(price / 10000).toFixed(0)}万</span>
                  </span>
                  <span className="text-[#9CA3AF]">·</span>
                  <span className="text-[#9CA3AF]">
                    2019 <span className="font-medium">${(price2019 / 10000).toFixed(0)}万</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold font-mono mb-1"
                  style={{ color, letterSpacing: '-1.5px' }}>
                  {years}<span className="text-lg text-[#9CA3AF] ml-1">年</span>
                </div>
                <div className="text-sm font-bold px-3 py-1 rounded-full inline-block"
                  style={{ background: bg, color }}>
                  {label}
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: loaded ? `${barWidth}%` : '0%', background: color }} />
            </div>
          </div>

          {/* 其他房型快速对比 */}
          <div className="px-5 pb-4">
            <div className="text-xs text-[#9CA3AF] mb-2">其他房型对比</div>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPES.filter((_, i) => i !== activeProperty).map((prop, i) => {
                const y = parseFloat((occData.baseYears * prop.multiplier).toFixed(1))
                const { label: l, color: c, bg: b } = getLabel(y)
                return (
                  <button key={i}
                    onClick={() => setActiveProperty(PROPERTY_TYPES.indexOf(prop))}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#F3F4F6] hover:border-[#5B5CF0] transition-all text-left"
                    style={{ background: '#F9FAFB' }}>
                    <span className="text-xs text-[#6B7280]">{prop.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono" style={{ color: c }}>{y}年</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: b, color: c }}>{l}</span>
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
                  <span className="text-xs font-mono font-bold w-16 text-right flex-shrink-0"
                    style={{ color: row.color }}>
                    ${(p / 10000).toFixed(0)}万
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mx-5 mb-4 p-3 rounded-xl"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
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
            <div className="text-xs text-[#9CA3AF] mt-0.5">这些费用不会出现在房价里</div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {HIDDEN_COSTS.map(cost => (
              <div key={cost.name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-[#374151]">{cost.name}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{cost.desc}</div>
                </div>
                <div className="text-sm font-bold text-[#DC2626] flex-shrink-0 ml-4">
                  +${cost.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="mx-5 my-3 p-3 rounded-xl flex items-center justify-between"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span className="text-sm font-semibold text-[#DC2626]">首年额外支出合计</span>
            <span className="text-lg font-bold text-[#DC2626]">${totalHiddenCosts.toLocaleString()}</span>
          </div>
          <div className="px-5 pb-4">
            <div className="text-xs text-[#9CA3AF] text-center">
              数据来源：BC省税务局 · CMHC · 各市政府官网
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pb-6">
          <a href={`/results?city=${params.slug}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            ← 返回结论
          </a>
          <a href={`/compare?city=${params.slug}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center text-white"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            对比其他城市 →
          </a>
        </div>

      </div>

      {/* 点击外部关闭下拉 */}
      {showPropertyDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPropertyDropdown(false)} />
      )}
    </main>
  )
}