'use client'

import { ChatMode } from '@/lib/prompts'

interface MascotProps {
  mode: ChatMode
  size?: number
}

export default function Mascot({ mode, size = 48 }: MascotProps) {
  const isHype = mode === 'hype'

  // Colors based on mode
  const bodyColor = '#ffffff' // white for both modes
  const cheekColor = isHype ? '#5eead4' : '#c4b5fd' // teal or purple accent

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={isHype ? '' : 'animate-breathe'}
    >
      {/* Body - blob shape */}
      <ellipse
        cx="50"
        cy="55"
        rx="38"
        ry="35"
        fill={bodyColor}
        stroke={isHype ? '#0d9488' : '#7c3aed'}
        strokeWidth="2"
        className="transition-colors duration-500"
      />

      {/* Cheeks */}
      <ellipse cx="25" cy="60" rx="8" ry="5" fill={cheekColor} opacity="0.6" />
      <ellipse cx="75" cy="60" rx="8" ry="5" fill={cheekColor} opacity="0.6" />

      {/* Eyes */}
      <g className={isHype ? '' : ''}>
        {/* Left eye */}
        <ellipse cx="35" cy="48" rx="8" ry={isHype ? 10 : 8} fill="white" />
        <ellipse
          cx={isHype ? "37" : "35"}
          cy={isHype ? "50" : "48"}
          rx="4"
          ry="5"
          fill="#1f2937"
        />
        <circle cx={isHype ? "38" : "36"} cy={isHype ? "48" : "46"} r="2" fill="white" />

        {/* Right eye */}
        <ellipse cx="65" cy="48" rx="8" ry={isHype ? 10 : 8} fill="white" />
        <ellipse
          cx={isHype ? "67" : "65"}
          cy={isHype ? "50" : "48"}
          rx="4"
          ry="5"
          fill="#1f2937"
        />
        <circle cx={isHype ? "68" : "66"} cy={isHype ? "48" : "46"} r="2" fill="white" />
      </g>

      {/* Eyebrows - only in hype mode */}
      {isHype && (
        <>
          <line x1="28" y1="35" x2="42" y2="38" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <line x1="72" y1="35" x2="58" y2="38" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      {isHype ? (
        // Big excited smile
        <path
          d="M 32 68 Q 50 85 68 68"
          fill="none"
          stroke="#1f2937"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        // Gentle calm smile
        <path
          d="M 38 65 Q 50 75 62 65"
          fill="none"
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Small soccer ball accessory */}
      <g transform="translate(72, 25) scale(0.4)">
        <circle cx="20" cy="20" r="18" fill="white" stroke="#1f2937" strokeWidth="2" />
        <path
          d="M20 2 L20 12 M20 28 L20 38 M5 12 L12 18 M35 12 L28 18 M5 28 L12 22 M35 28 L28 22"
          stroke="#1f2937"
          strokeWidth="2"
          fill="none"
        />
      </g>
    </svg>
  )
}
