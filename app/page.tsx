'use client'

import { useEffect, useState } from 'react'
import Stage from '@/components/Stage'
import BrandMark from '@/components/BrandMark'
import FeatureChip from '@/components/FeatureChip'
import { getLastUsed, type Feature } from '@/lib/lastUsed'
import {
  getRecruitProgress,
  progressLabel,
  type RecruitProgress,
} from '@/lib/recruitProgress'

const FEATURE_ORDER: Feature[] = ['pre-game', 'analyze', 'recruit']

/**
 * Sub-copy override when a feature is the smart pick — used to hint at
 * continuity (e.g. "Continue last clip · or upload new" for Analyze, or
 * "Step 4 of 7 · pick up where you left off" for a mid-flow Recruit quiz).
 *
 * Recruit pulls from the persisted quiz state via progressLabel(). If the
 * parent hasn't engaged the readiness check, we fall back to the chip's
 * default sub-copy.
 */
function smartSubCopy(
  feature: Feature,
  recruit: RecruitProgress,
): string | undefined {
  if (feature === 'analyze') return 'Continue last clip · or upload new'
  if (feature === 'recruit') return progressLabel(recruit)
  return undefined
}

export default function Home() {
  // We render the chip order *after* mount so SSR markup doesn't lock the
  // smart pick to the default before localStorage has a chance to speak.
  // Initial render shows the default order — quietly correct on hydrate.
  const [smart, setSmart] = useState<Feature>('pre-game')
  const [recruit, setRecruit] = useState<RecruitProgress | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSmart(getLastUsed())
    setRecruit(getRecruitProgress())
    setHydrated(true)
  }, [])

  // Smart pick floats to the top; the other two follow in their canonical
  // order. This matches all three states in the v7 spec.
  const ordered: Feature[] = hydrated
    ? [smart, ...FEATURE_ORDER.filter((f) => f !== smart)]
    : FEATURE_ORDER

  return (
    <Stage variant="hero">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-[18px] pb-[22px] pt-[50px]">
        {/* Brand mark sits dead-centre at the top. No left-aligned Sign In
            — auth isn't built yet and the placeholder added noise. */}
        <div className="absolute left-1/2 top-[52px] z-[5] -translate-x-1/2">
          <BrandMark interactive={false} subtitle />
        </div>

        {/* === Centered cluster: ball + headline ========================== */}
        {/* Wrapped in flex-1 + justify-center so on tall phones (iPhone 14
            Pro and up) the headline sits closer to the visual centre of
            the screen instead of crowding the top. */}
        <div className="flex flex-1 flex-col justify-center">
          {/* Animated soccer ball hero — glow halo + ground shadow + the
              rotating bobbing ball itself. */}
          <div className="relative flex h-[170px] flex-shrink-0 items-center justify-center">
            <div
              aria-hidden="true"
              className="pitch-ball-glow pointer-events-none absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse"
              style={{ filter: 'blur(10px)' }}
            />
            <div
              aria-hidden="true"
              className="pitch-ball-shadow pointer-events-none absolute bottom-2 left-1/2 h-4 w-[100px] -translate-x-1/2 animate-shadow-breathe"
              style={{ filter: 'blur(10px)' }}
            />
            <div
              aria-hidden="true"
              className="pitch-ball relative z-[1] h-[100px] w-[100px] animate-ball-combo"
            />
          </div>

          {/* Headline + subhead */}
          <div className="px-[6px] pt-[6px]">
            <h1
              className="mb-[6px] whitespace-nowrap text-[24px] font-black leading-[1.04] text-white"
              style={{ letterSpacing: '-1.2px' }}
            >
              Their best game starts here.
            </h1>
            <p className="text-[12.5px] font-medium leading-[1.5] text-white/[0.55]">
              An AI coach for your kid — and you. Game prep, film review,
              and a college recruiting plan.
            </p>
          </div>
        </div>

        {/* === Chips (pinned to bottom of the stage) ====================== */}
        {/* Privacy / Terms footer removed — we don't have those pages yet
            and the placeholder links added noise. */}
        <div className="flex flex-col gap-[9px]">
          {ordered.map((feature) => {
            // Recruit chip also gets its progress sub-copy when it's NOT
            // the smart pick — a parent with a half-finished quiz should
            // see "Step 4 of 7" even if their last action was Analyze.
            // For other features we only override on the smart pick.
            let sub: string | undefined
            if (feature === smart) {
              sub = recruit ? smartSubCopy(feature, recruit) : undefined
            } else if (feature === 'recruit' && recruit) {
              sub = progressLabel(recruit)
            }
            return (
              <FeatureChip
                key={feature}
                feature={feature}
                smart={feature === smart}
                subCopy={sub}
              />
            )
          })}
        </div>
      </div>
    </Stage>
  )
}
