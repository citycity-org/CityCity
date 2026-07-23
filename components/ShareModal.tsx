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

// ── Score bands (v1.2: 5-band unified system) ─────────────────────────────────
// L1 ≥80 Lower Pressure · L2 ≥70 Manageable · L3 ≥55 Under Pressure · L4 ≥40 Difficult · L5 <40 Severe
function scoreColor(s: number) {
  if (s >= 80) return '#14B8A6'   // teal  — L1 Lower Pressure
  if (s >= 70) return '#4F8EF7'   // blue  — L2 Manageable
  if (s >= 55) return '#F59E0B'   // amber — L3 Under Pressure
  if (s >= 40) return '#E86C2F'   // orange-red — L4 Difficult
  return '#EF4444'                // red   — L5 Severe
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Lower Pressure'
  if (s >= 70) return 'Manageable'
  if (s >= 55) return 'Under Pressure'
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

  // Tight cluster — use actual data to explain WHY the top city leads
  if (best.score - worst.score <= 10) {
    return `${best.cityName} offers the strongest overall fit for ${occName}s, combining a ${best.hpiYears}-year home-price ratio with a ${best.rpi}% gross rent burden.`
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

function loadImage(src: string, timeout = 3000): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = () => rej()
    img.src = src
    setTimeout(() => rej(), timeout)
  })
}

// ── Card generator — Insight Card v4 (1536×1024) ─────────────────────────────
// Layout zones:
//   0-6      top accent strip
//   photo    RIGHT COLUMN full-height (940→W, 0→H) — city photography + info card overlay
//   40-150   header: logo + tagline + INSIGHT CARD chip (left column)
//   210-400  headline (two-tone) + subheadline (left column)
//   430-806  rankings panel: 4 rows × 90px (left column only)
//   840      legend strip (left column)
//   860-948  insight panel — one clean sentence, no feature columns
//   ~990     footer: scenario ID · sources | photo: lakive.com watermark
async function generateInsightCard(
  shareData: ShareTarget,
  incomeDisplay: IncomeDisplay,
): Promise<string> {
  const W = 1536, H = 1024
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!

  const P    = 64
  const TEAL = '#14B8A6'
  const BLUE = '#4F8EF7'
  const BG   = '#0F1623'
  const F    = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Arial, sans-serif'

  const sorted    = [...shareData.cityResults].sort((a, b) => b.score - a.score).slice(0, 4)
  const best      = sorted[0]
  const occName   = shareData.occupationName
  const occPlural = occName.endsWith('s') ? occName : occName + 's'

  // ── Background ──────────────────────────────────────────────────────────────
  c.fillStyle = BG
  c.fillRect(0, 0, W, H)

  // ── City photo region (right column, full height) ──────────────────────────
  const PX = 940, PB = H, CR = 28
  const photoPath = () => {
    c.beginPath()
    c.moveTo(PX, 0)
    c.lineTo(W, 0)
    c.lineTo(W, PB)
    c.lineTo(PX + CR, PB)
    c.quadraticCurveTo(PX, PB, PX, PB - CR)
    c.closePath()
  }

  c.save()
  photoPath()
  c.clip()
  try {
    const photo = await loadImage(`/cities/${best.cityId}.jpg`)
    const iw = photo.naturalWidth, ih = photo.naturalHeight
    const dw = W - PX, dh = PB
    const s  = Math.max(dw / iw, dh / ih)
    const sw = dw / s, sh = dh / s
    c.drawImage(photo, (iw - sw) / 2, (ih - sh) / 2, sw, sh, PX, 0, dw, dh)
  } catch {
    const g = c.createLinearGradient(PX, 0, W, PB)
    g.addColorStop(0, '#1A2743')
    g.addColorStop(1, '#101A2E')
    c.fillStyle = g
    photoPath()
    c.fill()
  }
  // blend left + bottom edges into background
  const gl = c.createLinearGradient(PX, 0, PX + 220, 0)
  gl.addColorStop(0, 'rgba(15,22,35,0.92)')
  gl.addColorStop(1, 'rgba(15,22,35,0)')
  c.fillStyle = gl
  c.fillRect(PX, 0, 220, PB)
  const gb = c.createLinearGradient(0, PB, 0, PB - 140)
  gb.addColorStop(0, 'rgba(15,22,35,0.85)')
  gb.addColorStop(1, 'rgba(15,22,35,0)')
  c.fillStyle = gb
  c.fillRect(PX, PB - 140, W - PX, 140)
  c.restore()

  // ── Top accent strip ────────────────────────────────────────────────────────
  const accent = c.createLinearGradient(0, 0, W, 0)
  accent.addColorStop(0,   TEAL)
  accent.addColorStop(0.5, BLUE)
  accent.addColorStop(1,   TEAL)
  c.fillStyle = accent
  c.fillRect(0, 0, W, 6)

  // ── Logo + tagline + chip ───────────────────────────────────────────────────
  let logoW = 240
  try {
    const img = await loadImage('/lakive-logo-white.png')
    const LOGO_H = 52  // 8% smaller than original 56
    logoW = Math.round(img.naturalWidth / img.naturalHeight * LOGO_H)
    c.drawImage(img, P, 44, logoW, LOGO_H)
  } catch {
    c.font = `900 44px ${F}`
    c.fillStyle = '#ffffff'
    c.fillText('LAKIVE', P, 88)
  }

  // Tagline (v1.1: no period) — two-tone
  c.font = `500 20px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.88)'
  c.fillText('From Data to ', P, 134)
  const tg1 = c.measureText('From Data to ').width
  c.fillStyle = TEAL
  c.fillText('Belonging', P + tg1, 134)

  // "INSIGHT CARD" chip
  c.font = `700 14px ${F}`
  c.letterSpacing = '0.12em'
  const chipTxtW = c.measureText('INSIGHT CARD').width
  const chipX = P + logoW + 36
  rr(c, chipX, 56, chipTxtW + 40, 34, 17)
  c.strokeStyle = 'rgba(20,184,166,0.55)'
  c.lineWidth   = 1.5
  c.stroke()
  c.fillStyle = TEAL
  c.fillText('INSIGHT CARD', chipX + 20, 78)
  c.letterSpacing = '0'

  // ── Info panel (photo column overlay, prominent) ─────────────────────────────
  const IPX = PX + 28, IPY = 36, IPW = W - P - IPX, IPH = 162
  rr(c, IPX, IPY, IPW, IPH, 18)
  c.fillStyle = 'rgba(10,16,28,0.66)'
  c.fill()
  rr(c, IPX, IPY, IPW, IPH, 18)
  c.strokeStyle = 'rgba(255,255,255,0.13)'
  c.lineWidth   = 1
  c.stroke()
  // icon: circle + shield
  c.beginPath()
  c.arc(IPX + 48, IPY + 54, 26, 0, Math.PI * 2)
  c.strokeStyle = 'rgba(20,184,166,0.65)'
  c.lineWidth   = 1.5
  c.stroke()
  c.beginPath()
  c.moveTo(IPX + 48, IPY + 40)
  c.lineTo(IPX + 60, IPY + 46)
  c.lineTo(IPX + 58, IPY + 60)
  c.quadraticCurveTo(IPX + 48, IPY + 70, IPX + 38, IPY + 60)
  c.lineTo(IPX + 36, IPY + 46)
  c.closePath()
  c.strokeStyle = TEAL
  c.lineWidth   = 1.5
  c.stroke()
  // texts
  const ITX = IPX + 92
  c.font      = `700 22px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.96)'
  c.fillText(occName, ITX, IPY + 42)
  c.font      = `400 16px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.68)'
  c.fillText(PROP_SHORT[shareData.housingType] ?? shareData.housingType, ITX, IPY + 68)
  if (incomeDisplay === 'range' && shareData.incomeValue) {
    c.fillText('Income: ' + toRange(shareData.incomeValue), ITX, IPY + 94)
  } else if (incomeDisplay === 'exact' && shareData.incomeValue) {
    c.fillText('Income: $' + shareData.incomeValue.toLocaleString(), ITX, IPY + 94)
  } else {
    c.fillText('Canada', ITX, IPY + 94)
  }
  c.font      = `400 13px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.40)'
  c.fillText('Generated ' + monthYear(), ITX, IPY + 128)

  // ── Headline (two lines, two-tone: "#1" in teal) ────────────────────────────
  const line1a = `${best.cityName} ranks `
  const line1b = '#1'
  const line2  = `for ${occPlural}`
  const maxHW  = PX - P - 40
  let hSize = 72
  c.font = `900 ${hSize}px ${F}`
  while ((c.measureText(line1a + line1b).width > maxHW || c.measureText(line2).width > maxHW) && hSize > 40) {
    hSize -= 2
    c.font = `900 ${hSize}px ${F}`
  }
  const hy1 = 262, hy2 = 262 + Math.round(hSize * 1.16)
  c.fillStyle = '#ffffff'
  c.fillText(line1a, P, hy1)
  c.fillStyle = TEAL
  c.fillText(line1b, P + c.measureText(line1a).width, hy1)
  c.fillStyle = '#ffffff'
  c.fillText(line2, P, hy2)

  // Subheadline
  c.font      = `400 23px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.60)'
  c.fillText(`${shareData.occupationName} City Fit  ·  ${PROP_LONG[shareData.housingType] ?? shareData.housingType}  ·  2026-H1`, P, hy2 + 52)

  // ── Rankings panel (left column only) ──────────────────────────────────────
  const RP_Y = 430, ROW_H = 90, RP_H = ROW_H * sorted.length + 16
  const RP_W = PX - P - 16   // left-column panel width (940 - 64 - 16 = 860)
  rr(c, P, RP_Y, RP_W, RP_H, 24)
  c.fillStyle = 'rgba(255,255,255,0.025)'
  c.fill()
  rr(c, P, RP_Y, RP_W, RP_H, 24)
  c.strokeStyle = 'rgba(255,255,255,0.08)'
  c.lineWidth   = 1
  c.stroke()

  const ROWS_TOP = RP_Y + 8
  const NAME_X   = P + 108   // = 172
  const BAR_X    = 432        // start earlier (was 560)
  const BAR_W    = 300        // shorter (was 590)
  const BAR_H    = 8
  const BADGE_W  = 150        // was 180
  const BADGE_H  = 72
  const BADGE_X  = P + RP_W - BADGE_W - 10  // = 764

  sorted.forEach((city, i) => {
    const rowTop = ROWS_TOP + i * ROW_H
    const mid    = rowTop + ROW_H / 2
    const isTop  = i === 0
    const col    = scoreColor(city.score)

    // separator
    if (i > 0) {
      c.fillStyle = 'rgba(255,255,255,0.06)'
      c.fillRect(P + 24, rowTop, RP_W - 48, 1)
    }

    // #1 row highlight
    if (isTop) {
      rr(c, P + 10, rowTop + 5, RP_W - 20, ROW_H - 10, 16)
      c.fillStyle = 'rgba(20,184,166,0.06)'
      c.fill()
    }

    // Rank badge (rounded square)
    rr(c, P + 28, mid - 21, 42, 42, 11)
    c.fillStyle = isTop ? TEAL : 'rgba(255,255,255,0.07)'
    c.fill()
    c.font      = `700 19px ${F}`
    c.fillStyle = isTop ? BG : 'rgba(255,255,255,0.70)'
    c.textAlign = 'center'
    c.fillText(String(i + 1), P + 49, mid + 7)
    c.textAlign = 'left'

    // City name
    c.font      = `${isTop ? '700' : '600'} 27px ${F}`
    c.fillStyle = isTop ? '#ffffff' : 'rgba(255,255,255,0.90)'
    c.fillText(city.cityName, NAME_X, mid - 4)

    // Province (accent) · years
    c.font      = `600 16px ${F}`
    c.fillStyle = isTop ? TEAL : BLUE
    c.fillText(city.province, NAME_X, mid + 24)
    const provW = c.measureText(city.province).width
    c.font      = `400 16px ${F}`
    c.fillStyle = 'rgba(255,255,255,0.60)'
    c.fillText(`  ·  HPI Years · ${city.hpiYears}×`, NAME_X + provW, mid + 24)

    // Slider bar: track + fill + knob
    rr(c, BAR_X, mid - BAR_H / 2, BAR_W, BAR_H, 4)
    c.fillStyle = 'rgba(255,255,255,0.08)'
    c.fill()
    const fillW = Math.max(BAR_H * 2, Math.round((city.score / 99) * BAR_W))
    rr(c, BAR_X, mid - BAR_H / 2, fillW, BAR_H, 4)
    c.fillStyle = col
    c.fill()
    c.beginPath()
    c.arc(BAR_X + fillW, mid, 11, 0, Math.PI * 2)
    c.fillStyle = col
    c.fill()
    c.beginPath()
    c.arc(BAR_X + fillW, mid, 11, 0, Math.PI * 2)
    c.strokeStyle = BG
    c.lineWidth   = 3
    c.stroke()

    // Score badge (outlined, tinted, score + label — colors strictly by band)
    rr(c, BADGE_X, mid - BADGE_H / 2, BADGE_W, BADGE_H, 14)
    c.save()
    c.globalAlpha = 0.08
    c.fillStyle = col
    c.fill()
    c.restore()
    rr(c, BADGE_X, mid - BADGE_H / 2, BADGE_W, BADGE_H, 14)
    c.strokeStyle = col
    c.lineWidth   = 2
    c.stroke()
    c.textAlign = 'center'
    c.font      = `900 32px ${F}`
    c.fillStyle = col
    c.fillText(String(city.score), BADGE_X + BADGE_W / 2, mid - 2)
    c.font      = `600 14px ${F}`
    c.fillText(scoreLabel(city.score), BADGE_X + BADGE_W / 2, mid + 24)
    c.textAlign = 'left'
  })

  // ── Legend strip ────────────────────────────────────────────────────────────
  const LEGEND = [
    { col: '#14B8A6', txt: '80+ Lower Pressure' },
    { col: '#4F8EF7', txt: '70+ Manageable' },
    { col: '#F59E0B', txt: '55+ Under Pressure' },
    { col: '#E86C2F', txt: '40+ Difficult' },
    { col: '#EF4444', txt: '<40 Severe' },
  ]
  let lx = P + 10
  const ly = RP_Y + RP_H + 34
  c.font = `400 15px ${F}`
  LEGEND.forEach(item => {
    c.beginPath()
    c.arc(lx + 5, ly - 5, 5, 0, Math.PI * 2)
    c.fillStyle = item.col
    c.fill()
    c.fillStyle = 'rgba(255,255,255,0.62)'
    c.fillText(item.txt, lx + 18, ly)
    lx += 18 + c.measureText(item.txt).width + 34
  })

  // ── Insight panel (left column, text only — no feature columns) ────────────
  const IN_Y = ly + 20, IN_H = 90
  rr(c, P, IN_Y, RP_W, IN_H, 20)
  c.fillStyle = 'rgba(255,255,255,0.025)'
  c.fill()
  rr(c, P, IN_Y, RP_W, IN_H, 20)
  c.strokeStyle = 'rgba(255,255,255,0.08)'
  c.lineWidth   = 1
  c.stroke()

  // chart icon in circle
  const icx = P + 52, icy = IN_Y + IN_H / 2
  c.beginPath()
  c.arc(icx, icy, 26, 0, Math.PI * 2)
  c.strokeStyle = 'rgba(20,184,166,0.7)'
  c.lineWidth   = 1.5
  c.stroke()
  c.fillStyle = TEAL
  c.fillRect(icx - 12, icy + 2,  6, 10)
  c.fillRect(icx - 3,  icy - 6,  6, 18)
  c.fillRect(icx + 6,  icy - 12, 6, 24)

  // insight text — full left-column width, no features
  const insight = buildInsight(sorted, occName, shareData.housingType)
  c.font      = `400 18px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.85)'
  const inTX  = P + 100
  const maxTW = RP_W - 116  // wide: ~744px
  const words = insight.split(' ')
  let line = '', lineY = IN_Y + 34
  words.forEach((word, wi) => {
    const test = line ? line + ' ' + word : word
    if (c.measureText(test).width > maxTW && line) {
      c.fillText(line, inTX, lineY)
      line = word; lineY += 25
    } else { line = test }
    if (wi === words.length - 1) c.fillText(line, inTX, lineY)
  })

  // ── Footer (left column) ────────────────────────────────────────────────────
  const FY = IN_Y + IN_H + 44
  c.font      = `600 14px ${F}`
  c.fillStyle = TEAL
  c.fillText(scenarioId(), P, FY)
  const sidW = c.measureText(scenarioId()).width
  c.fillStyle = 'rgba(255,255,255,0.15)'
  c.fillRect(P + sidW + 16, FY - 12, 1, 14)
  c.font      = `400 14px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.42)'
  c.fillText('CMHC · Statistics Canada · Job Bank · Provincial Tax Data', P + sidW + 32, FY)

  // lakive.com watermark on photo (bottom-right corner)
  c.textAlign = 'right'
  c.font      = `600 17px ${F}`
  c.fillStyle = 'rgba(255,255,255,0.50)'
  c.fillText('lakive.com', W - P, H - 38)
  c.textAlign = 'left'

  return cv.toDataURL('image/png')
}

// ── Modal Component ────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [step,          setStep         ] = useState<ModalStep>(1)
  const [income,        setIncome       ] = useState<IncomeDisplay>('hidden')
  const [imgUrl,        setImgUrl       ] = useState<string | null>(null)
  const [shareUrl,      setShareUrl     ] = useState<string | null>(null)
  const [saved,         setSaved        ] = useState(false)
  const [copied,        setCopied       ] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1); setIncome('hidden'); setImgUrl(null); setShareUrl(null)
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
      const [url, apiRes] = await Promise.all([
        generateInsightCard(shareData, income),
        fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occupation_id:   shareData.occupationId,
            occupation_name: shareData.occupationName,
            housing_type:    shareData.housingType,
            income_value:    shareData.incomeValue,
            income_display:  income,
            city_results:    shareData.cityResults,
          }),
        }),
      ])
      setImgUrl(url)
      if (apiRes.ok) {
        const data = await apiRes.json()
        setShareUrl(data.url ?? null)
      }
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
    navigator.clipboard.writeText(shareUrl ?? 'https://www.lakive.com/calculate')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank', 'noopener')
    setShowShareMenu(false)
  }

  const modalW = step === 2 ? 720 : 440

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
