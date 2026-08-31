import type { Metadata } from 'next'
import { CheckoutView } from '@/components/patterns/checkout/checkout-view'
import { checkout } from '@/content/checkout'
import { listProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: checkout.title,
  robots: { index: false, follow: false },
}

/**
 * Checkout — the details step.
 *
 * ## What changed here, and what did not
 *
 * This used to be a single honest placeholder saying checkout did not exist. It
 * is now a working details step — contact, address, and the delivery choice that
 * carries the slower-shipping discount — and **payment is still a stated
 * boundary rather than a fake card form.** That line has not moved: a stubbed
 * payment screen gets believed, and then the phase that builds it never gets
 * estimated seriously. See `content/checkout.ts`.
 *
 * Nothing on the page is submitted anywhere.
 *
 * ## The subtotal
 *
 * Passed in from the server as a nominal figure over available stock, because
 * the real one needs the GST treatment that is still open (PRD #6). The summary
 * says on its face that tax comes at payment, so the number is indicative and
 * admits it rather than looking authoritative and being wrong.
 */
export default async function CheckoutPage() {
  const page = await listProducts({ limit: 3 })
  const subtotalInr = page.items
    .filter((item) => item.availability === 'available')
    .reduce((sum, item) => sum + item.priceInr, 0)

  return <CheckoutView subtotalInr={subtotalInr} />
}
