import { LinkRoot } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  tableOfContentsItemAttributes,
  tableOfContentsLinkAttributes,
  tableOfContentsLinkRows,
  tableOfContentsListAttributes,
  tableOfContentsListRows,
  tableOfContentsRootAttributes,
  tableOfContentsRootRows,
  useTableOfContentsHook,
} from '../content/table-of-contents.api.ts'
import { DefaultTableOfContents } from '../examples/table-of-contents/default.tsx'
import { NoVisibleTitle } from '../examples/table-of-contents/no-visible-title.tsx'
import { OwnMarkup } from '../examples/table-of-contents/own-markup.tsx'
import { TwoLevels } from '../examples/table-of-contents/two-levels.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TableOfContentsExampleSources = Record<
  'default' | 'two-levels' | 'own-markup' | 'no-visible-title',
  string
>

const stickyHeaderCode = `html { scroll-padding-top: 64px; }

<TableOfContents.Root offset={64} aria-labelledby={titleId} items={items} />`

const parts: ApiPart[] = [
  {
    name: 'TableOfContents.Root',
    renders: (
      <>
        <code>&lt;nav&gt;</code>, the <code>navigation</code> landmark, around the nested list of
        headings drawn from <code>items</code>. It renders nothing when <code>items</code> is empty.
        It takes every attribute of a <code>&lt;nav&gt;</code> and passes <code>ref</code> to it.
        The default theme is described on <LinkRoot href="/foundation/theming">Theming</LinkRoot>.
      </>
    ),
    props: tableOfContentsRootRows,
    attributes: tableOfContentsRootAttributes,
  },
  {
    name: 'TableOfContents.List',
    renders: (
      <>
        <code>&lt;ul&gt;</code> with the role <code>list</code>. Put another one inside a{' '}
        <code>TableOfContents.Item</code> for a nested level.
      </>
    ),
    props: tableOfContentsListRows,
    attributes: tableOfContentsListAttributes,
  },
  {
    name: 'TableOfContents.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>. It holds a{' '}
        <code>TableOfContents.Link</code> and, optionally, a nested list.
      </>
    ),
    attributes: tableOfContentsItemAttributes,
  },
  {
    name: 'TableOfContents.Link',
    renders: (
      <>
        <code>&lt;a href=&quot;#id&quot;&gt;</code> with the role <code>link</code>. It is always a
        plain hash link, never your router’s link, so it works before the script has run.
      </>
    ),
    props: tableOfContentsLinkRows,
    attributes: tableOfContentsLinkAttributes,
  },
]

export function TableOfContentsPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TableOfContentsExampleSources
}) {
  return (
    <ComponentPage
      title="TableOfContents"
      lead="It never scrolls by itself, never moves focus and announces nothing."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it on a long page with several sections, such as a guide, a policy or a reference,
            so people can see the outline and jump to a section.
          </li>
          <li>
            Put it near the top of the page, or in a column beside the text on wide screens, and
            give it a visible title.
          </li>
          <li>
            Not for a short page: a few sections need no list. Not for moving between pages: use{' '}
            <LinkRoot href="/components/navigation">Navigation</LinkRoot>.
          </li>
          <li>
            Not for switching content on one page: use{' '}
            <LinkRoot href="/components/tabs">Tabs</LinkRoot>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTableOfContents />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="two-levels"
            title="Sections and the parts under them"
            why="A long page has h2 sections with h3 parts. A deeper level nests under the entry above it, as a native nested list, so a screen reader announces the depth. Only the order of the levels matters."
            code={sources['two-levels']}
            propsUsed={[{ part: 'TableOfContents.Root', prop: 'items' }]}
            note={
              <Note kind="reminder">
                Every id in the list must be on a heading of the page, and the order must be the
                page’s order. A missing one warns in development and its link goes nowhere. See{' '}
                <LinkRoot href="#what-you-need-to-do">What you need to do</LinkRoot>.
              </Note>
            }
          >
            <TwoLevels />
          </UseCase>
          <UseCase
            id="own-markup"
            title="Drawing the list your own way"
            why="Pass a function as the child to get the nested entries and the current id, and draw the list yourself with the parts. Use it to add something next to the links, or to show only the top level."
            code={sources['own-markup']}
            propsUsed={[
              { part: 'TableOfContents.Root', prop: 'children' },
              { part: 'TableOfContents.Link', prop: 'item' },
            ]}
          >
            <OwnMarkup />
          </UseCase>
          <UseCase
            id="no-visible-title"
            title="A name without a visible title"
            why="Prefer a visible title and aria-labelledby. Where the page has no room for one, the landmark takes its name from the message tableOfContents.label, which you can change for this list only with messages."
            code={sources['no-visible-title']}
            propsUsed={[{ part: 'TableOfContents.Root', prop: 'messages' }]}
            note={
              <Note kind="recipe" more={<CodeBlock code={stickyHeaderCode} />}>
                With a sticky header, give its height to offset and to scroll-padding-top, so a
                heading you jump to isn’t hidden under it.
              </Note>
            }
          >
            <NoVisibleTitle />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { TableOfContents, useTableOfContents } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTableOfContentsHook}
          strings={
            <StringsBlock
              namespace="tableOfContents"
              component="TableOfContents"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The landmark’s name when there is no aria-labelledby. Use the same words as your visible title.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
