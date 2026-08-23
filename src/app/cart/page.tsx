import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'
import { navLabels } from '@/content/navigation'

export const metadata: Metadata = { title: navLabels.cart }

export default function CartPage() {
  return (
    <PageScaffold
      eyebrow={navLabels.cart}
      title="Your bag"
      phase="Phase 6"
      note="Single-unit lines, no quantity steppers, and honest handling of a garment that sells while it is sitting here."
    />
  )
}
