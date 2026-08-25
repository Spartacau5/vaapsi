import { CategoryGrid } from '@/components/patterns/home/category-grid'
import { EditorialBand } from '@/components/patterns/home/editorial-band'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { listFeaturedProducts, listProducts } from '@/lib/data'

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
  // Two different questions, so two different queries. The hero asks "what is
  // worth leading with", which is an editorial choice someone makes. The rail
  // asks "what turned up recently", which is a fact about the data — and it is
  // what the rail's own link promises, since "See everything" goes to
  // `?sort=newest`. Reading both off the featured list, as this did, meant the
  // rail was whatever the editor had not already spent on the hero.
  const [featured, recent] = await Promise.all([
    // Three frames. Past that nobody reaches the end, and the rail below shows
    // breadth far more efficiently than sitting through hero slides.
    listFeaturedProducts(3),
    // Filtered rather than queried: the adapter contract has no availability
    // filter and adding one is the dev team's API to change, not ours. Sold
    // garments still belong on the shop page, where a marked-sold piece shows
    // what moves; under "Just arrived" it is simply the wrong claim.
    listProducts({ sort: 'newest', limit: 8 }),
  ])

  return (
    <>
      <HeroCarousel products={featured} />
      <NewInRail products={recent.items.filter((p) => p.availability !== 'sold')} />
      <CategoryGrid />
      <EditorialBand />
    </>
  )
}
