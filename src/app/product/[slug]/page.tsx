import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'

type Params = { slug: string }

export const metadata: Metadata = { title: 'Product' }

/**
 * Product detail. Phase 5 replaces this with the real PDP, resolves the slug
 * through `getProduct` and calls `notFound()` when it misses.
 */
export default function ProductPage({ params }: { params: Params }) {
  return (
    <PageScaffold
      eyebrow="Product"
      title={params.slug}
      phase="Phase 5"
      note="Gallery, condition disclosure, measurements, and the passport inline."
    />
  )
}
