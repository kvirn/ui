/**
 * Internal. A tab's value as text that is safe in an id, and in an IDREF (`aria-controls`,
 * `aria-labelledby`), where a space would split one id into two. Each character outside
 * `[A-Za-z0-9-]` becomes `_<hex code point>_`, and the underscore itself too, so two different
 * values never give the same id: `a b` is `a_20_b` and `a_20_b` is `a_5f_20_5f_b`.
 *
 * @example
 * escapeTabValue('Bygga och bo') // 'Bygga_20_och_20_bo'
 */
export function escapeTabValue(value: string): string {
  let escaped = ''
  // Iterating a string gives code points, so a character outside the basic plane is one escape.
  for (const character of value) {
    escaped += /[A-Za-z0-9-]/.test(character)
      ? character
      : `_${(character.codePointAt(0) ?? 0).toString(16)}_`
  }
  return escaped
}

/**
 * Internal. The id of a tab: the root's own id and the escaped value. Not an index, because a
 * panel needs its tab's id on the first server render, before anything registers, and an index
 * breaks when the tabs reorder.
 */
export function getTabId(rootId: string, value: string): string {
  return `${rootId}-tab-${escapeTabValue(value)}`
}

/** Internal. The id of the panel that belongs to a tab value. */
export function getPanelId(rootId: string, value: string): string {
  return `${rootId}-panel-${escapeTabValue(value)}`
}
