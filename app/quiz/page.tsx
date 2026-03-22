'use client'

import { useState } from 'react'
import Link from 'next/link'

type Grade = '9th' | '10th' | '11th' | '12th'
type Position = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'
type GPA = 'below-2.5' | '2.5-3.0' | '3.0-3.5' | '3.5+'
type ClubLevel = 'rec' | 'club' | 'ecnl-ga' | 'mls-next-nal'
type Goal = 'D1' | 'D2' | 'D3' | 'not-sure'

interface QuizAnswers {
  grade: Grade | null
  position: Position | null
  gpa: GPA | null
  clubLevel: ClubLevel | null
  coachContact: boolean | null
  highlightVideo: boolean | null
  goal: Goal | null
}

const initialAnswers: QuizAnswers = {
  grade: null,
  position: null,
  gpa: null,
  clubLevel: null,
  coachContact: null,
  highlightVideo: null,
  goal: null,
}

export default function QuizPage() {
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers)
  const [showResults, setShowResults] = useState(false)
  const [copied, setCopied] = useState(false)

  const isComplete = Object.values(answers).every(v => v !== null)

  const handleSubmit = () => {
    if (isComplete) {
      setShowResults(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStartOver = () => {
    setAnswers(initialAnswers)
    setShowResults(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = "I just checked my kid's college soccer recruitment readiness. Eye-opening!"

    if (navigator.share) {
      try {
        await navigator.share({ title: 'College Soccer Recruitment Readiness Quiz', text, url })
      } catch (e) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Generate results based on answers
  const getResults = () => {
    const { grade, gpa, clubLevel, coachContact, highlightVideo, goal } = answers

    // Timeline position
    let timelineStatus = ''
    let timelineEmoji = ''
    if (grade === '9th') {
      timelineStatus = "You're early — which is great! Focus on academics and development."
      timelineEmoji = '🌱'
    } else if (grade === '10th') {
      timelineStatus = "You're entering the window. Coaches are starting to watch."
      timelineEmoji = '👀'
    } else if (grade === '11th') {
      timelineStatus = "Peak recruiting time. This year matters most."
      timelineEmoji = '🔥'
    } else {
      timelineStatus = "Late but not too late — focus on D2/D3 and NAIA opportunities."
      timelineEmoji = '⏰'
    }

    // Reality check
    let realityCheck = ''
    if (clubLevel === 'mls-next-nal' && gpa === '3.5+') {
      realityCheck = "Strong profile. D1 is realistic if you put in the outreach work. D2/D3 should have great options too."
    } else if (clubLevel === 'mls-next-nal' && (gpa === '3.0-3.5' || gpa === '2.5-3.0')) {
      realityCheck = "High playing level. GPA could limit some D1 academic options — target schools where you meet requirements."
    } else if (clubLevel === 'ecnl-ga' && gpa === '3.5+') {
      realityCheck = "Solid profile. D1 mid-majors and strong D2 programs are realistic. Academics give you options."
    } else if (clubLevel === 'ecnl-ga') {
      realityCheck = "Good playing level. D1 is possible at mid-majors, D2 is realistic. Cast a wide net."
    } else if (clubLevel === 'club' && gpa === '3.5+') {
      realityCheck = "Academics are a strength. D2/D3 schools will be interested. D1 is a reach but possible."
    } else if (clubLevel === 'club') {
      realityCheck = "D2 and D3 are realistic targets. Some NAIA programs too. Focus your outreach there."
    } else {
      realityCheck = "D3 and NAIA are your best paths. Good news: D3 has great academic schools and no athletic scholarship pressure."
    }

    // Adjust for goal mismatch
    if (goal === 'D1' && clubLevel === 'rec') {
      realityCheck = "D1 is a significant reach from rec-level play. Consider moving to a club team to increase visibility, or explore D3 programs."
    }

    // Next steps (personalized)
    const nextSteps: string[] = []

    if (grade === '9th' || grade === '10th') {
      if (!highlightVideo) {
        nextSteps.push("Start collecting game footage for a highlight video")
      }
      nextSteps.push("Register with the NCAA Eligibility Center ($110)")
      nextSteps.push("Build a target list of 20-30 schools to research")
    } else if (grade === '11th') {
      if (!coachContact) {
        nextSteps.push("Start emailing coaches NOW — don't wait for them to find you")
      }
      if (!highlightVideo) {
        nextSteps.push("Get a highlight video ready ASAP — this is urgent")
      } else {
        nextSteps.push("Send your highlight video to 10 target coaches this week")
      }
      nextSteps.push("Attend showcases where your target coaches will be")
    } else {
      if (!coachContact) {
        nextSteps.push("Cast a wide net — email D2, D3, and NAIA coaches aggressively")
      }
      nextSteps.push("Consider a gap year or JUCO if your top choices don't work out")
      nextSteps.push("Don't overlook late recruiting opportunities — rosters change")
    }

    // Add GPA-specific advice
    if (gpa === 'below-2.5') {
      nextSteps.push("Priority: Get GPA above 2.3 for NCAA eligibility")
    } else if (gpa === '3.5+') {
      nextSteps.push("Leverage your academics — mention GPA in coach emails")
    }

    return {
      timelineStatus,
      timelineEmoji,
      realityCheck,
      nextSteps: nextSteps.slice(0, 3), // Max 3 steps
    }
  }

  const results = showResults ? getResults() : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-teal-600">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
        <h1 className="text-white font-bold text-lg">Recruitment Quiz</h1>
        <div className="w-12" />
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">

          {!showResults ? (
            /* Quiz */
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎯</div>
                <h2 className="text-xl font-bold text-gray-800">College Soccer Recruitment Readiness</h2>
                <p className="text-gray-600 text-sm mt-1">Find out where you stand in 2 minutes</p>
              </div>

              <div className="space-y-6">
                {/* Question 1: Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What grade is your child in?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['9th', '10th', '11th', '12th'] as Grade[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setAnswers({ ...answers, grade: g })}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          answers.grade === g
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What position do they play?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] as Position[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setAnswers({ ...answers, position: p })}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          answers.position === p
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: GPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's their GPA?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'below-2.5' as GPA, label: '<2.5' },
                      { value: '2.5-3.0' as GPA, label: '2.5-3.0' },
                      { value: '3.0-3.5' as GPA, label: '3.0-3.5' },
                      { value: '3.5+' as GPA, label: '3.5+' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setAnswers({ ...answers, gpa: g.value })}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          answers.gpa === g.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: Club Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What level club team?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'rec' as ClubLevel, label: 'Recreational' },
                      { value: 'club' as ClubLevel, label: 'Club / Travel' },
                      { value: 'ecnl-ga' as ClubLevel, label: 'ECNL / Girls Academy' },
                      { value: 'mls-next-nal' as ClubLevel, label: 'MLS Next / NAL' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setAnswers({ ...answers, clubLevel: c.value })}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          answers.clubLevel === c.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5: Coach Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Has any college coach contacted them?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAnswers({ ...answers, coachContact: true })}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        answers.coachContact === true
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setAnswers({ ...answers, coachContact: false })}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        answers.coachContact === false
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Not yet
                    </button>
                  </div>
                </div>

                {/* Question 6: Highlight Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do they have a highlight video ready?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAnswers({ ...answers, highlightVideo: true })}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        answers.highlightVideo === true
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setAnswers({ ...answers, highlightVideo: false })}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        answers.highlightVideo === false
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Not yet
                    </button>
                  </div>
                </div>

                {/* Question 7: Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's the goal?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'D1' as Goal, label: 'D1' },
                      { value: 'D2' as Goal, label: 'D2' },
                      { value: 'D3' as Goal, label: 'D3' },
                      { value: 'not-sure' as Goal, label: 'Not sure' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setAnswers({ ...answers, goal: g.value })}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          answers.goal === g.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!isComplete}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-full hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                >
                  See My Results
                </button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{results?.timelineEmoji}</div>
                  <h2 className="text-xl font-bold text-gray-800">Your Recruitment Snapshot</h2>
                </div>

                {/* Timeline Status */}
                <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-emerald-800 mb-1">Where You Are</h3>
                  <p className="text-emerald-700">{results?.timelineStatus}</p>
                </div>

                {/* Reality Check */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-1">Reality Check</h3>
                  <p className="text-blue-700">{results?.realityCheck}</p>
                </div>

                {/* Next Steps */}
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Your Next Steps</h3>
                  <ul className="space-y-2">
                    {results?.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-700">
                        <span className="font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTAs */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Want to go deeper?</h3>
                <div className="space-y-3">
                  <Link
                    href="/recruit"
                    className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full text-center hover:scale-105 transition-all"
                  >
                    Ask Coach Fabian About Recruitment
                  </Link>
                  <button
                    onClick={handleShare}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? '✓ Link Copied!' : '📤 Share This Quiz'}
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="w-full text-gray-500 text-sm hover:text-gray-700"
                  >
                    Take Quiz Again
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-white/80 text-sm px-4">
                Built by a soccer mom figuring this out too.
                <br />
                Questions? <a href="https://www.linkedin.com/in/li-terry-product-manager/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">DM me on LinkedIn</a>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
