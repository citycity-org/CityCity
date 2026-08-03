import { NextResponse } from 'next/server'

// Google News RSS — searches return pre-filtered relevant headlines
// Query includes housing/jobs/economy keywords so we skip keyword filtering
const CITY_FEEDS = [
  {
    city:  'Calgary',
    color: '#EF4444',
    feed:  'https://news.google.com/rss/search?q=Calgary+housing+jobs+economy+rent+business&hl=en-CA&gl=CA&ceid=CA:en',
  },
  {
    city:  'Ottawa',
    color: '#4F8EF7',
    feed:  'https://news.google.com/rss/search?q=Ottawa+housing+jobs+economy+rent+business&hl=en-CA&gl=CA&ceid=CA:en',
  },
  {
    city:  'Toronto',
    color: '#F59E0B',
    feed:  'https://news.google.com/rss/search?q=Toronto+housing+jobs+economy+rent+business&hl=en-CA&gl=CA&ceid=CA:en',
  },
  {
    city:  'Vancouver',
    color: '#E86C2F',
    feed:  'https://news.google.com/rss/search?q=Vancouver+housing+jobs+economy+rent+business&hl=en-CA&gl=CA&ceid=CA:en',
  },
  {
    city:  'Montréal',
    color: '#14B8A6',
    feed:  'https://news.google.com/rss/search?q=Montreal+housing+jobs+economy+rent+business&hl=en-CA&gl=CA&ceid=CA:en',
  },
]

export interface NewsItem {
  title: string
  link:  string
  date:  string
}

export interface CityNews {
  city:  string
  color: string
  items: NewsItem[]
}

function parseRSS(xml: string, limit = 4): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1]

    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''

    // Google News wraps the real link in <link> after a blank line
    const link =
      block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ??
      block.match(/<link\s[^>]*href="([^"]+)"/)?.[1] ?? ''

    const date = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''

    const clean = title
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()

    if (clean && link) items.push({ title: clean, link, date })
  }

  return items
}

function relativeTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const ms = Date.now() - new Date(dateStr).getTime()
    const m  = Math.floor(ms / 60000)
    if (m < 60)  return `${m}m ago`
    const h  = Math.floor(m / 60)
    if (h < 24)  return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch {
    return ''
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    CITY_FEEDS.map(async ({ city, color, feed }) => {
      const res = await fetch(feed, {
        next: { revalidate: 1800 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Lakive/1.0; +https://lakive.com)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })
      if (!res.ok) throw new Error(`RSS ${city}: ${res.status}`)
      const xml   = await res.text()
      const raw   = parseRSS(xml, 4)
      const items = raw.map(item => ({ ...item, date: relativeTime(item.date) }))
      if (!items.length) throw new Error(`No items for ${city}`)
      return { city, color, items } as CityNews
    })
  )

  const news: CityNews[] = results
    .filter((r): r is PromiseFulfilledResult<CityNews> => r.status === 'fulfilled')
    .map(r => r.value)

  // Log failures server-side (visible in Vercel logs)
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[city-news] ${CITY_FEEDS[i].city} failed:`, r.reason)
    }
  })

  return NextResponse.json(news, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  })
}
