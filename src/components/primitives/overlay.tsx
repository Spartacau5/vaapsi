'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * One overlay panel, used by the nav drawer, the filter sheet and the cart
 * drawer.
 *
 * Written in Phase 6 because that was the third time the same forty lines of
 * focus trapping got copied, and three is where a pattern stops being a
 * coincidence. The behaviour was already identical in all three; now it is
 * identical *by construction*, which means a fix to the trap fixes every panel.
 *
 * What it guarantees:
 *
 * - Escape closes.
 * - Tab cycles inside the panel and cannot leave it.
 * - Focus moves in on open and returns to the trigger on close.
 * - The page behind it does not scroll.
 * - While closed it is `invisible`, which removes it from the tab order **in
 *   CSS** — so it holds before hydration too. `inert` would be the modern
 *   answer, but React 18 silently drops boolean values for attributes it does
 *   not know, so it can only be set after mount.
 * - It stays mounted, so it can transition out instead of vanishing.
 */

export type OverlayProps = {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog. */
  label: string
  /** `right` — side drawer. `bottom` — mobile sheet. */
  side?: 'right' | 'bottom'
  /** Breakpoint above which the panel is hidden entirely. */
  hideAbove?: 'desktop' | 'never'
  children: React.ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Overlay({
  open,
  onClose,
  label,
  side = 'right',
  hideAbove = 'never',
  children,
  className,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Lock the page behind the panel.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Move focus in on open; put it back where it was on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    } else {
      previouslyFocused.current?.focus()
    }
  }, [open])

  // Escape closes; Tab cycles.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (panel === null) return

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
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
  }, [open, onClose])

  return (
    <div
      className={cn(
        'ease fixed inset-0 z-50 transition-[visibility] duration-base',
        hideAbove === 'desktop' && 'desktop:hidden',
        open ? 'visible' : 'pointer-events-none invisible',
      )}
      aria-hidden={!open}
    >
      {/*
        Scrim. A div, not a button: tapping it is a mouse and touch convenience,
        and the keyboard route out is Escape. A labelled button here would give a
        screen reader a second identical "close" control.
      */}
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          'ease absolute inset-0 bg-ink/20 transition-opacity duration-base',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label={label}
        className={cn(
          'ease absolute flex flex-col bg-background transition-transform duration-base',
          side === 'right' && 'inset-y-0 right-0 w-full max-w-sm',
          side === 'bottom' && 'inset-x-0 bottom-0 max-h-[85vh] shadow-sheet',
          side === 'right' && (open ? 'translate-x-0' : 'translate-x-full'),
          side === 'bottom' && (open ? 'translate-y-0' : 'translate-y-full'),
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
