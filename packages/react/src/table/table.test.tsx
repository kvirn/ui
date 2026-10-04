import {
  columnFilteringFeature,
  columnSizingFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createLocaleSortFn,
  createSortedRowModel,
  filterFn_includesString,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@kvirn-ui/core'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Table } from './table.tsx'
import { useTable } from './use-table.ts'
import type { TableRegion, TableVirtualizeOptions } from './use-table.ts'

// Contract: table.a11y.md. Keys, focus order, the sticky header, forced colours and reflow are
// covered in apps/storybook/src/components/table/table.e2e.ts. Component tests load no theme, so
// what is asserted is the markup, the names, the state and the announcements.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

interface CaseRecord {
  id: string
  name: string
  caseNumber: string
  received: string
}

const records: CaseRecord[] = [
  { id: 'c1', name: 'Anna Svensson', caseNumber: 'A-102', received: '2026-09-02' },
  { id: 'c2', name: 'Åsa Berg', caseNumber: 'A-087', received: '2026-08-14' },
  { id: 'c3', name: 'Zack Öberg', caseNumber: 'B-310', received: '2026-09-21' },
  { id: 'c4', name: 'Bertil Ek', caseNumber: 'A-201', received: '2026-07-30' },
]

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
  rowSelectionFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
})
const column = createColumnHelper<typeof features, CaseRecord>()
const columns = column.columns([
  column.accessor('name', { header: 'Name', sortFn: 'locale' }),
  column.accessor('caseNumber', { header: 'Case number' }),
  column.accessor('received', {
    header: 'Received',
    cell: (info) => info.getValue().replaceAll('-', '/'),
  }),
])

interface CasesTableProps {
  data?: readonly CaseRecord[]
  /** Leave the row header out, so the checkboxes are named by row number. */
  withoutRowHeader?: boolean
  isLoading?: boolean
  emptyText?: string
  /** `useTable`'s `region` option. */
  regionOption?: TableRegion
  /** `Table.ScrollRegion`'s `region` prop, which wins over the option. */
  region?: TableRegion
}

function CasesTable({
  data = records,
  withoutRowHeader = false,
  isLoading,
  emptyText,
  regionOption,
  region,
}: CasesTableProps) {
  const cases = useTable({
    features,
    columns,
    data,
    getRowId: (record) => record.id,
    ...(withoutRowHeader ? {} : { rowHeader: 'name' }),
    isLoading,
    region: regionOption,
  })
  return (
    <Table.ScrollRegion table={cases} region={region}>
      <Table.Root table={cases}>
        <Table.Caption>Open cases</Table.Caption>
        <Table.Head>
          {cases.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <Table.SelectAllCheckbox />
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id} header={header}>
                  {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => (
            <Table.Row key={row.id} row={row}>
              <Table.Cell>
                <Table.SelectCheckbox row={row} />
              </Table.Cell>
              {row.getAllCells().map((cell) => (
                <Table.Cell key={cell.id} cell={cell} />
              ))}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Empty>{emptyText}</Table.Empty>
      </Table.Root>
    </Table.ScrollRegion>
  )
}

const expandableFeatures = tableFeatures({
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})
const expandableColumn = createColumnHelper<typeof expandableFeatures, CaseRecord>()
const expandableColumns = expandableColumn.columns([
  expandableColumn.accessor('name', { header: 'Name' }),
  expandableColumn.accessor('caseNumber', { header: 'Case number' }),
])

function ExpandableTable({ virtualize }: { virtualize?: boolean }) {
  const cases = useTable({
    features: expandableFeatures,
    columns: expandableColumns,
    data: records,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
    virtualize,
  })
  return (
    <Table.Root table={cases}>
      <Table.Caption>Open cases</Table.Caption>
      <Table.Head>
        {cases.table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
            <Table.ColumnHeader />
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeader key={header.id} header={header} />
            ))}
          </Table.Row>
        ))}
      </Table.Head>
      <Table.Body>
        {(row) => (
          <>
            <Table.Row key={row.id} row={row}>
              <Table.Cell>
                <Table.ExpandButton row={row} />
              </Table.Cell>
              {row.getAllCells().map((cell) => (
                <Table.Cell key={cell.id} cell={cell} />
              ))}
            </Table.Row>
            <Table.DetailRow row={row}>Handled by the housing office.</Table.DetailRow>
          </>
        )}
      </Table.Body>
    </Table.Root>
  )
}

const plainFeatures = tableFeatures({ columnSizingFeature })
const plainColumn = createColumnHelper<typeof plainFeatures, CaseRecord>()
const plainColumns = plainColumn.columns([
  plainColumn.accessor('name', {
    header: 'Name',
    cell: (info) => <button type="button">{`Open ${info.getValue()}`}</button>,
  }),
  plainColumn.accessor('caseNumber', { header: 'Case number' }),
])
const manyRecords: CaseRecord[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: `r${index}`,
  name: `Person ${index}`,
  caseNumber: `N-${index}`,
  received: '2026-01-01',
}))

function VirtualTable({
  data = manyRecords,
  virtualize = true,
}: {
  data?: readonly CaseRecord[]
  virtualize?: boolean | TableVirtualizeOptions
}) {
  const cases = useTable({
    features: plainFeatures,
    columns: plainColumns,
    data,
    getRowId: (record) => record.id,
    virtualize,
  })
  return (
    <Table.ScrollRegion table={cases} style={{ blockSize: 300, overflow: 'auto' }}>
      <Table.Root table={cases}>
        <Table.Caption>All cases</Table.Caption>
        <Table.Head>
          {cases.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id} header={header} />
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => (
            <Table.Row key={row.id} row={row}>
              {row.getAllCells().map((cell) => (
                <Table.Cell key={cell.id} cell={cell} />
              ))}
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Table.ScrollRegion>
  )
}

const renderInProvider = (ui: ReactNode, locale = 'en') =>
  render(
    <KvirnProvider locale={locale} {...(locale === 'sv' ? { messages: sv } : {})}>
      {ui}
    </KvirnProvider>,
  )

/** The checkbox a locator found, as the input it is. */
function inputOf(locator: { element: () => Element }): HTMLInputElement {
  const element = locator.element()
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('The element is not an input')
  }
  return element
}

const table = () => page.getByRole('table')
const status = () => page.getByRole('status')
const sortButton = (name: string) => page.getByRole('button', { name, exact: true })

function rowHeaders(container: Element): string[] {
  return [...container.querySelectorAll('tbody th[scope="row"]')].map(
    (cell) => cell.textContent ?? '',
  )
}

function sortedColumns(container: Element): string[] {
  return [...container.querySelectorAll('th[aria-sort]')].map(
    (cell) => `${cell.textContent ?? ''}:${cell.getAttribute('aria-sort') ?? ''}`,
  )
}

describe('native semantics', () => {
  test('a native table named by its caption, with column headers and row headers', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const element = page.getByRole('table', { name: 'Open cases' }).element()
    expect(element.tagName).toBe('TABLE')
    expect(element.firstElementChild?.tagName).toBe('CAPTION')
    expect(element.querySelector('thead')).not.toBeNull()
    expect(element.querySelector('tbody')).not.toBeNull()
    const columnHeaders = [...element.querySelectorAll('thead th')]
    expect(columnHeaders.map((cell) => cell.getAttribute('scope'))).toEqual([
      'col',
      'col',
      'col',
      'col',
    ])
    expect(rowHeaders(container)).toEqual(['Anna Svensson', 'Åsa Berg', 'Zack Öberg', 'Bertil Ek'])
    // Only the `rowHeader` column is a row header: the rest are data cells.
    expect(element.querySelectorAll('tbody td')).toHaveLength(4 * 3)
    expect(element.querySelector('th[role], td[role], tr[role]')).toBeNull()
  })

  test('cells render the cell template of their column', async () => {
    await renderInProvider(<CasesTable />)
    await expect.element(page.getByRole('cell', { name: '2026/09/02' })).toBeVisible()
  })

  test('classes follow the part names', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    expect(container.querySelector('table.kv-table')).not.toBeNull()
    expect(container.querySelector('caption.kv-table-caption')).not.toBeNull()
    expect(container.querySelector('thead.kv-table-head')).not.toBeNull()
    expect(container.querySelector('tbody.kv-table-body')).not.toBeNull()
    expect(container.querySelectorAll('tr.kv-table-row').length).toBe(1 + 4)
    expect(container.querySelectorAll('th.kv-table-column-header')).toHaveLength(4)
    expect(container.querySelectorAll('th.kv-table-row-header')).toHaveLength(4)
    expect(container.querySelectorAll('td.kv-table-cell')).toHaveLength(12)
    expect(container.querySelector('div.kv-scroll-region.kv-table-scroll-region')).not.toBeNull()
    expect(
      container.querySelectorAll('input[type="checkbox"].kv-checkbox.kv-table-select-checkbox'),
    ).toHaveLength(5)
  })

  test('without `table`, every part is the plain native element and nothing warns', async () => {
    const { container } = await render(
      <Table.Root>
        <Table.Caption>Fees</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>Service</Table.ColumnHeader>
            <Table.ColumnHeader>Fee</Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>Passport</Table.RowHeader>
            <Table.Cell>350 kr</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.RowHeader>Total</Table.RowHeader>
            <Table.Cell>350 kr</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table.Root>,
    )
    await expect.element(page.getByRole('table', { name: 'Fees' })).toBeVisible()
    expect(container.querySelectorAll('th[scope="col"]')).toHaveLength(2)
    expect(container.querySelectorAll('th[scope="row"]')).toHaveLength(2)
    expect(container.querySelectorAll('td')).toHaveLength(2)
    expect(container.querySelector('tfoot')).not.toBeNull()
    expect(container.querySelector('[aria-sort], [aria-rowcount], [aria-busy]')).toBeNull()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('every part takes `render` and merges its props', async () => {
    const { container } = await render(
      <Table.Root>
        <Table.Caption>Fees</Table.Caption>
        <Table.Body render={<tbody data-custom="yes" />}>
          <Table.Row className="mine">
            <Table.Cell>350 kr</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    )
    expect(container.querySelector('tbody[data-custom="yes"].kv-table-body')).not.toBeNull()
    expect(container.querySelector('tr.kv-table-row.mine')).not.toBeNull()
  })
})

describe('the name', () => {
  test('a table with no caption and no label warns once, in development', async () => {
    await render(
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.Cell>350 kr</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBe(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('A Table has no name')
  })

  test('a caption, or aria-labelledby on the Root, is a name: no warning', async () => {
    await render(
      <>
        <h2 id="fees-heading">Fees</h2>
        <Table.Root aria-labelledby="fees-heading">
          <Table.Body>
            <Table.Row>
              <Table.Cell>350 kr</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </>,
    )
    await expect.element(page.getByRole('table', { name: 'Fees' })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a region of a table with no caption has no name, so it warns and points at nothing', async () => {
    function WithoutCaption() {
      const cases = useTable({
        features,
        columns,
        data: records,
        getRowId: (record) => record.id,
      })
      return (
        <Table.ScrollRegion table={cases} region="always">
          <Table.Root table={cases} aria-label="Open cases">
            <Table.Body>
              {(row) => (
                <Table.Row key={row.id} row={row}>
                  {row.getAllCells().map((cell) => (
                    <Table.Cell key={cell.id} cell={cell} />
                  ))}
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollRegion>
      )
    }
    const { container } = await renderInProvider(<WithoutCaption />)
    await expect.poll(() => consoleWarn.mock.calls.length).toBeGreaterThan(0)
    expect(consoleWarn.mock.calls.map((call) => String(call[0])).join('\n')).toContain(
      'Table.ScrollRegion is a region',
    )
    await expect
      .poll(() =>
        container.querySelector('.kv-table-scroll-region')?.hasAttribute('aria-labelledby'),
      )
      .toBe(false)
  })

  test('a scroll region of a table that fits is not a region and has no name', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await expect.element(table()).toBeVisible()
    const scrollRegion = container.querySelector('.kv-table-scroll-region')
    expect(scrollRegion).not.toBeNull()
    expect(page.getByRole('region').elements()).toEqual([])
    expect(scrollRegion?.hasAttribute('role')).toBe(false)
    expect(scrollRegion?.hasAttribute('aria-labelledby')).toBe(false)
    expect(scrollRegion?.hasAttribute('tabindex')).toBe(false)
  })

  test('region="always" makes the scroll region a region named by the caption, and not a Tab stop', async () => {
    const { container } = await renderInProvider(<CasesTable region="always" />)
    const region = page.getByRole('region', { name: 'Open cases' })
    await expect.element(region).toBeVisible()
    expect(region.element().contains(table().element())).toBe(true)
    expect(container.querySelector('.kv-table-scroll-region')?.hasAttribute('tabindex')).toBe(false)
  })

  test('the region option of useTable makes the scroll region a region', async () => {
    await renderInProvider(<CasesTable regionOption="always" />)
    await expect.element(page.getByRole('region', { name: 'Open cases' })).toBeVisible()
  })

  test('the region prop wins over the option of useTable', async () => {
    await renderInProvider(<CasesTable regionOption="always" region="overflow" />)
    await expect.element(table()).toBeVisible()
    expect(page.getByRole('region').elements()).toEqual([])
  })
})

describe('sorting', () => {
  test('aria-sort is on the sorted column only', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    expect(sortedColumns(container)).toEqual([])

    await userEvent.click(sortButton('Name'))
    expect(sortedColumns(container)).toEqual(['Name:ascending'])

    await userEvent.click(sortButton('Case number'))
    expect(sortedColumns(container)).toEqual(['Case number:ascending'])
    expect(container.querySelector('th[data-sort="ascending"]')?.textContent).toBe('Case number')
    expect(container.querySelector('button[data-sort="ascending"]')?.textContent).toBe(
      'Case number',
    )
  })

  test('the button cycles through the first direction, the other and none', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await userEvent.click(sortButton('Name'))
    expect(sortedColumns(container)).toEqual(['Name:ascending'])
    await userEvent.click(sortButton('Name'))
    expect(sortedColumns(container)).toEqual(['Name:descending'])
    await userEvent.click(sortButton('Name'))
    expect(sortedColumns(container)).toEqual([])
  })

  test('rows follow the locale: å, ä and ö sort after z in Swedish', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await userEvent.click(sortButton('Name'))
    expect(rowHeaders(container)).toEqual(['Anna Svensson', 'Bertil Ek', 'Zack Öberg', 'Åsa Berg'])
    await userEvent.click(sortButton('Name'))
    expect(rowHeaders(container)).toEqual(['Åsa Berg', 'Zack Öberg', 'Bertil Ek', 'Anna Svensson'])
  })

  test('each change is announced politely with the column, in en', async () => {
    await renderInProvider(<CasesTable />)
    await userEvent.click(sortButton('Name'))
    await expect.element(status()).toHaveTextContent('Sorted by Name, ascending.')
    await userEvent.click(sortButton('Name'))
    await expect.element(status()).toHaveTextContent('Sorted by Name, descending.')
    await userEvent.click(sortButton('Name'))
    await expect.element(status()).toHaveTextContent('No longer sorted by Name.')
  })

  test('each change is announced in the provider locale, in sv', async () => {
    await renderInProvider(<CasesTable />, 'sv')
    await userEvent.click(sortButton('Name'))
    await expect.element(status()).toHaveTextContent('Sorterad efter Name, stigande.')
  })

  test('the sort icon differs in shape: two chevrons, one up, one down', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const paths = () =>
      [...container.querySelectorAll('.kv-table-sort-button')].map(
        (button) => button.querySelectorAll('svg.kv-table-sort-icon path').length,
      )
    expect(paths()).toEqual([2, 2, 2])
    await userEvent.click(sortButton('Name'))
    expect(paths()).toEqual([1, 2, 2])
    const ascending = container.querySelector('[data-sort="ascending"] path')?.getAttribute('d')
    await userEvent.click(sortButton('Name'))
    const descending = container.querySelector('[data-sort="descending"] path')?.getAttribute('d')
    expect(ascending).not.toBe(descending)
    expect(paths()).toEqual([1, 2, 2])
  })

  test('the sort icon is decorative and the button keeps the header text as its name', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const icon = container.querySelector('.kv-table-sort-button .kv-table-sort-icon')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(sortButton('Name').element().getAttribute('type')).toBe('button')
  })

  test('multi-sort is off: a second column replaces the first', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await userEvent.click(sortButton('Name'))
    await userEvent.click(sortButton('Received'))
    expect(sortedColumns(container)).toEqual(['Received:ascending'])
  })
})

describe('selection', () => {
  test('a row checkbox is named by "Select" and the row header, through aria-labelledby', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const checkbox = page.getByRole('checkbox', { name: 'Select Anna Svensson' })
    await expect.element(checkbox).toBeVisible()
    const element = checkbox.element()
    expect(element.tagName).toBe('INPUT')
    expect(element.getAttribute('type')).toBe('checkbox')
    const ids = element.getAttribute('aria-labelledby')?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(ids[0]).toBe(element.id)
    const headerCell = container.querySelector(`[id="${ids[1] ?? ''}"]`)
    expect(headerCell?.tagName).toBe('TH')
    expect(headerCell?.getAttribute('scope')).toBe('row')
    expect(headerCell?.textContent).toBe('Anna Svensson')
    expect(page.getByRole('checkbox', { name: 'Select Zack Öberg' }).elements()).toHaveLength(1)
  })

  test('without a row header the checkbox is named by the row number', async () => {
    await renderInProvider(<CasesTable withoutRowHeader />)
    await expect.element(page.getByRole('checkbox', { name: 'Select row 1' })).toBeVisible()
    await expect.element(page.getByRole('checkbox', { name: 'Select row 4' })).toBeVisible()
    expect(
      page
        .getByRole('checkbox', { name: 'Select row 1' })
        .element()
        .hasAttribute('aria-labelledby'),
    ).toBe(false)
  })

  test('checkbox names are in the provider locale, in sv', async () => {
    await renderInProvider(<CasesTable />, 'sv')
    await expect.element(page.getByRole('checkbox', { name: 'Välj Anna Svensson' })).toBeVisible()
    await expect.element(page.getByRole('checkbox', { name: 'Välj alla rader' })).toBeVisible()
  })

  test('a selected row has data-selected and never aria-selected', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const checkbox = page.getByRole('checkbox', { name: 'Select Anna Svensson' })
    await userEvent.click(checkbox)
    expect(inputOf(checkbox).checked).toBe(true)
    const row = checkbox.element().closest('tr')
    expect(row?.hasAttribute('data-selected')).toBe(true)
    expect(container.querySelectorAll('tr[data-selected]')).toHaveLength(1)
    expect(container.querySelector('[aria-selected]')).toBeNull()
    await userEvent.click(checkbox)
    expect(container.querySelectorAll('tr[data-selected]')).toHaveLength(0)
  })

  test('select-all is indeterminate while some rows are selected', async () => {
    await renderInProvider(<CasesTable />)
    const selectAll = page.getByRole('checkbox', { name: 'Select all rows' })
    expect(inputOf(selectAll).indeterminate).toBe(false)
    await userEvent.click(page.getByRole('checkbox', { name: 'Select Anna Svensson' }))
    expect(inputOf(selectAll).indeterminate).toBe(true)
    expect(inputOf(selectAll).checked).toBe(false)
  })

  test('select-all selects and clears every row and announces the count', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    const selectAll = page.getByRole('checkbox', { name: 'Select all rows' })
    await userEvent.click(selectAll)
    expect(container.querySelectorAll('tr[data-selected]')).toHaveLength(4)
    expect(inputOf(selectAll).checked).toBe(true)
    expect(inputOf(selectAll).indeterminate).toBe(false)
    await expect.element(status()).toHaveTextContent('4 rows selected.')

    await userEvent.click(selectAll)
    expect(container.querySelectorAll('tr[data-selected]')).toHaveLength(0)
    await expect.element(status()).toHaveTextContent('0 rows selected.')
  })

  test('selecting one row does not announce', async () => {
    await renderInProvider(<CasesTable />)
    await userEvent.click(page.getByRole('checkbox', { name: 'Select Anna Svensson' }))
    await userEvent.click(page.getByRole('checkbox', { name: 'Select Bertil Ek' }))
    expect(status().element().textContent).toBe('')
  })
})

describe('expanding', () => {
  test('the expand button has aria-expanded, a name with the row header, and aria-controls while open', async () => {
    const { container } = await renderInProvider(<ExpandableTable />)
    const button = page.getByRole('button', { name: 'Details Anna Svensson' })
    await expect.element(button).toBeVisible()
    expect(button.element().getAttribute('aria-expanded')).toBe('false')
    expect(button.element().hasAttribute('aria-controls')).toBe(false)
    expect(container.querySelector('tr.kv-table-detail-row')).toBeNull()

    await userEvent.click(button)
    expect(button.element().getAttribute('aria-expanded')).toBe('true')
    const controlled = button.element().getAttribute('aria-controls') ?? ''
    const detail = container.querySelector(`[id="${controlled}"]`)
    expect(detail?.tagName).toBe('TR')
    expect(detail?.classList.contains('kv-table-detail-row')).toBe(true)
    expect(detail?.textContent).toBe('Handled by the housing office.')
    expect(button.element().closest('tr')?.hasAttribute('data-expanded')).toBe(true)
  })

  test('the detail row has one cell that spans every column', async () => {
    const { container } = await renderInProvider(<ExpandableTable />)
    await userEvent.click(page.getByRole('button', { name: 'Details Anna Svensson' }))
    const cells = container.querySelectorAll('tr.kv-table-detail-row > td')
    expect(cells).toHaveLength(1)
    const headerCount = container.querySelectorAll('thead th').length
    expect(headerCount).toBe(3)
    await expect.poll(() => cells[0]?.getAttribute('colspan')).toBe(String(headerCount))
  })

  test('the expand button shows its text and a chevron that points the other way once open', async () => {
    const { container } = await renderInProvider(<ExpandableTable />)
    const button = page.getByRole('button', { name: 'Details Anna Svensson' })
    expect(button.element().textContent).toBe('Details')
    const icon = () =>
      button.element().querySelector('svg.kv-table-expand-icon path')?.getAttribute('d')
    const collapsed = icon()
    expect(button.element().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    await userEvent.click(button)
    expect(icon()).not.toBe(collapsed)
    expect(container.querySelectorAll('button.kv-table-expand-button')).toHaveLength(4)
  })

  test('your own children name the expand button instead, with the row header after them', async () => {
    function Custom() {
      const cases = useTable({
        features: expandableFeatures,
        columns: expandableColumns,
        data: records,
        getRowId: (record) => record.id,
        getRowCanExpand: () => true,
        rowHeader: 'name',
      })
      return (
        <Table.Root table={cases}>
          <Table.Caption>Open cases</Table.Caption>
          <Table.Body>
            {(row) => (
              <Table.Row key={row.id} row={row}>
                <Table.Cell>
                  <Table.ExpandButton row={row}>Show more</Table.ExpandButton>
                </Table.Cell>
                {row.getAllCells().map((cell) => (
                  <Table.Cell key={cell.id} cell={cell} />
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      )
    }
    await renderInProvider(<Custom />)
    await expect
      .element(page.getByRole('button', { name: 'Show more Anna Svensson' }))
      .toBeVisible()
  })

  test('the name is the same open and closed: only aria-expanded changes', async () => {
    await renderInProvider(<ExpandableTable />)
    const button = page.getByRole('button', { name: 'Details Anna Svensson' })
    await userEvent.click(button)
    await expect.element(page.getByRole('button', { name: 'Details Anna Svensson' })).toBeVisible()
  })

  test('virtualize with expanding warns and renders every row', async () => {
    const { container } = await renderInProvider(<ExpandableTable virtualize />)
    expect(container.querySelectorAll('tbody tr.kv-table-row')).toHaveLength(4)
    expect(container.querySelector('[data-virtualized]')).toBeNull()
    expect(container.querySelector('[aria-rowcount]')).toBeNull()
    await expect.poll(() => consoleWarn.mock.calls.length).toBeGreaterThan(0)
    expect(consoleWarn.mock.calls.map((call) => String(call[0])).join('\n')).toContain(
      'rowExpandingFeature',
    )
  })
})

describe('states', () => {
  test('an empty row model shows one row with one cell that spans every column', async () => {
    const { container } = await renderInProvider(<CasesTable data={[]} />)
    const empty = container.querySelector('tbody.kv-table-empty')
    expect(empty).not.toBeNull()
    expect(empty?.querySelectorAll('tr')).toHaveLength(1)
    const cells = empty?.querySelectorAll('td') ?? []
    expect(cells).toHaveLength(1)
    expect(cells[0]?.textContent).toBe('No rows to show.')
    await expect.poll(() => cells[0]?.getAttribute('colspan')).toBe('4')
  })

  test('the empty text is replaced by your own', async () => {
    await renderInProvider(<CasesTable data={[]} emptyText="No open cases. Start a new one." />)
    await expect
      .element(page.getByRole('cell', { name: 'No open cases. Start a new one.' }))
      .toBeVisible()
  })

  test('the empty row is in the provider locale, in sv', async () => {
    await renderInProvider(<CasesTable data={[]} />, 'sv')
    await expect
      .element(page.getByRole('cell', { name: 'Det finns inga rader att visa.' }))
      .toBeVisible()
  })

  test('there is no empty row while rows exist', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    expect(container.querySelector('.kv-table-empty')).toBeNull()
  })

  test('isLoading sets aria-busy and data-busy and announces once', async () => {
    const { container } = await renderInProvider(<CasesTable isLoading />)
    const element = container.querySelector('table')
    expect(element?.getAttribute('aria-busy')).toBe('true')
    expect(element?.hasAttribute('data-busy')).toBe(true)
    await expect.element(status()).toHaveTextContent('Loading rows.')
  })

  test('a table that is not loading has no aria-busy', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    expect(container.querySelector('[aria-busy], [data-busy]')).toBeNull()
  })

  test('the empty row says it is loading, not that there are no rows, during a first load', async () => {
    const { container } = await renderInProvider(
      <CasesTable data={[]} isLoading emptyText="You have no open cases." />,
    )
    expect(container.querySelector('.kv-table-empty')?.textContent).toBe('Loading rows.')
  })

  test('the empty row says it is loading in the provider locale, in sv', async () => {
    const { container } = await renderInProvider(<CasesTable data={[]} isLoading />, 'sv')
    expect(container.querySelector('.kv-table-empty')?.textContent).toBe('Laddar rader.')
  })

  test('rows that are already shown are not replaced while loading', async () => {
    const { container } = await renderInProvider(<CasesTable isLoading />)
    expect(container.querySelector('.kv-table-empty')).toBeNull()
    expect(container.querySelectorAll('tbody tr')).toHaveLength(4)
  })

  test('without a provider, nothing is announced and a warning says so', async () => {
    await render(<CasesTable isLoading />)
    await expect
      .poll(() => consoleWarn.mock.calls.map((call) => String(call[0])).join('\n'))
      .toContain('<KvirnProvider>')
  })
})

describe('filtering', () => {
  function FilterableTable() {
    const cases = useTable({
      features,
      columns,
      data: records,
      getRowId: (record) => record.id,
      rowHeader: 'name',
    })
    return (
      <>
        <button
          type="button"
          onClick={() => cases.table.setColumnFilters([{ id: 'name', value: 'a' }])}
        >
          Filter
        </button>
        <button type="button" onClick={() => cases.table.setColumnFilters([])}>
          Clear
        </button>
        <Table.Root table={cases}>
          <Table.Caption>Open cases</Table.Caption>
          <Table.Body>
            {(row) => (
              <Table.Row key={row.id} row={row}>
                {row.getAllCells().map((cell) => (
                  <Table.Cell key={cell.id} cell={cell} />
                ))}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Empty />
        </Table.Root>
      </>
    )
  }

  test('a filter change announces the row count after a pause, once', async () => {
    const { container } = await renderInProvider(<FilterableTable />)
    await userEvent.click(page.getByRole('button', { name: 'Filter' }))
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    // Not at once: the announcement waits for the typing to stop.
    expect(status().element().textContent).toBe('')
    await expect.poll(() => status().element().textContent, { timeout: 3000 }).toBe('3 rows.')
  })

  test('clearing the filter announces the full count and shows every row', async () => {
    const { container } = await renderInProvider(<FilterableTable />)
    await userEvent.click(page.getByRole('button', { name: 'Filter' }))
    await expect.poll(() => status().element().textContent, { timeout: 3000 }).toBe('3 rows.')
    await userEvent.click(page.getByRole('button', { name: 'Clear' }))
    await expect.poll(() => status().element().textContent, { timeout: 3000 }).toBe('4 rows.')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(4)
    expect(container.querySelector('.kv-table-empty')).toBeNull()
  })
})

describe('virtualized', () => {
  const bodyRows = (container: Element) =>
    [...container.querySelectorAll('tbody tr:not([aria-hidden])')] as HTMLTableRowElement[]

  test('only a window of 10 000 rows is mounted, and aria-rowcount says how many there are', async () => {
    const { container } = await renderInProvider(<VirtualTable />)
    await expect.element(page.getByRole('table', { name: 'All cases' })).toBeVisible()
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(0)
    expect(bodyRows(container).length).toBeLessThan(100)
    const element = container.querySelector('table')
    expect(element?.getAttribute('aria-rowcount')).toBe('10001')
    expect(element?.hasAttribute('data-virtualized')).toBe(true)
  })

  test('every rendered row has aria-rowindex, counting the header row', async () => {
    const { container } = await renderInProvider(<VirtualTable />)
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(0)
    expect(container.querySelector('thead tr')?.getAttribute('aria-rowindex')).toBe('1')
    const first = bodyRows(container)[0]
    expect(first?.getAttribute('aria-rowindex')).toBe('2')
    expect(first?.getAttribute('data-index')).toBe('0')
    const indexes = bodyRows(container).map((row) => Number(row.getAttribute('aria-rowindex')))
    expect(indexes).toEqual(indexes.map((_, position) => position + 2))
  })

  test('the rows that are not rendered are spacer rows, hidden from assistive technology', async () => {
    const { container } = await renderInProvider(<VirtualTable />)
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(0)
    const spacers = [...container.querySelectorAll('tbody tr.kv-table-spacer')]
    expect(spacers.length).toBeGreaterThan(0)
    for (const spacer of spacers) {
      expect(spacer.getAttribute('aria-hidden')).toBe('true')
      expect(spacer.querySelectorAll('td')).toHaveLength(1)
      expect(spacer.textContent).toBe('')
    }
    // A spacer spans what is drawn: the two columns.
    await expect
      .poll(() =>
        container.querySelector('tbody tr[aria-hidden="true"] td')?.getAttribute('colspan'),
      )
      .toBe('2')
  })

  test('scrolling to the end renders the last rows with the right aria-rowindex', async () => {
    const { container } = await renderInProvider(<VirtualTable />)
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(0)
    const region = container.querySelector<HTMLElement>('.kv-table-scroll-region')
    if (region === null) throw new Error('no scroll region')
    region.scrollTop = region.scrollHeight
    await expect
      .poll(() => bodyRows(container).at(-1)?.getAttribute('aria-rowindex'), { timeout: 3000 })
      .toBe('10001')
    expect(bodyRows(container).length).toBeLessThan(100)
    expect(container.querySelector('table')?.getAttribute('aria-rowcount')).toBe('10001')
  })

  test('a short list renders every row, and still says how many there are', async () => {
    const { container } = await renderInProvider(<VirtualTable data={manyRecords.slice(0, 5)} />)
    await expect.poll(() => bodyRows(container).length).toBe(5)
    expect(container.querySelector('table')?.getAttribute('aria-rowcount')).toBe('6')
  })

  test('virtualize can be turned on with options', async () => {
    const { container } = await renderInProvider(
      <VirtualTable virtualize={{ estimateSize: 60, overscan: 2 }} />,
    )
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(0)
    expect(bodyRows(container).length).toBeLessThan(100)
  })
})

describe('the scroll region', () => {
  test('a region with no name warns, once it is a region', async () => {
    await render(
      <Table.ScrollRegion region="always">
        <Table.Root aria-label="Fees">
          <Table.Body>
            <Table.Row>
              <Table.Cell>350 kr</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollRegion>,
    )
    await expect.poll(() => consoleWarn.mock.calls.length).toBeGreaterThan(0)
    expect(consoleWarn.mock.calls.map((call) => String(call[0])).join('\n')).toContain(
      'Table.ScrollRegion is a region',
    )
  })

  test('a scroll region that is not a region does not warn about a missing name', async () => {
    await render(
      <Table.ScrollRegion>
        <Table.Root aria-label="Fees">
          <Table.Body>
            <Table.Row>
              <Table.Cell>350 kr</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollRegion>,
    )
    await expect.element(page.getByRole('table', { name: 'Fees' })).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('accessibility', () => {
  test('passes axe: sortable and selectable', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await expect.element(table()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: sorted, with some rows selected', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await expect.element(table()).toBeVisible()
    await userEvent.click(sortButton('Name'))
    await userEvent.click(page.getByRole('checkbox', { name: 'Select Anna Svensson' }))
    await expectNoA11yViolations(container)
  })

  test('passes axe: every row selected', async () => {
    const { container } = await renderInProvider(<CasesTable />)
    await expect.element(table()).toBeVisible()
    await userEvent.click(page.getByRole('checkbox', { name: 'Select all rows' }))
    await expectNoA11yViolations(container)
  })

  test('passes axe: no row header, so the checkboxes are named by number', async () => {
    const { container } = await renderInProvider(<CasesTable withoutRowHeader />)
    await expect.element(table()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: expanded', async () => {
    const { container } = await renderInProvider(<ExpandableTable />)
    await expect.element(table()).toBeVisible()
    await userEvent.click(page.getByRole('button', { name: 'Details Anna Svensson' }))
    await expectNoA11yViolations(container)
  })

  test('passes axe: empty', async () => {
    const { container } = await renderInProvider(<CasesTable data={[]} />)
    await expect.element(table()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: busy', async () => {
    const { container } = await renderInProvider(<CasesTable isLoading />)
    await expect.element(table()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: virtualized', async () => {
    const { container } = await renderInProvider(<VirtualTable />)
    await expect.element(page.getByRole('table', { name: 'All cases' })).toBeVisible()
    await expect
      .poll(() => container.querySelectorAll('tbody tr:not([aria-hidden])').length)
      .toBeGreaterThan(0)
    await expectNoA11yViolations(container)
  })

  test('passes axe: static, without table', async () => {
    const { container } = await render(
      <Table.Root>
        <Table.Caption>Fees</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>Service</Table.ColumnHeader>
            <Table.ColumnHeader>Fee</Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.RowHeader>Passport</Table.RowHeader>
            <Table.Cell>350 kr</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    )
    await expect.element(page.getByRole('table', { name: 'Fees' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: in Swedish', async () => {
    const { container } = await renderInProvider(<CasesTable />, 'sv')
    await expect.element(table()).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
