'use client'
import { PageHeader } from '@kvirn-ui/patterns'
import { Breadcrumb, Container, GridItem, GridRoot, Prose } from '@kvirn-ui/react'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { SitePage } from './site-sections.ts'

/** What the shell hands the page, because both sit beside the article: the page lays them out. */
export interface DocsShellParts {
  trail: readonly SitePage[]
  sidebar: ReactNode
  pager: ReactNode
}

export const DocsShellContext = createContext<DocsShellParts>({
  trail: [],
  sidebar: null,
  pager: null,
})

// The grid answers to its own width (md 48rem, lg 64rem), not the window's. The article starts
// where the page header does: column 1 without a sidebar, column 4 beside one. Its running text
// keeps the prose measure (docs.css), so the wider column without a sidebar is room for examples.
const sidebarClasses = (hasContents: boolean) =>
  [
    'kv-grid-item--md-span-4',
    hasContents ? 'kv-grid-item--md-row-span-2' : undefined,
    'kv-grid-item--lg-span-3 kv-grid-item--lg-row-span-1',
  ]
    .filter(Boolean)
    .join(' ')

const contentsClasses = (hasSidebar: boolean) =>
  (hasSidebar
    ? [
        'kv-grid-item--md-start-5 kv-grid-item--md-span-8',
        'kv-grid-item--lg-start-11 kv-grid-item--lg-span-2 kv-grid-item--lg-row-start-1',
      ]
    : [
        'kv-grid-item--md-span-12',
        'kv-grid-item--lg-start-10 kv-grid-item--lg-span-3 kv-grid-item--lg-row-start-1',
      ]
  ).join(' ')

// The article's column, shared by the pager so it sits under the article, not under a side column.
const contentColumnClasses = (hasSidebar: boolean) =>
  hasSidebar
    ? 'kv-grid-item--md-start-5 kv-grid-item--md-span-8 kv-grid-item--lg-start-4 kv-grid-item--lg-span-7'
    : 'kv-grid-item--md-span-12 kv-grid-item--lg-span-9'

const articleClasses = (hasSidebar: boolean) =>
  `docs-article ${contentColumnClasses(hasSidebar)} kv-grid-item--lg-row-start-1`

/**
 * An article page of the docs: the intro band at the full width of `main` (breadcrumb, `h1`,
 * lead, facts), then the sidebar where the section has one, the contents and the article, then the
 * pager. The contents come before the article, so they are read and tabbed to first; from the
 * grid's 64rem they are a column after it. `facts` are `DefinitionList.Row`s.
 */
export function DocsPage({
  title,
  lead,
  facts,
  afterFacts,
  contents,
  children,
}: {
  title: string
  lead?: string | undefined
  facts?: ReactNode
  afterFacts?: ReactNode
  contents?: ReactNode
  children?: ReactNode
}) {
  const { trail, sidebar, pager } = useContext(DocsShellContext)
  const hasSidebar = sidebar !== null && sidebar !== undefined
  const hasContents = contents !== null && contents !== undefined
  return (
    <>
      <PageHeader.Root>
        {trail.length < 2 ? null : (
          <Breadcrumb.Root>
            <Breadcrumb.List>
              {trail.map((page, index) => (
                <Breadcrumb.Item key={page.href}>
                  {index === trail.length - 1 ? (
                    <Breadcrumb.Current>{page.label}</Breadcrumb.Current>
                  ) : (
                    <Breadcrumb.Link href={page.href}>{page.label}</Breadcrumb.Link>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb.List>
          </Breadcrumb.Root>
        )}
        <PageHeader.Title>{title}</PageHeader.Title>
        {lead === undefined ? null : <PageHeader.Lead>{lead}</PageHeader.Lead>}
        {facts === undefined ? null : <PageHeader.Facts>{facts}</PageHeader.Facts>}
        {afterFacts}
      </PageHeader.Root>
      <Container className="docs-body">
        <GridRoot className="kv-grid--gap-12 kv-grid--md-cols-12">
          {hasSidebar ? (
            <GridItem className={sidebarClasses(hasContents)}>{sidebar}</GridItem>
          ) : null}
          {hasContents ? (
            <GridItem className={contentsClasses(hasSidebar)}>{contents}</GridItem>
          ) : null}
          <Prose as="article" className={articleClasses(hasSidebar)}>
            {children}
          </Prose>
          <GridItem className={contentColumnClasses(hasSidebar)}>{pager}</GridItem>
        </GridRoot>
      </Container>
    </>
  )
}
