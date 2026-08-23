import { cn } from '@/lib/utils'

/**
 * The wordmark.
 *
 * Drawn as inline SVG rather than set in a webfont, for two reasons: it must not
 * shift or reflow while a font loads, and it must not change shape when the
 * client switches font preset in the Phase 8 panel. A logo that re-renders in
 * Bodoni is not a logo.
 *
 * The letterforms use `currentColor` so the mark inverts with the theme for
 * free. The dot over the "i" is pinned to `var(--accent)` and is the only part
 * that does not invert — it is the same red on white and on near-black, because
 * it is the one fixed point in the whole colour system.
 *
 * Paths are geometric-sans letterforms hand-placed on a 24px baseline grid, in
 * the register of the Modernist preset. **Replace with the real vector when
 * brand assets arrive from Kanu** — this is a faithful stand-in, not the asset.
 */

export type LogoProps = {
  /** `word` — the full wordmark. `mark` — the dotted i alone, for tight spaces. */
  variant?: 'word' | 'mark'
  className?: string
  /** Render as decoration when the surrounding link already has a label. */
  decorative?: boolean
}

export function Logo({ variant = 'word', className, decorative = false }: LogoProps) {
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': 'Vaapsi' } as const)

  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 12 24" className={cn('h-6 w-auto', className)} fill="none" {...a11y}>
        {/* The stem of the i. */}
        <rect x="4.4" y="9" width="3.2" height="11" fill="currentColor" />
        {/* The dot. The entire colour story. */}
        <circle cx="6" cy="5.4" r="2.6" fill="var(--dot-fill, hsl(var(--accent)))" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 108 24" className={cn('h-5 w-auto', className)} fill="none" {...a11y}>
      <g fill="currentColor">
        {/* v */}
        <path d="M0 9h3.5l3.4 8.1L10.3 9h3.5L8.6 20H5.2z" />
        {/* a */}
        <path d="M20.4 8.7c3.3 0 5.3 1.7 5.3 4.7V20h-3.2v-1.4c-.8 1.1-2.1 1.6-3.7 1.6-2.4 0-4-1.3-4-3.4 0-2.2 1.7-3.4 4.7-3.4h2.9v-.5c0-1.3-.8-2-2.3-2-1.2 0-2.2.5-2.9 1.3l-1.9-1.9c1.2-1.1 2.9-1.6 5.1-1.6zm-.9 8.9c1.5 0 2.5-.8 2.9-1.9v-.9h-2.6c-1.4 0-2.1.5-2.1 1.4 0 .9.7 1.4 1.8 1.4z" />
        {/* a */}
        <path d="M35.2 8.7c3.3 0 5.3 1.7 5.3 4.7V20h-3.2v-1.4c-.8 1.1-2.1 1.6-3.7 1.6-2.4 0-4-1.3-4-3.4 0-2.2 1.7-3.4 4.7-3.4h2.9v-.5c0-1.3-.8-2-2.3-2-1.2 0-2.2.5-2.9 1.3l-1.9-1.9c1.2-1.1 2.9-1.6 5.1-1.6zm-.9 8.9c1.5 0 2.5-.8 2.9-1.9v-.9h-2.6c-1.4 0-2.1.5-2.1 1.4 0 .9.7 1.4 1.8 1.4z" />
        {/* p — descender breaks the baseline, which is the wordmark's one gesture */}
        <path d="M45 9h3.3v1.5c.9-1.2 2.2-1.8 3.9-1.8 3.2 0 5.4 2.4 5.4 5.8s-2.2 5.8-5.4 5.8c-1.6 0-2.9-.6-3.8-1.7V24H45zm3.3 5.5c0 1.9 1.2 3.1 2.9 3.1s2.9-1.2 2.9-3.1-1.2-3.1-2.9-3.1-2.9 1.2-2.9 3.1z" />
        {/* s */}
        <path d="M66.4 8.7c2.1 0 3.8.7 4.9 1.9l-1.9 2c-.8-.8-1.8-1.3-3-1.3-1 0-1.7.4-1.7 1 0 .6.5.9 1.9 1.2l1.3.3c2.6.6 3.8 1.6 3.8 3.4 0 2.2-2 3.6-5.1 3.6-2.4 0-4.3-.8-5.5-2.2l2-1.9c.9 1 2.1 1.5 3.5 1.5 1.2 0 1.9-.4 1.9-1.1 0-.6-.5-.9-2-1.2l-1.2-.3c-2.5-.6-3.7-1.6-3.7-3.4 0-2.1 1.9-3.5 4.8-3.5z" />
        {/* i — stem */}
        <rect x="78.6" y="9" width="3.3" height="11" />
      </g>
      {/* The dot over the i. Pinned to the accent — the one fixed point. */}
      <circle cx="80.25" cy="5.4" r="2.6" fill="var(--dot-fill, hsl(var(--accent)))" />
    </svg>
  )
}

/**
 * The accent dot on its own, at text scale.
 *
 * Reused as the active-nav marker, the passport indicator on a product card,
 * and the loading indicator. Same shape, same colour, three jobs — which is the
 * brand logic showing up in the interface rather than being described in a deck.
 */
export function Dot({
  size = 'default',
  className,
}: {
  size?: 'small' | 'default'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 rounded-full bg-accent',
        size === 'small' ? 'size-1' : 'size-1.5',
        className,
      )}
    />
  )
}
