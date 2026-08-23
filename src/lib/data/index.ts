import { mockAdapter } from './mock'
import type { DataAdapter } from './adapter'

export * from './adapter'

/**
 * The active data adapter.
 *
 * **This is the single-file change.** To go live, write an adapter that
 * satisfies `DataAdapter` against the real endpoints and swap the assignment
 * below. Nothing else in the app moves, because nothing else in the app knows
 * which implementation it is talking to.
 *
 *   const httpAdapter: DataAdapter = { ... }
 *   export const data: DataAdapter = httpAdapter
 *
 * Server components can call these methods directly. Client components should
 * wrap them in TanStack Query rather than calling them in an effect, so caching
 * and revalidation are consistent across the app.
 */
export const data: DataAdapter = mockAdapter

/**
 * Named re-exports, so call sites read as `getProduct(slug)` rather than
 * `data.getProduct(slug)`. Bound to `data` so swapping the adapter above
 * changes these too.
 */
export const listProducts: DataAdapter['listProducts'] = (...args) => data.listProducts(...args)
export const getProduct: DataAdapter['getProduct'] = (...args) => data.getProduct(...args)
export const getProductFacets: DataAdapter['getProductFacets'] = () => data.getProductFacets()
export const listFeaturedProducts: DataAdapter['listFeaturedProducts'] = (...args) =>
  data.listFeaturedProducts(...args)
export const getPassport: DataAdapter['getPassport'] = (...args) => data.getPassport(...args)
export const getPassportByProduct: DataAdapter['getPassportByProduct'] = (...args) =>
  data.getPassportByProduct(...args)
export const getSeller: DataAdapter['getSeller'] = (...args) => data.getSeller(...args)
export const resolveCart: DataAdapter['resolveCart'] = (...args) => data.resolveCart(...args)
