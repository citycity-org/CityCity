import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Canadian Cities',
  description: 'Side-by-side comparison of Canadian cities by housing affordability, salary, taxes, and quality of life. Compare Calgary vs Toronto, Vancouver vs Ottawa, and more — by occupation.',
  alternates: { canonical: 'https://lakive.com/compare' },
  openGraph: {
    title: 'Compare Canadian Cities Side-by-Side · Lakive',
    description: 'Calgary vs Toronto, Vancouver vs Calgary — compare any two Canadian cities by housing costs, income, taxes, and career demand for your specific occupation.',
    url: 'https://lakive.com/compare',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
