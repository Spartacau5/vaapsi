import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'

type Params = { category: string }

/**
 * Category listing. The category segment is not validated yet — Phase 4 wires
 * it to the facets from `lib/data` and calls `notFound()` for a segment that
 * matches nothing.
 */
export function generateMetadata({ params }: { params: Params }): Metadata {
  return { title: toTitle(params.category) }
}

export default function CategoryPage({ params }: { params: Params }) {
  return (
    <PageScaffold
      eyebrow="Shop"
      title={toTitle(params.category)}
      phase="Phase 4"
      note="The grid, the filter rail and the mobile filter sheet all land here."
    />
  )
}

function toTitle(segment: string): string {
  return segment
    .split('-')
    .map((word) => (word.length === 0 ? word : `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`))
    .join(' ')
}
