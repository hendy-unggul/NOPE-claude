'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('nope_username')
    if (saved) {
      router.push('/dashboard')
    } else {
      router.push('/welcome')
    }
  }, [router])

  return null
}
