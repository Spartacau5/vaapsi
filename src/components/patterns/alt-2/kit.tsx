import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * The brand guide's web UI kit (page 11.2), as components. Each one maps to a
 * named element on that page; the classes reproduce it: radii, borders, fills
 * and the two-tone terracotta. Colours come from the CSS variables on the
 * Alt 2 root (alt2.module.css).
 */

type Variant = 'primary' | 'secondary' | 'outline'

const fill: Record<Variant, string> = {
  primary: 'bg-[var(--rust)] text-[var(--paper)] hover:bg-[var(--rust-deep)]',
  secondary: 'bg-[var(--clay)] text-[var(--paper)] hover:bg-[var(--clay-deep)]',
  outline:
    'border-[1.5px] border-[var(--rust)] text-[var(--rust)] hover:bg-[var(--rust)] hover:text-[var(--paper)]',
}

const focus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rust)]'

/** Kit: "Buttons" — Add to Bag / Buy Now / Learn More. Rounded rectangle. */
export function KitButton({
  href,
  variant = 'primary',
  icon,
  children,
  className = '',
}: {
  href: string
  variant?: Variant
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-[52px] items-center justify-center gap-2.5 rounded-2xl px-7 text-[1.0625rem] font-medium transition-colors duration-200 ${fill[variant]} ${focus} ${className}`}
    >
      {children}
      {icon}
    </Link>
  )
}

/** Kit: "Text Link" — Shop Now → / Read More →. Underlined, with a trailing arrow. */
export function KitTextLink({
  href,
  tone = 'primary',
  children,
}: {
  href: string
  tone?: 'primary' | 'secondary'
  children: React.ReactNode
}) {
  const color = tone === 'primary' ? 'text-[var(--rust)]' : 'text-[var(--clay)]'
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 text-[1.0625rem] font-medium ${color} ${focus}`}
    >
      <span className="underline decoration-[1.5px] underline-offset-[6px]">{children}</span>
      <ArrowRight
        className="size-5 transition-transform duration-200 group-hover:translate-x-1"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  )
}

/** Kit: "Icon Buttons". Circles: filled, secondary-filled, or outline. */
export function kitIconButtonClass(variant: Variant = 'outline', size = 'size-11') {
  return `inline-flex ${size} shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${fill[variant]} ${focus}`
}

/** Kit: "Tag / Chip". Pills: filled, secondary-filled, or outline. */
export function KitChip({
  href,
  variant = 'outline',
  active = false,
  icon,
  children,
}: {
  href: string
  variant?: Variant
  active?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-200 ${fill[variant]} ${focus}`}
    >
      {children}
      {icon}
    </Link>
  )
}

/** Kit: "Input Field" — rounded, outlined in the light terracotta. */
export const kitInputClass =
  'h-[52px] w-full rounded-2xl border-[1.5px] border-[var(--rule)] bg-transparent text-[1rem] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition-colors focus:border-[var(--rust)]'
