'use client'

import Link from 'next/link'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { navLabels } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { VaapsiWordmark } from '../tester/vaapsi-wordmark'
import { kitIconButtonClass } from './kit'

/**
 * Header: the wordmark in Forest Green (the guide's logo colour on light
 * grounds), flanked by the kit's outline icon buttons. Menu and bag open the
 * site's existing drawers; search goes to the shop's search.
 */
export function Alt2Header() {
  const openMobileNav = useUiStore((s) => s.openMobileNav)
  const openCart = useUiStore((s) => s.openCart)

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(213_165_140_/_0.35)] bg-[rgb(253_249_245_/_0.94)] backdrop-blur">
      <div className="mx-auto grid h-[68px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-4 tablet:h-20 tablet:px-8">
        <div>
          <button
            type="button"
            onClick={openMobileNav}
            aria-label={navLabels.openMenu}
            className={kitIconButtonClass('outline', 'size-10')}
          >
            <Menu className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <Link href="/alt-2" aria-label={navLabels.home} className="text-[var(--forest)]">
          <VaapsiWordmark className="block h-auto w-[118px] tablet:w-[150px]" />
        </Link>

        <div className="flex justify-end gap-2">
          <Link
            href="/shop"
            aria-label={navLabels.search}
            className={kitIconButtonClass('outline', 'size-10')}
          >
            <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={navLabels.cart}
            className={kitIconButtonClass('primary', 'size-10')}
          >
            <ShoppingBag className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  )
}
