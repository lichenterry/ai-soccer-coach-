'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { extractFrames, validateVideoFile, getFileSizeWarning } from '@/lib/video'

type PlayerPosition = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'
type AnalysisStage = 'upload' | 'details' | 'processing' | 'results'

const positions: PlayerPosition[] = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper']

export default function AnalyzePage() {
  const [stage, setStage] = useState<AnalysisStage>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [playerDescription, setPlayerDescription] = useState('')
  const [position, setPosition] = useState<PlayerPosition | null>(null)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setWarning(null)

    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    const sizeWarning = getFileSizeWarning(file)
    if (sizeWarning) {
      setWarning(sizeWarning)
    }

    setSelectedFile(file)
    setStage('details')
    e.target.value = ''
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !position || !playerDescription.trim()) return

    setStage('processing')
    setError(null)

    try {
      setProgress('Loading video...')
      const frames = await extractFrames(selectedFile, 6, (stageText, pct) => {
        setProgress(`${stageText} ${pct}%`)
      })

      if (frames.length === 0) {
        throw new Error('Could not extract frames from video')
      }

      setProgress('Coach Fabian is reviewing your footage...')

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: frames.map(f => f.data),
          position,
          playerDescription: playerDescription.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data.analysis)
      setStage('results')

      if (voiceEnabled) {
        playAudio(data.analysis)
      }
    } catch (err) {
      console.error('Video processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process video')
      setStage('details')
    }
  }

  const playAudio = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) return

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      setIsPlayingAudio(true)

      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsPlayingAudio(false)
    }
  }, [])

  const handleStartOver = () => {
    setStage('upload')
    setSelectedFile(null)
    setPlayerDescription('')
    setPosition(null)
    setAnalysis(null)
    setError(null)
    setWarning(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-teal-600 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
        <h1 className="text-white font-bold text-lg">Analyze My Game</h1>
        <div className="w-12" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Upload stage */}
          {stage === 'upload' && (
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className="text-5xl mb-4">🎬</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Your Game Video</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Upload a clip from your game and Coach Fabian will give you feedback!
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleFileSelect}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-full hover:scale-105 transition-all shadow-lg"
              >
                Choose Video
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400">
                MP4, MOV, or WebM up to 200MB
              </p>
            </div>
          )}

          {/* Details stage */}
          {stage === 'details' && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Help Me Find You</h2>

              {warning && (
                <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
                  {warning}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you look like in the video?
                </label>
                <input
                  type="text"
                  value={playerDescription}
                  onChange={(e) => setPlayerDescription(e.target.value)}
                  placeholder="e.g., Blue jersey, number 7"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Jersey color, number, or anything that helps spot you
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What position do you play?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        position === pos
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5 flex items-center justify-center">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    voiceEnabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {voiceEnabled ? '🔊' : '🔇'}
                  Voice {voiceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!playerDescription.trim() || !position}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-full hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Analyze My Game
              </button>

              <button
                onClick={handleStartOver}
                className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
              >
                Choose different video
              </button>
            </div>
          )}

          {/* Processing stage */}
          {stage === 'processing' && (
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">{progress}</p>
            </div>
          )}

          {/* Results stage */}
          {stage === 'results' && analysis && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Coach Fabian Says:</h2>
                {voiceEnabled && (
                  <button
                    onClick={() => playAudio(analysis)}
                    disabled={isPlayingAudio}
                    className={`p-2 rounded-full ${
                      isPlayingAudio ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {analysis}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleStartOver}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-all"
                >
                  Analyze Another
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-all text-center"
                >
                  Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
