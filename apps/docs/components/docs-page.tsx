'use client'
import { PageHeader } from '@kvirn-ui/patterns'
import { Breadcrumb, Prose } from '@kvirn-ui/react'
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

/**
 * An article page of the docs: the intro band at the full width of `main` (breadcrumb, `h1`,
 * lead, facts), then the sidebar where the section has one beside the article, then the pager.
 * `facts` are `DefinitionList.Row`s.
 */
export function DocsPage({
  title,
  lead,
  facts,
  afterFacts,
  children,
}: {
  title: string
  lead?: string | undefined
  facts?: ReactNode
  afterFacts?: ReactNode
  children?: ReactNode
}) {
  const { trail, sidebar, pager } = useContext(DocsShellContext)
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
      <div className="docs-body">
        <div className="docs-columns">
          {sidebar}
          <Prose as="article" className="docs-article">
            {children}
          </Prose>
        </div>
        {pager}
      </div>
    </>
  )
}
