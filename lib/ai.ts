import Anthropic from '@anthropic-ai/sdk'
import { systemPrompts, CoachMode } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface CoachOptions {
  /**
   * Extra system context appended to the mode's base system prompt with a
   * blank line in between. Used by recruit mode to inject the parent's
   * readiness check (see lib/recruitContext.ts). Anything falsy is
   * ignored — keep the base prompt unchanged when there's nothing to add.
   */
  extraSystemContext?: string | null
}

export async function getCoachResponse(
  messages: Message[],
  mode: CoachMode,
  options: CoachOptions = {},
): Promise<string> {
  // Recruit mode needs more tokens for detailed explanations
  const maxTokens = mode === 'recruit' ? 500 : 150

  const baseSystem = systemPrompts[mode]
  const system = options.extraSystemContext
    ? `${baseSystem}\n\n${options.extraSystemContext}`
    : baseSystem

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
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
