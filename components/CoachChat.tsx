'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChatMode } from '@/lib/prompts'
import Stage from './Stage'
import ModeToggle from './ModeToggle'
import MessageBubble from './MessageBubble'
import VoiceButton, { VoiceButtonRef } from './VoiceButton'
import { setLastUsed } from '@/lib/lastUsed'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Coach Fabian uses **bold** for inline emphasis — MessageBubble renders it.
const welcomeMessages: Record<ChatMode, string> = {
  hype:
    "Hey champion! 🔥 Game day. Tell me how you're feeling about today.",
  calm:
    "Hey there. 😌 Let's get you settled. Tell me what's going through your head.",
  recruit:
    "Hey! 🎓 Ready to learn about college soccer recruitment? Ask me anything.",
}

const quickReplies: Record<ChatMode, string[]> = {
  hype: ['Pump me up 💪', 'Focus tips', 'Visualize the game'],
  calm: ['I’m nervous', 'Help me focus', 'Breathing exercise'],
  recruit: ['Tell me about scholarships', 'When do coaches recruit?', 'What is JUCO?'],
}

export default function CoachChat() {
  // Coach defaults to Hype on every visit per v13. Mode is a chat-only
  // selector here — it never changes the screen the user is on.
  const [mode, setMode] = useState<ChatMode>('hype')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcomeMessages.hype },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const voiceButtonRef = useRef<VoiceButtonRef>(null)

  // Reaching the chat counts as "engaging Pre-Game Coach" — feeds the
  // home-page smart pick.
  useEffect(() => {
    setLastUsed('pre-game')
  }, [])

  // Scroll to bottom when new messages arrive.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Reset chat when mode changes — different welcome, different vibe.
  const handleModeChange = (newMode: ChatMode) => {
    if (newMode === mode) return
    setMode(newMode)
    setMessages([{ role: 'assistant', content: welcomeMessages[newMode] }])
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  // Play text as TTS — gated by voiceEnabled.
  const playAudio = useCallback(async (text: string) => {
    try {
      setIsPreparingAudio(true)
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        console.error('Failed to get speech')
        setIsPreparingAudio(false)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      setIsPreparingAudio(false)
      setIsPlayingAudio(true)

      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
        // Auto-listen after the coach finishes speaking — keeps the back-and-
        // forth flowing without forcing the user back to the mic each turn.
        setTimeout(() => {
          voiceButtonRef.current?.startListening()
        }, 500)
      }

      audio.onerror = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsPreparingAudio(false)
      setIsPlayingAudio(false)
    }
  }, [])

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText || input).trim()
    if (!userMessage || isLoading) return

    setInput('')

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.message },
        ])
        if (voiceEnabled) {
          playAudio(data.message)
        }
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'Oops! Something went wrong. Try again?' },
        ])
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Oops! Couldn't connect. Check your internet?" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Voice transcript fills the input and auto-sends.
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(transcript)
    setTimeout(() => {
      const sendBtn = document.querySelector('[data-send-btn]') as HTMLButtonElement
      sendBtn?.click()
    }, 100)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  return (
    <Stage>
      {/* The chat lives inside the same dark gradient as home — no break in
          environment as the user enters the conversation. */}
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col">
        {/* === Header ===================================================== */}
        <header className="relative border-b border-white/[0.05] px-4 pb-[14px] pt-[50px]">
          <div className="mb-[14px] flex items-center gap-[10px]">
            <Link
              href="/"
              aria-label="Back"
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[14px] text-white/70 hover:bg-white/[0.1]"
            >
              ‹
            </Link>

            <div className="flex flex-1 items-center gap-[9px]">
              <div
                className="pitch-avatar-mint flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[16px]"
                aria-hidden="true"
              >
                ⚽
              </div>
              <div>
                <div className="text-[14px] font-extrabold tracking-[-0.2px] text-white">
                  Coach Fabian
                </div>
                <div className="mt-[1px] flex items-center gap-[5px] text-[10px] font-semibold text-white/45">
                  <span
                    className="h-[6px] w-[6px] animate-status-pulse rounded-full bg-pitch-mint shadow-[0_0_6px_rgba(110,231,183,0.6)]"
                    aria-hidden="true"
                  />
                  Ready when you are
                </div>
              </div>
            </div>

            {/* TODO: voice mode icon — design pending. Functional toggle
                stays wired so the underlying behaviour ships now and we
                drop in the real icon later without a logic change. */}
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              aria-label={voiceEnabled ? 'Disable voice mode' : 'Enable voice mode'}
              aria-pressed={voiceEnabled}
              className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                voiceEnabled
                  ? 'border-pitch-mint-300/40 bg-pitch-mint-300/[0.18] text-pitch-mint-300'
                  : 'border-white/[0.08] bg-white/[0.06] text-white/70 hover:bg-white/[0.1]'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[14px] w-[14px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
              </svg>
            </button>
          </div>

          <ModeToggle mode={mode} onModeChange={handleModeChange} />
        </header>

        {/* === Messages =================================================== */}
        <div className="flex flex-1 flex-col gap-[9px] overflow-y-auto px-[14px] pb-2 pt-[14px]">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content}
              isUser={message.role === 'user'}
            />
          ))}

          {isLoading && (
            <div className="flex w-fit items-center gap-1 self-start rounded-2xl rounded-bl-[4px] border border-white/[0.09] bg-white/[0.07] px-[14px] py-[12px]">
              <span className="h-[6px] w-[6px] animate-typing-dot rounded-full bg-pitch-mint" />
              <span
                className="h-[6px] w-[6px] animate-typing-dot rounded-full bg-pitch-mint"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="h-[6px] w-[6px] animate-typing-dot rounded-full bg-pitch-mint"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          )}

          {voiceEnabled && isPreparingAudio && (
            <div className="self-center py-2 text-[11px] font-medium text-white/50">
              Preparing audio…
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* === Quick replies (only shown before the user has spoken) ===== */}
        {messages.length <= 2 && !isLoading && (
          <div className="flex flex-wrap gap-[6px] px-[14px] pb-[10px] pt-1">
            {quickReplies[mode].map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleQuickReply(reply)}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-[7px] text-[11.5px] font-semibold text-white/85 transition-colors hover:bg-white/[0.1]"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* === Input bar =================================================== */}
        <div
          className="flex items-center gap-2 border-t border-white/[0.05] bg-black/30 px-3 pb-[14px] pt-[10px] backdrop-blur-xl"
          style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
        >
          <VoiceButton
            ref={voiceButtonRef}
            onTranscript={handleVoiceTranscript}
            disabled={isLoading || isPlayingAudio || isPreparingAudio}
            mode={mode}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Coach Fabian…"
            className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-[14px] py-[10px] text-[12.5px] font-medium text-white placeholder:text-white/45 focus:border-pitch-mint-300/40 focus:outline-none focus:ring-1 focus:ring-pitch-mint-300/30"
            disabled={isLoading}
          />

          <button
            data-send-btn
            type="button"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-pitch-mint-300/40 bg-pitch-mint-300/[0.18] text-[14px] font-extrabold text-pitch-mint-300 transition-opacity disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </Stage>
  )
}
