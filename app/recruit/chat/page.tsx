'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CoachChat from '@/components/CoachChat'
import {
  getRecruitProgress,
  isComplete,
  type RecruitProgress,
} from '@/lib/recruitProgress'
import { summariseAnswers } from '@/lib/recruitResults'

/**
 * Recruit Prep chat handoff.
 *
 * Re-uses the existing Coach Fabian chat with three small tweaks:
 *   - forcedMode='recruit' → hides Hype/Calm toggle, swaps in a mint badge
 *   - lastUsedFeature='recruit' → engagement signal for the home chip
 *   - contextBanner → mint-tinted summary of the parent's quiz answers,
 *     OR (if the quiz hasn't been taken) a soft nudge back to /recruit
 *
 * The context banner is UI-only — we do NOT inject quiz answers into the
 * LLM system prompt yet. That's a deliberate follow-up (per brief) since
 * it needs prompt-engineering work. The banner is a visible reminder to
 * the parent that they have context Coach can speak to.
 */
export default function RecruitChatPage() {
  // Banner contents depend on localStorage, so we render the chat without
  // a banner on first render and pop the banner in once we've hydrated.
  // Keeps SSR markup stable.
  const [progress, setProgress] = useState<RecruitProgress | null>(null)

  useEffect(() => {
    setProgress(getRecruitProgress())
  }, [])

  const banner = (() => {
    if (!progress) return undefined
    if (isComplete(progress.answers)) {
      return <CompletedBanner summary={summariseAnswers(progress.answers)} />
    }
    // Soft nudge — kept gentle so a parent who really just wants to chat
    // isn't blocked. Tapping "Take it" jumps back to the readiness check.
    return <NudgeBanner />
  })()

  return (
    <CoachChat
      forcedMode="recruit"
      backHref="/recruit"
      lastUsedFeature="recruit"
      statusLabel="Recruit mode"
      welcomeOverride={
        progress && isComplete(progress.answers)
          ? 'Some good starting points based on your results:'
          : 'Hey! 🎓 I can help with anything college soccer — recruiting timelines, scholarships, highlight videos, you name it.'
      }
      quickRepliesOverride={[
        'How do I email a coach?',
        "What's a showcase?",
        'When to start campus visits?',
        'Highlight video tips',
      ]}
      contextBanner={banner}
    />
  )
}

function CompletedBanner({ summary }: { summary: string }) {
  // Quoted summary like v15: "I've seen your readiness check — your athlete
  // is a 10th grade ECNL Forward with a 3.5+ GPA. What do you want to dig
  // into?"
  return (
    <div
      className="rounded-2xl border border-pitch-mint-300/[0.22] px-3 py-[10px] text-[11px] font-medium leading-[1.5] text-white/[0.78]"
      style={{
        background:
          'linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(110,231,183,0.02) 100%)',
      }}
    >
      I&rsquo;ve seen{' '}
      <strong className="font-bold text-pitch-mint-100">your readiness check</strong>{' '}
      — your athlete is{' '}
      <strong className="font-bold text-pitch-mint-100">{summary}</strong>. What do
      you want to dig into?
    </div>
  )
}

function NudgeBanner() {
  return (
    <div
      className="rounded-2xl border border-pitch-mint-300/[0.22] px-3 py-[10px] text-[11px] font-medium leading-[1.5] text-white/[0.78]"
      style={{
        background:
          'linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(110,231,183,0.02) 100%)',
      }}
    >
      Quick tip: take the{' '}
      <Link
        href="/recruit"
        className="font-bold text-pitch-mint-100 underline decoration-pitch-mint-300/40 underline-offset-2"
      >
        2-minute readiness check
      </Link>{' '}
      first so I can give you tailored answers.
    </div>
  )
}
