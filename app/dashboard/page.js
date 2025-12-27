import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Artefak states
  const [artefakImage, setArtefakImage] = useState(null)
  const [artefakPreview, setArtefakPreview] = useState('')
  const [artefakNotation, setArtefakNotation] = useState('')
  const [canUploadArtefak, setCanUploadArtefak] = useState(true)

  // Rant states
  const [rantText, setRantText] = useState('')
  const [rantLoading, setRantLoading] = useState(false)

  // Modal notasi artefak
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

  const handleArtefakClick = (index) => {
    setActiveArtefakId(index)
    setArtefakNotationInput('')
  }

  const saveArtefakNotation = async () => {
    if (artefakNotationInput.length > 300) {
      setError('Notasi maksimal 300 huruf!')
      return
    }

    setSuccess('Notasi disimpan sementara')
    setActiveArtefakId(null)
    setTimeout(() => setSuccess(''), 3000)
  }

  if (!mounted || !username) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#888' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      padding: '16px', 
      paddingBottom: '80px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <div style={{ 
        maxWidth: '672px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          paddingTop: '16px'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>NOPE</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ⋮
          </button>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '12px', 
            padding: '8px 12px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '6px', 
            color: '#ef4444', 
            fontSize: '12px', 
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            marginBottom: '12px', 
            padding: '8px 12px', 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            borderRadius: '6px', 
            color: '#22c55e', 
            fontSize: '12px', 
            textAlign: 'center' 
          }}>
            {success}
          </div>
        )}

        {/* NAVIGASI 4 TOMBOL — SATU BARIS, MONOCHROME */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          background: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '6px'
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: '#3b82f6',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '12px'
            }}
          >
            Jejak
          </button>
          <button
            onClick={() => alert('Frekuensi')}
            style={{
              background: '#1f2937',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #444',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '12px'
            }}
          >
            Frekuensi
          </button>
          <button
            onClick={() => alert('SayNOPE')}
            style={{
              background: '#1f2937',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #444',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '12px'
            }}
          >
            SayNOPE
          </button>
          <button
            onClick={() => alert('GLITCH')}
            style={{
              background: '#1f2937',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #444',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '12px'
            }}
          >
            GLITCH
          </button>
        </div>

        {/* ARTEFAK SECTION — TANPA HEADLINE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            background: '#111', 
            border: '1px solid #222', 
            borderRadius: '8px', 
            padding: '16px',
            position: 'relative'
          }}>
            {!artefakPreview ? (
              <label style={{ display: 'block', cursor: canUploadArtefak ? 'pointer' : 'not-allowed' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!canUploadArtefak}
                  style={{ display: 'none' }}
                />
                <div style={{ 
                  aspectRatio: '16/9', 
                  background: '#000', 
                  border: '1px dashed #444', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <svg style={{ width: '32px', height: '32px', margin: '0 auto 4px', color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p style={{ margin: 0, textAlign: 'center' }}>
                    {canUploadArtefak ? 'unggah foto' : 'tunggu 30 hari'}
                  </p>
                </div>
              </label>
            ) : (
              <div style={{ 
                position: 'relative', 
                aspectRatio: '16/9', 
                background: '#000', 
                borderRadius: '6px', 
                overflow: 'hidden' 
              }}>
                <img 
                  src={artefakPreview} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* NOTASI + CTA UNGGAH DI DALAM BOX, RATA KANAN BAWAH */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  left: '8px', 
                  right: '8px', 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'center' 
                }}>
                  <input
                    type="text"
                    value={artefakNotation}
                    onChange={(e) => setArtefakNotation(e.target.value)}
                    placeholder="notasi (max 4 kata)"
                    style={{ 
                      flex: 1,
                      background: 'rgba(0,0,0,0.7)', 
                      backdropFilter: 'blur(2px)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '4px', 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      color: '#fff',
                      lineHeight: '1.2'
                    }}
                    maxLength={50}
                  />
                  <button
                    onClick={handleArtefakUpload}
                    disabled={!artefakNotation.trim() || !canUploadArtefak}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      animation: 'pulse 2s ease-in-out infinite',
                      opacity: 0.2
                    }}
                  >
                    unggah
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RANT BOX SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Jejakmu</h2>
          
          <div style={{ 
            background: '#111', 
            border: '1px solid #222', 
            borderRadius: '8px', 
            padding: '16px', 
            position: 'relative' 
          }}>
            <textarea
              value={rantText}
              onChange={(e) => setRantText(e.target.value)}
              placeholder="...perasaanmu dalam 300 huruf"
              style={{ 
                width: '100%', 
                background: '#000', 
                border: '1px solid #444', 
                borderRadius: '6px', 
                padding: '8px', 
                color: '#fff', 
                fontSize: '14px', 
                resize: 'vertical',
                minHeight: '80px',
                lineHeight: '1.4',
                paddingRight: '60px' // ruang untuk tombol
              }}
              maxLength={300}
            />
            
            {/* CTA LEPASKAN DI DALAM BOX, RATA KANAN BAWAH */}
            <button
              onClick={handleRantSubmit}
              disabled={rantLoading || !rantText.trim()}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                animation: 'pulse 2s ease-in-out infinite',
                opacity: 0.2
              }}
            >
              {rantLoading ? '...' : 'lepaskan'}
            </button>
          </div>
        </div>

        {/* JEJAKMU - DAFTAR RANT (PLACEHOLDER) */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(5)].map((_, i) => {
              const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
              const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short'
              })
              return (
                <div key={`rant-placeholder-${i}`} style={{ 
                  background: '#111', 
                  border: '1px solid #222', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  position: 'relative',
                  fontSize: '14px'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '6px', 
                    left: '6px', 
                    background: '#222', 
                    color: '#888', 
                    fontSize: '10px', 
                    padding: '2px 4px', 
                    borderRadius: '4px' 
                  }}>
                    {formattedDate}
                  </div>
                  <p style={{ marginTop: '20px', lineHeight: 1.4, color: '#666' }}>
                    [Jejakmu akan muncul di sini...]
                  </p>
                  
                  {/* Emoji pulsing */}
                  <button
                    onClick={() => {}}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '16px',
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

        {/* TRAY ARTEFAK — 3x2 GRID, KOMPACT */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px' 
          }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={`artefak-placeholder-${i}`}
                onClick={() => handleArtefakClick(i)}
                style={{
                  aspectRatio: '1',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#444',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}
              >
                <span>Artefak #{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TAGLINE PENUTUP */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          fontSize: '14px', 
          color: '#888', 
          lineHeight: 1.4, 
          padding: '12px',
          borderTop: '1px solid #222'
        }}>
          “This is our era. And we’re not asking for permission”<br />
          <span style={{ color: '#343deb', fontSize: '12px' }}>— Glitch Generation</span>
        </div>

        {/* SETTINGS MENU — DITAMPILKAN DI KANAN ATAS */}
        {showSettings && (
          <div style={{
            position: 'absolute',
            top: '72px',
            right: '16px',
            background: '#111',
            border: '1px solid #222',
            borderRadius: '6px',
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #444',
                color: '#888',
                padding: '6px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '12px'
              }}
            >
              Keluar
            </button>
          </div>
        )}

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
            borderRadius: '8px',
            padding: '16px',
            width: '90%',
            maxWidth: '360px'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Tambahkan Notasi</h3>
            <textarea
              value={artefakNotationInput}
              onChange={(e) => setArtefakNotationInput(e.target.value)}
              placeholder="Tulis catatan pribadi (maks. 300 huruf)"
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '8px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '60px',
                lineHeight: '1.4'
              }}
              maxLength={300}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => setActiveArtefakId(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '12px'
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
                  padding: '6px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '12px'
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
