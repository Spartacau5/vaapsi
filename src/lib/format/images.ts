import type { ProductImage } from '@/lib/types'

/**
 * Gallery order: primary → worn → detail → flaw → label.
 *
 * `worn` comes second because "what does it look like on a person" is the first
 * question a shopper has. `flaw` comes before `label` because someone scrolling
 * to the end of the gallery should reach the honest part, not the paperwork.
 *
 * Lives here rather than beside the Gallery component on purpose: Gallery is a
 * client component, and a plain function exported from a `'use client'` module
 * arrives in a server component as a client *reference*, not as the function.
 * Calling it then fails at runtime with nothing useful in the message.
 */
const ORDER: Record<ProductImage['kind'], number> = {
  primary: 0,
  worn: 1,
  detail: 2,
  flaw: 3,
  label: 4,
}

export function orderGalleryImages(images: readonly ProductImage[]): readonly ProductImage[] {
  return [...images].sort((a, b) => ORDER[a.kind] - ORDER[b.kind])
}
