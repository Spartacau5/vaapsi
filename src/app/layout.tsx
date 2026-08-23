import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme'
import { fontVariables } from '@/components/theme/fonts'
import { DEFAULT_THEME } from '@/components/theme/presets'
import { common } from '@/content'
import './globals.css'

export const metadata: Metadata = {
  title: common.meta.title,
  description: common.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * `data-theme` and `data-font` are rendered server-side at their defaults, so
   * the first paint is already correct and there is no flash. ThemeProvider only
   * takes over if a `?t=` link asks for something else.
   *
   * All seven font variables land on <html> via className. The two semantic
   * slots — --font-display and --font-body — are assigned in tokens.css by the
   * `data-font` attribute, never here.
   */
  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme={DEFAULT_THEME.colorPreset}
      data-font={DEFAULT_THEME.fontPreset}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
