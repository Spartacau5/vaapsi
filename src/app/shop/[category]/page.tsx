import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductGridSkeleton } from '@/components/patterns/shop/product-grid'
import { ShopView } from '@/components/patterns/shop/shop-view'
import { Container } from '@/components/primitives/layout'
import { getProductFacets } from '@/lib/data'
import type { RawSearchParams } from '@/lib/plp/search-params'
import type { ProductCategory } from '@/lib/types'

type Params = { category: string }

/**
 * Category listing.
 *
 * The segment is validated against the live facets rather than a hardcoded list,
 * so a category that has no stock 404s instead of rendering an empty grid that
 * looks like a bug. `/shop/women` and `/shop/men` are gender segments rather
 * than categories and are not in the contract yet — they currently 404, which is
 * honest, and they are the reason `Product` needs a gender field (flagged in
 * lib/format/size).
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: toTitle(params.category) }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: RawSearchParams
}) {
  const facets = await getProductFacets()
  const known = facets.categories.some((facet) => facet.value === params.category)
  if (!known) notFound()

  return (
    <Suspense
      key={`${params.category}:${JSON.stringify(searchParams)}`}
      fallback={
        <Container>
          <div className="pt-24">
            <ProductGridSkeleton />
          </div>
        </Container>
      }
    >
      <ShopView
        searchParams={searchParams}
        category={params.category as ProductCategory}
        eyebrow="Shop"
        title={toTitle(params.category)}
      />
    </Suspense>
  )
}

function toTitle(segment: string): string {
  return segment
    .split('-')
    .map((word) => (word.length === 0 ? word : `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`))
    .join(' ')
}
