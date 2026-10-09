import { Heading } from '@kvirn-ui/react'
import type { HeadingProps } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'

const text = messages.docs.contents

/**
 * A section heading with its own link, for copying a link to the section. The link sits inside
 * the heading so prose spacing (`h2 + *`) keeps working; it's named for the section, is always
 * in the tab order, and shows on hover, on focus, and always where there is no hover.
 */
export function AnchoredHeading({
  id,
  label,
  children,
  className,
  ...props
}: Omit<HeadingProps, 'id' | 'children'> & {
  id: string
  /** The plain text of the heading, for the link's name. Defaults to `children` when it's a string. */
  label?: string | undefined
  children: HeadingProps['children']
}) {
  const name = label ?? (typeof children === 'string' ? children : id)
  return (
    <Heading id={id} className={`docs-heading ${className ?? ''}`.trim()} {...props}>
      {children}
      <a className="docs-anchor" href={`#${id}`} aria-label={text.anchor({ label: name })}>
        #
      </a>
    </Heading>
  )
}
