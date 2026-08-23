import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Container, Grid, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { conditionCopy } from '@/content/product'
import { CONDITIONS, conditionRank } from '@/lib/types'

/**
 * The five-level condition scale, with its full public definitions.
 *
 * This section removes the single biggest objection in resale — "what does 'good'
 * actually mean?" — so it gets real space on the home page rather than a line in
 * an FAQ nobody opens. A shopper who reads this before browsing has already
 * decided to trust the grades, and a shopper who has not will second-guess every
 * listing.
 *
 * Rendered as a definition list from the same `conditionCopy` the product page
 * uses. There is exactly one copy of these words in the repo, so the promise on
 * the home page cannot drift from the promise on the garment.
 *
 * The rank number is set small and quiet. It is a position on a scale, not a
 * score out of five — a shopper reading "5" as "worst" is fine; reading it as
 * "5/5, excellent" would be a disaster.
 */
export function ConditionScale() {
  return (
    <Reveal as="section" className="py-20 desktop:py-24">
      <section aria-labelledby="condition-title">
        <Container>
          <Grid gap="loose" rowGap="loose">
            <Col mobile={4} tablet={8} desktop={4}>
              <Stack gap={3} className="desktop:sticky desktop:top-24">
                <Eyebrow>{home.condition.eyebrow}</Eyebrow>
                <Type as="h2" id="condition-title" family="display" size="3xl" weight="heading">
                  {home.condition.title}
                </Type>
                <Type size="base" tone="muted">
                  {home.condition.lede}
                </Type>
                <Type size="sm" tone="subtle" className="mt-2 border-t border-line pt-4">
                  {home.condition.note}
                </Type>
                <Link
                  href="/condition"
                  className="ease mt-2 inline-flex self-start border-b border-line-strong pb-1 text-sm text-ink transition-colors duration-base hover:border-ink"
                >
                  {home.condition.cta}
                </Link>
              </Stack>
            </Col>

            <Col mobile={4} tablet={8} desktop={7} startDesktop={6}>
              <dl>
                {CONDITIONS.map((condition) => {
                  const copy = conditionCopy[condition]
                  return (
                    <div
                      key={condition}
                      className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line py-6 first:border-t-0 first:pt-0"
                    >
                      <Type as="span" size="xs" tone="subtle" numeric className="pt-1" aria-hidden>
                        {conditionRank(condition)}
                      </Type>
                      <Type as="dt" family="display" size="xl" weight="heading">
                        {copy.label}
                      </Type>
                      <div />
                      <Type as="dd" size="sm" tone="muted" measure="default">
                        {copy.definition}
                      </Type>
                    </div>
                  )
                })}
              </dl>
            </Col>
          </Grid>
        </Container>
      </section>
    </Reveal>
  )
}
