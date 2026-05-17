interface StepDotsProps {
  current: number
  total: number
  className?: string
}

/**
 * Top-of-stage progress indicator — `total` pills, the `current` one is
 * wide + glowing mint, completed ones are short + dim mint, upcoming ones
 * are short + dim white. Reads as progress without being a percentage bar.
 *
 * `current` is 1-indexed to match how the v14 spec talks about stages.
 */
export default function StepDots({ current, total, className = '' }: StepDotsProps) {
  return (
    <div
      className={`mt-[14px] mb-[6px] flex justify-center gap-1 ${className}`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1
        const isActive = idx === current
        const isDone = idx < current
        const widthClass = isActive || isDone ? 'w-[44px]' : 'w-[24px]'
        let toneClass = 'bg-white/[0.12]'
        if (isActive) {
          toneClass =
            'bg-pitch-mint shadow-[0_0_8px_rgba(110,231,183,0.5)]'
        } else if (isDone) {
          toneClass = 'bg-pitch-mint/40'
        }
        return (
          <span
            key={idx}
            aria-hidden="true"
            className={`h-[3px] rounded-[3px] transition-all duration-300 ${widthClass} ${toneClass}`}
          />
        )
      })}
    </div>
  )
}
