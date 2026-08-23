import { ProvenanceLegend } from './provenance-dot'
import { PassportQr } from './qr'
import { Col, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { formatDate } from '@/lib/format/date'
import type { Passport } from '@/lib/types'

/**
 * The back of the passport: the record.
 *
 * Denser and more clerical than the front, and that is right — this side is for
 * the shopper who wants to check, the reseller establishing value in three
 * years, and the auditor. It should read like a document, not like a page.
 */
export async function PassportBack({
  passport,
  shareUrl,
}: {
  passport: Passport
  /** The canonical Vaapsi URL for this passport. What the QR encodes. */
  shareUrl: string
}) {
  return (
    <Stack gap={12}>
      {/* ---- Signature and status */}
      <section aria-labelledby="passport-signed">
        <Grid gap="loose" rowGap="loose">
          <Col mobile={4} tablet={8} desktop={7}>
            <Eyebrow as="h3">Status</Eyebrow>
            <Stack gap={4} className="pt-4">
              <Type as="p" id="passport-signed" family="display" size="xl" weight="heading">
                Signed {formatDate(passport.signedAt)} by {passport.issuer}
              </Type>

              {/*
                The voluntary statement. Stated plainly and given weight, because
                it is a credibility asset rather than a disclaimer — a business
                that keeps records it is not required to keep is making a
                stronger claim than one that complies.
              */}
              <Type
                size="sm"
                tone="muted"
                measure="default"
                className="border-l border-line-strong pl-4"
              >
                {passport.isVoluntary ? passportCopy.voluntary : passportCopy.regulated}
              </Type>
            </Stack>
          </Col>

          <Col mobile={4} tablet={8} desktop={4} startDesktop={9}>
            <Eyebrow as="h3">{passportCopy.sections.scan}</Eyebrow>
            <div className="pt-4">
              <PassportQr
                value={shareUrl}
                caption={`Opens this ${PASSPORT_NAME.singular} on vaapsi. Printable at 2cm.`}
              />
            </div>
          </Col>
        </Grid>
      </section>

      {/* ---- Original declaration + corrections */}
      <section aria-labelledby="passport-declaration" className="border-t border-line pt-10">
        <Grid gap="loose" rowGap="loose">
          <Col mobile={4} tablet={8} desktop={5}>
            <Eyebrow as="h3">{passportCopy.sections.declaration}</Eyebrow>
            <Stack gap={3} className="pt-4">
              <Type as="p" id="passport-declaration" size="sm" tone="muted">
                Declared {formatDate(passport.originalDeclaration.declaredAt)} by{' '}
                {passport.originalDeclaration.declaredBy}. This snapshot is never edited.
              </Type>

              <dl className="divide-y divide-line border-y border-line">
                {Object.entries(passport.originalDeclaration.snapshot).map(([key, value]) => (
                  <Row key={key} gap={4} justify="between" align="start" className="py-2.5">
                    <Type as="dt" size="xs" tone="subtle" className="shrink-0">
                      {humanise(key)}
                    </Type>
                    <Type as="dd" size="xs" numeric className="text-right">
                      {renderSnapshotValue(value)}
                    </Type>
                  </Row>
                ))}
              </dl>
            </Stack>
          </Col>

          <Col mobile={4} tablet={8} desktop={6} startDesktop={7}>
            <Eyebrow as="h3">{passportCopy.sections.corrections}</Eyebrow>
            <div className="pt-4">
              {passport.corrections.length === 0 ? (
                <Type size="sm" tone="subtle">
                  Never corrected.
                </Type>
              ) : (
                <ol className="divide-y divide-line">
                  {passport.corrections.map((correction) => (
                    <li key={correction.id} className="py-4 first:pt-0">
                      <Stack gap={1}>
                        <Row gap={3} justify="between" align="baseline">
                          <Type as="p" size="sm" weight="emphasis">
                            {humanise(correction.field)}
                          </Type>
                          <Type
                            as="time"
                            size="xs"
                            tone="subtle"
                            numeric
                            dateTime={correction.correctedAt}
                          >
                            {formatDate(correction.correctedAt)}
                          </Type>
                        </Row>
                        <Type size="xs" tone="muted">
                          {correction.reason}
                        </Type>
                        {/*
                          Both values shown, old struck through. The original
                          declaration above still holds the wrong value, and
                          that is the point — a clean record is less trustworthy
                          than one that shows its own repairs.
                        */}
                        <Row gap={2} align="baseline" className="pt-1">
                          <Type as="span" size="xs" tone="subtle">
                            <s>{renderSnapshotValue(correction.previousValue)}</s>
                          </Type>
                          <Type as="span" size="xs" tone="subtle" aria-hidden>
                            →
                          </Type>
                          <Type as="span" size="xs">
                            {renderSnapshotValue(correction.newValue)}
                          </Type>
                        </Row>
                        <Type size="xs" tone="subtle" className="pt-1">
                          {correction.correctedBy}
                        </Type>
                      </Stack>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Col>
        </Grid>
      </section>

      {/* ---- Identifiers */}
      <section aria-labelledby="passport-ids" className="border-t border-line pt-10">
        <Eyebrow as="h3">{passportCopy.sections.identifiers}</Eyebrow>
        <Type as="h4" id="passport-ids" className="sr-only">
          {passportCopy.sections.identifiers}
        </Type>
        <Grid gap="loose" rowGap="default" className="pt-4">
          <Identifier label="Unique product ID" value={passport.uniqueProductId} wide />
          <Identifier label="Product number" value={passport.productNo} />
          <Identifier label={`${PASSPORT_NAME.formal} version`} value={passport.dppVersion} />
          <Identifier label="Registry" value={passport.registry.name} />
          <Identifier label="Last updated" value={formatDate(passport.lastUpdated)} />
          <Identifier
            label="Authentication"
            value={
              passport.authentication.method === 'none'
                ? 'Not authenticated'
                : humanise(passport.authentication.method)
            }
          />
        </Grid>
      </section>

      {/* ---- Legend, on demand rather than always visible. */}
      <section className="border-t border-line pt-10 print:break-inside-avoid">
        <details className="group/legend">
          <summary className="cursor-pointer text-xs uppercase tracking-caps text-ink-muted transition-colors hover:text-ink print:list-none">
            {passportCopy.provenance.legendTitle}
          </summary>
          <div className="pt-6">
            <ProvenanceLegend />
          </div>
        </details>
      </section>

      {/* ---- End of life */}
      {(passport.endOfLife.recyclerLookupUrl !== null ||
        passport.endOfLife.collectionPointUrl !== null) && (
        <section className="border-t border-line pt-10">
          <Eyebrow as="h3">When it is finished</Eyebrow>
          <Row gap={6} className="pt-4">
            {passport.endOfLife.collectionPointUrl !== null && (
              <a
                href={passport.endOfLife.collectionPointUrl}
                className="border-b border-line-strong pb-0.5 text-sm text-ink transition-colors hover:border-ink"
              >
                Find a collection point
              </a>
            )}
            {passport.endOfLife.recyclerLookupUrl !== null && (
              <a
                href={passport.endOfLife.recyclerLookupUrl}
                className="border-b border-line pb-0.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                How this is recycled
              </a>
            )}
          </Row>
        </section>
      )}
    </Stack>
  )
}

function Identifier({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <Col mobile={4} tablet={4} desktop={wide ? 12 : 4}>
      <Type as="p" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <Type as="p" size="sm" numeric className="break-all pt-1">
        {value}
      </Type>
    </Col>
  )
}

/** `manufacturingCountry` → `Manufacturing country`. */
function humanise(key: string): string {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

/**
 * Render an arbitrary snapshot value.
 *
 * The snapshot is `Record<string, unknown>` by design — it is a frozen copy of
 * whatever the passport looked like at first publication, and its shape will
 * change as the contract does. So this renders defensively rather than assuming
 * a schema. An old snapshot must never be able to break the page that displays
 * it; that would defeat the entire point of keeping it.
 */
function renderSnapshotValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry !== null && typeof entry === 'object') {
          const record = entry as Record<string, unknown>
          const name = record.name
          const percentage = record.percentage
          if (typeof name === 'string') {
            return typeof percentage === 'number' ? `${name} ${percentage}%` : name
          }
        }
        return renderSnapshotValue(entry)
      })
      .join(', ')
  }
  return JSON.stringify(value)
}
