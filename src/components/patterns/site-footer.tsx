import Link from 'next/link'
import { Logo } from './logo'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { footerMeta, footerNav, navLabels } from '@/content/navigation'
import { passportCopy } from '@/content/passport'

/**
 * Quiet and dense.
 *
 * Typographic throughout: no social icon soup, no newsletter box competing with
 * the navigation, no logo wall. Payment methods are set as text rather than as
 * a row of brand marks — the marks are visual noise at the bottom of a page and
 * half of them would need licensing anyway.
 *
 * A server component. Nothing here is interactive beyond links, and the year in
 * the copyright is computed at build time rather than being a client-side
 * `new Date()` that would mismatch on hydration.
 */
export function SiteFooter() {
  const year = new Date().getUTCFullYear()

  return (
    <footer className="mt-section border-t border-line">
      <Container>
        <div className="py-section-tight">
          <Grid rowGap="loose">
            <Col mobile={4} tablet={8} desktop={3}>
              <Link href="/" aria-label={navLabels.home} className="inline-block text-ink">
                <Logo decorative />
              </Link>
              <Type size="sm" tone="muted" measure="narrow" className="mt-4">
                {passportCopy.oneLiner}
              </Type>
            </Col>

            <Col mobile={4} tablet={8} desktop={8} startDesktop={5}>
              <nav aria-label={navLabels.footerNav}>
                <Grid gap="default" rowGap="loose">
                  {footerNav.map((group) => (
                    <Col key={group.heading} mobile={2} tablet={2} desktop={2} as="section">
                      <Eyebrow as="h2">{group.heading}</Eyebrow>
                      <Stack gap={1} as="ul" className="mt-3">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="text-ink-muted transition-colors hover:text-ink"
                            >
                              <Type as="span" size="sm" tone="inherit">
                                {item.label}
                              </Type>
                            </Link>
                          </li>
                        ))}
                      </Stack>
                    </Col>
                  ))}
                </Grid>
              </nav>
            </Col>
          </Grid>
        </div>

        {/* India block. Currency, country, tax and payment, stated plainly. */}
        <div className="border-t border-line py-6">
          <Row gap={6} justify="between" align="start">
            <Stack gap={2}>
              <Row gap={3}>
                <Type size="sm" numeric>
                  {footerMeta.currency}
                </Type>
                <Type size="sm" tone="subtle">
                  {footerMeta.country}
                </Type>
              </Row>
              <Type size="xs" tone="subtle">
                {footerMeta.currencyNote}
              </Type>
              {/*
                Placeholder. What the price includes depends on who the merchant
                of record is, which is unresolved (PRD open question #6). The
                line is here so the gap is visible rather than discovered at
                checkout.
              */}
              <Type size="xs" tone="subtle" measure="narrow">
                {footerMeta.gstNote}
              </Type>
            </Stack>

            <Stack gap={2} className="tablet:items-end">
              <Eyebrow as="h2">Payment</Eyebrow>
              <Row gap={3}>
                {footerMeta.paymentMarks.map((mark) => (
                  <Type key={mark} as="span" size="xs" tone="muted">
                    {mark}
                  </Type>
                ))}
              </Row>
            </Stack>
          </Row>
        </div>

        <div className="border-t border-line py-6">
          <Row gap={4} justify="between">
            <Type size="xs" tone="subtle">
              {footerMeta.copyright(year)}
            </Type>
            <Row gap={4} as="ul">
              {(footerNav.find((group) => group.heading === 'Legal')?.items ?? []).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-subtle transition-colors hover:text-ink"
                  >
                    <Type as="span" size="xs" tone="inherit">
                      {item.label}
                    </Type>
                  </Link>
                </li>
              ))}
            </Row>
          </Row>
        </div>
      </Container>
    </footer>
  )
}
