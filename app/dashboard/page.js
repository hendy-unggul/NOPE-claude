'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [activeTab, setActiveTab] = useState('artefak')
  const [content, setContent] = useState('')
  const [emoji, setEmoji] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [canSubmitArtefak, setCanSubmitArtefak] = useState(true)
  const [mounted, setMounted] = useState(false)

  const emojis = ['👀', '🤠', '😭', '🔥']

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('nope_username')
      if (!storedUsername) {
        window.location.href = '/'
        return
      }
      setUsername(storedUsername)
      loadUser(storedUsername)
    }
  }, [])

  const loadUser = async (uname) => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', uname)
      .single()
    
    if (data) {
      setUserId(data.id)
      checkArtefakLimit(data.id)
    }
  }

  const checkArtefakLimit = async (uid) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data } = await supabase
      .from('artefak')
      .select('created_at')
      .eq('user_id', uid)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    setCanSubmitArtefak(!data || data.length === 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!content.trim()) {
      setError('Isi dulu dong!')
      setLoading(false)
      return
    }

    if (activeTab === 'rant' && !emoji) {
      setError('Pilih emoji dulu!')
      setLoading(false)
      return
    }

    try {
      if (activeTab === 'artefak') {
        if (!canSubmitArtefak) {
          setError('Artefak hanya bisa 30 hari sekali!')
          setLoading(false)
          return
        }
        await supabase.from('artefak').insert([{
          user_id: userId,
          content: content.trim()
        }])
        setSuccess('Artefak tersimpan! 🎉')
        setCanSubmitArtefak(false)
      } else {
        await supabase.from('rants').insert([{
          user_id: userId,
          content: content.trim(),
          emoji_response: emoji
        }])
        setSuccess('Rant terkirim! ' + emoji)
      }

      setContent('')
      setEmoji('')
    } catch (err) {
      setError('Gagal menyimpan. Coba lagi.')
      console.error(err)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nope_username')
      window.location.href = '/'
    }
  }

  if (!mounted || !username) {
    return (
      <div className="container">
        <div className="card">
          <p className="tagline">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h1>NOPE</h1>
        <p className="tagline">Halo, {username}! 👋</p>

        <div className="tabs">
          <div
            className={`tab ${activeTab === 'artefak' ? 'active' : ''}`}
            onClick={() => setActiveTab('artefak')}
          >
            Jejak Artefak
          </div>
          <div
            className={`tab ${activeTab === 'rant' ? 'active' : ''}`}
            onClick={() => setActiveTab('rant')}
          >
            Rant
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'artefak' ? (
            <>
              <h2>Jejak Artefak</h2>
              {!canSubmitArtefak && (
                <div className="error">Artefak hanya bisa 30 hari sekali!</div>
              )}
              <textarea
                placeholder="Tulis jejak artefak kamu..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading || !canSubmitArtefak}
              />
            </>
          ) : (
            <>
              <h2>Rant</h2>
              <textarea
                placeholder="Tulis rant kamu..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
              <div className="emoji-grid">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`emoji-btn ${emoji === em ? 'selected' : ''}`}
                    onClick={() => setEmoji(em)}
                    disabled={loading}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button type="submit" disabled={loading || (activeTab === 'artefak' && !canSubmitArtefak)}>
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>

        <button className="logout-btn" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </div>
  )
}
