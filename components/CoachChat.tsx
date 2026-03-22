'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMode } from '@/lib/prompts'
import ModeSelector from './ModeSelector'
import MessageBubble from './MessageBubble'
import VoiceButton, { VoiceButtonRef } from './VoiceButton'
import Mascot from './Mascot'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const welcomeMessages: Record<ChatMode, string> = {
  hype: "Hey champion! 💪 Ready to crush it today? Tell me about your game coming up!",
  calm: "Hey there. 😌 I'm here to help you feel calm and focused. What's going on?",
  recruit: "Hey! 🎓 Ready to learn about college soccer recruitment? Ask me anything!",
}

const quickReplies: Record<ChatMode, string[]> = {
  hype: ["I'm ready to win! 💪", "Pump me up!", "I need motivation"],
  calm: ["I'm nervous 😰", "Help me focus", "I need to breathe"],
  recruit: ["Tell me about scholarships", "When do coaches recruit?", "What is JUCO?"],
}


export default function CoachChat() {
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

  const themeClasses = mode === 'hype'
    ? 'bg-gradient-to-b from-teal-50 to-cyan-50'
    : 'bg-gradient-to-b from-blue-50 to-purple-50'

  const headerClasses = mode === 'hype'
    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset chat when mode changes
  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode)
    setMessages([{ role: 'assistant', content: welcomeMessages[newMode] }])
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  // Play text as speech
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
        // Auto-listen after coach finishes speaking
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
        setMessages([...newMessages, { role: 'assistant', content: data.message }])
        // Auto-play audio if voice mode is enabled
        if (voiceEnabled) {
          playAudio(data.message)
        }
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: "Oops! Something went wrong. Try again?" },
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

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(transcript)
    // Auto-send the voice message
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
    <div className={`flex flex-col h-[100dvh] max-w-lg mx-auto transition-colors duration-500 ${themeClasses}`}>
      {/* Header */}
      <div className={`p-4 shadow-md transition-colors duration-500 ${headerClasses}`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Mascot mode={mode} size={44} />
          <h1 className="text-xl font-bold">Coach Fabian</h1>
        </div>
        <ModeSelector mode={mode} onModeChange={handleModeChange} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Show all messages in both modes */}
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            content={message.content}
            isUser={message.role === 'user'}
            mode={mode}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-3 animate-slide-in-left">
            <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${mode === 'hype' ? 'bg-teal-100' : 'bg-blue-100'}`}>
              <div className="flex gap-1">
                <span className={`w-2 h-2 rounded-full animate-bounce ${mode === 'hype' ? 'bg-teal-400' : 'bg-blue-400'}`} />
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.1s] ${mode === 'hype' ? 'bg-teal-400' : 'bg-blue-400'}`} />
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s] ${mode === 'hype' ? 'bg-teal-400' : 'bg-blue-400'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Voice mode: preparing audio indicator */}
        {voiceEnabled && isPreparingAudio && (
          <div className={`text-center text-xs py-2 ${mode === 'hype' ? 'text-teal-600' : 'text-purple-600'}`}>
            Preparing audio...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {quickReplies[mode].map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                  mode === 'hype'
                    ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white/80 backdrop-blur">
        {/* Voice toggle */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              voiceEnabled
                ? mode === 'hype'
                  ? 'bg-teal-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {voiceEnabled ? '🎙️' : '🔇'}
            Voice {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex gap-2 items-center">
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
            placeholder="Type or tap mic to speak..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
            disabled={isLoading}
          />
          <button
            data-send-btn
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
              mode === 'hype'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
