'use client'
import { useState, useRef } from 'react'

interface AdvisorResult {
  understood: string[]
  recommendation: {
    text: string
    url: string
    ctaText: string
    highlightCities: string[]
  }
}

const EXAMPLES = [
  "I'm a nurse moving from the Philippines to Canada with two kids",
  "Software engineer in Toronto, thinking about moving to Calgary",
  "Electrician, want to buy a house within 5 years, where should I go?",
  "我是会计师，准备移民加拿大，最看重买房机会",
]

export default function SituationAdvisor() {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<AdvisorResult | null>(null)
  const [empty, setEmpty]     = useState(false)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit() {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setEmpty(false)

    try {
      const res  = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.understood?.length === 0) setEmpty(true)
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function handleExample(ex: string) {
    setQuery(ex)
    setResult(null)
    setEmpty(false)
    textareaRef.current?.focus()
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full" style={{ background: '#A78BFA' }} />
        <h2 className="text-xl font-bold text-white">Not sure where to start?</h2>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Describe your situation</span>
      </div>

      {/* Input area */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.05)' }}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="e.g. I'm a nurse moving from the Philippines to Canada with two kids, housing affordability is important..."
          rows={3}
          style={{
            width: '100%', padding: '16px 20px', background: 'transparent',
            color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.6',
            border: 'none', outline: 'none', resize: 'none',
          }}
        />
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Press Enter to submit · Chinese or English</p>
          <button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: query.trim() ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${query.trim() ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: query.trim() ? '#A78BFA' : 'rgba(255,255,255,0.25)',
              cursor: query.trim() ? 'pointer' : 'default',
            }}>
            {loading ? 'Analysing…' : 'Find my match →'}
          </button>
        </div>
      </div>

      {/* Example prompts */}
      {!result && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
              {ex.length > 52 ? ex.slice(0, 52) + '…' : ex}
            </button>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-5 rounded-2xl p-6 transition-all"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>

          {/* Understood chips */}
          {result.understood.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '24px' }}>Detected:</span>
              {result.understood.map((u, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#C4B5FD' }}>
                  {u}
                </span>
              ))}
            </div>
          )}

          {/* Empty fallback */}
          {empty && (
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              We couldn't pick up much from that — try mentioning your occupation, a city, or what matters most (housing, jobs, schools).
            </p>
          )}

          {/* Recommendation text */}
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {result.recommendation.text}
          </p>

          {/* CTA */}
          <a href={result.recommendation.url}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.35)', color: '#A78BFA' }}>
            {result.recommendation.ctaText}
          </a>

          {/* Reset */}
          <button onClick={() => { setResult(null); setQuery(''); setEmpty(false) }}
            className="ml-4 text-xs transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.25)', cursor: 'pointer', background: 'none', border: 'none' }}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
