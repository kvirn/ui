'use client'
import { Button, Icon } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

/**
 * Interim, for the Menu and the example's code bar: Disclosure supports neither a panel shown from
 * a breakpoint (disclosure.a11y.md) nor `hidden="until-found"`, so both keep this Button.
 */
export function DocsDisclosure({
  controls,
  isOpen,
  onToggle,
  className,
  children,
}: {
  controls: string
  isOpen: boolean
  onToggle: () => void
  className?: string | undefined
  children: ReactNode
}) {
  return (
    <Button
      className={className}
      aria-expanded={isOpen}
      aria-controls={controls}
      onClick={onToggle}
    >
      {children}
      <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} />
    </Button>
  )
}
