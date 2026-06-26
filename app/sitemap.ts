import { MetadataRoute } from 'next'

const CITIES = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.lakive.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/calculate`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/ranking`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map(slug => ({
    url: `${base}/city/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...cityRoutes]
}
