export interface SentenceChunk {
  text: string
  /** Offset of the chunk's first character in the original string. */
  start: number
  /** Offset after the chunk's last character, so `source.slice(start, end) === text`. */
  end: number
  /** The language of the run the chunk starts in, when the text says one (`languageRuns`). */
  language?: string | undefined
}

/** A stretch of the text that a `lang` attribute names. */
export interface LanguageRun {
  start: number
  end: number
  language: string
}

export interface SplitSentencesOptions {
  /** BCP 47 tag that picks the segmentation rules. */
  language: string
  /** No chunk is longer than this, because a long utterance is cut off by some engines. Default 200. */
  maxLength?: number | undefined
  /** In order and apart. A chunk never spans the edge of a run, so each has one language. */
  languageRuns?: readonly LanguageRun[] | undefined
}

const clauseCharacters = ',;:—'

// A sentence ends at . ! ? … (with closing quotes or brackets) before whitespace or the end, so
// `3.5` and `kl. 10` stay whole, or at a newline.
const sentencePattern = /[^\n]+?(?:[.!?…]+[”’»)\]"']*(?=\s|$)|(?=\n|$))/g

function segmentSentences(text: string, language: string): Array<[number, number]> {
  const spans: Array<[number, number]> = []
  const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter
  if (Segmenter !== undefined) {
    let segmenter: Intl.Segmenter | undefined
    try {
      segmenter = new Segmenter(language, { granularity: 'sentence' })
    } catch {
      segmenter = new Segmenter(undefined, { granularity: 'sentence' })
    }
    for (const { segment, index } of segmenter.segment(text)) {
      spans.push([index, index + segment.length])
    }
    return spans
  }
  for (const match of text.matchAll(sentencePattern)) {
    spans.push([match.index, match.index + match[0].length])
  }
  return spans
}

function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && /\s/.test(character)
}

function splitLong(text: string, from: number, to: number, maxLength: number): SentenceChunk[] {
  const chunks: SentenceChunk[] = []
  let position = from
  while (position < to) {
    while (position < to && isWhitespace(text[position])) {
      position += 1
    }
    if (position >= to) {
      break
    }
    let cut = to
    if (to - position > maxLength) {
      const limit = position + maxLength
      const window = text.slice(position, limit)
      let clauseEnd = -1
      for (const character of clauseCharacters) {
        clauseEnd = Math.max(clauseEnd, window.lastIndexOf(character))
      }
      if (clauseEnd > 0) {
        cut = position + clauseEnd + 1
      } else if (isWhitespace(text[limit])) {
        cut = limit
      } else {
        const wordBreak = window.search(/\s\S*$/)
        cut = wordBreak > 0 ? position + wordBreak : limit
      }
    }
    let end = cut
    while (end > position && isWhitespace(text[end - 1])) {
      end -= 1
    }
    chunks.push({ text: text.slice(position, end), start: position, end })
    position = cut
  }
  return chunks
}

/**
 * Cuts text into the pieces that are spoken one at a time (Plan 0088): sentences by
 * `Intl.Segmenter` (a regex where it's missing), and a sentence over `maxLength` at a comma,
 * semicolon, colon or dash, else at a space, and only inside a word that is itself longer than
 * `maxLength`. Chunks are trimmed, in order, never cross a language run, and hold every non-space character. Pure: no DOM.
 *
 * @example
 * splitSentences('Hej! Hur mår du?', { language: 'sv' }).map((chunk) => chunk.text) // ['Hej!', 'Hur mår du?']
 */
export function splitSentences(
  text: string,
  { language, maxLength = 200, languageRuns = [] }: SplitSentencesOptions,
): SentenceChunk[] {
  const limit = Math.max(1, Math.floor(maxLength))
  return segmentSentences(text, language).flatMap(([from, to]) => {
    const edges = [
      from,
      ...languageRuns
        .flatMap((run) => [run.start, run.end])
        .filter((edge) => edge > from && edge < to),
      to,
    ]
    return edges.slice(0, -1).flatMap((edge, index) =>
      splitLong(text, edge, edges[index + 1] ?? to, limit).map((chunk) => {
        const run = languageRuns.find((item) => chunk.start >= item.start && chunk.start < item.end)
        return run === undefined ? chunk : { ...chunk, language: run.language }
      }),
    )
  })
}
