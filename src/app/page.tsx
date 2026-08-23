import { CategoryGrid } from '@/components/patterns/home/category-grid'
import { ConditionScale } from '@/components/patterns/home/condition-scale'
import { EditorialBand } from '@/components/patterns/home/editorial-band'
import { Hero } from '@/components/patterns/home/hero'
import { HowItWorks } from '@/components/patterns/home/how-it-works'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { getPassportByProduct, getProduct, listFeaturedProducts } from '@/lib/data'

/**
 * Home.
 *
 * A server component reading through the data adapter, so every fetch here is a
 * single-file change away from a real endpoint.
 *
 * Section order is the argument the page makes: this garment has a past (hero) →
 * here is what just arrived (rail) → here is how we know its past (passport) →
 * here is how to find things (categories) → here is what the grades mean
 * (condition) → and here is why any of this matters (editorial).
 *
 * The condition section sits deliberately late. A shopper who has already seen
 * a garment they want is far more receptive to "here is exactly what 'good'
 * means" than someone who has not yet found anything.
 */
export default async function HomePage() {
  const featured = await listFeaturedProducts(8)
  const heroSummary = featured[0]

  // The hero needs the full product for its image set, and the passport for the
  // facts beside it. Both may legitimately be absent, and the page still works.
  const heroProduct = heroSummary === undefined ? null : await getProduct(heroSummary.id)
  const heroPassport = heroProduct === null ? null : await getPassportByProduct(heroProduct.id)

  return (
    <>
      {heroProduct !== null && <Hero product={heroProduct} passport={heroPassport} />}
      <NewInRail products={featured.slice(1, 7)} />
      <HowItWorks />
      <CategoryGrid />
      <ConditionScale />
      <EditorialBand />
    </>
  )
}
