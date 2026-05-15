'use client'
import { useEffect, useState } from 'react'

const CITIES = [
  { id: 'vancouver', name: 'Vancouver', province: 'British Columbia' },
  { id: 'toronto', name: 'Toronto', province: 'Ontario' },
  { id: 'calgary', name: 'Calgary', province: 'Alberta' },
  { id: 'montreal', name: 'Montréal', province: 'Québec' },
  { id: 'ottawa', name: 'Ottawa', province: 'Ontario' },
]

const PURPOSES = [
  { id: 'buy', icon: '🏠', name: 'Buying', desc: 'How many years of work does it actually take?' },
  { id: 'rent', icon: '🔑', name: 'Renting', desc: 'What share of my income goes to rent every month?' },
  { id: 'car', icon: '🚗', name: 'Car', desc: 'How many months of salary does a car cost here?' },
]

const OCCUPATIONS = [
  { id: 'nurse', name: 'Registered Nurse', industry: 'Healthcare' },
  { id: 'software_eng', name: 'Software Engineer', industry: 'Tech' },
  { id: 'teacher', name: 'High School Teacher', industry: 'Education' },
  { id: 'electrician', name: 'Electrician', industry: 'Trades' },
  { id: 'truck_driver', name: 'Truck Driver', industry: 'Transport' },
  { id: 'accountant', name: 'Accountant', industry: 'Finance' },
  { id: 'police', name: 'Police Officer', industry: 'Public Service' },
  { id: 'chef', name: 'Chef', industry: 'Food & Beverage' },
  { id: 'retail', name: 'Retail Worker', industry: 'Retail' },
  { id: 'engineer', name: 'Civil Engineer', industry: 'Construction' },
]

export default function EnHome() {
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
            {showCityDropdown && (
              <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select City</div>
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
                  5 cities · More coming soon
                </div>
              </div>
            )}
          </div>
          <span className="text-white/30 text-sm">· Auto-detected</span>
        </div>

        {/* 主标题 */}
        <div className={`text-center mb-10 transition-all duration-700 delay-200 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3" style={{ letterSpacing: '-1px' }}>
            In {selectedCity.name},<br />
            what's really costing you your <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>life</span>?
          </h1>
          
        </div>

        {/* 选择目的 */}
        <div className={`mb-8 transition-all duration-700 delay-300 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">
            Step 1 · What are you planning?
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

        {/* 选择职业 */}
        {showOccupations && (
          <div className="transition-all duration-500">
            <div className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">
              Step 2 · Select your occupation
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

            {selectedOccupation && (
              <a href={`/results?city=${selectedCity.id}&purpose=${selectedPurpose}&occupation=${selectedOccupation}`}
                className="block w-full py-4 rounded-2xl text-white font-semibold text-base text-center transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                See My Results →
              </a>
            )}
          </div>
        )}
      </div>

      {showCityDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCityDropdown(false)} />
      )}
    </main>
  )
}