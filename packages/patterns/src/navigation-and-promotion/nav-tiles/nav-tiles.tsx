import { Card, Columns, mergeProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement, Ref } from 'react'
import { LinkedHeading } from '../linked-heading.tsx'
import type { LinkedHeadingProps } from '../linked-heading.tsx'

export interface NavTilesRootProps extends Omit<ComponentPropsWithRef<'ul'>, 'ref'> {
  ref?: Ref<HTMLElement> | undefined
}
export interface NavTilesTileProps extends Omit<ComponentPropsWithRef<'li'>, 'ref'> {
  ref?: Ref<HTMLElement> | undefined
}
export type NavTilesHeadingProps = LinkedHeadingProps
export type NavTilesTextProps = ComponentPropsWithRef<'p'>

/**
 * A list of tiles to choose a sub-topic from: a `<ul>` in as many columns as fit, one at 320px.
 * Put `NavTiles.Tile`s in it. Contract: nav-tiles.a11y.md.
 */
export function NavTilesRoot({ className, ...otherProps }: NavTilesRootProps): ReactElement {
  return (
    <Columns
      as="ul"
      minColumnWidth="md"
      gap="6"
      className={['kv-nav-tiles', className].filter(Boolean).join(' ')}
      {...otherProps}
    />
  )
}
NavTilesRoot.displayName = 'NavTiles.Root'

/** A `<li>` card, not clickable: its one link is in the heading. */
export function NavTilesTile({ children, ...otherProps }: NavTilesTileProps): ReactElement {
  return (
    <Card.Root as="li" {...mergeProps(otherProps, { className: 'kv-nav-tile' })}>
      <Card.Body className="kv-prose">{children}</Card.Body>
    </Card.Root>
  )
}
NavTilesTile.displayName = 'NavTiles.Tile'

/** The tile's heading, holding its one link: `level` is `h2` on a subpage, `h3` under a section heading. */
export function NavTilesHeading(props: NavTilesHeadingProps): ReactElement {
  return <LinkedHeading {...props} />
}
NavTilesHeading.displayName = 'NavTiles.Heading'

/** One sentence about where the link goes. */
export function NavTilesText(props: NavTilesTextProps): ReactElement {
  return <p {...props} />
}
NavTilesText.displayName = 'NavTiles.Text'

export const NavTiles = {
  Root: NavTilesRoot,
  Tile: NavTilesTile,
  Heading: NavTilesHeading,
  Text: NavTilesText,
} as const
