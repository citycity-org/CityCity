import { NextResponse } from 'next/server'

// CBC News RSS feeds by city — free, public broadcaster, reliable
const CITY_FEEDS = [
  { city: 'Calgary',   color: '#EF4444', feed: 'https://www.cbc.ca/cmlink/rss-canada-calgary' },
  { city: 'Ottawa',    color: '#4F8EF7', feed: 'https://www.cbc.ca/cmlink/rss-canada-ottawa' },
  { city: 'Toronto',   color: '#F59E0B', feed: 'https://www.cbc.ca/cmlink/rss-canada-toronto' },
  { city: 'Vancouver', color: '#E86C2F', feed: 'https://www.cbc.ca/cmlink/rss-canada-british-columbia' },
  { city: 'Montréal',  color: '#14B8A6', feed: 'https://www.cbc.ca/cmlink/rss-canada-montreal' },
]

// Keywords relevant to career, housing, cost of living, business
const RELEVANT_KEYWORDS = [
  // Housing & real estate
  'housing', 'rent', 'rental', 'mortgage', 'home price', 'real estate', 'condo',
  'apartment', 'affordable', 'affordability', 'eviction', 'landlord', 'tenant',
  // Jobs & career
  'job', 'jobs', 'hiring', 'layoff', 'salary', 'wage', 'wages', 'employment',
  'unemployment', 'worker', 'workers', 'workforce', 'career', 'occupation',
  'nurse', 'doctor', 'engineer', 'teacher', 'trades', 'electrician',
  // Cost of living & economy
  'inflation', 'cost of living', 'grocery', 'groceries', 'price', 'prices',
  'economy', 'economic', 'interest rate', 'bank of canada', 'recession',
  'gdp', 'income', 'tax', 'budget',
  // Business
  'business', 'company', 'startup', 'investment', 'developer', 'office',
  'tech', 'technology', 'industry', 'sector',
]

function isRelevant(title: string): boolean {
  const lower = title.toLowerCase()
  return RELEVANT_KEYWORDS.some(kw => lower.includes(kw))
}

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

function parseRSS(xml: string, scanLimit = 30): NewsItem[] {
  const all: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  let scanned = 0
  while ((match = itemRegex.exec(xml)) !== null && scanned < scanLimit) {
    scanned++
    const block = match[1]
    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''
    const link =
      block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ??
      block.match(/<link\s[^>]*href="([^"]+)"/)?.[1] ?? ''
    const date = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? ''
    const clean = title
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
    if (clean) all.push({ title: clean, link: link.trim(), date: date.trim() })
  }
  // Filter to relevant news first; fallback to top 3 if nothing matches
  const filtered = all.filter(i => isRelevant(i.title))
  return (filtered.length >= 2 ? filtered : all).slice(0, 4)
}

function relativeTime(dateStr: string): string {
  try {
    const ms = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(ms / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
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
        headers: { 'User-Agent': 'Lakive/1.0 (city intelligence platform)' },
      })
      if (!res.ok) throw new Error(`RSS fetch failed for ${city}: ${res.status}`)
      const xml   = await res.text()
      const raw   = parseRSS(xml, 30)
      const items = raw.map(item => ({ ...item, date: relativeTime(item.date) }))
      return { city, color, items } as CityNews
    })
  )

  const news: CityNews[] = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<CityNews>).value)
    .filter(c => c.items.length > 0)

  return NextResponse.json(news, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  })
}
