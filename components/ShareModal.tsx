'use client'
import { useState, useEffect } from 'react'
import type { IncomeDisplay } from '@/lib/types/share'

export interface ShareTarget {
  occupationId:   string
  occupationName: string
  housingType:    string
  incomeValue:    number
  cityResults: {
    cityId:   string
    cityName: string
    province: string
    hpiYears: number
    rpi:      number
    score:    number
  }[]
}

type ModalStep = 1 | 'loading' | 2

interface Props {
  open:      boolean
  onClose:   () => void
  shareData: ShareTarget
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PROP_SHORT: Record<string, string> = {
  '1br': '1-Bedroom Apt', '2br': '2-Bedroom Apt', '3br': '3-Bedroom Apt',
  'townhouse': 'Townhouse', 'detached': 'Detached Home',
}
const PROP_LONG: Record<string, string> = {
  '1br': '1-Bedroom Apartment', '2br': '2-Bedroom Apartment', '3br': '3-Bedroom Apartment',
  'townhouse': 'Townhouse', 'detached': 'Detached House',
}
const PROP_NOUN: Record<string, string> = {
  '1br': '1-bedroom', '2br': '2-bedroom', '3br': '3-bedroom',
  'townhouse': 'townhouse', 'detached': 'detached home',
}

function toRange(v: number): string {
  const lo = Math.floor(v / 10000) * 10
  return `$${lo}K–$${lo + 10}K`
}

function scoreColor(s: number) {
  if (s >= 80) return '#14B8A6'
  if (s >= 70) return '#60A5FA'
  if (s >= 55) return '#F59E0B'
  if (s >= 40) return '#E86C2F'
  return '#EF4444'
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Lower Pressure'
  if (s >= 70) return 'Manageable'
  if (s >= 55) return 'Under Pressure'
  if (s >= 40) return 'Difficult'
  return 'Severe'
}

// ── Data-driven insight sentence ───────────────────────────────────────────────
function buildInsight(
  sorted: ShareTarget['cityResults'],
  occName: string,
  housingType: string,
): string {
  const best  = sorted[0]
  const worst = sorted[sorted.length - 1]
  const noun  = PROP_NOUN[housingType] ?? housingType

  if (best.hpiYears > 0 && worst.hpiYears > 0) {
    const ratio = worst.hpiYears / best.hpiYears
    if (ratio >= 1.9)
      return `City choice can make a ${ratio.toFixed(1)}× difference — the same income goes much further in ${best.cityName}.`
  }
  if (best.score >= 78)
    return `${best.cityName} stands out as the clearest path to ${noun} ownership for ${occName}s in Canada.`
  if (best.score < 58)
    return `No city offers easy ${noun} access for ${occName}s — but ${best.cityName} leads by ${best.score - worst.score} points.`
  if (best.score - worst.score >= 18)
    return `Where you live matters more than how much you earn — ${best.cityName} leads by ${best.score - worst.score} points.`
  return `${best.cityName} offers the best balance of income and ${noun} affordability for ${occName}s in Canada.`
}

// ── Canvas rounded rect ────────────────────────────────────────────────────────
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

// ── Card generator ─────────────────────────────────────────────────────────────
async function generateInsightCard(
  shareData: ShareTarget,
  incomeDisplay: IncomeDisplay,
): Promise<string> {
  const W = 1200, H = 630
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!

  const P    = 60
  const TEAL = '#14B8A6'
  const F    = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Arial, sans-serif'

  // ── Background ──────────────────────────────────────────────────────────────
  c.fillStyle = '#0f1623'
  c.fillRect(0, 0, W, H)

  // 4px top accent gradient
  const accent = c.createLinearGradient(0, 0, W, 0)
  accent.addColorStop(0,   '#14B8A6')
  accent.addColorStop(0.5, '#4F8EF7')
  accent.addColorStop(1,   '#14B8A6')
  c.fillStyle = accent
  c.fillRect(0, 0, W, 4)

  // ── Lakive Logo (top left, prominent) ───────────────────────────────────────
  let logoRight = P  // track where logo ends so divider can go after it
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej()
      img.src = '/lakive-logo.png'
      setTimeout(() => rej(), 3000)
    })
    const LOGO_H = 46
    const LOGO_W = Math.round(img.naturalWidth / img.naturalHeight * LOGO_H)
    c.drawImage(img, P, 22, LOGO_W, LOGO_H)
    logoRight = P + LOGO_W
  } catch {
    c.font = `900 30px ${F}`
    c.fillStyle = TEAL
    c.fillText('Lakive', P, 62)
    logoRight = P + c.measureText('Lakive').width
  }

  // Thin vertical divider after logo
  c.fillStyle = 'rgba(255,255,255,0.13)'
  c.fillRect(logoRight + 18, 28, 1, 34)

  // "INSIGHT CARD" label
  c.font = `600 10px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.30)'
  c.fillText('INSIGHT CARD', logoRight + 34, 50)

  // ── Occupation + Housing (top right) ────────────────────────────────────────
  c.textAlign = 'right'
  c.font = `700 16px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.82)'
  c.fillText(shareData.occupationName, W - P, 38)

  c.font = `400 13px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.38)'
  let rightSub = (PROP_SHORT[shareData.housingType] ?? shareData.housingType) + ' · Canada'
  if (incomeDisplay === 'range' && shareData.incomeValue)
    rightSub += ' · ' + toRange(shareData.incomeValue)
  else if (incomeDisplay === 'exact' && shareData.incomeValue)
    rightSub += ' · $' + shareData.incomeValue.toLocaleString()
  c.fillText(rightSub, W - P, 58)
  c.textAlign = 'left'

  // ── Divider ──────────────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 82, W - P * 2, 1)

  // ── Hero Headline ────────────────────────────────────────────────────────────
  const sorted    = [...shareData.cityResults].sort((a, b) => b.score - a.score).slice(0, 4)
  const best      = sorted[0]
  const occName   = shareData.occupationName
  const occPlural = occName.endsWith('s') ? occName : occName + 's'

  const headline = `${best.cityName} ranks #1 for ${occPlural}`

  // Auto-shrink headline font to fit
  let hSize = 58
  c.font = `900 ${hSize}px ${F}`
  while (c.measureText(headline).width > W - P * 2 && hSize > 36) {
    hSize -= 2
    c.font = `900 ${hSize}px ${F}`
  }
  c.fillStyle = '#ffffff'
  c.fillText(headline, P, 160)

  // Sub-headline
  c.font = `300 17px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.36)'
  c.fillText((PROP_LONG[shareData.housingType] ?? shareData.housingType) + ' · 2026-H1', P, 188)

  // ── Divider ──────────────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 206, W - P * 2, 1)

  // ── City Rankings ────────────────────────────────────────────────────────────
  const maxScore   = sorted[0].score
  const N          = sorted.length
  const ROWS_TOP   = 218
  const ROWS_BOT   = 472
  const ROW_H      = Math.floor((ROWS_BOT - ROWS_TOP) / N)

  const RANK_CX    = P + 14              // rank circle center x
  const NAME_X     = P + 40             // city name start
  const SCORE_RX   = W - P              // score right-aligns here
  const BAR_X      = NAME_X + 210       // bar starts after name column
  const BAR_MAX_W  = SCORE_RX - 130 - BAR_X
  const BAR_H      = 8

  sorted.forEach((city, i) => {
    const mid  = ROWS_TOP + i * ROW_H + Math.floor(ROW_H / 2)
    const isTop = i === 0
    const col   = scoreColor(city.score)

    // Subtle highlight for #1
    if (isTop) {
      c.fillStyle = 'rgba(20,184,166,0.06)'
      c.fillRect(P - 16, ROWS_TOP + i * ROW_H + 2, W - P * 2 + 32, ROW_H - 4)
    }

    // Rank circle
    c.beginPath()
    c.arc(RANK_CX, mid, 14, 0, Math.PI * 2)
    c.fillStyle = isTop ? TEAL : 'rgba(255,255,255,0.07)'
    c.fill()
    c.font    = `700 11px ${F}`
    c.fillStyle = isTop ? '#0f1623' : 'rgba(255,255,255,0.40)'
    c.textAlign = 'center'
    c.fillText(String(i + 1), RANK_CX, mid + 4)
    c.textAlign = 'left'

    // City name + province
    c.font    = `${isTop ? '700' : '500'} 19px ${F}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.72)'
    c.fillText(city.cityName, NAME_X, mid - 4)

    c.font    = `400 12px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.30)'
    c.fillText(`${city.province}  ·  ${city.hpiYears} yrs to buy`, NAME_X, mid + 13)

    // Bar track
    c.fillStyle = 'rgba(255,255,255,0.05)'
    rr(c, BAR_X, mid - BAR_H / 2, BAR_MAX_W, BAR_H, 4)
    c.fill()

    // Bar fill
    const fill = Math.max(BAR_H * 2, Math.round((city.score / maxScore) * BAR_MAX_W))
    c.fillStyle = col
    rr(c, BAR_X, mid - BAR_H / 2, fill, BAR_H, 4)
    c.fill()

    // ── Score number — measure width BEFORE changing font ──
    c.font = `900 48px ${F}`
    const scoreStr = String(city.score)
    const scoreW   = c.measureText(scoreStr).width   // captured with 48px font
    c.fillStyle    = col
    c.textAlign    = 'right'
    c.fillText(scoreStr, SCORE_RX, mid + 10)         // right-aligned

    // Score label — right-aligned, directly below score
    c.font      = `400 10px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.28)'
    c.fillText(scoreLabel(city.score), SCORE_RX, mid + 22)  // still right-aligned

    c.textAlign = 'left'
  })

  // ── Divider ──────────────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 478, W - P * 2, 1)

  // ── AI Insight ───────────────────────────────────────────────────────────────
  const insight = buildInsight(sorted, occName, shareData.housingType)

  // Teal left accent bar
  c.fillStyle = TEAL
  c.fillRect(P, 494, 3, 42)

  // Insight text (word-wrap)
  c.font      = `400 17px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.62)'
  const maxTW   = W - P * 2 - 22
  const words   = insight.split(' ')
  let line = '', lineY = 513
  words.forEach((word, wi) => {
    const test = line ? line + ' ' + word : word
    if (c.measureText(test).width > maxTW && line) {
      c.fillText(line, P + 16, lineY)
      line = word
      lineY += 24
    } else {
      line = test
    }
    if (wi === words.length - 1) c.fillText(line, P + 16, lineY)
  })

  // ── Footer ───────────────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 586, W - P * 2, 1)

  c.font      = `500 13px ${F}`
  c.fillStyle = TEAL
  c.fillText('From Data to Belonging.', P, 614)

  c.font      = `600 14px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.60)'
  c.textAlign = 'right'
  c.fillText('lakive.com', W - P, 614)
  c.textAlign = 'left'

  return cv.toDataURL('image/png')
}

// ── Modal Component ────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [step,    setStep   ] = useState<ModalStep>(1)
  const [income,  setIncome ] = useState<IncomeDisplay>('hidden')
  const [imgUrl,  setImgUrl ] = useState<string | null>(null)
  const [saved,   setSaved  ] = useState(false)
  const [copied,  setCopied ] = useState(false)

  useEffect(() => {
    if (open) { setStep(1); setIncome('hidden'); setImgUrl(null); setSaved(false); setCopied(false) }
  }, [open])

  if (!open) return null

  const sorted  = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best    = sorted[0]
  const tweetText = [
    `${best.cityName} ranks #1 for ${shareData.occupationName}s in housing fit (score: ${best.score}/99).`,
    '',
    sorted.slice(0, 4).map(c => `${c.score >= 80 ? '🟢' : c.score >= 60 ? '🟡' : '🔴'} ${c.cityName}: ${c.score} pts`).join('\n'),
    '',
    'Run your own comparison → lakive.com/calculate',
    '#CityFit #HousingAffordability',
  ].join('\n')

  const handleGenerate = async () => {
    setStep('loading')
    try {
      const url = await generateInsightCard(shareData, income)
      setImgUrl(url)
      setStep(2)
    } catch {
      setStep(1)
    }
  }

  const handleDownload = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.download = `lakive-${shareData.occupationId}-insight.png`
    a.href = imgUrl
    a.click()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://www.lakive.com/calculate')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareX = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank', 'noopener')

  // Modal width: 440px in Step 1/loading, 600px in Step 2
  const modalW = step === 2 ? 600 : 440

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <div style={{ background:'#131b2e', border:'1px solid rgba(255,255,255,0.10)', borderRadius:20, width:'100%', maxWidth:modalW, overflow:'hidden', position:'relative', transition:'max-width 0.25s ease' }}>

        {/* ── Step 1: Settings ── */}
        {step === 1 && (
          <div style={{ padding:'28px 28px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>Share Settings</div>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, color:'rgba(255,255,255,0.45)', fontSize:20, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>×</button>
            </div>

            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:12 }}>
              Privacy
            </div>

            {([
              { id: 'hidden' as IncomeDisplay, label: 'Hide my income',    sub: 'Recommended — only occupation and city shown' },
              { id: 'range'  as IncomeDisplay, label: 'Show income range', sub: toRange(shareData.incomeValue) },
              { id: 'exact'  as IncomeDisplay, label: 'Show exact income', sub: `$${shareData.incomeValue.toLocaleString()}` },
            ]).map(opt => (
              <div key={opt.id} onClick={() => setIncome(opt.id)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:10, marginBottom:8, cursor:'pointer', background: income===opt.id?'rgba(79,142,247,0.10)':'rgba(255,255,255,0.03)', border:`1px solid ${income===opt.id?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.07)'}` }}>
                <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, border:`2px solid ${income===opt.id?'#4F8EF7':'rgba(255,255,255,0.22)'}`, background:income===opt.id?'#4F8EF7':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {income===opt.id && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }}/>}
                </div>
                <div>
                  <div style={{ color:'#fff', fontSize:14, fontWeight:500 }}>{opt.label}</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:2 }}>{opt.sub}</div>
                </div>
              </div>
            ))}

            <button onClick={handleGenerate}
              style={{ width:'100%', padding:'15px', marginTop:18, borderRadius:12, border:'none', background:'linear-gradient(135deg,#4F8EF7,#14B8A6)', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              Generate Insight Card →
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {step === 'loading' && (
          <div style={{ padding:'56px 28px', textAlign:'center' }}>
            <style>{`@keyframes _spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width:38, height:38, border:'3px solid rgba(79,142,247,0.20)', borderTopColor:'#4F8EF7', borderRadius:'50%', animation:'_spin 0.75s linear infinite', margin:'0 auto 20px' }}/>
            <div style={{ color:'#fff', fontWeight:600, fontSize:15, marginBottom:6 }}>Generating your Insight Card…</div>
            <div style={{ color:'rgba(255,255,255,0.32)', fontSize:13 }}>Just a moment</div>
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === 2 && imgUrl && (
          <>
            {/* Image preview — full bleed top */}
            <div style={{ position:'relative' }}>
              <img src={imgUrl} alt="Lakive Insight Card" style={{ width:'100%', display:'block', borderRadius:'20px 20px 0 0' }} />
              <button onClick={onClose}
                style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.50)', border:'none', borderRadius:8, color:'rgba(255,255,255,0.70)', fontSize:18, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, backdropFilter:'blur(4px)' }}>
                ×
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ padding:'14px 16px 18px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <button onClick={handleDownload}
                style={{ padding:'13px 8px', borderRadius:10, border:'none', background:saved?'rgba(20,184,166,0.80)':'#4F8EF7', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background 0.2s' }}>
                {saved ? '✓ Saved' : '⬇ Download'}
              </button>
              <button onClick={handleCopyLink}
                style={{ padding:'13px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.13)', background:'rgba(255,255,255,0.05)', color: copied?'#14B8A6':'rgba(255,255,255,0.80)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                {copied ? '✓ Copied' : '🔗 Copy Link'}
              </button>
              <button onClick={handleShareX}
                style={{ padding:'13px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.13)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.80)', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <span style={{ fontWeight:900, fontSize:14 }}>𝕏</span> Share
              </button>
            </div>

            {/* Regenerate link */}
            <div style={{ paddingBottom:14, textAlign:'center' }}>
              <button onClick={() => setStep(1)}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.28)', fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
                ← Change settings
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
