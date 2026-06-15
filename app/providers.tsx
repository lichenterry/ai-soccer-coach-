'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

if (
  typeof window !== 'undefined' &&
  POSTHOG_KEY &&
  !(posthog as unknown as { __loaded?: boolean }).__loaded
) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // App Router doesn't fire the SDK's automatic pageview correctly on
    // client navigations — we capture them manually in PageviewTracker.
    capture_pageview: false,
    capture_pageleave: true,
  })
}

function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || !POSTHOG_KEY) return
    let url = window.location.origin + pathname
    const q = searchParams?.toString()
    if (q) url += `?${q}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* useSearchParams forces dynamic rendering — Suspense keeps the rest
          of the tree statically renderable. */}
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  )
}
