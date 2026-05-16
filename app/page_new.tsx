'use client'
import { useEffect, useState } from 'react'

const CITIES = [
  { id: 'vancouver', name: '温哥华', province: 'British Columbia', provinceShort: 'BC' },
  { id: 'toronto', name: '多伦多', province: 'Ontario', provinceShort: 'ON' },
  { id: 'calgary', name: '卡尔加里', province: 'Alberta', provinceShort: 'AB' },
  { id: 'montreal', name: '蒙特利尔', province: 'Québec', provinceShort: 'QC' },
  { id: 'ottawa', name: '渥太华', province: 'Ontario', provinceShort: 'ON' },
]

const PURPOSES = [
  { id: 'buy', icon: '🏠', name: '买房', desc: '我需要工作多少年才能买得起？' },
  { id: 'rent', icon: '🔑', name: '租房', desc: '我每月多少收入被租金吃掉？' },
  { id: 'car', icon: '🚗', name: '买车', desc: '买一辆车要花我几个月薪水？' },
]

const PROPERTY_TYPES: Record<string, { id: string; name: string; desc?: string }[]> = {
  buy: [
    { id: '1br_condo', name: '1居室公寓' },
    { id: '2br_condo', name: '2居室公寓' },
    { id: '3br_condo', name: '3居室公寓' },
    { id: 'townhouse', name: '城市屋' },
    { id: 'detached', name: '独立屋' },
  ],
  rent: [
    { id: '1br_condo', name: '1居室公寓' },
    { id: '2br_condo', name: '2居室公寓' },
    { id: '3br_condo', name: '3居室公寓' },
    { id: 'townhouse', name: '城市屋' },
  ],
  car: [
    { id: 'economy', name: '经济型', desc: 'Toyota Corolla' },
    { id: 'compact', name: '紧凑型', desc: 'Honda Civic' },
    { id: 'suv', name: '中档SUV', desc: 'Toyota RAV4' },
    { id: 'sedan', name: '中档轿车', desc: 'Honda Accord' },
    { id: 'luxury', name: '豪华型', desc: 'BMW 3 Series' },
  ],
}

const OCCUPATIONS = [
  { id: 'nurse', name: '注册护士', industry: '医疗' },
  { id: 'software_eng', name: '软件工程师', industry: '科技' },
  { id: 'teacher', name: '中学教师', industry: '教育' },
  { id: 'electrician', name: '电工', industry: '建筑' },
  { id: 'truck_driver', name: '卡车司机', industry: '运输' },
  { id: 'accountant', name: '会计师', industry: '金融' },
  { id: 'police', name: '警察', industry: '公共服务' },
  { id: 'chef', name: '厨师', industry: '餐饮' },
  { id: 'retail', name: '零售店员', industry: '零售' },
  { id: 'engineer', name: '土木工程师', industry: '建筑' },
  { id: 'doctor', name: '家庭医生', industry: '医疗' },
  { id: 'pharmacist', name: '药剂师', industry: '医疗' },
  { id: 'dentist', name: '牙医', industry: '医疗' },
  { id: 'lawyer', name: '律师', industry: '法律' },
  { id: 'financial_advisor', name: '财务顾问', industry: '金融' },
  { id: 'real_estate', name: '房产经纪', industry: '房产' },
  { id: 'mechanic', name: '汽车技师', industry: '汽车' },
  { id: 'carpenter', name: '木工', industry: '建筑' },
  { id: 'plumber', name: '水管工', industry: '建筑' },
  { id: 'welder', name: '焊工', industry: '制造' },
  { id: 'it_support', name: 'IT技术支持', industry: '科技' },
  { id: 'data_analyst', name: '数据分析师', industry: '科技' },
  { id: 'marketing', name: '市场营销专员', industry: '商业' },
  { id: 'hr', name: '人力资源专员', industry: '商业' },
  { id: 'social_worker', name: '社会工作者', industry: '社会服务' },
  { id: 'firefighter', name: '消防员', industry: '公共服务' },
  { id: 'pilot', name: '商业飞行员', industry: '航空' },
  { id: 'chef_executive', name: '行政总厨', industry: '餐饮' },
  { id: 'security', name: '保安', industry: '保安' },
  { id: 'cleaner', name: '清洁工', industry: '服务' },
]

export default function Home() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const propertyOptions = selectedPurpose ? PROPERTY_TYPES[selectedPurpose] || [] : []

  return (
    <main className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-pulse"
          style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', top: '-200px', right: '-100px', animationDuration: '4s' }} />
        <div className="absolute rounded-full opacity-10 animate-pulse"
          style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, #5B5CF0 0%, transparent 70%)', bottom: '-150px', left: '-100px', animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

        <div className={`text-center mb-8 transition-all duration-700 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3" style={{ letterSpacing: '-1px' }}>
            在{selectedCity.name}，<br />
            这些事要花你多少<span style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>人生</span>？
          </h1>
          <p className="text-white/40 text-sm">In {selectedCity.name}, what's really costing you your life?</p>
        </div>

        <div className={`flex items-center gap-1 mb-8 transition-all duration-700 ${started ? 'opacity-100' : 'opacity-0'}`}>
          {['选城市', '选目的', '选房型', '选职业'].map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i + 1 ? 'bg-[#059669] text-white' :
                  step === i + 1 ? 'text-white' : 'bg-white/10 text-white/30'
                }`} style={step === i + 1 ? { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' } : {}}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${step === i + 1 ? 'text-white/80' : step > i + 1 ? 'text-[#059669]' : 'text-white/25'}`}>
                  {label}
                </span>
              </div>
              {i < 3 && <div className="flex-1 h-px mx-1" style={{ background: step > i + 1 ? '#059669' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className={`transition-all duration-500 ${started ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">第一步 · 选择你的城市</div>
            <div className="flex flex-col gap-3 mb-6">
              {CITIES.map(city => (
                <button key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${
                    selectedCity.id === city.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <div>
                    <div className="text-white font-semibold">{city.name}</div>
                    <div className="text-white/40 text-sm">{city.province}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 font-mono">{city.provinceShort}</span>
                    {selectedCity.id === city.id && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
              下一步：选择目的 →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">第二步 · 选择你关心的</div>
            <div className="flex flex-col gap-3 mb-6">
              {PURPOSES.map(purpose => (
                <button key={purpose.id}
                  onClick={() => { setSelectedPurpose(purpose.id); setSelectedProperty(null) }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                    selectedPurpose === purpose.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <div className="text-3xl">{purpose.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{purpose.name}</div>
                    <div className="text-white/50 text-sm">{purpose.desc}</div>
                  </div>
                  {selectedPurpose === purpose.id && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← 返回</button>
              <button onClick={() => { if (selectedPurpose) setStep(3) }}
                disabled={!selectedPurpose}
                className="flex-1 py-4 rounded-2xl text-white font-semibold text-base transition-all"
                style={{ background: selectedPurpose ? 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' : 'rgba(255,255,255,0.1)' }}>
                下一步：选择{selectedPurpose === 'car' ? '车型' : '房型'} →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">
              第三步 · 选择{selectedPurpose === 'car' ? '车型' : '房型'}
            </div>
            <div className="flex flex-col gap-3 mb-6">
              {propertyOptions.map(option => (
                <button key={option.id}
                  onClick={() => setSelectedProperty(option.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${
                    selectedProperty === option.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <div>
                    <div className="text-white font-semibold">{option.name}</div>
                    {option.desc && <div className="text-white/40 text-sm">{option.desc}</div>}
                  </div>
                  {selectedProperty === option.id && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← 返回</button>
              <button onClick={() => { if (selectedProperty) setStep(4) }}
                disabled={!selectedProperty}
                className="flex-1 py-4 rounded-2xl text-white font-semibold text-base transition-all"
                style={{ background: selectedProperty ? 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' : 'rgba(255,255,255,0.1)' }}>
                下一步：选择职业 →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">第四步 · 选择你的职业</div>
            <div className="flex flex-col gap-2 mb-4 overflow-y-auto"
              style={{ maxHeight: '320px', scrollbarColor: 'rgba(91,92,240,0.6) rgba(255,255,255,0.05)', scrollbarWidth: 'thin' }}>
              {OCCUPATIONS.map(occ => (
                <button key={occ.id}
                  onClick={() => setSelectedOccupation(occ.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                    selectedOccupation === occ.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <div>
                    <div className="text-white text-sm font-medium">{occ.name}</div>
                    <div className="text-white/40 text-xs">{occ.industry}</div>
                  </div>
                  {selectedOccupation === occ.id && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← 返回</button>
              <a href={selectedOccupation ? `/results?city=${selectedCity.id}&purpose=${selectedPurpose}&property=${selectedProperty}&occupation=${selectedOccupation}` : '#'}
                className={`flex-1 py-4 rounded-2xl text-white font-semibold text-base text-center ${!selectedOccupation ? 'pointer-events-none opacity-40' : ''}`}
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                查看结论 →
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
