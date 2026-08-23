import type { Metadata } from 'next'

const CITY_NAMES: Record<string, string> = {
  vancouver: 'Vancouver', toronto: 'Toronto', calgary: 'Calgary',
  montreal: 'Montréal', ottawa: 'Ottawa',
}

function formatOccupation(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata(
  { params }: { params: Promise<{ occupation: string; city: string }> }
): Promise<Metadata> {
  const { occupation, city } = await params
  const occName  = formatOccupation(occupation)
  const cityName = CITY_NAMES[city] ?? city.charAt(0).toUpperCase() + city.slice(1)

  const title = `${occName} in ${cityName} — Housing, Salary & City Fit`
  const desc  = `How many years of income does a ${occName} need to buy a home in ${cityName}? Housing affordability, rent pressure, employment outlook, and city fit score.`

  return {
    title,
    description: desc,
    alternates: { canonical: `https://lakive.com/guide/${occupation}/${city}` },
    openGraph: {
      title: `${title} · Lakive`,
      description: desc,
      url: `https://lakive.com/guide/${occupation}/${city}`,
    },
  }
}

export default function GuideOccCityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
