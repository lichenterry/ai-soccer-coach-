import Link from 'next/link'

function FloatingElement({ emoji, className }: { emoji: string; className: string }) {
  return (
    <div className={`absolute text-4xl opacity-20 pointer-events-none ${className}`}>
      {emoji}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-700 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Floating background elements */}
      <FloatingElement emoji="⚽" className="top-[10%] left-[10%] animate-float" />
      <FloatingElement emoji="⭐" className="top-[20%] right-[15%] animate-float-slow [animation-delay:1s]" />
      <FloatingElement emoji="⚽" className="top-[60%] left-[5%] animate-float-slow [animation-delay:2s]" />
      <FloatingElement emoji="🥅" className="top-[70%] right-[10%] animate-float [animation-delay:0.5s]" />
      <FloatingElement emoji="⭐" className="top-[40%] right-[5%] animate-float [animation-delay:3s]" />
      <FloatingElement emoji="⚽" className="top-[85%] left-[20%] animate-float-slow [animation-delay:1.5s]" />
      <FloatingElement emoji="⭐" className="top-[15%] left-[40%] animate-float [animation-delay:2.5s]" />

      <div className="text-center max-w-md relative z-10">
        <div className="text-6xl mb-4 animate-bounce">⚽</div>
        <h1 className="text-4xl font-bold mb-4">AI Soccer Coach</h1>
        <p className="text-lg mb-8 text-green-100">
          Your personal coach to help you play your best!
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/coach"
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Pre-Game Coach
          </Link>
          <Link
            href="/analyze"
            className="bg-white text-purple-600 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Analyze My Game
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="bg-orange-400/90 rounded-xl p-3 hover:scale-105 transition-all cursor-default shadow">
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-xs font-medium text-white">Get hyped</p>
          </div>
          <div className="bg-blue-400/90 rounded-xl p-3 hover:scale-105 transition-all cursor-default shadow">
            <div className="text-2xl mb-1">😌</div>
            <p className="text-xs font-medium text-white">Stay calm</p>
          </div>
          <div className="bg-purple-400/90 rounded-xl p-3 hover:scale-105 transition-all cursor-default shadow">
            <div className="text-2xl mb-1">🎬</div>
            <p className="text-xs font-medium text-white">Video feedback</p>
          </div>
        </div>
      </div>
    </div>
  )
}
