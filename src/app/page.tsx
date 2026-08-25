import { CategoryGrid } from '@/components/patterns/home/category-grid'
import { EditorialBand } from '@/components/patterns/home/editorial-band'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { listFeaturedProducts } from '@/lib/data'

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
  // Five is the useful ceiling for a hero rotation. Past that nobody reaches the
  // end, and the rail below is a better way to show breadth.
  const featured = await listFeaturedProducts(10)

  return (
    <>
      <HeroCarousel products={featured.slice(0, 5)} />
      <NewInRail products={featured.slice(5, 10)} />
      <CategoryGrid />
      <EditorialBand />
    </>
  )
}
