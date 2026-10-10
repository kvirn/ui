'use client'

import { Container, Section, mergeProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement } from 'react'

export type SiteFooterRootProps = ComponentPropsWithRef<'footer'>
export type SiteFooterOrganisationProps = ComponentPropsWithRef<'p'>

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}

/**
 * The `contentinfo` landmark: a surface `<footer class="kv-section">` with its content inside a
 * `Container`. DOM order is reading and focus order. Put the columns of shipped parts in it
 * (`Columns`, `SummaryList`, `Address`, a `nav` around a `Heading` and a `List`), then a
 * `SiteFooter.Organisation`. Contract: site-footer.a11y.md.
 */
export function SiteFooterRoot({
  children,
  className,
  ...otherProps
}: SiteFooterRootProps): ReactElement {
  return (
    <Section as="footer" className={joinClassNames('kv-site-footer', className)} {...otherProps}>
      <Container>{children}</Container>
    </Section>
  )
}
SiteFooterRoot.displayName = 'SiteFooter.Root'

/** The organisation's name and address as one line of text, under the groups. */
export function SiteFooterOrganisation(props: SiteFooterOrganisationProps): ReactElement {
  return <p {...mergeProps(props, { className: 'kv-site-footer-organisation' })} />
}
SiteFooterOrganisation.displayName = 'SiteFooter.Organisation'

export const SiteFooter = {
  Root: SiteFooterRoot,
  Organisation: SiteFooterOrganisation,
} as const
