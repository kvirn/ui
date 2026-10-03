import { constructTable } from '@tanstack/table-core'
import type { RowData, Table, TableFeatures, TableOptions, TableState } from '@tanstack/table-core'
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'
import type { Listener, ReadableStore } from '../store/create-component-store.ts'

/**
 * The options of `createTable`: TanStack Table's options, except multi-sort. `enableMultiSort`
 * is always off, because multi-sort needs Shift+click, a key the APG table pattern
 * doesn't define and the Keyboard section would have to document. Leave it out.
 */
export type KvirnTableOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = TableOptions<TFeatures, TData> & {
  readonly enableMultiSort?: never
}

export interface KvirnTable<TFeatures extends TableFeatures, TData extends RowData> {
  /** The TanStack Table instance. */
  readonly table: Table<TFeatures, TData>
  /**
   * `table.store` as a `ReadableStore`, so `useStoreSelector` and any other adapter can read and
   * subscribe to the table's state. It notifies when a state slice changes, and not
   * while `updateOptions` runs.
   */
  readonly store: ReadableStore<TableState<TFeatures>>
  /**
   * Hands the instance this render's options (`data`, `columns`, `state`, `on…Change`, …).
   * Call it while rendering, before reading rows: it doesn't notify subscribers, because the
   * render in progress already reads the new state, and a notification during a render would
   * ask React for an update of a component that is rendering. `features`, `initialState` and
   * `atoms` stay as they were created.
   */
  readonly updateOptions: (options: KvirnTableOptions<TFeatures, TData>) => void
}

/** What every table gets whatever the options say. */
const accessibleDefaults = { enableMultiSort: false }

/**
 * Creates a TanStack Table instance (`constructTable`) with the store reactivity bindings,
 * and adapts its state to a `ReadableStore`. The only place a table is constructed.
 * Use `tableFeatures` and the other re-exports from `@kvirn-ui/core` for the features.
 *
 * @example
 * const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() })
 * const { table, store } = createTable({ features, columns, data })
 */
export function createTable<TFeatures extends TableFeatures, TData extends RowData>(
  options: KvirnTableOptions<TFeatures, TData>,
): KvirnTable<TFeatures, TData> {
  // The injected features are a copy: the consumer's `features` object is never changed.
  const features = Object.assign({}, options.features, {
    coreReactivityFeature: storeReactivityBindings(),
  })
  const table = constructTable<TFeatures, TData>(
    Object.assign({}, options, { features }, accessibleDefaults),
  )

  let isUpdatingOptions = false
  const subscribe = (listener: Listener) => {
    const subscription = table.store.subscribe(() => {
      if (!isUpdatingOptions) {
        listener()
      }
    })
    return () => subscription.unsubscribe()
  }
  const store: ReadableStore<TableState<TFeatures>> = {
    getState: () => table.store.get(),
    subscribe,
  }

  const updateOptions = (nextOptions: KvirnTableOptions<TFeatures, TData>) => {
    isUpdatingOptions = true
    try {
      table.setOptions((previousOptions) =>
        Object.assign({}, previousOptions, nextOptions, accessibleDefaults),
      )
    } finally {
      isUpdatingOptions = false
    }
  }

  return { table, store, updateOptions }
}
