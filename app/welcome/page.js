'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const CIRCLES = [
  { id: 'fandom', name: 'Fandom Fever', emoji: '🔥', desc: 'Drakor, K-Pop, anime — ngobrol tanpa spoiler' },
  { id: 'hustle', name: 'Hustle Huddle', emoji: '💰', desc: 'Jualan thrift, design, crypto — flex progress' },
  { id: 'raw', name: 'Raw Room', emoji: '🖤', desc: 'Overthinking, toxic family — curhat tanpa cap lebay' }
]

export default function Welcome() {
  const [step, setStep] = useState(1) // 1 = pulse, 2 = username, 3 = circle
  const [username, setUsername] = useState('')
  const [selectedCircle, setSelectedCircle] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Auto next dari pulse
    const t = setTimeout(() => setStep(2), 2500)
    return () => clearTimeout(t)
  }, [])

  const handleUsername = () => {
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, '')
    if (trimmed.length < 2) return
    localStorage.setItem('nope_username', trimmed)
    setStep(3)
  }

  const handleCircle = (circle) => {
    setSelectedCircle(circle)
    localStorage.setItem('nope_circle', circle.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm">
      {step === 1 && (
        <motion.div
          className="w-4 h-4 bg-white rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: 3 }}
        />
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <h1 className="text-lg">Siapa kamu?</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="dua kata tanpa spasi"
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-center text-white placeholder-gray-500"
            maxLength={20}
          />
          <button
            onClick={handleUsername}
            className="block mx-auto bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Lanjut
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full px-4"
        >
          <h2 className="text-center mb-6">Pilih satu Circle</h2>
          <div className="space-y-3">
            {CIRCLES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCircle(c)}
                className="w-full text-left bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-600 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
