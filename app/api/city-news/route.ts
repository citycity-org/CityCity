import { NextResponse } from 'next/server'

// News feeds — one primary (Google News date-sorted) + one fallback (CBC regional) per city.
// Google News: sort=date forces chronological order so stale articles don't surface.
// CBC regional RSS: reliable fallback when Google blocks Vercel's datacenter IPs.
const CITY_FEEDS = [
  {
    city:  'Calgary',
    color: '#EF4444',
    feeds: [
      'https://news.google.com/rss/search?q=Calgary+housing+OR+rent+OR+jobs+OR+economy&hl=en-CA&gl=CA&ceid=CA:en&sort=date',
      'https://www.cbc.ca/cmlink/rss-canada-calgary',
    ],
  },
  {
    city:  'Ottawa',
    color: '#4F8EF7',
    feeds: [
      'https://news.google.com/rss/search?q=Ottawa+housing+OR+rent+OR+jobs+OR+economy&hl=en-CA&gl=CA&ceid=CA:en&sort=date',
      'https://www.cbc.ca/cmlink/rss-canada-ottawa',
    ],
  },
  {
    city:  'Toronto',
    color: '#F59E0B',
    feeds: [
      'https://news.google.com/rss/search?q=Toronto+housing+OR+rent+OR+jobs+OR+economy&hl=en-CA&gl=CA&ceid=CA:en&sort=date',
      'https://www.cbc.ca/cmlink/rss-canada-toronto',
    ],
  },
  {
    city:  'Vancouver',
    color: '#E86C2F',
    feeds: [
      'https://news.google.com/rss/search?q=Vancouver+housing+OR+rent+OR+jobs+OR+economy&hl=en-CA&gl=CA&ceid=CA:en&sort=date',
      'https://www.cbc.ca/cmlink/rss-canada-britishcolumbia',
    ],
  },
  {
    city:  'Montréal',
    color: '#14B8A6',
    feeds: [
      'https://news.google.com/rss/search?q=Montreal+housing+OR+rent+OR+jobs+OR+economy&hl=en-CA&gl=CA&ceid=CA:en&sort=date',
      'https://www.cbc.ca/cmlink/rss-canada-montreal',
    ],
  },
]

// Max article age: 14 days. Older articles are dropped regardless of source.
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

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

// Parse RSS XML → raw items with parsed date for sorting/filtering
function parseRSS(xml: string): (NewsItem & { timestamp: number })[] {
  const items: (NewsItem & { timestamp: number })[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]

    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''

    const link =
      block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ??
      block.match(/<link\s[^>]*href="([^"]+)"/)?.[1] ?? ''

    const dateStr = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''
    const timestamp = dateStr ? new Date(dateStr).getTime() : 0

    const clean = title
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()

    if (clean && link && timestamp > 0) {
      items.push({ title: clean, link, date: dateStr, timestamp })
    }
  }

  // Sort newest-first, filter out articles older than MAX_AGE_MS
  const cutoff = Date.now() - MAX_AGE_MS
  return items
    .filter(item => item.timestamp >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp)
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

// Fetch one feed URL, return parsed fresh items or throw
async function fetchFeed(url: string): Promise<(NewsItem & { timestamp: number })[]> {
  const res = await fetch(url, {
    next: { revalidate: 900 },   // 15-min server-side cache (was 30 min)
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Lakive/1.0; +https://lakive.com)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = await res.text()
  const items = parseRSS(xml)
  if (!items.length) throw new Error('No recent items')
  return items
}

export async function GET() {
  const results = await Promise.allSettled(
    CITY_FEEDS.map(async ({ city, color, feeds }) => {
      let raw: (NewsItem & { timestamp: number })[] = []

      // Try each feed in order; stop at the first that returns fresh items
      for (const feedUrl of feeds) {
        try {
          raw = await fetchFeed(feedUrl)
          if (raw.length) break
        } catch (err) {
          console.warn(`[city-news] ${city} feed failed (${feedUrl}):`, err)
        }
      }

      if (!raw.length) throw new Error(`All feeds failed for ${city}`)

      const items: NewsItem[] = raw
        .slice(0, 4)
        .map(({ title, link, timestamp }) => ({
          title,
          link,
          date: relativeTime(new Date(timestamp).toUTCString()),
        }))

      return { city, color, items } as CityNews
    })
  )

  const news: CityNews[] = results
    .filter((r): r is PromiseFulfilledResult<CityNews> => r.status === 'fulfilled')
    .map(r => r.value)

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`[city-news] ${CITY_FEEDS[i].city} all feeds exhausted:`, r.reason)
    }
  })

  return NextResponse.json(news, {
    // 15-min CDN cache; allow up to 5-min stale while revalidating (not indefinite)
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
  })
}
