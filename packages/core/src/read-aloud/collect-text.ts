import type { LanguageRun } from './split-sentences.ts'

export interface CollectedText {
  /** Where `lang` names the language, from the nearest `[lang]` ancestor up to the element itself. */
  languageRuns: LanguageRun[]
  /** What is read: the visible text of the element, whitespace collapsed, blocks apart by a space. */
  text: string
  /** The DOM `Range` over the original text nodes that `text.slice(start, end)` came from. */
  rangeFor(start: number, end: number): Range
}

interface Segment {
  node: Text
  nodeOffset: number
  textOffset: number
  length: number
  language: string | undefined
}

const skippedTags = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'])
const skipSelector = '[hidden], [aria-hidden="true"], [data-kv-read-aloud-skip]'

function isSkipped(element: Element, view: Window | null): boolean {
  if (skippedTags.has(element.tagName.toUpperCase()) || element.matches(skipSelector)) {
    return true
  }
  return view?.getComputedStyle(element).display === 'none'
}

/**
 * The text a reader hears for an element (Plan 0088), with a way back to the DOM. Skips what a
 * reader doesn't see or hear: `[hidden]`, `aria-hidden="true"`, `script`, `style`, `template`,
 * `noscript`, `[data-kv-read-aloud-skip]`, `display: none` and `visibility: hidden`. Text in
 * different blocks never runs together. The element must be in a document for styles to apply.
 * Resolved at call time, so it is safe to import on the server.
 */
export function collectText(root: Element): CollectedText {
  const ownerDocument = root.ownerDocument
  const view = ownerDocument.defaultView
  const displayCache = new Map<Element, string>()
  const displayOf = (element: Element) => {
    let display = displayCache.get(element)
    if (display === undefined) {
      display = view?.getComputedStyle(element).display ?? 'block'
      displayCache.set(element, display)
    }
    return display
  }
  const languageOf = (node: Node): string | undefined => {
    let element = node.parentElement
    while (element !== null) {
      const language = element.getAttribute('lang')
      if (language !== null && language.trim() !== '') {
        return language.trim()
      }
      if (element === root) {
        break
      }
      element = element.parentElement
    }
    return undefined
  }
  const blockOf = (node: Node): Element => {
    let element = node.parentElement
    while (element !== null && element !== root) {
      const display = displayOf(element)
      if (!display.startsWith('inline') && display !== 'contents') {
        return element
      }
      element = element.parentElement
    }
    return root
  }

  const walker = ownerDocument.createTreeWalker(root, 0x1 | 0x4, {
    acceptNode(node) {
      if (node.nodeType === 1) {
        return isSkipped(node as Element, view) ? 2 : 3
      }
      const visibility = node.parentElement
        ? view?.getComputedStyle(node.parentElement).visibility
        : undefined
      return visibility === 'hidden' || visibility === 'collapse' ? 2 : 1
    },
  })

  const segments: Segment[] = []
  let text = ''
  let previousBlock: Element | undefined
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (node.nodeType !== 3) {
      continue
    }
    const data = (node as Text).data
    const block = blockOf(node)
    const language = languageOf(node)
    let needsSeparator = previousBlock !== undefined && block !== previousBlock
    let segment: Segment | undefined
    for (let index = 0; index < data.length; index += 1) {
      let character = data.charAt(index)
      if (/\s/.test(character)) {
        character = ' '
        if (text === '' || text.endsWith(' ')) {
          segment = undefined
          continue
        }
      } else if (needsSeparator) {
        needsSeparator = false
        if (!text.endsWith(' ')) {
          text += ' '
          segment = undefined
        }
      }
      if (segment === undefined) {
        segment = {
          node: node as Text,
          nodeOffset: index,
          textOffset: text.length,
          length: 0,
          language,
        }
        segments.push(segment)
      }
      text += character
      segment.length += 1
    }
    previousBlock = block
  }

  const languageRuns: LanguageRun[] = []
  let previousRun: LanguageRun | undefined
  for (const { language, textOffset, length } of segments) {
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
      const range = ownerDocument.createRange()
      const first = segments.find((segment) => start < segment.textOffset + segment.length)
      const last = segments.findLast((segment) => end > segment.textOffset)
      if (first === undefined || last === undefined || end <= start) {
        range.setStart(root, 0)
        range.collapse(true)
        return range
      }
      const startOffset = Math.max(start, first.textOffset) - first.textOffset + first.nodeOffset
      const endOffset =
        Math.min(end, last.textOffset + last.length) - last.textOffset + last.nodeOffset
      range.setStart(first.node, startOffset)
      range.setEnd(last.node, Math.max(endOffset, 0))
      return range
    },
  }
}
