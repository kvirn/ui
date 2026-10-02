import type { Mask, MaskResult } from './mask-types.ts'

/** `12|3` is the value `123` with the caret after the 2. A caret at the end is written `123|`. */
export function parseCaretNotation(notation: string): { value: string; caret: number } {
  const caret = notation.indexOf('|')
  if (caret === -1) throw new Error(`No caret in ${JSON.stringify(notation)}`)
  return { value: notation.slice(0, caret) + notation.slice(caret + 1), caret }
}

/** The inverse: the value with `|` at the caret, for readable expectations. */
export function showCaret(result: Pick<MaskResult, 'value' | 'selectionStart'>): string {
  return `${result.value.slice(0, result.selectionStart)}|${result.value.slice(result.selectionStart)}`
}

/** What the browser does when the user types or pastes `input` at the caret, then the mask runs. */
export function insert(mask: Mask, before: string, input: string): MaskResult {
  const { value, caret } = parseCaretNotation(before)
  return mask.apply({
    value: value.slice(0, caret) + input + value.slice(caret),
    selectionStart: caret + input.length,
    selectionEnd: caret + input.length,
    previousValue: value,
    inputType: 'insertText',
  })
}

/** Backspace (`backward`) or Delete (`forward`) at the caret, or over the selected range. */
export function remove(
  mask: Mask,
  before: string,
  direction: 'backward' | 'forward' = 'backward',
  selectionLength = 0,
): MaskResult {
  const { value, caret } = parseCaretNotation(before)
  let start = caret
  let end = caret + selectionLength
  if (selectionLength === 0) {
    if (direction === 'backward') start = Math.max(caret - 1, 0)
    else end = Math.min(caret + 1, value.length)
  }
  return mask.apply({
    value: value.slice(0, start) + value.slice(end),
    selectionStart: start,
    selectionEnd: start,
    previousValue: value,
    inputType: direction === 'backward' ? 'deleteContentBackward' : 'deleteContentForward',
  })
}
