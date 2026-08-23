import type { Config } from 'tailwindcss'

/**
 * Every value here resolves to a CSS custom property defined in
 * src/styles/tokens.css. Nothing in this file is a literal.
 *
 * That is the whole trick: `bg-background`, `text-ink`, `border-line` and
 * `font-display` are stable class names whose meaning is decided at runtime by
 * whichever preset is on <html>. Components never learn what colour they are.
 */

/** Wrap a bare HSL triplet token so Tailwind's opacity modifiers still work. */
const hsl = (token: string) => `hsl(var(--${token}) / <alpha-value>)`

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ---- Vaapsi semantic slots
        background: hsl('background'),
        surface: {
          DEFAULT: hsl('surface'),
          raised: hsl('surface-raised'),
        },
        ink: {
          DEFAULT: hsl('ink'),
          muted: hsl('ink-muted'),
          subtle: hsl('ink-subtle'),
        },
        line: {
          DEFAULT: hsl('line'),
          strong: hsl('line-strong'),
        },
        accent: {
          DEFAULT: hsl('accent'),
          ink: hsl('accent-ink'),
          foreground: hsl('accent-foreground'),
        },

        // ---- shadcn required set, so generated primitives theme themselves
        foreground: hsl('foreground'),
        card: { DEFAULT: hsl('card'), foreground: hsl('card-foreground') },
        popover: { DEFAULT: hsl('popover'), foreground: hsl('popover-foreground') },
        primary: { DEFAULT: hsl('primary'), foreground: hsl('primary-foreground') },
        secondary: { DEFAULT: hsl('secondary'), foreground: hsl('secondary-foreground') },
        muted: { DEFAULT: hsl('muted'), foreground: hsl('muted-foreground') },
        destructive: { DEFAULT: hsl('destructive'), foreground: hsl('destructive-foreground') },
        border: hsl('border'),
        input: hsl('input'),
        ring: hsl('ring'),
      },

      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },

      // Named to avoid colliding with the fontFamily keys above — Tailwind
      // generates both as `font-*`, so `font-display` cannot mean two things.
      fontWeight: {
        regular: 'var(--weight-body)',
        emphasis: 'var(--weight-emphasis)',
        heading: 'var(--weight-display)',
      },

      // Each size ships with its own tracking and leading, so `text-4xl` is a
      // complete typographic decision rather than a size that still needs two
      // more classes to look right.
      fontSize: {
        xs: ['var(--text-xs)', { letterSpacing: 'var(--tracking-xs)', lineHeight: '1.45' }],
        sm: ['var(--text-sm)', { letterSpacing: 'var(--tracking-sm)', lineHeight: '1.5' }],
        base: [
          'var(--text-base)',
          { letterSpacing: 'var(--tracking-base)', lineHeight: 'var(--leading-normal)' },
        ],
        lg: [
          'var(--text-lg)',
          { letterSpacing: 'var(--tracking-lg)', lineHeight: 'var(--leading-snug)' },
        ],
        xl: [
          'var(--text-xl)',
          { letterSpacing: 'var(--tracking-xl)', lineHeight: 'var(--leading-snug)' },
        ],
        '2xl': [
          'var(--text-2xl)',
          { letterSpacing: 'var(--tracking-2xl)', lineHeight: 'var(--leading-snug)' },
        ],
        '3xl': [
          'var(--text-3xl)',
          { letterSpacing: 'var(--tracking-3xl)', lineHeight: 'var(--leading-tight)' },
        ],
        '4xl': [
          'var(--text-4xl)',
          { letterSpacing: 'var(--tracking-4xl)', lineHeight: 'var(--leading-tight)' },
        ],
        '5xl': [
          'var(--text-5xl)',
          { letterSpacing: 'var(--tracking-5xl)', lineHeight: 'var(--leading-none)' },
        ],
        '6xl': [
          'var(--text-6xl)',
          { letterSpacing: 'var(--tracking-6xl)', lineHeight: 'var(--leading-none)' },
        ],
      },

      letterSpacing: {
        caps: 'var(--tracking-caps)',
        tight: 'var(--tracking-3xl)',
        normal: 'var(--tracking-base)',
      },

      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
      },

      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
        32: 'var(--space-32)',
        40: 'var(--space-40)',
        48: 'var(--space-48)',
        gutter: 'var(--gutter)',
      },

      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        none: 'var(--elevation-none)',
        overlay: 'var(--elevation-overlay)',
        sheet: 'var(--elevation-sheet)',
      },

      // DEFAULT means a bare `transition` already uses the house curve.
      transitionTimingFunction: {
        DEFAULT: 'var(--ease)',
        exit: 'var(--ease-exit)',
      },

      transitionDuration: {
        DEFAULT: 'var(--duration-base)',
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      maxWidth: {
        measure: 'var(--measure)',
        'measure-narrow': 'var(--measure-narrow)',
        container: 'var(--container-max)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
