import { Leaf } from 'lucide-react'
import { home } from '@/content/home'
import { KitButton, KitTextLink } from './kit'

/**
 * Mission: the site's editorial statement on the guide's Natural, with the
 * tagline's three verbs as numbered pillars — numbered in the kit's
 * pagination circles — and the kit's "Sustainable" leaf.
 */
const PILLARS = [
  {
    verb: 'Rethink',
    body: 'Buy less, choose better. Denim cut and sewn to be worn for years, not a season.',
  },
  {
    verb: 'Refashion',
    body: 'Repair, rework and refresh what you already own, so it keeps its place in your wardrobe.',
  },
  {
    verb: 'Repeat',
    body: 'When you are done with it, send it back. It goes round again to whoever wears it next.',
  },
] as const

export function Alt2Mission() {
  return (
    <section aria-labelledby="alt2-mission" className="mx-auto max-w-[1280px] px-4 tablet:px-8">
      <div className="rounded-[32px] bg-[var(--natural)] px-6 py-12 tablet:px-12 desktop:px-16 desktop:py-16">
        <span className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-[var(--rust)] px-5 text-[0.95rem] font-medium text-[var(--rust)]">
          Sustainable
          <Leaf className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <h2
          id="alt2-mission"
          className="mt-6 max-w-[22ch] text-[clamp(1.75rem,5vw,3rem)] font-medium leading-[1.1] tracking-[-0.015em]"
        >
          {home.editorial.statement}
        </h2>

        <ol className="mt-10 grid gap-8 desktop:grid-cols-3 desktop:gap-10">
          {PILLARS.map((p, i) => (
            <li key={p.verb} className="flex gap-4">
              <span
                aria-hidden
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-medium ${
                  i === 0
                    ? 'bg-[var(--rust)] text-[var(--paper)]'
                    : 'border-[1.5px] border-[var(--rust)] text-[var(--rust)]'
                }`}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-[1.25rem] font-medium">{p.verb}</h3>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <KitButton href="/shop" variant="primary">
            Shop Now
          </KitButton>
          <KitTextLink href="/about" tone="secondary">
            Read More
          </KitTextLink>
        </div>
      </div>
    </section>
  )
}
