'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/calculate') }, [router])
  return null
}
