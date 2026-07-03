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

            {/* Share card — Spotify Wrapped style */}
            {(() => {
              const altCity = city === 'calgary' ? 'vancouver' : 'calgary'
              const altName = CITY_NAMES[altCity] ?? 'Calgary'
              const cityHpi = CITY_HPI[city] ?? 10
              const altHpi  = CITY_HPI[altCity] ?? 8.5
              const cheaper = cityHpi <= altHpi ? city : altCity
              const diff    = Math.abs(cityHpi - altHpi).toFixed(1)
              const maxHpi  = Math.max(cityHpi, altHpi)
              const cityRpi = city === 'vancouver' ? 43.6 : city === 'toronto' ? 41.2 : city === 'calgary' ? 24.1 : city === 'montreal' ? 30.2 : 28.4
              const score   = CITY_SCORE[city] ?? 75

              return (
                <div className="w-[288px] rounded-3xl relative overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(160deg, #07111e 0%, #0a1628 60%, #081420 100%)', minHeight: '380px' }}>

                  {/* Background glow — changes by card */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: activeCard === 'compare'
                      ? 'radial-gradient(ellipse at 80% 10%, rgba(20,184,166,0.12) 0%, transparent 60%)'
                      : activeCard === 'rent'
                      ? 'radial-gradient(ellipse at 80% 10%, rgba(239,68,68,0.10) 0%, transparent 60%)'
                      : 'radial-gradient(ellipse at 80% 10%, rgba(79,142,247,0.10) 0%, transparent 60%)'
                  }} />

                  <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: '380px' }}>

                    {/* Top: logo + badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '0.14em', color: 'white' }}>
                          <span style={{ color: '#14B8A6' }}>LA</span>KıVE
                        </div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', marginTop: '2px', letterSpacing: '0.04em' }}>
                          From Data to Belonging
                        </div>
                      </div>
                      <div style={{
                        fontSize: '9px', color: 'rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '4px 8px', borderRadius: '6px', maxWidth: '100px', textAlign: 'right', lineHeight: 1.4
                      }}>
                        {occupationName}
                      </div>
                    </div>

                    {/* ── COMPARE card ── */}
                    {activeCard === 'compare' && (
                      <div className="flex flex-col flex-1">
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                          Same job · Two cities · One number
                        </div>

                        {/* Two cities */}
                        <div className="flex items-end gap-3 mb-4">
                          <div className="flex-1">
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>{cityName}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '52px', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', color: cityHpi <= altHpi ? '#14B8A6' : '#F87171' }}>
                              {cityHpi}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>yr to own</div>
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', paddingBottom: '14px' }}>vs</div>
                          <div className="flex-1">
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>{altName}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '52px', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', color: altHpi <= cityHpi ? '#14B8A6' : '#F87171' }}>
                              {altHpi}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>yr to own</div>
                          </div>
                        </div>

                        {/* Bar comparison */}
                        <div className="mb-4">
                          {[{ name: cityName, val: cityHpi }, { name: altName, val: altHpi }].map(b => (
                            <div key={b.name} className="flex items-center gap-2 mb-1.5">
                              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', width: '62px', flexShrink: 0 }}>{b.name}</div>
                              <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(b.val / maxHpi) * 100}%`, borderRadius: '3px', background: b.val <= (b.name === cityName ? altHpi : cityHpi) ? '#14B8A6' : '#F87171' }} />
                              </div>
                              <div style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', width: '28px', textAlign: 'right', flexShrink: 0 }}>{b.val}yr</div>
                            </div>
                          ))}
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)', marginTop: '4px' }}>Years of gross income to own a home</div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />

                        {/* Verdict */}
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: '5px' }}>
                          {CITY_NAMES[cheaper]} is {diff} years faster.
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          Same income. Same job. Different future.
                        </div>
                      </div>
                    )}

                    {/* ── BUY card ── */}
                    {activeCard === 'buy' && (
                      <div className="flex flex-col flex-1">
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                          Home ownership · {cityName}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '72px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: cityHpi <= 10 ? '#14B8A6' : cityHpi <= 14 ? '#F59E0B' : '#F87171' }}>
                          {cityHpi}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', marginBottom: '4px' }}>years to own a home</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '20px' }}>Based on annual gross income · {occupationName}</div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: '5px' }}>
                          {cityHpi <= 9 ? 'Within reach.' : cityHpi <= 13 ? 'Challenging, but achievable.' : 'One of Canada\'s hardest markets.'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          {cityHpi <= 9 ? `${CITY_HPI.vancouver} yr in Vancouver for the same job.` : `Calgary: ${CITY_HPI.calgary} yr for the same occupation.`}
                        </div>
                      </div>
                    )}

                    {/* ── RENT card ── */}
                    {activeCard === 'rent' && (
                      <div className="flex flex-col flex-1">
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                          Rent burden · {cityName}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '72px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: cityRpi > 38 ? '#F87171' : cityRpi > 30 ? '#F59E0B' : '#14B8A6' }}>
                          {cityRpi}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', marginBottom: '4px' }}>% of income on rent</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '20px' }}>{occupationName} · {cityName}</div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: '5px' }}>
                          {cityRpi < 28 ? 'Healthy. Room to grow.' : cityRpi < 36 ? 'Above the 30% guideline.' : 'Financially under pressure.'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          Guideline: 30% max · Calgary: 24.1%
                        </div>
                      </div>
                    )}

                    {/* ── CAREER card ── */}
                    {activeCard === 'career' && (
                      <div className="flex flex-col flex-1">
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px' }}>
                          City fit score · {cityName}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '72px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px', color: score >= 80 ? '#14B8A6' : score >= 70 ? '#F59E0B' : '#F87171' }}>
                          {score}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', marginBottom: '4px' }}>out of 100</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '20px' }}>Lakive City Intelligence · Q2 2026</div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '14px' }} />
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: '5px' }}>
                          {score >= 82 ? 'Top-rated for skilled workers.' : score >= 74 ? 'Strong fit for this career.' : 'Moderate — worth comparing.'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          {occupationName} · {cityName}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)' }}>CREA · StatCan · CMHC</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>lakive.com</div>
                    </div>

                  </div>
                </div>
              )
            })()}
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
