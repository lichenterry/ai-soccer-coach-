'use client'

import type { ChatMode } from '@/lib/prompts'

interface ModeToggleProps {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

/**
 * Hype / Calm slide toggle.
 *
 * Visual model:
 *   - The track is a dark-glass pill.
 *   - A mint-glass slider sits over the active option.
 *   - In production the slider transitions left/right on tap (~350ms spring).
 *     The auto-loop `slideLR` keyframe is preview-only — see tailwind config.
 *
 * Emojis are *active-state animated*: the 🔥 blooms from the bottom only
 * while Hype is selected; the 😌 burst-then-breathes only while Calm is
 * selected. The other emoji idles small.
 *
 * Designed to be extensible to a third mode later (e.g. recruit), but the
 * v1 ship is two-mode only.
 */
export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const isHype = mode === 'hype'

  return (
    <div
      role="tablist"
      aria-label="Coach mode"
      className="relative flex rounded-full border border-white/[0.08] bg-white/[0.05] p-[3px]"
    >
      {/* Slider — width is half the track minus the inset padding. */}
      <span
        aria-hidden="true"
        className="pitch-mode-slider pointer-events-none absolute bottom-[3px] left-[3px] top-[3px] rounded-full transition-transform duration-[350ms] ease-out"
        style={{
          width: 'calc(50% - 3px)',
          transform: isHype ? 'translateX(0)' : 'translateX(100%)',
        }}
      />

      <button
        type="button"
        role="tab"
        aria-selected={isHype}
        onClick={() => onModeChange('hype')}
        className={`relative z-[1] flex flex-1 items-center justify-center gap-[5px] rounded-full px-3 py-[7px] text-[11.5px] tracking-[-0.1px] transition-colors duration-300 ${
          isHype ? 'font-extrabold text-pitch-mint-100' : 'font-bold text-white/50'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block text-[12px] will-change-transform ${
            isHype ? 'origin-bottom animate-hype-bloom' : 'scale-[0.55] opacity-55'
          }`}
        >
          🔥
        </span>
        Hype
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={!isHype}
        onClick={() => onModeChange('calm')}
        className={`relative z-[1] flex flex-1 items-center justify-center gap-[5px] rounded-full px-3 py-[7px] text-[11.5px] tracking-[-0.1px] transition-colors duration-300 ${
          !isHype ? 'font-extrabold text-pitch-mint-100' : 'font-bold text-white/50'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block text-[12px] will-change-transform ${
            !isHype ? 'animate-calm-breath' : 'scale-[0.92] opacity-75'
          }`}
        >
          😌
        </span>
        Calm
      </button>
    </div>
  )
}
