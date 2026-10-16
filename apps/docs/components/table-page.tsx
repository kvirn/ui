import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  tableBodyAttributes,
  tableBodyRows,
  tableCellAttributes,
  tableCellRows,
  tableColumnHeaderAttributes,
  tableColumnHeaderRows,
  tableDetailRowAttributes,
  tableDetailRowRows,
  tableEmptyAttributes,
  tableEmptyRows,
  tableExpandButtonAttributes,
  tableExpandButtonRows,
  tableRootAttributes,
  tableRootRows,
  tableRowAttributes,
  tableRowRows,
  tableScrollRegionAttributes,
  tableScrollRegionRows,
  tableSelectAttributes,
  tableSelectRows,
  tableSimpleAttributes,
  tableSortButtonAttributes,
  tableSortButtonRows,
  useTableHook,
} from '../content/table.api.ts'
import { DefaultTable } from '../examples/table/default.tsx'
import { EmptyCases } from '../examples/table/empty.tsx'
import { ExpandableCases } from '../examples/table/expandable.tsx'
import { LargeTable } from '../examples/table/large.tsx'
import { SelectableCases } from '../examples/table/selectable.tsx'
import { SortableCases } from '../examples/table/sortable.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TableExampleSources = Record<
  'default' | 'sortable' | 'selectable' | 'expandable' | 'empty' | 'large',
  string
>

const optionsOf = { part: apiHookPart('useTable', 'options'), label: 'useTable (options)' }

const stringKeys = [
  {
    key: 'sortedAscending',
    meaning: 'A sort button sorts a column ascending.',
    values: { column: 'Name' },
  },
  {
    key: 'sortedDescending',
    meaning: 'A sort button sorts a column descending.',
    values: { column: 'Name' },
  },
  { key: 'sortCleared', meaning: 'A sort button removes the sort.', values: { column: 'Name' } },
  { key: 'selectRow', meaning: 'The name of a row’s select checkbox.' },
  {
    key: 'selectRowNumber',
    meaning: 'The name of a row’s select checkbox when there is no row header, numbered.',
    values: { index: 3 },
  },
  { key: 'selectAllRows', meaning: 'The name of the select-all checkbox.' },
  {
    key: 'selectedCount',
    meaning: 'Announced when the select-all checkbox changes the selection.',
    values: { count: 12 },
  },
  { key: 'rowCount', meaning: 'Announced when a filter changed the rows.', values: { count: 3 } },
  { key: 'loading', meaning: 'Announced when isLoading becomes true.' },
  { key: 'empty', meaning: 'The text of Table.Empty when there are no rows.' },
  { key: 'rowDetails', meaning: 'The name of a row’s expand button.' },
  {
    key: 'rowDetailsNumber',
    meaning: 'The name of a row’s expand button when there is no row header, numbered.',
    values: { index: 3 },
  },
] as const

const parts: ApiPart[] = [
  {
    name: 'Table.Root',
    renders: (
      <>
        <code>&lt;table&gt;</code>, which has the role <code>table</code> natively. It takes every
        attribute of a <code>&lt;table&gt;</code> and passes <code>ref</code> to it. Name it with a
        Table.Caption, or <code>aria-labelledby</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: tableRootRows,
    attributes: tableRootAttributes,
  },
  {
    name: 'Table.ScrollRegion',
    renders: (
      <>
        <code>&lt;div&gt;</code> around the table. It is a named <code>region</code> and a Tab stop
        only while the table scrolls (or always a region with <code>region=&quot;always&quot;</code>
        ), and a plain <code>&lt;div&gt;</code> otherwise. It is the virtualizer’s scroll element.
      </>
    ),
    props: tableScrollRegionRows,
    attributes: tableScrollRegionAttributes,
  },
  {
    name: 'Table.Caption, Table.Head, Table.Foot, Table.RowHeader',
    renders: (
      <>
        <code>&lt;caption&gt;</code>, <code>&lt;thead&gt;</code>, <code>&lt;tfoot&gt;</code> and{' '}
        <code>&lt;th scope=&quot;row&quot;&gt;</code>. Each takes every attribute of its element and
        passes <code>ref</code> to it.
      </>
    ),
    attributes: tableSimpleAttributes,
  },
  {
    name: 'Table.Body',
    renders: (
      <>
        <code>&lt;tbody&gt;</code>. It takes every attribute of a <code>&lt;tbody&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    props: tableBodyRows,
    attributes: tableBodyAttributes,
  },
  {
    name: 'Table.Row',
    renders: (
      <>
        <code>&lt;tr&gt;</code>. It takes every attribute of a <code>&lt;tr&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: tableRowRows,
    attributes: tableRowAttributes,
  },
  {
    name: 'Table.ColumnHeader',
    renders: (
      <>
        <code>&lt;th scope=&quot;col&quot;&gt;</code>. It takes every attribute of a{' '}
        <code>&lt;th&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: tableColumnHeaderRows,
    attributes: tableColumnHeaderAttributes,
  },
  {
    name: 'Table.Cell',
    renders: (
      <>
        <code>&lt;td&gt;</code>, or <code>&lt;th scope=&quot;row&quot;&gt;</code> for the row header
        column. It takes every attribute of a <code>&lt;td&gt;</code> and passes <code>ref</code> to
        it.
      </>
    ),
    props: tableCellRows,
    attributes: tableCellAttributes,
  },
  {
    name: 'Table.SortButton',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> around the header text, with a
        decorative icon. It takes every attribute of a <code>&lt;button&gt;</code> except{' '}
        <code>type</code>, and passes <code>ref</code> to it.
      </>
    ),
    props: tableSortButtonRows,
    attributes: tableSortButtonAttributes,
  },
  {
    name: 'Table.SelectCheckbox, Table.SelectAllCheckbox',
    renders: (
      <>
        <code>&lt;input type=&quot;checkbox&quot;&gt;</code>, named by its row (or &quot;Select all
        rows&quot;). Each takes every attribute of an <code>&lt;input&gt;</code> except{' '}
        <code>type</code>, and passes <code>ref</code> to it.
      </>
    ),
    props: tableSelectRows,
    attributes: tableSelectAttributes,
  },
  {
    name: 'Table.ExpandButton',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the text “Details” and a chevron.
        It takes every attribute of a <code>&lt;button&gt;</code> except <code>type</code>, and
        passes <code>ref</code> to it.
      </>
    ),
    props: tableExpandButtonRows,
    attributes: tableExpandButtonAttributes,
  },
  {
    name: 'Table.DetailRow',
    renders: (
      <>
        <code>&lt;tr&gt;</code> with one <code>&lt;td&gt;</code> that spans every column, rendered
        only while the row is expanded. It takes every attribute of a <code>&lt;tr&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    props: tableDetailRowRows,
    attributes: tableDetailRowAttributes,
  },
  {
    name: 'Table.Empty',
    renders: (
      <>
        <code>&lt;tbody&gt;</code> with one row and one cell that spans every column, rendered only
        when there are no rows. It says “Loading rows.” while the table loads. It takes every
        attribute of a <code>&lt;tbody&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: tableEmptyRows,
    attributes: tableEmptyAttributes,
  },
]

export function TablePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TableExampleSources
}) {
  return (
    <ComponentPage
      title="Table"
      lead="A screen reader (software that reads the screen aloud) reads each cell together with its row and column headers. A table can also sort, select and expand rows and show long lists, and it stays a real table."
      status="alpha-candidate"
      pattern="APG Table"
      whenToUse={
        <ul>
          <li>
            Use a table for data that has rows and columns: payments, cases, a list a case worker
            compares.
          </li>
          <li>
            Choose a row header, such as a name or a case number, so each row has a title and each
            checkbox or button says which row it belongs to.
          </li>
          <li>
            For long data, split it into pages or add a filter first. Virtualize (draw only the rows
            near the scroll position) last: rows that are not drawn cannot be found with find in
            page, are not printed and are out of reach of a screen reader’s browse mode.
          </li>
          <li>
            Not for layout, or for a list of cards. A table that turns into blocks on a small screen
            loses its meaning: let it scroll sideways inside the scroll region instead.
          </li>
          <li>
            Not for editing cells or a spreadsheet. Table has no column resizing, reordering,
            editable cells or multi-sort.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTable />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="sortable"
            title="A table the user can sort"
            // kv-lang-ok: the letters å, ä and ö are the point of the Swedish sort order
            why="Put the sort in the column header, so a user can order cases by name or amount. Sorting one column at a time is announced. The order follows the language you set. This example sorts in Swedish, so å, ä and ö come after z."
            code={sources['sortable']}
            propsUsed={[
              { ...optionsOf, prop: 'features' },
              { ...optionsOf, prop: 'columns' },
              { ...optionsOf, prop: 'data' },
              { ...optionsOf, prop: 'getRowId' },
              { ...optionsOf, prop: 'rowHeader' },
              { ...optionsOf, prop: 'initialState' },
              { part: 'Table.SortButton', prop: 'header' },
            ]}
            note={
              <Note kind="tip">
                {/* kv-lang-ok: the letters å, ä and ö are the point of the Swedish sort order */}
                The default TanStack sort compares character codes. In Swedish it puts å, ä and ö in
                the wrong place. Use <code>createLocaleSortFn(locale)</code>, as here.
              </Note>
            }
          >
            <SortableCases />
          </UseCase>
          <UseCase
            id="selectable"
            title="Rows the user can select"
            // kv-lang-ok: the row names Åsa Öberg and Anna Svensson are the example's sample data
            why="Put a checkbox in the first cell for bulk actions. Each checkbox is named by its row, so “Select Anna Svensson” is different from “Select Åsa Öberg”, and the header checkbox selects them all."
            code={sources['selectable']}
            propsUsed={[
              { part: 'Table.SelectCheckbox, Table.SelectAllCheckbox', prop: 'row' },
              { ...optionsOf, prop: 'rowHeader' },
            ]}
            note={
              <Note kind="tip">
                The header checkbox selects every row of the table, including rows on other pages.
                With pagination, say so in the table’s description, or change the checkbox’s name
                with <code>messages.selectAllRows</code>.
              </Note>
            }
          >
            <SelectableCases />
          </UseCase>
          <UseCase
            id="expandable"
            title="Details under a row"
            why="Show the rest of a case under its row without leaving the table. The button says “Details” and names its row, and the detail is the next row, spanning every column."
            code={sources['expandable']}
            propsUsed={[
              { part: 'Table.ExpandButton', prop: 'row' },
              { part: 'Table.DetailRow', prop: 'row' },
            ]}
            note={
              <Note kind="reminder">
                Put the button’s text in the expand column’s header, hidden from sight, as in the
                code. Without it that header cell is empty, and a screen reader user can’t tell what
                the column is (1.3.1 Info and Relationships).
              </Note>
            }
          >
            <ExpandableCases />
          </UseCase>
          <UseCase
            id="no-rows"
            title="When there are no rows"
            why="An empty table keeps its head and says why it is empty and what to do next, in one row that spans the columns. Table.Empty renders only when there are no rows."
            code={sources['empty']}
            propsUsed={[{ part: 'Table.Empty', prop: 'children' }]}
          >
            <EmptyCases />
          </UseCase>
          <UseCase
            id="long-data"
            title="A table with 2,000 rows"
            why="When the user needs the whole list and cannot page through it, render only the rows near the scroll position. The table still says how big it is, and the row that has focus stays in the page."
            code={sources['large']}
            propsUsed={[{ ...optionsOf, prop: 'virtualize' }]}
            note={
              <Note kind="recipe">
                Prefer pages with a status such as “Rows 21–40 of 312”, or a filter. If you
                virtualize, give the scroll region a height and a way to search.
              </Note>
            }
          >
            <LargeTable />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every table a caption that says what the data is. Without a name, a screen
                reader user can’t tell the tables on a page apart (1.3.1 Info and Relationships). A
                development warning says so.
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                While <code>isLoading</code> is on, the table head shows a bar that keeps moving. If
                it can move for more than 5 seconds next to other content, the page needs a visible
                control that stops or hides it (2.2.2 Pause, Stop, Hide). The reduced motion setting
                alone is not that control. See{' '}
                <Link href="/foundation/theming#moving-indicators">
                  Moving indicators and WCAG 2.2.2
                </Link>
                .
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Table, useTable, tableFeatures, createColumnHelper } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTableHook}
          strings={<StringsBlock namespace="table" component="Table" keys={stringKeys} />}
        />
      }
    />
  )
}
