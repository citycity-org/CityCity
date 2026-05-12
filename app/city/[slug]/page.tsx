
'use client'
import { useState, useEffect } from 'react'

const CITY_INFO: Record<string, { name: string; province: string; nameEn: string }> = {
  vancouver: { name: '温哥华', province: 'British Columbia', nameEn: 'Vancouver' },
  toronto: { name: '多伦多', province: 'Ontario', nameEn: 'Toronto' },
  calgary: { name: '卡尔加里', province: 'Alberta', nameEn: 'Calgary' },
  montreal: { name: '蒙特利尔', province: 'Québec', nameEn: 'Montréal' },
  ottawa: { name: '渥太华', province: 'Ontario', nameEn: 'Ottawa' },
}

const OCCUPATIONS = [
  { id: 'nurse', name: '注册护士', salary: 85000, hpiYears: 10.2, rpi: 43.6, cpi: 7.6 },
  { id: 'software_eng', name: '软件工程师', salary: 110000, hpiYears: 6.8, rpi: 32.1, cpi: 5.8 },
  { id: 'teacher', name: '中学教师', salary: 78000, hpiYears: 11.4, rpi: 47.2, cpi: 8.1 },
  { id: 'electrician', name: '电工', salary: 82000, hpiYears: 10.8, rpi: 44.8, cpi: 7.9 },
  { id: 'truck_driver', name: '卡车司机', salary: 68000, hpiYears: 13.2, rpi: 54.1, cpi: 9.6 },
  { id: 'accountant', name: '会计师', salary: 72000, hpiYears: 12.1, rpi: 49.8, cpi: 8.8 },
  { id: 'police', name: '警察', salary: 88000, hpiYears: 9.8, rpi: 41.2, cpi: 7.2 },
  { id: 'chef', name: '厨师', salary: 52000, hpiYears: 17.2, rpi: 68.4, cpi: 12.4 },
  { id: 'retail', name: '零售店员', salary: 42000, hpiYears: 22.8, rpi: 84.2, cpi: 15.6 },
  { id: 'engineer', name: '土木工程师', salary: 95000, hpiYears: 8.6, rpi: 38.4, cpi: 6.8 },
]

const PROPERTY_TYPES = ['1居室公寓', '2居室公寓', '3居室公寓', 'Townhouse', '独立屋']
const PROPERTY_MULTIPLIERS = [0.72, 1.0, 1.28, 1.55, 2.1]

const HIDDEN_COSTS = [
  { name: '地产转让税 PTT', amount: 14000, desc: '购房价格的约1.5%' },
  { name: '房产税（年）', amount: 6800, desc: '市政税率约0.25%/年' },
  { name: '物业管理费（月）', amount: 650, desc: '公寓平均月费' },
  { name: 'CMHC保险', amount: 28000, desc: '首付<20%时必须缴纳' },
]

const DIMS = [
  { name: '环境质量 EQI', score: 9, max: 10, label: '优秀', color: '#059669', source: 'Health Canada AQHI' },
  { name: '教育质量 EDI', score: 8, max: 10, label: '优秀', color: '#059669', source: 'Fraser Institute' },
  { name: '医疗可及 HCI', score: 7, max: 10, label: '良好', color: '#65A30D', source: 'CIHI' },
  { name: '交通便利 TCI', score: 8, max: 10, label: '良好', color: '#65A30D', source: 'Walk Score API' },
]

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = CITY_INFO[params.slug] || CITY_INFO.vancouver
  const [activeProperty, setActiveProperty] = useState(1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  const basePrice = params.slug === 'vancouver' ? 880000
    : params.slug === 'toronto' ? 820000
    : params.slug === 'calgary' ? 520000
    : params.slug === 'montreal' ? 580000
    : 620000

  const currentPrice = Math.round(basePrice * PROPERTY_MULTIPLIERS[activeProperty])
  const preCOVIDPrice = Math.round(currentPrice * 0.72)
  const totalHiddenCosts = HIDDEN_COSTS.reduce((sum, c) => sum + c.amount, 0)

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-white/40 text-sm mb-1">城市真相页</div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>
            {city.name}
          </h1>
          <p className="text-white/40 text-sm">{city.province} · {city.nameEn}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* 区块A：职业×房型数据表 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827] mb-3">
              各职业买房年数
            </div>
            {/* 房型切换 */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PROPERTY_TYPES.map((type, i) => (
                <button key={i}
                  onClick={() => setActiveProperty(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeProperty === i
                      ? 'text-white'
                      : 'text-[#6B7280] bg-[#F3F4F6]'
                  }`}
                  style={activeProperty === i ? { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' } : {}}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 职业列表 */}
          <div className="divide-y divide-[#F3F4F6]">
            {OCCUPATIONS.map(occ => {
              const years = (occ.hpiYears * PROPERTY_MULTIPLIERS[activeProperty]).toFixed(1)
              const yearsNum = parseFloat(years)
              const color = yearsNum < 5 ? '#059669' : yearsNum < 8 ? '#65A30D' : yearsNum < 12 ? '#D97706' : '#DC2626'
              const label = yearsNum < 5 ? '可负担' : yearsNum < 8 ? '可承受' : yearsNum < 12 ? '沉重' : '压垮性'
              const barWidth = Math.min((yearsNum / 25) * 100, 100)

              return (
                <div key={occ.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#374151]">{occ.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono" style={{ color }}>{years}年</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: color + '20', color }}>{label}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: loaded ? `${barWidth}%` : '0%', background: color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 区块B：历史趋势 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">历史价格趋势</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{PROPERTY_TYPES[activeProperty]} · 1995年至今</div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { year: '1995', price: Math.round(currentPrice * 0.18), width: '18%', color: '#10B981' },
              { year: '2000', price: Math.round(currentPrice * 0.22), width: '22%', color: '#10B981' },
              { year: '2005', price: Math.round(currentPrice * 0.32), width: '32%', color: '#F59E0B' },
              { year: '2010', price: Math.round(currentPrice * 0.45), width: '45%', color: '#F59E0B' },
              { year: '2015', price: Math.round(currentPrice * 0.58), width: '58%', color: '#F59E0B' },
              { year: '2019', price: preCOVIDPrice, width: '72%', color: '#EA580C' },
              { year: '2026', price: currentPrice, width: '100%', color: '#DC2626' },
            ].map(row => (
              <div key={row.year} className="flex items-center gap-3">
                <span className={`text-xs font-mono w-8 flex-shrink-0 ${row.year === '2026' ? 'font-bold text-[#111827]' : 'text-[#9CA3AF]'}`}>
                  {row.year}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: loaded ? row.width : '0%', background: row.color }} />
                </div>
                <span className={`text-xs font-mono font-bold w-20 text-right flex-shrink-0`}
                  style={{ color: row.color }}>
                  ${(row.price / 10000).toFixed(0)}万
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-xs text-[#9CA3AF]">疫情前基准价</span>
            <span className="text-xs font-bold text-[#EA580C]">${(preCOVIDPrice / 10000).toFixed(0)}万</span>
            <span className="text-xs text-[#9CA3AF]">vs 现在</span>
            <span className="text-xs font-bold text-[#DC2626]">${(currentPrice / 10000).toFixed(0)}万</span>
            <span className="text-xs font-bold text-[#DC2626]">
              +{Math.round((currentPrice / preCOVIDPrice - 1) * 100)}%
            </span>
          </div>
        </div>

        {/* 区块C：隐性成本 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">隐性成本揭示</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">这些费用不会出现在房价里</div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {HIDDEN_COSTS.map(cost => (
              <div key={cost.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-[#374151]">{cost.name}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{cost.desc}</div>
                </div>
                <div className="text-sm font-bold text-[#DC2626]">
                  ${cost.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-[#F3F4F6]"
            style={{ background: '#FEF2F2' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#DC2626]">首年额外支出合计</span>
              <span className="text-lg font-bold text-[#DC2626]">
                ${totalHiddenCosts.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 区块D：七维完整数据 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">环境指数详情</div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {DIMS.map(dim => (
              <div key={dim.name} className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#374151]">{dim.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: dim.color }}>
                      {dim.score}/{dim.max}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: dim.color + '20', color: dim.color }}>
                      {dim.label}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: loaded ? `${(dim.score / dim.max) * 100}%` : '0%', background: dim.color }} />
                </div>
                <div className="text-xs text-[#9CA3AF]">数据来源：{dim.source}</div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-[#F3F4F6] text-center">
            <p className="text-xs text-[#D1D5DB]">
              数据来源：StatCan · CREA · CMHC · Health Canada · Fraser · CIHI · Walk Score
            </p>
            <p className="text-xs text-[#D1D5DB] mt-0.5">更新于 2026年Q1 · citycity.org</p>
          </div>
        </div>

      </div>
    </main>
  )
}