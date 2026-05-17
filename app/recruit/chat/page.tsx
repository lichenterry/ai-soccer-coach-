'use client'

import { useCallback, useEffect, useState } from 'react'
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
 * Two layers of staleness protection:
 *
 *   1. The banner re-reads progress on `storage` events (another tab edited
 *      localStorage) and on `pageshow` events (the page was restored from
 *      the browser's back/forward cache without remounting). Without these,
 *      a parent who retakes the quiz in another tab would see the old
 *      summary until they refresh.
 *
 *   2. The quiz answers sent to the LLM are NOT taken from React state.
 *      CoachChat's `getQuizContext` getter calls `getRecruitProgress()` at
 *      the moment a message is sent, so the model always sees the current
 *      localStorage value — even mid-conversation if the parent edits
 *      answers in another tab.
 *
 * The context banner is then mirrored to the model via the recruit system
 * prompt — see lib/recruitContext.ts and app/api/chat/route.ts.
 */
export default function RecruitChatPage() {
  // `null` while we haven't read localStorage yet — keeps SSR markup stable
  // and prevents a flash of either banner state.
  const [progress, setProgress] = useState<RecruitProgress | null>(null)

  const refresh = useCallback(() => {
    setProgress(getRecruitProgress())
  }, [])

  useEffect(() => {
    refresh()

    // Another tab wrote to localStorage — sync our banner.
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'pitch.recruitProgress') {
        refresh()
      }
    }
    // Browser restored this page from bfcache without re-mounting. The
    // `persisted` flag is true when bfcache was actually used.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refresh()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [refresh])

  // The model gets the same fresh-read treatment. Read at send time, not
  // from state — see CoachChat for where this getter is called.
  const getQuizContext = useCallback(() => getRecruitProgress().answers, [])

  const banner = (() => {
    if (!progress) return undefined
    if (isComplete(progress.answers)) {
      return <CompletedBanner summary={summariseAnswers(progress.answers)} />
    }
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
      getQuizContext={getQuizContext}
    />
  )
}

function CompletedBanner({ summary }: { summary: string }) {
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
