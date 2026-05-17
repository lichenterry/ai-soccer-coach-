import { redirect } from 'next/navigation'

/**
 * Legacy quiz URL — the readiness check now lives at /recruit as part of
 * the unified flow. A server-side permanent redirect keeps any external
 * links (Li's LinkedIn post, etc.) working without dragging the old UI
 * along.
 */
export default function QuizRedirect(): never {
  redirect('/recruit')
}
