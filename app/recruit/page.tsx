'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const welcomeMessage = "Hey! I'm Coach Fabian. 🎓⚽ I'm here to help you navigate the college soccer recruitment process. What questions do you have?"

const initialQuickReplies = [
  "When should we start?",
  "D1 vs D2 vs D3?",
  "How do scholarships work?",
  "What's a highlight video?",
]

const fallbackTopics = [
  "Tell me about scholarships",
  "When do coaches start recruiting?",
  "What's a showcase tournament?",
]

// Extract suggested topics from assistant message
function extractSuggestedTopics(content: string): string[] {
  const topics: string[] = []
  const lines = content.split('\n')
  let inSuggestions = false

  for (const line of lines) {
    // Check for various formats of the "Want to know more" section
    if (line.toLowerCase().includes('want to know more') ||
        line.toLowerCase().includes('follow-up') ||
        line.toLowerCase().includes('you might ask')) {
      inSuggestions = true
      continue
    }
    if (inSuggestions) {
      // Match lines starting with •, -, or numbers
      const cleanLine = line.replace(/^[•\-\d.)\s]+/, '').trim()
      if (cleanLine && cleanLine.length > 3 && cleanLine.length < 60) {
        topics.push(cleanLine)
      }
    }
  }
  return topics.slice(0, 3) // Max 3 topics
}

export default function RecruitPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcomeMessage },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        body: JSON.stringify({ messages: newMessages, mode: 'recruit' }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }])
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto bg-gradient-to-b from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="p-4 shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="flex items-center justify-between">
          <Link href="/quiz" className="text-white/80 hover:text-white">
            ← Quiz
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h1 className="text-xl font-bold">Coach Fabian</h1>
          </div>
          <Link href="/" className="text-white/80 hover:text-white">
            Home
          </Link>
        </div>
        <p className="text-center text-emerald-100 text-sm mt-1">College Recruitment Help</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
              }`}
            >
              <div
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^• /gm, '• ')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-emerald-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce bg-emerald-400" />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.1s] bg-emerald-400" />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s] bg-emerald-400" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies / Suggested Topics */}
      {!isLoading && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {(() => {
              // Get topics from last assistant message, or use fallbacks
              const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
              const suggestedTopics = lastAssistantMessage
                ? extractSuggestedTopics(lastAssistantMessage.content)
                : []

              // Priority: extracted topics > initial replies (first message) > fallback topics
              let topics: string[] = []
              if (suggestedTopics.length > 0) {
                topics = suggestedTopics
              } else if (messages.length <= 2) {
                topics = initialQuickReplies
              } else {
                topics = fallbackTopics
              }

              return topics.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                >
                  {reply}
                </button>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white/80 backdrop-blur">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about college recruitment..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
