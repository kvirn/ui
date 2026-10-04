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
import { useId, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Table (Plan 0026, design spec docs/design/table.md §4.2,
// §6.17). sv, en, fi, nb and nn are written, and the fi strings are the designer's drafts for length
// checks only. se: English, marked lang="en" (3.1.2). The library's own strings (the checkbox names, the
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

const nb: TableTexts = {
  casesCaption: 'Åpne saker',
  name: 'Navn',
  caseNumber: 'Saksnummer',
  received: 'Mottatt',
  receivedLong: 'Dato da søknaden kom inn',
  amount: 'Beløp (kr)',
  handler: 'Saksbehandler',
  handlerLabel: 'Saksbehandler',
  decisionLabel: 'Vedtak',
  paymentsCaption: 'Utbetalt bostøtte i 2026',
  month: 'Måned',
  payoutDate: 'Utbetalingsdato',
  paymentAmount: 'Beløp (kr)',
  total: 'Totalt',
  emptyNoData: 'Du har ingen åpne saker.',
  emptyFiltered: 'Ingen saker passer med søket. Endre søket eller fjern filteret.',
  reloadCaption: 'Åpne saker, oppdateres',
  firstLoadCaption: 'Åpne saker, første innlasting',
  pagedCaption: (from, to, total) => `Åpne saker, rad ${from}–${to} av ${total}`,
  previous: 'Forrige',
  next: 'Neste',
  virtualCaption: 'Alle saker',
  keyboardCaption: 'Åpne saker',
}

const nn: TableTexts = {
  casesCaption: 'Opne saker',
  name: 'Namn',
  caseNumber: 'Saksnummer',
  received: 'Motteke',
  receivedLong: 'Dato då søknaden kom inn',
  amount: 'Beløp (kr)',
  handler: 'Saksbehandlar',
  handlerLabel: 'Saksbehandlar',
  decisionLabel: 'Vedtak',
  paymentsCaption: 'Utbetalt bustøtte i 2026',
  month: 'Månad',
  payoutDate: 'Utbetalingsdato',
  paymentAmount: 'Beløp (kr)',
  total: 'Totalt',
  emptyNoData: 'Du har ingen opne saker.',
  emptyFiltered: 'Ingen saker passar til søket. Endre søket eller fjern filteret.',
  reloadCaption: 'Opne saker, blir oppdaterte',
  firstLoadCaption: 'Opne saker, første lasting',
  pagedCaption: (from, to, total) => `Opne saker, rad ${from}–${to} av ${total}`,
  previous: 'Førre',
  next: 'Neste',
  virtualCaption: 'Alle saker',
  keyboardCaption: 'Opne saker',
}

/** se has no texts: it shows the English ones, marked lang="en". */
const tableTexts: Partial<Record<FormLocale, TableTexts>> = { sv, fi, nb, nn, en }

const formatLocales: Record<'sv' | 'fi' | 'nb' | 'nn' | 'en', string> = {
  sv: 'sv',
  fi: 'fi',
  nb: 'nb',
  nn: 'nn',
  en: 'en',
}

interface ResolvedTexts {
  texts: TableTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function tableTextsFor(locale: FormLocale): ResolvedTexts {
  const texts = tableTexts[locale]
  return {
    texts: texts ?? en,
    lang: texts === undefined ? 'en' : undefined,
    formatLocale: formatLocales[locale === 'se' ? 'en' : locale],
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

/** The columns of the case list: localised headers, a locale sort on the name, a link on request. */
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

/**
 * A table that sorts: four sortable columns and one that isn't, sorted by name at first. The
 * amount is a quantity, so its header and cells are aligned to the end with the numeric classes.
 */
export function SortableCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => {
    const column = createColumnHelper<CaseFeatures, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name, sortFn: 'locale' }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
      column.accessor('received', {
        header: texts.received,
        cell: (info) => dateFormat(formatLocale).format(asDate(info.getValue())),
      }),
      column.accessor('amount', {
        header: texts.amount,
        cell: (info) => numberFormat(formatLocale).format(info.getValue()),
      }),
      column.accessor('handler', { header: texts.handler, enableSorting: false }),
    ])
  }, [texts, formatLocale])
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: { sorting: [{ id: 'name', desc: false }] },
  })
  return (
    <Table.ScrollRegion table={list}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                  className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                />
              ))}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}

/** A staff tool: compact rows, two selected, a link in the row header. Select all is mixed. */
export function SelectableCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(
    () => createCaseColumns(texts, formatLocale, { withLinks: true }),
    [texts, formatLocale],
  )
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      rowSelection: { c1: true, c3: true },
    },
  })
  return (
    <div className="kv-compact">
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
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                <Table.Cell>
                  <Table.SelectCheckbox row={row} />
                </Table.Cell>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Empty />
        </Table.Root>
      </Table.ScrollRegion>
    </div>
  )
}

/** The expand button comes first in each row, so it is in view on a small screen. */
export function ExpandableCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => createCaseColumns(texts, formatLocale, {}), [texts, formatLocale])
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
    initialState: { expanded: { c2: true } },
  })
  return (
    <Table.ScrollRegion table={list}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <span className="kv-table-visually-hidden">{list.expandButtonText}</span>
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                <Table.Cell>
                  <Table.ExpandButton row={row} />
                </Table.Cell>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
              <Table.DetailRow row={row}>
                <dl>
                  <dt>{texts.handlerLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.handler}</dd>
                  <dt>{texts.decisionLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.decision}</dd>
                </dl>
              </Table.DetailRow>
            </>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}

/** No rows: the head stays, and the empty row says what happened and what to do. */
export function EmptyCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => createCaseColumns(texts, formatLocale, {}), [texts, formatLocale])
  const list = useTable({
    features: caseFeatures,
    columns,
    data: [],
    getRowId: (record) => record.id,
    rowHeader: 'name',
  })
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

/**
 * A reload with rows on screen (full contrast) and a first load with none (the empty row says so).
 * `isLoading` sets `aria-busy` on the table.
 */
export function LoadingCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(() => createCaseColumns(texts, formatLocale, {}), [texts, formatLocale])
  const reload = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    isLoading: true,
  })
  const firstLoad = useTable({
    features: caseFeatures,
    columns,
    data: [],
    getRowId: (record) => record.id,
    rowHeader: 'name',
    isLoading: true,
  })
  return (
    <>
      <Table.ScrollRegion table={reload}>
        <Table.Root table={reload}>
          <Table.Caption>{texts.reloadCaption}</Table.Caption>
          <Table.Head>
            {reload.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Empty />
        </Table.Root>
      </Table.ScrollRegion>
      <Table.ScrollRegion table={firstLoad}>
        <Table.Root table={firstLoad}>
          <Table.Caption>{texts.firstLoadCaption}</Table.Caption>
          <Table.Head>
            {firstLoad.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
                    }
                  >
                    {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Head>
          <Table.Body>{() => null}</Table.Body>
          <Table.Empty />
        </Table.Root>
      </Table.ScrollRegion>
    </>
  )
}

/**
 * Everything the theme draws, in one table: a sorted and an unsorted header, two selected rows,
 * one expanded row, `aria-busy`, a link in each row header. For forced colours and the design
 * review.
 */
export function EverythingCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(
    () => createCaseColumns(texts, formatLocale, { withLinks: true }),
    [texts, formatLocale],
  )
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
    isLoading: true,
    initialState: {
      sorting: [{ id: 'name', desc: false }],
      rowSelection: { c1: true, c3: true },
      expanded: { c2: true },
    },
  })
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
              <Table.ColumnHeader>
                <span className="kv-table-visually-hidden">{list.expandButtonText}</span>
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                <Table.Cell>
                  <Table.SelectCheckbox row={row} />
                </Table.Cell>
                <Table.Cell>
                  <Table.ExpandButton row={row} />
                </Table.Cell>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
              <Table.DetailRow row={row}>
                <dl>
                  <dt>{texts.handlerLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.handler}</dd>
                  <dt>{texts.decisionLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.decision}</dd>
                </dl>
              </Table.DetailRow>
            </>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}

/** The long header of a narrow screen wraps, and the table scrolls inside its region. */
export function NarrowCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(
    () => createCaseColumns(texts, formatLocale, { longHeader: true }),
    [texts, formatLocale],
  )
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: { sorting: [{ id: 'name', desc: false }] },
  })
  return (
    <div className="kv-compact">
      <Table.ScrollRegion table={list}>
        <Table.Root table={list}>
          <Table.Caption>{texts.casesCaption}</Table.Caption>
          <Table.Head>
            {list.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.id}
                    header={header}
                    className={
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Empty />
        </Table.Root>
      </Table.ScrollRegion>
    </div>
  )
}

/**
 * The fixture of the keyboard tests: select all, sortable headers, and in each row a checkbox, an
 * expand button and a link. The story's decorator makes the region narrower than the table, so
 * the region is a Tab stop.
 */
export function KeyboardCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const columns = useMemo(
    () => createCaseColumns(texts, formatLocale, { withLinks: true }),
    [texts, formatLocale],
  )
  const list = useTable({
    features: caseFeatures,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
  })
  return (
    <Table.ScrollRegion table={list}>
      <Table.Root table={list}>
        <Table.Caption>{texts.keyboardCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <Table.SelectAllCheckbox />
              </Table.ColumnHeader>
              <Table.ColumnHeader>
                <span className="kv-table-visually-hidden">{list.expandButtonText}</span>
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                <Table.Cell>
                  <Table.SelectCheckbox row={row} />
                </Table.Cell>
                <Table.Cell>
                  <Table.ExpandButton row={row} />
                </Table.Cell>
                {row.getAllCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    cell={cell}
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                  />
                ))}
              </Table.Row>
              <Table.DetailRow row={row}>
                <dl>
                  <dt>{texts.handlerLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.handler}</dd>
                  <dt>{texts.decisionLabel}</dt>
                  <dd>{list.table.getRow(row.id).original.decision}</dd>
                </dl>
              </Table.DetailRow>
            </>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}
/**
 * A resident's table, without `useTable`: plain parts, a numeric column and a foot. The region
 * around it is a plain `<div>` while the table fits; `region="always"` makes it a named region.
 */
export function StaticPayments({
  locale,
  region,
}: {
  locale: FormLocale
  region?: 'overflow' | 'always'
}) {
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
    <Table.ScrollRegion aria-labelledby={captionId} region={region}>
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

/**
 * A static table taller than its region, with a link in each row: the head sticks without
 * `useTable`. The region's height comes from `--kv-table-scroll-region-max-block-size`, set on the
 * region or a parent (the story's decorator sets it).
 */
export function StaticScrollingCases({ locale }: { locale: FormLocale }) {
  const { texts, formatLocale } = tableTextsFor(locale)
  const captionId = useId()
  const numbers = numberFormat(formatLocale)
  const dates = dateFormat(formatLocale)
  const rows = manyCases(30)
  return (
    <Table.ScrollRegion aria-labelledby={captionId}>
      <Table.Root>
        <Table.Caption id={captionId}>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>{texts.name}</Table.ColumnHeader>
            <Table.ColumnHeader>{texts.received}</Table.ColumnHeader>
            <Table.ColumnHeader className="kv-table-column-header--numeric">
              {texts.amount}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((entry) => (
            <Table.Row key={entry.id}>
              <Table.RowHeader>
                <Link.Root href={`#${entry.id}`}>{entry.name}</Link.Root>
              </Table.RowHeader>
              <Table.Cell>{dates.format(asDate(entry.received))}</Table.Cell>
              <Table.Cell className="kv-table-cell--numeric">
                {numbers.format(entry.amount)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
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
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
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
                      header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
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
                    className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
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
