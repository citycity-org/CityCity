'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window { d3: any; topojson: any }
}

interface City {
  id: string
  name: string
  nameEn: string
  lat: number
  lng: number
  active: boolean
  score?: number
  hpiYears?: number
  rpi?: number
}

const CITIES: City[] = [
  // Active Canadian cities
  { id: 'vancouver', name: '温哥华', nameEn: 'Vancouver',   lat: 49.25,  lng: -123.12, active: true,  score: 70, hpiYears: 10.2, rpi: 43.6 },
  { id: 'toronto',   name: '多伦多', nameEn: 'Toronto',     lat: 43.65,  lng: -79.38,  active: true,  score: 70, hpiYears: 9.6,  rpi: 41.2 },
  { id: 'calgary',   name: '卡尔加里', nameEn: 'Calgary',   lat: 51.05,  lng: -114.07, active: true,  score: 72, hpiYears: 3.9,  rpi: 24.1 },
  { id: 'montreal',  name: '蒙特利尔', nameEn: 'Montréal',  lat: 45.50,  lng: -73.57,  active: true,  score: 75, hpiYears: 5.5,  rpi: 30.2 },
  { id: 'ottawa',    name: '渥太华', nameEn: 'Ottawa',      lat: 45.42,  lng: -75.69,  active: true,  score: 73, hpiYears: 6.8,  rpi: 28.4 },
  // Coming soon – global cities
  { id: 'newyork',   name: '纽约',     nameEn: 'New York',       lat: 40.71, lng: -74.01,  active: false },
  { id: 'london',    name: '伦敦',     nameEn: 'London',         lat: 51.51, lng: -0.13,   active: false },
  { id: 'tokyo',     name: '东京',     nameEn: 'Tokyo',          lat: 35.68, lng: 139.69,  active: false },
  { id: 'sydney',    name: '悉尼',     nameEn: 'Sydney',         lat: -33.87,lng: 151.21,  active: false },
  { id: 'melbourne', name: '墨尔本',   nameEn: 'Melbourne',      lat: -37.81,lng: 144.96,  active: false },
  { id: 'singapore', name: '新加坡',   nameEn: 'Singapore',      lat: 1.35,  lng: 103.82,  active: false },
  { id: 'shanghai',  name: '上海',     nameEn: 'Shanghai',       lat: 31.23, lng: 121.47,  active: false },
  { id: 'beijing',   name: '北京',     nameEn: 'Beijing',        lat: 39.91, lng: 116.39,  active: false },
  { id: 'paris',     name: '巴黎',     nameEn: 'Paris',          lat: 48.85, lng: 2.35,    active: false },
  { id: 'berlin',    name: '柏林',     nameEn: 'Berlin',         lat: 52.52, lng: 13.40,   active: false },
  { id: 'amsterdam', name: '阿姆斯特丹', nameEn: 'Amsterdam',    lat: 52.37, lng: 4.90,    active: false },
  { id: 'zurich',    name: '苏黎世',   nameEn: 'Zürich',         lat: 47.38, lng: 8.54,    active: false },
  { id: 'dubai',     name: '迪拜',     nameEn: 'Dubai',          lat: 25.20, lng: 55.27,   active: false },
  { id: 'seoul',     name: '首尔',     nameEn: 'Seoul',          lat: 37.57, lng: 126.98,  active: false },
  { id: 'hongkong',  name: '香港',     nameEn: 'Hong Kong',      lat: 22.32, lng: 114.16,  active: false },
  { id: 'taipei',    name: '台北',     nameEn: 'Taipei',         lat: 25.05, lng: 121.53,  active: false },
  { id: 'sf',        name: '旧金山',   nameEn: 'San Francisco',  lat: 37.77, lng: -122.42, active: false },
  { id: 'losangeles',name: '洛杉矶',   nameEn: 'Los Angeles',    lat: 34.05, lng: -118.24, active: false },
  { id: 'chicago',   name: '芝加哥',   nameEn: 'Chicago',        lat: 41.88, lng: -87.63,  active: false },
  { id: 'miami',     name: '迈阿密',   nameEn: 'Miami',          lat: 25.77, lng: -80.19,  active: false },
  { id: 'seattle',   name: '西雅图',   nameEn: 'Seattle',        lat: 47.61, lng: -122.33, active: false },
  { id: 'auckland',  name: '奥克兰',   nameEn: 'Auckland',       lat: -36.85,lng: 174.76,  active: false },
  { id: 'dublin',    name: '都柏林',   nameEn: 'Dublin',         lat: 53.34, lng: -6.27,   active: false },
  { id: 'stockholm', name: '斯德哥尔摩', nameEn: 'Stockholm',    lat: 59.33, lng: 18.07,   active: false },
  { id: 'nairobi',   name: '内罗毕',   nameEn: 'Nairobi',        lat: -1.29, lng: 36.82,   active: false },
  { id: 'mexico',    name: '墨西哥城', nameEn: 'Mexico City',    lat: 19.43, lng: -99.13,  active: false },
  { id: 'saopaulo',  name: '圣保罗',   nameEn: 'São Paulo',      lat: -23.55,lng: -46.63,  active: false },
]

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function Home() {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rotRef        = useRef<[number, number]>([-100, -30])
  const scaleRef      = useRef(0)
  const minScaleRef   = useRef(0)
  const maxScaleRef   = useRef(0)
  const projRef       = useRef<any>(null)
  const dragging      = useRef(false)
  const pointerStart  = useRef<[number, number]>([0, 0])
  const lastPos       = useRef<[number, number]>([0, 0])
  const autoRotate    = useRef(true)
  const animFrame     = useRef(0)
  const worldData     = useRef<any>(null)
  const pulseT        = useRef(0)
  // pinch zoom
  const pinchDist     = useRef(0)

  const [ready,        setReady]        = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [zoomLevel,    setZoomLevel]    = useState(0) // 0–100

  const openCity = useCallback((city: City) => {
    setSelectedCity(city)
    setPanelOpen(true)
    autoRotate.current = false
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    autoRotate.current = true
  }, [])

  // ── Load D3 + TopoJSON + world atlas ───────────────────────────────────────
  useEffect(() => {
    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js'),
    ])
      .then(() =>
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
          .then(r => r.json())
      )
      .then(data => {
        worldData.current = data
        setReady(true)
      })
      .catch(console.error)
  }, [])

  // ── Globe renderer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !canvasRef.current) return
    const canvas = canvasRef.current
    const d3       = window.d3
    const topojson = window.topojson
    const dpr = window.devicePixelRatio || 1

    // Use window dimensions directly — avoids display:none 0-size trap
    const NAV_H = 56
    const W = window.innerWidth
    const H = window.innerHeight - NAV_H
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const baseR  = Math.min(W, H) * 0.40
    const cx     = W / 2
    const cy     = H / 2
    minScaleRef.current = baseR * 0.75
    maxScaleRef.current = baseR * 5
    if (scaleRef.current === 0) scaleRef.current = baseR

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([cx, cy])
      .clipAngle(90)
      .rotate(rotRef.current)
    projRef.current = projection

    const path     = d3.geoPath().context(ctx)
    const land     = topojson.feature(worldData.current, worldData.current.objects.land)
    const graticule = d3.geoGraticule()()

    // ── draw one frame ─────────────────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, W, H)
      pulseT.current += 0.04

      const r = projection.scale()

      // Ocean sphere (full clip)
      projection.clipAngle(180)
      ctx.beginPath(); path({ type: 'Sphere' })
      const oceanGrad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.22, 0, cx, cy, r)
      oceanGrad.addColorStop(0, '#1c3a70')
      oceanGrad.addColorStop(0.55, '#0d1f44')
      oceanGrad.addColorStop(1, '#04091a')
      ctx.fillStyle = oceanGrad; ctx.fill()
      projection.clipAngle(90)

      // Graticules
      ctx.beginPath(); path(graticule)
      ctx.strokeStyle = 'rgba(79,142,247,0.07)'; ctx.lineWidth = 0.6; ctx.stroke()

      // Land
      ctx.beginPath(); path(land)
      const landGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
      landGrad.addColorStop(0, '#1d3b6a')
      landGrad.addColorStop(1, '#132b50')
      ctx.fillStyle = landGrad; ctx.fill()
      ctx.strokeStyle = 'rgba(79,142,247,0.22)'; ctx.lineWidth = 0.5; ctx.stroke()

      // Atmosphere glow (outside clip)
      projection.clipAngle(180)
      ctx.beginPath(); path({ type: 'Sphere' })
      const atm = ctx.createRadialGradient(cx, cy, r * 0.93, cx, cy, r * 1.08)
      atm.addColorStop(0,   'rgba(79,142,247,0.00)')
      atm.addColorStop(0.4, 'rgba(79,142,247,0.18)')
      atm.addColorStop(1,   'rgba(79,142,247,0.00)')
      ctx.strokeStyle = atm; ctx.lineWidth = r * 0.15; ctx.stroke()
      projection.clipAngle(90)

      // ── Cities ────────────────────────────────────────────────────────────
      CITIES.forEach(city => {
        // Visibility check
        const dist = d3.geoDistance(
          [city.lng, city.lat],
          [-projection.rotate()[0], -projection.rotate()[1]]
        )
        if (dist >= Math.PI / 2) return

        const pos = projection([city.lng, city.lat])
        if (!pos) return
        const [x, y] = pos

        if (city.active) {
          const phase = pulseT.current + (city.lat + city.lng) * 0.05
          const pulse = 0.5 + 0.5 * Math.sin(phase)

          // Outer pulse ring
          const pR = 10 + pulse * 8
          const ringGrad = ctx.createRadialGradient(x, y, 0, x, y, pR)
          ringGrad.addColorStop(0, `rgba(253,212,36,${0.35 * pulse})`)
          ringGrad.addColorStop(1, 'rgba(253,212,36,0)')
          ctx.beginPath(); ctx.arc(x, y, pR, 0, Math.PI * 2)
          ctx.fillStyle = ringGrad; ctx.fill()

          // Inner glow
          const gGrad = ctx.createRadialGradient(x, y, 0, x, y, 10)
          gGrad.addColorStop(0, 'rgba(255,230,80,0.7)')
          gGrad.addColorStop(1, 'rgba(251,191,36,0)')
          ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.fillStyle = gGrad; ctx.fill()

          // Core
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = '#FDE047'; ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.stroke()

          // Label (always show name, hide when zoomed out a lot)
          if (r > baseR * 0.85) {
            ctx.save()
            ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 6
            ctx.font = `bold ${Math.max(8, Math.min(11, r / baseR * 9))}px -apple-system,system-ui,sans-serif`
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(255,255,255,0.92)'
            ctx.fillText(city.nameEn, x, y - 18)
            ctx.restore()
          }
        } else {
          // Coming soon: small blue dot
          const opacity = Math.max(0.25, 0.6 - dist * 0.5)
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(147,197,253,${opacity})`; ctx.fill()
        }
      })
    }

    // ── animation loop ─────────────────────────────────────────────────────
    function animate() {
      if (autoRotate.current) {
        const rot = projection.rotate()
        const newLng = rot[0] + 0.12
        projection.rotate([newLng, rot[1]])
        rotRef.current = [newLng, rot[1]]
      }
      draw()
      animFrame.current = requestAnimationFrame(animate)
    }
    animFrame.current = requestAnimationFrame(animate)

    // ── pointer (mouse + touch) events ─────────────────────────────────────
    function getXY(e: PointerEvent): [number, number] {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    function onPointerDown(e: PointerEvent) {
      dragging.current    = true
      autoRotate.current  = false
      const [x, y]        = getXY(e)
      pointerStart.current = [x, y]
      lastPos.current      = [x, y]
      canvas.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return
      const [x, y] = getXY(e)
      const dx = x - lastPos.current[0]
      const dy = y - lastPos.current[1]
      lastPos.current = [x, y]
      const sensitivity = 250 / projection.scale()
      const rot = projection.rotate()
      const newRot: [number, number] = [
        rot[0] + dx * sensitivity,
        Math.max(-80, Math.min(80, rot[1] - dy * sensitivity))
      ]
      projection.rotate(newRot)
      rotRef.current = newRot
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return
      dragging.current = false
      const [x, y] = getXY(e)
      const moved = Math.hypot(
        x - pointerStart.current[0],
        y - pointerStart.current[1]
      )
      if (moved < 8) {
        // Treat as click — find nearest city
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        handleClick(mx, my)
      }
    }

    function handleClick(mx: number, my: number) {
      let closest: City | null = null
      let closestDist = Infinity
      const hitR = Math.max(18, 32 / (projection.scale() / baseR))

      CITIES.forEach(city => {
        const dist = d3.geoDistance(
          [city.lng, city.lat],
          [-projection.rotate()[0], -projection.rotate()[1]]
        )
        if (dist >= Math.PI / 2) return
        const pos = projection([city.lng, city.lat])
        if (!pos) return
        const [x, y] = pos
        const d = Math.hypot(mx - x, my - y)
        const threshold = city.active ? hitR : hitR * 0.5
        if (d < threshold && d < closestDist) {
          closestDist = d
          closest = city
        }
      })

      if (closest) {
        openCity(closest)
      } else {
        closePanel()
      }
    }

    // ── Wheel zoom ──────────────────────────────────────────────────────────
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 0.89
      const newScale = Math.max(
        minScaleRef.current,
        Math.min(maxScaleRef.current, projection.scale() * factor)
      )
      projection.scale(newScale)
      scaleRef.current = newScale
      const pct = (newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current)
      setZoomLevel(Math.round(pct * 100))
    }

    // ── Touch pinch zoom ────────────────────────────────────────────────────
    const activeTouches = new Map<number, [number, number]>()

    function onTouchStart(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) {
        const rect = canvas.getBoundingClientRect()
        activeTouches.set(t.identifier, [t.clientX - rect.left, t.clientY - rect.top])
      }
      if (activeTouches.size === 2) {
        const pts = Array.from(activeTouches.values())
        pinchDist.current = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      for (const t of Array.from(e.changedTouches)) {
        activeTouches.set(t.identifier, [t.clientX - rect.left, t.clientY - rect.top])
      }
      if (activeTouches.size === 2 && pinchDist.current > 0) {
        const pts = Array.from(activeTouches.values())
        const newDist = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
        const factor = newDist / pinchDist.current
        pinchDist.current = newDist
        const newScale = Math.max(
          minScaleRef.current,
          Math.min(maxScaleRef.current, projection.scale() * factor)
        )
        projection.scale(newScale)
        scaleRef.current = newScale
        const pct = (newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current)
        setZoomLevel(Math.round(pct * 100))
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (const t of Array.from(e.changedTouches)) activeTouches.delete(t.identifier)
      if (activeTouches.size < 2) pinchDist.current = 0
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup',   onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    canvas.addEventListener('touchend',   onTouchEnd)

    return () => {
      cancelAnimationFrame(animFrame.current)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup',   onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)
    }
  }, [ready, openCity, closePanel])

  // ── Zoom buttons ───────────────────────────────────────────────────────────
  const applyZoom = useCallback((factor: number) => {
    const proj = projRef.current
    if (!proj) return
    const newScale = Math.max(
      minScaleRef.current,
      Math.min(maxScaleRef.current, proj.scale() * factor)
    )
    proj.scale(newScale)
    scaleRef.current = newScale
    const pct = (newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current)
    setZoomLevel(Math.round(pct * 100))
  }, [])

  return (
    <main
      className="relative overflow-hidden select-none"
      style={{ height: 'calc(100vh - 56px)', background: '#04091a' }}
    >
      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="w-12 h-12 rounded-full border-2 border-[#4F8EF7]/20 border-t-[#4F8EF7] animate-spin mb-4" />
          <div className="text-white/40 text-sm">加载地球数据...</div>
        </div>
      )}

      {/* Globe canvas — always in DOM so dimensions are available */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* ── UI Overlays ─────────────────────────────────────────────────── */}
      {ready && (
        <>
          {/* Top hint */}
          <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="text-white/25 text-xs tracking-widest uppercase">
              拖拽旋转 · 滚轮缩放 · 点击城市查看详情
            </div>
          </div>

          {/* Zoom controls (right side) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={() => applyZoom(1.3)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Zoom track */}
            <div className="relative w-9 h-20 rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-150 rounded-xl"
                style={{ height: `${Math.max(4, zoomLevel)}%`, background: 'linear-gradient(to top, #4F8EF7, #5B5CF0)', opacity: 0.7 }}
              />
            </div>
            <button
              onClick={() => applyZoom(0.77)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="flex items-center gap-5 px-5 py-2.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FDE047', boxShadow: '0 0 8px #FDE047' }} />
                <span className="text-white/50 text-xs">已上线城市（点击）</span>
              </div>
              <div className="w-px h-3.5 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]/50" />
                <span className="text-white/30 text-xs">即将推出</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── City info panel (bottom sheet) ─────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-transform duration-400 ease-out"
        style={{
          transform: panelOpen ? 'translateY(0)' : 'translateY(110%)',
          zIndex: 40,
          transitionDuration: '350ms',
        }}
      >
        {selectedCity && (
          <div className="mx-3 mb-3 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(10,16,36,0.97)', border: '1px solid rgba(79,142,247,0.3)', backdropFilter: 'blur(24px)' }}>

            {/* Drag handle */}
            <button
              onClick={closePanel}
              className="w-full flex justify-center pt-3 pb-1"
              aria-label="关闭">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </button>

            <div className="px-5 pb-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedCity.name}</h2>
                  <div className="text-white/40 text-sm">{selectedCity.nameEn}</div>
                </div>
                {selectedCity.active && selectedCity.score !== undefined ? (
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono leading-none" style={{ color: '#4F8EF7' }}>
                      {selectedCity.score}
                    </div>
                    <div className="text-white/30 text-xs mt-0.5">综合指数 / 100</div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                    即将推出
                  </span>
                )}
              </div>

              {selectedCity.active ? (
                <>
                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="text-xs text-white/40 mb-1">买房所需</div>
                      <div className="text-2xl font-bold font-mono text-[#EF4444] leading-none">
                        {selectedCity.hpiYears}
                        <span className="text-sm text-white/30 ml-1 font-normal">年</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="text-xs text-white/40 mb-1">租金占收入</div>
                      <div className="text-2xl font-bold font-mono text-[#EF4444] leading-none">
                        {selectedCity.rpi}
                        <span className="text-sm text-white/30 ml-1 font-normal">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`/city/${selectedCity.id}`}
                      className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                      查看城市详情 →
                    </a>
                    <a
                      href="/ranking"
                      className="px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white text-center transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                      排行榜
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-white/30 text-sm mb-3">
                    正在收集 {selectedCity.nameEn} 的生活指数数据
                  </p>
                  <a
                    href="/subscribe"
                    className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                    订阅上线通知 →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
