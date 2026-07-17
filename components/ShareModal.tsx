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

// ── Helpers ────────────────────────────────────────────────────────────────────
const PROP_LABELS: Record<string, string> = {
  '1br': '1-Bedroom', '2br': '2-Bedroom', '3br': '3-Bedroom',
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

function scoreLevel(s: number): string {
  if (s >= 80) return 'L1'
  if (s >= 70) return 'L2'
  if (s >= 55) return 'L3'
  if (s >= 40) return 'L4'
  return 'L5'
}

// ── Canvas image generator ─────────────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function generateImage(shareData: ShareTarget, incomeDisplay: IncomeDisplay): string {
  const W = 1200, H = 630
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!
  const P = 56  // padding

  // Background
  const bg = c.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d1117')
  bg.addColorStop(0.55, '#131b2e')
  bg.addColorStop(1, '#162035')
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)

  const FONT = 'system-ui, -apple-system, Arial, sans-serif'

  // ── Top bar ──
  c.font = `900 26px ${FONT}`
  c.fillStyle = '#14B8A6'
  c.fillText('Lakive', P, 76)
  const logoW = c.measureText('Lakive').width

  c.fillStyle = 'rgba(255,255,255,0.18)'
  c.fillRect(P + logoW + 16, 62, 1, 18)

  c.font = `700 12px ${FONT}`
  c.fillStyle = 'rgba(255,255,255,0.38)'
  c.fillText('CITY FIT ENGINE', P + logoW + 30, 76)

  c.font = `400 12px ${FONT}`
  c.fillStyle = 'rgba(255,255,255,0.22)'
  c.textAlign = 'right'
  c.fillText('2026-H1', W - P, 76)
  c.textAlign = 'left'

  // ── Occupation title ──
  c.font = `900 38px ${FONT}`
  c.fillStyle = '#ffffff'
  c.fillText(shareData.occupationName, P, 140)
  const occW = c.measureText(shareData.occupationName).width

  const prop = PROP_LABELS[shareData.housingType] ?? shareData.housingType
  c.font = `400 26px ${FONT}`
  c.fillStyle = 'rgba(255,255,255,0.35)'
  c.fillText(' · ' + prop, P + occW, 140)

  // Income sub-line
  let incomeLine = ''
  if (incomeDisplay === 'range' && shareData.incomeValue)
    incomeLine = `Salary: ${toIncomeRange(shareData.incomeValue)}`
  else if (incomeDisplay === 'exact' && shareData.incomeValue)
    incomeLine = `Salary: $${shareData.incomeValue.toLocaleString()}`

  let barsY = 174
  if (incomeLine) {
    c.font = `400 15px ${FONT}`
    c.fillStyle = 'rgba(255,255,255,0.42)'
    c.fillText(incomeLine, P, 170)
    barsY = 200
  }

  // ── City bars ──
  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score).slice(0, 5)
  const maxScore = sorted[0]?.score ?? 99
  const RANK_R = 14
  const NAME_W = 168
  const SCORE_W = 100
  const BAR_X = P + RANK_R * 2 + 12 + NAME_W
  const BAR_AREA = W - P - BAR_X - SCORE_W
  const ROW_H = sorted.length <= 4 ? 72 : 62

  sorted.forEach((city, i) => {
    const cy = barsY + i * ROW_H
    const mid = cy + 20
    const isTop = i === 0
    const col = scoreColor(city.score)

    // Rank circle
    c.beginPath()
    c.arc(P + RANK_R, mid, RANK_R, 0, Math.PI * 2)
    c.fillStyle = isTop ? '#4F8EF7' : 'rgba(255,255,255,0.08)'
    c.fill()
    c.font = `700 12px ${FONT}`
    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    c.fillText(String(i + 1), P + RANK_R, mid + 4)
    c.textAlign = 'left'

    // City name
    c.font = `${isTop ? '700' : '500'} 17px ${FONT}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.68)'
    c.fillText(city.cityName, P + RANK_R * 2 + 12, mid + 6)

    // Bar track
    c.fillStyle = 'rgba(255,255,255,0.05)'
    rr(c, BAR_X, cy + 10, BAR_AREA, 18, 4)
    c.fill()

    // Bar fill
    const barW = Math.max(8, Math.round((city.score / maxScore) * BAR_AREA))
    c.fillStyle = col
    rr(c, BAR_X, cy + 10, barW, 18, 4)
    c.fill()

    // Score
    c.font = `800 22px ${FONT}`
    c.fillStyle = col
    c.textAlign = 'right'
    c.fillText(String(city.score), W - P, mid + 7)

    // Level label
    c.font = `400 11px ${FONT}`
    c.fillStyle = 'rgba(255,255,255,0.28)'
    c.fillText(scoreLevel(city.score), W - P - c.measureText(String(city.score)).width - 8, mid + 7)
    c.textAlign = 'left'
  })

  // ── Bottom strip ──
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, H - 58, W - P * 2, 1)

  c.font = `400 13px ${FONT}`
  c.fillStyle = 'rgba(255,255,255,0.25)'
  c.fillText('lakive.com', P, H - 30)

  c.textAlign = 'right'
  c.fillStyle = 'rgba(255,255,255,0.22)'
  c.fillText('Free housing affordability analysis · No sign-up required', W - P, H - 30)
  c.textAlign = 'left'

  return cv.toDataURL('image/png')
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [incomeDisplay, setIncomeDisplay] = useState<IncomeDisplay>('hidden')
  const [copied, setCopied] = useState(false)
  const [imgDownloaded, setImgDownloaded] = useState(false)

  useEffect(() => {
    if (open) { setIncomeDisplay('hidden'); setCopied(false); setImgDownloaded(false) }
  }, [open])

  if (!open) return null

  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best   = sorted[0]

  const handleDownloadImage = () => {
    const dataUrl = generateImage(shareData, incomeDisplay)
    const a = document.createElement('a')
    a.download = `lakive-${shareData.occupationId}-city-fit.png`
    a.href = dataUrl
    a.click()
    setImgDownloaded(true)
    setTimeout(() => setImgDownloaded(false), 2500)
  }

  const tweetText = [
    `As a ${shareData.occupationName}, ${best.cityName} has the best housing fit score (${best.score}/99) across ${sorted.length} cities.`,
    '',
    sorted.map(c => `${c.score >= 80 ? '🟢' : c.score >= 60 ? '🟡' : '🔴'} ${c.cityName}: ${c.score} pts`).join('\n'),
    '',
    'Full breakdown → lakive.com/calculate',
    '#HousingAffordability #CityFit',
  ].join('\n')

  const copyText = () => {
    navigator.clipboard.writeText(tweetText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
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
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 16px', marginBottom:24 }}>
          <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Preview</div>
          {sorted.slice(0, 3).map((c, i) => (
            <div key={c.cityId} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background: i===0?'#4F8EF7':'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>{i+1}</div>
                <span style={{ color: i===0?'#fff':'rgba(255,255,255,0.65)', fontSize:14, fontWeight: i===0?700:400 }}>{c.cityName}</span>
              </div>
              <div style={{ color: scoreColor(c.score), fontWeight:700, fontSize:16 }}>{c.score}</div>
            </div>
          ))}
          {sorted.length > 3 && <div style={{ color:'rgba(255,255,255,0.25)', fontSize:12, paddingTop:8 }}>+{sorted.length - 3} more cities in the image</div>}
        </div>

        {/* Income privacy */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, marginBottom:10 }}>Income privacy</div>
          {([
            { id:'hidden', label:"Don't include income",              desc:'Only occupation and housing type shown' },
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

        {/* ── Primary CTA: Download Image ── */}
        <button onClick={handleDownloadImage}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background: imgDownloaded?'#14B8A6':'#4F8EF7', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', marginBottom:10, transition:'background 0.2s' }}>
          {imgDownloaded ? '✓ Image downloaded!' : '⬇ Download Share Image'}
        </button>

        {/* ── Secondary: share to X ── */}
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank', 'noopener')}
          style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontWeight:800 }}>𝕏</span> Share on X / Twitter
        </button>

        {/* ── Copy tweet text ── */}
        <button onClick={copyText}
          style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'rgba(255,255,255,0.55)', fontWeight:500, fontSize:13, cursor:'pointer' }}>
          {copied ? '✓ Text copied' : 'Copy tweet text'}
        </button>

        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:11, textAlign:'center', marginTop:16 }}>
          Image is generated locally in your browser — no data is sent to any server.
        </div>
      </div>
    </div>
  )
}
