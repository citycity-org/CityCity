'use client'
import { useEffect, useState } from 'react'

// region field reserved for expansion: canada | usa | europe | asia
const CITIES = [
  { id: 'vancouver', name: 'Vancouver', nameZh: '温哥华', province: 'British Columbia', provinceShort: 'BC', region: 'canada' },
  { id: 'toronto',   name: 'Toronto',   nameZh: '多伦多', province: 'Ontario',          provinceShort: 'ON', region: 'canada' },
  { id: 'calgary',   name: 'Calgary',   nameZh: '卡尔加里', province: 'Alberta',        provinceShort: 'AB', region: 'canada' },
  { id: 'montreal',  name: 'Montréal',  nameZh: '蒙特利尔', province: 'Québec',         provinceShort: 'QC', region: 'canada' },
  { id: 'ottawa',    name: 'Ottawa',    nameZh: '渥太华', province: 'Ontario',          provinceShort: 'ON', region: 'canada' },
]

const PROVINCE_GROUPS = [
  { short: 'BC', name: 'British Columbia', cityIds: ['vancouver'] },
  { short: 'ON', name: 'Ontario',          cityIds: ['toronto', 'ottawa'] },
  { short: 'AB', name: 'Alberta',          cityIds: ['calgary'] },
  { short: 'QC', name: 'Québec',           cityIds: ['montreal'] },
]

const PURPOSES = [
  { id: 'buy',  icon: '🏠', name: 'Buying a Home', desc: 'How many years of work does it take?' },
  { id: 'rent', icon: '🔑', name: 'Renting',       desc: 'What share of my income goes to rent?' },
  { id: 'car',  icon: '🚗', name: 'Buying a Car',  desc: 'How many months of salary does it cost?' },
]

const HOUSE_TYPES = [
  { id: '1br_condo', name: '1-Bedroom Condo',  desc: 'Condo' },
  { id: '2br_condo', name: '2-Bedroom Condo',  desc: 'Condo' },
  { id: '3br_condo', name: '3-Bedroom Condo',  desc: 'Condo' },
  { id: 'townhouse',  name: 'Townhouse',         desc: 'Townhouse' },
  { id: 'house',      name: 'Detached House',    desc: 'Detached' },
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
  { industry: 'Healthcare', occupations: [
    { id: 'nurse',      name: 'Registered Nurse' },
    { id: 'doctor',     name: 'Family Physician' },
    { id: 'pharmacist', name: 'Pharmacist' },
    { id: 'dentist',    name: 'Dentist' },
  ]},
  { industry: 'Technology', occupations: [
    { id: 'software_eng', name: 'Software Engineer' },
    { id: 'data_analyst', name: 'Data Analyst' },
    { id: 'it_support',   name: 'IT Support' },
  ]},
  { industry: 'Education', occupations: [
    { id: 'teacher', name: 'High School Teacher' },
  ]},
  { industry: 'Engineering & Trades', occupations: [
    { id: 'engineer',    name: 'Civil Engineer' },
    { id: 'electrician', name: 'Electrician' },
    { id: 'carpenter',   name: 'Carpenter' },
    { id: 'plumber',     name: 'Plumber' },
    { id: 'welder',      name: 'Welder' },
  ]},
  { industry: 'Finance & Law', occupations: [
    { id: 'lawyer',            name: 'Lawyer' },
    { id: 'accountant',        name: 'Accountant' },
    { id: 'financial_advisor', name: 'Financial Advisor' },
  ]},
  { industry: 'Business', occupations: [
    { id: 'real_estate', name: 'Real Estate Agent' },
    { id: 'marketing',   name: 'Marketing Specialist' },
    { id: 'hr',          name: 'HR Specialist' },
  ]},
  { industry: 'Public Service', occupations: [
    { id: 'police',        name: 'Police Officer' },
    { id: 'firefighter',   name: 'Firefighter' },
    { id: 'social_worker', name: 'Social Worker' },
  ]},
  { industry: 'Food & Hospitality', occupations: [
    { id: 'chef',           name: 'Chef' },
    { id: 'chef_executive', name: 'Executive Chef' },
  ]},
  { industry: 'Other Services', occupations: [
    { id: 'retail',       name: 'Retail Worker' },
    { id: 'truck_driver', name: 'Truck Driver' },
    { id: 'mechanic',     name: 'Auto Mechanic' },
    { id: 'pilot',        name: 'Commercial Pilot' },
    { id: 'security',     name: 'Security Guard' },
    { id: 'cleaner',      name: 'Cleaner' },
  ]},
]

type City = typeof CITIES[0]

export default function EnHome() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0])
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400)
    return () => clearTimeout(t)
  }, [])

  const handlePurposeSelect = (id: string) => {
    setSelectedPurpose(id)
    setSelectedProperty(null)
  }

  const canProceedStep2 = selectedPurpose !== null && selectedProperty !== null

  const resultsUrl = selectedOccupation
    ? `/results?city=${selectedCity.id}&purpose=${selectedPurpose}&property=${selectedProperty}&occupation=${selectedOccupation}`
    : '#'

  const BG = { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }
  const CHECK = (
    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={BG}>✓</div>
  )

  return (
    <main className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

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
            In {selectedCity.name},<br />
            what's really costing you your{' '}
            <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>life</span>?
          </h1>
          <p className="text-white/30 text-sm">{selectedCity.nameZh} · Canada</p>
        </div>

        {/* Step indicator */}
        <div className={`flex items-center justify-center gap-3 mb-7 transition-all duration-700 ${started ? 'opacity-100' : 'opacity-0'}`}>
          {['City', 'Goal', 'Occupation'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i + 1 ? 'bg-[#059669] text-white' :
                  step === i + 1 ? 'text-white' : 'bg-white/10 text-white/30'
                }`} style={step === i + 1 ? BG : {}}>
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

        {/* ── Step 1: Select City ── */}
        {step === 1 && (
          <div className={`transition-all duration-500 ${started ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">Step 1 · Select your city</div>

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
                          <button key={city.id}
                            onClick={() => setSelectedCity(city)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${
                              sel ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}>
                            <div>
                              <div className="text-white font-semibold">{city.name}</div>
                              <div className="text-white/40 text-xs">{city.province}</div>
                            </div>
                            {sel && CHECK}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <p className="text-center text-xs text-white/20">More cities coming soon</p>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base" style={BG}>
              Next: Choose Goal →
            </button>
          </div>
        )}

        {/* ── Step 2: Goal + Subtype ── */}
        {step === 2 && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">Step 2 · What are you planning?</div>

            <div className="flex flex-col gap-3 mb-5">
              {PURPOSES.map(p => (
                <button key={p.id}
                  onClick={() => handlePurposeSelect(p.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                    selectedPurpose === p.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{p.name}</div>
                    <div className="text-white/50 text-sm">{p.desc}</div>
                  </div>
                  {selectedPurpose === p.id && CHECK}
                </button>
              ))}
            </div>

            {/* Subtype: Housing */}
            {(selectedPurpose === 'buy' || selectedPurpose === 'rent') && (
              <div className="mb-5">
                <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">Select property type</div>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSE_TYPES.map(item => (
                    <button key={item.id}
                      onClick={() => setSelectedProperty(item.id)}
                      className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                        selectedProperty === item.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}>
                      <div className="text-white text-sm font-semibold">{item.name}</div>
                      <div className="text-white/40 text-xs">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtype: Vehicles by brand */}
            {selectedPurpose === 'car' && (
              <div className="mb-5">
                <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-3">Select vehicle</div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,92,240,0.5) transparent' }}>
                  {VEHICLE_BRANDS.map(brand => (
                    <div key={brand.brand}>
                      <div className="text-xs font-bold text-white/45 mb-2 px-1 uppercase tracking-wide">
                        {brand.brand}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {brand.models.map(v => (
                          <button key={v.id}
                            onClick={() => setSelectedProperty(v.id)}
                            className={`flex flex-col items-start px-3 py-2 rounded-xl border transition-all duration-200 ${
                              selectedProperty === v.id ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}>
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

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← Back</button>
              <button onClick={() => { if (canProceedStep2) setStep(3) }}
                disabled={!canProceedStep2}
                className="flex-1 py-4 rounded-2xl text-white font-semibold text-base transition-all"
                style={{ background: canProceedStep2 ? 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' : 'rgba(255,255,255,0.1)' }}>
                Next: Choose Occupation →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Select Occupation ── */}
        {step === 3 && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-5">Step 3 · Select your occupation</div>

            <div className="space-y-4 mb-5 overflow-y-auto"
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
                        <button key={occ.id}
                          onClick={() => setSelectedOccupation(occ.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 text-left ${
                            sel ? 'border-[#5B5CF0] bg-[#5B5CF0]/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}>
                          <span className="text-white text-sm">{occ.name}</span>
                          {sel && (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ml-1"
                              style={BG}>✓</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 rounded-2xl text-white/50 text-sm border border-white/10">← Back</button>
              <a href={resultsUrl}
                className={`flex-1 py-4 rounded-2xl text-white font-semibold text-base text-center transition-all ${!selectedOccupation ? 'pointer-events-none opacity-40' : ''}`}
                style={BG}>
                See My Results →
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
