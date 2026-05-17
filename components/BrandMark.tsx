/**
 * Centred PITCH wordmark used at the top of stages.
 * Letter-spaced and dim by design — it's a marker, not a billboard.
 */
export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`text-[11px] font-extrabold tracking-[4px] text-white/50 ${className}`}
    >
      PITCH
    </span>
  )
}
