'use client'

interface MessageBubbleProps {
  content: string
  isUser: boolean
}

/**
 * Chat message bubble.
 *
 * Coach variant — dark glass, sharp bottom-left corner, 'strong' inside the
 * content reads as bright white for inline emphasis.
 *
 * User variant — mint-tinted glass, sharp bottom-right corner, 1.5px /
 * rgba(110,231,183,0.55) border with a mint outer glow. The border weight
 * was bumped from 1px in v12 because the chat sits on near-black at the
 * bottom of the gradient and the lighter border was disappearing.
 *
 * Coach content can include `**bold**` for inline emphasis — we render it as
 * `<strong>` without pulling in a markdown library.
 */
export default function MessageBubble({ content, isUser }: MessageBubbleProps) {
  if (isUser) {
    return (
      <div
        className="self-end max-w-[70%] rounded-2xl rounded-br-[4px] px-[14px] py-[11px] text-[13px] font-semibold leading-[1.5] text-white"
        style={{
          background:
            'linear-gradient(135deg, rgba(110,231,183,0.16) 0%, rgba(110,231,183,0.08) 100%)',
          border: '1.5px solid rgba(110, 231, 183, 0.55)',
          boxShadow:
            '0 4px 16px rgba(110,231,183,0.18), inset 0 0 0 0.5px rgba(110,231,183,0.2)',
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      className="self-start max-w-[78%] rounded-2xl rounded-bl-[4px] border border-white/[0.09] bg-white/[0.07] px-[13px] py-[11px] text-[13px] font-medium leading-[1.5] text-white/[0.92] shadow-[0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-md [&>strong]:font-bold [&>strong]:text-white"
      // Coach copy can include **emphasis** — render bold without markdown lib.
      dangerouslySetInnerHTML={{ __html: renderCoachMarkup(content) }}
    />
  )
}

/**
 * Tiny inline-bold renderer. We escape HTML first to keep this safe for
 * arbitrary model output, then re-allow `**...**` → `<strong>...</strong>`.
 */
function renderCoachMarkup(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
