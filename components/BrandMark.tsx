import Link from 'next/link'

/**
 * Centred PITCH wordmark used at the top of stages.
 * Letter-spaced and dim by design — it's a marker, not a billboard.
 *
 * Doubles as a tap-target back to home so every surface that shows it has
 * a one-tap exit (matters most on Analyze Processing and Recruit Results,
 * where the ‹ chevron is hidden). Pass interactive={false} on the home
 * page so it doesn't link to itself.
 */
export default function BrandMark({
  className = '',
  interactive = true,
}: {
  className?: string
  interactive?: boolean
}) {
  const base = `text-[11px] font-extrabold tracking-[4px] text-white/50 ${className}`

  if (!interactive) {
    return <span className={base}>PITCH</span>
  }

  return (
    <Link
      href="/"
      aria-label="Home"
      className={`${base} transition-colors hover:text-white/80`}
    >
      PITCH
    </Link>
  )
}
