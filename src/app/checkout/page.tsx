import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { cart } from '@/content/cart'

export const metadata: Metadata = {
  title: cart.checkout.action,
  robots: { index: false, follow: false },
}

/**
 * Checkout placeholder.
 *
 * **Deliberately not a fake payment screen.** A stubbed card form with a
 * disabled Pay button is the single most misleading thing this repo could
 * contain: the client sees it, believes payments are done, and the estimate for
 * the phase that actually builds it never gets taken seriously.
 *
 * So this page says plainly that checkout does not exist, and sends the shopper
 * back. It is the honest version, and it protects the schedule.
 */
export default function CheckoutPage() {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-24 desktop:py-32">
        <Eyebrow>{cart.checkout.action}</Eyebrow>
        <Type as="h1" family="display" size="3xl" weight="heading">
          {cart.checkout.notBuiltTitle}
        </Type>
        <Type size="lg" tone="muted">
          {cart.checkout.notBuiltBody}
        </Type>
        <Link
          href="/cart"
          className="ease mt-6 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {cart.checkout.notBuiltAction}
        </Link>
      </Stack>
    </Container>
  )
}
