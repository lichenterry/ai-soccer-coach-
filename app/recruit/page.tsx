'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Stage from '@/components/Stage'
import BrandMark from '@/components/BrandMark'
import {
  EMPTY_PROGRESS,
  getRecruitProgress,
  setRecruitProgress,
  clearRecruitProgress,
  isComplete,
  type QuizAnswers,
  type RecruitProgress,
  type Grade,
  type Position,
} from '@/lib/recruitProgress'
import { getRecruitResults, summariseAnswers } from '@/lib/recruitResults'
import { setLastUsed } from '@/lib/lastUsed'

/**
 * Unified Recruit Prep flow.
 *
 * Step 0  intro screen — "Where does your athlete stand?"
 * Steps 1-7  one question per screen, auto-advances after a brief delay
 * Step 8  results — three labelled cards + CTA to chat
 *
 * State is persisted to localStorage on every change so the home-page chip
 * can render "Step N of 7 · pick up where you left off" and the parent can
 * close + reopen the tab without losing progress.
 *
 * Auto-advance is intentional: tap a chip → 300ms feedback delay (chip
 * shows the selected state) → setStep(step + 1). No "Next" button. The
 * back button at the top lets parents revise without clearing the answer.
 */

type Question = {
  step: number
  key: keyof QuizAnswers
  label: string
  prompt: string
  /** 2 = two-up grid, 4 = four-up grid (small chips for long labels). */
  cols: 2 | 4
  options: Array<{ value: string; label: string }>
}

const QUESTIONS: Question[] = [
  {
    step: 1,
    key: 'grade',
    label: 'Step 1 of 7',
    prompt: 'What grade is your athlete in?',
    cols: 2,
    options: (['9th', '10th', '11th', '12th'] as Grade[]).map((g) => ({
      value: g,
      label: `${g} grade`,
    })),
  },
  {
    step: 2,
    key: 'position',
    label: 'Step 2 of 7',
    prompt: 'What position do they play?',
    cols: 2,
    options: (['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] as Position[]).map(
      (p) => ({ value: p, label: p }),
    ),
  },
  {
    step: 3,
    key: 'gpa',
    label: 'Step 3 of 7',
    prompt: "What's their GPA?",
    cols: 4,
    options: [
      { value: 'below-2.5', label: '<2.5' },
      { value: '2.5-3.0', label: '2.5–3.0' },
      { value: '3.0-3.5', label: '3.0–3.5' },
      { value: '3.5+', label: '3.5+' },
    ],
  },
  {
    step: 4,
    key: 'clubLevel',
    label: 'Step 4 of 7',
    prompt: 'What level club team does your athlete play on?',
    cols: 2,
    options: [
      { value: 'rec', label: 'Recreational' },
      { value: 'club', label: 'Club / Travel' },
      { value: 'ecnl-ga', label: 'ECNL / Girls Academy' },
      { value: 'mls-next-nal', label: 'MLS Next / NAL' },
    ],
  },
  {
    step: 5,
    key: 'coachContact',
    label: 'Step 5 of 7',
    prompt: 'Has any college coach contacted them?',
    cols: 2,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'Not yet' },
    ],
  },
  {
    step: 6,
    key: 'highlightVideo',
    label: 'Step 6 of 7',
    prompt: 'Do they have a highlight video?',
    cols: 2,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'Not yet' },
    ],
  },
  {
    step: 7,
    key: 'goal',
    label: 'Step 7 of 7',
    prompt: "What's the goal?",
    cols: 4,
    options: [
      { value: 'D1', label: 'D1' },
      { value: 'D2', label: 'D2' },
      { value: 'D3', label: 'D3' },
      { value: 'not-sure', label: 'Not sure' },
    ],
  },
]

const SHARE_TEXT =
  "I just checked my kid's college soccer recruitment readiness with Coach Fabian. Eye-opening."

export default function RecruitFlowPage() {
  // Default render = the intro state. localStorage is hydrated post-mount so
  // the SSR markup is stable and there's no flash of the wrong step.
  const [progress, setProgress] = useState<RecruitProgress>(EMPTY_PROGRESS)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState(false)
  // Brief visual lag between chip-tap and stage-advance — gives the
  // selected state time to register before the screen swaps.
  const [pendingAdvance, setPendingAdvance] = useState<keyof QuizAnswers | null>(
    null,
  )

  // Engagement signal for the home-page smart pick.
  useEffect(() => {
    setLastUsed('recruit')
  }, [])

  useEffect(() => {
    setProgress(getRecruitProgress())
    setHydrated(true)
  }, [])

  // Persist every state change once we've hydrated. We persist on hydrate
  // too so a half-formed progress in storage gets re-normalised.
  useEffect(() => {
    if (!hydrated) return
    setRecruitProgress(progress)
  }, [progress, hydrated])

  const step = progress.step
  const answers = progress.answers

  const goToStep = (next: number) => {
    setProgress((p) => {
      const complete = isComplete(p.answers)
      return {
        ...p,
        step: Math.max(0, Math.min(8, next)),
        completedAt: complete && next === 8 ? p.completedAt ?? Date.now() : p.completedAt,
      }
    })
  }

  const setAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setProgress((p) => {
      const newAnswers = { ...p.answers, [key]: value }
      const complete = isComplete(newAnswers)
      return {
        ...p,
        answers: newAnswers,
        completedAt: complete ? p.completedAt ?? Date.now() : p.completedAt,
      }
    })
  }

  const handleChipTap = (
    question: Question,
    rawValue: string,
  ) => {
    // Decode the radio-style string value back into the type the answer
    // expects (boolean for yes/no questions, otherwise the literal string).
    const decoded: QuizAnswers[keyof QuizAnswers] =
      rawValue === 'true' || rawValue === 'false'
        ? rawValue === 'true'
        : (rawValue as QuizAnswers[keyof QuizAnswers])
    setAnswer(question.key, decoded)

    setPendingAdvance(question.key)
    window.setTimeout(() => {
      setPendingAdvance(null)
      goToStep(question.step + 1)
    }, 300)
  }

  const handleRetake = () => {
    clearRecruitProgress()
    setProgress(EMPTY_PROGRESS)
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'College Soccer Recruitment Readiness',
          text: SHARE_TEXT,
          url,
        })
      } catch {
        // user cancelled
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Some browsers (Safari without https) reject clipboard writes.
    }
  }

  // window.print() is the v1 PDF stub. Real PDF generation (with branded
  // styling) is a later task — see brief task 3 / commit 3.
  const handleSavePdf = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <Stage>
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-[18px] pb-[22px] pt-[50px]">
        {/* === Top bar ==================================================== */}
        <TopBar
          showBack={step > 0 && step < 8}
          showShare={step === 8}
          onBack={() => goToStep(step - 1)}
          onShare={handleShare}
          shareLabel={copied ? 'Copied!' : undefined}
        />

        {/* Step indicator only during the question stages. */}
        {step >= 1 && step <= 7 && <StepDots7 active={step} />}

        {/* === STEP 0 — Intro ============================================ */}
        {step === 0 && (
          <IntroScreen
            progress={progress}
            hydrated={hydrated}
            onStart={() => goToStep(1)}
            onResume={() => goToStep(Math.max(1, Math.min(8, progress.step)))}
            onViewResults={() => goToStep(8)}
          />
        )}

        {/* === STEPS 1-7 — Questions ====================================== */}
        {step >= 1 && step <= 7 && (
          <QuestionScreen
            question={QUESTIONS[step - 1]}
            currentValue={answers[QUESTIONS[step - 1].key]}
            onSelect={handleChipTap}
            isAdvancing={pendingAdvance === QUESTIONS[step - 1].key}
            showAutoSave={step >= 2}
          />
        )}

        {/* === STEP 8 — Results ========================================== */}
        {step === 8 && (
          <ResultsScreen
            answers={answers}
            onRetake={handleRetake}
            onSavePdf={handleSavePdf}
          />
        )}
      </div>
    </Stage>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 * Sub-components — kept in-file because they're tightly coupled to this
 * page's state and not reused elsewhere yet. If any of these grow legs
 * (e.g. quiz progress dots used outside recruit), extract to /components.
 * ──────────────────────────────────────────────────────────────────── */

function TopBar({
  showBack,
  showShare,
  onBack,
  onShare,
  shareLabel,
}: {
  showBack: boolean
  showShare: boolean
  onBack: () => void
  onShare: () => void
  shareLabel?: string
}) {
  return (
    <div className="mb-1 flex items-center justify-between">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[14px] text-white/70 hover:bg-white/[0.1]"
        >
          ‹
        </button>
      ) : (
        // Use a Link back to home from the intro step rather than a no-op.
        // For results we hide the back chevron and rely on the share + CTAs.
        showShare ? (
          <span className="h-[30px] w-[30px]" aria-hidden="true" />
        ) : (
          <Link
            href="/"
            aria-label="Home"
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[14px] text-white/70 hover:bg-white/[0.1]"
          >
            ‹
          </Link>
        )
      )}
      <BrandMark />
      {showShare ? (
        <button
          type="button"
          onClick={onShare}
          aria-label={shareLabel ?? 'Share your results'}
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.1]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[13px] w-[13px]"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      ) : (
        <span className="h-[30px] w-[30px]" aria-hidden="true" />
      )}
    </div>
  )
}

/** Seven-segment progress bar. Done = mint at 40%, active = mint with glow. */
function StepDots7({ active }: { active: number }) {
  return (
    <div
      className="mt-[14px] mb-[6px] flex justify-center gap-[3px]"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={7}
      aria-valuenow={active}
      aria-label={`Step ${active} of 7`}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const idx = i + 1
        let tone = 'bg-white/[0.12]'
        if (idx === active) {
          tone = 'bg-pitch-mint shadow-[0_0_8px_rgba(110,231,183,0.5)]'
        } else if (idx < active) {
          tone = 'bg-pitch-mint/40'
        }
        return (
          <span
            key={idx}
            aria-hidden="true"
            className={`h-[3px] flex-1 rounded-[3px] ${tone}`}
          />
        )
      })}
    </div>
  )
}

function IntroScreen({
  progress,
  hydrated,
  onStart,
  onResume,
  onViewResults,
}: {
  progress: RecruitProgress
  hydrated: boolean
  onStart: () => void
  onResume: () => void
  onViewResults: () => void
}) {
  const complete = isComplete(progress.answers)
  // Only consider it "in progress" once we've actually read localStorage —
  // pre-hydration we render the default first-visit state.
  const inProgress = hydrated && !complete && progress.step > 0

  return (
    <div className="flex flex-1 flex-col pt-6">
      <div
        className="mx-auto mb-[22px] flex h-[90px] w-[90px] items-center justify-center rounded-[26px] border border-pitch-mint-300/[0.32] shadow-[0_0_32px_rgba(110,231,183,0.18),_inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          background:
            'linear-gradient(135deg, rgba(110,231,183,0.18) 0%, rgba(110,231,183,0.04) 100%)',
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[42px] w-[42px]"
          fill="none"
          stroke="#d1fae5"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      <div className="text-center">
        <h1
          className="mb-2 text-[28px] font-black leading-[1.05] text-white"
          style={{ letterSpacing: '-1.1px' }}
        >
          Where does
          <br />
          your athlete
          <br />
          stand?
        </h1>
        <p className="mx-auto mb-[22px] max-w-[230px] text-[13px] font-medium leading-[1.55] text-white/[0.55]">
          A 2-minute check to see where they fit in college soccer.
        </p>
      </div>

      <div className="mb-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-[14px]">
        <div className="mb-[10px] text-[10px] font-extrabold uppercase tracking-[1.6px] text-white/50">
          What you&rsquo;ll learn
        </div>
        <ul className="flex flex-col gap-[7px]">
          {[
            'Timeline — where they are in the recruiting window',
            'Realistic fit — D1, D2, D3, or NAIA',
            'Next 3 specific steps to take',
          ].map((line) => (
            <li
              key={line}
              className="flex items-center gap-[9px] text-[12.5px] font-semibold text-white/85"
            >
              <span
                aria-hidden="true"
                className="block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-pitch-mint shadow-[0_0_6px_rgba(110,231,183,0.5)]"
              />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {/* Resume / view-results affordance sits above the primary CTA so
            returning parents land on it without scanning. */}
        {complete && hydrated && (
          <button
            type="button"
            onClick={onViewResults}
            className="rounded-full border border-pitch-mint-300/40 bg-pitch-mint-300/[0.14] px-[18px] py-[10px] text-center text-[12px] font-bold tracking-[-0.1px] text-pitch-mint-100"
          >
            View your results →
          </button>
        )}
        {inProgress && (
          <button
            type="button"
            onClick={onResume}
            className="rounded-full border border-pitch-mint-300/40 bg-pitch-mint-300/[0.14] px-[18px] py-[10px] text-center text-[12px] font-bold tracking-[-0.1px] text-pitch-mint-100"
          >
            Resume where you left off →
          </button>
        )}
        <button
          type="button"
          onClick={onStart}
          className="flex items-center justify-center gap-[7px] rounded-full bg-white px-[18px] py-[14px] text-[14px] font-extrabold tracking-[-0.2px] text-[#050b0e] shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
        >
          {complete ? 'Retake the check' : 'Start the check'}{' '}
          <span className="text-[15px]">→</span>
        </button>
        <div className="text-center text-[10.5px] font-semibold tracking-[0.3px] text-white/40">
          7 quick questions · auto-saves as you go
        </div>
      </div>
    </div>
  )
}

function QuestionScreen({
  question,
  currentValue,
  onSelect,
  isAdvancing,
  showAutoSave,
}: {
  question: Question
  currentValue: unknown
  onSelect: (q: Question, value: string) => void
  isAdvancing: boolean
  showAutoSave: boolean
}) {
  const cols = question.cols === 4 ? 'grid-cols-4' : 'grid-cols-2'
  // Small chips for the four-up layout so labels like "MLS Next / NAL" fit.
  const chipSize =
    question.cols === 4
      ? 'text-[12px] py-3 px-1'
      : 'text-[13px] py-[14px] px-2'

  // For yes/no questions the answer is a boolean; convert to the string
  // representation we keep in the option list.
  const currentStr =
    typeof currentValue === 'boolean'
      ? currentValue
        ? 'true'
        : 'false'
      : currentValue == null
        ? null
        : String(currentValue)

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 mt-4 text-[10.5px] font-extrabold uppercase tracking-[1.8px] text-white/50">
        {question.label}
      </div>
      <h2
        className="mb-5 text-[24px] font-black leading-[1.12] text-white"
        style={{ letterSpacing: '-0.8px' }}
      >
        {question.prompt}
      </h2>

      <div className={`grid gap-2 ${cols}`}>
        {question.options.map((opt) => {
          const selected = currentStr === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(question, opt.value)}
              disabled={isAdvancing}
              aria-pressed={selected}
              className={
                selected
                  ? `rounded-2xl border-[1.5px] border-pitch-mint-300/55 text-center font-bold tracking-[-0.1px] text-white shadow-[0_0_14px_rgba(110,231,183,0.18)] transition-all ${chipSize}`
                  : `rounded-2xl border border-white/[0.09] bg-white/[0.05] text-center font-bold tracking-[-0.1px] text-white/85 transition-colors hover:bg-white/[0.08] ${chipSize}`
              }
              style={
                selected
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(110,231,183,0.18) 0%, rgba(110,231,183,0.06) 100%)',
                    }
                  : undefined
              }
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {showAutoSave && (
        <div className="mt-auto flex items-center justify-center gap-[6px] pt-4 text-[11px] font-semibold text-pitch-mint-300/70">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Auto-saved
        </div>
      )}
    </div>
  )
}

function ResultsScreen({
  answers,
  onRetake,
  onSavePdf,
}: {
  answers: QuizAnswers
  onRetake: () => void
  onSavePdf: () => void
}) {
  const results = getRecruitResults(answers)
  // Defensive: if we land on step 8 with missing answers (shouldn't happen
  // through the UI, but a stale localStorage payload could) render an
  // empty state instead of crashing.
  if (!results) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[13px] font-medium text-white/60">
          Hmm — looks like a few answers are missing. Let&rsquo;s retake the check.
        </p>
        <button
          type="button"
          onClick={onRetake}
          className="mt-4 rounded-full bg-white px-5 py-2 text-[13px] font-extrabold text-[#050b0e]"
        >
          Start over
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-[14px]">
      <h1
        className="mb-1 text-[24px] font-black leading-[1.08] text-white"
        style={{ letterSpacing: '-0.8px' }}
      >
        Here&rsquo;s where
        <br />
        you stand.
      </h1>
      <p className="mb-4 text-[12px] font-medium text-white/50">
        {summariseAnswers(answers)}
      </p>

      <ResultCard label="Timeline" tone="mint">
        <span className="mr-1">{results.timeline.emoji}</span>
        <RenderInlineBold text={results.timeline.label} />
      </ResultCard>

      <ResultCard label="Realistic fit" tone="gold">
        <RenderInlineBold text={results.realisticFit} />
      </ResultCard>

      <ResultCard label="Next 3 steps" tone="white">
        <ol className="mt-[2px] flex flex-col gap-[5px] [counter-reset:rs]">
          {results.nextSteps.map((step, i) => (
            <li
              key={i}
              className="flex gap-2 text-[11.5px] font-medium leading-[1.5] text-white/[0.88]"
            >
              <span
                aria-hidden="true"
                className="mt-[1px] inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-pitch-mint-300/[0.16] text-[9.5px] font-extrabold text-pitch-mint-300"
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </ResultCard>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        <Link
          href="/recruit/chat"
          className="flex items-center justify-center gap-[7px] rounded-full bg-white px-4 py-[13px] text-[13px] font-extrabold tracking-[-0.2px] text-[#050b0e] shadow-[0_6px_18px_rgba(0,0,0,0.3)]"
        >
          Ask Coach Fabian <span className="text-[15px]">→</span>
        </Link>
        <div className="flex gap-[7px]">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-[10px] text-center text-[11.5px] font-bold text-white/85 hover:bg-white/[0.08]"
          >
            Retake quiz
          </button>
          <button
            type="button"
            onClick={onSavePdf}
            className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-[10px] text-center text-[11.5px] font-bold text-white/85 hover:bg-white/[0.08]"
          >
            Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultCard({
  label,
  tone,
  children,
}: {
  label: string
  tone: 'mint' | 'gold' | 'white'
  children: React.ReactNode
}) {
  const toneClass =
    tone === 'mint'
      ? 'text-pitch-mint-300'
      : tone === 'gold'
        ? 'text-[#fcd34d]'
        : 'text-white/70'
  return (
    <div className="mb-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-[13px] py-3">
      <div
        className={`mb-[6px] flex items-center gap-[6px] text-[9.5px] font-extrabold uppercase tracking-[1.5px] ${toneClass}`}
      >
        <span
          aria-hidden="true"
          className="block h-[5px] w-[5px] rounded-full bg-current"
        />
        {label}
      </div>
      <div className="text-[11.5px] font-medium leading-[1.5] text-white/[0.88]">
        {children}
      </div>
    </div>
  )
}

/** Renders **bold** inline without pulling in a markdown library. */
function RenderInlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-bold text-white">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
