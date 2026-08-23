import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Grid, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * Shop by category. Deliberately uneven.
 *
 * A four-up row of square tiles is the default e-commerce move and it reads as a
 * menu: every option identical, none of them chosen. An editorial grid makes a
 * decision — ethnicwear is the largest cell because it is the category that is
 * specific to this market and unavailable on a Western resale site.
 *
 * No hover transform on the images. It was there and it was cut in the Phase 7
 * audit: a 2% scale on a photograph carries no information, and it made these
 * tiles the only images on the site that move on hover — where the product card
 * cross-fades to a detail shot, which actually tells you something.
 *
 * The layout: on desktop, one tall cell beside two stacked ones, then a row of
 * three. The unevenness is the point — a four-up row of identical squares reads
 * as a menu where every option is equally unchosen.
 *
 * **Cells are much shorter than they were.** The tall one was 36rem minimum,
 * which made this single section a full viewport on desktop and nearly two on
 * mobile — a lot of screen for what is, functionally, six links. Landscape crops
 * on mobile rather than portrait, so the whole set is scannable at once.
 */

/** Per-cell shape at desktop. Index-matched to `home.categories.items`. */
const CELLS = [
  { desktop: 6 as const, tall: true },
  { desktop: 6 as const, tall: false },
  { desktop: 6 as const, tall: false },
  { desktop: 4 as const, tall: false },
  { desktop: 4 as const, tall: false },
  { desktop: 4 as const, tall: false },
]

export function CategoryGrid() {
  return (
    <Reveal>
      <Section eyebrow={home.categories.eyebrow} heading={home.categories.title}>
        <Grid gap="default" rowGap="default" as="ul">
          {home.categories.items.map((item, index) => {
            const cell = CELLS[index] ?? { desktop: 4 as const, tall: false }
            return (
              <Col
                key={item.href}
                mobile={4}
                tablet={4}
                desktop={cell.desktop}
                as="li"
                className={cell.tall ? 'desktop:row-span-2' : undefined}
              >
                <Link href={item.href} className="group/cat block focus-visible:outline-offset-4">
                  <div
                    className={
                      cell.tall
                        ? 'relative aspect-[16/10] overflow-hidden bg-surface desktop:aspect-auto desktop:h-full desktop:min-h-[22rem]'
                        : 'relative aspect-[16/10] overflow-hidden bg-surface desktop:aspect-[16/11]'
                    }
                  >
                    <Image
                      src={`https://picsum.photos/seed/vaapsi-cat-${item.label.toLowerCase()}/1200/1500`}
                      alt=""
                      aria-hidden
                      fill
                      sizes={
                        cell.desktop === 6
                          ? '(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw'
                          : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                      }
                      className="object-cover"
                    />
                  </div>
                  <Stack gap={0} className="pt-2">
                    <Type
                      as="h3"
                      family="display"
                      size={cell.tall ? 'lg' : 'base'}
                      weight="heading"
                    >
                      {item.label}
                    </Type>
                    {'note' in item && item.note !== undefined && (
                      <Type size="sm" tone="subtle">
                        {item.note}
                      </Type>
                    )}
                  </Stack>
                </Link>
              </Col>
            )
          })}
        </Grid>
      </Section>
    </Reveal>
  )
}
