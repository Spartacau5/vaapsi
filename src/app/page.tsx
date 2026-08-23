import Link from 'next/link'
import { common } from '@/content'

/**
 * Placeholder. The real home page is Phase 3.
 *
 * Rendered from tokens only, like everything else, so it is already a valid
 * check that the theme system is wired up.
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-container px-gutter py-24">
      <p className="text-xs uppercase tracking-caps text-ink-subtle">{common.brand.parent}</p>
      <h1 className="mt-6 text-5xl">
        {common.brand.name.slice(0, -1)}
        {/* The dot over the i is the entire colour story. It is also, here, the
            cheapest possible proof that --accent is resolving. */}
        <span className="text-accent">{common.brand.name.slice(-1)}</span>
      </h1>
      <p className="mt-4 max-w-measure text-lg text-ink-muted">{common.brand.tagline}</p>
      <p className="mt-16 text-sm text-ink-subtle">
        Foundations only.{' '}
        <Link
          href="/tokens"
          className="text-ink underline decoration-line-strong underline-offset-4"
        >
          Token specimen
        </Link>
      </p>
    </main>
  )
}
