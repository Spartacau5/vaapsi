import { CategoryGrid } from '@/components/patterns/home/category-grid'
import { EditorialBand } from '@/components/patterns/home/editorial-band'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { listProducts } from '@/lib/data'

/**
 * Home.
 *
 * A server component reading through the data adapter, so every fetch here is a
 * single-file change away from a real endpoint.
 *
 * Section order is the argument the page makes: here is the work (hero) → here
 * is what just arrived (rail) → here is how to find things (categories) → and
 * here is why any of this matters (editorial).
 *
 * The explanatory sections that used to sit here — how a passport is made, what
 * the five condition grades mean — are gone from the home page deliberately.
 * They are good copy in the wrong place: nobody arriving cold wants a process
 * diagram, and both arguments land far harder on a garment page, next to the
 * actual grade and the actual record. The components still exist for the pages
 * that explain them.
 */
export default async function HomePage() {
  // The hero is editorial and needs no data at all — it reads its frames from
  // the content module. The rail asks "what turned up recently", which is a fact
  // about the stock, and is what its own "See everything" link promises since
  // that points at `?sort=newest`.
  //
  // Filtered rather than queried: the adapter contract has no availability
  // filter and adding one is the dev team's API to change, not ours. Sold
  // garments still belong on the shop page, where a marked-sold piece shows what
  // moves; under "Just arrived" it is simply the wrong claim.
  const recent = await listProducts({ sort: 'newest', limit: 8 })

  return (
    <>
      <HeroCarousel />
      <NewInRail products={recent.items.filter((p) => p.availability !== 'sold')} />
      <CategoryGrid />
      <EditorialBand />
    </>
  )
}
