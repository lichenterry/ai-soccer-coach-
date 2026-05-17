/**
 * Decision tree that turns 7 quiz answers into a personalised readiness
 * snapshot. Lifted verbatim (with a tone clean-up to match v15 copy) from
 * the legacy /quiz page so the logic stays auditable in one place.
 *
 * NOTE: the rules here are intentionally rough heuristics, not authoritative
 * recruiting advice. They're meant to give a parent an honest starting
 * point and a few next steps — Coach Fabian (chat) handles nuance.
 */

import type { QuizAnswers, Grade } from './recruitProgress'

export interface RecruitResults {
  timeline: {
    label: string
    emoji: string
  }
  realisticFit: string
  nextSteps: string[]
  /** Compact answers summary for the sub-headline. */
  summary: string
}

const GRADE_TIMELINE: Record<Grade, { label: string; emoji: string }> = {
  '9th': {
    label:
      "You're early — which is great. Focus on academics and development; the rest follows.",
    emoji: '🌱',
  },
  '10th': {
    label:
      "You're entering the window 👀 Coaches are starting to watch. The next 18 months matter most.",
    emoji: '👀',
  },
  '11th': {
    label:
      'Peak recruiting time. This year matters most — be proactive.',
    emoji: '🔥',
  },
  '12th': {
    label:
      'Late but not too late — focus on D2, D3, and NAIA opportunities and stay aggressive.',
    emoji: '⏰',
  },
}

export function getRecruitResults(answers: QuizAnswers): RecruitResults | null {
  const { grade, gpa, clubLevel, coachContact, highlightVideo, goal, position } = answers
  if (!grade || !gpa || !clubLevel || !goal || !position) return null

  const timeline = GRADE_TIMELINE[grade]

  // ── Realistic fit — intersection of club level and academics, with a goal-
  //    mismatch override at the bottom for rec-level kids aiming D1.
  let realisticFit = ''
  if (clubLevel === 'mls-next-nal' && gpa === '3.5+') {
    realisticFit =
      'Strong profile. **D1** is realistic if you put in the outreach work. **D2/D3** should have great options too.'
  } else if (clubLevel === 'mls-next-nal' && (gpa === '3.0-3.5' || gpa === '2.5-3.0')) {
    realisticFit =
      'High playing level. GPA may limit some **D1 academic** options — target schools where you meet the requirements.'
  } else if (clubLevel === 'ecnl-ga' && gpa === '3.5+') {
    realisticFit =
      'Solid profile. **D1 mid-majors and strong D2** programs are realistic. Academics give you options.'
  } else if (clubLevel === 'ecnl-ga') {
    realisticFit =
      'Good playing level. **D1 is possible at mid-majors**, **D2** is realistic. Cast a wide net.'
  } else if (clubLevel === 'club' && gpa === '3.5+') {
    realisticFit =
      'Academics are a strength. **D2/D3** schools will be interested. **D1** is a reach but possible.'
  } else if (clubLevel === 'club') {
    realisticFit =
      '**D2 and D3** are realistic targets. Some **NAIA** programs too. Focus your outreach there.'
  } else {
    realisticFit =
      '**D3 and NAIA** are your best paths. Good news: D3 has great academic schools and no athletic-scholarship pressure.'
  }
  if (goal === 'D1' && clubLevel === 'rec') {
    realisticFit =
      '**D1** is a significant reach from rec-level play. Consider moving to a club team to increase visibility, or explore **D3** programs.'
  }

  // ── Next steps — prioritised by grade urgency, with GPA / video / contact
  //    gaps filled in as they apply.
  const nextSteps: string[] = []

  if (grade === '9th' || grade === '10th') {
    if (!highlightVideo) {
      nextSteps.push('Start collecting game footage for a highlight video')
    }
    nextSteps.push('Register with the NCAA Eligibility Center ($110)')
    nextSteps.push('Build a target list of 20–30 schools to research')
  } else if (grade === '11th') {
    if (!coachContact) {
      nextSteps.push("Start emailing coaches now — don't wait for them to find you")
    }
    if (!highlightVideo) {
      nextSteps.push('Get a highlight video ready ASAP — this is urgent')
    } else {
      nextSteps.push('Send your highlight video to 10 target coaches this week')
    }
    nextSteps.push('Attend showcases where your target coaches will be')
  } else {
    if (!coachContact) {
      nextSteps.push('Cast a wide net — email D2, D3, and NAIA coaches aggressively')
    }
    nextSteps.push("Consider a gap year or JUCO if your top choices don't work out")
    nextSteps.push("Don't overlook late recruiting — rosters change all summer")
  }

  if (gpa === 'below-2.5') {
    nextSteps.push('Priority: get GPA above 2.3 for NCAA eligibility')
  } else if (gpa === '3.5+') {
    nextSteps.push('Leverage your academics — mention GPA in every coach email')
  }

  return {
    timeline,
    realisticFit,
    nextSteps: nextSteps.slice(0, 3),
    summary: summariseAnswers(answers),
  }
}

const GRADE_NICKNAME: Record<Grade, string> = {
  '9th': 'Freshman',
  '10th': 'Sophomore',
  '11th': 'Junior',
  '12th': 'Senior',
}

const CLUB_LEVEL_LABEL: Record<NonNullable<QuizAnswers['clubLevel']>, string> = {
  rec: 'Rec',
  club: 'Club',
  'ecnl-ga': 'ECNL',
  'mls-next-nal': 'MLS Next',
}

const GPA_LABEL: Record<NonNullable<QuizAnswers['gpa']>, string> = {
  'below-2.5': '<2.5 GPA',
  '2.5-3.0': '2.5–3.0 GPA',
  '3.0-3.5': '3.0–3.5 GPA',
  '3.5+': '3.5+ GPA',
}

/** "Sophomore · ECNL · Forward · 3.5+ GPA" — compact identity line. */
export function summariseAnswers(answers: QuizAnswers): string {
  const parts: string[] = []
  if (answers.grade) parts.push(GRADE_NICKNAME[answers.grade])
  if (answers.clubLevel) parts.push(CLUB_LEVEL_LABEL[answers.clubLevel])
  if (answers.position) parts.push(answers.position)
  if (answers.gpa) parts.push(GPA_LABEL[answers.gpa])
  return parts.join(' · ')
}
