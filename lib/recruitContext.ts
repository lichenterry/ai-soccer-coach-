/**
 * LLM-friendly formatter for a parent's readiness check.
 *
 * Distinct from `summariseAnswers` in lib/recruitResults.ts — that one
 * produces a human-skimmable string ("Sophomore · ECNL · Forward · 3.5+
 * GPA"). This one produces a structured block the model can reason over
 * directly. Both feed off the same QuizAnswers shape; keep them separate
 * so a copy tweak for the chat banner doesn't accidentally change what
 * the model sees.
 *
 * The block is appended to the recruit system prompt — see lib/ai.ts.
 * Empty/missing answers are simply omitted so a partially-filled quiz
 * doesn't ship `null` values to the model.
 */

import type { QuizAnswers } from './recruitProgress'

const GRADE_LABEL: Record<NonNullable<QuizAnswers['grade']>, string> = {
  '9th': '9th grade (freshman)',
  '10th': '10th grade (sophomore)',
  '11th': '11th grade (junior)',
  '12th': '12th grade (senior)',
}

const CLUB_LABEL: Record<NonNullable<QuizAnswers['clubLevel']>, string> = {
  rec: 'Recreational',
  club: 'Club / Travel',
  'ecnl-ga': 'ECNL or Girls Academy',
  'mls-next-nal': 'MLS Next or NAL',
}

const GPA_LABEL: Record<NonNullable<QuizAnswers['gpa']>, string> = {
  'below-2.5': 'Below 2.5',
  '2.5-3.0': '2.5 to 3.0',
  '3.0-3.5': '3.0 to 3.5',
  '3.5+': '3.5 or higher',
}

const GOAL_LABEL: Record<NonNullable<QuizAnswers['goal']>, string> = {
  D1: 'Division 1',
  D2: 'Division 2',
  D3: 'Division 3',
  'not-sure': 'Not sure yet',
}

/**
 * Returns a structured "PARENT'S READINESS CHECK" block, or `null` if the
 * answers are completely empty (nothing useful to inject). Partial answers
 * are included as-is so even a half-finished quiz still gives the model
 * something to anchor on.
 */
export function formatAnswersForPrompt(answers: QuizAnswers): string | null {
  const lines: string[] = []

  if (answers.grade) lines.push(`- Athlete grade: ${GRADE_LABEL[answers.grade]}`)
  if (answers.position) lines.push(`- Position: ${answers.position}`)
  if (answers.clubLevel) lines.push(`- Club level: ${CLUB_LABEL[answers.clubLevel]}`)
  if (answers.gpa) lines.push(`- GPA: ${GPA_LABEL[answers.gpa]}`)
  if (answers.coachContact !== null) {
    lines.push(
      `- College coach contact yet: ${answers.coachContact ? 'Yes' : 'No'}`,
    )
  }
  if (answers.highlightVideo !== null) {
    lines.push(
      `- Highlight video ready: ${answers.highlightVideo ? 'Yes' : 'No'}`,
    )
  }
  if (answers.goal) lines.push(`- Goal division: ${GOAL_LABEL[answers.goal]}`)

  if (lines.length === 0) return null

  return [
    "PARENT'S READINESS CHECK (use this — don't re-ask these questions):",
    ...lines,
    '',
    'Reference this context naturally in your advice. If the parent asks a',
    "general question, tailor the answer to their athlete's specific situation",
    'above. Do not list these facts back at them unless they ask.',
  ].join('\n')
}
