'use client'

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  mode?: 'hype' | 'calm'
}

export interface VoiceButtonRef {
  startListening: () => void
}

const VoiceButton = forwardRef<VoiceButtonRef, VoiceButtonProps>(({ onTranscript, disabled, mode = 'hype' }, ref) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
    }
  }, [])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [onTranscript])

  useImperativeHandle(ref, () => ({
    startListening
  }), [startListening])

  if (!isSupported) {
    return null
  }

  const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center transition-all"
  const activeClasses = isListening
    ? `animate-pulse-record ${mode === 'hype' ? 'bg-teal-600' : 'bg-purple-500'} text-white scale-110`
    : `${mode === 'hype' ? 'bg-teal-100 hover:bg-teal-200 text-teal-600' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`

  return (
    <button
      onClick={startListening}
      disabled={disabled || isListening}
      className={`${baseClasses} ${activeClasses} disabled:opacity-50`}
      title={isListening ? 'Listening...' : 'Tap to speak'}
    >
      {isListening ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="6" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  )
})

VoiceButton.displayName = 'VoiceButton'

export default VoiceButton

// Type declarations for Web Speech API
interface SpeechRecognitionResult {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: { [index: number]: SpeechRecognitionResult }
}

interface SpeechRecognitionEventType {
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventType) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}
