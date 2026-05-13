'use client'
import { useState } from 'react'

const CITIES = [
  { id: 'vancouver', name: '温哥华', province: 'BC' },
  { id: 'toronto', name: '多伦多', province: 'ON' },
  { id: 'calgary', name: '卡尔加里', province: 'AB' },
  { id: 'montreal', name: '蒙特利尔', province: 'QC' },
  { id: 'ottawa', name: '渥太华', province: 'ON' },
]

const REPORT_ITEMS = [
  { icon: '🏠', text: '买房指数变化', tag: '↑ 恶化', tagColor: '#DC2626', tagBg: '#FEE2E2' },
  { icon: '🔑', text: '租金占收入比变化', tag: '↑ 恶化', tagColor: '#DC2626', tagBg: '#FEE2E2' },
  { icon: '🚗', text: '买车指数变化', tag: '↓ 改善', tagColor: '#059669', tagBg: '#D1FAE5' },
  { icon: '🌿', text: '环境指数维持', tag: '→ 持平', tagColor: '#6B7280', tagBg: '#F3F4F6' },
]

export default function SubscribePage() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['vancouver'])
  const [frequency, setFrequency] = useState<'quarterly' | 'monthly'>('quarterly')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleCity = (id: string) => {
    setSelectedCities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!email) return
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB]">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-10 text-center"
        style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>
        <div className="absolute top-0 left-50 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5B5CF0 0%, transparent 70%)', left: '50%', transform: 'translateX(-50%) translateY(-50%)' }} />
        <div className="relative z-10">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-white mb-2">订阅城市生活季报</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            每季度收到你关注城市的最新生活指数<br />
            免费 · 无广告 · 随时退订
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* 季报内容预览 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#111827]">季报内容预览</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">温哥华 · 注册护士 · 2026年Q1</div>
            </div>
            <div className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
              Q1 2026
            </div>
          </div>

          {/* 季报样式预览 */}
          <div className="m-4 rounded-xl p-4 border border-[#E5E7EB]"
            style={{ background: '#F9FAFB' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold" style={{
                background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>CityCity 季报</div>
              <div className="text-xs text-[#9CA3AF]">2026年Q1</div>
            </div>
            <div className="space-y-2">
              {REPORT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-xs text-[#374151]">{item.text}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: item.tagBg, color: item.tagColor }}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#9CA3AF] text-center mt-3">
              每季度第一周发送 · citycity.org
            </div>
          </div>
        </div>

        {/* 订阅频率 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">选择订阅频率</div>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => setFrequency('quarterly')}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                frequency === 'quarterly' ? 'border-[#5B5CF0] bg-[#EEF4FF]' : 'border-[#E5E7EB]'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                frequency === 'quarterly' ? 'border-[#5B5CF0] bg-[#5B5CF0]' : 'border-[#D1D5DB]'
              }`}>
                {frequency === 'quarterly' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${frequency === 'quarterly' ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}>
                  季报（推荐）
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">
                  每3个月收到一次，包含完整指数变化和趋势分析
                </div>
                <div className="text-xs font-medium text-[#059669] mt-1.5">每年4封</div>
              </div>
            </button>

            <button
              onClick={() => setFrequency('monthly')}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                frequency === 'monthly' ? 'border-[#5B5CF0] bg-[#EEF4FF]' : 'border-[#E5E7EB]'
              }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                frequency === 'monthly' ? 'border-[#5B5CF0] bg-[#5B5CF0]' : 'border-[#D1D5DB]'
              }`}>
                {frequency === 'monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${frequency === 'monthly' ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}>
                  月报
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">
                  每月收到房价和租金最新数据变化简报
                </div>
                <div className="text-xs font-medium text-[#5B5CF0] mt-1.5">每年12封</div>
              </div>
            </button>
          </div>
        </div>

        {/* 城市选择 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="text-sm font-semibold text-[#111827]">选择关注城市</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">可多选</div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {CITIES.map(city => {
              const selected = selectedCities.includes(city.id)
              return (
                <button key={city.id}
                  onClick={() => toggleCity(city.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selected ? 'border-[#5B5CF0] bg-[#EEF4FF]' : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                  }`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs ${
                    selected ? 'text-white' : 'border border-[#D1D5DB]'
                  }`}
                    style={selected ? { background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' } : {}}>
                    {selected && '✓'}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${selected ? 'text-[#1D4ED8]' : 'text-[#374151]'}`}>
                      {city.name}
                    </div>
                    <div className="text-xs text-[#9CA3AF]">{city.province}</div>
                  </div>
                </button>
              )
            })}
            <button
              onClick={() => setSelectedCities(CITIES.map(c => c.id))}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#5B5CF0] transition-all text-left">
              <div className="w-5 h-5 rounded border border-[#D1D5DB] flex items-center justify-center text-xs text-[#9CA3AF]">+</div>
              <div className="text-sm text-[#9CA3AF]">全部城市</div>
            </button>
          </div>
        </div>

        {/* 邮箱输入 */}
        {!submitted ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <div className="text-sm font-semibold text-[#111827]">你的邮箱地址</div>
            </div>
            <div className="p-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#374151] outline-none mb-3"
                style={{ fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#5B5CF0'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                onClick={handleSubmit}
                disabled={!email}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity"
                style={{
                  background: email ? 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' : '#D1D5DB',
                  cursor: email ? 'pointer' : 'not-allowed'
                }}>
                订阅季报 →
              </button>
              <p className="text-xs text-[#9CA3AF] text-center mt-3 leading-relaxed">
                🔒 你的邮箱仅用于发送报告，不会出售给任何第三方<br />
                随时可以一键退订 · 无广告 · 无推销
              </p>
            </div>
          </div>
        ) : (
          /* 订阅成功 */
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="px-5 py-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-lg font-bold text-[#111827] mb-2">订阅成功！</div>
              <div className="text-sm text-[#9CA3AF] leading-relaxed">
                下一期{frequency === 'quarterly' ? '季报' : '月报'}将在<br />
                {frequency === 'quarterly' ? '2026年Q2' : '2026年6月'}发送<br />
                请查收确认邮件
              </div>
              <a href="/"
                className="inline-block mt-6 px-6 py-3 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                返回首页
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}