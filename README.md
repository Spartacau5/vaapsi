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
