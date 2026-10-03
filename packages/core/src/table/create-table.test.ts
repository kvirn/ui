import { describe, expect, it, vi } from 'vite-plus/test'
import { createTable } from './create-table.ts'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from './table-exports.ts'
import type { SortingState } from './table-exports.ts'

interface Person {
  id: string
  name: string
  age: number
}

const people: Person[] = [
  { id: 'a', name: 'Cecilia', age: 41 },
  { id: 'b', name: 'Anna', age: 29 },
  { id: 'c', name: 'Bertil', age: 63 },
]

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowSelectionFeature,
})
const column = createColumnHelper<typeof features, Person>()
const columns = column.columns([
  column.accessor('name', { header: 'Name' }),
  column.accessor('age', { header: 'Age' }),
])

const createPeopleTable = () =>
  createTable({ features, columns, data: people, getRowId: (person) => person.id })

const rowIds = (instance: ReturnType<typeof createPeopleTable>['table']) =>
  instance.getRowModel().rows.map((row) => row.id)

describe('createTable', () => {
  it('builds a table that reads its rows', () => {
    const { table } = createPeopleTable()
    expect(rowIds(table)).toEqual(['a', 'b', 'c'])
    expect(table.getHeaderGroups()[0]?.headers.map((header) => header.id)).toEqual(['name', 'age'])
  })

  it('leaves the features object you passed unchanged', () => {
    createPeopleTable()
    expect(features).not.toHaveProperty('coreReactivityFeature')
  })

  it('turns multi-sort off', () => {
    const { table } = createPeopleTable()
    expect(table.options.enableMultiSort).toBe(false)
  })

  it('sorts by one column at a time, even for a multi-sort request', () => {
    const { table, store } = createPeopleTable()
    table.getColumn('name')?.toggleSorting(false, true)
    table.getColumn('age')?.toggleSorting(false, true)
    expect(store.getState().sorting).toEqual([{ id: 'age', desc: false }])
    expect(rowIds(table)).toEqual(['b', 'a', 'c'])
  })

  it('keeps multi-sort off when options change later', () => {
    const { table, updateOptions } = createPeopleTable()
    updateOptions({ features, columns, data: people })
    expect(table.options.enableMultiSort).toBe(false)
  })

  describe('store', () => {
    it('reads the table state', () => {
      const { store } = createPeopleTable()
      expect(store.getState().sorting).toEqual([])
      expect(store.getState().rowSelection).toEqual({})
    })

    it('notifies when a state slice changes, and stops after unsubscribe', () => {
      const { table, store } = createPeopleTable()
      const listener = vi.fn<() => void>()
      const unsubscribe = store.subscribe(listener)

      table.setSorting([{ id: 'name', desc: true }])
      expect(listener).toHaveBeenCalledTimes(1)
      expect(store.getState().sorting).toEqual([{ id: 'name', desc: true }])

      table.getRow('a').toggleSelected(true)
      expect(listener).toHaveBeenCalledTimes(2)
      expect(store.getState().rowSelection).toEqual({ a: true })

      unsubscribe()
      table.setSorting([])
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('returns the same state object until something changes', () => {
      const { table, store } = createPeopleTable()
      const first = store.getState()
      expect(store.getState()).toBe(first)
      table.setSorting([{ id: 'age', desc: false }])
      expect(store.getState()).not.toBe(first)
    })

    it('keeps one subscribe function, for useSyncExternalStore', () => {
      const { store } = createPeopleTable()
      expect(store.subscribe).toBe(store.subscribe)
    })
  })

  describe('updateOptions', () => {
    it('reads controlled state straight away, without notifying', () => {
      const { table, store, updateOptions } = createPeopleTable()
      const listener = vi.fn<() => void>()
      store.subscribe(listener)
      const sorting: SortingState = [{ id: 'name', desc: false }]

      updateOptions({ features, columns, data: people, state: { sorting } })

      expect(store.getState().sorting).toEqual(sorting)
      expect(rowIds(table)).toEqual(['b', 'c', 'a'])
      expect(listener).not.toHaveBeenCalled()
    })

    it('notifies again for a change made after it', () => {
      const { table, store, updateOptions } = createPeopleTable()
      const listener = vi.fn<() => void>()
      store.subscribe(listener)
      updateOptions({ features, columns, data: people })

      table.setSorting([{ id: 'age', desc: true }])
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('reads new data', () => {
      const { table, updateOptions } = createPeopleTable()
      updateOptions({
        features,
        columns,
        data: people.slice(0, 1),
        getRowId: (person) => person.id,
      })
      expect(rowIds(table)).toEqual(['a'])
    })

    it('calls the change handler of controlled state', () => {
      const onSortingChange = vi.fn<(updater: unknown) => void>()
      const { table, updateOptions } = createPeopleTable()
      updateOptions({ features, columns, data: people, onSortingChange })
      table.setSorting([{ id: 'name', desc: false }])
      expect(onSortingChange).toHaveBeenCalledTimes(1)
    })
  })
})
