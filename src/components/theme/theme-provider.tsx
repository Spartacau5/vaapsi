'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { THEME_QUERY_PARAM, decodeTheme, encodeTheme } from './encode'
import { DEFAULT_THEME } from './presets'
import type { ColorPreset, FontPreset, ThemeConfig } from './presets'

/**
 * Holds the active theme and applies it to <html>.
 *
 * Application is two attributes and nothing else:
 *
 *   <html data-theme="inverse" data-font="didone">
 *
 * `styles/tokens.css` does the rest. There is no inline style, no injected
 * stylesheet, and no font loaded at runtime — all seven families are already in
 * the document courtesy of next/font in the root layout, so changing the font
 * preset only reassigns which one --font-display and --font-body point at.
 *
 * Deliberately not persisted to localStorage. The theme is a presentation
 * decision Vaapsi makes, not a shopper preference — the only way it varies is
 * through a shared `?t=` link during client review, and once a direction is
 * signed off the default in `presets.ts` changes and this becomes inert.
 */

type ThemeContextValue = ThemeConfig & {
  setColorPreset: (preset: ColorPreset) => void
  setFontPreset: (preset: FontPreset) => void
  setTheme: (config: ThemeConfig) => void
  reset: () => void
  /** The current config as a `?t=` token, for the share control in Phase 8. */
  token: string
  /** A full shareable URL for the current page. Empty during SSR. */
  shareUrl: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export type ThemeProviderProps = {
  children: React.ReactNode
  /**
   * Server-resolved initial config. Pass the decoded `?t=` value from a page or
   * layout when you have it, so the first paint is already correct.
   */
  initial?: ThemeConfig
}

export function ThemeProvider({ children, initial }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(initial ?? { ...DEFAULT_THEME })

  // Read the shared link on mount. This runs before paint via a layout-ish
  // effect ordering in practice, but the attributes are also set server-side
  // from `initial` when the caller passes it, which is the flash-free path.
  useEffect(() => {
    const fromUrl = decodeTheme(new URLSearchParams(window.location.search).get(THEME_QUERY_PARAM))
    if (fromUrl !== null) setConfig(fromUrl)
  }, [])

  // Apply to <html>. Two attributes, nothing more.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', config.colorPreset)
    root.setAttribute('data-font', config.fontPreset)
  }, [config])

  const setColorPreset = useCallback((colorPreset: ColorPreset) => {
    setConfig((current) => ({ ...current, colorPreset }))
  }, [])

  const setFontPreset = useCallback((fontPreset: FontPreset) => {
    setConfig((current) => ({ ...current, fontPreset }))
  }, [])

  const setTheme = useCallback((next: ThemeConfig) => setConfig(next), [])

  const reset = useCallback(() => setConfig({ ...DEFAULT_THEME }), [])

  const token = useMemo(() => encodeTheme(config), [config])

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(`${window.location.origin}${window.location.pathname}`)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...config,
      setColorPreset,
      setFontPreset,
      setTheme,
      reset,
      token,
      shareUrl: origin === '' ? '' : `${origin}?${THEME_QUERY_PARAM}=${token}`,
    }),
    [config, setColorPreset, setFontPreset, setTheme, reset, token, origin],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used inside a ThemeProvider.')
  }
  return context
}
