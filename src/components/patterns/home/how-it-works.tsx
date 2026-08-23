import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Container, Grid, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * How the passport works. Four steps.
 *
 * **This is the only numbered thing on the site.** Numbers here are earned:
 * declared → inspected → verified → relisted is genuinely a sequence, and the
 * order carries meaning. Numbering a set of feature tiles, by contrast, implies
 * an order that does not exist and makes a reader look for one.
 *
 * The verbs are lifted straight out of the data model. A shopper who reads this
 * section and then opens a passport sees the same four words in the same order,
 * which is the difference between an explainer and a marketing panel.
 */
export function HowItWorks() {
  return (
    <Reveal as="section" className="bg-surface py-20 desktop:py-24">
      <section aria-labelledby="how-title">
        <Container>
          <Stack gap={3} className="max-w-measure pb-12">
            <Eyebrow>{home.howItWorks.eyebrow}</Eyebrow>
            <Type as="h2" id="how-title" family="display" size="3xl" weight="heading">
              {home.howItWorks.title}
            </Type>
            <Type size="lg" tone="muted">
              {home.howItWorks.lede}
            </Type>
          </Stack>

          <Grid gap="loose" rowGap="loose" as="ol">
            {home.howItWorks.steps.map((step, index) => (
              <Col key={step.verb} mobile={4} tablet={4} desktop={3} as="li">
                <Stack gap={3}>
                  {/*
                    The marker is a hairline rule with the number over it, not a
                    filled circle. A numbered badge on a near-monochrome page is
                    the loudest thing on the screen, and step three is not the
                    most important element here.
                  */}
                  <div className="border-t border-line-strong pt-3">
                    <Type size="xs" tone="subtle" numeric tracking="caps">
                      {String(index + 1).padStart(2, '0')}
                    </Type>
                  </div>
                  <Type as="h3" family="display" size="xl" weight="heading">
                    {step.verb}
                  </Type>
                  <Type size="sm" tone="muted">
                    {step.body}
                  </Type>
                </Stack>
              </Col>
            ))}
          </Grid>

          <Link
            href="/passport"
            className="ease mt-12 inline-flex border-b border-line-strong pb-1 text-sm text-ink transition-colors duration-base hover:border-ink"
          >
            {home.howItWorks.cta}
          </Link>
        </Container>
      </section>
    </Reveal>
  )
}
