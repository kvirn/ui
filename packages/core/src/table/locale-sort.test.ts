import { describe, expect, it } from 'vite-plus/test'
import { createTable } from './create-table.ts'
import { createLocaleSortFn } from './locale-sort.ts'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from './table-exports.ts'

interface Entry {
  id: string
  name: string
  amount: number | null
  received: Date
}

function sortRows(locale: string, entries: readonly Entry[], columnId: keyof Entry, desc = false) {
  const features = tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: { locale: createLocaleSortFn(locale) },
  })
  const column = createColumnHelper<typeof features, Entry>()
  const { table } = createTable({
    features,
    columns: column.columns([
      column.accessor('name', { header: 'Name', sortFn: 'locale' }),
      column.accessor('amount', { header: 'Amount', sortFn: 'locale' }),
      column.accessor('received', { header: 'Received', sortFn: 'locale' }),
    ]),
    data: entries,
    getRowId: (entry) => entry.id,
    initialState: { sorting: [{ id: columnId, desc }] },
  })
  return table.getRowModel().rows.map((row) => row.original)
}

const received = new Date(2026, 0, 1)
const entryNamed = (name: string, index: number): Entry => ({
  id: String(index),
  name,
  amount: index,
  received,
})
const sortedNames = (locale: string, names: readonly string[]) =>
  sortRows(locale, names.map(entryNamed), 'name').map((entry) => entry.name)

describe('createLocaleSortFn', () => {
  it('puts å, ä and ö after z in Swedish, in that order', () => {
    expect(sortedNames('sv', ['Örjan', 'Älva', 'Zack', 'Åsa', 'Anna'])).toEqual([
      'Anna',
      'Zack',
      'Åsa',
      'Älva',
      'Örjan',
    ])
  })

  it('puts å, ä and ö after z in Finnish, in that order', () => {
    expect(sortedNames('fi', ['Örjan', 'Älva', 'Zack', 'Åsa', 'Anna'])).toEqual([
      'Anna',
      'Zack',
      'Åsa',
      'Älva',
      'Örjan',
    ])
  })

  it('puts æ, ø and å after z in Norwegian Bokmål, in that order', () => {
    expect(sortedNames('nb', ['Åse', 'Øystein', 'Zara', 'Ære', 'Anna'])).toEqual([
      'Anna',
      'Zara',
      'Ære',
      'Øystein',
      'Åse',
    ])
  })

  it('differs from the code point order, where Ä comes before Å', () => {
    expect(['Åsa', 'Älva'].sort()).toEqual(['Älva', 'Åsa'])
    expect(sortedNames('sv', ['Älva', 'Åsa'])).toEqual(['Åsa', 'Älva'])
  })

  it('ignores case, so lower case does not sort after upper case', () => {
    expect(sortedNames('sv', ['bertil', 'Anna', 'cecilia'])).toEqual(['Anna', 'bertil', 'cecilia'])
  })

  it('reads numbers inside a name in order, so item 2 comes before item 10', () => {
    expect(sortedNames('sv', ['Ärende 10', 'Ärende 2', 'Ärende 1'])).toEqual([
      'Ärende 1',
      'Ärende 2',
      'Ärende 10',
    ])
  })

  it('sorts numbers by value', () => {
    const entries = [10, 2, 33].map((amount, index) => ({ ...entryNamed('x', index), amount }))
    expect(sortRows('sv', entries, 'amount').map((entry) => entry.amount)).toEqual([2, 10, 33])
  })

  it('sorts dates by time', () => {
    const entries = [new Date(2026, 5, 1), new Date(2025, 5, 1), new Date(2026, 0, 1)].map(
      (date, index) => ({ ...entryNamed('x', index), received: date }),
    )
    expect(sortRows('sv', entries, 'received').map((entry) => entry.received.getFullYear())).toEqual(
      [2025, 2026, 2026],
    )
  })

  it('sorts a missing value first, and reverses with a descending sort', () => {
    const entries = [5, null, 1].map((amount, index) => ({ ...entryNamed('x', index), amount }))
    expect(sortRows('sv', entries, 'amount').map((entry) => entry.amount)).toEqual([null, 1, 5])
    expect(sortRows('sv', entries, 'amount', true).map((entry) => entry.amount)).toEqual([
      5, 1, null,
    ])
  })

  it('accepts collator options', () => {
    const features = tableFeatures({
      rowSortingFeature,
      sortedRowModel: createSortedRowModel(),
      sortFns: { locale: createLocaleSortFn('sv', { numeric: false }) },
    })
    const column = createColumnHelper<typeof features, Entry>()
    const { table } = createTable({
      features,
      columns: column.columns([column.accessor('name', { header: 'Name', sortFn: 'locale' })]),
      data: ['Ärende 10', 'Ärende 2'].map(entryNamed),
      getRowId: (entry) => entry.id,
      initialState: { sorting: [{ id: 'name', desc: false }] },
    })
    expect(table.getRowModel().rows.map((row) => row.original.name)).toEqual([
      'Ärende 10',
      'Ärende 2',
    ])
  })
})
