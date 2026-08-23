import { MetadataRoute } from 'next'

const BASE = 'https://lakive.com'

// Static pages with their change frequency and priority
const STATIC_ROUTES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  { url: '/',           priority: 1.0,  changeFrequency: 'weekly'  },
  { url: '/calculate',  priority: 0.95, changeFrequency: 'weekly'  },
  { url: '/ranking',    priority: 0.95, changeFrequency: 'weekly'  },
  { url: '/compare',    priority: 0.90, changeFrequency: 'weekly'  },
  { url: '/pulse',      priority: 0.85, changeFrequency: 'daily'   },
  { url: '/guide',      priority: 0.80, changeFrequency: 'monthly' },
  { url: '/guide/rent-vs-own',          priority: 0.75, changeFrequency: 'monthly' },
  { url: '/guide/education-licensing',  priority: 0.70, changeFrequency: 'monthly' },
  { url: '/reports',    priority: 0.80, changeFrequency: 'monthly' },
  { url: '/reports/vancouver-livability-worker-affordability-2026', priority: 0.70, changeFrequency: 'yearly' },
  { url: '/reports/canada-cities-on-the-rise-2026',                 priority: 0.70, changeFrequency: 'yearly' },
  { url: '/reports/monthly-report-july-2026',                       priority: 0.65, changeFrequency: 'yearly' },
  { url: '/reports/workcation-mirage',                              priority: 0.65, changeFrequency: 'yearly' },
  { url: '/newsletter', priority: 0.75, changeFrequency: 'monthly' },
  { url: '/about',      priority: 0.60, changeFrequency: 'monthly' },
  { url: '/contact',    priority: 0.55, changeFrequency: 'yearly'  },
]

// Active cities
const CITY_SLUGS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']

// Key occupation slugs (subset for guide pages)
const OCC_SLUGS = [
  'nurse', 'software-engineer', 'electrician', 'teacher',
  'accountant', 'truck-driver', 'civil-engineer', 'pharmacist',
  'data-analyst', 'registered-nurse',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const statics = STATIC_ROUTES.map(r => ({
    url: `${BASE}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // City detail pages
  const cityPages = CITY_SLUGS.map(slug => ({
    url: `${BASE}/city/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Guide occupation × city pages
  const guidePages = OCC_SLUGS.flatMap(occ =>
    CITY_SLUGS.map(city => ({
      url: `${BASE}/guide/${occ}/${city}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))
  )

  return [...statics, ...cityPages, ...guidePages]
}
