# public/hero/

The home page hero frames. Editorial photography — denim being worn, hung, dried
and remade — not product shots. The frames and their alt text are declared in
`hero.slides` in `src/content/home.ts`; the files here are what those paths point
at.

## Credits

All four are from Unsplash, under the Unsplash Licence, which permits commercial
use without permission or attribution. Attribution is not required, so none is
rendered on the page, but the photographers are recorded here because a credit
nobody wrote down is a credit nobody can give later.

| File            | Photographer        | Unsplash ID |
| --------------- | ------------------- | ----------- |
| `1-hanger.jpg`  | Jason Leung         | EtOMMg1nSR8 |
| `2-jacket.jpg`  | Alora Griffiths     | KKZmUQjTO2E |
| `3-line.jpg`    | Ricardo Gomez Angel | rNXy6ngoyQ0 |
| `4-bag.jpg`     | Bryan Dijkhuizen    | MbktGM5IcsE |

## Format

JPEG, 2400×1500 (16:10), quality 82. That ratio is close to what the hero box
actually is at desktop width, so `object-cover` has little to throw away, and
`next/image` derives the responsive variants from here.

They are centre-cropped from much larger originals with one exception: the hanger
shot is portrait, and cropping it centrally turns it into a macro of a pocket, so
it is anchored near the top to keep the hanger and the waistband in frame. If a
frame is ever re-cropped, check it at desktop width — the caption block sits over
the lower-left, so anything important down there is covered.

## Replacing them

Drop a new file in and point `hero.slides` at it. Write the alt text as a
description of the picture, not of the brand: someone who cannot see it should
get the photograph, not the marketing.
