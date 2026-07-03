'use client'
import { useState, useEffect } from 'react'

const CITY_NAMES: Record<string, string> = {
  vancouver: 'Vancouver',
  toronto: 'Toronto',
  calgary: 'Calgary',
  montreal: 'Montréal',
  ottawa: 'Ottawa',
}

const OCCUPATION_NAMES: Record<string, string> = {
  nurse: 'Registered Nurse',
  software_eng: 'Software Engineer',
  teacher: 'Secondary Teacher',
  electrician: 'Electrician',
  truck_driver: 'Truck Driver',
  accountant: 'Accountant',
  police: 'Police Officer',
  chef: 'Chef',
  retail: 'Retail Associate',
  engineer: 'Civil Engineer',
}

const CARD_TYPES = [
  { id: 'compare', icon: '⚖️', name: 'City Compare' },
  { id: 'buy',     icon: '🏠', name: 'Home Ownership' },
  { id: 'rent',    icon: '🔑', name: 'Rent Burden' },
  { id: 'career',  icon: '💼', name: 'Career Fit' },
]

// hpiYears benchmarks per city (2BR condo, avg across occupations)
const CITY_HPI: Record<string, number> = {
  vancouver: 16.2, toronto: 15.1, calgary: 8.5, montreal: 10.0, ottawa: 9.8,
}
// City score benchmarks
const CITY_SCORE: Record<string, number> = {
  vancouver: 71, toronto: 73, calgary: 84, montreal: 76, ottawa: 78,
}

const PLATFORMS = [
  { id: 'xiaohongshu', name: 'Xiaohongshu', size: '1080×1350', icon: '📱' },
  { id: 'wechat', name: 'WeChat', size: '1080×1080', icon: '💬' },
  { id: 'reddit', name: 'Reddit / X', size: '1200×628', icon: '🐦' },
  { id: 'general', name: 'General PNG', size: '1080×1080', icon: '📄' },
]

const SHARE_PLATFORMS = [
  { name: 'Xiaohongshu', icon: '📕' },
  { name: 'WeChat', icon: '💬' },
  { name: 'TikTok', icon: '🎵' },
  { name: 'X', icon: '🐦' },
  { name: 'Facebook', icon: '👥' },
  { name: 'Instagram', icon: '📸' },
  { name: 'LinkedIn', icon: '💼' },
  { name: 'Reddit', icon: '🤖' },
  { name: 'Pinterest', icon: '📌' },
  { name: 'Email', icon: '📧' },
]

function ShareContent() {
  const [city, setCity] = useState('vancouver')
  const [occupation, setOccupation] = useState('nurse')
  const [activeCard, setActiveCard] = useState('compare')
  const [activePlatform, setActivePlatform] = useState('xiaohongshu')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCity(params.get('city') || 'vancouver')
    setOccupation(params.get('occupation') || 'nurse')
  }, [])

  const cityName = CITY_NAMES[city] || 'Vancouver'
  const occupationName = OCCUPATION_NAMES[occupation] || 'Registered Nurse'

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="px-6 py-6"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-white/40 text-sm mb-1">Share Cards</div>
          <h1 className="text-2xl font-bold text-white mb-1">Generate Share Card</h1>
          <p className="text-white/40 text-sm">{cityName} · {occupationName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* Card type selection */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">Select Card Type</div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {CARD_TYPES.map(card => (
              <button key={card.id}
                onClick={() => setActiveCard(card.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  activeCard === card.id
                    ? 'border-[#5B5CF0] bg-[#EEF4FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#5B5CF0]'
                }`}>
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-sm font-medium ${activeCard === card.id ? 'text-[#1D4ED8]' : 'text-[#374151]'}`}>
                  {card.name}
                </span>
                {activeCard === card.id && (
                  <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card preview */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">Card Preview</div>
          </div>
          <div className="p-5 flex justify-center" style={{ background: '#E8EAF2' }}>

            {/* Share card — Insight format */}
            <div className="w-72 rounded-2xl p-5 relative overflow-hidden shadow-xl"
              style={{ background: 'linear-gradient(145deg, #0d1117, #151f35)' }}>

              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.07] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #14B8A6 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

              {/* Logo */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                  <div className="text-[15px] font-light tracking-widest" style={{ color: 'white', letterSpacing: '0.12em' }}>
                    <span style={{ color: '#14B8A6' }}>LA</span>KıVE
                  </div>
                  <div className="text-[10px] text-white/25 mt-0.5">From Data to Belonging</div>
                </div>
                <div className="text-[10px] text-white/35 text-right px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {occupationName}
                </div>
              </div>

              {/* Card content */}
              <div className="relative z-10">

                {/* Compare card */}
                {activeCard === 'compare' && (() => {
                  const altCity = city === 'calgary' ? 'vancouver' : 'calgary'
                  const altName = CITY_NAMES[altCity]
                  const cityHpi = CITY_HPI[city] ?? 10
                  const altHpi  = CITY_HPI[altCity] ?? 8.5
                  const diff    = Math.abs(cityHpi - altHpi).toFixed(1)
                  const cheaper = cityHpi < altHpi ? city : altCity
                  return (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Same job · Different city · Different future</div>
                      <div className="flex items-end gap-4 mb-3">
                        <div>
                          <div className="text-[10px] text-white/40 mb-1">{cityName}</div>
                          <div className="text-4xl font-bold leading-none"
                            style={{ fontFamily: 'monospace', color: cityHpi <= altHpi ? '#10B981' : '#EF4444', letterSpacing: '-1px' }}>
                            {cityHpi}<span className="text-lg text-white/40 ml-0.5">yr</span>
                          </div>
                        </div>
                        <div className="text-white/20 text-xs mb-1">vs</div>
                        <div>
                          <div className="text-[10px] text-white/40 mb-1">{altName}</div>
                          <div className="text-4xl font-bold leading-none"
                            style={{ fontFamily: 'monospace', color: altHpi <= cityHpi ? '#10B981' : '#EF4444', letterSpacing: '-1px' }}>
                            {altHpi}<span className="text-lg text-white/40 ml-0.5">yr</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-white/60 mb-1">Years to own a home · {occupationName}</div>
                      <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="text-[13px] font-bold text-white leading-snug">
                        {CITY_NAMES[cheaper]} saves you {diff} years.
                      </div>
                      <div className="text-[11px] text-white/40 mt-1">Same income. Different future.</div>
                    </div>
                  )
                })()}

                {/* Buy card */}
                {activeCard === 'buy' && (() => {
                  const hpi = CITY_HPI[city] ?? 10
                  return (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Home ownership · {cityName}</div>
                      <div className="text-6xl font-bold text-white leading-none mb-1"
                        style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
                        {hpi}<span className="text-2xl text-white/40 ml-1">yr</span>
                      </div>
                      <div className="text-xs text-white/50 mb-3">to own a 2BR home · {occupationName}</div>
                      <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="text-[13px] font-bold text-white leading-snug">
                        {hpi <= 9 ? 'Within reach.' : hpi <= 13 ? 'Challenging — but possible.' : 'One of Canada\'s toughest markets.'}
                      </div>
                      <div className="text-[11px] text-white/40 mt-1">Based on annual gross income.</div>
                    </div>
                  )
                })()}

                {/* Rent card */}
                {activeCard === 'rent' && (() => {
                  const rpi = city === 'vancouver' ? 43.6 : city === 'toronto' ? 41.2 : city === 'calgary' ? 24.1 : city === 'montreal' ? 30.2 : 28.4
                  return (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Rent burden · {cityName}</div>
                      <div className="text-6xl font-bold text-white leading-none mb-1"
                        style={{ fontFamily: 'monospace', letterSpacing: '-2px', color: rpi > 38 ? '#EF4444' : rpi > 30 ? '#F59E0B' : '#10B981' }}>
                        {rpi}<span className="text-2xl text-white/40 ml-1">%</span>
                      </div>
                      <div className="text-xs text-white/50 mb-3">of gross income on rent · {occupationName}</div>
                      <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="text-[13px] font-bold text-white leading-snug">
                        {rpi < 30 ? 'Healthy — room to save.' : rpi < 38 ? 'Above the 30% guideline.' : 'Financially stressful.'}
                      </div>
                      <div className="text-[11px] text-white/40 mt-1">Recommended ceiling: 30% of income.</div>
                    </div>
                  )
                })()}

                {/* Career card */}
                {activeCard === 'career' && (() => {
                  const score = CITY_SCORE[city] ?? 75
                  return (
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Career fit · {cityName}</div>
                      <div className="text-6xl font-bold leading-none mb-1"
                        style={{ fontFamily: 'monospace', letterSpacing: '-2px', color: score >= 80 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444' }}>
                        {score}<span className="text-2xl text-white/40 ml-1">/100</span>
                      </div>
                      <div className="text-xs text-white/50 mb-3">city fit score · {occupationName}</div>
                      <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="text-[13px] font-bold text-white leading-snug">
                        {score >= 82 ? 'Top-rated destination for skilled workers.' : score >= 74 ? 'Strong fit for this occupation.' : 'Moderate fit — review before committing.'}
                      </div>
                      <div className="text-[11px] text-white/40 mt-1">Lakive City Intelligence · Q2 2026</div>
                    </div>
                  )
                })()}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-5 relative z-10">
                <div className="text-[10px] text-white/20">CREA · StatCan · CMHC</div>
                <div className="text-[10px] font-semibold text-white/30">lakive.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform / size selection */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">Select Download Size</div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {PLATFORMS.map(platform => (
              <button key={platform.id}
                onClick={() => setActivePlatform(platform.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  activePlatform === platform.id
                    ? 'border-[#5B5CF0] bg-[#EEF4FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#5B5CF0]'
                }`}>
                <span className="text-xl">{platform.icon}</span>
                <div>
                  <div className={`text-sm font-medium ${activePlatform === platform.id ? 'text-[#1D4ED8]' : 'text-[#374151]'}`}>
                    {platform.name}
                  </div>
                  <div className="text-xs text-[#9CA3AF] font-mono">{platform.size}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Download button */}
          <div className="px-4 pb-4">
            <button className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
              ⬇ Download Share Card
            </button>
          </div>
        </div>

        {/* Share to social media */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">Share Directly to Social Media</div>
          </div>
          <div className="p-4 grid grid-cols-5 gap-3">
            {SHARE_PLATFORMS.map(platform => (
              <button key={platform.name}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[#E5E7EB] hover:border-[#5B5CF0] hover:bg-[#EEF4FF] transition-all">
                <span className="text-xl">{platform.icon}</span>
                <span className="text-xs text-[#6B7280]">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="pb-6">
          <a href={`/results?city=${city}&occupation=${occupation}`}
            className="block w-full py-3 rounded-xl text-center text-sm font-medium text-[#374151]"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
            ← Back to Results
          </a>
        </div>

      </div>
    </main>
  )
}

export default function SharePage() {
  return <ShareContent />
}
