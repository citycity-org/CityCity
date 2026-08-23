'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResultsRedirect() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    // Preserve relevant params when redirecting to /calculate
    const occ  = params.get('occ') || params.get('occupation')
    const city = params.get('city')
    const dest = occ ? `/calculate?occupation=${occ}${city ? `&city=${city}` : ''}` : '/calculate'
    router.replace(dest)
  }, [router, params])
  return null
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsRedirect />
    </Suspense>
  )
}
