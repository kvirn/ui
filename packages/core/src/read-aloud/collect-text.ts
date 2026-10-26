import { warnOnce } from '../dev-warning.ts'
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

interface MarkerEvent {
  offset: number
  kind: 'start' | 'stop'
}

interface MarkerRange {
  start: number
  end: number
}

const skippedTags = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'])
const skipSelector = '[hidden], [aria-hidden="true"], [data-kv-read-aloud-skip]'
/** Namespaced on purpose (Plan 0154 D15): a bare `KV:START` would reserve the whole library's
 * comment namespace for one feature. No alias: nothing has shipped yet to keep compatible. */
const markerPattern = /^kv:read-aloud:(start|stop)$/i

function isSkipped(element: Element, view: Window | null): boolean {
  if (skippedTags.has(element.tagName.toUpperCase()) || element.matches(skipSelector)) {
    return true
  }
  return view?.getComputedStyle(element).display === 'none'
}

/**
 * Reduces marker events to the ranges they include, in document order. Nested or overlapping
 * `START`s are flattened to the outermost pair (only the 0→1 and 1→0 depth transitions open and
 * close a range), an orphan `STOP` is ignored, and an unclosed `START` reads to `textLength`.
 * Each case warns once, since reading the wrong half of a page silently is worse than a warning.
 */
function resolveMarkerRanges(events: MarkerEvent[], textLength: number): MarkerRange[] {
  const ranges: MarkerRange[] = []
  let depth = 0
  let rangeStart = 0
  for (const event of events) {
    if (event.kind === 'start') {
      if (depth === 0) {
        rangeStart = event.offset
      } else {
        warnOnce(
          'read-aloud-marker-nested',
          'A <!-- KV:READ-ALOUD:START --> marker is nested inside another one. KvirnUI flattens nested or overlapping markers to the outermost pair.',
        )
      }
      depth += 1
      continue
    }
    if (depth === 0) {
      warnOnce(
        'read-aloud-marker-orphan-stop',
        'A <!-- KV:READ-ALOUD:STOP --> marker has no matching <!-- KV:READ-ALOUD:START -->. KvirnUI ignores it.',
      )
      continue
    }
    depth -= 1
    if (depth === 0) {
      ranges.push({ start: rangeStart, end: event.offset })
    }
  }
  if (depth > 0) {
    warnOnce(
      'read-aloud-marker-unclosed',
      'A <!-- KV:READ-ALOUD:START --> marker has no matching <!-- KV:READ-ALOUD:STOP -->. KvirnUI reads to the end of the region.',
    )
    ranges.push({ start: rangeStart, end: textLength })
  }
  return ranges
}

/**
 * The text a reader hears for an element (Plan 0088), with a way back to the DOM. Skips what a
 * reader doesn't see or hear: `[hidden]`, `aria-hidden="true"`, `script`, `style`, `template`,
 * `noscript`, `[data-kv-read-aloud-skip]`, `display: none` and `visibility: hidden`. Text in
 * different blocks never runs together. The element must be in a document for styles to apply.
 * Resolved at call time, so it is safe to import on the server.
 *
 * `<!-- KV:READ-ALOUD:START -->` / `<!-- KV:READ-ALOUD:STOP -->` comment pairs narrow what is read
 * (Plan 0154 D15): if any `START` is present in `root`, only the marked ranges are read; with
 * none, the whole root is, as before. Several pairs are allowed, and `data-kv-read-aloud-skip`
 * still excludes elements inside a marked range. React/JSX cannot emit HTML comments, so this is
 * for server-rendered and CMS markup; an HTML minifier that strips comments removes the markers
 * with it (`docs/design/read-aloud.md`).
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

  const walker = ownerDocument.createTreeWalker(root, 0x1 | 0x4 | 0x80, {
    acceptNode(node) {
      if (node.nodeType === 1) {
        return isSkipped(node as Element, view) ? 2 : 3
      }
      if (node.nodeType === 8) {
        return 1
      }
      const visibility = node.parentElement
        ? view?.getComputedStyle(node.parentElement).visibility
        : undefined
      return visibility === 'hidden' || visibility === 'collapse' ? 2 : 1
    },
  })

  const segments: Segment[] = []
  const markerEvents: MarkerEvent[] = []
  let text = ''
  let previousBlock: Element | undefined
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (node.nodeType === 8) {
      const match = markerPattern.exec((node as Comment).data.trim())
      if (match !== null) {
        markerEvents.push({
          offset: text.length,
          kind: match[1]?.toLowerCase() as 'start' | 'stop',
        })
      }
      continue
    }
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

  const markerRanges = resolveMarkerRanges(markerEvents, text.length)

  let finalText = text
  let finalSegments = segments
  if (markerRanges.length > 0) {
    const narrowedText: string[] = []
    const narrowedSegments: Segment[] = []
    let offset = 0
    for (const range of markerRanges) {
      if (range.end <= range.start) {
        continue
      }
      if (offset > 0) {
        narrowedText.push(' ')
        offset += 1
      }
      for (const segment of segments) {
        const segmentEnd = segment.textOffset + segment.length
        const overlapStart = Math.max(segment.textOffset, range.start)
        const overlapEnd = Math.min(segmentEnd, range.end)
        if (overlapEnd <= overlapStart) {
          continue
        }
        narrowedSegments.push({
          node: segment.node,
          nodeOffset: segment.nodeOffset + (overlapStart - segment.textOffset),
          textOffset: offset,
          length: overlapEnd - overlapStart,
          language: segment.language,
        })
        narrowedText.push(text.slice(overlapStart, overlapEnd))
        offset += overlapEnd - overlapStart
      }
    }
    finalText = narrowedText.join('')
    finalSegments = narrowedSegments
  }

  const languageRuns: LanguageRun[] = []
  let previousRun: LanguageRun | undefined
  for (const { language, textOffset, length } of finalSegments) {
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
    text: finalText,
    languageRuns,
    rangeFor(start, end) {
      const range = ownerDocument.createRange()
      const first = finalSegments.find((segment) => start < segment.textOffset + segment.length)
      const last = finalSegments.findLast((segment) => end > segment.textOffset)
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
