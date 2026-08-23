# vaapsi-storefront

The customer-facing storefront for **Vaapsi** — an India-based circular fashion
marketplace for pre-loved clothing and apparel, operating under BTR Global.

This repository is the front end only. It is built to be **merged into the
backend team's stack**, not translated into it — which is why the framework
majors below are pinned exactly rather than kept current.

## Ownership

| Area                                        | Owner                |
| ------------------------------------------- | -------------------- |
| This storefront (design + front end)        | Vaapsi               |
| Backend, database, APIs, infrastructure     | IPguide              |
| Product decisions, catalogue, copy sign-off | Vaapsi (Kanwarpreet) |

## Stack

Next.js **14.2.x** (App Router) · React 18 · TypeScript 5 (strict) ·
Tailwind CSS **3.4.x** · shadcn/ui · Framer Motion · Lucide React ·
Zustand (client state) · TanStack Query v5 (server state) ·
React Hook Form 7 + Zod.

> **Do not upgrade to Tailwind v4 or Next 15.** `next` and `tailwindcss` are
> pinned without carets in `package.json` deliberately. Both are breaking
> upgrades for the merge into IPguide's stack.

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Node 20 (see `.nvmrc`). pnpm 10.

| Script                              | Does                            |
| ----------------------------------- | ------------------------------- |
| `pnpm dev`                          | Dev server                      |
| `pnpm build`                        | Production build                |
| `pnpm typecheck`                    | `tsc --noEmit`                  |
| `pnpm lint`                         | ESLint, zero warnings tolerated |
| `pnpm format:check` / `pnpm format` | Prettier                        |
| `pnpm test`                         | Jest + React Testing Library    |

CI (`.github/workflows/ci.yml`) runs install → typecheck → lint → format → test
→ build on every push and PR.

## Layout

```
src/
  app/                 routes only — thin, no business logic
  components/
    ui/                shadcn primitives, unmodified
    primitives/        our own low-level pieces (Type, Stack, Field)
    patterns/          composed, product-aware (ProductCard, PassportSeal)
  lib/
    types/             the data contract
    data/              mock data + adapters — the integration seam
    format/            currency, sizes, dates
    utils/             generic helpers (cn)
  content/             all user-facing copy
  styles/              design tokens
```

Each folder carries a `README.md` stating what belongs in it. Read those before
adding files.

## Handoff notes

**The data layer is mocked behind typed adapters in `src/lib/data/`, and that is
the intended integration seam.**

- `src/lib/types/` is the data contract. It is written to be mapped onto Prisma
  models; treat a change here as a contract change.
- `src/lib/data/` exposes a typed interface (`getProduct`, `listProducts`,
  `getPassport`, …) with a mock implementation reading local fixtures.
- **Nothing outside `src/lib/data/` may import fixtures.** An ESLint rule
  enforces this. Every consumer goes through the interface, so replacing the
  mock with TanStack Query against real endpoints is a single-file change.
- Everything visual is a CSS custom property in `src/styles/`. No component
  contains a hex code or a `font-family`. Re-theming is a token change.
- All copy lives in `src/content/`. English only for v1, but nothing is
  hardcoded into JSX, so a locale layer drops in without touching components.

### The two foundations

**1. `src/lib/types/` — the data contract.**

Written to be mapped onto Prisma models. It describes a _resale marketplace_,
not a retail catalogue: every garment is one-of-one, so there is no quantity
anywhere and availability is `available | reserved | sold`.

The `Passport` type mirrors the EuFSI structure field-for-field, then extends it
with what makes a passport worth showing a shopper: `chain` (an ordered
lifecycle event log), `ownersCount`, `authentication`, and `impact` — whose
`basis` is required, because a number without a stated source is marketing.

`Sourced<T>` wraps every passport field that carries a source badge. It is
non-optional on purpose. An optional provenance field gets dropped somewhere in
the pipeline, and then the storefront is making claims nobody can stand behind.

**2. `src/styles/tokens.css` — the design tokens.**

Every visual value in the app is a CSS custom property defined here, and this is
the only file in the repo allowed to contain a colour literal or a
`font-family`. A Jest test enforces that (`src/styles/__tests__`), so the rule
holds after the first sprint rather than just on the day it was written.

Two colour presets (`mono`, `inverse`) and five font pairings, all applied as
`data-theme` and `data-font` attributes on `<html>`. See
[src/components/theme/README.md](src/components/theme/README.md).

`/tokens` renders a full specimen sheet. Set `data-theme="inverse"` on `<html>`
in devtools and the whole page restyles; reassign `--font-display` and the
display face swaps with no layout break and no font loading.

### Surfaces built

| Route                       | What it is                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | Home. Hero built on one garment and its history, new-in rail, passport explainer, category grid, condition scale, editorial band |
| `/shop`, `/shop/[category]` | Listing. Filters, sort and pagination all live in `searchParams` — no filter state in Zustand                                    |
| `/product/[slug]`           | PDP. Gallery, condition and flaw disclosure, measurements, and the passport inline                                               |
| `/passport/[id]`            | The standalone passport. **This is what the QR resolves to.** Print styles included                                              |
| `/tokens`                   | Token specimen sheet. Internal reference, not linked                                                                             |
| `/cart`, `/passport`        | Scaffolded, not yet built                                                                                                        |

### Things that will surprise you

**The dot does five jobs.** The wordmark, the active nav marker, the cart badge,
the loading indicator, and the verification seal. That is deliberate — a shopper
learns the mark once. There is no spinner anywhere in this codebase.

**Provenance is encoded by fill, not colour.** Solid, half, hollow, dashed,
dotted. The constraint is the point: the mark has to survive greyscale, an 8px
render, and being printed on a care label. A red/amber/green badge set would fail
all three and would imply "good/warning/bad" when `supplier` is not worse than
`verified`, just differently sourced.

**Print is a colour preset, not a stylesheet.** `@media print` in `tokens.css`
redefines the same slots to black on white, so the entire site converts in
fourteen lines. Same mechanism as the theme switcher, pointed at paper.

**`notFound()` returns HTTP 200 on dynamic routes.** Next has already streamed
the shell by the time the lookup fails, so the status cannot be changed. Next
injects `<meta name="robots" content="noindex">`, so it is not indexed — but it is
a soft 404. Fixing it needs either `dynamicParams = false` (which would 404 every
new listing until the next deploy) or a non-streaming render. Neither trade is
worth it; the note is here so nobody files it twice.

**One dependency beyond the pinned stack:** `qrcode`, used server-side to render
the passport QR to SVG. No client JS, no canvas, no layout shift.

### Still stubbed or provisional

| What                    | Where                       | Blocked on                               |
| ----------------------- | --------------------------- | ---------------------------------------- |
| PIN-code serviceability | `product/pincode-check.tsx` | Parcel provider (PRD Q8)                 |
| Returns policy copy     | `content/delivery.ts`       | C2C returns policy (PRD Q7)              |
| GST / tax line          | `content/navigation.ts`     | Merchant of record (PRD Q6)              |
| Add to bag              | `product/add-to-bag.tsx`    | Phase 6                                  |
| Care symbols            | `passport/front.tsx`        | GINETEX icon set; labels shown meanwhile |
| Product photography     | fixtures                    | Client (PRD Q10)                         |
| The passport's name     | `content/passport.ts`       | Client                                   |

### Conventions worth knowing

- Money is stored as an **integer number of paise**, never a float, and
  formatted with Indian lakh grouping (`₹1,20,000`, not `₹120,000`).
- Every garment is **one-of-one**. There is no quantity; availability is
  `available | reserved | sold`.
- Passport fields that carry a source badge are `Sourced<T>` — a value plus its
  provenance. This is structural on purpose: an optional provenance field gets
  dropped, and then the UI is claiming things it cannot back up.

### Scope of v1

Home, PLP, PDP with Passport, Cart. Checkout, auth, account, sell/consign,
loyalty and gifting are a later batch — the data contract is shaped so they are
not awkward to add.
