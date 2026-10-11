import { CardRoot, Columns, Heading, Link } from '@kvirn-ui/react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

export interface GalleryItem {
  href: string
  label: string
  summary: string
  /** A decorative picture inside the link. Without it the card has no picture and no empty box. */
  preview?: ReactNode | undefined
}

export interface GalleryGroup {
  id: string
  label: string
  items: readonly GalleryItem[]
}

/** The cards of one group, as a list. The page or the group heading above it names the group. */
export function GalleryCards({ items }: { items: readonly GalleryItem[] }) {
  return (
    <Columns as="ul" className="kv-columns--min-sm kv-not-prose">
      {items.map((item) => (
        <CardRoot as="li" key={item.href}>
          <Heading as="h3" size="heading-4">
            <Link href={item.href} className="docs-gallery-link">
              {item.preview === undefined || item.preview === null ? null : (
                <span className="docs-gallery-preview" aria-hidden="true">
                  {item.preview}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          </Heading>
          <p>{item.summary}</p>
        </CardRoot>
      ))}
    </Columns>
  )
}

/**
 * Groups of cards (component-gallery.md). The link in the heading holds the picture and the
 * name; the card is never itself a target. The page owns the `h1`.
 */
export function Gallery({ groups }: { groups: readonly GalleryGroup[] }) {
  return groups
    .filter((group) => group.items.length > 0)
    .map((group) => (
      <Fragment key={group.id}>
        <Heading as="h2" id={group.id}>
          {group.label}
        </Heading>
        <GalleryCards items={group.items} />
      </Fragment>
    ))
}
