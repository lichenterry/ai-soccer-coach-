/**
 * Golden Q&A Set for Recruitment Chat Evaluation
 *
 * Each question has:
 * - mustInclude: Key facts that MUST appear in the response
 * - mustNotInclude: Outdated or incorrect info that should NOT appear
 * - goldenAnswer: A reference-quality answer (what a perfect response looks like)
 */

export interface GoldenQA {
  id: string
  category: 'basics' | 'scholarships' | 'timeline' | 'process' | 'edge-case'
  question: string
  mustInclude: string[]
  mustNotInclude: string[]
  goldenAnswer: string
}

export const goldenQASet: GoldenQA[] = [
  // === BASICS ===
  {
    id: 'basics-1',
    category: 'basics',
    question: "What's the difference between D1, D2, and D3?",
    mustInclude: [
      'D1', 'D2', 'D3',
      'scholarship', // must mention scholarships differ
      '28', // D1 scholarship count (2025 rule)
      'athletic scholarship', // D3 has none
    ],
    mustNotInclude: [
      '9.9', // outdated D1 men's number
      '14', // outdated D1 women's number (now 28)
    ],
    goldenAnswer: `**🏆 D1 (Division 1)**
• Highest competition level
• Up to 28 scholarships per team, split among ~30 players
• Most players get partial scholarships, not full rides
• Biggest time commitment (20+ hrs/week)

**🎯 D2 (Division 2)**
• Up to 9 scholarships per team, split among players
• Good balance of athletics and academics
• Still competitive, less intense than D1

**📚 D3 (Division 3)**
• NO athletic scholarships
• BUT academic and need-based aid available (often generous)
• Academics come first
• Still competitive soccer — just different priorities

**Want to know more?**
• How do scholarships actually work?
• Which division is right for my kid?
• What about NAIA or JUCO?`,
  },

  {
    id: 'basics-2',
    category: 'basics',
    question: "What is the NCAA Eligibility Center?",
    mustInclude: [
      'register', // must register
      'D1', 'D2', // required for these divisions
      '$110', // cost
      'sophomore', // when to register
    ],
    mustNotInclude: [
      'Clearinghouse only', // old name, should explain both
    ],
    goldenAnswer: `The NCAA Eligibility Center (formerly called the Clearinghouse) is where student-athletes register to be certified for D1 and D2 college sports.

**📋 What it does:**
• Reviews your academic records (GPA, core courses)
• Confirms you're eligible to play college sports
• Required for D1 and D2 — not needed for D3 or NAIA

**📅 When to register:**
• Beginning of sophomore year (don't wait!)
• Cost: $110 (fee waivers available)

**✅ What you'll need:**
• Transcript from your high school
• List of courses you've taken
• SAT/ACT scores (optional as of 2023)

**Want to know more?**
• What GPA do I need to be eligible?
• What are "core courses"?
• How do I register?`,
  },

  // === SCHOLARSHIPS ===
  {
    id: 'scholarships-1',
    category: 'scholarships',
    question: "How do soccer scholarships work?",
    mustInclude: [
      'partial', // most are partial
      'split', // split among roster
      'full ride', // mention they're rare
      'academic', // can stack with academic aid
    ],
    mustNotInclude: [
      'everyone gets', // not everyone gets scholarships
      'guaranteed', // nothing is guaranteed
    ],
    goldenAnswer: `Soccer scholarships work differently than football or basketball — here's the reality:

**💰 The Numbers:**
• D1: Up to 28 scholarships split among ~30 players
• D2: Up to 9 scholarships split among ~31 players
• D3: NO athletic scholarships (academic/need-based only)
• NAIA: Up to 12 scholarships
• JUCO: Up to 18 scholarships (most attainable full rides)

**📊 The Reality:**
• Full rides are RARE in soccer
• Most players get partial scholarships ($5K-$15K/year)
• Coaches divide their scholarship budget across the roster

**✨ The Good News:**
• Academic scholarships can STACK with athletic aid
• A 3.5+ GPA makes you more valuable to coaches
• D3 schools often have generous academic merit aid

**Want to know more?**
• How can we maximize scholarship money?
• Does GPA affect athletic scholarships?
• What's the average scholarship amount?`,
  },

  {
    id: 'scholarships-2',
    category: 'scholarships',
    question: "Can we get a full ride for soccer?",
    mustInclude: [
      'rare', // full rides are rare
      'partial', // most are partial
      'JUCO', // most attainable path
    ],
    mustNotInclude: [
      'easy', // not easy
      'most players get full', // false
    ],
    goldenAnswer: `Honest answer: Full rides in soccer are rare.

**📊 Why?**
• Soccer isn't a "revenue sport" like football or basketball
• Coaches have limited scholarship budgets
• They split money across 25-30 players

**🎯 Where full rides are more possible:**
• JUCO (junior college): Up to 18 full scholarships — most attainable path
• NAIA: More flexibility, up to 12 scholarships
• Elite D1 programs: For top recruits only

**💡 A Better Strategy:**
• Aim for partial athletic + academic aid combined
• A $10K athletic scholarship + $15K academic merit = $25K/year
• Strong grades give you leverage

**Want to know more?**
• How do we maximize total aid?
• Is JUCO a good option?
• What GPA helps with scholarships?`,
  },

  // === TIMELINE ===
  {
    id: 'timeline-1',
    category: 'timeline',
    question: "When should we start the recruitment process?",
    mustInclude: [
      'sophomore', // key year
      'June 15', // key date for D1
      'freshman', // can start building profile
    ],
    mustNotInclude: [
      'senior year', // way too late to start
    ],
    goldenAnswer: `The earlier you start, the better — but here's the realistic timeline:

**🌱 Freshman Year (9th Grade)**
• Focus on academics (GPA matters!)
• Play competitive club soccer
• Start researching colleges casually

**📅 Sophomore Year (10th Grade)**
• Register with NCAA Eligibility Center
• Create highlight video
• Build target list of 20-30 schools
• Attend showcases where college coaches are

**🔥 June 15 After Sophomore Year — KEY DATE**
• D1 coaches can officially contact you
• This is when recruiting "opens"
• Be ready with video and emails

**🎯 Junior Year (11th Grade)**
• Peak recruiting activity
• Send emails, make calls, take visits
• Attend showcases strategically

**⏰ Senior Year (12th Grade)**
• Finalize decisions
• Sign National Letter of Intent
• Some opportunities still available

**Want to know more?**
• What should we do right now?
• How do we contact coaches?
• What's June 15 all about?`,
  },

  {
    id: 'timeline-2',
    category: 'timeline',
    question: "When can college coaches contact my kid?",
    mustInclude: [
      'June 15', // key date
      'sophomore', // after sophomore year
      'D1', // rules differ by division
    ],
    mustNotInclude: [
      'anytime', // not true for D1
      'freshman year', // too early for D1 contact
    ],
    goldenAnswer: `It depends on the division — rules are different:

**🏆 D1 (Division 1)**
• Coaches can contact you starting June 15 after sophomore year
• Before that, they can't call, text, or email
• But YOU can contact THEM anytime (they just can't respond directly)

**🎯 D2 (Division 2)**
• Coaches can call/text/email anytime
• In-person contact starts June 15 after sophomore year

**📚 D3 (Division 3)**
• No restrictions — coaches can contact you anytime
• Most relaxed recruiting rules

**📝 Important:**
• YOU can always reach out first
• Coaches are watching earlier than they can contact
• 74% of D1 coaches start evaluating talent in 10th grade

**Want to know more?**
• How do I reach out to coaches?
• What's a dead period?
• Can I visit colleges anytime?`,
  },

  // === PROCESS ===
  {
    id: 'process-1',
    category: 'process',
    question: "How do we reach out to college coaches?",
    mustInclude: [
      'email', // primary method
      'highlight video', // must include
      'questionnaire', // fill out on school websites
    ],
    mustNotInclude: [
      'wait for them', // be proactive
    ],
    goldenAnswer: `Don't wait for coaches to find you — be proactive!

**📧 Step 1: Fill Out Recruiting Questionnaires**
• Go to each school's athletic website
• Find the soccer recruiting questionnaire
• Fill out for every school on your list

**✉️ Step 2: Send Introduction Emails**
Include:
• Brief intro (name, grad year, position, club team)
• Why you're interested in THEIR program (be specific!)
• Link to highlight video
• GPA and test scores
• Upcoming tournaments where they can see you

**📞 Step 3: Follow Up**
• Call the coach 1-2 weeks after emailing
• Reference your email
• Leave a voicemail if they don't answer

**🔄 Step 4: Stay in Touch**
• Send updates every few months
• New highlight footage, tournament schedule, achievements

**Want to know more?**
• What makes a good highlight video?
• What should the email say exactly?
• How often should we follow up?`,
  },

  {
    id: 'process-2',
    category: 'process',
    question: "What should be in a highlight video?",
    mustInclude: [
      '3', '5', '6', // length in minutes (3-6)
      'game footage', // not practice
      'both feet', // show both feet
    ],
    mustNotInclude: [
      'practice only', // should be game footage
      '10 minutes', // too long
    ],
    goldenAnswer: `Coaches watch LOTS of videos — make yours count.

**⏱️ Length:**
• 3-6 minutes max
• Coaches decide in the first 60 seconds if they'll keep watching

**📹 What to Include:**
• Game footage (not practice)
• Your best 20-25 plays
• Show BOTH feet (one-footed players are a red flag)
• Decision-making moments, not just goals
• Position-specific plays

**🎯 Structure:**
1. Put your TOP 5-7 plays first
2. Use a simple marker (arrow/circle) to identify yourself
3. Include your name, position, grad year, contact info

**❌ Avoid:**
• Special effects or distracting music
• Clips longer than necessary
• Practice footage
• Obsessing over video quality — content matters more

**Want to know more?**
• How do we make a highlight video?
• What software should we use?
• Should we hire someone?`,
  },

  // === EDGE CASES ===
  {
    id: 'edge-1',
    category: 'edge-case',
    question: "My kid is in 8th grade. Should we start recruiting now?",
    mustInclude: [
      'early', // acknowledge it's early
      'academics', // focus on grades
      'development', // focus on getting better
    ],
    mustNotInclude: [
      'contact coaches now', // too early
      'urgent', // no urgency needed
    ],
    goldenAnswer: `8th grade is early for active recruiting — but not too early to prepare!

**✅ What to Focus on Now:**
• Academics — GPA from 9th grade onward counts for eligibility
• Soccer development — get on a competitive club team
• Research — start learning about the process

**⏳ What Can Wait:**
• Contacting coaches (they can't respond until after sophomore year for D1)
• Highlight videos (you'll look different in 2 years)
• Official recruiting profiles

**📅 When It Gets Real:**
• Sophomore year: Register with NCAA Eligibility Center
• June 15 after sophomore year: D1 coaches can contact you

**💡 Best Advice:**
Enjoy playing. Get better. Keep grades up. The recruiting process will come soon enough!

**Want to know more?**
• What should we do freshman year?
• How important is club team level?
• When should we make a highlight video?`,
  },

  {
    id: 'edge-2',
    category: 'edge-case',
    question: "We're juniors and no coaches have contacted us. Is it too late?",
    mustInclude: [
      'not too late', // reassurance
      'proactive', // need to reach out
      'D2', 'D3', // realistic options
    ],
    mustNotInclude: [
      'give up', // never say this
      'too late', // not true
    ],
    goldenAnswer: `Not too late — but time to get proactive!

**📊 Reality Check:**
• Many players don't get coach contact until junior/senior year
• Coaches can't contact everyone — they wait for YOU to reach out
• D2, D3, and NAIA recruit later than D1

**🔥 Action Plan for Juniors:**
1. Send emails to 20-30 coaches this week
2. Include highlight video and upcoming showcase schedule
3. Follow up with phone calls
4. Attend showcases where target coaches will be
5. Cast a wide net — don't just focus on "dream schools"

**🎯 Where to Focus:**
• D2 and D3 programs actively recruit juniors and seniors
• NAIA has flexible timelines
• Some D1 spots open up senior year (transfers, injuries)

**💡 Remember:**
No contact doesn't mean no interest. Coaches are busy. Your job is to make it easy for them to find you.

**Want to know more?**
• How do we email coaches?
• What showcases should we attend?
• Is D3 a good option?`,
  },
]

/**
 * How to use this file:
 *
 * 1. Import the goldenQASet
 * 2. For each question, send to the chat API
 * 3. Check response against mustInclude/mustNotInclude
 * 4. Compare to goldenAnswer for quality reference
 *
 * Example:
 * ```
 * const result = await evaluateResponse(response, goldenQA)
 * console.log(result.passed, result.missing, result.violations)
 * ```
 */

/**
 * Smart violation patterns - check context, not just presence
 * Returns true if the pattern is a VIOLATION (bad)
 */
const violationPatterns: Record<string, (response: string) => boolean> = {
  // BAD: "start in senior year" or "begin senior year"
  // OK: "by senior year" or "senior year you finalize"
  'senior year': (r) => {
    const lower = r.toLowerCase()
    return (
      lower.includes('start in senior year') ||
      lower.includes('start senior year') ||
      lower.includes('begin in senior year') ||
      lower.includes('begin senior year') ||
      lower.includes('wait until senior year') ||
      lower.includes('starting senior year')
    )
  },

  // BAD: "D1 coaches can contact anytime" or "coaches contact you anytime"
  // OK: "YOU can contact coaches anytime"
  'anytime': (r) => {
    const lower = r.toLowerCase()
    // Check if "anytime" appears near "coaches can contact" (bad)
    // but not near "you can contact" (ok)
    const hasCoachesContactAnytime =
      lower.includes('coaches can contact') && lower.includes('anytime')
    const hasYouContactAnytime =
      (lower.includes('you can contact') || lower.includes('you can reach')) &&
      lower.includes('anytime')

    // It's a violation if coaches can contact anytime, unless it's about YOU contacting them
    return hasCoachesContactAnytime && !hasYouContactAnytime
  },

  // BAD: "it's too late" or "too late to start"
  // OK: "not too late" or "never too late"
  'too late': (r) => {
    const lower = r.toLowerCase()
    // Check for negations
    const hasNegation =
      lower.includes('not too late') ||
      lower.includes("isn't too late") ||
      lower.includes('never too late') ||
      lower.includes("it's not too late")

    const hasTooLate = lower.includes('too late')

    // It's a violation only if "too late" appears WITHOUT a negation
    return hasTooLate && !hasNegation
  },

  // BAD: "9.9 scholarships" (outdated)
  '9.9': (r) => r.toLowerCase().includes('9.9'),

  // BAD: "14 scholarships" for D1 (outdated, now 28)
  '14': (r) => {
    const lower = r.toLowerCase()
    // Only a violation if 14 is mentioned as D1 scholarship count
    return lower.includes('14 scholarship') || lower.includes('14 total')
  },

  // BAD: "give up" or "no chance"
  'give up': (r) => r.toLowerCase().includes('give up'),

  // BAD: "practice only" for highlight videos
  'practice only': (r) => r.toLowerCase().includes('practice only'),

  // BAD: "10 minutes" for highlight video (too long)
  '10 minutes': (r) => {
    const lower = r.toLowerCase()
    return lower.includes('10 minute') && lower.includes('video')
  },

  // BAD: "everyone gets" scholarships
  'everyone gets': (r) => r.toLowerCase().includes('everyone gets'),

  // BAD: "guaranteed"
  'guaranteed': (r) => r.toLowerCase().includes('guaranteed'),

  // BAD: "easy" when talking about full rides
  'easy': (r) => {
    const lower = r.toLowerCase()
    return lower.includes('easy') && lower.includes('scholarship')
  },

  // BAD: "freshman year" for D1 contact (too early)
  'freshman year': (r) => {
    const lower = r.toLowerCase()
    return (
      lower.includes('d1') &&
      lower.includes('contact') &&
      lower.includes('freshman')
    )
  },

  // BAD: "Clearinghouse only" without explaining new name
  'Clearinghouse only': (r) => {
    const lower = r.toLowerCase()
    return lower.includes('clearinghouse') && !lower.includes('eligibility center')
  },
}

export function evaluateResponse(
  response: string,
  qa: GoldenQA
): {
  passed: boolean
  score: number
  missing: string[]
  violations: string[]
} {
  const responseLower = response.toLowerCase()

  // Check must-include terms
  const missing = qa.mustInclude.filter(
    (term) => !responseLower.includes(term.toLowerCase())
  )

  // Check violations using smart patterns
  const violations: string[] = []
  for (const term of qa.mustNotInclude) {
    const pattern = violationPatterns[term]
    if (pattern) {
      // Use smart pattern matching
      if (pattern(response)) {
        violations.push(term)
      }
    } else {
      // Fall back to simple string matching
      if (responseLower.includes(term.toLowerCase())) {
        violations.push(term)
      }
    }
  }

  const includeScore = qa.mustInclude.length > 0
    ? (qa.mustInclude.length - missing.length) / qa.mustInclude.length
    : 1

  const violationPenalty = violations.length * 0.2

  const score = Math.max(0, includeScore - violationPenalty)
  const passed = missing.length === 0 && violations.length === 0

  return { passed, score, missing, violations }
}
