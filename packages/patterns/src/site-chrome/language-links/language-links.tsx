'use client'

import { Link, Navigation } from '@kvirn-ui/react'
import type { LinkProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ElementType, ReactElement } from 'react'

export interface LanguageLinksRootProps extends Omit<
  ComponentPropsWithRef<'nav'>,
  'aria-label' | 'aria-labelledby'
> {
  /** The navigation's name, in the page's language, such as `Language`. */
  label: string
}

/**
 * `current` is `true` on the language the page is in now (`aria-current="true"`), one at most.
 * `lang` is the language of the link text when it differs from the page (3.1.2), and `hrefLang`
 * the language of the target: leave it out for a format such as Lättläst.
 */
export type LanguageLinksLinkProps<Component extends ElementType = 'a'> = LinkProps<Component>

/**
 * The same page in another language or format: a horizontal `Navigation` with its own name, no
 * select, no flags and no redirect. Put `LanguageLinks.Link`s in it, each written in its own
 * language. Contract: language-links.a11y.md.
 */
export function LanguageLinksRoot({
  label,
  className,
  children,
  ...otherProps
}: LanguageLinksRootProps): ReactElement {
  return (
    <Navigation.Root
      label={label}
      className={['kv-navigation--horizontal', 'kv-language-links', className]
        .filter(Boolean)
        .join(' ')}
      {...otherProps}
    >
      <Navigation.List>{children}</Navigation.List>
    </Navigation.Root>
  )
}
LanguageLinksRoot.displayName = 'LanguageLinks.Root'

/** A `<li>` with a `Link.Root`: a native `<a href>`, through the registered router link or `as`. */
export function LanguageLinksLink<Component extends ElementType = 'a'>(
  props: LanguageLinksLinkProps<Component>,
): ReactElement
export function LanguageLinksLink(props: LinkProps<'a'>): ReactElement {
  return (
    <Navigation.Item>
      <Link.Root {...props} />
    </Navigation.Item>
  )
}
LanguageLinksLink.displayName = 'LanguageLinks.Link'

export const LanguageLinks = {
  Root: LanguageLinksRoot,
  Link: LanguageLinksLink,
} as const
