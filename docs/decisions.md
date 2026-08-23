# Decisions

The non-obvious calls, and why. **Without the rationale, a new team will reverse
these and reintroduce the problems they solve** — every entry here is something
that looks wrong until you know what it is protecting against.

---

## 1. Filter state lives in the URL, not in a store

`?brand=COS&condition=good&size=m` rather than Zustand.

**Why.** Four things come free: the page is shareable, the back button is
correct, the server can render a filtered result, and a refresh does not silently
drop what someone spent a minute selecting. All four are lost the moment filter
state moves into a store, and the last one is the expensive one — a shopper who
loses their filters does not re-apply them, they leave.

**The cost.** Every filter change is a navigation. Mitigated with `replace` and
`scroll: false` so ticking four boxes does not push four history entries.

**Do not** move this into Zustand to "avoid re-renders". Measure first; the
listing is a server component and the re-render is cheap.

---

## 2. There is no quantity in the cart

Not a disabled stepper. Not a `quantity: 1` field. Nothing.

**Why.** Every garment is one-of-one. A stepper is an interface promising
something the inventory cannot do, and leaving one in place "for later" means
every downstream consumer — totals, the passport, the availability check —
carries a branch for a case that can never happen. `add` is idempotent because
membership is a set.

---

## 3. The cart stores IDs and timestamps only

`localStorage` holds `{ productId, addedAt }`. Never a price, a title, an image
or an availability state.

**Why.** A cart that remembers a price shows the old one after a repricing, and
the shopper finds out at checkout. A cart that remembers availability will let
two people buy the same garment. Everything is resolved fresh through the adapter
on every read, and revalidated on route change and on drawer open.

**The consequence you have to keep:** a garment can sell while it sits in
someone's bag. That line stays visible, marked, excluded from the total, and
checkout is blocked with the reason **on the button**. Do not make it disappear —
a garment vanishing from a bag is far more alarming than one that says it sold.

---

## 4. No manufactured urgency

No countdown timers. No "3 people are viewing this". No "selling fast".

**Why.** The brand's entire thesis is honest disclosure — the passport, the
photographed flaws, the stated provenance. A fake timer contradicts all of it in
the one place a shopper is most alert. The scarcity here is _real_, and stating
it plainly is stronger: there is one of these, and when it goes it is gone.

There is a test asserting no urgency copy appears in the cart. It is there to
stop a growth-minded PR from adding one.

---

## 5. Provenance is a structural type, not a string

```ts
type Sourced<T> = { value: T; provenance: Provenance; verifiedAt?: string }
```

**Why.** This is the honesty mechanism of the whole product. If provenance were
an optional sibling field it would be dropped somewhere in the pipeline — by a
mapper, by a serialiser, by someone in a hurry — and the storefront would then be
presenting self-declared and verified facts identically. Making it structural
means a field cannot exist without its source.

**And it is encoded by fill, not colour.** Solid / half / hollow / dotted /
dashed. The constraint is the point: the mark has to survive greyscale, an 8px
render, and being printed on a care label sewn inside a garment. A red/amber/green
badge set fails all three and additionally implies "good/warning/bad", when
`supplier` is not worse than `verified`, just differently sourced.

---

## 6. The passport is rendered natively, not deep-linked to EuFSI

The QR resolves to `/passport/[id]` on a Vaapsi domain, with EuFSI as the data
source behind it.

**Why.** A QR is physically attached to an object for the life of that object.
Point it at a third party's page and a vendor change, a rebrand or a shutdown
bricks every code already sewn into a garment. One canonical URL we control is
the only version of this that survives five years.

It also means the passport is _our_ content: indexable, printable, in our voice,
and extendable with the lifecycle chain that EuFSI does not have.

**Still open** at the time of writing: which the client picks. This is the
recommendation, and the code implements it. (PRD Q2.)

---

## 7. The passport is a two-sided document, not a tab bar

**Why.** The EuFSI source uses five tabs and it reads as compliance software.
Tabs say "here are five equivalent panels of data". A front and a back say "this
is a record" — which is the structural claim the product needs: the story is the
front, and the paperwork behind it is checkable.

Two sides, not five. Any more and it is a tab bar with a nicer control.

Both sides stay in the DOM (`hidden`, not unmounted) so the passport is indexable
and so **print renders both**. A printed passport showing one half would be a
broken artefact.

---

## 8. Sold garments stay visible

On the listing, on the PDP, in the sitemap.

**Why.** Seeing sold stock is proof of liquidity — it tells a shopper that things
here actually move, and that hesitating has a cost. Hiding it throws that away.
The card stays a link because a sold garment still has a passport worth reading,
and most QR scans will happen _after_ the sale, by whoever owns the thing.

---

## 9. A garment with no passport shows nothing at all

No placeholder, no "passport pending", no greyed-out section.

**Why.** An absence that is drawn is still a claim. It tells a shopper something
is missing on a garment where nothing was promised. Silence is the honest
treatment. Three of the eight fixtures have no passport specifically so this path
is exercised.

---

## 10. Load more, not infinite scroll

**Why.** Infinite scroll makes the footer unreachable and breaks
back-navigation — a shopper scrolls through ninety garments, opens one, comes
back, and starts again from the top. On a marketplace where browsing _is_ the
product, that is the worst possible failure. The page number is in the URL, so
back shows fewer again and a shared link reproduces what the sender saw.

---

## 11. Everything visual is a token, and one file owns them

`src/styles/tokens.css` is the only file allowed a colour literal or a
`font-family`. Two exemptions, both documented in the test that enforces it:

- **The QR code** needs literal black-on-white to scan reliably, on screen and
  printed. A scanning requirement, not a design decision.
- **The studio panel** is deliberately unthemed. If it inherited `--background`
  and `--ink`, a client picking white-on-white would make the only control that
  can undo that choice invisible.

**Print is a colour preset**, not a separate stylesheet — `@media print` in
`tokens.css` redefines the same slots to black on white, converting the whole
site in fourteen lines.

---

## 12. All seven fonts load at build time

Not one preset's worth. All seven, each into its own CSS variable, with two
semantic slots (`--font-display`, `--font-body`) pointing at them.

**Why.** Switching a preset then reassigns two custom properties and loads
nothing — no flash, no layout shift, instant on a client call. The cost is
payload, and it is temporary: **when a direction is signed off, delete the unused
families from `components/theme/fonts.ts`.** That deletion is the intended end
state, not a cleanup someone forgot.

---

## 13. The accent lifts on the inverse preset

`#900000` becomes `0 100% 42%` on a near-black ground.

**Why.** `#900000` on near-black measures under 2:1 and reads as brown. The dot
is the verification mark; an unreadable mark serves the brand worse than a
recognisable one. Same hue, lifted lightness. There is a contrast test asserting
3:1 in every preset, so this is not a matter of taste.

---

## 14. `--line-strong` is darker than it looks like it should be

`0 0% 56%` on light, not the hairline grey it started as.

**Why.** It is the boundary on outlined buttons and inputs. WCAG 1.4.11 wants
3:1 against the ground for any boundary that identifies a control, and the value
this started at measured **1.7:1** — found by the contrast test, not by eye.
`--line` stays light; that one really is decoration.

---

## 15. One motion curve, one exception

Everything uses `--ease`. The single exception is the passport seal's `stamp`
curve, declared in `lib/motion/index.ts` with the reason next to it: a stamp has
mass, and the one place a shopper should feel weight is the moment a garment's
history is asserted as verified.

**No component defines a duration or easing inline.** The site's motion in one
sentence: _it settles into place — quickly, once, and without ceremony, except
for the single moment where a garment's history is stamped as verified._

A hover scale on the category tiles was cut in the Phase 7 audit. It carried no
information and made those the only images that moved on hover, where the product
card cross-fades to a detail shot — which actually tells you something.

---

## 16. The studio panel is gated on a query param, not a build flag

`?studio=1`, dynamically imported, `ssr: false`.

**Why.** It makes the client's version a shareable link with no auth and no
environment variable to forget, and the dynamic import keeps a design tool out of
every shopper's bundle. The URL is the single source of truth and **nothing is
persisted to localStorage** — a stale local value would silently override the
link someone had just been sent, which is the one thing this feature has to get
right.

The `?t=` token encoding is versioned, and **v1 tokens still decode**. Links live
in inboxes far longer than front-end versions live in a repo.

---

## 17. Known: `notFound()` returns HTTP 200 on dynamic routes

Next has already streamed the shell by the time the lookup fails, so the status
cannot change. It injects `<meta name="robots" content="noindex">`, so nothing is
indexed — but it is a soft 404.

Fixing it properly needs either `dynamicParams = false` (which would 404 every
newly listed garment until the next deploy) or a non-streaming render. Neither
trade is worth it. Documented so nobody files it twice.

---

## 18. Density: one token, and the PDP gallery is two-up

Section rhythm was hardcoded in eight components with three drifting values, and
those values were generous enough that a five-section page was mostly padding.
It is now `--space-section` / `--space-section-tight` in `tokens.css`, consumed
through the `Section` primitive. **Tuning the whole site's density is two
numbers.**

The reference register is still Zara / COS. But that reference works at a scale
where a section is a full-bleed photograph filling the viewport — copying its
padding onto a section holding four cards and a paragraph gives you dead space,
not restraint. Restraint is about how much is on the page, not how far apart it
sits.

Three specific layout changes, because padding alone was not the problem:

- **The PDP gallery is a two-up grid** with the primary image spanning both
  columns. A single stacked column of four 3:4 images is roughly 4,150px on a
  1440 screen; two-up is about 2,000px. The condition block — the thing that
  decides the purchase — was four screens down and is now closer to two. At half
  width each detail image is still ~385px wide, which is enough to read a fabric
  or spot a mark.
- **The condition scale is a grid, not a five-row list.** All five grades visible
  at once, because being able to compare them is the entire point of a scale.
- **The category grid's tall cell dropped from 36rem to 22rem** and its crops went
  landscape on mobile. Six links do not need a full viewport.

What did _not_ change: type sizes, the grid, the gutters, or any of the
information on the page. This is a spacing and layout pass, not a content cut.
