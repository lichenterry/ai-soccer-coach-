import { NextRequest, NextResponse } from 'next/server'
import { getCoachResponse, Message } from '@/lib/ai'
import { CoachMode } from '@/lib/prompts'
import { formatAnswersForPrompt } from '@/lib/recruitContext'
import type { QuizAnswers } from '@/lib/recruitProgress'

interface ChatRequestBody {
  messages: Message[]
  mode: CoachMode
  /**
   * Optional: parent's quiz answers from /recruit. Only injected when
   * mode === 'recruit' so the prompt for hype/calm/analysis stays
   * untouched. The client sends fresh values on every request (read
   * from localStorage at send time) so retakes are picked up
   * immediately.
   */
  quizContext?: QuizAnswers | null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const { messages, mode, quizContext } = body

    if (!messages || !mode) {
      return NextResponse.json(
        { error: 'Missing messages or mode' },
        { status: 400 },
      )
    }

    // Recruit mode only — other modes don't have a quiz to draw from.
    const extraSystemContext =
      mode === 'recruit' && quizContext
        ? formatAnswersForPrompt(quizContext)
        : null

    const response = await getCoachResponse(messages, mode, {
      extraSystemContext,
    })

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from coach' },
      { status: 500 },
    )
  }
}
