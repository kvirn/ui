import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type SourceFile = { path: string; text: string }

const nordicLetter = /[åäöæøü]/i

// Distinctive Swedish, Finnish, Norwegian and Danish function words. A word that is also English
// ("on", "men", "den", "for", "he", "me") is left out, so English prose never trips it.
const stopWords = [
  'och',
  'att',
  'för',
  'är',
  'inte',
  'vid',
  'från',
  'eller',
  'ska',
  'jag',
  'ett',
  'också',
  'ikke',
  'ikkje',
  'og',
  'uten',
  'hvis',
  'kva',
  'että',
  'ja',
  'ei',
  'mutta',
  'tai',
  'eikä',
  'jos',
]
const stopWord = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(?:${stopWords.join('|')})(?![\\p{L}\\p{N}_-])`,
  'iu',
)

// Plain Nordic UI words have no Nordic letter or stop-word ("Spara", "Adress"). The word set is
// every whole word of 4+ letters in the sv, fi, nb and nn catalog values that no en value uses.
const localesDirectory = new URL('../../packages/i18n/src/locales/', import.meta.url)
const stringLiteral = /'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g
const urlPattern = /https?:\/\/\S+/g
const wordPattern = /\p{L}{4,}/gu

// Words that are English or common identifiers and technical terms, so the catalogs' Nordic
// spelling of them is not evidence of Nordic prose.
const englishToo = new Set<string>([
  // English words that a catalog also spells (Swedish "under", Norwegian "bare", "side").
  'bare',
  'felt',
  'format',
  'gang',
  'held',
  'just',
  'kart',
  'limes',
  'marker',
  'over',
  'send',
  'sett',
  'side',
  'sorter',
  'under',
  // A first name in fixtures ("Anna Svensson"), not a Swedish word.
  'anna',
  // English or shared with English in the technical vocabulary.
  'status',
  'kalender',
  'information',
  'menu',
  // English words and CSS or code values that the icon labels spell the same in a Nordic language
  // ("auto" is a CSS value, "post" and "brand" and "handling" and "journal" are plain English).
  'auto',
  'brand',
  'handling',
  'journal',
  'post',
  'schema',
])

// Public-sector nouns found in fixtures that the catalogs do not carry.
const curatedWords = [
  'adress',
  'telefon',
  'kontakt',
  'blankett',
  'ansök',
  'ansökan',
  'ärende',
  'tjänst',
  'skatt',
  'bygglov',
  'stöd',
  'hjälp',
  'uppgifter',
  'handlingar',
  'historik',
  'avgift',
  'rakennus',
  'palvelu',
  'hakemus',
  'tjeneste',
  'søknad',
]

function catalogWords(name: string): Set<string> {
  const source = readFileSync(fileURLToPath(new URL(`${name}.ts`, localesDirectory)), 'utf8')
  const words = new Set<string>()
  for (const match of source.matchAll(stringLiteral)) {
    for (const word of (match[1] ?? match[2] ?? '').matchAll(wordPattern)) {
      words.add(word[0].toLowerCase())
    }
  }
  return words
}

export function buildNordicWords(): Set<string> {
  const english = catalogWords('en')
  const nordic = new Set<string>(curatedWords)
  for (const name of ['sv', 'fi', 'nb', 'nn']) {
    for (const word of catalogWords(name)) {
      if (!english.has(word) && !englishToo.has(word)) nordic.add(word)
    }
  }
  return nordic
}

const nordicWords = buildNordicWords()

function hasNordicWord(line: string): boolean {
  for (const word of line.replace(urlPattern, ' ').matchAll(wordPattern)) {
    if (nordicWords.has(word[0].toLowerCase())) return true
  }
  return false
}

const marker = /kv-lang-ok(-file)?\b(.*)$/

const exemptPath = [
  /^packages\/i18n\//,
  /^\.changeset\//,
  /(^|\/)CHANGELOG\.md$/,
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/,
  /^tooling\/english-only\//,
]

export function isExemptPath(path: string): boolean {
  return exemptPath.some((pattern) => pattern.test(path))
}

function readMarker(line: string): { file: boolean; hasReason: boolean } | null {
  const match = marker.exec(line)
  if (!match) return null
  const reason = match[2]!.replace(/^\s*:/, '').replace(/(-->|\*\/|\*\}|`|\}|\))/g, '')
  return {
    file: match[1] !== undefined,
    hasReason: match[2]!.trimStart().startsWith(':') && /\p{L}/u.test(reason),
  }
}

function findInText(text: string): { line: number; text: string }[] {
  if (text.includes('\0')) return []
  const lines = text.split('\n')
  const markers = lines.map(readMarker)
  const head = markers.slice(0, 10)
  const found: { line: number; text: string }[] = []

  if (head.some((entry) => entry?.file && entry.hasReason)) {
    // A reasonless marker is still reported below.
    markers.forEach((entry, index) => {
      if (entry && !entry.hasReason) found.push({ line: index + 1, text: lines[index]!.trim() })
    })
    return found
  }

  lines.forEach((line, index) => {
    const own = markers[index]
    if (own && !own.hasReason) {
      found.push({ line: index + 1, text: line.trim() })
      return
    }
    if (own) return
    const above = markers[index - 1]
    if (above && !above.file && above.hasReason) return
    if (nordicLetter.test(line) || stopWord.test(line) || hasNordicWord(line))
      found.push({ line: index + 1, text: line.trim() })
  })
  return found
}

export function findNonEnglish(text: string): string[]
export function findNonEnglish(files: SourceFile[]): string[]
export function findNonEnglish(input: string | SourceFile[]): string[] {
  if (typeof input === 'string') {
    return findInText(input).map((entry) => `${entry.line}: ${entry.text.slice(0, 100)}`)
  }
  return input
    .filter((file) => !isExemptPath(file.path))
    .flatMap((file) =>
      findInText(file.text).map(
        (entry) => `${file.path}:${entry.line}: ${entry.text.slice(0, 100)}`,
      ),
    )
}
