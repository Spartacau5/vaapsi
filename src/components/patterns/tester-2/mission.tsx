import Link from 'next/link'
import { home } from '@/content/home'
import brand from './brand.module.css'

/**
 * The mission, in the new identity. The site's editorial statement, which
 * already says it in one line, set large on Forest, followed by the three verbs
 * from the tagline as pillars.
 *
 * The pillar copy is new and drafted from what the site already says about the
 * passport and the studio process. It is not signed-off brand copy.
 */

const COPY = {
  eyebrow: 'Our mission',
  pillars: [
    {
      verb: 'Rethink',
      body: 'Buy less, choose better. Denim cut and sewn to be worn for years, not a season.',
    },
    {
      verb: 'Refashion',
      body: 'Each one is inspected, graded and photographed flaw by flaw in our studio, then relisted with its history attached.',
    },
    {
      verb: 'Repeat',
      body: 'When you are done with it, send it back. It goes round again, with its record, to whoever wears it next.',
    },
  ],
  cta: 'Shop',
  ctaHref: '/shop',
} as const

export function Mission() {
  return (
    <section
      aria-labelledby="mission-title"
      className="py-14 desktop:py-20"
      style={{ background: 'var(--vaapsi-forest)', color: 'var(--vaapsi-natural)' }}
    >
      <div className="mx-auto max-w-[1360px] px-5 text-center tablet:px-8">
        <InfinityMark className="mx-auto h-6 w-auto" />
        <p className={`${brand.label} mt-4`} style={{ color: '#a9b98a' }}>
          {COPY.eyebrow}
        </p>
        <h2
          id="mission-title"
          className={`${brand.jost} mx-auto mt-4 max-w-[22ch] text-[clamp(1.75rem,5.6vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.01em]`}
        >
          {home.editorial.statement}
        </h2>

        <ul
          className={`${brand.ruleOnDark} mt-10 grid border-t text-left desktop:mt-12 desktop:grid-cols-3`}
        >
          {COPY.pillars.map((pillar, i) => (
            <li
              key={pillar.verb}
              className={`${brand.ruleOnDark} border-b py-6 desktop:border-b-0 desktop:px-10 desktop:py-8 ${
                i > 0 ? 'desktop:border-l' : 'desktop:pl-0'
              }`}
            >
              <p className={brand.label} style={{ color: '#a9b98a' }}>
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className={`${brand.title} mt-2 text-xl`}>{pillar.verb}</h3>
              <p
                className={`${brand.jost} mt-2 max-w-[36ch] text-[0.9rem] leading-relaxed opacity-80`}
              >
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href={COPY.ctaHref}
          className={`${brand.label} mt-10 inline-flex h-12 items-center px-10 transition-opacity hover:opacity-85 focus-visible:outline-offset-4`}
          style={{ background: 'var(--vaapsi-natural)', color: 'var(--vaapsi-forest)' }}
        >
          {COPY.cta}
        </Link>
      </div>
    </section>
  )
}

/** The "aa" infinity from the wordmark, on its own — the brand's favicon mark. */
function InfinityMark({ className }: { className?: string }) {
  return (
    <svg viewBox="452 290 340 190" className={className} aria-hidden fill="currentColor">
      <path
        d="M 607.52 417.49 A 74.5 74.5 0 1 1 604.52 348.75 C 617 371 621 401 633.48 423.25 A 74.5 74.5 0 1 0 636.97 343.27"
        fill="none"
        stroke="currentColor"
        strokeWidth={29}
      />
      <rect x="590" y="448" width="31" height="25" />
      <rect x="759" y="301" width="31" height="172" />
    </svg>
  )
}
