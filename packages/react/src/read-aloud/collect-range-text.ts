import type { CollectedText } from '@kvirn-ui/core'

type LanguageRun = CollectedText['languageRuns'][number]

const skippedSelector =
  '[hidden], [aria-hidden="true"], [data-kv-read-aloud-skip], script, style, template, noscript'

interface Piece {
  node: Text
  nodeOffset: number
  textOffset: number
  length: number
  language: string | undefined
}

function isNotRendered(element: Element, view: Window | null): boolean {
  if (view?.getComputedStyle(element).visibility === 'hidden') {
    return true
  }
  for (let current: Element | null = element; current !== null; current = current.parentElement) {
    if (view?.getComputedStyle(current).display === 'none') {
      return true
    }
  }
  return false
}

export interface RangeTextOptions {
  /** The content element: the nearest `[lang]` is looked up through its ancestors, up to and including it. */
  boundary?: Element | undefined
  /** The boundary's own `lang` is not a run: a `lang` option decides for text outside inner `[lang]`s. */
  ignoreBoundaryLanguage?: boolean | undefined
}

/**
 * Internal. `collectText` for a selected `Range`: the same whitespace collapsing and skipped
 * content, and a `rangeFor` that maps back to the original text nodes. The range is read once.
 */
export function collectRangeText(
  range: Range,
  { boundary, ignoreBoundaryLanguage = false }: RangeTextOptions = {},
): CollectedText {
  const root = range.commonAncestorContainer
  const ownerDocument = root.ownerDocument ?? (root as Document)
  const view = ownerDocument.defaultView
  // A selection inside one text node has that node as its common ancestor, and a TreeWalker never
  // returns its own root: walk from the parent, or a sentence selected in one paragraph reads as nothing.
  const walkerRoot = root.nodeType === root.TEXT_NODE ? (root.parentNode ?? root) : root
  const walker = ownerDocument.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT)
  const pieces: Piece[] = []
  let text = ''
  let previousBlock: Element | null = null

  const isInline = (element: Element) =>
    view?.getComputedStyle(element).display.startsWith('inline')

  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const textNode = node as Text
    const parent = textNode.parentElement
    if (
      !range.intersectsNode(textNode) ||
      parent?.closest(skippedSelector) ||
      (parent !== null && isNotRendered(parent, view))
    ) {
      continue
    }
    let language: string | undefined
    for (
      let current: Element | null = parent;
      current !== null && language === undefined;
      current = current === boundary ? null : current.parentElement
    ) {
      if (current === boundary && ignoreBoundaryLanguage) {
        break
      }
      language = current.getAttribute('lang')?.trim() || undefined
    }
    const start = textNode === range.startContainer ? range.startOffset : 0
    const end = textNode === range.endContainer ? range.endOffset : textNode.data.length
    const block = parent !== null && !isInline(parent) ? parent : null
    const startsBlock = previousBlock !== block && pieces.length > 0
    previousBlock = block
    for (let index = start; index < end; index += 1) {
      const character = textNode.data.charAt(index)
      const isSpace = /\s/.test(character)
      const needsBoundarySpace = startsBlock && index === start && !isSpace
      if (needsBoundarySpace && !text.endsWith(' ') && text !== '') {
        text += ' '
      }
      if (isSpace) {
        if (text === '' || text.endsWith(' ')) {
          continue
        }
        text += ' '
      } else {
        text += character
      }
      const last = pieces.at(-1)
      if (last?.node === textNode && last.nodeOffset + last.length === index) {
        last.length += 1
      } else {
        pieces.push({
          node: textNode,
          nodeOffset: index,
          textOffset: text.length - 1,
          length: 1,
          language,
        })
      }
    }
  }
  text = text.trimEnd()

  const languageRuns: LanguageRun[] = []
  let previousRun: LanguageRun | undefined
  for (const { language, textOffset, length } of pieces) {
    if (language === undefined) {
      previousRun = undefined
    } else if (previousRun?.language === language) {
      previousRun.end = textOffset + length
    } else {
      previousRun = { start: textOffset, end: textOffset + length, language }
      languageRuns.push(previousRun)
    }
  }

  return {
    text,
    languageRuns,
    rangeFor(start, end) {
      const result = ownerDocument.createRange()
      const first = pieces.find((piece) => start < piece.textOffset + piece.length)
      const last = [...pieces].reverse().find((piece) => piece.textOffset < end)
      if (first === undefined || last === undefined) {
        return result
      }
      result.setStart(first.node, first.nodeOffset + Math.max(0, start - first.textOffset))
      result.setEnd(last.node, last.nodeOffset + Math.min(last.length, end - last.textOffset))
      return result
    },
  }
}
