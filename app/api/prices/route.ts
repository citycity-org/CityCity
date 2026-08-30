import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { PRICE_ITEMS_MAP } from '@/lib/price-items'

const VALID_CITIES = new Set([
  // Canada
  'vancouver', 'toronto', 'calgary', 'montreal', 'ottawa',
  // United States
  'seattle', 'san-francisco', 'new-york', 'boston',
])

export async function POST(req: NextRequest) {
  // ── Rate limit: 20 submissions per hour per IP ──────────────────────────────
  const ip = getClientIp(req)
  const { allowed } = rateLimit(ip, 'prices', { limit: 20, window: 3600 })
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 },
    )
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: {
    city:           string
    item_id:        string
    price:          number
    observed_date?: string
    store?:         string
    email?:         string
    photo_url?:     string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { city, item_id, price, observed_date, store, email, photo_url } = body

  // ── Validate city ───────────────────────────────────────────────────────────
  if (!city || !VALID_CITIES.has(city)) {
    return NextResponse.json({ error: 'Invalid city.' }, { status: 400 })
  }

  // ── Validate item ───────────────────────────────────────────────────────────
  const item = PRICE_ITEMS_MAP[item_id]
  if (!item) {
    return NextResponse.json({ error: 'Unknown item.' }, { status: 400 })
  }

  // ── Validate price ──────────────────────────────────────────────────────────
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return NextResponse.json({ error: 'Invalid price.' }, { status: 400 })
  }

  if (price < item.min || price > item.max) {
    return NextResponse.json(
      { error: `Price out of expected range for ${item.label} (${item.currency} ${item.min}–${item.max}).` },
      { status: 422 },
    )
  }

  // ── Validate observed_date ──────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  let safeDate = today
  if (observed_date) {
    const d = new Date(observed_date)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    if (!isNaN(d.getTime()) && d <= now && d >= sevenDaysAgo) {
      safeDate = observed_date
    }
  }

  // ── Validate email ──────────────────────────────────────────────────────────
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // ── Compute unit price ──────────────────────────────────────────────────────
  const unit_price = item.std_qty > 0
    ? Math.round((price / item.std_qty) * 10000) / 10000
    : price

  // ── Insert ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient()
  const { error: dbError } = await supabase.from('price_submissions').insert({
    city,
    category:      item.category,
    item_id,
    item_label:    item.label,
    price,
    unit:          item.unit,
    unit_price,
    std_qty:       item.std_qty,
    std_unit:      item.std_unit,
    currency:      item.currency,
    observed_date: safeDate,
    store:         store?.trim() || null,
    email:         email?.trim() || null,
    photo_url:     photo_url || null,
    status:        'pending',
  })

  if (dbError) {
    console.error('[prices] Supabase insert error:', dbError.message)
    return NextResponse.json(
      { error: 'Failed to save submission. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
