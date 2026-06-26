'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
  { id: 'vancouver', name: '温哥华', nameEn: 'Vancouver',   lat: 49.25,  lng: -123.12, active: true,  score: 70, hpiYears: 10.2, rpi: 43.6 },
  { id: 'toronto',   name: '多伦多', nameEn: 'Toronto',     lat: 43.65,  lng: -79.38,  active: true,  score: 70, hpiYears: 9.6,  rpi: 41.2 },
  { id: 'calgary',   name: '卡尔加里', nameEn: 'Calgary',   lat: 51.05,  lng: -114.07, active: true,  score: 72, hpiYears: 3.9,  rpi: 24.1 },
  { id: 'montreal',  name: '蒙特利尔', nameEn: 'Montréal',  lat: 45.50,  lng: -73.57,  active: true,  score: 75, hpiYears: 5.5,  rpi: 30.2 },
  { id: 'ottawa',    name: '渥太华', nameEn: 'Ottawa',      lat: 45.42,  lng: -75.69,  active: true,  score: 73, hpiYears: 6.8,  rpi: 28.4 },
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

// ── Static data: 今日发现 ────────────────────────────────────────────────────
const INSIGHTS = [
  {
    id: 1,
    tag: '买房',
    tagColor: '#EF4444',
    stat: '3.3x',
    title: '电工在卡尔加里买房比温哥华快',
    detail: '卡尔加里 3.9年收入 vs 温哥华 13.0年收入（2居室公寓）',
    href: '/compare?cities=calgary,vancouver&occupation=electrician',
  },
  {
    id: 2,
    tag: '税收',
    tagColor: '#10B981',
    stat: '$22,000',
    title: '工程师移居AB省每年少交税',
    detail: '年薪$120K，AB省无PST、仅GST 5%，综合税负全国最低',
    href: '/city/calgary',
  },
  {
    id: 3,
    tag: '收入',
    tagColor: '#F59E0B',
    stat: '#2',
    title: '多伦多软件工程师买房压力全国第二高',
    detail: '收入全国最高，但房价收入比仅次于温哥华',
    href: '/city/toronto',
  },
]

// ── Static data: 热门对比 ────────────────────────────────────────────────────
const HOT_COMPARISONS = [
  {
    occupation: '电工',
    occupationEn: 'Electrician',
    cityA: { name: '温哥华', id: 'vancouver', years: 13.0, color: '#EF4444' },
    cityB: { name: '卡尔加里', id: 'calgary',  years: 3.9,  color: '#10B981' },
  },
  {
    occupation: '注册护士',
    occupationEn: 'Registered Nurse',
    cityA: { name: '多伦多', id: 'toronto', years: 12.0, color: '#EF4444' },
    cityB: { name: '渥太华', id: 'ottawa',  years: 6.5,  color: '#F59E0B' },
  },
  {
    occupation: '软件工程师',
    occupationEn: 'Software Engineer',
    cityA: { name: '温哥华', id: 'vancouver', years: 9.5, color: '#F59E0B' },
    cityB: { name: '卡尔加里', id: 'calgary',  years: 5.2, color: '#10B981' },
  },
]

// ── Occupations for hero selector ────────────────────────────────────────────
const OCCUPATIONS = [
  { id: 'software_eng', name: '软件工程师' },
  { id: 'electrician',  name: '电工' },
  { id: 'nurse',        name: '注册护士' },
  { id: 'teacher',      name: '中学教师' },
  { id: 'accountant',   name: '会计师' },
  { id: 'truck_driver', name: '卡车司机' },
  { id: 'police',       name: '警察' },
  { id: 'retail',       name: '零售店员' },
]

const ACTIVE_CITIES = CITIES.filter(c => c.active)

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
  const router = useRouter()

  // ── Globe refs ──────────────────────────────────────────────────────────────
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rotRef       = useRef<[number, number]>([-100, -30])
  const scaleRef     = useRef(0)
  const minScaleRef  = useRef(0)
  const maxScaleRef  = useRef(0)
  const projRef      = useRef<any>(null)
  const dragging     = useRef(false)
  const pointerStart = useRef<[number, number]>([0, 0])
  const lastPos      = useRef<[number, number]>([0, 0])
  const autoRotate   = useRef(true)
  const animFrame    = useRef(0)
  const worldData    = useRef<any>(null)
  const pulseT       = useRef(0)
  const pinchDist    = useRef(0)

  const [ready,        setReady]        = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [zoomLevel,    setZoomLevel]    = useState(0)

  // ── Hero selector state ─────────────────────────────────────────────────────
  const [heroOccupation, setHeroOccupation] = useState('')
  const [heroCity,       setHeroCity]       = useState('')

  const openCity = useCallback((city: City) => {
    setSelectedCity(city)
    setPanelOpen(true)
    autoRotate.current = false
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    autoRotate.current = true
  }, [])

  const handleHeroGo = useCallback(() => {
    router.push(`/calculate?city=${heroCity}&occupation=${heroOccupation}`)
  }, [heroCity, heroOccupation, router])

  // ── Load D3 + TopoJSON ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js'),
    ])
      .then(() => fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(r => r.json()))
      .then(data => { worldData.current = data; setReady(true) })
      .catch(console.error)
  }, [])

  // ── Globe renderer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !canvasRef.current) return
    const canvas = canvasRef.current
    const d3       = window.d3
    const topojson = window.topojson
    const dpr = window.devicePixelRatio || 1

    const NAV_H = 56
    const W = window.innerWidth
    const H = window.innerHeight - NAV_H
    canvas.width  = W * dpr
    canvas.height = H * dpr
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const baseR = Math.min(W, H) * 0.40
    const cx    = W / 2
    const cy    = H / 2
    minScaleRef.current = baseR * 0.75
    maxScaleRef.current = baseR * 5
    if (scaleRef.current === 0) scaleRef.current = baseR

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([cx, cy])
      .clipAngle(90)
      .rotate(rotRef.current)
    projRef.current = projection

    const path      = d3.geoPath(projection, ctx)
    const land      = topojson.feature(worldData.current, worldData.current.objects.land)
    const graticule = d3.geoGraticule()()

    function draw() {
      ctx.clearRect(0, 0, W, H)
      pulseT.current += 0.04
      const r = projection.scale()

      // Ocean
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

      // Atmosphere
      projection.clipAngle(180)
      ctx.beginPath(); path({ type: 'Sphere' })
      const atm = ctx.createRadialGradient(cx, cy, r * 0.93, cx, cy, r * 1.08)
      atm.addColorStop(0,   'rgba(79,142,247,0.00)')
      atm.addColorStop(0.4, 'rgba(79,142,247,0.18)')
      atm.addColorStop(1,   'rgba(79,142,247,0.00)')
      ctx.strokeStyle = atm; ctx.lineWidth = r * 0.15; ctx.stroke()
      projection.clipAngle(90)

      // Cities
      CITIES.forEach(city => {
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

          const pR = 10 + pulse * 8
          const ringGrad = ctx.createRadialGradient(x, y, 0, x, y, pR)
          ringGrad.addColorStop(0, `rgba(253,212,36,${0.35 * pulse})`)
          ringGrad.addColorStop(1, 'rgba(253,212,36,0)')
          ctx.beginPath(); ctx.arc(x, y, pR, 0, Math.PI * 2)
          ctx.fillStyle = ringGrad; ctx.fill()

          const gGrad = ctx.createRadialGradient(x, y, 0, x, y, 10)
          gGrad.addColorStop(0, 'rgba(255,230,80,0.7)')
          gGrad.addColorStop(1, 'rgba(251,191,36,0)')
          ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.fillStyle = gGrad; ctx.fill()

          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = '#FDE047'; ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.stroke()

          // Name label
          if (r > baseR * 0.85) {
            ctx.save()
            ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 6
            ctx.font = `bold ${Math.max(8, Math.min(11, r / baseR * 9))}px -apple-system,system-ui,sans-serif`
            ctx.textAlign = 'center'
            ctx.fillStyle = 'rgba(255,255,255,0.92)'
            ctx.fillText(city.nameEn, x, y - 18)
            ctx.restore()
          }

          // Data bubble: show buy years on top of city dot
          if (r > baseR * 1.0 && city.hpiYears !== undefined) {
            const bw = 58, bh = 22, bx = x - bw / 2, by = y - 48
            ctx.save()
            ctx.beginPath()
            const br = 6
            ctx.moveTo(bx + br, by)
            ctx.lineTo(bx + bw - br, by)
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
            ctx.lineTo(bx + bw, by + bh - br)
            ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
            ctx.lineTo(bx + br, by + bh)
            ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
            ctx.lineTo(bx, by + br)
            ctx.quadraticCurveTo(bx, by, bx + br, by)
            ctx.closePath()
            ctx.fillStyle = 'rgba(10,16,36,0.88)'
            ctx.strokeStyle = 'rgba(79,142,247,0.5)'
            ctx.lineWidth = 1
            ctx.fill(); ctx.stroke()
            ctx.font = `bold 10px -apple-system,system-ui,sans-serif`
            ctx.textAlign = 'center'
            ctx.fillStyle = '#EF4444'
            ctx.fillText(`🏠 ${city.hpiYears}年收入`, bx + bw / 2, by + 14)
            ctx.restore()
          }
        } else {
          const opacity = Math.max(0.25, 0.6 - dist * 0.5)
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(147,197,253,${opacity})`; ctx.fill()
        }
      })
    }

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

    // ── Events ────────────────────────────────────────────────────────────────
    function getXY(e: PointerEvent): [number, number] {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    function onPointerDown(e: PointerEvent) {
      dragging.current = true; autoRotate.current = false
      const [x, y] = getXY(e)
      pointerStart.current = [x, y]; lastPos.current = [x, y]
      canvas.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return
      const [x, y] = getXY(e)
      const dx = x - lastPos.current[0], dy = y - lastPos.current[1]
      lastPos.current = [x, y]
      const sensitivity = 250 / projection.scale()
      const rot = projection.rotate()
      const newRot: [number, number] = [rot[0] + dx * sensitivity, Math.max(-80, Math.min(80, rot[1] - dy * sensitivity))]
      projection.rotate(newRot); rotRef.current = newRot
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return
      dragging.current = false
      const [x, y] = getXY(e)
      const moved = Math.hypot(x - pointerStart.current[0], y - pointerStart.current[1])
      if (moved < 8) {
        const rect = canvas.getBoundingClientRect()
        handleClick(e.clientX - rect.left, e.clientY - rect.top)
      }
    }

    function handleClick(mx: number, my: number) {
      let closest: City | null = null
      let closestDist = Infinity
      const hitR = Math.max(18, 32 / (projection.scale() / baseR))
      CITIES.forEach(city => {
        const dist = d3.geoDistance([city.lng, city.lat], [-projection.rotate()[0], -projection.rotate()[1]])
        if (dist >= Math.PI / 2) return
        const pos = projection([city.lng, city.lat])
        if (!pos) return
        const [x, y] = pos
        const d = Math.hypot(mx - x, my - y)
        const threshold = city.active ? hitR : hitR * 0.5
        if (d < threshold && d < closestDist) { closestDist = d; closest = city }
      })
      if (closest) openCity(closest)
      else closePanel()
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 0.89
      const newScale = Math.max(minScaleRef.current, Math.min(maxScaleRef.current, projection.scale() * factor))
      projection.scale(newScale); scaleRef.current = newScale
      setZoomLevel(Math.round((newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current) * 100))
    }

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
      for (const t of Array.from(e.changedTouches)) activeTouches.set(t.identifier, [t.clientX - rect.left, t.clientY - rect.top])
      if (activeTouches.size === 2 && pinchDist.current > 0) {
        const pts = Array.from(activeTouches.values())
        const newDist = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
        const factor = newDist / pinchDist.current; pinchDist.current = newDist
        const newScale = Math.max(minScaleRef.current, Math.min(maxScaleRef.current, projection.scale() * factor))
        projection.scale(newScale); scaleRef.current = newScale
        setZoomLevel(Math.round((newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current) * 100))
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

  const applyZoom = useCallback((factor: number) => {
    const proj = projRef.current; if (!proj) return
    const newScale = Math.max(minScaleRef.current, Math.min(maxScaleRef.current, proj.scale() * factor))
    proj.scale(newScale); scaleRef.current = newScale
    setZoomLevel(Math.round((newScale - minScaleRef.current) / (maxScaleRef.current - minScaleRef.current) * 100))
  }, [])

  // ── Select styles (shared) ─────────────────────────────────────────────────
  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: 'white',
    padding: '10px 14px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23ffffff60' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
    cursor: 'pointer',
  }

  return (
    <div style={{ background: '#04091a' }}>

      {/* ── SECTION 1: Globe + Hero ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden select-none"
        style={{ height: 'calc(100vh - 56px)', background: '#04091a' }}
      >
        {/* Loading */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 rounded-full border-2 border-[#4F8EF7]/20 border-t-[#4F8EF7] animate-spin mb-4" />
            <div className="text-white/40 text-sm">加载地球数据...</div>
          </div>
        )}

        {/* Globe canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'grab' }} />

        {/* ── Hero Panel (left overlay) ──────────────────────────────────── */}
        {ready && (
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none"
            style={{ width: 'min(420px, 90vw)', zIndex: 10 }}
          >
            {/* Gradient fade */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(4,9,26,0.97) 65%, rgba(4,9,26,0))',
                backdropFilter: 'blur(1px)',
              }}
            />

            <div className="relative z-10 px-8 py-8 w-full pointer-events-auto">

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.3)', color: '#93C5FD' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
                加拿大五大城市 · 持续扩展中
              </div>

              {/* H1 */}
              <h1 className="text-3xl font-bold leading-snug mb-3" style={{ color: '#fff' }}>
                From data<br />
                to <span style={{ color: '#14B8A6' }}>belonging.</span>
              </h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', letterSpacing:'0.06em', marginBottom:0, marginTop:-14, fontWeight:500 }}>
                从数据，到归属
              </p>

              {/* Subtitle */}
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.60)' }}>
                城市数据智能平台——基于职业、税负、住房与就业，<br />帮你找到真正适合自己的城市
              </p>

              {/* Selectors */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>我的职业</label>
                  <select
                    value={heroOccupation}
                    onChange={e => setHeroOccupation(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: '#0d1f44', color: 'rgba(255,255,255,0.4)' }}>选择职业...</option>
                    {OCCUPATIONS.map(o => (
                      <option key={o.id} value={o.id} style={{ background: '#0d1f44', color: 'white' }}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>考虑的城市</label>
                  <select
                    value={heroCity}
                    onChange={e => setHeroCity(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: '#0d1f44', color: 'rgba(255,255,255,0.4)' }}>选择城市...</option>
                    {ACTIVE_CITIES.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0d1f44', color: 'white' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleHeroGo}
                disabled={!heroOccupation || !heroCity}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-75"
                style={{ background: heroOccupation && heroCity ? 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' : 'rgba(255,255,255,0.10)', cursor: heroOccupation && heroCity ? 'pointer' : 'not-allowed' }}
              >
                查看城市适配分 →
              </button>

              {/* Quick links */}
              <div className="flex items-center gap-3 mt-4">
                <a href="/ranking"  className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>排行榜</a>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                <a href="/compare"  className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>城市对比</a>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                <a href="/calculate" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>算成本</a>
              </div>
            </div>
          </div>
        )}

        {/* Zoom controls */}
        {ready && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2" style={{ zIndex: 10 }}>
            <button onClick={() => applyZoom(1.3)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="relative w-9 h-20 rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="absolute bottom-0 left-0 right-0 transition-all duration-150 rounded-xl"
                style={{ height: `${Math.max(4, zoomLevel)}%`, background: 'linear-gradient(to top, #4F8EF7, #5B5CF0)', opacity: 0.7 }} />
            </div>
            <button onClick={() => applyZoom(0.77)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Legend */}
        {ready && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 10 }}>
            <div className="flex items-center gap-5 px-5 py-2.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FDE047', boxShadow: '0 0 8px #FDE047' }} />
                <span className="text-white/70 text-xs">已上线城市（点击）</span>
              </div>
              <div className="w-px h-3.5 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]/50" />
                <span className="text-white/50 text-xs">即将推出</span>
              </div>
            </div>
          </div>
        )}

        {/* City info panel */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-transform duration-400 ease-out"
          style={{ transform: panelOpen ? 'translateY(0)' : 'translateY(110%)', zIndex: 40, transitionDuration: '350ms' }}
        >
          {selectedCity && (
            <div className="mx-3 mb-3 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(10,16,36,0.97)', border: '1px solid rgba(79,142,247,0.3)', backdropFilter: 'blur(24px)' }}>
              <button onClick={closePanel} className="w-full flex justify-center pt-3 pb-1" aria-label="关闭">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </button>
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedCity.name}</h2>
                    <div className="text-white/40 text-sm">{selectedCity.nameEn}</div>
                  </div>
                  {selectedCity.active && selectedCity.score !== undefined ? (
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono leading-none" style={{ color: '#4F8EF7' }}>{selectedCity.score}</div>
                      <div className="text-white/55 text-xs mt-0.5">综合指数 / 100</div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>即将推出</span>
                  )}
                </div>
                {selectedCity.active ? (
                  <>
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="text-xs text-white/60 mb-1">买房所需</div>
                        <div className="text-2xl font-bold font-mono text-[#EF4444] leading-none">
                          {selectedCity.hpiYears}<span className="text-sm text-white/30 ml-1 font-normal">年</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="text-xs text-white/60 mb-1">租金占收入</div>
                        <div className="text-2xl font-bold font-mono text-[#EF4444] leading-none">
                          {selectedCity.rpi}<span className="text-sm text-white/30 ml-1 font-normal">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/city/${selectedCity.id}`}
                        className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
                        style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                        查看城市详情 →
                      </a>
                      <a href="/ranking"
                        className="px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white text-center transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                        排行榜
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-white/30 text-sm mb-3">正在收集 {selectedCity.nameEn} 的生活指数数据</p>
                    <a href="/subscribe"
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
      </section>

      {/* ── SECTION 2: 今日发现 ───────────────────────────────────────────── */}
      <section style={{ background: '#070d1f', padding: '64px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: '#4F8EF7' }} />
            <h2 className="text-xl font-bold text-white">今日发现</h2>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>数据驱动的城市洞察</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INSIGHTS.map(ins => (
              <a key={ins.id} href={ins.href}
                className="group block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Tag */}
                <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: `${ins.tagColor}18`, color: ins.tagColor, border: `1px solid ${ins.tagColor}30` }}>
                  {ins.tag}
                </div>

                {/* Stat */}
                <div className="text-4xl font-black mb-2 font-mono" style={{ color: ins.tagColor }}>
                  {ins.stat}
                </div>

                {/* Title */}
                <p className="text-sm font-semibold mb-2 text-white leading-snug">{ins.title}</p>

                {/* Detail */}
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{ins.detail}</p>

                {/* Arrow */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  了解更多 <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: 热门对比 ───────────────────────────────────────────── */}
      <section style={{ background: '#04091a', padding: '64px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ background: '#FDE047' }} />
            <h2 className="text-xl font-bold text-white">热门对比</h2>
          </div>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.50)', paddingLeft: '16px' }}>
            职业决定城市体验 — 以买房年数为例
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOT_COMPARISONS.map((cmp, i) => (
              <a key={i}
                href={`/compare?cities=${cmp.cityA.id},${cmp.cityB.id}`}
                className="group block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Occupation tag */}
                <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(253,224,71,0.12)', color: '#FDE047', border: '1px solid rgba(253,224,71,0.25)' }}>
                  {cmp.occupation}
                </div>

                {/* Cities comparison */}
                <div className="space-y-3 mb-4">
                  {[cmp.cityA, cmp.cityB].map(city => (
                    <div key={city.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: city.color }} />
                        <span className="text-sm font-medium text-white">{city.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono" style={{ color: city.color }}>{city.years}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>年收入</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Diff bar */}
                <div className="relative h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="absolute left-0 top-0 h-full rounded-full" style={{
                    width: `${(cmp.cityB.years / cmp.cityA.years) * 100}%`,
                    background: `linear-gradient(to right, ${cmp.cityB.color}, ${cmp.cityA.color})`,
                  }} />
                </div>

                <div className="text-xs group-hover:opacity-80" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {cmp.cityA.name}买房耗时是{cmp.cityB.name}的 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{(cmp.cityA.years / cmp.cityB.years).toFixed(1)}x</strong>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  查看完整对比 <span>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-8 flex justify-center">
            <a href="/ranking"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)', color: '#93C5FD' }}>
              查看完整排行榜 →
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
