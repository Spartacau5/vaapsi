import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/**
 * The Phase 1 acceptance criterion, made executable.
 *
 * "grep for hex codes and font-family outside tokens.css returns nothing" is
 * only true on the day someone runs the grep. As a test it stays true, and CI
 * catches the first component that hardcodes a colour instead of reaching for a
 * token — which is the moment the whole theme system starts to rot.
 */

const ROOT = join(__dirname, '..', '..', '..')
const SRC = join(ROOT, 'src')

/** The one file allowed to hold colour literals and font-family declarations. */
const TOKENS_FILE = join('src', 'styles', 'tokens.css').split(sep).join('/')

const SCANNED_EXTENSIONS = ['.ts', '.tsx', '.css']

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return SCANNED_EXTENSIONS.some((ext) => entry.endsWith(ext)) ? [full] : []
  })
}

function scannedFiles(): { path: string; source: string }[] {
  return [...walk(SRC), join(ROOT, 'tailwind.config.ts')]
    .map((path) => ({
      path: relative(ROOT, path).split(sep).join('/'),
      source: readFileSync(path, 'utf8'),
    }))
    .filter((file) => file.path !== TOKENS_FILE)
    .filter((file) => !file.path.includes('__tests__'))
}

/** Strip comments so a hex code mentioned in prose is not a failure. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const HEX_COLOR = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/
const FONT_FAMILY = /font-family\s*:/
// A raw colour function with literal channel values, e.g. rgb(144 0 0) or
// hsl(0 100% 28%). `hsl(var(--token))` is the sanctioned form and passes.
const LITERAL_COLOR_FN = /\b(?:rgba?|hsla?|oklch|lab|color-mix)\(\s*(?!var\()[^)]*\d/

describe('token hygiene', () => {
  const files = scannedFiles()

  it('scans a non-trivial number of files', () => {
    // Guards against the walk silently returning nothing and the suite passing
    // for the wrong reason.
    expect(files.length).toBeGreaterThan(15)
  })

  it('has no hex colour outside tokens.css', () => {
    const offenders = files
      // `content/` is copy, never applied as CSS. Naming the accent in prose —
      // "the accent is #900000" — is documentation, not a hardcoded style.
      .filter((file) => !file.path.startsWith('src/content/'))
      .filter((file) => HEX_COLOR.test(stripComments(file.source)))
      .map((file) => file.path)
    expect(offenders).toEqual([])
  })

  it('has no font-family declaration outside tokens.css', () => {
    const offenders = files
      .filter((file) => FONT_FAMILY.test(stripComments(file.source)))
      .map((file) => file.path)
    expect(offenders).toEqual([])
  })

  it('has no literal colour function outside tokens.css', () => {
    const offenders = files
      .filter((file) => LITERAL_COLOR_FN.test(stripComments(file.source)))
      .map((file) => file.path)
    expect(offenders).toEqual([])
  })
})

describe('tokens.css completeness', () => {
  const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8')

  it('defines every Vaapsi colour slot', () => {
    for (const slot of [
      'background',
      'surface',
      'surface-raised',
      'ink',
      'ink-muted',
      'ink-subtle',
      'line',
      'line-strong',
      'accent',
      'accent-ink',
    ]) {
      expect(tokens).toContain(`--${slot}:`)
    }
  })

  it('defines the shadcn required set, so primitives inherit for free', () => {
    for (const slot of [
      'foreground',
      'card',
      'card-foreground',
      'popover',
      'popover-foreground',
      'primary',
      'primary-foreground',
      'secondary',
      'secondary-foreground',
      'muted',
      'muted-foreground',
      'accent-foreground',
      'destructive',
      'destructive-foreground',
      'border',
      'input',
      'ring',
      'radius',
    ]) {
      expect(tokens).toContain(`--${slot}:`)
    }
  })

  it('defines the full type scale', () => {
    for (const step of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']) {
      expect(tokens).toContain(`--text-${step}:`)
      expect(tokens).toContain(`--tracking-${step}:`)
    }
  })

  it('defines semantic weight tokens so a preset can shift them', () => {
    for (const weight of ['body', 'emphasis', 'display']) {
      expect(tokens).toContain(`--weight-${weight}:`)
    }
  })

  it('gives every colour preset a block', () => {
    for (const preset of ['mono', 'inverse']) {
      expect(tokens).toContain(`[data-theme='${preset}']`)
    }
  })

  it('gives every font preset a block that sets both semantic slots', () => {
    for (const preset of ['modernist', 'didone', 'grotesk', 'editorial', 'heritage']) {
      const block = tokens.split(`[data-font='${preset}']`)[1]?.split('}')[0]
      expect(block).toBeDefined()
      expect(block).toContain('--font-display:')
      expect(block).toContain('--font-body:')
    }
  })

  it('uses one motion curve, not several', () => {
    const curves = tokens.match(/cubic-bezier\([^)]*\)/g) ?? []
    // Exactly two: the house curve, and the exit variant of it.
    expect(curves).toHaveLength(2)
  })

  it('keeps radius near-square by default', () => {
    expect(tokens).toContain('--radius: var(--radius-sm)')
  })
})
