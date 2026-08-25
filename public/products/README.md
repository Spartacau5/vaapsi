# public/products/

Real product photography goes here. Until a folder exists for a garment, the
fixtures fall back to `picsum.photos` placeholders.

## Convention

```
public/products/<product-slug>/
  1-primary.jpg      garment alone, light grey ground
  2-worn.jpg         model, full length, front
  3-detail.jpg       worn close-up, upper body
  4-detail.jpg       hardware or construction crop
  5-worn.jpg         model, full length, back
  6-label.jpg        macro on collar, waistband or brand mark
  flaw-1.jpg         each documented flaw, close
  flaw-2.jpg
```

The slug is `Product.slug` from `src/lib/data/fixtures/products.ts` — for example
`public/products/levis-501-original-straight-jeans-mid-indigo/1-primary.jpg`.

The full shot list, with the frame each one should be, is `SHOT_LIST` in that
same file. It is written as a photography brief so it can be handed to whoever
is shooting without them reading TypeScript.

## Switching a product over

Add its slug to `LOCAL_PHOTOGRAPHY` in `fixtures/products.ts`, mapped to the file
extension its frames were saved as. One line per garment, and the extension is
per-garment so a set shot as JPEG and a set shot as PNG can sit side by side.
Then pass the slug and the frame index to each `image()` call for that product —
the index is what turns into the `1-`, `2-`, `3-` prefix.

## Format

JPEG or WebP, 4:5, at least 1200px on the short edge. `next/image` handles the
responsive variants, so one high-quality original per frame is enough.

## Rights

Only photography Vaapsi owns or is licensed to use. Product shots lifted from
another brand's site are that brand's copyright, and a demo is not an exemption —
if it ends up in a deck or a shared link it is a real exposure, and it will not
survive to launch anyway.
