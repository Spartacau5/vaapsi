import type { Metadata } from 'next'
import { Alt2Footer } from '@/components/patterns/alt-2/footer'
import { Alt2Header } from '@/components/patterns/alt-2/header'
import { Alt2Hero } from '@/components/patterns/alt-2/hero'
import { Alt2Mission } from '@/components/patterns/alt-2/mission'
import { Alt2Products } from '@/components/patterns/alt-2/products'
import styles from '@/components/patterns/alt-2/alt2.module.css'
import { listFeaturedProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Alt 2',
  robots: { index: false, follow: false },
}

/**
 * Alt 2: the same storefront content, styled only from the Vaapsi brand guide
 * (primary palette and the web UI kit). Deliberately none of Alt 1's
 * treatments — no splash, ring or scroll-driven hero.
 */
export default async function Alt2Page() {
  const featured = await listFeaturedProducts(10)

  return (
    <div className={styles.root}>
      <Alt2Header />
      <Alt2Hero />
      <Alt2Products products={featured.filter((p) => p.availability !== 'sold')} />
      <Alt2Mission />
      <Alt2Footer />
    </div>
  )
}
