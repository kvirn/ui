import {
  Button,
  Link,
  Table,
  columnSizingFeature,
  createColumnHelper,
  createExpandedRowModel,
  createLocaleSortFn,
  createPaginatedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@kvirn-ui/react'
import type { UseTableResult } from '@kvirn-ui/react'
import { useId, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Table (Plan 0026, design spec docs/design/table.md §4.2,
// §6.17). sv, en and fi are written, and the fi strings are the designer's drafts for length
// checks only. nb, nn and se come from a translator, not an agent: until then those locales show
// the English text, marked lang="en" (3.1.2). The library's own strings (the checkbox names, the
// announcements, "Detaljer") follow the locale through the provider decorator of the stories.
// Numbers and dates are values, formatted with Intl.
//
// Each exported function is one example, written to be read: it is what "Show code" shows.

export interface CaseRecord {
  id: string
  name: string
  caseNumber: string
  received: string
  amount: number
  handler: string
  decision: string
}

interface TableTexts {
  casesCaption: string
  name: string
  caseNumber: string
  received: string
  receivedLong: string
  amount: string
  handler: string
  handlerLabel: string
  decisionLabel: string
  paymentsCaption: string
  month: string
  payoutDate: string
  paymentAmount: string
  total: string
  emptyNoData: string
  emptyFiltered: string
  reloadCaption: string
  firstLoadCaption: string
  pagedCaption: (from: number, to: number, total: number) => string
  previous: string
  next: string
  virtualCaption: string
  keyboardCaption: string
}

const en: TableTexts = {
  casesCaption: 'Open cases',
  name: 'Name',
  caseNumber: 'Case number',
  received: 'Received',
  receivedLong: 'Date the application was received',
  amount: 'Amount (SEK)',
  handler: 'Handler',
  handlerLabel: 'Handler',
  decisionLabel: 'Decision',
  paymentsCaption: 'Housing allowance paid in 2026',
  month: 'Month',
  payoutDate: 'Payout date',
  paymentAmount: 'Amount (SEK)',
  total: 'Total',
  emptyNoData: 'You have no open cases.',
  emptyFiltered: 'No cases match your search. Change your search or clear the filter.',
  reloadCaption: 'Open cases, updating',
  firstLoadCaption: 'Open cases, first load',
  pagedCaption: (from, to, total) => `Open cases, rows ${from}–${to} of ${total}`,
  previous: 'Previous',
  next: 'Next',
  virtualCaption: 'All cases',
  keyboardCaption: 'Open cases',
}

const sv: TableTexts = {
  casesCaption: 'Öppna ärenden',
  name: 'Namn',
  caseNumber: 'Ärendenummer',
  received: 'Inkommet',
  receivedLong: 'Datum då ansökan kom in',
  amount: 'Belopp (kr)',
  handler: 'Handläggare',
  handlerLabel: 'Handläggare',
  decisionLabel: 'Beslut',
  paymentsCaption: 'Utbetalt bostadsbidrag 2026',
  month: 'Månad',
  payoutDate: 'Utbetalningsdag',
  paymentAmount: 'Belopp (kr)',
  total: 'Totalt',
  emptyNoData: 'Du har inga öppna ärenden.',
  emptyFiltered: 'Inga ärenden matchar sökningen. Ändra sökningen eller rensa filtret.',
  reloadCaption: 'Öppna ärenden, uppdateras',
  firstLoadCaption: 'Öppna ärenden, första inläsningen',
  pagedCaption: (from, to, total) => `Öppna ärenden, rad ${from}–${to} av ${total}`,
  previous: 'Föregående',
  next: 'Nästa',
  virtualCaption: 'Alla ärenden',
  keyboardCaption: 'Öppna ärenden',
}

const fi: TableTexts = {
  casesCaption: 'Avoimet asiat',
  name: 'Nimi',
  caseNumber: 'Asianumero',
  received: 'Saapunut',
  receivedLong: 'Hakemuksen vastaanottopäivä',
  amount: 'Summa (€)',
  handler: 'Käsittelijä',
  handlerLabel: 'Käsittelijä',
  decisionLabel: 'Päätös',
  paymentsCaption: 'Maksettu asumistuki 2026',
  month: 'Kuukausi',
  payoutDate: 'Maksupäivä',
  paymentAmount: 'Summa (€)',
  total: 'Yhteensä',
  emptyNoData: 'Sinulla ei ole avoimia asioita.',
  emptyFiltered: 'Haulla ei löydy asioita. Muuta hakua tai tyhjennä suodatin.',
  reloadCaption: 'Avoimet asiat, päivitetään',
  firstLoadCaption: 'Avoimet asiat, ensimmäinen lataus',
  pagedCaption: (from, to, total) => `Avoimet asiat, rivit ${from}–${to} / ${total}`,
  previous: 'Edellinen',
  next: 'Seuraava',
  virtualCaption: 'Kaikki asiat',
  keyboardCaption: 'Avoimet asiat',
}

const tableTexts: Partial<Record<FormLocale, TableTexts>> = { sv, fi, en }

const formatLocales: Record<'sv' | 'fi' | 'en', string> = { sv: 'sv', fi: 'fi', en: 'en' }

interface ResolvedTexts {
  texts: TableTexts
  /** `'en'` when the locale isn't translated yet: put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` until it's translated. */
export function tableTextsFor(locale: FormLocale): ResolvedTexts {
  const texts = tableTexts[locale]
  return {
    texts: texts ?? en,
    lang: texts === undefined ? 'en' : undefined,
    formatLocale: formatLocales[locale === 'sv' || locale === 'fi' ? locale : 'en'],
  }
}

export const cases: CaseRecord[] = [
  {
    id: 'c1',
    name: 'Anna Svensson',
    caseNumber: 'BN 2026-0412',
    received: '2026-03-02',
    amount: 12600,
    handler: 'Karin Holm',
    decision: 'Beviljad',
  },
  {
    id: 'c2',
    name: 'Matti Virtanen',
    caseNumber: 'BN 2026-0415',
    received: '2026-03-04',
    amount: 4200,
    handler: 'Jonas Berg',
    decision: 'Under utredning',
  },
  {
    id: 'c3',
    name: 'Elle Sara',
    caseNumber: 'BN 2026-0419',
    received: '2026-03-05',
    amount: 850,
    handler: 'Karin Holm',
    decision: 'Ej beslutat',
  },
  {
    id: 'c4',
    name: 'Åsa Lindqvist',
    caseNumber: 'BN 2026-0423',
    received: '2026-02-27',
    amount: 7300,
    handler: 'Jonas Berg',
    decision: 'Beviljad',
  },
  {
    id: 'c5',
    name: 'Zacharias Öberg',
    caseNumber: 'BN 2026-0431',
    received: '2026-03-09',
    amount: 15900,
    handler: 'Sofia Nyberg',
    decision: 'Under utredning',
  },
]

/** `count` made-up cases, for the paginated and the virtualized examples. */
export function manyCases(count: number): CaseRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const base = cases[index % cases.length] ?? cases[0]
    return {
      id: `n${index}`,
      name: `${base?.name ?? ''} ${index + 1}`,
      caseNumber: `BN 2026-${String(1000 + index).padStart(4, '0')}`,
      received: `2026-0${(index % 9) + 1}-${String((index % 27) + 1).padStart(2, '0')}`,
      amount: 500 + ((index * 937) % 20000),
      handler: base?.handler ?? '',
      decision: base?.decision ?? '',
    }
  })
}

// One sort for the whole fixture: the names are Swedish and Finnish, where å, ä and ö come after z.
const sortFns = { locale: createLocaleSortFn('sv') }

const caseFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowSelectionFeature,
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})
type CaseFeatures = typeof caseFeatures

const pagedFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

const virtualFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowSelectionFeature,
  columnSizingFeature,
})

interface ColumnOptions {
  /** The row header is a link, as in a case list. */
  withLinks?: boolean
  /** The long header of the narrow-screen example. */
  longHeader?: boolean
}

const numberFormat = (formatLocale: string) => new Intl.NumberFormat(formatLocale)
const dateFormat = (formatLocale: string) =>
  new Intl.DateTimeFormat(formatLocale, { dateStyle: 'short', timeZone: 'UTC' })
const asDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`)

function createCaseColumns(
  texts: TableTexts,
  formatLocale: string,
  { withLinks = false, longHeader = false }: ColumnOptions,
) {
  const column = createColumnHelper<CaseFeatures, CaseRecord>()
  const numbers = numberFormat(formatLocale)
  const dates = dateFormat(formatLocale)
  return column.columns([
    column.accessor('name', {
      header: texts.name,
      sortFn: 'locale',
      cell: withLinks
        ? (info) => <Link.Root href={`#${info.row.id}`}>{info.getValue()}</Link.Root>
        : (info) => info.getValue(),
    }),
    column.accessor('caseNumber', { header: texts.caseNumber }),
    column.accessor('received', {
      header: longHeader ? texts.receivedLong : texts.received,
      cell: (info) => dates.format(asDate(info.getValue())),
    }),
    column.accessor('amount', {
      header: texts.amount,
      cell: (info) => numbers.format(info.getValue()),
    }),
    column.accessor('handler', { header: texts.handler, enableSorting: false }),
  ])
}

const isNumeric = (columnId: string) => columnId === 'amount'

interface CasesViewProps {
  cases: UseTableResult<CaseFeatures, CaseRecord>
  caption: string
  selectable?: boolean
  expandable?: boolean
  locale: FormLocale
}

/** The case list: the parts of the Table written out, with the numeric column applied. */
function CasesView({ cases: list, caption, selectable, expandable, locale }: CasesViewProps) {
  const { texts } = tableTextsFor(locale)
  return (
    <Table.ScrollRegion table={list}>
      <Table.Root table={list}>
        <Table.Caption>{caption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              {selectable ? (
                <Table.ColumnHeader>
                  <Table.SelectAllCheckbox />
                </Table.ColumnHeader>
              ) : null}
              {expandable ? (
                <Table.ColumnHeader>
                  <span className="kv-table-visually-hidden">{list.expandButtonText}</span>
                </Table.ColumnHeader>
              ) : null}
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    isNumeric(header.column.id) ? 'kv-table-column-header--numeric' : undefined
                  }
                >
                  {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => (
            <>
              <Table.Row key={row.id} row={row}>
                {selectable ? (
                  <Table.Cell>
                    <Table.SelectCheckbox row={row} />
                  </Table.Cell>
                ) : null}
                {expandable ? (
                  <Table.Cell>
                    <Table.ExpandButton row={row} />
                  </Table.Cell>
                ) : null}
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={isNumeric(cell.column.id) ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
              {expandable ? (
                <Table.DetailRow row={row}>
                  <dl>
                    <dt>{texts.handlerLabel}</dt>
                    <dd>{list.table.getRow(row.id).original.handler}</dd>
                    <dt>{texts.decisionLabel}</dt>
                    <dd>{list.table.getRow(row.id).original.decision}</dd>
                  </dl>
                </Table.DetailRow>
              ) : null}
            </>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}

export interface CasesExampleProps {
  locale: FormLocale
  /** Rows to start selected, by id. */
  selected?: readonly string[]
  /** Rows to start expanded, by id. */
  expanded?: readonly string[]
  data?: readonly CaseRecord[]
  isLoading?: boolean
  withLinks?: boolean
  longHeader?: boolean
  caption?: string
}

/** The state a table starts in: the first column sorted, some rows selected, one expanded. */
function startingState(selected: readonly string[], expanded: readonly string[], sorted: boolean) {
  return {
    ...(sorted ? { sorting: [{ id: 'name', desc: false }] } : {}),
    rowSelection: Object.fromEntries(selected.map((id) => [id, true as const])),
    expanded: Object.fromEntries(expanded.map((id) => [id, true])),
  }
}

/** Sortable and selectable and expandable: the case list every example below is a cut of. */
function useCases(
  locale: FormLocale,
  options: Pick<
    CasesExampleProps,
    'selected' | 'expanded' | 'data' | 'isLoading' | 'withLinks' | 'longHeader'
  > & { sorted: boolean },
) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(
    () =>
      createCaseColumns(texts, formatLocale, {
        withLinks: options.withLinks ?? false,
        longHeader: options.longHeader ?? false,
      }),
    [texts, formatLocale, options.withLinks, options.longHeader],
  )
  return useTable({
    features: caseFeatures,
    columns,
    data: options.data ?? cases,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
    isLoading: options.isLoading,
    initialState: startingState(options.selected ?? [], options.expanded ?? [], options.sorted),
  })
}

/** A table that sorts: four sortable columns and one that isn't, sorted by name at first. */
export function SortableCases({ locale, data, caption }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: true, ...(data === undefined ? {} : { data }) })
  return <CasesView cases={list} caption={caption ?? texts.casesCaption} locale={locale} />
}

/** A staff tool: compact rows, two selected, a link in the row header. Select all is mixed. */
export function SelectableCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: true, selected: ['c1', 'c3'], withLinks: true })
  return (
    <div className="kv-compact">
      <CasesView cases={list} caption={texts.casesCaption} selectable locale={locale} />
    </div>
  )
}

/** The expand button comes first in each row, so it is in view on a small screen. */
export function ExpandableCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: false, expanded: ['c2'] })
  return <CasesView cases={list} caption={texts.casesCaption} expandable locale={locale} />
}

/** No rows: the head stays, and the empty row says what happened and what to do. */
export function EmptyCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: false, data: [] })
  return (
    <Table.ScrollRegion table={list}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <Table.SelectAllCheckbox />
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id} header={header} />
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>{() => null}</Table.Body>
        <Table.Empty>{texts.emptyFiltered}</Table.Empty>
      </Table.Root>
    </Table.ScrollRegion>
  )
}

/** A reload with rows on screen (full contrast) and a first load with none (the empty row says so). */
export function LoadingCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const reload = useCases(locale, { sorted: false, isLoading: true })
  const firstLoad = useCases(locale, { sorted: false, data: [], isLoading: true })
  return (
    <>
      <CasesView cases={reload} caption={texts.reloadCaption} locale={locale} />
      <CasesView cases={firstLoad} caption={texts.firstLoadCaption} locale={locale} />
    </>
  )
}

/** A region narrower than the table and limited in height: it scrolls both ways and the head sticks. */
const limitedRegion = {
  maxInlineSize: '40rem',
  '--kv-table-scroll-region-max-block-size': '22rem',
} as CSSProperties

/** Everything the theme draws, in one table: for forced colours and the design review. */
export function EverythingCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, {
    sorted: true,
    selected: ['c1', 'c3'],
    expanded: ['c2'],
    isLoading: true,
  })
  return (
    <div style={limitedRegion}>
      <CasesView cases={list} caption={texts.casesCaption} selectable expandable locale={locale} />
    </div>
  )
}

/** The long header of a narrow screen wraps, and the table scrolls inside its region. */
export function NarrowCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: true, longHeader: true })
  return (
    <div className="kv-compact">
      <CasesView cases={list} caption={texts.casesCaption} locale={locale} />
    </div>
  )
}

/** The fixture of the keyboard tests: a region narrower than the table, and a control of each kind. */
export function KeyboardCases({ locale }: CasesExampleProps) {
  const { texts } = tableTextsFor(locale)
  const list = useCases(locale, { sorted: false, withLinks: true })
  return (
    <div style={{ maxInlineSize: '30rem' }}>
      <CasesView
        cases={list}
        caption={texts.keyboardCaption}
        selectable
        expandable
        locale={locale}
      />
    </div>
  )
}

/** A resident's table, without `useTable`: plain parts, a numeric column and a foot. */
export function StaticPayments({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const captionId = useId()
  const payments = [
    { id: 'p1', date: '2026-01-23', amount: 1050 },
    { id: 'p2', date: '2026-02-25', amount: 1050 },
    { id: 'p3', date: '2026-03-25', amount: 1050 },
  ]
  const numbers = numberFormat(formatLocale)
  const dates = dateFormat(formatLocale)
  const months = new Intl.DateTimeFormat(formatLocale, { month: 'long', timeZone: 'UTC' })
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
  return (
    <Table.ScrollRegion aria-labelledby={captionId}>
      <Table.Root>
        <Table.Caption id={captionId}>{texts.paymentsCaption}</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>{texts.month}</Table.ColumnHeader>
            <Table.ColumnHeader>{texts.payoutDate}</Table.ColumnHeader>
            <Table.ColumnHeader className="kv-table-column-header--numeric">
              {texts.paymentAmount}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {payments.map((payment) => {
            const month = months.format(asDate(payment.date))
            return (
              <Table.Row key={payment.id}>
                <Table.RowHeader>
                  {month.charAt(0).toLocaleUpperCase(formatLocale) + month.slice(1)}
                </Table.RowHeader>
                <Table.Cell>{dates.format(asDate(payment.date))}</Table.Cell>
                <Table.Cell className="kv-table-cell--numeric">
                  {numbers.format(payment.amount)}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.RowHeader>{texts.total}</Table.RowHeader>
            <Table.Cell />
            <Table.Cell className="kv-table-cell--numeric">{numbers.format(total)}</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table.Root>
    </Table.ScrollRegion>
  )
}

const pagedCases = manyCases(312)
const pageSize = 20

/** 312 rows, 20 a page. The caption says which rows are shown; focus stays on the page button. */
export function PaginatedCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof pagedFeatures, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name, sortFn: 'locale' }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
      column.accessor('amount', {
        header: texts.amount,
        cell: (info) => numberFormat(formatLocale).format(info.getValue()),
      }),
    ])
  }, [texts, formatLocale])
  const list = useTable({
    features: pagedFeatures,
    columns,
    data: pagedCases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: { pagination: { pageIndex: 1, pageSize } },
  })
  const { pageIndex } = list.table.store.state.pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min(from + pageSize - 1, pagedCases.length)
  return (
    <>
      <Table.ScrollRegion table={list}>
        <Table.Root table={list}>
          <Table.Caption>{texts.pagedCaption(from, to, pagedCases.length)}</Table.Caption>
          <Table.Head>
            {list.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      isNumeric(header.column.id) ? 'kv-table-column-header--numeric' : undefined
                    }
                  >
                    {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Head>
          <Table.Body>
            {(row) => (
              <Table.Row key={row.id} row={row}>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={isNumeric(cell.column.id) ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollRegion>
      <div className="kv-button-group">
        <Button
          disabled={!list.table.getCanPreviousPage()}
          onClick={() => list.table.previousPage()}
        >
          {texts.previous}
        </Button>
        <Button disabled={!list.table.getCanNextPage()} onClick={() => list.table.nextPage()}>
          {texts.next}
        </Button>
      </div>
    </>
  )
}

const virtualCases = manyCases(10_000)

/** 10 000 rows, `virtualize`, and a width for each column: a fixed layout reads them from the head. */
export function VirtualizedCases({ locale }: { locale: FormLocale }): ReactNode {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof virtualFeatures, CaseRecord>()
    return column.columns([
      column.display({
        id: 'select',
        size: 48,
        header: () => <Table.SelectAllCheckbox />,
        cell: ({ row }) => <Table.SelectCheckbox row={row} />,
      }),
      column.accessor('name', { header: texts.name, sortFn: 'locale', size: 220 }),
      column.accessor('caseNumber', { header: texts.caseNumber, size: 160 }),
      column.accessor('received', {
        header: texts.received,
        size: 140,
        cell: (info) => dateFormat(formatLocale).format(asDate(info.getValue())),
      }),
      column.accessor('amount', {
        header: texts.amount,
        size: 140,
        cell: (info) => numberFormat(formatLocale).format(info.getValue()),
      }),
    ])
  }, [texts, formatLocale])
  const list = useTable({
    features: virtualFeatures,
    columns,
    data: virtualCases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    virtualize: { estimateSize: 32, overscan: 8 },
  })
  return (
    <div className="kv-compact">
      <Table.ScrollRegion table={list}>
        <Table.Root table={list}>
          <Table.Caption>{texts.virtualCaption}</Table.Caption>
          <Table.Head>
            {list.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      isNumeric(header.column.id) ? 'kv-table-column-header--numeric' : undefined
                    }
                  >
                    {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Head>
          <Table.Body>
            {(row) => (
              <Table.Row key={row.id} row={row}>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={isNumeric(cell.column.id) ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollRegion>
    </div>
  )
}
