'use client'

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  /** Kept for API compatibility; visual styling is now mode-agnostic. */
  mode?: 'hype' | 'calm' | 'recruit'
}

export interface VoiceButtonRef {
  startListening: () => void
}

/**
 * Mic button. Web Speech API logic is unchanged from v1; only the visual
 * shell was restyled to match the dark-glass / mint-accent system.
 *
 * Idle state — dark glass circle.
 * Active state — mint-tinted glass with a pulsing dot icon.
 */
const VoiceButton = forwardRef<VoiceButtonRef, VoiceButtonProps>(
  ({ onTranscript, disabled }, ref) => {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)

    useEffect(() => {
      // Check for Web Speech API support
      if (typeof window !== 'undefined') {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition
        setIsSupported(!!SpeechRecognition)
      }
    }, [])

    const startListening = useCallback(() => {
      if (typeof window === 'undefined') return

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
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

    useImperativeHandle(ref, () => ({ startListening }), [startListening])

    if (!isSupported) {
      return null
    }

    const tone = isListening
      ? 'border-pitch-mint-300/40 bg-pitch-mint-300/[0.18] text-pitch-mint-300 shadow-[0_0_14px_rgba(110,231,183,0.25)]'
      : 'border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.08]'

    return (
      <button
        type="button"
        onClick={startListening}
        disabled={disabled || isListening}
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all disabled:opacity-50 ${tone}`}
        title={isListening ? 'Listening…' : 'Tap to speak'}
        aria-label={isListening ? 'Listening' : 'Tap to speak'}
      >
        {isListening ? (
          <svg
            className="h-4 w-4 animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
          </svg>
        )}
      </button>
    )
  },
)

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
