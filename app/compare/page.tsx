'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const CITY_DATA: Record<string, {
  name: string
  province: string
  score: number
  hpi: number
  hpiYears: number
  rpi: number
  cpi: number
  eqi: number
  edi: number
  hci: number
  tci: number
}> = {
  vancouver: {
    name: '温哥华', province: 'BC',
    score: 38, hpi: 6, hpiYears: 10.2, rpi: 43.6, cpi: 7.6,
    eqi: 9, edi: 8, hci: 7, tci: 8
  },
  toronto: {
    name: '多伦多', province: 'ON',
    score: 41, hpi: 6, hpiYears: 9.6, rpi: 41.2, cpi: 7.2,
    eqi: 7, edi: 8, hci: 7, tci: 9
  },
  calgary: {
    name: '卡尔加里', province: 'AB',
    score: 74, hpi: 24, hpiYears: 3.9, rpi: 24.1, cpi: 4.8,
    eqi: 8, edi: 8, hci: 8, tci: 6
  },
  montreal: {
    name: '蒙特利尔', province: 'QC',
    score: 55, hpi: 15, hpiYears: 7.4, rpi: 30.2, cpi: 6.8,
    eqi: 7, edi: 7, hci: 6, tci: 8
  },
  ottawa: {
    name: '渥太华', province: 'ON',
    score: 62, hpi: 18, hpiYears: 6.8, rpi: 28.4, cpi: 6.2,
    eqi: 8, edi: 9, hci: 8, tci: 7
  },
}

const OTHER_CITIES = ['calgary', 'toronto', 'montreal', 'ottawa', 'vancouver']

function CompareContent() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') || 'vancouver'
  const occupation = searchParams.get('occupation') || 'nurse'

  const [compareCity, setCompareCity] = useState('calgary')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 默认对比反差最大的城市
    if (city === 'vancouver' || city === 'toronto') setCompareCity('calgary')
    else setCompareCity('vancouver')
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [city])

  const cityA = CITY_DATA[city] || CITY_DATA.vancouver
  const cityB = CITY_DATA[compareCity] || CITY_DATA.calgary

  const yearsDiff = Math.abs(cityA.hpiYears - cityB.hpiYears).toFixed(1)
  const betterCity = cityA.hpiYears < cityB.hpiYears ? cityA : cityB
  const worsecity = cityA.hpiYears > cityB.hpiYears ? cityA : cityB

  const DIMS = [
    { name: '买房 HPI', valA: cityA.hpi, valB: cityB.hpi, max: 30, unit: '分' },
    { name: '租房 RPI', valA: Math.round(cityA.rpi), valB: Math.round(cityB.rpi), max: 100, unit: '%' },
    { name: '买车 CPI', valA: Math.round(cityA.cpi * 10), valB: Math.round(cityB.cpi * 10), max: 100, unit: '' },
    { name: '环境 EQI', valA: cityA.eqi, valB: cityB.eqi, max: 10, unit: '分' },
    { name: '教育 EDI', valA: cityA.edi, valB: cityB.edi, max: 10, unit: '分' },
    { name: '医疗 HCI', valA: cityA.hci, valB: cityB.hci, max: 10, unit: '分' },
    { name: '交通 TCI', valA: cityA.tci, valB: cityB.tci, max: 10, unit: '分' },
  ]

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="max-w-2xl mx-auto">

          {/* 标题 */}
          <div className="text-center mb-6">
            <div className="text-white/40 text-sm mb-2">同一职业 · 不同城市</div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: '-0.5px' }}>
              城市生活成本对比
            </h1>
          </div>

          {/* 两城对比大数字 */}
          <div className="flex items-center gap-4 mb-6">
            {/* 城市A */}
            <div className={`flex-1 text-center p-4 rounded-2xl border ${cityA.hpiYears > cityB.hpiYears ? 'border-red-500/30' : 'border-green-500/30'}`}
              style={{ background: cityA.hpiYears > cityB.hpiYears ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
              <div className="text-white/60 text-xs mb-2">{cityA.name}, {cityA.province}</div>
              <div className="text-4xl font-bold mb-1"
                style={{ fontFamily: 'monospace', letterSpacing: '-1.5px', color: cityA.hpiYears > cityB.hpiYears ? '#EF4444' : '#10B981' }}>
                {cityA.hpiYears}
                <span className="text-lg text-white/40 ml-1">年</span>
              </div>
              <div className="text-white/40 text-xs">买房所需时间</div>
            </div>

            {/* VS */}
            <div className="text-white/20 font-light text-lg flex-shrink-0">vs</div>

            {/* 城市B */}
            <div className={`flex-1 text-center p-4 rounded-2xl border ${cityB.hpiYears < cityA.hpiYears ? 'border-green-500/30' : 'border-red-500/30'}`}
              style={{ background: cityB.hpiYears < cityA.hpiYears ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
              <div className="text-white/60 text-xs mb-2">{cityB.name}, {cityB.province}</div>
              <div className="text-4xl font-bold mb-1"
                style={{ fontFamily: 'monospace', letterSpacing: '-1.5px', color: cityB.hpiYears < cityA.hpiYears ? '#10B981' : '#EF4444' }}>
                {cityB.hpiYears}
                <span className="text-lg text-white/40 ml-1">年</span>
              </div>
              <div className="text-white/40 text-xs">买房所需时间</div>
            </div>
          </div>

          {/* 核心爆点 */}
          <div className="text-center p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-2xl font-bold text-[#10B981] mb-1">
              少用 {yearsDiff} 年人生
            </div>
            <div className="text-white/40 text-sm">
              在{betterCity.name}买房，比{worsecity.name}少用{yearsDiff}年
            </div>
          </div>

          {/* 切换对比城市 */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white/30 text-xs">对比城市：</span>
            {OTHER_CITIES.filter(c => c !== city).map(c => (
              <button key={c}
                onClick={() => setCompareCity(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  compareCity === c
                    ? 'text-white'
                    : 'text-white/40 border border-white/10 hover:border-white/30'
                }`}
                style={compareCity === c ? { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' } : {}}>
                {CITY_DATA[c].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 七维对比 */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">七维指数对比</div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#4F8EF7]" />
                <span className="text-xs text-[#6B7280]">{cityA.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-xs text-[#6B7280]">{cityB.name}</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {DIMS.map(dim => (
              <div key={dim.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[#374151]">{dim.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#4F8EF7]">
                      {dim.valA}{dim.unit}
                    </span>
                    <span className="text-xs text-[#D1D5DB]">·</span>
                    <span className="text-xs font-mono font-bold text-[#10B981]">
                      {dim.valB}{dim.unit}
                    </span>
                  </div>
                </div>
                {/* 城市A进度条 */}
                <div className="h-1.5 rounded-full mb-1 overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: loaded ? `${(dim.valA / dim.max) * 100}%` : '0%',
                      background: '#4F8EF7'
                    }} />
                </div>
                {/* 城市B进度条 */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: loaded ? `${(dim.valB / dim.max) * 100}%` : '0%',
                      background: '#10B981'
                    }} />
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-[#F3F4F6] text-center">
            <p className="text-xs text-[#D1D5DB]">数据来源：StatCan · CREA · CMHC · 更新于 2026年Q1 · citycity.org</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 mt-4">
          <a href={`/results?city=${city}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            ← 返回结论
          </a>
          <button className="px-4 py-3 rounded-xl text-sm font-medium text-[#374151]"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
            分享 ↗
          </button>
        </div>
      </div>
    </main>
  )
}

export default function Compare() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151827] flex items-center justify-center">
      <div className="text-white/50">加载中...</div>
    </div>}>
      <CompareContent />
    </Suspense>
  )
}