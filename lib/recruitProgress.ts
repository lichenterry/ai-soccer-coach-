/**
 * Recruit Prep progress tracking.
 *
 * Persists the 7-step readiness check so a parent can: (1) close the tab
 * mid-flow and resume on the home page, (2) come back days later and not
 * lose their place, (3) see "View your results" as the home-page sub-copy
 * once complete. The home-page chip reads `progressLabel(...)` to render
 * those states.
 *
 * Storage is intentionally `localStorage` only — no server round-trip. All
 * failure modes (private browsing, SSR, malformed JSON, quota) fall back to
 * the empty progress state, which is a safe default everywhere it's read.
 */

export type Grade = '9th' | '10th' | '11th' | '12th'
export type Position = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'
export type GPA = 'below-2.5' | '2.5-3.0' | '3.0-3.5' | '3.5+'
export type ClubLevel = 'rec' | 'club' | 'ecnl-ga' | 'mls-next-nal'
export type Goal = 'D1' | 'D2' | 'D3' | 'not-sure'

export type QuizAnswers = {
  grade: Grade | null
  position: Position | null
  gpa: GPA | null
  clubLevel: ClubLevel | null
  coachContact: boolean | null
  highlightVideo: boolean | null
  goal: Goal | null
}

export type RecruitProgress = {
  /** 0 = intro, 1–7 = question steps, 8 = results. */
  step: number
  answers: QuizAnswers
  /** ms timestamp when all answers were first filled (null otherwise). */
  completedAt: number | null
}

const STORAGE_KEY = 'pitch.recruitProgress'

export const EMPTY_ANSWERS: QuizAnswers = {
  grade: null,
  position: null,
  gpa: null,
  clubLevel: null,
  coachContact: null,
  highlightVideo: null,
  goal: null,
}

export const EMPTY_PROGRESS: RecruitProgress = {
  step: 0,
  answers: EMPTY_ANSWERS,
  completedAt: null,
}

const VALID_GRADES: Grade[] = ['9th', '10th', '11th', '12th']
const VALID_POSITIONS: Position[] = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper']
const VALID_GPAS: GPA[] = ['below-2.5', '2.5-3.0', '3.0-3.5', '3.5+']
const VALID_CLUB_LEVELS: ClubLevel[] = ['rec', 'club', 'ecnl-ga', 'mls-next-nal']
const VALID_GOALS: Goal[] = ['D1', 'D2', 'D3', 'not-sure']

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

/** Coerce a raw localStorage payload into a valid RecruitProgress shape. */
function normalize(raw: unknown): RecruitProgress {
  if (!raw || typeof raw !== 'object') return EMPTY_PROGRESS
  const obj = raw as Record<string, unknown>
  const a = (obj.answers as Record<string, unknown> | undefined) ?? {}

  const answers: QuizAnswers = {
    grade: isOneOf(a.grade, VALID_GRADES) ? a.grade : null,
    position: isOneOf(a.position, VALID_POSITIONS) ? a.position : null,
    gpa: isOneOf(a.gpa, VALID_GPAS) ? a.gpa : null,
    clubLevel: isOneOf(a.clubLevel, VALID_CLUB_LEVELS) ? a.clubLevel : null,
    coachContact: typeof a.coachContact === 'boolean' ? a.coachContact : null,
    highlightVideo: typeof a.highlightVideo === 'boolean' ? a.highlightVideo : null,
    goal: isOneOf(a.goal, VALID_GOALS) ? a.goal : null,
  }

  const stepRaw = typeof obj.step === 'number' ? obj.step : 0
  const step = Math.max(0, Math.min(8, Math.floor(stepRaw)))

  const completedAt =
    typeof obj.completedAt === 'number' && Number.isFinite(obj.completedAt)
      ? obj.completedAt
      : null

  return { step, answers, completedAt }
}

export function getRecruitProgress(): RecruitProgress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return EMPTY_PROGRESS
    return normalize(JSON.parse(stored))
  } catch {
    return EMPTY_PROGRESS
  }
}

export function setRecruitProgress(progress: RecruitProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage may throw in private browsing or when over quota.
    // Personalization is a nice-to-have — silently swallow.
  }
}

export function clearRecruitProgress(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** True when every answer is filled. */
export function isComplete(answers: QuizAnswers): boolean {
  return (Object.values(answers) as Array<unknown>).every((v) => v !== null)
}

/** Count of answered questions (0–7). Used for "Step X of 7" math. */
export function answeredCount(answers: QuizAnswers): number {
  return (Object.values(answers) as Array<unknown>).filter((v) => v !== null).length
}

/**
 * Home-page sub-copy.
 *
 *   not started → undefined           (chip falls back to its default sub)
 *   mid-flow    → "Step N of 7 · pick up where you left off"
 *   complete    → "View your results · ask Coach Fabian"
 */
export function progressLabel(progress: RecruitProgress): string | undefined {
  const answered = answeredCount(progress.answers)
  if (isComplete(progress.answers)) {
    return 'View your results · ask Coach Fabian'
  }
  if (answered > 0 || progress.step > 0) {
    // Next unanswered step is 1-indexed: 1 if 0 answered, 2 if 1 answered, etc.
    const nextStep = Math.min(7, answered + 1)
    return `Step ${nextStep} of 7 · pick up where you left off`
  }
  return undefined
}
