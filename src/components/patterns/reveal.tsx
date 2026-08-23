'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

/**
 * The site's two motion primitives.
 *
 * `Reveal` fades a block up on scroll, at low amplitude. `Stagger` orchestrates
 * a group of children into a short sequence on load.
 *
 * Both read `useReducedMotion` — the single hook — and when motion is off they
 * render their children in the final state with no wrapper animation at all.
 * Not a shortened animation, not opacity 0.99: the settled state, immediately.
 * A reduced-motion user should never see a gap where something was going to
 * arrive.
 *
 * Amplitudes are deliberately small. 12px, not 60px. This is a near-monochrome
 * editorial register — things settle into place, they do not fly in.
 */

/** The house curve, as Framer's array form of the tokenised cubic-bezier. */
const EASE = [0.22, 0.61, 0.36, 1] as const

const DURATION = {
  fast: 0.16,
  base: 0.26,
  slow: 0.42,
} as const

export function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  delay?: number
  /** Travel distance in px. Keep it small. */
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // `once` matters: an element that re-animates every time it scrolls back
      // into view reads as a page that cannot settle.
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: DURATION.slow, ease: EASE, delay }}
    >
      {children}
    </Component>
  )
}

/**
 * Page-load sequence container. Children marked with `StaggerItem` arrive in
 * order. Used once, in the hero — a site where everything staggers is a site
 * where nothing is emphasised.
 */
export function Stagger({
  children,
  className,
  delay = 0.05,
  step = 0.07,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  step?: number
  as?: 'div' | 'section'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component
      className={className}
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({
  children,
  className,
  y = 12,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  y?: number
  as?: 'div' | 'li' | 'span'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        shown: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE } },
      }}
    >
      {children}
    </Component>
  )
}

export { DURATION as MOTION_DURATION, EASE as MOTION_EASE }
