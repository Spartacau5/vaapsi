import Image from 'next/image'
import { Reveal } from '../reveal'
import { Container, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'

/**
 * The breathing room in the page. One full-bleed image, one statement.
 *
 * No call to action, no product, no link. Every other section on this page is
 * asking for something; this one is not, and that is its job. A page that sells
 * continuously reads as a page that is nervous.
 *
 * The statement sits on the image rather than beside it, which is the one place
 * on the site where text goes over photography — so the overlay is a flat scrim
 * at low opacity rather than a gradient, and the crop is chosen to be quiet
 * behind text.
 */
export function EditorialBand() {
  return (
    <Reveal as="section" className="py-8">
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden tablet:aspect-[16/9] desktop:aspect-[21/9]">
          <Image
            src="https://picsum.photos/seed/vaapsi-editorial-band/2400/1200"
            alt={home.editorial.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Flat scrim, not a gradient. This direction does not use gradients. */}
          <div className="absolute inset-0 bg-ink/30" aria-hidden />

          <div className="absolute inset-0 flex items-end">
            <Container>
              <Stack gap={3} className="pb-10 desktop:pb-16">
                <Type
                  as="p"
                  family="display"
                  size="3xl"
                  weight="heading"
                  tone="inherit"
                  measure="narrow"
                  className="text-background desktop:text-4xl"
                >
                  {home.editorial.statement}
                </Type>
                <Type
                  as="p"
                  size="xs"
                  tone="inherit"
                  tracking="caps"
                  className="text-background/70"
                >
                  {home.editorial.attribution}
                </Type>
              </Stack>
            </Container>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
