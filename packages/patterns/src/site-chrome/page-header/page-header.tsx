import { Container, DefinitionList, Heading, mergeProps } from '@kvirn-ui/react'
import type { DefinitionListRootProps, HeadingProps } from '@kvirn-ui/react'
import type { ComponentPropsWithRef, ReactElement } from 'react'

export type PageHeaderRootProps = ComponentPropsWithRef<'div'>
export type PageHeaderTitleProps = Omit<HeadingProps, 'as' | 'size'>
export type PageHeaderLeadProps = ComponentPropsWithRef<'p'>
/** Write `DefinitionList.Row`s: a `Term` and a `Description` each. */
export type PageHeaderFactsProps = DefinitionListRootProps

/**
 * The top of a page's `main`: a full-width band with a `Container` inside. Write the `Breadcrumb`,
 * `PageHeader.Title`, `PageHeader.Lead` and `PageHeader.Facts` in that order, which is reading
 * and focus order. No landmark of its own. Contract: page-header.a11y.md.
 */
export function PageHeaderRoot({ children, ...otherProps }: PageHeaderRootProps): ReactElement {
  return (
    <div {...mergeProps(otherProps, { className: 'kv-page-header' })}>
      <Container className="kv-page-header-inner">{children}</Container>
    </div>
  )
}
PageHeaderRoot.displayName = 'PageHeader.Root'

/** The page's one `h1`, at the `display` size. */
export function PageHeaderTitle(props: PageHeaderTitleProps): ReactElement {
  return <Heading as="h1" size="display" {...props} />
}
PageHeaderTitle.displayName = 'PageHeader.Title'

/** One or two sentences under the title, at most 60 characters wide. */
export function PageHeaderLead(props: PageHeaderLeadProps): ReactElement {
  return <p {...mergeProps(props, { className: 'kv-lead' })} />
}
PageHeaderLead.displayName = 'PageHeader.Lead'

/** Facts about the page as a definition list: a wrapping row from 40rem, stacked below. */
export function PageHeaderFacts(props: PageHeaderFactsProps): ReactElement {
  return <DefinitionList.Root {...mergeProps(props, { className: 'kv-page-header-facts' })} />
}
PageHeaderFacts.displayName = 'PageHeader.Facts'

export const PageHeader = {
  Root: PageHeaderRoot,
  Title: PageHeaderTitle,
  Lead: PageHeaderLead,
  Facts: PageHeaderFacts,
} as const
