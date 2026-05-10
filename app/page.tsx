'use client'
import { useEffect, useState } from 'react'

function AnimatedNumber({ target, duration = 2000 }: { target: number, duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(increment * step * 10) / 10)
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{current.toFixed(1)}</span>
}

export default function Home() {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #151827, #1E2235)' }}>

      {/* 光晕动画背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-pulse"
          style={{
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, #4F8EF7 0%, transparent 70%)',
            top: '-200px', right: '-100px',
            animationDuration: '4s'
          }} />
        <div className="absolute rounded-full opacity-10 animate-pulse"
          style={{
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, #5B5CF0 0%, transparent 70%)',
            bottom: '-150px', left: '-100px',
            animationDuration: '6s',
            animationDelay: '1s'
          }} />
        <div className="absolute rounded-full opacity-10 animate-pulse"
          style={{
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
            top: '50%', left: '50%',
            animationDuration: '5s',
            animationDelay: '2s'
          }} />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">

        {/* 城市标签 */}
        <div className={`flex items-center justify-center gap-2 mb-8 transition-all duration-700 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span className="text-sm text-white/50 font-medium">📍 温哥华, BC · 已自动识别</span>
          <span className="text-sm text-[#5B5CF0] cursor-pointer">切换城市 ▾</span>
        </div>

        {/* 主标题 */}
        <h1 className={`text-4xl md:text-5xl font-bold text-white leading-tight mb-6 transition-all duration-700 delay-200 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ letterSpacing: '-1px' }}>
          在温哥华，<br />
          这些事要花你多少<span style={{
            background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>人生</span>？
        </h1>

        {/* 动画数字区 */}
        <div className={`flex justify-center gap-8 mb-12 transition-all duration-700 delay-300 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          <div className="text-center">
            <div className="text-5xl font-bold text-[#EF4444] mb-1" style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
              {started ? <AnimatedNumber target={10.2} duration={4000} /> : '0.0'}
              <span className="text-2xl text-white/50 ml-1">年</span>
            </div>
            <div className="text-xs text-white/40">注册护士 · 买房</div>
            <div className="text-xs text-[#EF4444]/70 mt-1">压垮性</div>
          </div>

          <div className="w-px bg-white/10" />

          <div className="text-center">
            <div className="text-5xl font-bold text-[#EF4444] mb-1" style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
              {started ? <AnimatedNumber target={43.6} duration={2500} /> : '0.0'}
              <span className="text-2xl text-white/50 ml-1">%</span>
            </div>
            <div className="text-xs text-white/40">注册护士 · 租房</div>
            <div className="text-xs text-[#EF4444]/70 mt-1">难以为继</div>
          </div>

          <div className="w-px bg-white/10" />

          <div className="text-center">
            <div className="text-5xl font-bold text-[#D97706] mb-1" style={{ fontFamily: 'monospace', letterSpacing: '-2px' }}>
              {started ? <AnimatedNumber target={7.6} duration={3500} /> : '0.0'}
              <span className="text-2xl text-white/50 ml-1">月薪</span>
            </div>
            <div className="text-xs text-white/40">注册护士 · 买车</div>
            <div className="text-xs text-[#D97706]/70 mt-1">沉重</div>
          </div>

        </div>

        {/* 时间轴预览 */}
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 max-w-lg mx-auto transition-all duration-700 delay-500 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-4">
            同一职业 · 三个时代
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-8 font-mono">1995</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-[#059669] rounded-full transition-all duration-2000 delay-1000 ${started ? 'w-[38%]' : 'w-0'}`} />
              </div>
              <span className="text-xs font-bold text-[#059669] w-12 text-right font-mono">4 年</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-8 font-mono">2019</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-[#F59E0B] rounded-full transition-all duration-2000 delay-1500 ${started ? 'w-[72%]' : 'w-0'}`} />
              </div>
              <span className="text-xs font-bold text-[#F59E0B] w-12 text-right font-mono">8 年</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white w-8 font-mono">2026</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-2000 delay-2000 ${started ? 'w-full' : 'w-0'}`}
                  style={{ background: 'linear-gradient(90deg, #DC2626, #EF4444)' }} />
              </div>
              <span className="text-xs font-bold text-[#EF4444] w-12 text-right font-mono">10.2年</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={`flex gap-4 justify-center transition-all duration-700 delay-700 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button className="px-8 py-3 rounded-full text-white font-semibold text-base"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
            查询我的城市 →
          </button>
          <button className="px-8 py-3 rounded-full text-white/60 font-medium text-base border border-white/20">
            查看排行榜
          </button>
        </div>

      </div>
    </main>
  )
}