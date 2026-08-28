import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Price — Community Cost of Living Data',
  description: 'Help track the real cost of living across Canadian cities. Submit grocery, gas, restaurant, and transit prices in Vancouver, Toronto, Calgary, Montréal, and Ottawa.',
  alternates: { canonical: 'https://lakive.com/prices/submit' },
  openGraph: {
    title: 'Submit a Price · Lakive',
    description: 'Help track the real cost of living across Canadian cities. Your data shapes the Lakive city index.',
    url: 'https://lakive.com/prices/submit',
  },
}

export default function PriceSubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
