import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { columnsAttributes, columnsRows, useColumnsHook } from '../content/columns.api.ts'
import { DefaultColumns } from '../examples/columns/default.tsx'
import { NewsColumns } from '../examples/columns/news.tsx'
import { QuickLinks } from '../examples/columns/quick-links.tsx'
import { ServiceList } from '../examples/columns/service-list.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ColumnsExampleSources = Record<
  'default' | 'service-list' | 'quick-links' | 'news',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Columns',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: columnsRows,
    attributes: columnsAttributes,
  },
]

export function ColumnsPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ColumnsExampleSources
}) {
  return (
    <ComponentPage
      title="Columns"
      lead="As many columns as fit, none narrower than you choose, and one column on a small screen. It lays out a grid of cards or links with no CSS of your own, and it adds no role, text or behaviour."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use Columns for things of the same kind side by side: a grid of service cards, news
            items or quick links on a start page.
          </li>
          <li>
            Choose the narrowest a column may get and the gap. The columns wrap by themselves, so
            the same markup works from a phone to a wide screen and at 400% zoom.
          </li>
          <li>
            A grid of cards or links is a list: render Columns as a <code>&lt;ul&gt;</code> with one{' '}
            <code>&lt;li&gt;</code> per item, so a screen reader says how many there are.
          </li>
          <li>
            Not for one column of things with space between them: use Stack. Not for a page with a
            side column: use <Link href="/components/sidebar-layout">SidebarLayout</Link>.
          </li>
          <li>
            Not for data with rows and columns the user compares: use a{' '}
            <Link href="/components/table">Table</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultColumns />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="service-cards"
            title="A grid of services on the start page"
            why="Cards that lead to the services residents look for most. Render Columns as a list and each card as a list item, so the count is announced and the cards are read in the order they are written."
            code={sources['service-list']}
            propsUsed={[{ part: 'Columns', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Write the items in reading order. Columns fills left to right (right to left in
                right-to-left languages) in DOM order, and there is no way to reorder them.
              </Note>
            }
          >
            <ServiceList />
          </UseCase>
          <UseCase
            id="quick-links"
            title="Short links in narrow columns"
            why="Links with a few words fit in a narrow column, so more of them sit side by side. Choose a narrower minimum and a smaller gap."
            code={sources['quick-links']}
            propsUsed={[
              { part: 'Columns', prop: 'minColumnWidth' },
              { part: 'Columns', prop: 'gap' },
              { part: 'Columns', prop: 'as' },
            ]}
          >
            <QuickLinks />
          </UseCase>
          <UseCase
            id="news"
            title="News items with room to read"
            why="Items with a heading and a few lines of text read better in wider columns, so fewer fit in a row. Choose a wider minimum and more space between them."
            code={sources['news']}
            propsUsed={[
              { part: 'Columns', prop: 'minColumnWidth' },
              { part: 'Columns', prop: 'gap' },
              { part: 'Columns', prop: 'as' },
            ]}
            note={
              <Note kind="tip">
                On a screen narrower than the minimum there is one column, so nothing scrolls
                sideways at 320px.
              </Note>
            }
          >
            <NewsColumns />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Columns, useColumns } from '@kvirn-ui/react'"
          parts={parts}
          hook={useColumnsHook}
        />
      }
    />
  )
}
