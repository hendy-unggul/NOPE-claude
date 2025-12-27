'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const words = username.trim().split(' ')
    if (words.length !== 2) {
      setError('Username harus 2 kata (contoh: kucing merah)')
      setLoading(false)
      return
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ username: username.toLowerCase() }])
        
        if (insertError) throw insertError
      }

      localStorage.setItem('nope_username', username.toLowerCase())
      router.push('/dashboard')
    } catch (err) {
      setError('Terjadi error. Coba lagi.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <div className="card">
        <h1>NOPE</h1>
        <p className="tagline">
          Bukan kamu yang aneh<br />tapi systemnya yang broken!
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ketik 2 kata (contoh: kucing merah)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Tunggu...' : 'Masuk'}
          </button>
        </form>
        
        <p className="info">
          Tanpa password • Tanpa email • Tanpa konfirmasi
        </p>
      </div>
    </div>
  )
}
