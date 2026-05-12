'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const CITIES = [
  { id: 'vancouver', name: '温哥华', nameEn: 'Vancouver', province: 'British Columbia' },
  { id: 'toronto', name: '多伦多', nameEn: 'Toronto', province: 'Ontario' },
  { id: 'calgary', name: '卡尔加里', nameEn: 'Calgary', province: 'Alberta' },
  { id: 'montreal', name: '蒙特利尔', nameEn: 'Montréal', province: 'Québec' },
  { id: 'ottawa', name: '渥太华', nameEn: 'Ottawa', province: 'Ontario' },
]

const PURPOSES = [
  {
    id: 'buy',
    icon: '🏠',
    name: '买房',
    nameEn: 'Buying',
    desc: '我需要工作多少年才能买得起？',
    descEn: 'How many years of work does it actually take?',
  },
  {
    id: 'rent',
    icon: '🔑',
    name: '租房',
    nameEn: 'Renting',
    desc: '我每月多少收入被租金吃掉？',
    descEn: 'What share of my income goes to rent every month?',
  },
  {
    id: 'car',
    icon: '🚗',
    name: '买车',
    nameEn: 'Car',
    desc: '买一辆车要花我几个月薪水？',
    descEn: 'How many months of salary does a car cost here?',
  },
]

const OCCUPATIONS = [
  { id: 'nurse', name: '注册护士', nameEn: 'Registered Nurse', industry: '医疗' },
  { id: 'software_eng', name: '软件工程师', nameEn: 'Software Engineer', industry: '科技' },
  { id: 'teacher', name: '中学教师', nameEn: 'High School Teacher', industry: '教育' },
  { id: 'electrician', name: '电工', nameEn: 'Electrician', industry: '建筑' },
  { id: 'truck_driver', name: '卡车司机', nameEn: 'Truck Driver', industry: '运输' },
  { id: 'accountant', name: '会计师', nameEn: 'Accountant', industry: '金融' },
  { id: 'police', name: '警察', nameEn: 'Police Officer', industry: '公共服务' },
  { id: 'chef', name: '厨师', nameEn: 'Chef', industry: '餐饮' },
  { id: 'retail', name: '零售店员', nameEn: 'Retail Worker', industry: '零售' },
  { id: 'engineer', name: '土木工程师', nameEn: 'Civil Engineer', industry: '建筑' },
]

function AnimatedNumber({ target, duration = 3000 }: { target: number, duration?: number }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) { setCurrent(target); clearInterval(timer) }
      else setCurrent(Math.floor(increment * step * 10) / 10)
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return <span>{current.toFixed(1)}</span>
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null)
  const [showOccupations, setShowOccupations] = useState(false)
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const handlePurposeSelect = (id: string) => {
    setSelectedPurpose(id)
    setShowOccupations(true)
  }

  return (
    <main className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

      {/* 光晕背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-pulse"
          style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', top: '-200px', right: '-100px', animationDuration: '4s' }} />
        <div className="absolute rounded-full opacity-10 animate-pulse"
          style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, #5B5CF0 0%, transparent 70%)', bottom: '-150px', left: '-100px', animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">

        {/* 城市选择器 */}
        <div className={`flex items-center justify-center gap-2 mb-10 transition-all duration-700 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white/80 text-sm font-medium hover:bg-white/15 transition-all">
              📍 {selectedCity.name}, {selectedCity.province.split(' ')[0]}
              <span className={`transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {/* 下拉菜单 */}
            {showCityDropdown && (
              <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">选择城市</div>
                </div>
                {CITIES.map(city => (
                  <button key={city.id}
                    onClick={() => { setSelectedCity(city); setShowCityDropdown(false) }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCity.id === city.id ? 'bg-blue-50' : ''}`}>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${selectedCity.id === city.id ? 'text-blue-600' : 'text-gray-800'}`}>{city.name}</div>
                      <div className="text-xs text-gray-400">{city.province}</div>
                    </div>
                    {selectedCity.id === city.id && <span className="text-blue-600 text-sm">✓</span>}
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100 text-center text-xs text-gray-400">
                  共5个城市 · 持续扩展中
                </div>
              </div>
            )}
          </div>
          <span className="text-white/30 text-sm">· IP已识别</span>
        </div>

        {/* 主标题 */}
        <div className={`text-center mb-10 transition-all duration-700 delay-200 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3" style={{ letterSpacing: '-1px' }}>
            在{selectedCity.name}，<br />
            这些事要花你多少<span style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>人生</span>？
          </h1>
          <p className="text-white/40 text-base">In {selectedCity.nameEn}, what's really costing you your life?</p>
        </div>

        {/* 第一步：选择目的 */}
        <div className={`mb-8 transition-all duration-700 delay-300 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">
            第一步 · 选择你关心的
          </div>
          <div className="flex flex-col gap-3">
            {PURPOSES.map(purpose => (
              <button key={purpose.id}
                onClick={() => handlePurposeSelect(purpose.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                  selectedPurpose === purpose.id
                    ? 'border-[#5B5CF0] bg-[#5B5CF0]/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}>
                <div className="text-3xl">{purpose.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-base">{purpose.name}</div>
                  <div className="text-white/50 text-sm mt-0.5">{purpose.desc}</div>
                </div>
                {selectedPurpose === purpose.id && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 第二步：选择职业 */}
        {showOccupations && (
          <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">
              第二步 · 选择你的职业
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {OCCUPATIONS.map(occ => (
                <button key={occ.id}
                  onClick={() => setSelectedOccupation(occ.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                    selectedOccupation === occ.id
                      ? 'border-[#5B5CF0] bg-[#5B5CF0]/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <div>
                    <div className="text-white text-sm font-medium">{occ.name}</div>
                    <div className="text-white/40 text-xs">{occ.industry}</div>
                  </div>
                  {selectedOccupation === occ.id && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* 查询按钮 */}
            {selectedOccupation && (
              <a href={`/results?city=${selectedCity.id}&purpose=${selectedPurpose}&occupation=${selectedOccupation}`}
  className="block w-full py-4 rounded-2xl text-white font-semibold text-base text-center transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
  style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
  查看结论 →
</a>
            )}
          </div>
        )}

      </div>

      {/* 点击外部关闭下拉 */}
      {showCityDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCityDropdown(false)} />
      )}
    </main>
  )
}