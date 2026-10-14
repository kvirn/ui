import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  gridItemAttributes,
  gridItemRows,
  gridRootAttributes,
  gridRootRows,
  useGridHook,
} from '../content/grid.api.ts'
import { DefaultGrid } from '../examples/grid/default.tsx'
import { PageLayout } from '../examples/grid/page-layout.tsx'
import { QuickLinks } from '../examples/grid/quick-links.tsx'
import { ServicePage } from '../examples/grid/service-page.tsx'
import { SideInformation } from '../examples/grid/side-information.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type GridExampleSources = Record<
  'default' | 'page-layout' | 'service-page' | 'side-information' | 'quick-links',
  string
>

const partRenders = (
  <>
    <code>&lt;div&gt;</code> with no role. It takes every attribute of a <code>&lt;div&gt;</code>{' '}
    and passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'Grid.Root',
    renders: (
      <>
        {partRenders} Root renders an internal <code>&lt;div&gt;</code> around the grid element, so
        the breakpoints answer to the grid’s own width. Every prop and the ref go to the grid
        element. Put it in a block-level parent: in a shrink-to-fit parent (inline-flex, float) it
        collapses. Also exported as <code>GridRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: gridRootRows,
    attributes: gridRootAttributes,
  },
  {
    name: 'Grid.Item',
    renders: (
      <>
        {partRenders} Optional: any direct child of Root is a cell. Also exported as{' '}
        <code>GridItem</code>. An Item outside a Root warns in development.
      </>
    ),
    props: gridItemRows,
    attributes: gridItemAttributes,
  },
]

export function GridPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: GridExampleSources
}) {
  return (
    <ComponentPage
      title="Grid"
      lead="You choose the columns with classes, so you need no CSS of your own. Grid adds no meaning of its own: what a screen reader reads and what the keyboard visits follows the order you write."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use Grid to place things in columns: a page with a main part and a side part, or a set
            of service cards, news items or quick links.
          </li>
          <li>
            Start with one column and add columns from a breakpoint (a width of the grid itself):{' '}
            <code>kv-grid--cols-1 kv-grid--lg-cols-12</code>. The grid measures its own width, so
            the same markup works in a sidebar, in a card and at 400% zoom.
          </li>
          <li>
            For as many columns as fit, none narrower than you choose, use{' '}
            <code>kv-grid--fit-sm</code>, <code>-md</code> or <code>-lg</code>.
          </li>
          <li>
            A grid of cards or links is a list. Render <code>Grid.Root</code> as a{' '}
            <code>&lt;ul&gt;</code> with one <code>&lt;li&gt;</code> per item, so a screen reader
            says how many there are.
          </li>
          <li>
            Not for one column of things with space between them: use{' '}
            <Link href="/components/stack">Stack</Link>. Not for data with rows and columns that
            people compare: use a <Link href="/components/table">Table</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultGrid />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="page-layout"
            title="A 12-column page layout"
            why="One column on a phone. When the grid is at least 64rem wide, the main part takes eight columns and the side part four. The cells are in reading order, so a keyboard and a screen reader get the order you see."
            code={sources['page-layout']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Item', prop: 'className' },
            ]}
            note={
              <Note kind="reminder">
                Line placement (<code>start-n</code>, <code>end-n</code>) can put a later cell
                before an earlier one. Keep it in DOM order, because focus and reading order follow
                the DOM (1.3.2 Meaningful Sequence, 2.4.3 Focus Order).
              </Note>
            }
          >
            <PageLayout />
          </UseCase>
          <UseCase
            id="service-page"
            title="A service page with navigation for its section"
            why="Pages in the same section link to each other from a side column of three of twelve columns, with the content over the other nine. Render the side Item as a nav and name it, and mark the current page with current."
            code={sources['service-page']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Item', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                A nav is a landmark (a region people can jump to) and needs a name, in the page’s
                language. An Item is never <code>&lt;main&gt;</code> by default: a page has one, so
                choose it with <code>as</code> where it fits (1.3.1 Info and Relationships).
              </Note>
            }
          >
            <ServicePage />
          </UseCase>
          <UseCase
            id="side-information"
            title="Contact details beside the text"
            why="Information that belongs to the page but isn’t part of the text goes in a side column. Write the content first and the side after it, so the content is at the start of the line and is read and visited first. Render the side as an aside and name it."
            code={sources['side-information']}
            propsUsed={[{ part: 'Grid.Item', prop: 'as' }]}
            note={
              <Note kind="tip">
                The cells follow the DOM order, and the grid mirrors in right-to-left languages: the
                first cell is at the right.
              </Note>
            }
          >
            <SideInformation />
          </UseCase>
          <UseCase
            id="quick-links"
            title="Short links in narrow columns"
            why="Links with a few words fit in a narrow column, so more of them sit side by side. Choose the narrowest fit class and a smaller gap."
            code={sources['quick-links']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Root', prop: 'as' },
            ]}
            note={
              <Note kind="tip">
                A grid that is narrower than the fit size gets one column, so nothing scrolls
                sideways at 320px.
              </Note>
            }
          >
            <QuickLinks />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Start with one column: <code>kv-grid--cols-1</code> or a <code>fit</code> class.
                Then add columns with a breakpoint, such as <code>kv-grid--lg-cols-3</code>. A bare{' '}
                <code>kv-grid--cols-3</code> keeps three columns on a 320px screen, and content
                overflows (1.4.10 Reflow).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you style a cell, don’t give it a fixed height or hide its overflow. When people
                widen the text spacing, the text would be cut off (1.4.12 Text Spacing).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Grid, useGrid } from '@kvirn-ui/react'"
          parts={parts}
          hook={useGridHook}
        />
      }
    />
  )
}
