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
          Your personal coach to hype you up or calm your nerves before the big game!
        </p>

        <Link
          href="/coach"
          className="inline-block bg-white text-green-600 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Start Coaching Session 🚀
        </Link>

        <div className="mt-12 grid grid-cols-2 gap-6 text-center">
          <div className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-default">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="font-semibold">Hype Mode</h3>
            <p className="text-sm text-green-100">Get pumped up!</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-default">
            <div className="text-3xl mb-2">😌</div>
            <h3 className="font-semibold">Calm Mode</h3>
            <p className="text-sm text-green-100">Find your focus</p>
          </div>
        </div>
      </div>
    </div>
  )
}
