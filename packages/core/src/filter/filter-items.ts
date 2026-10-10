/**
 * Locale-aware text matching for Listbox, Combobox and Autocomplete.
 *
 * Matching uses `Intl.Collator` with `sensitivity: 'base'`: case and, where the locale allows it,
 * accents are ignored, but letters the locale treats as separate stay separate. In `sv`, `fi`,
 * `nb` and `nn` that keeps å, ä and ö distinct from a and o. The runtime's ICU data decides,
 * so this module has no letter tables of its own.
 *
 * The match is a substring search by collation: the label is cut into windows of as many code
 * points as the query (and one fewer and one more, so an expansion such as æ against "ae" still
 * matches), and each window is compared to the query with the collator. It is plain and has no
 * regular expressions, so a query never needs escaping. Collation contractions (such as "ch" in
 * Czech) are not looked for.
 */

/** A BCP 47 tag or a list of them. `undefined` uses the runtime's default locale. */
export type FilterLocale = string | readonly string[] | undefined

const collators = new Map<string, Intl.Collator>()

function getCollator(locale: FilterLocale): Intl.Collator {
  const cacheKey =
    locale === undefined ? '' : typeof locale === 'string' ? locale : locale.join(',')
  let collator = collators.get(cacheKey)
  if (collator === undefined) {
    const locales = locale === undefined || typeof locale === 'string' ? locale : [...locale]
    collator = new Intl.Collator(locales, { sensitivity: 'base' })
    collators.set(cacheKey, collator)
  }
  return collator
}

/** Composed form, so å typed as "a" plus a combining ring still equals å. */
function toCodePoints(text: string): string[] {
  return Array.from(text.normalize('NFC'))
}

/** The window lengths that can equal a query of `length` code points under collation. */
function windowLengths(length: number): number[] {
  return length > 1 ? [length, length - 1, length + 1] : [length, length + 1]
}

function windowMatches(
  collator: Intl.Collator,
  labelPoints: readonly string[],
  start: number,
  length: number,
  query: string,
): boolean {
  if (length < 1 || start + length > labelPoints.length) {
    return false
  }
  return collator.compare(labelPoints.slice(start, start + length).join(''), query) === 0
}

/**
 * Whether `label` contains `query` anywhere. A blank query matches everything, and surrounding
 * white space in the query is ignored (a pasted or autofilled value often has some).
 */
export function matchesText(label: string, query: string, locale?: FilterLocale): boolean {
  const normalizedQuery = query.trim().normalize('NFC')
  if (normalizedQuery === '') {
    return true
  }
  const collator = getCollator(locale)
  const labelPoints = toCodePoints(label)
  const queryLength = Array.from(normalizedQuery).length
  const lengths = windowLengths(queryLength)
  for (let start = 0; start < labelPoints.length; start += 1) {
    for (const length of lengths) {
      if (windowMatches(collator, labelPoints, start, length, normalizedQuery)) {
        return true
      }
    }
  }
  return false
}

/**
 * Whether `label` starts with `query`, for typeahead. The query is used as typed: a space is
 * a character here, so it isn't trimmed. An empty query matches everything.
 */
export function startsWithText(label: string, query: string, locale?: FilterLocale): boolean {
  const normalizedQuery = query.normalize('NFC')
  if (normalizedQuery === '') {
    return true
  }
  const collator = getCollator(locale)
  const labelPoints = toCodePoints(label)
  const queryLength = Array.from(normalizedQuery).length
  return windowLengths(queryLength).some((length) =>
    windowMatches(collator, labelPoints, 0, length, normalizedQuery),
  )
}

export interface FilterItemsOptions<TItem> {
  /** The text to match. Default `String(item)`, which is only right for strings. */
  itemToString?: ((item: TItem) => string) | undefined
  /** The locale for matching. Default: the runtime's. Pass the provider's locale. */
  locale?: FilterLocale
}

/**
 * The default filter: the items whose label contains `query` (see {@link matchesText}). The input
 * is never changed, and the order is kept. A blank query returns every item.
 */
export function filterItems<TItem>(
  items: readonly TItem[],
  query: string,
  options: FilterItemsOptions<TItem> = {},
): TItem[] {
  const itemToString = options.itemToString ?? ((item: TItem) => String(item))
  if (query.trim() === '') {
    return [...items]
  }
  return items.filter((item) => matchesText(itemToString(item), query, options.locale))
}
