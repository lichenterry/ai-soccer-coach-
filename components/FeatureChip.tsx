import Link from 'next/link'
import IconBox from './IconBox'
import type { Feature } from '@/lib/lastUsed'

interface FeatureChipProps {
  feature: Feature
  /** When true: warm-mint background, animated gradient border, glow halo. */
  smart: boolean
  /** Override the default sub-copy (e.g. "Continue last clip · or upload new"). */
  subCopy?: string
}

const FEATURES: Record<
  Feature,
  { title: string; defaultSub: string; href: string; icon: JSX.Element }
> = {
  'pre-game': {
    title: 'Pre-Game Coach',
    defaultSub: 'Hype them up · calm pre-game nerves',
    href: '/coach',
    // Flame icon — pump-up energy.
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17h2a2.5 2.5 0 0 0 2.5-2.5c0-1.5-.5-2.5-3.5-5.5C9 11.5 8.5 13 8.5 14.5z" />
        <path d="M12 22c5-2 7-5.5 7-9.5 0-3-2-5.5-3-7-1 1.5-2 3.5-4 5-1-2-2-3-3-4-1 1.5-3 4-3 7 0 4 2 7.5 6 9.5z" />
      </svg>
    ),
  },
  analyze: {
    title: 'Game Analysis',
    defaultSub: 'AI feedback on game film',
    href: '/analyze',
    // Play-circle icon — film review.
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon
          points="10 8 16 12 10 16 10 8"
          fill="rgba(255,255,255,0.85)"
        />
      </svg>
    ),
  },
  recruit: {
    title: 'Recruit Prep',
    defaultSub: 'College-readiness check',
    href: '/recruit',
    // Mortarboard icon — college prep.
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
}

export default function FeatureChip({
  feature,
  smart,
  subCopy,
}: FeatureChipProps) {
  const { title, defaultSub, href, icon } = FEATURES[feature]

  // Smart pick swaps icon-fill from translucent white → mint to match the
  // elevated treatment. Cheaper than threading another prop through IconBox.
  const elevatedIcon =
    smart && feature === 'analyze' ? (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="#d1fae5" />
      </svg>
    ) : (
      icon
    )

  // SVG stroke styling — `stroke-current` lets IconBox swap the stroke colour
  // for the mint variant via CSS.
  const styledIcon = (
    <span className="block h-[60%] w-[60%] [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-white/85 [&>svg]:[stroke-linecap:round] [&>svg]:[stroke-linejoin:round] [&>svg]:[stroke-width:1.8]">
      {elevatedIcon}
    </span>
  )

  if (smart) {
    return (
      <Link
        href={href}
        className="pitch-chip-smart group relative flex items-center gap-[13px] rounded-2xl px-[15px] py-[13px]"
      >
        <IconBox accent="mint">{styledIcon}</IconBox>
        <span className="flex-1">
          <span className="block text-[14px] font-bold tracking-[-0.2px] text-white">
            {title}
          </span>
          <span className="mt-[2px] block text-[11px] font-medium text-white/50">
            {subCopy ?? defaultSub}
          </span>
        </span>
        {/* White circular arrow — the elevated CTA. */}
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#050b0e]"
          style={{ boxShadow: '0 4px 12px rgba(255,255,255,0.18)' }}
          aria-hidden="true"
        >
          →
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group relative flex items-center gap-[13px] rounded-2xl border border-white/[0.09] bg-white/[0.05] px-[15px] py-[13px] transition-colors hover:bg-white/[0.07]"
    >
      <IconBox>{styledIcon}</IconBox>
      <span className="flex-1">
        <span className="block text-[14px] font-bold tracking-[-0.2px] text-white">
          {title}
        </span>
        <span className="mt-[2px] block text-[11px] font-medium text-white/50">
          {subCopy ?? defaultSub}
        </span>
      </span>
      <span
        className="flex-shrink-0 text-[16px] font-bold text-white/40"
        aria-hidden="true"
      >
        ›
      </span>
    </Link>
  )
}
