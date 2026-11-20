'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Heart, Search } from 'lucide-react'
import { formatInr } from '@/lib/format/currency'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { ProductSummary } from '@/lib/types'
import { KitChip, KitTextLink, kitIconButtonClass, kitInputClass } from './kit'

/**
 * Featured products, assembled from kit elements:
 *  - Input Field  → search, submitting to the shop's own `?q=` search
 *  - Tag / Chip   → quick links into the shop
 *  - Icon Button  → save to the site's existing (device-local) wishlist
 *  - Pagination   → numbered pages of the rail, plus prev/next arrows
 *
 * The rail is native horizontal scroll with snap points, so it swipes on
 * touch; the pagination reads and drives the same scroll position, so it
 * works on desktop and stays in sync on mobile.
 */
export function Alt2Products({ products }: { products: readonly ProductSummary[] }) {
  const rail = useRef<HTMLUListElement>(null)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(0)

  const sync = useCallback(() => {
    const el = rail.current
    if (!el) return
    const count = Math.max(1, Math.ceil((el.scrollWidth - 1) / el.clientWidth))
    setPages(count)
    const max = el.scrollWidth - el.clientWidth
    setPage(max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (count - 1)))
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync, products])

  const goTo = (p: number) => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const clamped = Math.min(pages - 1, Math.max(0, p))
    el.scrollTo({ left: pages > 1 ? (max * clamped) / (pages - 1) : 0, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section
      aria-labelledby="alt2-products"
      className="mx-auto max-w-[1280px] px-4 py-14 tablet:px-8 desktop:py-20"
    >
      <div className="flex flex-col gap-6 desktop:flex-row desktop:items-end desktop:justify-between">
        <div>
          <h2
            id="alt2-products"
            className="text-[clamp(1.75rem,5vw,2.5rem)] font-medium leading-tight tracking-[-0.01em]"
          >
            New in denim
          </h2>
          <p className="mt-2 text-[var(--muted)]">Pieces picked from this week’s collection.</p>
        </div>

        <form action="/shop" role="search" className="relative w-full desktop:w-[360px]">
          <label htmlFor="alt2-search" className="sr-only">
            Search for products
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--rust)]"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            id="alt2-search"
            name="q"
            type="search"
            placeholder="Search for products"
            className={`${kitInputClass} pl-12 pr-4`}
          />
        </form>
      </div>

      <nav
        aria-label="Shop by"
        className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none tablet:mx-0 tablet:px-0"
      >
        <KitChip href="/shop?sort=newest" variant="primary">
          New In
        </KitChip>
        <KitChip href="/shop/women" variant="secondary">
          Women
        </KitChip>
        <KitChip href="/shop/men" variant="outline">
          Men
        </KitChip>
        <KitChip href="/shop" variant="outline">
          Everything
        </KitChip>
      </nav>

      <ul
        ref={rail}
        onScroll={sync}
        aria-label="Featured products"
        className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 scrollbar-none tablet:mx-0 tablet:scroll-px-0 tablet:px-0 desktop:gap-6"
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[72vw] shrink-0 snap-start tablet:w-[calc((100%-1rem)/2.4)] desktop:w-[calc((100%-4.5rem)/4)]"
          >
            <Card product={product} />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between gap-4">
        <KitTextLink href="/shop">Shop Now</KitTextLink>

        {pages > 1 ? (
          <nav aria-label="Product pages" className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
              className={`${kitIconButtonClass('outline')} disabled:pointer-events-none disabled:opacity-35`}
            >
              <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                aria-current={i === page ? 'true' : undefined}
                className={`${kitIconButtonClass(i === page ? 'primary' : 'outline')} hidden text-[0.95rem] font-medium tablet:inline-flex`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === pages - 1}
              aria-label="Next page"
              className={`${kitIconButtonClass('outline')} disabled:pointer-events-none disabled:opacity-35`}
            >
              <ArrowRight className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  )
}

function Card({ product }: { product: ProductSummary }) {
  const toggle = useWishlistStore((s) => s.toggle)
  const saved = useWishlistStore((s) => s.items.includes(product.id))
  // The wishlist lives in localStorage; render it unsaved on the server and
  // first client pass so hydration matches, then show the real state.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const on = mounted && saved

  return (
    <div className="relative">
      <Link
        href={`/product/${product.slug}`}
        className="group block rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--rust)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[var(--sand)]">
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 768px) 40vw, 72vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <h3 className="mt-4 text-[1.0625rem] font-medium leading-snug">{product.title}</h3>
        <p className="mt-1 text-[var(--rust)]">{formatInr(product.priceInr)}</p>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-pressed={on}
        aria-label={
          on ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
        }
        className={`${kitIconButtonClass(on ? 'primary' : 'outline', 'size-11')} absolute right-3 top-3 bg-[rgb(253_249_245_/_0.9)] ${on ? '!bg-[var(--rust)]' : ''}`}
      >
        <Heart
          className="size-5"
          strokeWidth={1.75}
          fill={on ? 'currentColor' : 'none'}
          aria-hidden
        />
      </button>
    </div>
  )
}
