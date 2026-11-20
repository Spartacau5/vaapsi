'use client'

import { usePathname } from 'next/navigation'

/**
 * Renders its children except on the listed routes (prefix match). Lets the
 * root layout skip a piece of site chrome, such as the footer, for a page that
 * draws its own. The children can still be server components.
 */
export function RouteGate({
  hideOn,
  children,
}: {
  hideOn: readonly string[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  if (hideOn.some((route) => pathname?.startsWith(route))) return null
  return <>{children}</>
}
