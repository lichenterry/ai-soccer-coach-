'use client'

import { ChatMode } from '@/lib/prompts'

interface MessageBubbleProps {
  content: string
  isUser: boolean
  mode?: ChatMode
}

export default function MessageBubble({ content, isUser, mode = 'hype' }: MessageBubbleProps) {
  const coachBgClass = mode === 'hype'
    ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-gray-800'
    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 ${isUser ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-green-500 text-white rounded-br-md'
            : `${coachBgClass} rounded-bl-md`
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
