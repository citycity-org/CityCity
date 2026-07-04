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

// ── Enabled combos ────────────────────────────────────────────────────────────
const ENABLED = new Set([
  'registered-nurse:calgary',   'registered-nurse:toronto',   'registered-nurse:vancouver',
  'software-engineer:vancouver','software-engineer:toronto',  'software-engineer:calgary',
  'electrician:calgary',        'electrician:vancouver',
  'family-physician:calgary',   'family-physician:vancouver',
  'accountant:toronto',         'accountant:calgary',
  'truck-driver:calgary',       'police-officer:calgary',
])

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

  const enabled = ENABLED.has(`${occupation}:${city}`)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/comments?occupation=${occupation}&city=${city}`)
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
  }, [occupation, city])

  useEffect(() => { if (enabled) fetchComments() }, [enabled, fetchComments])

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

  if (!enabled) return null

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900">Real Experiences</h2>
        {!loading && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-6 -mt-3">
        Share your real experience as a {occName} in {cityName} — salary, rent, job market, anything useful.
      </p>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3 mb-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center mb-6">
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm text-gray-400">No experiences shared yet — be the first.</div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">{c.author_name}</span>
                <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
          <div className="text-teal-700 font-semibold text-sm mb-1">Thanks for sharing.</div>
          <div className="text-teal-600 text-xs">Your comment helps others make better decisions.</div>
          <button onClick={() => setSubmitted(false)}
            className="mt-3 text-xs text-teal-600 underline underline-offset-2">
            Add another comment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-800 mb-4">Share your experience</div>

          {/* Honeypot — hidden from real users */}
          <input type="text" name="honeypot" className="hidden" tabIndex={-1} aria-hidden="true" />

          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="mb-3 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Your experience as a ${occName} in ${cityName} — salary, rent, job market, lifestyle...`}
              rows={4}
              maxLength={1000}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 text-gray-800 placeholder-gray-400 resize-none"
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-300">{text.length}/1000</div>
          </div>

          {error && (
            <div className="text-xs text-red-500 mb-3">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">No account needed · Anonymous OK</p>
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
