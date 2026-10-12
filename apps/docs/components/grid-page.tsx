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
import { NewsGrid } from '../examples/grid/news.tsx'
import { PageLayout } from '../examples/grid/page-layout.tsx'
import { QuickLinks } from '../examples/grid/quick-links.tsx'
import { ServicePage } from '../examples/grid/service-page.tsx'
import { ServiceList } from '../examples/grid/service-list.tsx'
import { SideColumn } from '../examples/grid/side-column.tsx'
import { SideInformation } from '../examples/grid/side-information.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type GridExampleSources = Record<
  | 'default'
  | 'page-layout'
  | 'side-column'
  | 'service-page'
  | 'side-information'
  | 'service-list'
  | 'quick-links'
  | 'news',
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
      lead="It lays out cells in columns and rows with no CSS of your own, and it adds no role, text or behaviour."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use Grid to place things in columns: a page with a main part and a side part, or a grid
            of service cards, news items or quick links.
          </li>
          <li>
            Start at one track and add columns from a breakpoint:{' '}
            <code>kv-grid--cols-1 kv-grid--lg-cols-12</code>. A bare <code>cols-n</code> (n above
            1), <code>flow-col</code> without <code>rows-n</code> or <code>auto-cols-min|max</code>{' '}
            keeps its tracks at 320px, so the cells squeeze and content overflows or overlaps (WCAG
            1.4.10). Breakpoints answer to the grid’s own width, so the same markup works in a
            sidebar or a card and at 400% zoom.
          </li>
          <li>
            For as many columns as fit, none narrower than you choose, use{' '}
            <code>kv-grid--fit-sm</code>, <code>-md</code> or <code>-lg</code>.
          </li>
          <li>
            A grid of cards or links is a list: render Grid.Root as a <code>&lt;ul&gt;</code> with
            one <code>&lt;li&gt;</code> per item, so a screen reader says how many there are.
          </li>
          <li>
            Not for one column of things with space between them: use Stack. For a page with a side
            column, make the side <code>kv-grid-item--lg-span-3</code> and the content{' '}
            <code>kv-grid-item--lg-span-9</code>; below 64rem they stack in the order you wrote
            them.
          </li>
          <li>
            Not for data with rows and columns the user compares: use a{' '}
            <Link href="/components/table">Table</Link>.
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
            why="One column on a phone, and from 64rem a main part over eight columns and a side part over four. The cells are in reading order, so a keyboard and a screen reader get the order you see."
            code={sources['page-layout']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Item', prop: 'className' },
            ]}
            note={
              <Note kind="reminder">
                Line placement (<code>start-n</code>, <code>end-n</code>) can put a later cell
                before an earlier one. Keep it in DOM order, because focus and reading order follow
                the DOM (WCAG 1.3.2, 2.4.3).
              </Note>
            }
          >
            <PageLayout />
          </UseCase>
          <UseCase
            id="side-column"
            title="A side column and a content column"
            why="Three of twelve columns for the side and nine for the content from 64rem, stacked in DOM order below. The side is proportional, about 14rem at 64rem and 18rem at 80rem."
            code={sources['side-column']}
            propsUsed={[{ part: 'Grid.Item', prop: 'className' }]}
          >
            <SideColumn />
          </UseCase>
          <UseCase
            id="service-page"
            title="A service page with navigation for its section"
            why="Pages in the same section link to each other from a side column. Render the side Item as a nav and name it, and mark the current page with aria-current."
            code={sources['service-page']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Item', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                A nav is a landmark and needs a name, in the page’s language. An Item is never{' '}
                <code>&lt;main&gt;</code> by default: a page has one, so choose it with{' '}
                <code>as</code> where it fits.
              </Note>
            }
          >
            <ServicePage />
          </UseCase>
          <UseCase
            id="side-information"
            title="Contact details beside the text"
            why="Information that belongs to the page but isn’t part of the text goes in a side column. Write the content first and the side after it, so the content is at inline start and is read and focused first. Render the side as an aside and name it."
            code={sources['side-information']}
            propsUsed={[{ part: 'Grid.Item', prop: 'as' }]}
            note={
              <Note kind="tip">
                The side follows the DOM order, and it mirrors in right-to-left languages: the first
                part is at the right.
              </Note>
            }
          >
            <SideInformation />
          </UseCase>
          <UseCase
            id="service-cards"
            title="A grid of services on the start page"
            why="Cards that lead to the services residents look for most. Render Grid.Root as a list and each card as a list item, so the count is announced and the cards are read in the order they are written."
            code={sources['service-list']}
            propsUsed={[{ part: 'Grid.Root', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Write the items in reading order. Grid fills left to right (right to left in
                right-to-left languages) in DOM order, and there is no way to reorder them.
              </Note>
            }
          >
            <ServiceList />
          </UseCase>
          <UseCase
            id="quick-links"
            title="Short links in narrow columns"
            why="Links with a few words fit in a narrow column, so more of them sit side by side. Choose a narrower fit class and a smaller gap."
            code={sources['quick-links']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Root', prop: 'as' },
            ]}
          >
            <QuickLinks />
          </UseCase>
          <UseCase
            id="news"
            title="News items with room to read"
            why="Items with a heading and a few lines of text read better in wider columns, so fewer fit in a row. Choose a wider fit class and more space between them."
            code={sources['news']}
            propsUsed={[
              { part: 'Grid.Root', prop: 'className' },
              { part: 'Grid.Root', prop: 'as' },
            ]}
            note={
              <Note kind="tip">
                On a screen narrower than the fit size there is one column, so nothing scrolls
                sideways at 320px.
              </Note>
            }
          >
            <NewsGrid />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
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
