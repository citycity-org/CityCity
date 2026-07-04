import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Enabled pages (occupation:city) ──────────────────────────────────────────
const ENABLED = new Set([
  'registered-nurse:calgary',
  'registered-nurse:toronto',
  'registered-nurse:vancouver',
  'software-engineer:vancouver',
  'software-engineer:toronto',
  'software-engineer:calgary',
  'electrician:calgary',
  'electrician:vancouver',
  'family-physician:calgary',
  'family-physician:vancouver',
  'accountant:toronto',
  'accountant:calgary',
  'truck-driver:calgary',
  'police-officer:calgary',
])

// ── Simple in-memory rate limit (per IP, max 3 posts / hour) ─────────────────
const rateLimitMap = new Map<string, number[]>()
function isRateLimited(ipHash: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const timestamps = (rateLimitMap.get(ipHash) ?? []).filter(t => now - t < window)
  if (timestamps.length >= 3) return true
  rateLimitMap.set(ipHash, [...timestamps, now])
  return false
}

// ── GET: fetch comments for a page ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const occupation = searchParams.get('occupation') ?? ''
  const city       = searchParams.get('city') ?? ''

  if (!occupation || !city) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('guide_comments')
    .select('id, author_name, content, created_at')
    .eq('occupation', occupation)
    .eq('city', city)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

// ── POST: submit a new comment ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { occupation, city, author_name, content, honeypot } = body

  // Bot trap
  if (honeypot) return NextResponse.json({ ok: true })

  // Validate enabled
  if (!ENABLED.has(`${occupation}:${city}`)) {
    return NextResponse.json({ error: 'Comments not enabled for this page' }, { status: 403 })
  }

  // Validate content
  const name = (author_name ?? '').trim().slice(0, 50) || 'Anonymous'
  const text = (content ?? '').trim()
  if (text.length < 10)   return NextResponse.json({ error: 'Comment too short (min 10 chars)' }, { status: 400 })
  if (text.length > 1000) return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 })

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
  if (isRateLimited(ipHash)) {
    return NextResponse.json({ error: 'Too many comments — please wait an hour.' }, { status: 429 })
  }

  const { error } = await supabase.from('guide_comments').insert({
    occupation,
    city,
    author_name: name,
    content: text,
    ip_hash: ipHash,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
