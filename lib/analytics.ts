'use client'

import posthog from 'posthog-js'

// Event taxonomy lives here so every call site is type-checked against the
// same names + props. If you add an event, add it here first.
export type AnalyticsEvent =
  | { name: 'coach_message_sent'; props: { mode: 'hype' | 'calm' | 'recruit' } }
  | { name: 'analyze_upload_started'; props?: undefined }
  | {
      name: 'analyze_video_uploaded'
      props: { file_size: number; duration?: number }
    }
  | { name: 'analyze_results_viewed'; props?: undefined }
  | { name: 'recruit_quiz_step_completed'; props: { step: number } }
  | { name: 'recruit_quiz_finished'; props?: undefined }
  | {
      name: 'voice_mode_toggled'
      props: { surface: 'coach' | 'recruit' | 'analyze'; enabled: boolean }
    }

type EventMap = {
  [E in AnalyticsEvent as E['name']]: E extends { props: infer P } ? P : void
}

export function track<N extends keyof EventMap>(
  ...args: EventMap[N] extends void ? [name: N] : [name: N, props: EventMap[N]]
) {
  if (typeof window === 'undefined') return
  const [name, props] = args
  // No-op when PostHog isn't initialized (missing key in local dev).
  if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return
  posthog.capture(name as string, props as Record<string, unknown> | undefined)
}
