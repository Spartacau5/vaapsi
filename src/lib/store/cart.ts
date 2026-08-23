import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItemRef } from '@/lib/data'
import type { ProductId } from '@/lib/types'

/**
 * The cart, persisted to localStorage.
 *
 * **It holds product IDs and added-at timestamps. Nothing else.**
 *
 * Not prices: a cart that remembers a price shows the old one after a
 * repricing, and the shopper finds out at checkout. Not availability: a cart
 * that remembers "available" will happily let two people buy the same garment.
 * Not titles or images either, because then a renamed garment has two names.
 *
 * Everything else is resolved through `resolveCart` on every read. That is the
 * whole design, and it is the reason this file is thirty lines instead of three
 * hundred.
 *
 * **There is no quantity.** Every garment is one-of-one, so membership is a set
 * and `add` is idempotent. If a `quantity` field ever appears here, something
 * upstream has started treating garments as SKUs.
 */

type CartState = {
  items: readonly CartItemRef[]
  /** True once the persisted value has been read. Guards the first render. */
  hydrated: boolean

  add: (productId: ProductId) => void
  remove: (productId: ProductId) => void
  clear: () => void
  has: (productId: ProductId) => boolean
}

export const CART_STORAGE_KEY = 'vaapsi.cart.v1'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      add: (productId) =>
        set((state) => {
          // Idempotent. There is only one of these, so adding twice is a no-op
          // rather than an error or a second line.
          if (state.items.some((item) => item.productId === productId)) return state
          return {
            items: [...state.items, { productId, addedAt: new Date().toISOString() }],
          }
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      clear: () => set({ items: [] }),

      has: (productId) => get().items.some((item) => item.productId === productId),
    }),
    {
      name: CART_STORAGE_KEY,
      // Only the membership list is persisted. `hydrated` is runtime state.
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

/*
 * The hydration flag matters more than it looks. Without it the header badge and
 * the cart page render an empty state from the pre-hydration store and then
 * flash to three items a frame later. Rendering nothing until hydrated is the
 * correct first frame.
 *
 * On the server rehydration never runs, so the flag is set immediately there —
 * otherwise every server-rendered cart surface would be stuck in its loading
 * state forever.
 */
if (typeof window === 'undefined') {
  useCartStore.setState({ hydrated: true })
} else {
  useCartStore.persist.onFinishHydration(() => useCartStore.setState({ hydrated: true }))
  // `onFinishHydration` does not fire if rehydration already completed before
  // this line ran, which happens when the module is imported late.
  if (useCartStore.persist.hasHydrated()) useCartStore.setState({ hydrated: true })
}
