import { JourneyLine } from './journey-line'
import { ProvenanceDot, SourcedValue } from './provenance-dot'
import { Seal } from './seal'
import { Col, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { passportCopy } from '@/content/passport'
import type { Passport } from '@/lib/types'

/**
 * The front of the passport: the story.
 *
 * Order is an argument. Journey first and largest, because that is what makes a
 * passport worth reading; origin and materials after, because they are what a
 * compliance document leads with and they are not why a shopper is here; impact
 * last, because a number is the least interesting true thing on the page.
 */
export function PassportFront({ passport }: { passport: Passport }) {
  const materialTotal = passport.materials.reduce((sum, m) => sum + m.percentage.value, 0)

  return (
    <Stack gap={10}>
      {/* ---- Journey. The most space, deliberately. */}
      <section aria-labelledby="passport-journey">
        <Stack gap={5}>
          <Row gap={4} justify="between" align="end">
            <Stack gap={1}>
              <Eyebrow>{passportCopy.sections.journey}</Eyebrow>
              <Type as="h3" id="passport-journey" family="display" size="2xl" weight="heading">
                {passport.ownersCount === 1
                  ? 'One owner before you'
                  : `${passport.ownersCount} owners before you`}
              </Type>
            </Stack>

            {passport.authentication.verifiedBy !== null && (
              <Seal label={`Verified by ${passport.authentication.verifiedBy}`} />
            )}
          </Row>

          <JourneyLine chain={passport.chain} />
        </Stack>
      </section>

      <Grid gap="loose" rowGap="loose">
        {/* ---- Origin */}
        <Col mobile={4} tablet={4} desktop={4} as="section">
          <Eyebrow as="h3">{passportCopy.sections.origin}</Eyebrow>
          <Stack gap={4} as="dl" className="pt-4">
            <Field label="Place of origin" sourced={passport.placeOfOrigin} />
            <Field label="Made in" sourced={passport.manufacturingCountry} />
            <Field label="Manufacturer" sourced={passport.manufacturer} />
          </Stack>
        </Col>

        {/* ---- Materials */}
        <Col mobile={4} tablet={4} desktop={4} as="section">
          <Eyebrow as="h3">{passportCopy.sections.materials}</Eyebrow>
          <dl className="pt-4">
            {passport.materials.map((material) => (
              /*
                One wrapping div per group, holding exactly a dt and a dd.
                Anything between the wrapper and the dt/dd invalidates the list
                and a screen reader stops announcing it as definitions — which
                matters here, because "Cotton / 99%" only means anything as a
                pair.
              */
              <div
                key={material.name.value}
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 py-1.5"
              >
                <Type as="dt" size="sm" truncate>
                  {material.name.value}
                  {material.isRecycled.value && (
                    <Type as="span" size="xs" tone="subtle" className="pl-2">
                      recycled
                    </Type>
                  )}
                </Type>
                <Type as="dd" size="sm" tone="muted" className="text-right">
                  <Row gap={2} align="center" wrap={false} justify="end">
                    <Type as="span" size="sm" tone="inherit" numeric>
                      {material.percentage.value}%
                    </Type>
                    <ProvenanceDot provenance={material.percentage.provenance} />
                  </Row>
                  {material.provenance.value !== null && (
                    <Type as="span" size="xs" tone="subtle" className="block pt-0.5">
                      {material.provenance.value}
                    </Type>
                  )}
                </Type>
              </div>
            ))}
          </dl>

          {/*
            If the declared composition does not sum to 100, say so. Quietly
            swallowing a 97% total is exactly the kind of small dishonesty that
            makes the rest of the document unbelievable.
          */}
          {materialTotal !== 100 && (
            <Type size="xs" tone="subtle" className="mt-2 border-t border-line pt-2">
              Declared composition totals {materialTotal}%. The remainder is not recorded.
            </Type>
          )}
        </Col>

        {/* ---- Care */}
        <Col mobile={4} tablet={8} desktop={4} as="section">
          <Eyebrow as="h3">{passportCopy.sections.care}</Eyebrow>
          <Stack gap={2} as="ul" className="pt-4">
            {passport.careInstructions.map((instruction) => (
              <Row key={instruction.code} gap={3} align="center" as="li" wrap={false}>
                {/*
                  The GINETEX symbols are not drawn yet — `icon` names the asset
                  and the label is the fallback. Showing the words is the right
                  interim: an unlabelled care symbol is unreadable to most
                  people anyway, which is a large part of why garments get
                  ruined.
                */}
                <span
                  aria-hidden
                  className="size-6 shrink-0 border border-line"
                  data-icon={instruction.icon}
                />
                <Type as="span" size="sm" tone="muted">
                  {instruction.label}
                </Type>
              </Row>
            ))}
          </Stack>
        </Col>
      </Grid>

      {/* ---- Impact. Never a floating number. */}
      {passport.impact !== undefined && (
        <section aria-labelledby="passport-impact" className="border-t border-line pt-8">
          <Eyebrow as="h3">{passportCopy.sections.impact}</Eyebrow>
          <Grid gap="loose" className="pt-5">
            <Col mobile={2} tablet={4} desktop={3}>
              <Type as="p" family="display" size="3xl" weight="heading" numeric>
                {passport.impact.waterLitresSaved.toLocaleString('en-IN')}
              </Type>
              <Type size="sm" tone="muted">
                litres of water
              </Type>
            </Col>
            <Col mobile={2} tablet={4} desktop={3}>
              <Type as="p" family="display" size="3xl" weight="heading" numeric>
                {passport.impact.co2KgSaved}
              </Type>
              <Type size="sm" tone="muted">
                kg of CO₂e
              </Type>
            </Col>
            <Col mobile={4} tablet={8} desktop={6}>
              {/*
                The basis, always visible and never behind a disclosure. A number
                without a stated source is marketing, and one shopper catching
                one unsupported figure costs more than every figure earns.
              */}
              <Type size="xs" tone="subtle" measure="default">
                {passport.impact.basis}
              </Type>
            </Col>
          </Grid>
        </section>
      )}
    </Stack>
  )
}

function Field({
  label,
  sourced,
}: {
  label: string
  sourced: { value: string; provenance: Parameters<typeof ProvenanceDot>[0]['provenance'] }
}) {
  return (
    <div>
      <Type as="dt" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <dd className="pt-1">
        <SourcedValue value={sourced.value} provenance={sourced.provenance} />
      </dd>
    </div>
  )
}
