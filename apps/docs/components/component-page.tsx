import { DefinitionListDescription, DefinitionListRow, DefinitionListTerm } from '@kvirn-ui/react'
import { Children, Fragment, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { hasContent, PageContents, SectionHeading } from './page-contents.tsx'
import type { PageSection } from './page-contents.tsx'
import { DocsPage } from './docs-page.tsx'
import {
  ContractKnownIssues,
  ContractTesting,
  knownIssuesHeadings,
} from './contract-sections-view.tsx'
import type { ContractNotes } from './contract-sections-view.tsx'
import { componentPages } from './site-sections.ts'
import { UseCase } from './use-case.tsx'
import type { Contract, TestTier } from '../lib/contract-parser.ts'

const template = messages.docs.template
const contractText = messages.docs.contract
const factText = messages.docs.facts

export interface ComponentPageProps {
  /** The `h1`: the component's name. */
  title: string
  /** The rest of the lead: its first sentence is the page's `summary` in `site-sections.ts`. */
  lead?: string
  /** The package to install and import from. Default: `@kvirn-ui/react`. */
  packageName?: string
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
    ...knownIssuesPart(contract),
    ...testingPart(contract),
  ]
}

/** The page passes its `Contract` (and notes) to the sections view in `contract`: Known issues and Testing are read from there. */
function knownIssuesPart(node: ReactNode): PagePart[] {
  for (const child of Children.toArray(node)) {
    if (isValidElement<{ contract?: Contract; notes?: ContractNotes }>(child)) {
      const { contract, notes } = child.props
      if (contract !== undefined && contract.knownIssues.length > 0) {
        return [
          {
            sections: [
              {
                id: 'known-issues',
                label: contractText.sections.knownIssues,
                children: knownIssuesHeadings(contract),
              },
            ],
            node: (
              <ContractKnownIssues key="known-issues" contract={contract} notes={notes ?? {}} />
            ),
          },
        ]
      }
    }
  }
  return []
}

function testingPart(node: ReactNode): PagePart[] {
  for (const child of Children.toArray(node)) {
    if (isValidElement<{ contract?: Contract; notes?: ContractNotes }>(child)) {
      const { contract, notes } = child.props
      if (contract?.accessibility.some((section) => section.id === 'testing')) {
        return [
          {
            sections: [{ id: 'testing', label: contractText.sections.testing }],
            node: <ContractTesting key="testing" contract={contract} notes={notes ?? {}} />,
          },
        ]
      }
    }
  }
  return []
}

/** The page passes its `Contract` to the sections view in `contract`: the status is read from there. */
function statusOf(node: ReactNode): Contract['status'] | undefined {
  for (const child of Children.toArray(node)) {
    if (isValidElement<{ contract?: Partial<Contract> }>(child)) {
      const status = child.props.contract?.status
      if (status !== undefined) {
        return status
      }
    }
  }
  return undefined
}

const tierOrder: readonly TestTier[] = ['automated', 'core', 'release']

function testingSummary(status: Contract['status']) {
  const counts = tierOrder
    .filter(
      (tier) =>
        tier !== 'automated' || (status.counts.automated.total > 0 && status.word !== 'Automated'),
    )
    .map((tier) => {
      const { done, total, notApplicable } = status.counts[tier]
      const label = factText.tiers[tier]
      return notApplicable
        ? factText.tierNotApplicable({ tier: label })
        : factText.tierProgress({ tier: label, done, total })
    })
    .join(', ')
  return factText.testingSummary({ word: status.word, counts })
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
 * The component page template: the intro band with name, lead and facts, the contents, then the
 * fixed order of sections. A section with no content is not rendered.
 */
export function ComponentPage(props: ComponentPageProps) {
  const parts = pageParts(props)
  const { packageName = '@kvirn-ui/react', pattern } = props
  const status = statusOf(props.contract)
  return (
    <DocsPage
      title={props.title}
      lead={leadText(props.title, props.lead)}
      facts={
        <>
          <Fact term={factText.package}>
            <code>{packageName}</code>
          </Fact>
          {pattern === undefined ? null : <Fact term={factText.pattern}>{pattern}</Fact>}
          {status === undefined ? null : (
            <Fact term={factText.testing}>{testingSummary(status)}</Fact>
          )}
        </>
      }
      contents={<PageContents sections={parts.flatMap((part) => [...part.sections])} />}
    >
      {parts.map((part) => part.node)}
    </DocsPage>
  )
}
