'use client'
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

  // Modal states
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
      
      setSuccess('Jejak terlepaskan! 💨')
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

  const saveArtefakNotation = () => {
    setSuccess('Notasi disimpan ✓')
    setActiveArtefakId(null)
    setArtefakNotationInput('')
    setTimeout(() => setSuccess(''), 2000)
  }

  if (!mounted || !username) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono text-sm">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER - Minimal & Clean */}
        <header className="flex items-center justify-between pt-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">NOPE</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </header>

        {/* ALERTS - Compact */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-xs text-center">
            {success}
          </div>
        )}

        {/* NAVIGASI - 4 Tombol Horizontal */}
        <nav className="grid grid-cols-4 gap-2 bg-gray-900 border border-gray-800 rounded-lg p-2">
          <button className="bg-blue-600 text-white py-2 px-3 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
            Jejak
          </button>
          <button className="bg-gray-800 text-gray-300 py-2 px-3 rounded text-xs font-medium hover:bg-gray-700 transition-colors">
            Frekuensi
          </button>
          <button className="bg-gray-800 text-gray-300 py-2 px-3 rounded text-xs font-medium hover:bg-gray-700 transition-colors">
            SayNOPE
          </button>
          <button className="bg-gray-800 text-gray-300 py-2 px-3 rounded text-xs font-medium hover:bg-gray-700 transition-colors">
            GLITCH
          </button>
        </nav>

        {/* ARTEFAK UPLOAD - Clean & Compact */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          {!artefakPreview ? (
            <label className={`block ${canUploadArtefak ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!canUploadArtefak}
                className="hidden"
              />
              <div className="aspect-video bg-black border border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors">
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-xs">
                    {canUploadArtefak ? 'unggah foto' : 'tunggu 30 hari'}
                  </p>
                </div>
              </div>
            </label>
          ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img src={artefakPreview} alt="Preview" className="w-full h-full object-cover"/>
              
              {/* Notasi + CTA - Bottom Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={artefakNotation}
                    onChange={(e) => setArtefakNotation(e.target.value)}
                    placeholder="notasi (max 4 kata)"
                    className="flex-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    maxLength={50}
                  />
                  <button
                    onClick={handleArtefakUpload}
                    disabled={!artefakNotation.trim()}
                    className="bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
                  >
                    unggah
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {artefakNotation.trim().split(' ').filter(w => w).length}/4 kata
                </p>
              </div>
            </div>
          )}
        </section>

        {/* JEJAK (RANT) - Compact */}
        <section>
          <h2 className="text-base font-semibold mb-3 text-gray-300">Jejakmu</h2>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="relative">
              <textarea
                value={rantText}
                onChange={(e) => setRantText(e.target.value)}
                placeholder="...perasaanmu dalam 300 huruf"
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
                maxLength={300}
              />
              
              {/* Counter & CTA */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{rantText.length}/300</span>
                <button
                  onClick={handleRantSubmit}
                  disabled={rantLoading || !rantText.trim()}
                  className="bg-blue-600/80 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-xs font-medium transition-colors"
                >
                  {rantLoading ? '...' : 'lepaskan'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* JEJAK TIMELINE - Compact Cards */}
        <section className="space-y-3">
          {[...Array(3)].map((_, i) => {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const formattedDate = date.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
            return (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 relative group hover:border-gray-700 transition-colors">
                {/* Date Badge */}
                <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded mb-2">
                  {formattedDate}
                </span>
                
                {/* Content */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  Jejakmu akan muncul di sini. Tulisan yang kamu lepaskan akan tersimpan dalam timeline ini.
                </p>
                
                {/* Emoji Response */}
                <button className="absolute bottom-3 right-3 text-xl hover:scale-110 transition-transform">
                  💖
                </button>
              </div>
            )
          })}
        </section>

        {/* TRAY ARTEFAK - 3x2 Grid Compact */}
        <section>
          <h2 className="text-base font-semibold mb-3 text-gray-300">Artefak</h2>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveArtefakId(i)}
                className="aspect-square bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors flex items-center justify-center text-xs text-gray-600"
              >
                #{i + 1}
              </button>
            ))}
          </div>
        </section>

        {/* TAGLINE - Elegant */}
        <footer className="text-center pt-8 pb-4 border-t border-gray-800 space-y-1">
          <p className="text-xs text-gray-500 italic">
            "This is our era. And we're not asking for permission"
          </p>
          <p className="text-xs text-blue-500 font-medium">— Glitch Generation</p>
        </footer>

      </div>

      {/* SETTINGS DROPDOWN */}
      {showSettings && (
        <div className="fixed top-16 right-4 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden z-50 w-48">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Keluar
          </button>
        </div>
      )}

      {/* MODAL NOTASI ARTEFAK */}
      {activeArtefakId !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 w-full max-w-sm">
            <h3 className="text-base font-semibold mb-3">Tambah Notasi</h3>
            <textarea
              value={artefakNotationInput}
              onChange={(e) => setArtefakNotationInput(e.target.value)}
              placeholder="Tulis catatan pribadi (maks. 300 huruf)"
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
              maxLength={300}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveArtefakId(null)}
                className="flex-1 bg-gray-800 text-gray-300 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveArtefakNotation}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
