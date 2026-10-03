import contract from '../../../../../packages/react/src/table/table.a11y.md?raw'
import guide from '../../../../../packages/react/src/table/table.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize } from '../theme-story-assertions.ts'
import {
  EmptyCases,
  EverythingCases,
  ExpandableCases,
  KeyboardCases,
  LoadingCases,
  NarrowCases,
  PaginatedCases,
  SelectableCases,
  SortableCases,
  StaticPayments,
  VirtualizedCases,
} from './table.fixture.tsx'

// Components/Table: a native table with TanStack Table bundled (Plan 0026, ADR-0035, ADR-0059,
// ADR-0061, design spec docs/design/table.md). A static table needs no `useTable`: every part is
// the plain native element. With `useTable` it sorts one column at a time, selects, expands,
// paginates and virtualizes. Every story has a caption, which names the table and its region.
// table.e2e.ts runs the keys of the Keyboard story, the sticky head, RTL, forced colours and 320px.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Table',
  component: SortableCases,
  globals: { locale: 'sv' },
  argTypes: {
    locale: { control: false },
    data: { control: false },
    selected: { control: false },
    expanded: { control: false },
    caption: { control: 'text', description: 'The table’s name: its `Table.Caption`.' },
    isLoading: { control: 'boolean', description: '`aria-busy`, and the loading announcement.' },
    withLinks: { control: 'boolean' },
    longHeader: { control: 'boolean' },
  },
  args: { locale: 'sv' },
  decorators: [withFormLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
  render: (args, { globals }) => <SortableCases {...args} locale={localeOf(globals)} />,
} satisfies Meta<typeof SortableCases>

export default meta
type Story = StoryObj<typeof meta>

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
    const table = canvasElement.querySelector('table')
    await expect(table).not.toBeNull()
    if (table === null) return
    await expect(getComputedStyle(table).display).toBe('table')
    await expect(getComputedStyle(table.querySelector('tr') ?? table).display).toBe('table-row')
    await expect(getComputedStyle(table.querySelector('th') ?? table).display).toBe('table-cell')
    await expect(getComputedStyle(table.querySelector('thead') ?? table).display).toBe(
      'table-header-group',
    )
    const figure = canvasElement.querySelector('.kv-table-cell--numeric')
    await expect(getComputedStyle(figure ?? table).textAlign).toBe('end')
    await expect(canvasElement.querySelector('[aria-sort]')).toBeNull()
  },
}

/**
 * Four sortable columns and one that isn't, sorted by name at first: one header has `aria-sort`,
 * one icon is an up chevron and the others show the two-chevron sort icon. The amount is a
 * quantity, so it is aligned to the end with the numeric classes.
 */
export const Sortable: Story = {
  parameters: showSource('table/table.fixture.tsx', 'SortableCases'),
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
    const { width, height } = checkbox.getBoundingClientRect()
    await expect(width).toBe(24)
    await expect(height).toBe(24)
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
    await expect(canvasElement.querySelector(`[id="${controlled}"]`)).toHaveClass(
      'kv-table-detail-row',
    )
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
    await expect(getComputedStyle(cell).textAlign).toBe('start')
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
 * The recipe until the Pagination component exists: 312 rows, 20 a page, a caption that says which
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
    await expect(getComputedStyle(table ?? canvasElement).tableLayout).toBe('fixed')
    for (const spacer of canvasElement.querySelectorAll('tr.kv-table-spacer')) {
      await expect(spacer).toHaveAttribute('aria-hidden', 'true')
    }
  },
}

/**
 * A 320px screen in Finnish, with a long header that wraps. The table is wider than its region, so
 * only the region scrolls and it is a Tab stop with the caption as its name. Open this story in a
 * 320px viewport: the e2e test does.
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
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Open cases' })).toBeVisible()
    await expect(
      getComputedStyle(canvasElement.querySelector('.kv-table-cell--numeric') ?? canvasElement)
        .direction,
    ).toBe('rtl')
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
  render: (_args, { globals }) => <KeyboardCases locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('table', { name: 'Öppna ärenden' })).toBeVisible()
    await waitFor(() => expect(regionOf(canvasElement)).toHaveAttribute('tabindex', '0'))
  },
}
