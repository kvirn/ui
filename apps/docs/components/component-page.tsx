import { Badge } from '@kvirn-ui/react'
import type { BadgeVariant } from '@kvirn-ui/react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { hasContent, PageContents, SectionHeading } from './page-contents.tsx'
import type { PageSection } from './page-contents.tsx'
import { PageHeading } from './page-heading.tsx'

const text = messages.docs.status
const template = messages.docs.template

/** The roadmap's words (docs/roadmap.md): `alpha` means the gates and the independent review passed. */
export type ComponentStatus =
  | 'planned'
  | 'in-progress'
  | 'alpha-candidate'
  | 'alpha'
  | 'beta'
  | 'stable'

const statusLabels: Record<ComponentStatus, string> = {
  planned: text.planned,
  'in-progress': text.inProgress,
  'alpha-candidate': text.alphaCandidate,
  alpha: text.alpha,
  beta: text.beta,
  stable: text.stable,
}

const statusTexts: Record<ComponentStatus, string> = {
  planned: text.plannedText,
  'in-progress': text.inProgressText,
  'alpha-candidate': text.alphaCandidateText,
  alpha: text.alphaText,
  beta: text.betaText,
  stable: text.stableText,
}

const statusVariants: Record<ComponentStatus, BadgeVariant> = {
  planned: 'neutral',
  'in-progress': 'info',
  'alpha-candidate': 'warning',
  alpha: 'primary',
  beta: 'primary',
  stable: 'success',
}

/** The status in words, never colour alone: the Badge carries the word, the sentence says what it means. */
export function StatusLine({ status }: { status: ComponentStatus }) {
  return (
    <p className="docs-status">
      {text.label}: <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>.{' '}
      {statusTexts[status]}
    </p>
  )
}

export interface ComponentPageProps {
  /** The `h1`: the component's name. */
  title: string
  /** What it is and what it does for the user, one or two sentences. */
  lead: string
  status: ComponentStatus
  /** When, where and when not: the content of the "When to use it" section. */
  whenToUse?: ReactNode
  /** The component alone, usually an `ExampleFrame` with `headingId="example"`. */
  example?: ReactNode
  /** `UseCase` blocks, most common first. */
  useCases?: ReactNode
  /** Accessibility, Keyboard and Announcements, which bring their own `h2`s. */
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
  const own = (id: string, label: string, content: ReactNode): PagePart[] => {
    if (!hasContent(content)) {
      return []
    }
    const section = { id, label }
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
    ...own('use-cases', template.useCases, useCases),
    ...(hasContent(contract)
      ? [{ sections: contractSections, node: <Fragment key="contract">{contract}</Fragment> }]
      : []),
    ...own('api', template.api, api),
  ]
}

/**
 * The component page template: name, lead, status and contents, then the fixed order of
 * sections. A section with no content is not rendered.
 */
export function ComponentPage(props: ComponentPageProps) {
  const parts = pageParts(props)
  return (
    <>
      <PageHeading>{props.title}</PageHeading>
      <p className="kv-lead">{props.lead}</p>
      <StatusLine status={props.status} />
      <PageContents sections={parts.flatMap((part) => [...part.sections])} />
      {parts.map((part) => part.node)}
    </>
  )
}
