'use client'
import { useState, useEffect, useCallback } from 'react'

type Comment = {
  id: string
  author_name: string
  content: string
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  occupation: string
  city: string
  occName: string
  cityName: string
}

export default function Comments({ occupation, city, occName, cityName }: Props) {
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [text, setText]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/comments?occupation=${occupation}&city=${city}`)
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
  }, [occupation, city])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 10) { setError('Please write at least 10 characters.'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupation, city, author_name: name, content: text, honeypot: '' }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setSubmitting(false)
      return
    }
    setSubmitted(true)
    setName('')
    setText('')
    setSubmitting(false)
    fetchComments()
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold" style={{ color: 'white' }}>Real Experiences</h2>
        {!loading && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>
      <p className="text-sm mb-6 -mt-3" style={{ color: 'rgba(255,255,255,0.40)' }}>
        Share your real experience as a {occName} in {cityName} — salary, rent, job market, anything useful.
      </p>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3 mb-6">
          {[1,2].map(i => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="h-3 rounded w-24 mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 rounded w-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl p-6 text-center mb-6" style={{ border: '1px dashed rgba(255,255,255,0.12)' }}>
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No experiences shared yet — be the first.</div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map(c => (
            <div key={c.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'white' }}>{c.author_name}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.60)' }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)' }}>
          <div className="font-semibold text-sm mb-1" style={{ color: '#14B8A6' }}>Thanks for sharing.</div>
          <div className="text-xs" style={{ color: 'rgba(20,184,166,0.70)' }}>Your comment helps others make better decisions.</div>
          <button onClick={() => setSubmitted(false)}
            className="mt-3 text-xs underline underline-offset-2" style={{ color: 'rgba(20,184,166,0.70)' }}>
            Add another comment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-sm font-semibold mb-4" style={{ color: 'white' }}>Share your experience</div>

          <input type="text" name="honeypot" className="hidden" tabIndex={-1} aria-hidden="true" />

          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            />
          </div>
          <div className="mb-3 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Your experience as a ${occName} in ${cityName} — salary, rent, job market, lifestyle...`}
              rows={4}
              maxLength={1000}
              className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            />
            <div className="absolute bottom-2 right-3 text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>{text.length}/1000</div>
          </div>

          {error && <div className="text-xs mb-3" style={{ color: '#F87171' }}>{error}</div>}

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>No account needed · Anonymous OK</p>
            <button
              type="submit"
              disabled={submitting || text.trim().length < 10}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#14B8A6' }}>
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
