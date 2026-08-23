import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'

export const metadata: Metadata = { title: 'Shop' }

export default function ShopPage() {
  return (
    <PageScaffold
      eyebrow="Shop"
      title="Everything available"
      phase="Phase 4"
      note="One-of-one pieces, newest first. Filters, sort and the product grid arrive with the listing page."
    />
  )
}
