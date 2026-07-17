'use client'
import { useState, useEffect } from 'react'
import type { IncomeDisplay } from '@/lib/types/share'

// ── Payload shape expected by ShareModal ───────────────────────────────────────
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
  open:       boolean
  onClose:    () => void
  shareData:  ShareTarget
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function toIncomeRange(income: number): string {
  const lo = Math.floor(income / 10000) * 10
  const hi = lo + 10
  return `$${lo}K–$${hi}K`
}

function buildTweetText(url: string, shareData: ShareTarget, incomeDisplay: IncomeDisplay, incomeValue: number): string {
  const sorted  = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best    = sorted[0]
  const incLine = incomeDisplay === 'range'
    ? ` (${toIncomeRange(incomeValue)} salary)`
    : incomeDisplay === 'exact'
    ? ` ($${incomeValue.toLocaleString()} salary)`
    : ''

  return `As a ${shareData.occupationName}${incLine}, ${best.cityName} has the best housing fit score (${best.score}/99) across ${sorted.length} cities.\n\nFull breakdown → ${url}\n\n#HousingAffordability #CityFit @lakive`
}

const PROP_LABELS: Record<string, string> = {
  '1br': '1-Bedroom', '2br': '2-Bedroom', '3br': '3-Bedroom',
  'townhouse': 'Townhouse', 'detached': 'Detached House',
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ShareModal({ open, onClose, shareData }: Props) {
  const [incomeDisplay, setIncomeDisplay] = useState<IncomeDisplay>('hidden')
  const [loading,    setLoading   ] = useState(false)
  const [shareUrl,   setShareUrl  ] = useState<string | null>(null)
  const [copyState,  setCopyState ] = useState<'idle' | 'url' | 'tweet'>('idle')
  const [error,      setError     ] = useState<string | null>(null)

  // Reset when modal opens with new data
  useEffect(() => {
    if (open) {
      setIncomeDisplay('hidden')
      setShareUrl(null)
      setCopyState('idle')
      setError(null)
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  const sorted = [...shareData.cityResults].sort((a, b) => b.score - a.score)
  const best   = sorted[0]

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/share', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation_id:   shareData.occupationId,
          occupation_name: shareData.occupationName,
          housing_type:    shareData.housingType,
          city_results:    shareData.cityResults,
          income_display:  incomeDisplay,
          income_value:    shareData.incomeValue,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setShareUrl(json.url)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, kind: 'url' | 'tweet') => {
    await navigator.clipboard.writeText(text)
    setCopyState(kind)
    setTimeout(() => setCopyState('idle'), 2000)
  }

  const tweetText = shareUrl
    ? buildTweetText(shareUrl, shareData, incomeDisplay, shareData.incomeValue)
    : ''

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#131b2e', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20, padding: '32px 28px', maxWidth: 480, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Share this Insight</div>
            <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13, marginTop: 2 }}>
              {shareData.occupationName} · {PROP_LABELS[shareData.housingType] ?? shareData.housingType}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.50)', fontSize: 20, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >×</button>
        </div>

        {/* Preview card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 16px', marginBottom: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Preview
          </div>
          {sorted.slice(0, 3).map((c, i) => (
            <div key={c.cityId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#4F8EF7' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{i + 1}</div>
                <span style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: i === 0 ? 700 : 400 }}>{c.cityName}</span>
              </div>
              <div style={{ color: i === 0 ? '#14B8A6' : 'rgba(255,255,255,0.50)', fontWeight: 700, fontSize: 16 }}>{c.score}</div>
            </div>
          ))}
          {sorted.length > 3 && (
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, paddingTop: 8 }}>+{sorted.length - 3} more cities in the full link</div>
          )}
        </div>

        {/* Income display options */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            Income privacy
          </div>
          {([
            { id: 'hidden', label: 'Don\'t include income', desc: 'Only occupation and housing type shown' },
            { id: 'range',  label: `Show salary range (${toIncomeRange(shareData.incomeValue)})`, desc: 'Helpful for relatability without revealing exact figure' },
            { id: 'exact',  label: `Show exact salary ($${shareData.incomeValue.toLocaleString()})`, desc: 'Most context for readers' },
          ] as { id: IncomeDisplay; label: string; desc: string }[]).map(opt => (
            <div
              key={opt.id}
              onClick={() => { setIncomeDisplay(opt.id); setShareUrl(null) }}
              style={{
                padding: '11px 14px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                background: incomeDisplay === opt.id ? 'rgba(79,142,247,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${incomeDisplay === opt.id ? 'rgba(79,142,247,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${incomeDisplay === opt.id ? '#4F8EF7' : 'rgba(255,255,255,0.25)'}`,
                  background: incomeDisplay === opt.id ? '#4F8EF7' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {incomeDisplay === opt.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        {!shareUrl ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? 'rgba(79,142,247,0.40)' : '#4F8EF7',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating link…' : 'Generate Share Link'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Share URL display */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ color: '#14B8A6', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shareUrl}
              </div>
              <button
                onClick={() => copyToClipboard(shareUrl, 'url')}
                style={{ background: copyState === 'url' ? '#14B8A6' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {copyState === 'url' ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>

            {/* Share to X */}
            <button
              onClick={shareToX}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span style={{ fontWeight: 800 }}>𝕏</span> Share on X / Twitter
            </button>

            {/* Copy tweet text */}
            <button
              onClick={() => copyToClipboard(tweetText, 'tweet')}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
            >
              {copyState === 'tweet' ? '✓ Tweet text copied' : 'Copy tweet text'}
            </button>
          </div>
        )}

        <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          No personal data is stored unless you choose to include your salary above.
          Links never expire.
        </div>
      </div>
    </div>
  )
}
