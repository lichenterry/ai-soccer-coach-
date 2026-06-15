'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { ChatMode } from '@/lib/prompts'
import Stage from './Stage'
import ModeToggle from './ModeToggle'
import MessageBubble from './MessageBubble'
import VoiceButton, { VoiceButtonRef } from './VoiceButton'
import { setLastUsed, type Feature } from '@/lib/lastUsed'
import type { QuizAnswers } from '@/lib/recruitProgress'
import { track } from '@/lib/analytics'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CoachChatProps {
  /**
   * When set, the chat is locked to this mode and the Hype/Calm toggle is
   * hidden. Used by /recruit/chat so the recruit deep-dive doesn't surface
   * the pre-game-only toggle.
   */
  forcedMode?: ChatMode
  /** Override the default welcome message. */
  welcomeOverride?: string
  /** Override the default quick-reply chips shown on first turn. */
  quickRepliesOverride?: string[]
  /** Optional rich banner rendered above the messages (e.g. quiz context). */
  contextBanner?: ReactNode
  /** Where the back-arrow link goes. Defaults to '/'. */
  backHref?: string
  /** Which Feature to mark as last-used on mount. Defaults 'pre-game'. */
  lastUsedFeature?: Feature
  /** Status copy shown under the coach name. Defaults 'Ready when you are'. */
  statusLabel?: string
  /**
   * Optional getter for recruit quiz answers. Called at SEND time (not at
   * mount) so the values are always fresh — picks up cross-tab retakes,
   * bfcache restores, and in-flow edits without a remount. Return null
   * when there's nothing to send.
   */
  getQuizContext?: () => QuizAnswers | null
}

// Coach Fabian uses **bold** for inline emphasis — MessageBubble renders it.
const DEFAULT_WELCOMES: Record<ChatMode, string> = {
  hype: "Hey champion! 🔥 Game day. Tell me how you're feeling about today.",
  calm:
    "Hey there. 😌 Let's get you settled. Tell me what's going through your head.",
  recruit:
    "Hey! 🎓 Ready to learn about college soccer recruitment? Ask me anything.",
}

const DEFAULT_QUICK_REPLIES: Record<ChatMode, string[]> = {
  hype: ['Pump me up 💪', 'Focus tips', 'Visualize the game'],
  calm: ['I’m nervous', 'Help me focus', 'Breathing exercise'],
  recruit: [
    'Tell me about scholarships',
    'When do coaches recruit?',
    'What is JUCO?',
  ],
}

export default function CoachChat({
  forcedMode,
  welcomeOverride,
  quickRepliesOverride,
  contextBanner,
  backHref = '/',
  lastUsedFeature = 'pre-game',
  statusLabel,
  getQuizContext,
}: CoachChatProps = {}) {
  // When forcedMode is set the toggle is hidden and the state can't change.
  // Otherwise the chat defaults to Hype (the Pre-Game Coach surface).
  const [mode, setMode] = useState<ChatMode>(forcedMode ?? 'hype')

  const initialWelcome = welcomeOverride ?? DEFAULT_WELCOMES[forcedMode ?? 'hype']
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialWelcome },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const voiceButtonRef = useRef<VoiceButtonRef>(null)

  // Engagement signal for the home-page smart pick.
  useEffect(() => {
    setLastUsed(lastUsedFeature)
  }, [lastUsedFeature])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Mode toggle resets the conversation with the new welcome — only fires
  // when the toggle is interactive (i.e. forcedMode isn't set).
  const handleModeChange = (newMode: ChatMode) => {
    if (forcedMode || newMode === mode) return
    setMode(newMode)
    setMessages([
      { role: 'assistant', content: welcomeOverride ?? DEFAULT_WELCOMES[newMode] },
    ])
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const failVoice = useCallback((status?: number) => {
    const message =
      status === 429
        ? 'Voice is rate-limited or out of credits — voice mode turned off.'
        : 'Voice playback failed — voice mode turned off.'
    setVoiceError(message)
    setVoiceEnabled(false)
    setIsPreparingAudio(false)
    setIsPlayingAudio(false)
  }, [])

  const playAudio = useCallback(
    async (text: string) => {
      try {
        setIsPreparingAudio(true)
        const response = await fetch('/api/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          console.error('Failed to get speech', response.status)
          failVoice(response.status)
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
          setTimeout(() => {
            voiceButtonRef.current?.startListening()
          }, 500)
        }
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          failVoice()
        }

        await audio.play()
      } catch (error) {
        console.error('Audio playback error:', error)
        failVoice()
      }
    },
    [failVoice],
  )

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
    track('coach_message_sent', { mode })

    // Read the context fresh on every send rather than from a snapshot —
    // this way a parent who retakes the quiz in another tab (or via
    // back/forward) gets up-to-date personalisation on the next message.
    const quizContext = getQuizContext ? getQuizContext() : null

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode, quizContext }),
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

  const activeQuickReplies =
    quickRepliesOverride ?? DEFAULT_QUICK_REPLIES[mode]

  return (
    <Stage>
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col">
        {/* === Header ===================================================== */}
        <header className="relative border-b border-white/[0.05] px-4 pb-[14px] pt-[50px]">
          <div className="mb-[14px] flex items-center gap-[10px]">
            <Link
              href={backHref}
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
                  {statusLabel ?? 'Ready when you are'}
                </div>
              </div>
            </div>

            {/* Voice toggle is always present — the recruit chat used to
                show a "🎓 Recruit" mint badge here, but the status line
                below the coach name already carries the mode signal and
                voice mode is more useful than a decorative pill. */}
            <button
              type="button"
              onClick={() => {
                if (!voiceEnabled) setVoiceError(null)
                const next = !voiceEnabled
                setVoiceEnabled(next)
                track('voice_mode_toggled', {
                  surface: forcedMode === 'recruit' ? 'recruit' : 'coach',
                  enabled: next,
                })
              }}
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
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </button>
          </div>

          {/* Only render the toggle on the unforced (Pre-Game) chat. */}
          {!forcedMode && <ModeToggle mode={mode} onModeChange={handleModeChange} />}
        </header>

        {/* === Optional context banner =================================== */}
        {contextBanner && (
          <div className="px-[14px] pt-3">{contextBanner}</div>
        )}

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

          {voiceError && (
            <div
              role="status"
              className="self-center rounded-full border border-amber-300/30 bg-amber-300/[0.08] px-3 py-[6px] text-[10.5px] font-semibold text-amber-200/90"
            >
              {voiceError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* === Quick replies (only before the user has spoken) ============ */}
        {messages.length <= 2 && !isLoading && (
          <div className="flex flex-wrap gap-[6px] px-[14px] pb-[10px] pt-1">
            {activeQuickReplies.map((reply) => (
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

        {/* === Input bar ================================================== */}
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
            placeholder={
              forcedMode === 'recruit'
                ? 'Ask Coach Fabian…'
                : 'Message Coach Fabian…'
            }
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
