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
  country?: 'CA' | 'US'
  score?: number; tai?: number; eoi?: number; eqi?: number
  hpiYears?: number
  rpi?: number
}

const CITIES: City[] = [
  { id: 'vancouver', name: 'Vancouver',   nameEn: 'Vancouver',   lat: 49.25,  lng: -123.12, active: true,  score: 70, tai: 72, eoi: 80, eqi: 90, hpiYears: 10.2, rpi: 43.6 },
  { id: 'toronto',   name: 'Toronto',     nameEn: 'Toronto',     lat: 43.65,  lng: -79.38,  active: true,  score: 70, tai: 68, eoi: 92, eqi: 75, hpiYears: 9.6,  rpi: 41.2 },
  { id: 'calgary',   name: 'Calgary',     nameEn: 'Calgary',     lat: 51.05,  lng: -114.07, active: true,  score: 72, tai: 90, eoi: 65, eqi: 82, hpiYears: 3.9,  rpi: 24.1 },
  { id: 'montreal',  name: 'Montréal',    nameEn: 'Montréal',    lat: 45.50,  lng: -73.57,  active: true,  score: 75, tai: 42, eoi: 72, eqi: 78, hpiYears: 5.5,  rpi: 30.2 },
  { id: 'ottawa',    name: 'Ottawa',      nameEn: 'Ottawa',      lat: 45.42,  lng: -75.69,  active: true,  score: 73, tai: 68, eoi: 75, eqi: 80, hpiYears: 6.8,  rpi: 28.4 },
  { id: 'new-york',   name: 'New York City', nameEn: 'New York City', lat: 40.71, lng: -74.01,  active: true,  country: 'US', score: 68, tai: 30, eoi: 92, eqi: 62, hpiYears: 14.8, rpi: 29.2 },
  { id: 'san-francisco', name: 'San Francisco', nameEn: 'San Francisco', lat: 37.77, lng: -122.42, active: true, country: 'US', score: 65, tai: 35, eoi: 95, eqi: 70, hpiYears: 15.6, rpi: 27.6 },
  { id: 'seattle',   name: 'Seattle',     nameEn: 'Seattle',     lat: 47.61,  lng: -122.33, active: true,  country: 'US', score: 75, tai: 95, eoi: 88, eqi: 78, hpiYears: 8.8,  rpi: 21.3 },
  { id: 'boston',    name: 'Boston',      nameEn: 'Boston',      lat: 42.36,  lng: -71.06,  active: true,  country: 'US', score: 72, tai: 60, eoi: 85, eqi: 75, hpiYears: 11.8, rpi: 24.4 },
  { id: 'london',    name: 'London',      nameEn: 'London',      lat: 51.51,  lng: -0.13,   active: false },
  { id: 'tokyo',     name: 'Tokyo',       nameEn: 'Tokyo',       lat: 35.68,  lng: 139.69,  active: false },
  { id: 'sydney',    name: 'Sydney',      nameEn: 'Sydney',      lat: -33.87, lng: 151.21,  active: false },
  { id: 'melbourne', name: 'Melbourne',   nameEn: 'Melbourne',   lat: -37.81, lng: 144.96,  active: false },
  { id: 'singapore', name: 'Singapore',   nameEn: 'Singapore',   lat: 1.35,   lng: 103.82,  active: false },
  { id: 'shanghai',  name: 'Shanghai',    nameEn: 'Shanghai',    lat: 31.23,  lng: 121.47,  active: false },
  { id: 'beijing',   name: 'Beijing',     nameEn: 'Beijing',     lat: 39.91,  lng: 116.39,  active: false },
  { id: 'paris',     name: 'Paris',       nameEn: 'Paris',       lat: 48.85,  lng: 2.35,    active: false },
  { id: 'berlin',    name: 'Berlin',      nameEn: 'Berlin',      lat: 52.52,  lng: 13.40,   active: false },
  { id: 'amsterdam', name: 'Amsterdam',   nameEn: 'Amsterdam',   lat: 52.37,  lng: 4.90,    active: false },
  { id: 'zurich',    name: 'Zürich',      nameEn: 'Zürich',      lat: 47.38,  lng: 8.54,    active: false },
  { id: 'dubai',     name: 'Dubai',       nameEn: 'Dubai',       lat: 25.20,  lng: 55.27,   active: false },
  { id: 'seoul',     name: 'Seoul',       nameEn: 'Seoul',       lat: 37.57,  lng: 126.98,  active: false },
  { id: 'hongkong',  name: 'Hong Kong',   nameEn: 'Hong Kong',   lat: 22.32,  lng: 114.16,  active: false },
  { id: 'taipei',    name: 'Taipei',      nameEn: 'Taipei',      lat: 25.05,  lng: 121.53,  active: false },
  { id: 'losangeles',name: 'Los Angeles', nameEn: 'Los Angeles', lat: 34.05,  lng: -118.24, active: false },
  { id: 'chicago',   name: 'Chicago',     nameEn: 'Chicago',     lat: 41.88,  lng: -87.63,  active: false },
  { id: 'miami',     name: 'Miami',       nameEn: 'Miami',       lat: 25.77,  lng: -80.19,  active: false },
  { id: 'auckland',  name: 'Auckland',    nameEn: 'Auckland',    lat: -36.85, lng: 174.76,  active: false },
  { id: 'dublin',    name: 'Dublin',      nameEn: 'Dublin',      lat: 53.34,  lng: -6.27,   active: false },
  { id: 'stockholm', name: 'Stockholm',   nameEn: 'Stockholm',   lat: 59.33,  lng: 18.07,   active: false },
  { id: 'nairobi',   name: 'Nairobi',     nameEn: 'Nairobi',     lat: -1.29,  lng: 36.82,   active: false },
  { id: 'mexico',    name: 'Mexico City', nameEn: 'Mexico City', lat: 19.43,  lng: -99.13,  active: false },
  { id: 'saopaulo',  name: 'São Paulo',   nameEn: 'São Paulo',   lat: -23.55, lng: -46.63,  active: false },
]

// ── Static data: City Insights ───────────────────────────────────────────────
const INSIGHTS = [
  {
    id: 1,
    tag: 'Housing',
    tagColor: '#EF4444',
    stat: '3.3x',
    title: 'Electricians buy homes 3x faster in Calgary than Vancouver',
    detail: 'Calgary: 3.9 income years vs Vancouver: 13.0 income years (2BR condo)',
    href: '/compare?cities=calgary,vancouver&occupation=electrician',
  },
  {
    id: 2,
    tag: 'Tax',
    tagColor: '#10B981',
    stat: '$22,000',
    title: 'Engineers save $22K/yr in taxes by moving to Alberta',
    detail: 'At $120K salary, Alberta has no PST and only 5% GST — the lowest tax burden in Canada',
    href: '/city/calgary',
  },
  {
    id: 3,
    tag: 'Income',
    tagColor: '#F59E0B',
    stat: '#2',
    title: 'Toronto software engineers face the 2nd highest housing pressure in Canada',
    detail: 'Highest salaries nationally, but price-to-income ratio second only to Vancouver',
    href: '/city/toronto',
  },
]

// ── Static data: Popular Comparisons ────────────────────────────────────────
const HOT_COMPARISONS = [
  {
    occupation: 'Electrician',
    cityA: { name: 'Vancouver', id: 'vancouver', years: 13.0, color: '#EF4444' },
    cityB: { name: 'Calgary',   id: 'calgary',   years: 3.9,  color: '#10B981' },
  },
  {
    occupation: 'Registered Nurse',
    cityA: { name: 'Toronto', id: 'toronto', years: 12.0, color: '#EF4444' },
    cityB: { name: 'Ottawa',  id: 'ottawa',  years: 6.5,  color: '#F59E0B' },
  },
  {
    occupation: 'Software Engineer',
    cityA: { name: 'Vancouver', id: 'vancouver', years: 9.5, color: '#F59E0B' },
    cityB: { name: 'Calgary',   id: 'calgary',   years: 5.2, color: '#10B981' },
  },
]

// ── Occupations for hero selector ────────────────────────────────────────────
const OCCUPATIONS = [
  // Healthcare
  { id: 'nurse',            name: 'Registered Nurse' },
  { id: 'doctor',           name: 'Family Physician' },
  { id: 'pharmacist',       name: 'Pharmacist' },
  { id: 'dentist',          name: 'Dentist' },
  { id: 'social_worker',    name: 'Social Worker' },
  // Tech
  { id: 'software_eng',     name: 'Software Engineer' },
  { id: 'data_analyst',     name: 'Data Analyst' },
  { id: 'it_support',       name: 'IT Support' },
  // Trades
  { id: 'electrician',      name: 'Electrician' },
  { id: 'plumber',          name: 'Plumber' },
  { id: 'carpenter',        name: 'Carpenter' },
  { id: 'welder',           name: 'Welder' },
  { id: 'mechanic',         name: 'Auto Mechanic' },
  { id: 'construction_worker', name: 'Construction Worker' },
  // Professional
  { id: 'engineer',         name: 'Civil Engineer' },
  { id: 'lawyer',           name: 'Lawyer' },
  { id: 'accountant',       name: 'Accountant' },
  { id: 'financial_advisor',name: 'Financial Advisor' },
  { id: 'real_estate',      name: 'Real Estate Agent' },
  { id: 'marketing',        name: 'Marketing Specialist' },
  { id: 'hr',               name: 'HR Specialist' },
  // Public Service
  { id: 'teacher',          name: 'Secondary Teacher' },
  { id: 'firefighter',      name: 'Firefighter' },
  { id: 'police',           name: 'Police Officer' },
  // Transport & Logistics
  { id: 'truck_driver',     name: 'Truck Driver' },
  { id: 'pilot',            name: 'Commercial Pilot' },
  // Service
  { id: 'chef',             name: 'Chef' },
  { id: 'retail',           name: 'Retail Associate' },
  { id: 'security',         name: 'Security Guard' },
  { id: 'cleaner',          name: 'Cleaner' },
]

const ACTIVE_CITIES    = CITIES.filter(c => c.active)
const ACTIVE_CITIES_CA = CITIES.filter(c => c.active && c.country !== 'US')

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
            <div className="text-white/40 text-sm">Loading...</div>
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
                5 Canadian Cities · Expanding Soon
              </div>

              {/* H1 */}
              <h1 className="text-3xl font-bold leading-snug mb-3" style={{ color: '#fff' }}>
                From data<br />
                to <span style={{ color: '#14B8A6' }}>belonging.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.60)' }}>
                City intelligence for your next chapter — built on career, tax, housing, and opportunity.
              </p>

              {/* Selectors */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Your Occupation</label>
                  <select
                    value={heroOccupation}
                    onChange={e => setHeroOccupation(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: '#0d1f44', color: 'rgba(255,255,255,0.4)' }}>Select occupation...</option>
                    {OCCUPATIONS.map(o => (
                      <option key={o.id} value={o.id} style={{ background: '#0d1f44', color: 'white' }}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>City you&apos;re considering</label>
                  <select
                    value={heroCity}
                    onChange={e => setHeroCity(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" style={{ background: '#0d1f44', color: 'rgba(255,255,255,0.4)' }}>Select city...</option>
                    {ACTIVE_CITIES_CA.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#0d1f44', color: 'white' }}>{c.nameEn}</option>
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
                View My City Fit Score →
              </button>

              {/* Quick links */}
              <div className="flex items-center gap-3 mt-4">
                <a href="/ranking"   className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>Rankings</a>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                <a href="/compare"   className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>Compare</a>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                <a href="/calculate" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>Calculate</a>
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
                <span className="text-white/70 text-xs">Live cities (tap to explore)</span>
              </div>
              <div className="w-px h-3.5 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]/50" />
                <span className="text-white/50 text-xs">Coming soon</span>
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
              <button onClick={closePanel} className="w-full flex justify-center pt-3 pb-1" aria-label="Close">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </button>
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedCity.nameEn}</h2>
                    <div className="text-white/40 text-sm">Canada</div>
                  </div>
                  {selectedCity.active && selectedCity.score !== undefined ? (
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono leading-none" style={{ color: '#4F8EF7' }}>{selectedCity.score}</div>
                      <div className="text-white/55 text-xs mt-0.5">City Fit Score / 100</div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>Coming Soon</span>
                  )}
                </div>
                {selectedCity.active ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'Environment', value: selectedCity.eqi, color: '#10B981' },
                        { label: 'Tax Friendly', value: selectedCity.tai, color: '#4F8EF7' },
                        { label: 'Employment',   value: selectedCity.eoi, color: '#F59E0B' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
                          <div className="text-xl font-bold font-mono leading-none" style={{ color }}>
                            {value}<span className="text-xs font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={selectedCity.country === 'US' ? `/guide/software-engineer/${selectedCity.id}` : `/city/${selectedCity.id}`}
                        className="flex-1 py-3 rounded-xl text-white text-sm font-semibold text-center"
                        style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                        {selectedCity.country === 'US' ? 'Explore City Guides →' : 'View City Details →'}
                      </a>
                      <a href="/ranking"
                        className="px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white text-center transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                        Rankings
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-white/30 text-sm mb-3">We&apos;re collecting data for {selectedCity.nameEn}</p>
                    <a href="/subscribe"
                      className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #5B5CF0)' }}>
                      Notify Me When Live →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 2: City Insights ──────────────────────────────────────── */}
      <section style={{ background: '#070d1f', padding: '64px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: '#4F8EF7' }} />
            <h2 className="text-xl font-bold text-white">City Insights</h2>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Data-driven urban intelligence</span>
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
                  Learn more <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Popular Comparisons ───────────────────────────────── */}
      <section style={{ background: '#04091a', padding: '64px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full" style={{ background: '#FDE047' }} />
            <h2 className="text-xl font-bold text-white">Popular Comparisons</h2>
          </div>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.50)', paddingLeft: '16px' }}>
            Your career shapes your city experience — measured in years to own a home
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
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>yrs income</span>
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
                  {cmp.cityA.name} takes <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{(cmp.cityA.years / cmp.cityB.years).toFixed(1)}x</strong> longer than {cmp.cityB.name}
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  View full comparison <span>→</span>
                </div>
              </a>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-8 flex justify-center">
            <a href="/ranking"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)', color: '#93C5FD' }}>
              View full rankings →
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
