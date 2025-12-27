'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // Artefak states
  const [artefakImage, setArtefakImage] = useState(null)
  const [artefakPreview, setArtefakPreview] = useState('')
  const [artefakNotation, setArtefakNotation] = useState('')
  const [canUploadArtefak, setCanUploadArtefak] = useState(true)
  const [showArtefakEmojis, setShowArtefakEmojis] = useState(false)
  const [artefakResponders, setArtefakResponders] = useState([])
  
  // Rant states
  const [rantText, setRantText] = useState('')
  const [rantLoading, setRantLoading] = useState(false)
  
  // General states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

    setCanUploadArtefak(!data || data.length === 0)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setArtefakImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setArtefakPreview(reader.result)
        }
        reader.readAsDataURL(file)
        setError('')
      } else {
        setError('File harus gambar!')
      }
    }
  }

  const handleArtefakUpload = async () => {
    if (!artefakImage) {
      setError('Pilih foto dulu!')
      return
    }

    const words = artefakNotation.trim().split(' ').filter(w => w)
    if (words.length > 4) {
      setError('Notasi maksimal 4 kata!')
      return
    }

    if (!canUploadArtefak) {
      setError('Artefak hanya bisa 30 hari sekali!')
      return
    }

    try {
      // NOTE: Ini versi simple - foto tidak diupload ke storage
      // Hanya save notasi saja
      await supabase.from('artefak').insert([{
        user_id: userId,
        content: artefakNotation.trim(),
        emoji_response: ''
      }])
      
      setSuccess('Artefak diabadikan! 🎉')
      setArtefakImage(null)
      setArtefakPreview('')
      setArtefakNotation('')
      setCanUploadArtefak(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Gagal upload. Coba lagi.')
      console.error(err)
    }
  }

  const handleRantSubmit = async () => {
    if (!rantText.trim()) {
      setError('Tulis dulu perasaanmu!')
      return
    }

    if (rantText.length > 300) {
      setError('Maksimal 300 huruf!')
      return
    }

    setRantLoading(true)
    try {
      await supabase.from('rants').insert([{
        user_id: userId,
        content: rantText.trim(),
        emoji_response: ''
      }])
      
      setSuccess('Rant terlepaskan! 💨')
      setRantText('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Gagal kirim. Coba lagi.')
      console.error(err)
    }
    setRantLoading(false)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nope_username')
      window.location.href = '/'
    }
  }

  if (!mounted || !username) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#888' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '16px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '672px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>NOPE</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>Halo, {username}! 👋</p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#22c55e', fontSize: '14px', textAlign: 'center' }}>
            {success}
          </div>
        )}

        {/* 1. ARTEFAK SECTION */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Artefak</h2>
          
          {!canUploadArtefak && (
            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', color: '#eab308', fontSize: '14px' }}>
              Artefak berikutnya bisa diunggah 30 hari lagi
            </div>
          )}

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', position: 'relative' }}>
            {!artefakPreview ? (
              <label style={{ display: 'block', cursor: canUploadArtefak ? 'pointer' : 'not-allowed' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!canUploadArtefak}
                  style={{ display: 'none' }}
                />
                <div style={{ aspectRatio: '16/9', background: '#000', border: '2px dashed #444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <svg style={{ width: '48px', height: '48px', margin: '0 auto 8px', color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                      {canUploadArtefak ? 'Klik untuk unggah foto' : 'Tunggu 30 hari'}
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <img 
                  src={artefakPreview} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '80px' }}>
                  <input
                    type="text"
                    value={artefakNotation}
                    onChange={(e) => setArtefakNotation(e.target.value)}
                    placeholder="notasi (max 4 kata)"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', padding: '8px 12px', fontSize: '14px', color: '#fff' }}
                    maxLength={50}
                  />
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {artefakNotation.trim().split(' ').filter(w => w).length}/4 kata
                  </p>
                </div>

                <button
                  onClick={handleArtefakUpload}
                  style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#3b82f6', color: '#fff', padding: '8px 24px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}
                >
                  Abadikan
                </button>

                <button
                  onClick={() => setShowArtefakEmojis(!showArtefakEmojis)}
                  style={{ position: 'absolute', top: '16px', right: '16px', width: '48px', height: '48px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', fontSize: '24px', cursor: 'pointer', animation: 'pulse 2s ease-in-out infinite' }}
                >
                  ❤️
                </button>

                {showArtefakEmojis && (
                  <div style={{ position: 'absolute', top: '80px', right: '16px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.3)', minWidth: '150px' }}>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Respons terakhir:</p>
                    {artefakResponders.length > 0 ? (
                      artefakResponders.slice(0, 3).map((user, i) => (
                        <div key={i} style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>
                          {user}
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '14px', color: '#666' }}>Belum ada respons</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. RANT BOX SECTION */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Rant</h2>
          
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <textarea
                value={rantText}
                onChange={(e) => setRantText(e.target.value)}
                placeholder="...perasaanmu dalam 300 huruf"
                style={{ width: '100%', background: '#000', border: '1px solid #444', borderRadius: '8px', padding: '12px', paddingRight: '120px', color: '#fff', fontSize: '14px', resize: 'none' }}
                rows={5}
                maxLength={300}
              />
              
              <button
                onClick={handleRantSubmit}
                disabled={rantLoading || !rantText.trim()}
                style={{ position: 'absolute', bottom: '12px', right: '12px', background: rantText.trim() ? '#3b82f6' : '#444', color: '#fff', padding: '6px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: rantText.trim() ? 'pointer' : 'not-allowed' }}
              >
                {rantLoading ? '...' : 'lepaskan'}
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888' }}>
                {rantText.length}/300 huruf
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ width: '100%', background: 'transparent', border: '1px solid #444', color: '#888', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Keluar
        </button>
      </div>
    </div>
  )
}
