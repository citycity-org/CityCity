import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/s/',        // share short-links — dynamic, low value
          '/subscribe', // subscription flow
          '/share',
        ],
      },
    ],
    sitemap: 'https://lakive.com/sitemap.xml',
    host: 'https://lakive.com',
  }
}
