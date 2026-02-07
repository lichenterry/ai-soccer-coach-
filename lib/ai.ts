import Anthropic from '@anthropic-ai/sdk'
import { systemPrompts, CoachMode } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function getCoachResponse(
  messages: Message[],
  mode: CoachMode
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    system: systemPrompts[mode],
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const textBlock = response.content[0]
  if (textBlock.type === 'text') {
    return textBlock.text
  }

  return "Hey champ! I'm here to help. What's on your mind?"
}
