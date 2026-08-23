import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Canadian City Rankings',
  description: 'Rank Canadian cities by housing affordability, employment opportunity, tax advantage, and quality of life — filtered by occupation and property type. Compare Vancouver, Calgary, Toronto, Montréal, Ottawa.',
  alternates: { canonical: 'https://lakive.com/ranking' },
  openGraph: {
    title: 'Canadian City Rankings by Occupation · Lakive',
    description: 'See which Canadian city ranks best for your profession. Filter by occupation, housing type, and region to find your ideal city.',
    url: 'https://lakive.com/ranking',
  },
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
