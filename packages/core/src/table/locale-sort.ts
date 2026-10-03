import type { RowData, SortFn, TableFeatures } from './table-exports.ts'

/**
 * A TanStack sort function that orders text the way people in `locale` expect, with
 * `Intl.Collator`: å, ä and ö (and æ and ø) come after z in Swedish, Finnish and Norwegian, and
 * case is ignored. Register it in the features and name it in a column:
 *
 * ```ts
 * const features = tableFeatures({
 *   rowSortingFeature,
 *   sortedRowModel: createSortedRowModel(),
 *   sortFns: { locale: createLocaleSortFn('sv') },
 * })
 * column.accessor('name', { header: 'Namn', sortFn: 'locale' })
 * ```
 *
 * Numbers sort by value and dates by time. A missing value (`null` or `undefined`) sorts first.
 * `numeric` is on by default, so "Ärende 2" comes before "Ärende 10". Pass `collatorOptions` to
 * change that, or to make accents or case count.
 */
export function createLocaleSortFn<
  TFeatures extends TableFeatures = TableFeatures,
  TData extends RowData = RowData,
>(locale: string, collatorOptions: Intl.CollatorOptions = {}): SortFn<TFeatures, TData> {
  const collator = new Intl.Collator(locale, { numeric: true, ...collatorOptions })

  return (rowA, rowB, columnId) =>
    compareValues(collator, rowA.getValue<unknown>(columnId), rowB.getValue<unknown>(columnId))
}

const isMissing = (value: unknown): value is null | undefined =>
  value === null || value === undefined

function compareValues(collator: Intl.Collator, first: unknown, second: unknown): number {
  if (isMissing(first) || isMissing(second)) {
    return Number(!isMissing(first)) - Number(!isMissing(second))
  }
  if (typeof first === 'number' && typeof second === 'number') {
    return first === second ? 0 : first < second ? -1 : 1
  }
  if (first instanceof Date && second instanceof Date) {
    return first.getTime() - second.getTime()
  }
  return collator.compare(toText(first), toText(second))
}

/** The text a value sorts as. An object has no text of its own: it sorts as its JSON. */
function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  return JSON.stringify(value) ?? ''
}
