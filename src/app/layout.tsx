import type { Metadata } from 'next'
import { common } from '@/content'
import './globals.css'

export const metadata: Metadata = {
  title: common.meta.title,
  description: common.meta.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No fonts and no theme attribute yet — both arrive with the token system in
  // Phase 1, applied here at the root.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
