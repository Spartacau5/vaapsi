import type { Metadata } from 'next'
import { Alt2Footer } from '@/components/patterns/alt-2/footer'
import { Alt2Mission } from '@/components/patterns/alt-2/mission'
import { Alt2Products } from '@/components/patterns/alt-2/products'
import styles from '@/components/patterns/alt-2/alt2.module.css'
import { Splash } from '@/components/patterns/tester-2/splash'
import { TurntableHero } from '@/components/patterns/tester-2/turntable-hero'
import { listFeaturedProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Alt 2',
  robots: { index: false, follow: false },
}

/**
 * Alt 2: opens exactly like Alt 1 (splash, wordmark masthead, the turning
 * model with her ring), then the storefront sections styled only from the
 * brand guide's web UI kit.
 */
export default async function Alt2Page() {
  const featured = await listFeaturedProducts(10)

  return (
    <div className={styles.root}>
      <Splash />
      <TurntableHero />
      <Alt2Products products={featured.filter((p) => p.availability !== 'sold')} />
      <Alt2Mission />
      <Alt2Footer />
    </div>
  )
}
