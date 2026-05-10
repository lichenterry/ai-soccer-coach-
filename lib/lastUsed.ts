/**
 * Last-used feature tracking.
 *
 * Drives the home-page "smart pick" — the chip with the mint glow halo. We
 * read this on render to elevate whichever feature the family touched most
 * recently. Defaults to 'pre-game' for first-time visitors so the obvious
 * MVP feature is the one that lights up.
 *
 * Storage is intentionally `localStorage` only — no server round-trip, no
 * cookies. Failure modes (private browsing, SSR, quota exceeded) all fall
 * back to the default.
 */

export type Feature = 'pre-game' | 'analyze' | 'recruit'

const STORAGE_KEY = 'pitch.lastUsed'
const DEFAULT_FEATURE: Feature = 'pre-game'

const isFeature = (value: unknown): value is Feature =>
  value === 'pre-game' || value === 'analyze' || value === 'recruit'

export function getLastUsed(): Feature {
  if (typeof window === 'undefined') return DEFAULT_FEATURE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isFeature(stored) ? stored : DEFAULT_FEATURE
  } catch {
    return DEFAULT_FEATURE
  }
}

export function setLastUsed(feature: Feature): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, feature)
  } catch {
    // localStorage may throw in private browsing or when over quota.
    // Silently swallow — personalization is a nice-to-have, not critical.
  }
}
