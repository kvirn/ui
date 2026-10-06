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
    <Heading level={1} size={size}>
      {children}
    </Heading>
  )
}
