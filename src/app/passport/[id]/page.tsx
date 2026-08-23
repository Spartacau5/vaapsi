import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'
import { PASSPORT_NAME } from '@/content/passport'

type Params = { id: string }

export const metadata: Metadata = { title: PASSPORT_NAME.title }

/**
 * The standalone passport route. This is what the QR resolves to, so it needs
 * print styles and a shareable, stable URL.
 *
 * OPEN: whether the QR points here or at the EuFSI-hosted page. Recommend here,
 * with EuFSI as the data source — one canonical Vaapsi URL we control, rather
 * than a third party owning the destination of a code printed on a garment.
 */
export default function PassportPage({ params }: { params: Params }) {
  return (
    <PageScaffold
      eyebrow={PASSPORT_NAME.title}
      title={params.id}
      phase="Phase 5"
      note="The two-sided document: the story on the front, the record on the back."
    />
  )
}
