'use client'
import { useEffect, useState } from 'react'

const CITIES = [
  { id: 'vancouver', name: '温哥华', nameEn: 'Vancouver',  provinceShort: 'BC', province: '不列颠哥伦比亚省', region: 'canada' },
  { id: 'toronto',   name: '多伦多', nameEn: 'Toronto',    provinceShort: 'ON', province: '安大略省',          region: 'canada' },
  { id: 'calgary',   name: '卡尔加里', nameEn: 'Calgary',  provinceShort: 'AB', province: '艾伯塔省',          region: 'canada' },
  { id: 'montreal',  name: '蒙特利尔', nameEn: 'Montréal', provinceShort: 'QC', province: '魁北克省',          region: 'canada' },
  { id: 'ottawa',    name: '渥太华', nameEn: 'Ottawa',     provinceShort: 'ON', province: '安大略省',          region: 'canada' },
]

const PROVINCE_GROUPS = [
  { short: 'BC', name: '不列颠哥伦比亚省', cityIds: ['vancouver'] },
  { short: 'ON', name: '安大略省',          cityIds: ['toronto', 'ottawa'] },
  { short: 'AB', name: '艾伯塔省',          cityIds: ['calgary'] },
  { short: 'QC', name: '魁北克省',          cityIds: ['montreal'] },
]

const PURPOSES = [
  { id: 'buy',  icon: '🏠', name: '买房', desc: '工作几年才买得起？' },
  { id: 'rent', icon: '🔑', name: '租房', desc: '月薪多少被租金吃掉？' },
  { id: 'car',  icon: '🚗', name: '买车', desc: '要花几个月薪水？' },
]

const HOUSE_TYPES = [
  { id: '1br_condo', name: '1居室公寓', desc: 'Condo' },
  { id: '2br_condo', name: '2居室公寓', desc: 'Condo' },
  { id: '3br_condo', name: '3居室公寓', desc: 'Condo' },
  { id: 'townhouse',  name: '联排别墅',  desc: 'Townhouse' },
  { id: 'house',      name: '独立屋',    desc: 'Detached House' },
]

const VEHICLE_BRANDS = [
  { brand: 'Honda',     models: [
    { id: 'honda_civic',  model: 'Civic',  price: 28690 },
    { id: 'honda_crv',    model: 'CR-V',   price: 37890 },
    { id: 'honda_accord', model: 'Accord', price: 32595 },
  ]},
  { brand: 'Toyota',    models: [
    { id: 'toyota_corolla', model: 'Corolla', price: 25025 },
    { id: 'toyota_rav4',    model: 'RAV4',    price: 38025 },
    { id: 'toyota_camry',   model: 'Camry',   price: 32025 },
  ]},
  { brand: 'Ford',      models: [
    { id: 'ford_f150',    model: 'F-150',   price: 49995 },
    { id: 'ford_escape',  model: 'Escape',  price: 35995 },
    { id: 'ford_mustang', model: 'Mustang', price: 38995 },
  ]},
  { brand: 'Chevrolet', models: [
    { id: 'chevrolet_silverado', model: 'Silverado 1500', price: 46498 },
    { id: 'chevrolet_equinox',   model: 'Equinox',        price: 37498 },
  ]},
  { brand: 'Tesla',     models: [
    { id: 'tesla_model3', model: 'Model 3', price: 53990 },
    { id: 'tesla_modely', model: 'Model Y', price: 59990 },
  ]},
  { brand: 'BMW',       models: [
    { id: 'bmw_3series', model: '3 Series', price: 49900 },
    { id: 'bmw_x3',      model: 'X3',       price: 57900 },
  ]},
  { brand: 'Hyundai',   models: [
    { id: 'hyundai_elantra', model: 'Elantra', price: 23599 },
    { id: 'hyundai_tucson',  model: 'Tucson',  price: 35349 },
  ]},
]

const OCCUPATION_GROUPS = [
  { industry: '医疗',       occupations: [
    { id: 'nurse',      name: '注册护士' }, { id: 'doctor',     name: '家庭医生' },
    { id: 'pharmacist', name: '药剂师' },   { id: 'dentist',    name: '牙医' },
  ]},
  { industry: '科技',       occupations: [
    { id: 'software_eng', name: '软件工程师' }, { id: 'data_analyst', name: '数据分析师' },
    { id: 'it_support',   name: 'IT技术支持' },
  ]},
  { industry: '教育',       occupations: [
    { id: 'teacher', name: '中学教师' },
  ]},
  { industry: '工程与建筑', occupations: [
    { id: 'engineer',    name: '土木工程师' }, { id: 'electrician', name: '电工' },
    { id: 'carpenter',   name: '木工' },       { id: 'plumber',     name: '水管工' },
    { id: 'welder',      name: '焊工' },
  ]},
  { industry: '法律与金融', occupations: [
    { id: 'lawyer',            name: '律师' },   { id: 'accountant',       name: '会计师' },
    { id: 'financial_advisor', name: '财务顾问' },
  ]},
  { industry: '商业',       occupations: [
    { id: 'real_estate', name: '房产经纪' }, { id: 'marketing', name: '市场营销专员' },
    { id: 'hr',          name: '人力资源专员' },
  ]},
  { industry: '公共服务',   occupations: [
    { id: 'police',       name: '警察' },       { id: 'firefighter',   name: '消防员' },
    { id: 'social_worker',name: '社会工作者' },
  ]},
  { industry: '餐饮',       occupations: [
    { id: 'chef', name: '厨师' }, { id: 'chef_executive', name: '行政总厨' },
  ]},
  { industry: '其他',       occupations: [
    { id: 'retail',       name: '零售店员' }, { id: 'truck_driver', name: '卡车司机' },
    { id: 'mechanic',     name: '汽车技师' }, { id: 'pilot',        name: '商业飞行员' },
    { id: 'security',     name: '保安' },     { id: 'cleaner',      name: '清洁工' },
  ]},
]

type City = typeof CITIES[0]

const BG_GRAD: React.CSSProperties = { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }
const SEL_CARD = 'border-[#5B5CF0] bg-[#5B5CF0]/20'
const DEF_CARD = 'border-white/10 bg-white/5 hover:bg-white/10'

export default function Calculate() {
  const [started, setStarted]                   = useState(false)
  const [step, setStep]                         = useState<1 | 2 | 3>(1)
  const [selectedCity, setSelectedCity]         = useState<City>(CITIES[0])
  const [selectedPurpose, setSelectedPurpose]   = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null)

  useEffect(() => {
    // Pre-select city from URL param (e.g. /calculate?city=toronto)
    const p = new URLSearchParams(window.location.search)
    const cityId = p.get('city')
    if (cityId) {
      const found = CITIES.find(c => c.id === cityId)
      if (found) setSelectedCity(found)
    }
    const t = setTimeout(() => setStarted(true), 400)
    return () => clearTimeout(t)
  }, [])

  const selectPurpose = (id: string) => {
    setSelectedPurpose(id)
    setSelectedProperty(null)
  }

  const goStep = (n: 1 | 2 | 3) => {
    if (n === 2) { setSelectedPurpose(null); setSelectedProperty(null) }
    setStep(n)
  }

  const canGoStep3 = selectedPurpose !== null && selectedProperty !== null
  const resultsUrl = selectedOccupation
    ? `/results?city=${selectedCity.id}&purpose=${selectedPurpose}&property=${selectedProperty}&occupation=${selectedOccupation}`
    : '#'

  return (
    <main className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-pulse"
          style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', top: '-200px', right: '-100px', animationDuration: '4s' }} />
        <div className="absolute rounded-full opacity-10 animate-pulse"
          style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, #5B5CF0 0%, transparent 70%)', bottom: '-150px', left: '-100px', animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Title */}
        <div className={`text-center mb-7 transition-all duration-700 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-white leading-tight mb-2" style={{ letterSpacing: '-1px' }}>
            在{selectedCity.name}，<br />
            这些事要花你多少
            <span style={{ ...BG_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>人生</span>？
          </h1>
          <p className="text-white/30 text-sm">In {selectedCity.nameEn}, what's really costing you your life?</p>
        </div>

        {/* Step indicator */}
        <div className={`flex items-center justify-center gap-3 mb-8 transition-all duration-700 ${started ? 'opacity-100' : 'opacity-0'}`}>
          {['选城市', '选目标', '选职业'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i + 1 ? 'bg-[#059669] text-white' : step === i + 1 ? 'text-white' : 'bg-white/10 text-white/30'
                }`} style={step === i + 1 ? BG_GRAD : {}}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  step === i + 1 ? 'text-white/80' : step > i + 1 ? 'text-[#059669]' : 'text-white/25'
                }`}>{label}</span>
              </div>
              {i < 2 && (
                <div className="w-10 h-px mx-2"
                  style={{ background: step > i + 1 ? '#059669' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: 选城市 ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className={`transition-all duration-500 ${started ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">第一步 · 选择你的城市</p>

            <div className="space-y-4 mb-6">
              {PROVINCE_GROUPS.map(group => {
                const cities = group.cityIds.map(id => CITIES.find(c => c.id === id)!)
                return (
                  <div key={group.short}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white/60"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>{group.short}</span>
                      <span className="text-xs text-white/30">{group.name}</span>
                    </div>
                    <div className={`grid gap-2 ${cities.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {cities.map(city => {
                        const sel = selectedCity.id === city.id
                        return (
                          <button key={city.id} onClick={() => setSelectedCity(city)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${sel ? SEL_CARD : DEF_CARD}`}>
                            <div>
                              <div className="text-white font-semibold">{city.name}</div>
                              <div className="text-white/40 text-xs">{city.nameEn}</div>
                            </div>
                            {sel && <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={BG_GRAD}>✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <p className="text-center text-xs text-white/20">更多城市陆续开放</p>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base" style={BG_GRAD}>
              下一步：选择目标 →
            </button>
          </div>
        )}

        {/* ── Step 2: 选目标 ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="transition-all duration-500">
            <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">第二步 · 选择目标类型</p>

            <div className="flex flex-col gap-3 mb-4">
              {PURPOSES.map(p => (
                <button key={p.id} onClick={() => selectPurpose(p.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${selectedPurpose === p.id ? SEL_CARD : DEF_CARD}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{p.name}</div>
                    <div className="text-white/50 text-sm">{p.desc}</div>
                  </div>
                  {selectedPurpose === p.id && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={BG_GRAD}>✓</span>
                  )}
                </button>
              ))}
            </div>

            {(selectedPurpose === 'buy' || selectedPurpose === 'rent') && (
              <div className="mb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">选择房型</p>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSE_TYPES.map(item => (
                    <button key={item.id} onClick={() => setSelectedProperty(item.id)}
                      className={`p-3 rounded-xl border transition-all duration-200 text-left ${selectedProperty === item.id ? SEL_CARD : DEF_CARD}`}>
                      <div className="text-white text-sm font-semibold">{item.name}</div>
                      <div className="text-white/40 text-xs">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPurpose === 'car' && (
              <div className="mb-4">
                <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">选择车型</p>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,92,240,0.5) transparent' }}>
                  {VEHICLE_BRANDS.map(brand => (
                    <div key={brand.brand}>
                      <p className="text-xs font-bold text-white/45 mb-2 uppercase tracking-wide">{brand.brand}</p>
                      <div className="flex flex-wrap gap-2">
                        {brand.models.map(v => (
                          <button key={v.id} onClick={() => setSelectedProperty(v.id)}
                            className={`flex flex-col items-start px-3 py-2 rounded-xl border transition-all duration-200 ${selectedProperty === v.id ? SEL_CARD : DEF_CARD}`}>
                            <span className="text-white text-sm font-semibold">{v.model}</span>
                            <span className="text-white/40 text-xs">${v.price.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => goStep(1)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← 返回</button>
              {canGoStep3 && (
                <button onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-2xl text-white font-semibold text-base" style={BG_GRAD}>
                  下一步：选择职业 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: 选职业 ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="transition-all duration-500">
            <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">第三步 · 选择你的职业</p>

            <div className="space-y-4 mb-4 overflow-y-auto"
              style={{ maxHeight: '360px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,92,240,0.5) transparent' }}>
              {OCCUPATION_GROUPS.map(group => (
                <div key={group.industry}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{group.industry}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  </div>
                  <div className={`grid gap-1.5 ${group.occupations.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {group.occupations.map(occ => {
                      const sel = selectedOccupation === occ.id
                      return (
                        <button key={occ.id} onClick={() => setSelectedOccupation(occ.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 text-left ${sel ? SEL_CARD : DEF_CARD}`}>
                          <span className="text-white text-sm">{occ.name}</span>
                          {sel && (
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ml-1" style={BG_GRAD}>✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => goStep(2)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← 返回</button>
              {selectedOccupation && (
                <a href={resultsUrl}
                  className="flex-1 py-4 rounded-2xl text-white font-semibold text-base text-center" style={BG_GRAD}>
                  查看结论 →
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
