'use client'
import { useState, useEffect } from 'react'

const CITY_NAMES: Record<string, string> = {
  vancouver: '温哥华',
  toronto: '多伦多',
  calgary: '卡尔加里',
  montreal: '蒙特利尔',
  ottawa: '渥太华',
}

const OCCUPATION_NAMES: Record<string, string> = {
  nurse: '注册护士',
  software_eng: '软件工程师',
  teacher: '中学教师',
  electrician: '电工',
  truck_driver: '卡车司机',
  accountant: '会计师',
  police: '警察',
  chef: '厨师',
  retail: '零售店员',
  engineer: '土木工程师',
}

const CARD_TYPES = [
  { id: 'buy', icon: '🏠', name: '买房结论卡' },
  { id: 'rent', icon: '🔑', name: '租房结论卡' },
  { id: 'car', icon: '🚗', name: '买车结论卡' },
  { id: 'compare', icon: '⚖️', name: '城市对比卡' },
]

const PLATFORMS = [
  { id: 'xiaohongshu', name: '小红书', size: '1080×1350', icon: '📱' },
  { id: 'wechat', name: '微信', size: '1080×1080', icon: '💬' },
  { id: 'reddit', name: 'Reddit / X', size: '1200×628', icon: '🐦' },
  { id: 'general', name: '通用PNG', size: '1080×1080', icon: '📄' },
]

const SHARE_PLATFORMS = [
  { name: '小红书', icon: '📕' },
  { name: '微信', icon: '💬' },
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
  const [activeCard, setActiveCard] = useState('buy')
  const [activePlatform, setActivePlatform] = useState('xiaohongshu')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCity(params.get('city') || 'vancouver')
    setOccupation(params.get('occupation') || 'nurse')
  }, [])

  const cityName = CITY_NAMES[city] || '温哥华'
  const occupationName = OCCUPATION_NAMES[occupation] || '注册护士'

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="px-6 py-6"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-white/40 text-sm mb-1">分享卡片</div>
          <h1 className="text-2xl font-bold text-white mb-1">生成分享卡片</h1>
          <p className="text-white/40 text-sm">{cityName} · {occupationName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* 卡片类型选择 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">选择卡片类型</div>
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

        {/* 卡片预览 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">卡片预览</div>
          </div>
          <div className="p-5 flex justify-center" style={{ background: '#E8EAF2' }}>

            {/* 分享卡片本体 */}
            <div className="w-72 rounded-2xl p-5 relative overflow-hidden shadow-xl"
              style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

              {/* 光晕 */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

              {/* Logo行 */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <div className="text-base font-bold"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    CityCity
                  </div>
                  <div className="text-xs text-white/30">看清城市生活的真相</div>
                </div>
                <div className="text-xs text-white/40 text-right px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {occupationName}<br />{cityName}
                </div>
              </div>

              {/* 大数字 */}
              <div className="relative z-10 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs text-white/50">{cityName}</span>
                </div>
                {activeCard === 'buy' && (
                  <>
                    <div className="text-5xl font-bold text-white mb-1"
                      style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
                      10.2<span className="text-xl text-white/50 ml-1">年</span>
                    </div>
                    <div className="text-xs text-white/40">才能买一套2居室公寓</div>
                  </>
                )}
                {activeCard === 'rent' && (
                  <>
                    <div className="text-5xl font-bold text-white mb-1"
                      style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
                      43.6<span className="text-xl text-white/50 ml-1">%</span>
                    </div>
                    <div className="text-xs text-white/40">收入被租金吃掉</div>
                  </>
                )}
                {activeCard === 'car' && (
                  <>
                    <div className="text-5xl font-bold text-white mb-1"
                      style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
                      7.6<span className="text-xl text-white/50 ml-1">月薪</span>
                    </div>
                    <div className="text-xs text-white/40">才能买一辆Toyota RAV4</div>
                  </>
                )}
                {activeCard === 'compare' && (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <div>
                        <div className="text-xs text-white/40 mb-0.5">温哥华</div>
                        <div className="text-3xl font-bold text-[#EF4444]"
                          style={{ fontFamily: 'monospace', letterSpacing: '-1px' }}>
                          10.2年
                        </div>
                      </div>
                      <div className="text-white/20 text-sm">vs</div>
                      <div>
                        <div className="text-xs text-white/40 mb-0.5">卡尔加里</div>
                        <div className="text-3xl font-bold text-[#10B981]"
                          style={{ fontFamily: 'monospace', letterSpacing: '-1px' }}>
                          3.9年
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#10B981]">少用 6.3 年人生</div>
                  </>
                )}
              </div>

              {/* 时间轴 */}
              {activeCard !== 'compare' && (
                <div className="rounded-xl p-3 mb-4 relative z-10"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xs text-white/20 uppercase tracking-wider mb-2">同一职业 · 三个时代</div>
                  <div className="space-y-2">
                    {[
                      { year: '1995', width: '38%', color: '#10B981', val: '4 年' },
                      { year: '2019', width: '72%', color: '#F59E0B', val: '8 年' },
                      { year: '2026', width: '100%', color: '#EF4444', val: '10.2 年', bold: true },
                    ].map(row => (
                      <div key={row.year} className="flex items-center gap-2">
                        <span className={`text-xs font-mono w-7 flex-shrink-0 ${row.bold ? 'text-white font-bold' : 'text-white/35'}`}>
                          {row.year}
                        </span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <div className="h-full rounded-full" style={{ width: row.width, background: row.color }} />
                        </div>
                        <span className="text-xs font-bold font-mono w-10 text-right flex-shrink-0" style={{ color: row.color }}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between relative z-10">
                <div className="text-xs text-white/20 leading-relaxed">
                  StatCan · CREA · CMHC<br />2026年Q1
                </div>
                <div className="text-xs font-semibold text-white/30">citycity.org</div>
              </div>
            </div>
          </div>
        </div>

        {/* 平台选择 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">选择下载尺寸</div>
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

          {/* 下载按钮 */}
          <div className="px-4 pb-4">
            <button className="w-full py-3.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
              ⬇ 下载分享卡片
            </button>
          </div>
        </div>

        {/* 社交媒体分享 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">直接分享到社交媒体</div>
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

        {/* 返回 */}
        <div className="pb-6">
          <a href={`/results?city=${city}&occupation=${occupation}`}
            className="block w-full py-3 rounded-xl text-center text-sm font-medium text-[#374151]"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}>
            ← 返回结论
          </a>
        </div>

      </div>
    </main>
  )
}

export default function SharePage() {
  return <ShareContent />
}