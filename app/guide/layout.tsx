import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'City & Career Guides',
  description: 'In-depth guides on housing affordability, tax advantages, career demand, rent vs own, and licensing requirements — by occupation and Canadian city.',
  alternates: { canonical: 'https://lakive.com/guide' },
  openGraph: {
    title: 'Canadian City & Career Guides · Lakive',
    description: 'Guides on housing affordability by occupation, tax advantages, rent vs own breakeven, and professional licensing requirements across Canadian cities.',
    url: 'https://lakive.com/guide',
  },
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
