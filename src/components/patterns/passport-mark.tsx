import { Dot } from './logo'
import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { PASSPORT_NAME } from '@/content/passport'
import { cn } from '@/lib/utils'

/**
 * The passport indicator: the accent dot plus a small label.
 *
 * **A garment without a passport renders nothing.** No empty state, no
 * "passport pending", no greyed-out version. An absence that is drawn is still
 * a claim — it tells a shopper that something is missing, on a garment where
 * nothing was promised. Silence is the honest treatment.
 *
 * This is the first of the passport's three surfaces. The other two are the
 * section inline on the PDP and the standalone route, and all three use the same
 * dot at the same weight so a shopper learns the mark once.
 */
export function PassportMark({
  hasPassport,
  className,
}: {
  hasPassport: boolean
  className?: string
}) {
  if (!hasPassport) return null

  return (
    <Row gap={2} align="center" wrap={false} className={cn('min-w-0', className)}>
      <Dot size="small" />
      <Type as="span" size="xs" tone="muted" truncate>
        {PASSPORT_NAME.singular}
      </Type>
    </Row>
  )
}
