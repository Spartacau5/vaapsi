'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Logo } from './logo'
import { NavLink } from './nav-link'
import { Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { footerNav, navLabels, primaryNav } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { cn } from '@/lib/utils'

/**
 * Full-height mobile navigation drawer.
 *
 * Focus-trapped, closes on Escape and on route change, and locks the page
 * behind it. The trap is hand-rolled rather than pulled from a dependency
 * because it is thirty lines and this is the only drawer in the app until
 * Phase 4's filter sheet, which will reuse it.
 *
 * Kept mounted and hidden rather than conditionally rendered, so the panel can
 * transition out rather than vanishing. `visibility` keeps it out of the tab
 * order and `aria-hidden` keeps it out of the accessibility tree while closed —
 * both in CSS, so they hold before hydration too.
 */
export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen)
  const close = useUiStore((state) => state.closeMobileNav)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Close on navigation. Without this, tapping a link leaves the drawer sitting
  // over the page it just navigated to.
  useEffect(() => {
    close()
  }, [pathname, close])

  // Lock the page behind the drawer.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Move focus in on open, and put it back where it was on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null
      closeButtonRef.current?.focus()
    } else {
      previouslyFocused.current?.focus()
    }
  }, [open])

  // Escape closes; Tab cycles within the panel.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (panel === null) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (first === undefined || last === undefined) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  /*
   * `visibility` is what keeps the closed drawer out of the tab order, and it
   * is deliberately CSS rather than JavaScript.
   *
   * `inert` would be the modern answer, but React 18 drops boolean values for
   * attributes it does not know, so it can only be set imperatively after
   * mount — which leaves the drawer's links focusable in the server-rendered
   * HTML, before hydration. Brief, but real.
   *
   * `visibility: hidden` removes an element from the tab order with no JS at
   * all, and it still animates correctly: when either end of a transition is
   * `visible`, the element stays visible for the whole duration and only
   * hides at the end. So the panel gets its full slide-out and is unfocusable
   * the moment it lands.
   */
  return (
    <div
      className={cn(
        'ease fixed inset-0 z-50 transition-[visibility] duration-base desktop:hidden',
        open ? 'visible' : 'pointer-events-none invisible',
      )}
      aria-hidden={!open}
    >
      {/*
        Scrim. No blur — this direction does not use frosted glass.

        A div rather than a button, deliberately. Tapping the scrim is a mouse
        and touch convenience; the keyboard route out is Escape. Making it a
        labelled button gives a screen reader two identical "Close menu"
        controls, which is worse than giving it none.
      */}
      <div
        role="presentation"
        onClick={close}
        className={cn(
          'ease absolute inset-0 bg-ink/20 transition-opacity duration-base',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label={navLabels.mainNav}
        className={cn(
          'ease absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background transition-transform duration-base',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-gutter py-4">
          <Link href="/" aria-label={navLabels.home} className="text-ink">
            <Logo decorative />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            className="-mr-2 p-2 text-ink-muted transition-colors hover:text-ink"
          >
            <span className="sr-only">{navLabels.closeMenu}</span>
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <nav aria-label={navLabels.mainNav} className="flex-1 overflow-y-auto px-gutter py-8">
          <Stack gap={5} as="ul">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} size="large" onNavigate={close} />
              </li>
            ))}
          </Stack>

          <div className="mt-12 border-t border-line pt-8">
            <Stack gap={8}>
              {footerNav
                .filter((group) => group.heading !== 'Legal')
                .map((group) => (
                  <div key={group.heading}>
                    <Eyebrow>{group.heading}</Eyebrow>
                    <Stack gap={2} as="ul" className="mt-3">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="text-sm text-ink-muted transition-colors hover:text-ink"
                          >
                            <Type as="span" size="sm" tone="inherit">
                              {item.label}
                            </Type>
                          </Link>
                        </li>
                      ))}
                    </Stack>
                  </div>
                ))}
            </Stack>
          </div>
        </nav>
      </div>
    </div>
  )
}
