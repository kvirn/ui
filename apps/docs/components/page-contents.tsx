import { Heading, TableOfContentsRoot } from '@kvirn-ui/react'
import type { TableOfContentsEntry } from '@kvirn-ui/react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { AnchoredHeading } from './anchored-heading.tsx'
import { PageHeading } from './page-heading.tsx'

const text = messages.docs.contents

/** One more `h2` means a second page: 8 entries still fit one 320 x 640 screen (docs-component-page.md §5). */
export const maxContentsEntries = 8

export interface PageSection {
  id: string
  label: string
  /** The `h3`s under this `h2`, listed one level deeper. */
  children?: readonly PageSection[] | undefined
}

export interface PageSectionContent extends PageSection {
  content: ReactNode
}

/** Empty content means the section isn't rendered, so no heading is left without text under it. */
export const hasContent = (content: ReactNode) =>
  content !== null && content !== undefined && content !== false

const toEntries = (sections: readonly PageSection[], level: 2 | 3): TableOfContentsEntry[] =>
  sections.flatMap(({ id, label, children = [] }) => [
    { id, label, level },
    ...(level === 2 ? toEntries(children, 3) : []),
  ])

/** The page's `h2` sections (and their `h3`s) as links. The same list gives the headings their ids. */
export function PageContents({ sections }: { sections: readonly PageSection[] }) {
  if (sections.length === 0) {
    return null
  }
  if (sections.length > maxContentsEntries) {
    throw new Error(
      `A page lists at most ${maxContentsEntries} sections in its contents, got ${sections.length}. Split the page.`,
    )
  }
  return (
    <div className="docs-contents">
      <Heading as="h2" size="heading-4" id="contents-title">
        {text.heading}
      </Heading>
      {/* The offset equals where a jump lands a heading: html's scroll-padding plus the heading's scroll margin (docs.css). */}
      <TableOfContentsRoot
        aria-labelledby="contents-title"
        offset={40}
        items={toEntries(sections, 2)}
      />
    </div>
  )
}

export function SectionHeading({ section }: { section: PageSection }) {
  return (
    <AnchoredHeading as="h2" id={section.id}>
      {section.label}
    </AnchoredHeading>
  )
}

/**
 * A page of `h2` sections with its contents, for Home, Foundation and reference pages. One
 * list gives the contents and the headings, so they can't drift.
 */
export function PageWithContents({
  title,
  titleSize,
  lead,
  intro,
  sections,
}: {
  title: string
  titleSize?: 'display' | undefined
  lead: string
  intro?: ReactNode
  sections: readonly PageSectionContent[]
}) {
  const rendered = sections.filter(({ content }) => hasContent(content))
  return (
    <>
      <PageHeading size={titleSize}>{title}</PageHeading>
      <p className="kv-lead">{lead}</p>
      {intro}
      <PageContents sections={rendered} />
      {rendered.map((section) => (
        <Fragment key={section.id}>
          <SectionHeading section={section} />
          {section.content}
        </Fragment>
      ))}
    </>
  )
}
