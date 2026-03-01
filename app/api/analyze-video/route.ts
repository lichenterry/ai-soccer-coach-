import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { systemPrompts } from '@/lib/prompts'

// Increase body size limit for video frames (App Router)
export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type PlayerPosition = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'

interface AnalyzeVideoRequest {
  frames: string[] // base64 encoded JPEG images
  position: PlayerPosition
  playerDescription: string // e.g., "Blue jersey, number 7"
}

export async function POST(request: Request) {
  try {
    const { frames, position, playerDescription }: AnalyzeVideoRequest = await request.json()

    if (!frames || frames.length === 0) {
      return NextResponse.json(
        { error: 'No frames provided' },
        { status: 400 }
      )
    }

    if (!position) {
      return NextResponse.json(
        { error: 'Player position is required' },
        { status: 400 }
      )
    }

    if (!playerDescription) {
      return NextResponse.json(
        { error: 'Player description is required' },
        { status: 400 }
      )
    }

    // Build the content array with text and images
    const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [
      {
        type: 'text',
        text: `Analyze this soccer footage.

PLAYER TO FOCUS ON: ${playerDescription}
POSITION: ${position}

These are ${frames.length} frames extracted from a game clip. Find the player matching the description above and analyze their play. Look for:
- Movement and positioning
- Ball control and touches
- Decision making
- Effort and hustle

If you can't clearly identify the player, do your best based on the description and position. Keep feedback encouraging and specific to what you observe!`
      }
    ]

    // Add each frame as an image
    for (const frame of frames) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: frame,
        },
      })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompts.analysis,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })

    const textBlock = response.content[0]
    if (textBlock.type === 'text') {
      const analysis = textBlock.text

      // Safety check with LLM-as-judge
      const safetyCheck = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `You are a safety checker for youth sports coaching feedback.

Is this feedback appropriate for a 10-14 year old athlete?

Flag as FAIL if the feedback contains:
- Harsh or discouraging language
- Personal criticism (vs constructive feedback)
- Inappropriate content
- Overly negative tone

Feedback to check:
"${analysis}"

Reply with exactly: PASS or FAIL: [one-line reason]`,
          },
        ],
      })

      const safetyResult = safetyCheck.content[0]
      if (safetyResult.type === 'text') {
        const isSafe = safetyResult.text.trim().toUpperCase().startsWith('PASS')

        if (!isSafe) {
          console.warn('Safety check failed:', safetyResult.text)
          // Return a safe fallback response
          return NextResponse.json({
            analysis: `🌟 WHAT YOU DID GREAT
• Great effort getting out there and playing!
• Keep working hard and having fun

📈 ONE THING TO WORK ON
• Keep practicing and watching the game closely

⚽ TRY THIS DRILL
• Practice passing with a friend or against a wall for 10 minutes a day`,
            safetyFlagged: true,
          })
        }
      }

      return NextResponse.json({ analysis })
    }

    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Video analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze video' },
      { status: 500 }
    )
  }
}
