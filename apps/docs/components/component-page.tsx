import {
  Badge,
  DefinitionListDescription,
  DefinitionListRow,
  DefinitionListTerm,
} from '@kvirn-ui/react'
import type { BadgeVariant } from '@kvirn-ui/react'
import { Children, Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { hasContent, PageContents, SectionHeading } from './page-contents.tsx'
import type { PageSection } from './page-contents.tsx'
import { DocsPage } from './docs-page.tsx'
import { componentPages } from './site-sections.ts'
import { UseCase } from './use-case.tsx'

const text = messages.docs.status
const template = messages.docs.template
const factText = messages.docs.facts

/** The roadmap's words (docs/roadmap.md): `alpha` means the gates and the independent review passed. */
export type ComponentStatus =
  | 'planned'
  | 'in-planning'
  | 'in-progress'
  | 'alpha-candidate'
  | 'alpha'
  | 'beta'
  | 'stable'

const statusLabels: Record<ComponentStatus, string> = {
  planned: text.planned,
  'in-planning': text.inPlanning,
  'in-progress': text.inProgress,
  'alpha-candidate': text.alphaCandidate,
  alpha: text.alpha,
  beta: text.beta,
  stable: text.stable,
}

const statusTexts: Record<ComponentStatus, string> = {
  planned: text.plannedText,
  'in-planning': text.inPlanningText,
  'in-progress': text.inProgressText,
  'alpha-candidate': text.alphaCandidateText,
  alpha: text.alphaText,
  beta: text.betaText,
  stable: text.stableText,
}

const statusVariants: Record<ComponentStatus, BadgeVariant> = {
  planned: 'neutral',
  'in-planning': 'warning',
  'in-progress': 'info',
  'alpha-candidate': 'warning',
  alpha: 'primary',
  beta: 'primary',
  stable: 'success',
}

export interface ComponentPageProps {
  /** The `h1`: the component's name. */
  title: string
  /** The rest of the lead: its first sentence is the page's `summary` in `site-sections.ts`. */
  lead?: string
  status: ComponentStatus
  /** The `Pattern` fact, such as "APG Tabs". The row is left out when a page gives none. */
  pattern?: string
  /** When, where and when not: the content of the "When to use it" section. */
  whenToUse?: ReactNode
  /** The component alone, usually an `ExampleFrame` with `headingId="example"`. */
  example?: ReactNode
  /** `UseCase` blocks, most common first. */
  useCases?: ReactNode
  /** Accessibility, Keyboard, Known issues and Announcements, which bring their own `h2`s. */
  contract?: ReactNode
  /** Those `h2`s, in the order `contract` renders them (`contractSectionIds`, with their labels). */
  contractSections?: readonly PageSection[]
  /** The content of the API section: an `ApiBlock`. */
  api?: ReactNode
}

interface PagePart {
  sections: readonly PageSection[]
  node: ReactNode
}

/** The `UseCase` blocks in a node, in order: each is an entry under "Use cases" in the contents. */
function collectUseCases(node: ReactNode): PageSection[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement<{ id?: string; title?: string; children?: ReactNode }>(child)) {
      return []
    }
    if (child.type === UseCase) {
      const { id, title } = child.props
      return id === undefined || title === undefined ? [] : [{ id, label: title }]
    }
    return collectUseCases(child.props.children)
  })
}

/**
 * The fixed order of the page (docs-component-page.md §2). One list gives the contents and the
 * headings, and a part without content gives neither.
 */
function pageParts({
  whenToUse,
  example,
  useCases,
  contract,
  contractSections = [],
  api,
}: ComponentPageProps): PagePart[] {
  const own = (
    id: string,
    label: string,
    content: ReactNode,
    children?: readonly PageSection[],
  ): PagePart[] => {
    if (!hasContent(content)) {
      return []
    }
    const section: PageSection = children === undefined ? { id, label } : { id, label, children }
    return [
      {
        sections: [section],
        node: (
          <Fragment key={id}>
            <SectionHeading section={section} />
            {content}
          </Fragment>
        ),
      },
    ]
  }
  return [
    ...own('when-to-use', template.whenToUse, whenToUse),
    ...own('example', template.example, example),
    ...own('use-cases', template.useCases, useCases, collectUseCases(useCases)),
    ...(hasContent(contract)
      ? [{ sections: contractSections, node: <Fragment key="contract">{contract}</Fragment> }]
      : []),
    ...own('api', template.api, api),
  ]
}

function leadText(title: string, lead: string | undefined) {
  const summary = componentPages.find((page) => page.label === title)?.summary
  return [summary, lead].filter(Boolean).join(' ')
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <DefinitionListRow>
      <DefinitionListTerm>{term}</DefinitionListTerm>
      <DefinitionListDescription>{children}</DefinitionListDescription>
    </DefinitionListRow>
  )
}

/**
 * The component page template: the intro band with name, lead, status and facts, the contents,
 * then the fixed order of sections. A section with no content is not rendered. The status is a
 * word in a Badge, never colour alone, and the sentence under the facts says what it means.
 */
export function ComponentPage(props: ComponentPageProps) {
  const parts = pageParts(props)
  const { status, pattern } = props
  return (
    <DocsPage
      title={props.title}
      lead={leadText(props.title, props.lead)}
      facts={
        <>
          <Fact term={text.label}>
            <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
          </Fact>
          {pattern === undefined ? null : <Fact term={factText.pattern}>{pattern}</Fact>}
        </>
      }
      afterFacts={status === 'stable' ? null : <p className="docs-status">{statusTexts[status]}</p>}
      contents={<PageContents sections={parts.flatMap((part) => [...part.sections])} />}
    >
      {parts.map((part) => part.node)}
    </DocsPage>
  )
}
