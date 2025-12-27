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
  
  // Rant states
  const [rantText, setRantText] = useState('')
  const [rantLoading, setRantLoading] = useState(false)
  
  // Data dari DB
  const [rants, setRants] = useState([])
  const [artefaks, setArtefaks] = useState([])
  const [activeArtefakId, setActiveArtefakId] = useState(null)
  const [artefakNotationInput, setArtefakNotationInput] = useState('')
  
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
      fetchRants(data.id)
      fetchArtefaks(data.id)
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

  const fetchRants = async (uid) => {
    const { data } = await supabase
      .from('rants')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(5)

    setRants(data || [])
  }

  const fetchArtefaks = async (uid) => {
    const { data } = await supabase
      .from('artefak')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(6)

    setArtefaks(data || [])
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
      fetchArtefaks(userId)
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
      fetchRants(userId)
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

  // Simulasi reaksi emoji (pada demo)
  const mockEmojiResponders = ['@arya', '@dima', '@sena', '@kiko', '@nisa']

  const handleArtefakClick = (artefak) => {
    setActiveArtefakId(artefak.id)
    setArtefakNotationInput(artefak.content || '')
  }

  const saveArtefakNotation = async () => {
    if (artefakNotationInput.length > 300) {
      setError('Notasi maksimal 300 huruf!')
      return
    }

    try {
      await supabase
        .from('artefak')
        .update({ content: artefakNotationInput })
        .eq('id', activeArtefakId)
      
      setSuccess('Notasi artefak diperbarui!')
      setActiveArtefakId(null)
      fetchArtefaks(userId)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Gagal menyimpan notasi.')
      console.error(err)
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
              </div>
            )}
          </div>
        </div>

        {/* 2. ARTEFAK TRAY */}
        {artefaks.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Jejak Visual</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {artefaks.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleArtefakClick(art)}
                  style={{
                    aspectRatio: '1',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Placeholder gambar — dalam praktik nyata bisa ganti dengan URL dari storage */}
                  <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                    🖼️
                  </div>
                  {art.content && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      maxWidth: '80%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {art.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. RANT BOX SECTION */}
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

        {/* 4. JURNAL RANT - TERAKHIR 5 */}
        {rants.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Jejak Rant</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rants.map((rant) => {
                const date = new Date(rant.created_at)
                const formattedDate = date.toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short'
                })
                return (
                  <div key={rant.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#222', color: '#888', fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}>
                      {formattedDate}
                    </div>
                    <p style={{ marginTop: '24px', fontSize: '15px', lineHeight: 1.5 }}>{rant.content}</p>
                    
                    {/* Emoji pulsing */}
                    <button
                      onClick={() => {}}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                    >
                      💖
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. TAGLINE PENUTUP */}
        <div style={{ textAlign: 'center', marginTop: '48px', fontSize: '15px', color: '#888', lineHeight: 1.6, padding: '16px' }}>
          “This is our era. And we’re not asking for permission”<br />
          <span style={{ color: '#343deb' }}>— Glitch Generation</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ width: '100%', background: 'transparent', border: '1px solid #444', color: '#888', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginTop: '32px' }}
        >
          Keluar
        </button>
      </div>

      {/* Modal Notasi Artefak */}
      {activeArtefakId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Tambahkan Notasi</h3>
            <textarea
              value={artefakNotationInput}
              onChange={(e) => setArtefakNotationInput(e.target.value)}
              placeholder="Tulis catatan pribadi (maks. 300 huruf)"
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px'
              }}
              maxLength={300}
            />
            <p style={{ fontSize: '12px', color: '#888', textAlign: 'right', marginTop: '4px' }}>
              {artefakNotationInput.length}/300
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => setActiveArtefakId(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '8px',
                  borderRadius: '8px'
                }}
              >
                Batal
              </button>
              <button
                onClick={saveArtefakNotation}
                style={{
                  flex: 1,
                  background: '#343deb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animasi */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
