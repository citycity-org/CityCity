'use client'
import { useState, useEffect } from 'react'

const CITY_DATA: Record<string, {
  name: string
  province: string
  score: number
  hpiYears: number
  rpi: number
  cpi: number
  eqi: number
  edi: number
  hci: number
  tci: number
}> = {
  vancouver: { name: '温哥华', province: 'BC', score: 38, hpiYears: 10.2, rpi: 43.6, cpi: 7.6, eqi: 9, edi: 8, hci: 7, tci: 8 },
  toronto: { name: '多伦多', province: 'ON', score: 41, hpiYears: 9.6, rpi: 41.2, cpi: 7.2, eqi: 7, edi: 8, hci: 7, tci: 9 },
  calgary: { name: '卡尔加里', province: 'AB', score: 74, hpiYears: 3.9, rpi: 24.1, cpi: 4.8, eqi: 8, edi: 8, hci: 8, tci: 6 },
  montreal: { name: '蒙特利尔', province: 'QC', score: 55, hpiYears: 7.4, rpi: 30.2, cpi: 6.8, eqi: 7, edi: 7, hci: 6, tci: 8 },
  ottawa: { name: '渥太华', province: 'ON', score: 62, hpiYears: 6.8, rpi: 28.4, cpi: 6.2, eqi: 8, edi: 9, hci: 8, tci: 7 },
}

const ALL_CITIES = Object.keys(CITY_DATA)

const DIMS = [
  { key: 'hpiYears', name: '买房指数', unit: '年', lowerBetter: true },
  { key: 'rpi', name: '租房指数', unit: '%', lowerBetter: true },
  { key: 'cpi', name: '买车指数', unit: '月薪', lowerBetter: true },
  { key: 'eqi', name: '环境质量', unit: '/10', lowerBetter: false },
  { key: 'edi', name: '教育指数', unit: '/10', lowerBetter: false },
  { key: 'hci', name: '医疗指数', unit: '/10', lowerBetter: false },
  { key: 'tci', name: '交通指数', unit: '/10', lowerBetter: false },
]

function CitySelector({
  selectedCity,
  otherCity,
  onSelect,
}: {
  selectedCity: string
  otherCity: string
  onSelect: (city: string) => void
}) {
  const [open, setOpen] = useState(false)
  const city = CITY_DATA[selectedCity]

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-center p-4 rounded-2xl border-2 transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
        <div className="text-white/50 text-xs mb-1">{city.province}</div>
        <div className="text-2xl font-bold text-white mb-0.5">{city.name}</div>
        <div className="text-white/40 text-xs">点击切换 ▾</div>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl z-50 border border-[#E5E7EB] overflow-y-auto" style={{ maxHeight: '220px' }}>
          {ALL_CITIES.filter(c => c !== otherCity).map(c => (
            <button key={c}
              onClick={() => { onSelect(c); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors text-left ${
                c === selectedCity ? 'bg-[#EEF4FF]' : ''
              }`}>
              <div>
                <div className={`text-sm font-medium ${c === selectedCity ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}>
                  {CITY_DATA[c].name}
                </div>
                <div className="text-xs text-[#9CA3AF]">{CITY_DATA[c].province}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold" style={{
                  color: CITY_DATA[c].score >= 60 ? '#059669' : CITY_DATA[c].score >= 45 ? '#D97706' : '#DC2626'
                }}>{CITY_DATA[c].score}分</span>
                {c === selectedCity && <span className="text-[#1D4ED8]">✓</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}

function CompareContent() {
  const [cityA, setCityA] = useState('vancouver')
  const [cityB, setCityB] = useState('calgary')
  const [occupation, setOccupation] = useState('nurse')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const city = params.get('city') || 'vancouver'
    const occ = params.get('occupation') || 'nurse'
    setCityA(city)
    setCityB(city === 'vancouver' ? 'calgary' : 'vancouver')
    setOccupation(occ)
    const t = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  const dataA = CITY_DATA[cityA]
  const dataB = CITY_DATA[cityB]
  const yearsDiff = Math.abs(dataA.hpiYears - dataB.hpiYears).toFixed(1)
  const betterCity = dataA.hpiYears < dataB.hpiYears ? dataA : dataB
  const worseCity = dataA.hpiYears > dataB.hpiYears ? dataA : dataB

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-8"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <div className="text-white/40 text-sm mb-1">同一职业 · 不同城市</div>
            <h1 className="text-2xl font-bold text-white">城市生活指数对比</h1>
          </div>

          {/* 两城选择器 */}
          <div className="flex items-center gap-3 mb-5">
            <CitySelector selectedCity={cityA} otherCity={cityB} onSelect={setCityA} />
            <div className="text-white/20 font-light text-lg flex-shrink-0">vs</div>
            <CitySelector selectedCity={cityB} otherCity={cityA} onSelect={setCityB} />
          </div>

          {/* 买房年数对比 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 text-center p-3 rounded-2xl"
              style={{
                background: dataA.hpiYears > dataB.hpiYears ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${dataA.hpiYears > dataB.hpiYears ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`
              }}>
              <div className="text-3xl font-bold font-mono"
                style={{ color: dataA.hpiYears > dataB.hpiYears ? '#EF4444' : '#10B981', letterSpacing: '-1px' }}>
                {dataA.hpiYears}<span className="text-base text-white/40 ml-1">年</span>
              </div>
              <div className="text-white/40 text-xs mt-1">买房所需时间</div>
            </div>
            <div className="text-white/20 flex-shrink-0">vs</div>
            <div className="flex-1 text-center p-3 rounded-2xl"
              style={{
                background: dataB.hpiYears < dataA.hpiYears ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${dataB.hpiYears < dataA.hpiYears ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
              }}>
              <div className="text-3xl font-bold font-mono"
                style={{ color: dataB.hpiYears < dataA.hpiYears ? '#10B981' : '#EF4444', letterSpacing: '-1px' }}>
                {dataB.hpiYears}<span className="text-base text-white/40 ml-1">年</span>
              </div>
              <div className="text-white/40 text-xs mt-1">买房所需时间</div>
            </div>
          </div>

          {/* 核心爆点 */}
          <div className="text-center p-3 rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-xl font-bold text-[#10B981]">少用 {yearsDiff} 年人生</div>
            <div className="text-white/40 text-xs mt-1">
              在{betterCity.name}买房，比{worseCity.name}少用{yearsDiff}年
            </div>
          </div>
        </div>
      </div>

      {/* 七维对比 */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">七维指数对比</div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#4F8EF7]" />
                <span className="text-xs text-[#6B7280]">{dataA.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-xs text-[#6B7280]">{dataB.name}</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {DIMS.map(dim => {
              const valA = dataA[dim.key as keyof typeof dataA] as number
              const valB = dataB[dim.key as keyof typeof dataB] as number
              const maxVal = Math.max(valA, valB, 1)
              const aWins = dim.lowerBetter ? valA < valB : valA > valB
              const bWins = dim.lowerBetter ? valB < valA : valB > valA

              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#374151]">{dim.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold ${aWins ? 'text-[#4F8EF7]' : 'text-[#9CA3AF]'}`}>
                        {valA}{dim.unit}
                      </span>
                      <span className="text-xs text-[#D1D5DB]">·</span>
                      <span className={`text-xs font-mono font-bold ${bWins ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`}>
                        {valB}{dim.unit}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full mb-1 overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: loaded ? `${(valA / maxVal) * 100}%` : '0%',
                        background: '#4F8EF7'
                      }} />
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: loaded ? `${(valB / maxVal) * 100}%` : '0%',
                        background: '#10B981'
                      }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="px-5 py-3 border-t border-[#F3F4F6] text-center">
            <p className="text-xs text-[#D1D5DB]">数据来源：StatCan · CREA · CMHC · 更新于 2026年Q1 · citycity.org</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 mt-4">
          <a href={`/results?city=${cityA}&occupation=${occupation}`}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            ← 返回结论
          </a>
          <a href={`/share?city=${cityA}&occupation=${occupation}`}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-center text-white"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            分享 ↗
          </a>
        </div>
      </div>
    </main>
  )
}

export default function Compare() {
  return <CompareContent />
}