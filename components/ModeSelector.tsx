'use client'

import { ChatMode } from '@/lib/prompts'

interface ModeSelectorProps {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-full">
      <button
        onClick={() => onModeChange('hype')}
        className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
          mode === 'hype'
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        }`}
      >
        Hype
      </button>
      <button
        onClick={() => onModeChange('calm')}
        className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
          mode === 'calm'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        }`}
      >
        Calm
      </button>
    </div>
  )
}
