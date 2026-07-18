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

// ── Finer color gradient (6 bands instead of 5) ────────────────────────────────
function scoreColor(s: number) {
  if (s >= 80) return '#14B8A6'   // teal
  if (s >= 70) return '#60A5FA'   // blue
  if (s >= 60) return '#F59E0B'   // amber
  if (s >= 50) return '#F97316'   // orange
  if (s >= 40) return '#EF4444'   // red-orange
  return '#DC2626'                // deep red
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Lower Pressure'
  if (s >= 70) return 'Manageable'
  if (s >= 60) return 'Moderate'
  if (s >= 50) return 'Under Pressure'
  if (s >= 40) return 'Difficult'
  return 'Severe'
}

// ── Research-report style insight ─────────────────────────────────────────────
function buildInsight(
  sorted: ShareTarget['cityResults'],
  occName: string,
  housingType: string,
): string {
  const best  = sorted[0]
  const worst = sorted[sorted.length - 1]
  const noun  = PROP_NOUN[housingType] ?? housingType

  // No city is manageable
  if (best.score < 70) {
    return `${best.cityName} leads this comparison, but no city reaches a "Manageable" level for ${noun} affordability.`
  }

  // Only one manageable city
  const manageable = sorted.filter(c => c.score >= 70)
  if (manageable.length === 1) {
    return `${best.cityName} is the only city in this comparison to reach a Manageable level for ${noun} affordability.`
  }

  // Big spread in years-to-buy
  if (best.hpiYears > 0 && worst.hpiYears > 0 && worst.hpiYears / best.hpiYears >= 1.9) {
    const ratio = (worst.hpiYears / best.hpiYears).toFixed(1)
    return `${worst.cityName} requires ${ratio}× more years of income than ${best.cityName} — the gap is structural, not incidental.`
  }

  // Strong leader
  if (best.score - worst.score >= 20) {
    return `${best.cityName} leads by ${best.score - worst.score} points — city selection has more impact on housing fit than salary variation.`
  }

  // Tight cluster
  if (best.score - worst.score <= 10) {
    return `Affordability pressure is consistent across all cities — ${best.cityName} leads narrowly by ${best.score - worst.score} points.`
  }

  return `${best.cityName} offers the strongest ${noun} affordability scenario for ${occName}s, at ${best.hpiYears} years of income to buy.`
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

// ── Scenario ID ───────────────────────────────────────────────────────────────
function scenarioId(): string {
  const now = new Date()
  const mm  = String(now.getMonth() + 1).padStart(2, '0')
  const dd  = String(now.getDate()).padStart(2, '0')
  return `IC-${now.getFullYear()}-${mm}${dd}`
}

function monthYear(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ── Card generator ─────────────────────────────────────────────────────────────
// Layout zones (canvas 1200×630):
//   0-4    top accent strip
//   4-100  header  (logo stack left | 4-line info right)
//   100    divider
//   100-198 headline zone
//   198    divider
//   208-496 city rankings  (4 × 72px = 288px)
//   496    divider
//   504-564 AI insight
//   568    divider
//   576-620 footer (tagline | scenario ID | domain)
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

  // ── Logo stack (top left) ───────────────────────────────────────────────────
  // Logo at top, "Insight Card" label stacked below
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej()
      img.src = '/lakive-logo.png'
      setTimeout(() => rej(), 3000)
    })
    const LOGO_H = 52   // 30% larger than before
    const LOGO_W = Math.round(img.naturalWidth / img.naturalHeight * LOGO_H)
    c.drawImage(img, P, 16, LOGO_W, LOGO_H)
  } catch {
    c.font = `900 34px ${F}`
    c.fillStyle = TEAL
    c.fillText('Lakive', P, 58)
  }

  // "Insight Card" label below logo
  c.font      = `600 11px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.28)'
  c.letterSpacing = '0.10em'
  c.fillText('INSIGHT CARD', P, 84)
  c.letterSpacing = '0'

  // ── 4-line info block (top right) ──────────────────────────────────────────
  c.textAlign = 'right'

  // Line 1: Occupation name (prominent)
  c.font      = `700 17px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.88)'
  c.fillText(shareData.occupationName, W - P, 30)

  // Line 2: Housing type
  c.font      = `400 13px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.45)'
  c.fillText(PROP_SHORT[shareData.housingType] ?? shareData.housingType, W - P, 50)

  // Line 3: Country
  c.font      = `400 13px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.45)'
  c.fillText('Canada', W - P, 68)

  // Income line (replaces country if shown)
  if (incomeDisplay === 'range' && shareData.incomeValue) {
    c.fillStyle = 'rgba(255,255,255,0.30)'
    c.fillText('Income: ' + toRange(shareData.incomeValue), W - P, 68)
  } else if (incomeDisplay === 'exact' && shareData.incomeValue) {
    c.fillStyle = 'rgba(255,255,255,0.30)'
    c.fillText('Income: $' + shareData.incomeValue.toLocaleString(), W - P, 68)
  }

  // Line 4: Generated date
  c.font      = `400 11px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.22)'
  c.fillText('Generated ' + monthYear(), W - P, 84)

  c.textAlign = 'left'

  // ── Header divider ───────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 100, W - P * 2, 1)

  // ── Hero Headline ────────────────────────────────────────────────────────────
  const sorted    = [...shareData.cityResults].sort((a, b) => b.score - a.score).slice(0, 4)
  const best      = sorted[0]
  const occName   = shareData.occupationName
  const occPlural = occName.endsWith('s') ? occName : occName + 's'
  const headline  = `${best.cityName} ranks #1 for ${occPlural}`

  // Auto-shrink to fit
  let hSize = 58
  c.font = `900 ${hSize}px ${F}`
  while (c.measureText(headline).width > W - P * 2 && hSize > 34) {
    hSize -= 2
    c.font = `900 ${hSize}px ${F}`
  }
  c.fillStyle = '#ffffff'
  c.fillText(headline, P, 162)

  // Sub-headline
  c.font      = `300 16px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.34)'
  c.fillText((PROP_LONG[shareData.housingType] ?? shareData.housingType) + ' · 2026-H1', P, 184)

  // ── City zone divider ────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 198, W - P * 2, 1)

  // ── City Rankings ────────────────────────────────────────────────────────────
  // Layout: 4 rows × 72px = 288px (208–496)
  const N        = sorted.length            // up to 4
  const ROWS_TOP = 208
  const ROW_H    = 72

  const RANK_CX  = P + 14                  // circle center
  const NAME_X   = P + 40                  // city name left edge
  const SCORE_RX = W - P                   // score right-aligns here
  const BAR_X    = NAME_X + 230            // bar starts after name column
  const BAR_MAX  = SCORE_RX - 160 - BAR_X // absolute scale track width
  const BAR_H    = 7

  sorted.forEach((city, i) => {
    const rowTop = ROWS_TOP + i * ROW_H
    const mid    = rowTop + ROW_H / 2
    const isTop  = i === 0
    const col    = scoreColor(city.score)

    // #1 row highlight
    if (isTop) {
      c.fillStyle = 'rgba(20,184,166,0.055)'
      c.fillRect(P - 16, rowTop + 2, W - P * 2 + 32, ROW_H - 4)
    }

    // Rank circle
    c.beginPath()
    c.arc(RANK_CX, mid, 14, 0, Math.PI * 2)
    c.fillStyle = isTop ? TEAL : 'rgba(255,255,255,0.07)'
    c.fill()
    c.font      = `700 11px ${F}`
    c.fillStyle = isTop ? '#0f1623' : 'rgba(255,255,255,0.38)'
    c.textAlign = 'center'
    c.fillText(String(i + 1), RANK_CX, mid + 4)
    c.textAlign = 'left'

    // City name
    c.font      = `${isTop ? '700' : '500'} 19px ${F}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.72)'
    c.fillText(city.cityName, NAME_X, mid - 6)

    // Province · years
    c.font      = `400 12px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.28)'
    c.fillText(`${city.province}  ·  ${city.hpiYears} yrs to buy`, NAME_X, mid + 12)

    // Bar track (absolute scale: score / 99)
    c.fillStyle = 'rgba(255,255,255,0.05)'
    rr(c, BAR_X, mid - BAR_H / 2, BAR_MAX, BAR_H, 3)
    c.fill()

    // Bar fill — absolute scale (not relative to maxScore)
    const fill = Math.max(BAR_H * 2, Math.round((city.score / 99) * BAR_MAX))
    c.fillStyle = col
    rr(c, BAR_X, mid - BAR_H / 2, fill, BAR_H, 3)
    c.fill()

    // Score number (56px) — right-aligned
    c.font      = `900 56px ${F}`
    const scoreStr = String(city.score)
    c.fillStyle = col
    c.textAlign = 'right'
    c.fillText(scoreStr, SCORE_RX, mid + 12)

    // Score label (11px) — right-aligned below score
    c.font      = `400 11px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.26)'
    c.fillText(scoreLabel(city.score), SCORE_RX, mid + 26)

    c.textAlign = 'left'
  })

  // ── Insight divider ──────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 496, W - P * 2, 1)

  // ── AI Insight (research-report style) ──────────────────────────────────────
  const insight = buildInsight(sorted, occName, shareData.housingType)

  // Teal left accent bar
  c.fillStyle = TEAL
  c.fillRect(P, 512, 3, 40)

  // Insight text with word-wrap
  c.font      = `400 17px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.65)'
  const maxTW = W - P * 2 - 22
  const words = insight.split(' ')
  let line = '', lineY = 530
  words.forEach((word, wi) => {
    const test = line ? line + ' ' + word : word
    if (c.measureText(test).width > maxTW && line) {
      c.fillText(line, P + 16, lineY)
      line = word; lineY += 24
    } else { line = test }
    if (wi === words.length - 1) c.fillText(line, P + 16, lineY)
  })

  // ── Footer divider ───────────────────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.07)'
  c.fillRect(P, 572, W - P * 2, 1)

  // ── Footer: 3-column ─────────────────────────────────────────────────────────
  // Left: tagline  |  Center: Scenario ID  |  Right: domain

  // Left — teal tagline
  c.font      = `500 13px ${F}`
  c.fillStyle = TEAL
  c.fillText('From Data to Belonging.', P, 602)

  // Center — scenario ID
  c.font      = `400 12px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.22)'
  c.textAlign = 'center'
  c.fillText(scenarioId(), W / 2, 602)

  // Right — domain
  c.font      = `600 14px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.60)'
  c.textAlign = 'right'
  c.fillText('lakive.com', W - P, 602)

  c.textAlign = 'left'

  return cv.toDataURL('image/png')
}

// ── Modal Component ────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [step,          setStep         ] = useState<ModalStep>(1)
  const [income,        setIncome       ] = useState<IncomeDisplay>('hidden')
  const [imgUrl,        setImgUrl       ] = useState<string | null>(null)
  const [saved,         setSaved        ] = useState(false)
  const [copied,        setCopied       ] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1); setIncome('hidden'); setImgUrl(null)
      setSaved(false); setCopied(false); setShowShareMenu(false)
    }
  }, [open])

  if (!open) return null

  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best   = sorted[0]

  const tweetText = [
    `${best.cityName} ranks #1 for ${shareData.occupationName}s in housing fit (score: ${best.score}/99).`,
    '',
    sorted.slice(0, 4).map(city =>
      `${city.score >= 80 ? '🟢' : city.score >= 60 ? '🟡' : '🔴'} ${city.cityName}: ${city.score} pts`
    ).join('\n'),
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
    const a  = document.createElement('a')
    a.download = `lakive-${shareData.occupationId}-insight.png`
    a.href     = imgUrl
    a.click()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://www.lakive.com/calculate')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank', 'noopener')
    setShowShareMenu(false)
  }

  const modalW = step === 2 ? 600 : 440

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) { onClose(); setShowShareMenu(false) } }}
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
                style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:10, marginBottom:8, cursor:'pointer', background:income===opt.id?'rgba(79,142,247,0.10)':'rgba(255,255,255,0.03)', border:`1px solid ${income===opt.id?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.07)'}` }}>
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

        {/* ── Step 2: Preview + Actions ── */}
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
              {/* Download */}
              <button onClick={handleDownload}
                style={{ padding:'13px 8px', borderRadius:10, border:'none', background:saved?'rgba(20,184,166,0.80)':'#4F8EF7', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', transition:'background 0.2s' }}>
                {saved ? '✓ Saved' : '⬇ Download'}
              </button>

              {/* Copy Link */}
              <button onClick={handleCopyLink}
                style={{ padding:'13px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.13)', background:'rgba(255,255,255,0.05)', color:copied?'#14B8A6':'rgba(255,255,255,0.80)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                {copied ? '✓ Copied' : '🔗 Copy Link'}
              </button>

              {/* Share → (expandable) */}
              <div style={{ position:'relative' }}>
                <button
                  onClick={() => setShowShareMenu(s => !s)}
                  style={{ width:'100%', padding:'13px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.13)', background:showShareMenu?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.80)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  Share →
                </button>

                {/* Platform popover */}
                {showShareMenu && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ position:'absolute', bottom:'calc(100% + 8px)', left:0, right:0, background:'#1a2540', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, overflow:'hidden', zIndex:20, boxShadow:'0 8px 32px rgba(0,0,0,0.40)' }}>
                    {/* X */}
                    <button onClick={handleShareX}
                      style={{ width:'100%', padding:'12px 16px', display:'flex', alignItems:'center', gap:10, background:'none', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left' }}>
                      <span style={{ fontWeight:900, fontSize:15 }}>𝕏</span>
                      Share on X
                    </button>
                    {/* Divider */}
                    <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'0 12px' }}/>
                    {/* Coming soon platforms */}
                    {['LinkedIn', 'Facebook', 'Threads'].map(p => (
                      <div key={p}
                        style={{ padding:'11px 16px', display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.25)', fontSize:13 }}>
                        <span style={{ fontSize:11, border:'1px solid rgba(255,255,255,0.12)', borderRadius:4, padding:'1px 5px', letterSpacing:'0.03em' }}>SOON</span>
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Change settings */}
            <div style={{ paddingBottom:14, textAlign:'center' }}>
              <button onClick={() => { setStep(1); setShowShareMenu(false) }}
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
