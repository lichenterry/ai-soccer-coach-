import { NextRequest, NextResponse } from 'next/server'
import { getCoachResponse, Message } from '@/lib/ai'
import { CoachMode } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, mode } = body as { messages: Message[]; mode: CoachMode }

    if (!messages || !mode) {
      return NextResponse.json(
        { error: 'Missing messages or mode' },
        { status: 400 }
      )
    }

    const response = await getCoachResponse(messages, mode)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from coach' },
      { status: 500 }
    )
  }
}
