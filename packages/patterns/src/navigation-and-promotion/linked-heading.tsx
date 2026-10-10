import { Heading, Link } from '@kvirn-ui/react'
import type { HeadingProps, LinkCurrent } from '@kvirn-ui/react'
import type { ElementType, ReactElement, ReactNode } from 'react'

export interface LinkedHeadingProps extends Omit<HeadingProps, 'as' | 'size' | 'children'> {
  /** The level the page's outline needs: `h2` on a subpage, `h3` under a section heading. */
  level?: 'h2' | 'h3' | undefined
  /** The one link the card has. It sits in the heading, so the card is never clickable. */
  href: string
  /** A router link or another component that renders an `<a href>`. */
  as?: ElementType | undefined
  current?: LinkCurrent | undefined
  /** The text is the link's accessible name (2.4.4). */
  children: ReactNode
}

/** Internal: the heading of a Nav tile. A `Heading` with one `Link.Root` inside. */
export function LinkedHeading({
  level = 'h2',
  href,
  as,
  current,
  children,
  ...headingProps
}: LinkedHeadingProps): ReactElement {
  return (
    <Heading as={level} size="heading-3" {...headingProps}>
      <Link.Root href={href} as={as} current={current}>
        {children}
      </Link.Root>
    </Heading>
  )
}
