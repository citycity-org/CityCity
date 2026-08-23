import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Income & Housing Calculator',
  description: 'Enter your occupation and income to see how many years it takes to buy a home in Vancouver, Calgary, Toronto, Montréal, and Ottawa. Personalized city fit scores for Canadian cities.',
  alternates: { canonical: 'https://lakive.com/calculate' },
  openGraph: {
    title: 'City Income & Housing Calculator · Lakive',
    description: 'How many years of your salary does it take to buy a home in each Canadian city? Enter your occupation and get personalized city fit scores.',
    url: 'https://lakive.com/calculate',
  },
}

export default function CalculateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
