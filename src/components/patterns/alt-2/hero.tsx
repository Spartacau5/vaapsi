import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { KitButton } from './kit'

/**
 * Hero: the campaign photograph as-is (no ring, no motion), with the campaign
 * line and the kit's primary + outline buttons. Stacks on mobile; image on the
 * right from desktop.
 */
export function Alt2Hero() {
  return (
    <section className="mx-auto grid max-w-[1280px] gap-8 px-4 pb-14 pt-4 tablet:px-8 desktop:grid-cols-2 desktop:items-center desktop:gap-16 desktop:pb-24 desktop:pt-10">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] desktop:order-2">
        <Image
          src="/tester/model-front.jpg"
          alt="Model in a white crop top and wide-leg indigo jeans, a denim jacket slipping off one shoulder, on an olive studio backdrop"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="desktop:order-1">
        <h1 className="text-[clamp(2.25rem,8vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          Turn to style that thinks like you
        </h1>
        <p className="mt-5 max-w-[42ch] text-[1.0625rem] leading-relaxed text-[var(--muted)]">
          Choose what’s good. Think first, buy later. Denim made to be worn, refreshed and worn
          again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <KitButton
            href="/shop"
            variant="primary"
            icon={<ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden />}
          >
            Shop Now
          </KitButton>
          <KitButton href="/about" variant="outline">
            Learn More
          </KitButton>
        </div>
      </div>
    </section>
  )
}
