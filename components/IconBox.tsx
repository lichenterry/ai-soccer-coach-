import { type ReactNode } from 'react'

interface IconBoxProps {
  children: ReactNode
  /** 'mint' tints the box with the brand accent (used on the smart-pick chip). */
  accent?: 'default' | 'mint'
  size?: number
  className?: string
}

/**
 * Dark-glass icon container. Two tones:
 *   default — subtle white/transparent (FeatureChip not-elevated, headers)
 *   mint    — gradient mint tint with halo (FeatureChip smart pick)
 */
export default function IconBox({
  children,
  accent = 'default',
  size = 38,
  className = '',
}: IconBoxProps) {
  const tone =
    accent === 'mint'
      ? 'pitch-iconbox-mint'
      : 'bg-white/[0.04] border-white/[0.08]'
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-xl border ${tone} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  )
}
