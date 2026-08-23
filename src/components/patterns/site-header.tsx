'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { NavLink } from './nav-link'
import { navLabels, primaryNav } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { cn } from '@/lib/utils'

/**
 * Slim, sticky header.
 *
 * Near-transparent at the top of the page, solid with a hairline once scrolled.
 * That is **one property transition, not a rebuild** — the markup is identical
 * in both states and only `background-color` and `border-color` move. Swapping
 * between two headers on scroll is what produces the flicker you see on a lot of
 * marketplace sites, and it also breaks focus.
 *
 * The threshold is deliberately small. A header that stays transparent for
 * 400px of scroll leaves text sitting on top of product photography.
 */

const SCROLL_THRESHOLD = 8

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const cartCount = useUiStore((state) => state.cartCount)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        data-scrolled={scrolled}
        className={cn(
          'ease sticky top-0 z-40 border-b transition-colors duration-base',
          scrolled ? 'border-line bg-background' : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-14 max-w-container items-center gap-6 px-gutter desktop:h-16">
          <Link
            href="/"
            aria-label={navLabels.home}
            className="shrink-0 text-ink focus-visible:outline-offset-4"
          >
            <Logo decorative />
          </Link>

          <nav
            aria-label={navLabels.mainNav}
            className="hidden flex-1 items-center gap-6 desktop:flex"
          >
            {primaryNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <HeaderAction href="/search" label={navLabels.search}>
              <Search className="size-5" strokeWidth={1.5} aria-hidden />
            </HeaderAction>

            <HeaderAction href="/wishlist" label={navLabels.wishlist}>
              <Heart className="size-5" strokeWidth={1.5} aria-hidden />
            </HeaderAction>

            <HeaderAction
              href="/cart"
              label={cartCount === 0 ? navLabels.cartEmpty : navLabels.cartCount(cartCount)}
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />
              {/* The count is the accent dot, grown up to hold a number. Same
                  mark, same meaning: something here needs your attention. */}
              {cartCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] tabular-nums leading-none text-accent-ink"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </HeaderAction>

            <button
              type="button"
              onClick={openMobileNav}
              className="p-2 text-ink-muted transition-colors hover:text-ink desktop:hidden"
            >
              <span className="sr-only">{navLabels.openMenu}</span>
              <Menu className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileNav />
    </>
  )
}

function HeaderAction({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="relative p-2 text-ink-muted transition-colors hover:text-ink"
      aria-label={label}
    >
      {children}
    </Link>
  )
}
