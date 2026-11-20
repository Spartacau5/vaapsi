'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatInr } from '@/lib/format/currency'
import type { ProductSummary } from '@/lib/types'
import brand from './brand.module.css'

/**
 * The shop, in the new identity: the store's featured pieces as one
 * horizontal rail, presented plainly as Vaapsi denim — no listing-type badges,
 * condition grades or was-prices. The data underneath is unchanged.
 *
 * Same mechanics as the home page's NewInRail — native scroll with snap points,
 * so touch, trackpad and keyboard all work without any of it being
 * reimplemented. On desktop, arrow buttons call `scrollBy` and disable at the
 * ends. On mobile the arrows are hidden: you swipe, and a thin progress bar
 * under the rail stands in for the scrollbar, so it's still clear there is
 * more off-screen.
 */

const COPY = {
  eyebrow: 'New in',
  title: 'Shop the edit',
  note: 'Denim cut to be worn for years, not seasons.',
  all: 'Shop all',
  railLabel: 'Featured pieces',
  previous: 'Scroll back through featured pieces',
  next: 'Scroll forward through featured pieces',
} as const

/** How far one press moves the rail, as a share of what is on screen. */
const STEP = 0.85

export function ShopRail({ products }: { products: readonly ProductSummary[] }) {
  const rail = useRef<HTMLUListElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= max - 1)
    // The progress thumb is written directly; it moves on every scroll event
    // and does not need a React render.
    if (thumb.current) {
      const share = el.clientWidth / el.scrollWidth
      const at = max > 0 ? el.scrollLeft / max : 0
      thumb.current.style.width = `${share * 100}%`
      thumb.current.style.transform = `translateX(${(at * (1 - share) * 100) / share}%)`
    }
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync, products])

  const step = (direction: -1 | 1) => {
    const el = rail.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * STEP, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section aria-labelledby="shop-rail-title" className="py-16 desktop:py-24">
      <div className="mx-auto max-w-[1360px] px-5 tablet:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className={brand.label} style={{ color: 'var(--vaapsi-olive)' }}>
              {COPY.eyebrow}
            </p>
            <h2
              id="shop-rail-title"
              className={`${brand.title} mt-2 text-[clamp(1.75rem,6vw,2.75rem)]`}
            >
              {COPY.title}
            </h2>
            <p className={`${brand.jost} mt-3 max-w-[34ch] text-sm opacity-75`}>{COPY.note}</p>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <Link
              href="/shop"
              className={`${brand.label} hidden underline-offset-[6px] hover:underline tablet:inline`}
            >
              {COPY.all}
            </Link>
            <div className="hidden items-center gap-2 desktop:flex">
              <RailButton label={COPY.previous} disabled={atStart} onClick={() => step(-1)}>
                <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
              </RailButton>
              <RailButton label={COPY.next} disabled={atEnd} onClick={() => step(1)}>
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
              </RailButton>
            </div>
          </div>
        </div>

        <ul
          ref={rail}
          onScroll={sync}
          aria-label={COPY.railLabel}
          className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-1 scrollbar-none tablet:-mx-8 tablet:scroll-px-8 tablet:px-8 desktop:mt-10 desktop:gap-6"
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="w-[68vw] shrink-0 snap-start tablet:w-[36vw] desktop:w-[calc((100%-4.5rem)/4)]"
            >
              <Card product={product} />
            </li>
          ))}
        </ul>

        {/* Progress, standing in for the hidden scrollbar. */}
        <div aria-hidden className="mt-6 h-[2px] w-full overflow-hidden bg-[rgb(31_59_46_/_0.12)]">
          <div ref={thumb} className="h-full bg-[var(--vaapsi-forest)] will-change-transform" />
        </div>

        <Link
          href="/shop"
          className={`${brand.label} mt-8 inline-block underline underline-offset-[6px] tablet:hidden`}
        >
          {COPY.all}
        </Link>
      </div>
    </section>
  )
}

function Card({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block focus-visible:outline-offset-4">
      <div className={`${brand.well} relative aspect-[4/5] overflow-hidden`}>
        <Image
          src={product.primaryImage.url}
          alt={product.primaryImage.alt}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 36vw, 68vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className={`${brand.jost} mt-4`}>
        <h3 className="text-[0.95rem] font-medium leading-snug">{product.title}</h3>
        <p className="mt-1 text-sm opacity-80">{formatInr(product.priceInr)}</p>
      </div>
    </Link>
  )
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-[rgb(31_59_46_/_0.3)] transition-colors duration-200 hover:bg-[var(--vaapsi-forest)] hover:text-[var(--vaapsi-natural)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}
