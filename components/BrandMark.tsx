import Link from 'next/link'

/**
 * Centred FABIAN wordmark used at the top of stages.
 * Letter-spaced and dim by design — it's a marker, not a billboard.
 *
 * Doubles as a tap-target back to home so every surface that shows it has
 * a one-tap exit (matters most on Analyze Processing and Recruit Results,
 * where the ‹ chevron is hidden). Pass interactive={false} on the home
 * page so it doesn't link to itself.
 *
 * Pass subtitle on the home page so a cold visitor immediately knows what
 * Fabian is. Inner surfaces (Analyze, Recruit) skip the subtitle to keep
 * the header chrome quiet.
 */
export default function BrandMark({
  className = '',
  interactive = true,
  subtitle = false,
}: {
  className?: string
  interactive?: boolean
  subtitle?: boolean
}) {
  const wordmark = (
    <span className="text-[11px] font-extrabold tracking-[4px] text-white/50">
      FABIAN
    </span>
  )

  const inner = subtitle ? (
    <span className="flex flex-col items-center">
      {wordmark}
      <span className="mt-[3px] text-[8.5px] font-semibold uppercase tracking-[2.2px] text-white/30">
        AI Soccer Coach
      </span>
    </span>
  ) : (
    wordmark
  )

  if (!interactive) {
    return <span className={className}>{inner}</span>
  }

  return (
    <Link
      href="/"
      aria-label="Home"
      className={`group transition-colors ${className}`}
    >
      <span className="block [&_span]:transition-colors group-hover:[&_span:first-child]:text-white/80 group-hover:[&_span:last-child]:text-white/50">
        {inner}
      </span>
    </Link>
  )
}
