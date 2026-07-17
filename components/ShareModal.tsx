'use client'
import { useState, useEffect } from 'react'
import type { IncomeDisplay } from '@/lib/types/share'

export interface ShareTarget {
  occupationId:   string
  occupationName: string
  housingType:    string
  incomeValue:    number
  cityResults: {
    cityId:    string
    cityName:  string
    province:  string
    hpiYears:  number
    rpi:       number
    score:     number
  }[]
}

interface Props {
  open:      boolean
  onClose:   () => void
  shareData: ShareTarget
}

const PROP_LABELS: Record<string, string> = {
  '1br': '1-Bedroom Apt', '2br': '2-Bedroom Apt', '3br': '3-Bedroom Apt',
  'townhouse': 'Townhouse', 'detached': 'Detached House',
}

function toIncomeRange(income: number): string {
  const lo = Math.floor(income / 10000) * 10
  return `$${lo}K–$${lo + 10}K`
}

function scoreColor(s: number): string {
  if (s >= 80) return '#14B8A6'
  if (s >= 70) return '#60A5FA'
  if (s >= 55) return '#F59E0B'
  if (s >= 40) return '#E86C2F'
  return '#EF4444'
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Lower Pressure'
  if (s >= 70) return 'Manageable'
  if (s >= 55) return 'Under Pressure'
  if (s >= 40) return 'Difficult'
  return 'Severe'
}

// ── rounded rect helper ────────────────────────────────────────────────────────
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.lineTo(x + w - r, y)
  c.quadraticCurveTo(x + w, y, x + w, y + r)
  c.lineTo(x + w, y + h - r)
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  c.lineTo(x + r, y + h)
  c.quadraticCurveTo(x, y + h, x, y + h - r)
  c.lineTo(x, y + r)
  c.quadraticCurveTo(x, y, x + r, y)
  c.closePath()
}

// ── Canvas image generator (async — loads real logo) ──────────────────────────
async function generateImage(shareData: ShareTarget, incomeDisplay: IncomeDisplay): Promise<string> {
  const W = 1200, H = 630
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!
  const P = 60

  const F = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Arial, sans-serif'

  // ── Background ──────────────────────────────────────────────────────────────
  const bg = c.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0,    '#0d1117')
  bg.addColorStop(0.55, '#111827')
  bg.addColorStop(1,    '#0e1a2e')
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)

  // Subtle top accent strip
  const accent = c.createLinearGradient(0, 0, W, 0)
  accent.addColorStop(0, 'rgba(20,184,166,0.6)')
  accent.addColorStop(0.5, 'rgba(79,142,247,0.4)')
  accent.addColorStop(1, 'rgba(20,184,166,0.1)')
  c.fillStyle = accent
  c.fillRect(0, 0, W, 3)

  // ── Header ─────────────────────────────────────────────────────────────────
  // Try loading the real logo
  let logoLoaded = false
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej()
      img.src = '/lakive-logo.png'
    })
    // Logo is light on transparent — draw it tinted teal on dark bg
    // Draw at ~32px tall
    const logoH = 32
    const logoW = Math.round(img.naturalWidth / img.naturalHeight * logoH)
    c.drawImage(img, P, 36, logoW, logoH)
    logoLoaded = true

    // Divider after logo
    c.fillStyle = 'rgba(255,255,255,0.14)'
    c.fillRect(P + logoW + 16, 40, 1, 20)

    c.font = `600 11px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.32)'
    c.fillText('CITY FIT ENGINE', P + logoW + 32, 56)
  } catch {
    // Fallback: render text logo
    c.font = `900 24px ${F}`
    c.fillStyle = '#14B8A6'
    c.fillText('Lakive', P, 60)
    const lw = c.measureText('Lakive').width
    c.fillStyle = 'rgba(255,255,255,0.14)'
    c.fillRect(P + lw + 14, 44, 1, 18)
    c.font = `600 11px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.32)'
    c.fillText('CITY FIT ENGINE', P + lw + 28, 58)
  }

  c.font = `400 11px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.20)'
  c.textAlign = 'right'
  c.fillText('Data: 2026-H1', W - P, 56)
  c.textAlign = 'left'

  // ── Occupation + housing type ───────────────────────────────────────────────
  const prop = PROP_LABELS[shareData.housingType] ?? shareData.housingType

  c.font = `900 42px ${F}`
  c.fillStyle = '#ffffff'
  const occW = c.measureText(shareData.occupationName).width
  c.fillText(shareData.occupationName, P, 140)

  c.font = `300 26px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.30)'
  c.fillText('  ·  ' + prop, P + occW, 140)

  // Income line
  let incomeLine = ''
  if (incomeDisplay === 'range' && shareData.incomeValue)
    incomeLine = `Income: ${toIncomeRange(shareData.incomeValue)}`
  else if (incomeDisplay === 'exact' && shareData.incomeValue)
    incomeLine = `Income: $${shareData.incomeValue.toLocaleString()}`

  let titleBottom = 152
  if (incomeLine) {
    c.font = `400 14px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.38)'
    c.fillText(incomeLine, P, 168)
    titleBottom = 178
  }

  // Divider
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, titleBottom + 8, W - P * 2, 1)

  // ── City rows ───────────────────────────────────────────────────────────────
  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score).slice(0, 5)
  const maxScore = sorted[0]?.score ?? 99

  const ROWS_TOP    = titleBottom + 26
  const ROWS_BOTTOM = H - 68
  const ROW_H       = Math.floor((ROWS_BOTTOM - ROWS_TOP) / sorted.length)

  // Column layout
  const COL_RANK  = P + 13                // circle center x
  const COL_NAME  = P + 40               // city name start
  const COL_SCORE = W - P                // score right-aligns here
  const SCORE_RESERVED = 110             // px reserved for score + label
  const BAR_X     = COL_NAME + 178       // bar starts after city name
  const BAR_W     = COL_SCORE - SCORE_RESERVED - BAR_X - 16
  const BAR_H     = 10

  sorted.forEach((city, i) => {
    const mid = ROWS_TOP + i * ROW_H + Math.floor(ROW_H / 2)
    const isTop = i === 0
    const col   = scoreColor(city.score)

    // Subtle row highlight for #1
    if (isTop) {
      c.fillStyle = 'rgba(79,142,247,0.05)'
      rr(c, P - 16, ROWS_TOP + i * ROW_H + 4, W - P * 2 + 32, ROW_H - 8, 10)
      c.fill()
      c.strokeStyle = 'rgba(79,142,247,0.12)'
      c.lineWidth = 1
      c.stroke()
    }

    // Rank circle
    c.beginPath()
    c.arc(COL_RANK, mid, 13, 0, Math.PI * 2)
    c.fillStyle = isTop ? '#4F8EF7' : 'rgba(255,255,255,0.06)'
    c.fill()
    c.font = `700 11px ${F}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.45)'
    c.textAlign = 'center'
    c.fillText(String(i + 1), COL_RANK, mid + 4)
    c.textAlign = 'left'

    // City name
    c.font = `${isTop ? '700' : '500'} 18px ${F}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.70)'
    c.fillText(city.cityName, COL_NAME, mid - 2)

    // Province (below city name)
    c.font = `400 11px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.28)'
    c.fillText(city.province, COL_NAME, mid + 14)

    // Bar track
    c.fillStyle = 'rgba(255,255,255,0.05)'
    rr(c, BAR_X, mid - BAR_H / 2, BAR_W, BAR_H, BAR_H / 2)
    c.fill()

    // Bar fill
    const fill = Math.max(BAR_H, Math.round((city.score / maxScore) * BAR_W))
    c.fillStyle = col
    rr(c, BAR_X, mid - BAR_H / 2, fill, BAR_H, BAR_H / 2)
    c.fill()

    // ── Score: measure width with BIG font BEFORE switching font ──
    c.font = `800 26px ${F}`
    const scoreStr = String(city.score)
    const scoreW   = c.measureText(scoreStr).width   // ← captured with big font
    c.fillStyle    = col
    c.textAlign    = 'right'
    c.fillText(scoreStr, COL_SCORE, mid + 4)

    // Score label (below score number, small)
    c.font = `400 10px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.30)'
    c.textAlign = 'right'
    c.fillText(scoreLabel(city.score), COL_SCORE, mid + 16)

    c.textAlign = 'left'
  })

  // ── Bottom strip ────────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, H - 52, W - P * 2, 1)

  c.font = `600 13px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.32)'
  c.fillText('lakive.com', P, H - 22)

  c.font = `400 12px ${F}`
  c.textAlign = 'right'
  c.fillStyle = 'rgba(255,255,255,0.20)'
  c.fillText('Free housing affordability analysis · No sign-up required', W - P, H - 22)
  c.textAlign = 'left'

  return cv.toDataURL('image/png')
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [incomeDisplay, setIncomeDisplay] = useState<IncomeDisplay>('hidden')
  const [copied,        setCopied       ] = useState(false)
  const [generating,    setGenerating   ] = useState(false)
  const [done,          setDone         ] = useState(false)

  useEffect(() => {
    if (open) { setIncomeDisplay('hidden'); setCopied(false); setDone(false) }
  }, [open])

  if (!open) return null

  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best   = sorted[0]

  const handleDownload = async () => {
    setGenerating(true)
    const dataUrl = await generateImage(shareData, incomeDisplay)
    const a = document.createElement('a')
    a.download = `lakive-${shareData.occupationId}-city-fit.png`
    a.href = dataUrl
    a.click()
    setGenerating(false)
    setDone(true)
    setTimeout(() => setDone(false), 2500)
  }

  const tweetText = [
    `As a ${shareData.occupationName}, ${best.cityName} scores highest (${best.score}/99) for housing affordability across ${sorted.length} cities.`,
    '',
    sorted.map(c => `${c.score >= 80 ? '🟢' : c.score >= 60 ? '🟡' : '🔴'} ${c.cityName}: ${c.score} pts`).join('\n'),
    '',
    'Full breakdown → lakive.com/calculate',
    '#HousingAffordability #CityFit',
  ].join('\n')

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background:'#131b2e', border:'1px solid rgba(255,255,255,0.10)', borderRadius:20, padding:'32px 28px', maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>Share this Insight</div>
            <div style={{ color:'rgba(255,255,255,0.40)', fontSize:13, marginTop:2 }}>
              {shareData.occupationName} · {PROP_LABELS[shareData.housingType] ?? shareData.housingType}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, color:'rgba(255,255,255,0.50)', fontSize:20, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>×</button>
        </div>

        {/* Preview */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px', marginBottom:24 }}>
          <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Preview</div>
          {sorted.slice(0, 3).map((city, i) => (
            <div key={city.cityId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background: i===0?'#4F8EF7':'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{i+1}</div>
                <div>
                  <div style={{ color: i===0?'#fff':'rgba(255,255,255,0.65)', fontSize:14, fontWeight: i===0?700:400 }}>{city.cityName}</div>
                  <div style={{ color:'rgba(255,255,255,0.28)', fontSize:11 }}>{city.province}</div>
                </div>
              </div>
              <div>
                <div style={{ color: scoreColor(city.score), fontWeight:800, fontSize:18, textAlign:'right' }}>{city.score}</div>
                <div style={{ color:'rgba(255,255,255,0.28)', fontSize:10, textAlign:'right' }}>{scoreLabel(city.score)}</div>
              </div>
            </div>
          ))}
          {sorted.length > 3 && <div style={{ color:'rgba(255,255,255,0.25)', fontSize:12, paddingTop:8 }}>+{sorted.length - 3} more cities in the image</div>}
        </div>

        {/* Income privacy */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, marginBottom:10 }}>Income privacy</div>
          {([
            { id:'hidden', label:"Don't include income",              desc:'Only occupation and housing type' },
            { id:'range',  label:`Show salary range (${toIncomeRange(shareData.incomeValue)})`, desc:'Bracket without revealing exact figure' },
            { id:'exact',  label:`Show exact salary ($${shareData.incomeValue.toLocaleString()})`, desc:'Most context for readers' },
          ] as { id: IncomeDisplay; label: string; desc: string }[]).map(opt => (
            <div key={opt.id} onClick={() => setIncomeDisplay(opt.id)}
              style={{ padding:'11px 14px', borderRadius:10, marginBottom:8, cursor:'pointer', background: incomeDisplay===opt.id?'rgba(79,142,247,0.10)':'rgba(255,255,255,0.03)', border:`1px solid ${incomeDisplay===opt.id?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.08)'}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, border:`2px solid ${incomeDisplay===opt.id?'#4F8EF7':'rgba(255,255,255,0.25)'}`, background: incomeDisplay===opt.id?'#4F8EF7':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {incomeDisplay===opt.id && <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }}/>}
                </div>
                <div>
                  <div style={{ color:'#fff', fontSize:13, fontWeight:500 }}>{opt.label}</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>{opt.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Download */}
        <button onClick={handleDownload} disabled={generating}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background: done?'#14B8A6':generating?'rgba(79,142,247,0.5)':'#4F8EF7', color:'#fff', fontWeight:700, fontSize:15, cursor: generating?'not-allowed':'pointer', marginBottom:10, transition:'background 0.2s' }}>
          {done ? '✓ Image downloaded!' : generating ? 'Generating…' : '⬇ Download Share Image (PNG)'}
        </button>

        {/* Share to X */}
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank', 'noopener')}
          style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontWeight:800 }}>𝕏</span> Share on X / Twitter
        </button>

        {/* Copy text */}
        <button onClick={() => { navigator.clipboard.writeText(tweetText); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
          style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'rgba(255,255,255,0.55)', fontWeight:500, fontSize:13, cursor:'pointer' }}>
          {copied ? '✓ Text copied' : 'Copy tweet text'}
        </button>

        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:11, textAlign:'center', marginTop:16 }}>
          Image generated in your browser — no data sent to any server.
        </div>
      </div>
    </div>
  )
}
