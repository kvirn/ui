import { Table } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/table/table.a11y.md?raw'
import guide from '../../../../../packages/react/src/table/table.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import {
  AlwaysRegionPayments,
  ColumnVisibilityCases,
  EmptyCases,
  EverythingCases,
  ExpandableCases,
  KeyboardCases,
  LoadingCases,
  NarrowCases,
  PaginatedCases,
  SearchCases,
  SelectableCases,
  SortableCases,
  StaticLateHeadCases,
  StaticPayments,
  StaticScrollingCases,
  StyledCases,
  VirtualizedCases,
  withTableLocale,
} from './table.fixture.tsx'

// Components/Table: a native table with TanStack Table bundled (Plan 0026,
// design spec docs/design/table.md). A static table needs no `useTable`: every part is
// the plain native element. With `useTable` it sorts one column at a time, selects, expands,
// paginates and virtualizes. Every story names its table and its region: the small resident tables with
// a `Table.Caption`, and the staff lists with a visible `Heading` that `aria-labelledby` points at.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Data and behaviour/Table',
  component: Table.Root,
  globals: { locale: 'sv' },
  argTypes: {
    table: {
      control: false,
      description:
        'The result of `useTable()`. Without it every part is the plain native element, so a small static table needs no TanStack Table. Pass it to `Table.ScrollRegion` too, so the region is named by the caption.',
    },
    className: {
      control: 'text',
      description: 'Your own classes, added to `kv-table`.',
    },
  },
  decorators: [withTableLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Table.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A region narrower than the table and limited in height: it scrolls both ways and the head sticks. */
const limitedRegion = {
  maxInlineSize: '40rem',
  '--kv-table-scroll-region-max-block-size': '22rem',
} as CSSProperties

/** The sort buttons of a canvas: the header text is the button. */
const sortButtons = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLButtonElement>('.kv-table-sort-button'),
]

const sortedHeaders = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('th[aria-sort]'),
]

/** The region around the first table of the canvas. */
const regionOf = (canvasElement: HTMLElement) => {
  const region = canvasElement.querySelector<HTMLElement>('.kv-table-scroll-region')
  if (region === null) {
    throw new Error('no scroll region')
  }
  return region
}

/**
 * A resident's table, without `useTable`: plain parts with row headers, a start-aligned date
 * column, a numeric column and a foot. Every element keeps its native display.
 */
export const Static: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StaticPayments'),
  render: (_args, { globals }) => <StaticPayments locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Utbetalt bostadsbidrag 2026' })).toBeVisible()
    await expect(canvasElement.querySelector('[aria-sort]')).toBeNull()
    // It fits, so the region around it is a plain `<div>`: no role, no name, no tab stop.
    await expect(canvas.queryByRole('region')).toBeNull()
    await expect(regionOf(canvasElement)).not.toHaveAttribute('tabindex')
    await expect(regionOf(canvasElement)).not.toHaveAttribute('aria-labelledby')
  },
}

/**
 * The same table with `region="always"` on `Table.ScrollRegion`: a named `region` landmark even
 * though nothing scrolls, for a page where a table should be something to jump to. It is still a
 * Tab stop only while it scrolls.
 */
export const AlwaysRegion: Story = {
  parameters: showSource('table/table.fixture.tsx', 'AlwaysRegionPayments'),
  render: (_args, { globals }) => <AlwaysRegionPayments locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('region', { name: 'Utbetalt bostadsbidrag 2026' })).toBeVisible()
    await expect(regionOf(canvasElement)).not.toHaveAttribute('tabindex')
  },
}

/**
 * A static table taller than its region, with a link in each row: the region is a Tab stop, the
 * head sticks, and a focused link is never hidden under it. No `useTable` is needed.
 */
export const StaticScrolling: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StaticScrollingCases'),
  decorators: [
    (Story) => (
      <div style={{ '--kv-table-scroll-region-max-block-size': '16rem' } as CSSProperties}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <StaticScrollingCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await waitFor(() => expect(regionOf(canvasElement)).toHaveAttribute('tabindex', '0'))
    // It scrolls, so it is a region named by the caption.
    await expect(canvas.getByRole('region', { name: 'Öppna ärenden' })).toBeVisible()
  },
}

/**
 * The same table, with its head added after the region has mounted, like a table that renders once
 * its data has arrived. The region finds the head and measures it, so a focused link is still never
 * hidden under the sticky head.
 */
export const StaticLateHead: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StaticLateHeadCases'),
  decorators: [
    (Story) => (
      <div style={{ '--kv-table-scroll-region-max-block-size': '16rem' } as CSSProperties}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <StaticLateHeadCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await waitFor(() => expect(canvasElement.querySelector('thead')).not.toBeNull())
    await waitFor(() => expect(regionOf(canvasElement)).toHaveAttribute('tabindex', '0'))
  },
}

/**
 * `kv-table--card` on `Table.Root`: a border and rounded corners, opt in. The default table has
 * no frame.
 */
export const Card: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StyledCases'),
  render: (_args, { globals }) => (
    <StyledCases locale={localeOf(globals)} className="kv-table--card" />
  ),
}

/**
 * `kv-table--striped`: every second body row has the surface fill. A selected row keeps its own
 * fill, and the stripes carry no meaning: the markup is the same.
 */
export const Striped: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StyledCases'),
  render: (_args, { globals }) => (
    <StyledCases locale={localeOf(globals)} className="kv-table--striped" />
  ),
}

/** Both modifiers together. */
export const CardStriped: Story = {
  parameters: showSource('table/table.fixture.tsx', 'StyledCases'),
  render: (_args, { globals }) => (
    <StyledCases locale={localeOf(globals)} className="kv-table--card kv-table--striped" />
  ),
}

/** Both modifiers with two rows selected: a selected row keeps its own fill and its checked box. */
export const CardStripedSelectable: Story = {
  parameters: showSource('table/table.fixture.tsx', 'SelectableCases'),
  render: (_args, { globals }) => (
    <SelectableCases locale={localeOf(globals)} className="kv-table--card kv-table--striped" />
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('tr[data-selected]')).toHaveLength(2)
  },
}

/**
 * Four sortable columns and one that isn't, sorted by name at first: one header has `aria-sort`,
 * one icon is an up chevron and the others show the two-chevron sort icon. The amount is a
 * quantity, so it is aligned to the end with the numeric classes.
 */
export const Sortable: Story = {
  parameters: showSource('table/table.fixture.tsx', 'SortableCases'),
  render: (_args, { globals }) => <SortableCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await expect(sortedHeaders(canvasElement)).toHaveLength(1)
    await expect(sortedHeaders(canvasElement)[0]).toHaveAttribute('aria-sort', 'ascending')
    await expect(sortedHeaders(canvasElement)[0]).toHaveAttribute('data-sort', 'ascending')
    for (const icon of canvasElement.querySelectorAll('.kv-table-sort-icon')) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
    for (const button of sortButtons(canvasElement)) {
      await expectMinimumTargetSize(button)
    }
  },
}

/**
 * The case list in `kv-compact`, a staff tool: two rows selected, so select all is mixed, and a
 * link in each row header. A selected row has `data-selected`, never `aria-selected`.
 */
export const Selectable: Story = {
  parameters: showSource('table/table.fixture.tsx', 'SelectableCases'),
  render: (_args, { globals }) => <SelectableCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('tr[data-selected]')).toHaveLength(2)
    await expect(canvasElement.querySelector('[aria-selected]')).toBeNull()
    const checkbox = canvas.getByRole('checkbox', { name: 'Välj Anna Svensson' })
    await expect(checkbox).toBeChecked()
    const selectAll = canvas.getByRole('checkbox', { name: 'Välj alla rader' })
    await expect(selectAll).toBePartiallyChecked()
    await expectMinimumTargetSize(checkbox)
  },
}

/**
 * The expand button comes first in each row, so it is in view on a small screen. One row is
 * expanded, with a description list in its detail row, which has one cell that spans every column.
 */
export const Expandable: Story = {
  parameters: showSource('table/table.fixture.tsx', 'ExpandableCases'),
  render: (_args, { globals }) => <ExpandableCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    const open = canvas.getByRole('button', { name: 'Detaljer Matti Virtanen' })
    await expect(open).toHaveAttribute('aria-expanded', 'true')
    const controlled = open.getAttribute('aria-controls') ?? ''
    await expect(canvasElement.querySelector(`[id="${controlled}"]`)).not.toBeNull()
    await expect(canvasElement.querySelectorAll('.kv-table-detail-row > td')).toHaveLength(1)
    const closed = canvas.getByRole('button', { name: 'Detaljer Anna Svensson' })
    await expect(closed).toHaveAttribute('aria-expanded', 'false')
    await expectMinimumTargetSize(closed)
  },
}

/**
 * No rows: the head stays, and one row that spans every column says what happened and what to do,
 * at the start and in the text colour.
 */
export const Empty: Story = {
  parameters: showSource('table/table.fixture.tsx', 'EmptyCases'),
  render: (_args, { globals }) => <EmptyCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('cell', {
        name: 'Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret.',
      }),
    ).toBeVisible()
    const cell = canvasElement.querySelector<HTMLElement>('.kv-table-empty td')
    await expect(cell).not.toBeNull()
    if (cell === null) return
    await waitFor(() =>
      expect(Number(cell.getAttribute('colspan'))).toBe(
        canvasElement.querySelectorAll('thead th').length,
      ),
    )
  },
}

/**
 * A reload with rows on screen (full contrast, a hatched bar on the head's lower edge) above a
 * first load with no rows yet (the empty row says it is loading). Each has `aria-busy`.
 */
export const Loading: Story = {
  parameters: showSource('table/table.fixture.tsx', 'LoadingCases'),
  render: (_args, { globals }) => <LoadingCases locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    const tables = canvasElement.querySelectorAll('table')
    await expect(tables).toHaveLength(2)
    for (const table of tables) {
      await expect(table).toHaveAttribute('aria-busy', 'true')
      await expect(table).toHaveAttribute('data-busy')
    }
    await expect(canvasElement.querySelector('.kv-table-empty td')).toHaveTextContent(
      'Laddar rader.',
    )
  },
}

/**
 * Choosing the columns with `columnVisibilityFeature`: a labelled group of checkboxes, one for each
 * column that can be hidden (the name can't). The handler starts hidden; checking its box adds the
 * column.
 */
export const ColumnVisibility: Story = {
  parameters: showSource('table/table.fixture.tsx', 'ColumnVisibilityCases'),
  render: (_args, { globals }) => <ColumnVisibilityCases locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Visa kolumner' })).toBeVisible()
    await expect(canvas.queryByRole('checkbox', { name: 'Namn' })).toBeNull()
    await expect(canvas.queryByRole('columnheader', { name: 'Handläggare' })).toBeNull()
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Handläggare' }))
    await expect(canvas.getByRole('columnheader', { name: 'Handläggare' })).toBeVisible()
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Ärendenummer' }))
    await expect(canvas.queryByRole('columnheader', { name: 'Ärendenummer' })).toBeNull()
    await expect(canvas.getByRole('checkbox', { name: 'Ärendenummer' })).not.toBeChecked()
  },
}

/**
 * A search box with `globalFilteringFeature`: a `search` landmark and a labelled field. The row
 * count is announced after the typing pauses, and a search with no match shows the empty row.
 */
export const Search: Story = {
  parameters: showSource('table/table.fixture.tsx', 'SearchCases'),
  render: (_args, { globals }) => <SearchCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    // Testing Library has no role mapping for <search> yet, so the element itself is checked.
    await expect(canvasElement.querySelector('search')).not.toBeNull()
    const field = canvas.getByRole('searchbox', { name: 'Sök bland ärenden' })
    await userEvent.type(field, 'Anna')
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(2))
    await userEvent.clear(field)
    await userEvent.type(field, 'zzz')
    await expect(
      await canvas.findByRole('cell', {
        name: 'Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret.',
      }),
    ).toBeVisible()
  },
}

/**
 * The recipe until the Pagination component exists: 312 rows, 20 a page, a title that says which
 * rows are shown, and Previous and Next in a button group after the table. The table has no
 * `aria-rowcount`: each page is its own small table.
 */
export const PaginatedRecipe: Story = {
  parameters: showSource('table/table.fixture.tsx', 'PaginatedCases'),
  render: (_args, { globals }) => <PaginatedCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('table', { name: 'Öppna ärenden, rad 21–40 av 312' }),
    ).toBeVisible()
    await expect(canvasElement.querySelector('[aria-rowcount]')).toBeNull()
    const next = canvas.getByRole('button', { name: 'Nästa' })
    await userEvent.click(next)
    await waitFor(() =>
      expect(canvas.getByRole('table', { name: 'Öppna ärenden, rad 41–60 av 312' })).toBeVisible(),
    )
    await expect(next).toHaveFocus()
  },
}

/**
 * 10 000 rows in `kv-compact`, with `virtualize` and a width for each column. The region is limited
 * to 80svh and the head sticks. Spacer rows are hidden from assistive technology and draw nothing.
 * `aria-rowcount` and `aria-rowindex` say how big the table is and where each row is.
 */
export const Virtualized: Story = {
  parameters: showSource('table/table.fixture.tsx', 'VirtualizedCases'),
  render: (_args, { globals }) => <VirtualizedCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Alla ärenden' })).toBeVisible()
    const table = canvasElement.querySelector('table')
    await expect(table).toHaveAttribute('aria-rowcount', '10001')
    await expect(table).toHaveAttribute('data-virtualized')
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('tbody tr:not([aria-hidden])').length).toBeGreaterThan(
        0,
      ),
    )
    await expect(canvasElement.querySelectorAll('tbody tr:not([aria-hidden])').length).toBeLessThan(
      100,
    )
    for (const spacer of canvasElement.querySelectorAll('tr.kv-table-spacer')) {
      await expect(spacer).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

/**
 * A 320px screen in Finnish, with a long header that wraps. The table is wider than its region, so
 * only the region scrolls and it is a Tab stop, named by the table's title. Open this story in a
 * 320px viewport to see it.
 */
export const NarrowScreen: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('table/table.fixture.tsx', 'NarrowCases'),
  render: (_args, { globals }) => <NarrowCases locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Avoimet asiat' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Hakemuksen vastaanottopäivä' })).toBeVisible()
  },
}

/** Right to left, in English: the columns, the sort icons and the numeric column mirror. */
export const RightToLeft: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('table/table.fixture.tsx', 'SelectableCases'),
  render: (_args, { globals }) => <SelectableCases locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Open cases' })).toBeVisible()
  },
}

/**
 * Everything in one table, for forced colours and the design review: a sorted and an unsorted
 * header, two selected rows, one expanded row, `aria-busy`, and a region that scrolls both ways
 * under a sticky head.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('table/table.fixture.tsx', 'EverythingCases'),
  decorators: [
    (Story) => (
      <div style={limitedRegion}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <EverythingCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await expect(canvasElement.querySelectorAll('tr[data-selected]')).toHaveLength(2)
    await expect(canvasElement.querySelectorAll('tr.kv-table-row[data-expanded]')).toHaveLength(1)
    await expect(canvasElement.querySelector('table')).toHaveAttribute('data-busy')
  },
}

/**
 * The fixture the keyboard tests drive: a region narrower than the table (so it is a Tab stop),
 * select all, sortable headers, and in each row a checkbox, an expand button and a link. Try the
 * keys in the table above: Tab through the controls, Enter or Space on a sort or expand button,
 * Space on a checkbox, and the arrow keys on the focused region.
 */
export const Keyboard: Story = {
  parameters: showSource('table/table.fixture.tsx', 'KeyboardCases'),
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '30rem' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <KeyboardCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await waitFor(() => expect(regionOf(canvasElement)).toHaveAttribute('tabindex', '0'))
  },
}
