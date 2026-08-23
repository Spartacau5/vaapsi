import Image from 'next/image'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { conditionCopy, productPage } from '@/content/product'
import type { Product } from '@/lib/types'

/**
 * Condition and flaws.
 *
 * **This is a feature, not a formality, and it gets design weight.**
 *
 * Three decisions here, all the same decision:
 *
 * 1. The grade's definition is printed inline, not behind a tooltip. A shopper
 *    should not have to hover to find out what they are being promised.
 * 2. `conditionNotes` is set as prose at readable size, not as small print.
 * 3. Every flaw gets its **photograph**, its location on the garment, and its
 *    description — laid out as a list, not folded into an accordion.
 *
 * Hiding flaws in a collapsed section is the single most common mistake in
 * resale UI, and it is self-defeating: the shopper finds them anyway when the
 * parcel arrives, and then the return is a refund plus a lost customer. Honest
 * disclosure is what makes a used garment purchasable at all — a listing that
 * shows you the fraying at the hem is one you can trust about everything else.
 *
 * When there are no flaws, that is stated explicitly rather than by omission.
 * An empty section reads as "not filled in".
 */
export function ConditionBlock({ product }: { product: Product }) {
  const condition = conditionCopy[product.condition]

  return (
    <section aria-labelledby="condition-heading">
      <Stack gap={6}>
        <Stack gap={2}>
          <Eyebrow>{productPage.sections.condition}</Eyebrow>
          <Type as="h2" id="condition-heading" family="display" size="2xl" weight="heading">
            {condition.label}
          </Type>
          <Type size="base" tone="muted" measure="default">
            {condition.definition}
          </Type>
        </Stack>

        {product.conditionNotes !== '' && (
          <Type size="base" measure="default" className="border-l border-line-strong pl-4">
            {product.conditionNotes}
          </Type>
        )}

        <div className="border-t border-line pt-6">
          <Eyebrow as="h3">{productPage.sections.flaws}</Eyebrow>

          {product.flaws.length === 0 ? (
            <Type size="sm" tone="muted" className="pt-3">
              No flaws found at inspection. Nothing to disclose.
            </Type>
          ) : (
            <ul className="divide-y divide-line pt-3">
              {product.flaws.map((flaw, index) => {
                const image = product.images.find((candidate) => candidate.id === flaw.imageId)
                return (
                  <li key={`${flaw.location}-${index}`} className="py-5 first:pt-0">
                    <Row gap={4} align="start" wrap={false}>
                      {image !== undefined && (
                        <div className="relative size-20 shrink-0 overflow-hidden bg-surface tablet:size-24">
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <Stack gap={1} className="min-w-0">
                        <Type as="p" size="sm" weight="emphasis">
                          {flaw.location}
                        </Type>
                        <Type size="sm" tone="muted" measure="narrow">
                          {flaw.description}
                        </Type>
                      </Stack>
                    </Row>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Stack>
    </section>
  )
}
