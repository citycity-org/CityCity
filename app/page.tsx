import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Lakive — Find Your City. Build Your Future.',
  description: 'Compare Canadian cities by housing affordability, salary, taxes, and quality of life. Data-driven city intelligence for newcomers, professionals, and families deciding where to live.',
  alternates: { canonical: 'https://lakive.com' },
  openGraph: {
    title: 'Lakive — Find Your City. Build Your Future.',
    description: 'Compare Canadian cities by housing affordability, salary, taxes, and quality of life. Data-driven city intelligence for newcomers, professionals, and families.',
    url: 'https://lakive.com',
    type: 'website',
  },
}

export default function HomePage() {
  return <HomeClient />
}
