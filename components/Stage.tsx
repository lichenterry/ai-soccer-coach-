import { type ReactNode } from 'react'

interface StageProps {
  children: ReactNode
  /** Use the stronger gradient flavour for the home hero. */
  variant?: 'default' | 'hero'
  className?: string
}

/**
 * The shared dark-gradient surface that holds every Pitch screen.
 * Same gradient on home + chat creates a continuous environment as the user
 * navigates between them.
 */
export default function Stage({
  children,
  variant = 'default',
  className = '',
}: StageProps) {
  const bg =
    variant === 'hero' ? 'bg-pitch-stage-hero' : 'bg-pitch-stage'
  return (
    <div className={`relative min-h-[100dvh] w-full overflow-hidden ${bg} ${className}`}>
      {children}
    </div>
  )
}
