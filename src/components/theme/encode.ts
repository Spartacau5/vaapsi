import { DEFAULT_THEME, isColorPreset, isFontPreset } from './presets'
import type { ThemeConfig } from './presets'

/**
 * Theme config ⇄ shareable URL token.
 *
 * The Phase 8 studio panel needs a client to be able to send a link that opens
 * the site in the exact configuration they were looking at. There is no
 * database behind that and there does not need to be one: the whole config is
 * two enum values, so it fits in a query parameter.
 *
 * Encoded as compact base64url in `?t=`. Compact matters — a URL a client will
 * paste into an email should not wrap.
 *
 * The encoding is versioned. When a third axis is added, bump `VERSION` and
 * teach `decodeTheme` to read the old form, so links already sent out keep
 * working. Links from a client that has moved on to a newer front end are the
 * exact failure mode this parameter exists to prevent.
 */

export const THEME_QUERY_PARAM = 't'

const VERSION = 1
const SEPARATOR = '.'

function toBase64Url(input: string): string {
  const base64 =
    typeof globalThis.btoa === 'function'
      ? globalThis.btoa(input)
      : Buffer.from(input, 'utf8').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string | null {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  try {
    return typeof globalThis.atob === 'function'
      ? globalThis.atob(padded)
      : Buffer.from(padded, 'base64').toString('utf8')
  } catch {
    return null
  }
}

/** `{ colorPreset: 'inverse', fontPreset: 'didone' }` → `MS5pbnZlcnNlLmRpZG9uZQ`. */
export function encodeTheme(config: ThemeConfig): string {
  return toBase64Url([VERSION, config.colorPreset, config.fontPreset].join(SEPARATOR))
}

/**
 * Read a token back.
 *
 * Never throws and never partially applies. A token that is malformed, from a
 * future version, or naming a preset that no longer exists returns null, and
 * the caller falls back to the default theme. A half-applied theme from a stale
 * link looks like a bug to whoever opened it.
 */
export function decodeTheme(token: string | null | undefined): ThemeConfig | null {
  if (token === null || token === undefined || token === '') return null

  const decoded = fromBase64Url(token)
  if (decoded === null) return null

  const parts = decoded.split(SEPARATOR)
  if (parts.length !== 3) return null

  const [version, colorPreset, fontPreset] = parts
  if (Number(version) !== VERSION) return null
  if (!isColorPreset(colorPreset) || !isFontPreset(fontPreset)) return null

  return { colorPreset, fontPreset }
}

/** Decode, falling back to the default. Convenient for render paths. */
export function decodeThemeOrDefault(token: string | null | undefined): ThemeConfig {
  return decodeTheme(token) ?? { ...DEFAULT_THEME }
}

/**
 * Read the theme token out of a URL or a query string. Accepts a full URL, a
 * search string, or a `URLSearchParams`.
 */
export function readThemeToken(source: string | URLSearchParams): string | null {
  if (source instanceof URLSearchParams) return source.get(THEME_QUERY_PARAM)
  const queryStart = source.indexOf('?')
  const search = queryStart === -1 ? source : source.slice(queryStart)
  return new URLSearchParams(search).get(THEME_QUERY_PARAM)
}

/** Add or replace `?t=` on a URL, preserving everything else about it. */
export function withThemeToken(url: string, config: ThemeConfig): string {
  const [base = '', query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  params.set(THEME_QUERY_PARAM, encodeTheme(config))
  return `${base}?${params.toString()}`
}
