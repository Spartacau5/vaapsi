import type { Metadata } from 'next'
import { BrandFooter } from '@/components/patterns/tester-2/brand-footer'
import { Mission } from '@/components/patterns/tester-2/mission'
import { ShopRail } from '@/components/patterns/tester-2/shop-rail'
import { Splash } from '@/components/patterns/tester-2/splash'
import { TurntableHero } from '@/components/patterns/tester-2/turntable-hero'
import styles from '@/components/patterns/tester/tester.module.css'
import { listFeaturedProducts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Alt 1',
  robots: { index: false, follow: false },
}

export default async function Alt1Page() {
  // The store's own featured pieces, through the same adapter the home page
  // uses. Sold pieces are left out: a "shop the edit" rail shouldn't lead
  // with things you can't buy.
  const featured = await listFeaturedProducts(10)

  return (
    <div className={styles.root}>
      <Splash />
      <TurntableHero />
      <ShopRail products={featured.filter((p) => p.availability !== 'sold')} />
      <Mission />
      <BrandFooter />
    </div>
  )
}
