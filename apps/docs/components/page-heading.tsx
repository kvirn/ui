import type { ReactNode } from 'react'

/**
 * The page's `h1`. `tabIndex={-1}` lets the shell move focus here after client-side
 * navigation (docs-site.md §7). It isn't operable, so it gets no focus ring.
 */
export function PageHeading({
  children,
  className = 'docs-h1',
}: {
  children: ReactNode
  className?: string | undefined
}) {
  return (
    <h1 tabIndex={-1} className={className}>
      {children}
    </h1>
  )
}
