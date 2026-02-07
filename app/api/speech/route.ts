import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'fable', // British accent, expressive
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI TTS error:', error)
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 })
    }

    // Return the audio as a blob
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('Speech API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
