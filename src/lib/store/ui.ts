import { create } from 'zustand'

/**
 * Ephemeral interface state. Not data, not persisted, not shared with the server.
 *
 * The rule for this store: if it would still matter after a refresh, it does not
 * belong here. Filter state goes in the URL (Phase 4). Cart contents come from
 * the data adapter (Phase 6). What lives here is which drawer is open.
 */

type UiState = {
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void

  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  /**
   * Cart line count, for the header badge.
   *
   * Phase 2 placeholder. Phase 6 replaces this with a selector over the real
   * cart from `lib/data`, at which point this field is deleted — it exists so
   * the header is built against a count that can change, rather than a literal
   * zero that will need rewiring.
   */
  cartCount: number
  setCartCount: (count: number) => void
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  cartCount: 0,
  setCartCount: (cartCount) => set({ cartCount }),
}))
