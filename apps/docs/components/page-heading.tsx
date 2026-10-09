import { Heading } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

export function PageHeading({
  children,
  size,
}: {
  children: ReactNode
  size?: 'display' | undefined
}) {
  return (
    <Heading as="h1" size={size}>
      {children}
    </Heading>
  )
}
