import type { Metadata } from 'next'
import { Container, Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { accountCopy } from '@/content/account'
import { getAccount } from '@/lib/data'

export const metadata: Metadata = {
  title: accountCopy.details.title,
  robots: { index: false, follow: false },
}

/**
 * Your details.
 *
 * Read-only until the account service exists, and it says so. A form that looks
 * editable and silently drops what you type is worse than one that admits it
 * cannot save yet.
 */
export default async function DetailsPage() {
  const account = await getAccount()

  const rows = [
    { label: accountCopy.details.name, value: account.name },
    { label: accountCopy.details.email, value: account.email },
    { label: accountCopy.details.phone, value: account.phone },
  ]

  return (
    <Container>
      <Stack gap={6} className="max-w-[46rem] py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{accountCopy.details.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {accountCopy.details.title}
          </Type>
        </Stack>

        <Stack gap={0}>
          {rows.map((row) => (
            <Stack key={row.label} gap={0}>
              <Row gap={3} justify="between" align="baseline" className="py-3">
                <Type as="span" size="sm" tone="muted">
                  {row.label}
                </Type>
                <Type as="span" size="sm">
                  {row.value}
                </Type>
              </Row>
              <Rule />
            </Stack>
          ))}
        </Stack>

        <Type size="xs" tone="subtle">
          {accountCopy.details.demoNote}
        </Type>
      </Stack>
    </Container>
  )
}
