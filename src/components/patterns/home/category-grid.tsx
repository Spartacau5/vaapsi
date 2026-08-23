import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '../reveal'
import { Col, Container, Grid, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * Shop by category. Deliberately uneven.
 *
 * A four-up row of square tiles is the default e-commerce move and it reads as a
 * menu: every option identical, none of them chosen. An editorial grid makes a
 * decision — ethnicwear is the largest cell because it is the category that is
 * specific to this market and unavailable on a Western resale site.
 *
 * The layout: on desktop, one 6-column tall cell beside two stacked 3-column
 * cells, then a row of three. On tablet it becomes two columns of equal cells;
 * on mobile a single column with the aspect ratios doing the varying, because
 * an uneven grid at 375px is just a wonky list.
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
    <Reveal as="section" className="py-20 desktop:py-24">
      <section aria-labelledby="categories-title">
        <Container>
          <Stack gap={2} className="pb-8">
            <Eyebrow>{home.categories.eyebrow}</Eyebrow>
            <Type as="h2" id="categories-title" family="display" size="2xl" weight="heading">
              {home.categories.title}
            </Type>
          </Stack>

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
                          ? 'relative aspect-[4/5] overflow-hidden bg-surface desktop:h-full desktop:min-h-[36rem]'
                          : 'relative aspect-[16/9] overflow-hidden bg-surface desktop:aspect-[16/10]'
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
                        className="ease object-cover transition-transform duration-slower group-hover/cat:scale-[1.02]"
                      />
                    </div>
                    <Stack gap={1} className="pt-3">
                      <Type
                        as="h3"
                        family="display"
                        size={cell.tall ? 'xl' : 'lg'}
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
        </Container>
      </section>
    </Reveal>
  )
}
