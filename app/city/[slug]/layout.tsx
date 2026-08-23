import type { Metadata } from 'next'

const CITY_META: Record<string, { name: string; province: string; desc: string }> = {
  vancouver: {
    name: 'Vancouver',
    province: 'BC',
    desc: 'Vancouver city intelligence: housing affordability, salary by occupation, rent pressure, employment outlook, and quality of life scores for professionals and newcomers.',
  },
  toronto: {
    name: 'Toronto',
    province: 'ON',
    desc: 'Toronto city intelligence: housing affordability, salary by occupation, rent pressure, employment outlook, and quality of life scores for professionals and newcomers.',
  },
  calgary: {
    name: 'Calgary',
    province: 'AB',
    desc: 'Calgary city intelligence: housing affordability, no provincial income tax advantage, salary by occupation, rent pressure, employment outlook, and quality of life scores.',
  },
  montreal: {
    name: 'Montréal',
    province: 'QC',
    desc: 'Montréal city intelligence: housing affordability, salary by occupation, rent pressure, employment outlook, and quality of life scores for professionals and newcomers.',
  },
  ottawa: {
    name: 'Ottawa',
    province: 'ON',
    desc: 'Ottawa city intelligence: housing affordability, public sector employment, salary by occupation, rent pressure, and quality of life scores for professionals and newcomers.',
  },
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const city = CITY_META[slug]
  if (!city) return { title: 'City Intelligence · Lakive' }

  const title = `${city.name}, ${city.province} — City Intelligence`
  return {
    title,
    description: city.desc,
    alternates: { canonical: `https://lakive.com/city/${slug}` },
    openGraph: {
      title: `${title} · Lakive`,
      description: city.desc,
      url: `https://lakive.com/city/${slug}`,
    },
  }
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
