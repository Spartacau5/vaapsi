import { cn } from '@/lib/utils'

/**
 * The wordmark.
 *
 * Set as live text in Playfair Display, with the accent dot placed as the
 * tittle of the final letter.
 *
 * ## How the dot works
 *
 * The final letter is a **dotless i** (U+0131), not a normal one, and our dot
 * sits above it. That is the typographically correct way to do this: the
 * alternative is drawing a red circle on top of the tittle the font already
 * draws, which means matching its exact position and hoping the two never
 * disagree. With a dotless letter there is nothing underneath to cover.
 *
 * Verified against the built CSS: Playfair's `latin` font-face declares
 * `unicode-range: u+00??, u+0131, …`, so the glyph is present. `theme/fonts.ts`
 * also requests `latin-ext` as insurance. If a future typeface lacks U+0131 this
 * renders a missing-glyph box, so check that before swapping the face.
 *
 * Size and rise of the dot are tokens (`--wordmark-dot-size`,
 * `--wordmark-dot-rise`) in `em`, so it scales with the wordmark at any size and
 * can be retuned for a different typeface without touching this file.
 *
 * ## Why it is locked to one face
 *
 * The wordmark reads `--font-wordmark`, never `--font-display`. A logo that
 * changes typeface when someone tries a font preset in the studio panel is not a
 * logo — and it also means the hand-tuned dot position stays valid, because the
 * letterforms underneath never change.
 *
 * ## The trade against the previous version
 *
 * This was inline SVG until now, which could not shift while a font loaded.
 * Live text can, briefly. That is the cost of setting the mark in a real
 * typeface rather than in traced outlines; `display: swap` and the fallback
 * serif keep it to a reflow rather than a blank. **Replace with the real vector
 * when brand assets arrive** — at which point the flash goes away too.
 */

export type LogoProps = {
  /** `word` — the full wordmark. `mark` — the dotted i alone, for tight spaces. */
  variant?: 'word' | 'mark'
  className?: string
  /** Render as decoration when the surrounding link already has a label. */
  decorative?: boolean
}

/** Dotless i, U+0131. The dot above it is ours. */
const DOTLESS_I = 'ı'

export function Logo({ variant = 'word', className, decorative = false }: LogoProps) {
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': 'Vaapsi' } as const)

  return (
    <span
      {...a11y}
      className={cn(
        'inline-block select-none font-wordmark leading-none text-ink',
        variant === 'word' ? 'text-xl' : 'text-lg',
        className,
      )}
    >
      {/*
        The letters before the i carry no colour of their own — they inherit,
        so the mark inverts with the theme for free.
      */}
      {variant === 'word' && <span aria-hidden>Vaaps</span>}
      <DottedI />
    </span>
  )
}

/**
 * The dotless letter plus the accent dot. The one fixed point in the whole
 * colour system: this red does not change with the theme, because it is the
 * verification mark everywhere else on the site.
 */
function DottedI() {
  return (
    <span aria-hidden className="relative inline-block">
      {DOTLESS_I}
      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-accent"
        style={{
          width: 'var(--wordmark-dot-size)',
          height: 'var(--wordmark-dot-size)',
          bottom: 'var(--wordmark-dot-rise)',
        }}
      />
    </span>
  )
}

/**
 * The accent dot on its own, at text scale.
 *
 * Reused as the active-nav marker, the passport indicator on a product card, the
 * cart badge and the loading indicator. Same shape, same colour, five jobs —
 * which is the brand logic showing up in the interface rather than being
 * described in a deck.
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
