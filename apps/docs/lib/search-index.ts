import { readContract } from './contract.ts'
import * as accordion from '../content/accordion.api.ts'
import * as addressInput from '../content/address-input.api.ts'
import * as address from '../content/address.api.ts'
import * as alertDialog from '../content/alert-dialog.api.ts'
import * as alert from '../content/alert.api.ts'
import * as announcer from '../content/announcer.api.ts'
import * as autocomplete from '../content/autocomplete.api.ts'
import * as badge from '../content/badge.api.ts'
import * as breadcrumb from '../content/breadcrumb.api.ts'
import * as buttonGroup from '../content/button-group.api.ts'
import * as button from '../content/button.api.ts'
import * as calendar from '../content/calendar.api.ts'
import * as card from '../content/card.api.ts'
import * as checkboxGroup from '../content/checkbox-group.api.ts'
import * as checkbox from '../content/checkbox.api.ts'
import * as codeBlock from '../content/code-block.api.ts'
import * as combobox from '../content/combobox.api.ts'
import * as container from '../content/container.api.ts'
import * as copyButton from '../content/copy-button.api.ts'
import * as dateInput from '../content/date-input.api.ts'
import * as datePicker from '../content/date-picker.api.ts'
import * as dateRangePicker from '../content/date-range-picker.api.ts'
import * as definitionList from '../content/definition-list.api.ts'
import * as dialog from '../content/dialog.api.ts'
import * as disclosure from '../content/disclosure.api.ts'
import * as errorSummary from '../content/error-summary.api.ts'
import * as field from '../content/field.api.ts'
import * as fieldset from '../content/fieldset.api.ts'
import * as fileUpload from '../content/file-upload.api.ts'
import * as focus from '../content/focus.api.ts'
import * as grid from '../content/grid.api.ts'
import * as heading from '../content/heading.api.ts'
import * as icon from '../content/icon.api.ts'
import * as inputGroup from '../content/input-group.api.ts'
import * as kbd from '../content/kbd.api.ts'
import * as link from '../content/link.api.ts'
import * as list from '../content/list.api.ts'
import * as listbox from '../content/listbox.api.ts'
import * as map from '../content/map.api.ts'
import * as menu from '../content/menu.api.ts'
import * as navigation from '../content/navigation.api.ts'
import * as numberInput from '../content/number-input.api.ts'
import * as oneTimeCode from '../content/one-time-code.api.ts'
import * as pagination from '../content/pagination.api.ts'
import * as phoneInput from '../content/phone-input.api.ts'
import * as popover from '../content/popover.api.ts'
import * as progress from '../content/progress.api.ts'
import * as prose from '../content/prose.api.ts'
import * as quickExit from '../content/quick-exit.api.ts'
import * as radioGroup from '../content/radio-group.api.ts'
import * as readAloud from '../content/read-aloud.api.ts'
import * as richTextEditor from '../content/rich-text-editor.api.ts'
import * as routeFocus from '../content/route-focus.api.ts'
import * as scrollArea from '../content/scroll-area.api.ts'
import * as section from '../content/section.api.ts'
import * as skipLink from '../content/skip-link.api.ts'
import * as slider from '../content/slider.api.ts'
import * as stack from '../content/stack.api.ts'
import * as stepper from '../content/stepper.api.ts'
import * as switchApi from '../content/switch.api.ts'
import * as tableOfContents from '../content/table-of-contents.api.ts'
import * as table from '../content/table.api.ts'
import * as tabs from '../content/tabs.api.ts'
import * as textInput from '../content/text-input.api.ts'
import * as textarea from '../content/textarea.api.ts'
import * as toast from '../content/toast.api.ts'
import * as toggle from '../content/toggle.api.ts'
import * as toolbar from '../content/toolbar.api.ts'
import * as tooltip from '../content/tooltip.api.ts'
import * as topBar from '../content/top-bar.api.ts'
import * as visuallyHidden from '../content/visually-hidden.api.ts'

// Explicit imports, not `import(`../content/${slug}.api.ts`)`: the index is built synchronously, and a
// static map bundles the same under Next and Vitest. The test fails if a new api file is missing here.
const apiModules: Readonly<Record<string, object>> = {
  accordion,
  'address-input': addressInput,
  address,
  'alert-dialog': alertDialog,
  alert,
  announcer,
  autocomplete,
  badge,
  breadcrumb,
  'button-group': buttonGroup,
  button,
  calendar,
  card,
  'checkbox-group': checkboxGroup,
  checkbox,
  'code-block': codeBlock,
  combobox,
  container,
  'copy-button': copyButton,
  'date-input': dateInput,
  'date-picker': datePicker,
  'date-range-picker': dateRangePicker,
  'definition-list': definitionList,
  dialog,
  disclosure,
  'error-summary': errorSummary,
  field,
  fieldset,
  'file-upload': fileUpload,
  focus,
  grid,
  heading,
  icon,
  'input-group': inputGroup,
  kbd,
  link,
  list,
  listbox,
  map,
  menu,
  navigation,
  'number-input': numberInput,
  'one-time-code': oneTimeCode,
  'phone-input': phoneInput,
  pagination,
  popover,
  progress,
  prose,
  'quick-exit': quickExit,
  'radio-group': radioGroup,
  'read-aloud': readAloud,
  'rich-text-editor': richTextEditor,
  'route-focus': routeFocus,
  'scroll-area': scrollArea,
  section,
  'skip-link': skipLink,
  slider,
  stack,
  stepper,
  switch: switchApi,
  'table-of-contents': tableOfContents,
  table,
  tabs,
  'text-input': textInput,
  textarea,
  toast,
  toggle,
  toolbar,
  tooltip,
  'top-bar': topBar,
  'visually-hidden': visuallyHidden,
}

export interface SearchEntry {
  href: string
  label: string
  summary?: string
  /** The strings of the page's API tables and accessibility contract, for matching only. */
  body: string
}

export interface SearchHit {
  entry: SearchEntry
  /** Only when the match is in the body alone: the text around the first hit. */
  excerpt?: string
}

const excerptRadius = 60

function foldCodePoint(codePoint: string): string {
  const folded = codePoint.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en')
  return folded.length === 0 ? codePoint : (Array.from(folded)[0] ?? codePoint)
}

/** One folded code point per code point, so an index in the folded text is one in the original. */
function fold(text: string): string {
  return Array.from(text, foldCodePoint).join('')
}

function isReactElement(value: object): boolean {
  return '$$typeof' in value
}

// What an api file says to a reader; `type` and `default` are values, not prose, and only add noise.
const apiTextKeys = new Set(['name', 'description', 'meaning', 'values', 'intro'])

function collectStrings(
  value: unknown,
  seen: WeakSet<object>,
  into: string[],
  keys?: ReadonlySet<string>,
  kept = keys === undefined,
): void {
  if (typeof value === 'string') {
    if (kept) {
      into.push(value)
    }
    return
  }
  if (typeof value !== 'object' || value === null || isReactElement(value) || seen.has(value)) {
    return
  }
  seen.add(value)
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, seen, into, keys, kept))
    return
  }
  Object.entries(value).forEach(([key, item]) => {
    // A record keyed by prop name: the key is the prop a reader searches for.
    if (typeof item === 'object' && item !== null && !isReactElement(item)) {
      into.push(key)
    }
    collectStrings(item, seen, into, keys, keys === undefined || keys.has(key))
  })
}

function stringsOf(value: unknown, keys?: ReadonlySet<string>): string[] {
  const strings: string[] = []
  collectStrings(value, new WeakSet(), strings, keys)
  return strings
}

function contractStrings(slug: string): string[] {
  try {
    return stringsOf(readContract(slug))
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('No accessibility contract')) {
      return []
    }
    throw error
  }
}

function bodyOf(href: string): string {
  const slug = /^\/components\/([^/]+)$/.exec(href)?.[1]
  if (slug === undefined) {
    return ''
  }
  const api = apiModules[slug]
  return [...(api === undefined ? [] : stringsOf(api, apiTextKeys)), ...contractStrings(slug)].join(
    ' ',
  )
}

export function buildSearchIndex(
  pages: readonly { href: string; label: string; summary?: string }[],
): readonly SearchEntry[] {
  return pages.map((page) => ({
    href: page.href,
    label: page.label,
    ...(page.summary === undefined ? {} : { summary: page.summary }),
    body: bodyOf(page.href),
  }))
}

const foldedEntries = new WeakMap<
  SearchEntry,
  { label: string; summary: string; body: string; all: string }
>()

function foldedOf(entry: SearchEntry) {
  let folded = foldedEntries.get(entry)
  if (folded === undefined) {
    const label = fold(entry.label)
    const summary = fold(entry.summary ?? '')
    const body = fold(entry.body)
    folded = { label, summary, body, all: `${label} ${summary} ${body}` }
    foldedEntries.set(entry, folded)
  }
  return folded
}

/** The index of `word` at the start of a word (after a non-letter, non-digit), or -1. */
function indexOfWord(text: string, word: string): number {
  let index = text.indexOf(word)
  while (index > 0 && /[\p{L}\p{N}]/u.test(Array.from(text.slice(0, index)).at(-1) ?? '')) {
    index = text.indexOf(word, index + 1)
  }
  return index
}

function excerptAround(body: string, index: number, length: number): string {
  const characters = Array.from(body)
  const start = Math.max(0, index - excerptRadius)
  const end = Math.min(characters.length, index + length + excerptRadius)
  const text = characters.slice(start, end).join('').trim()
  return `${start > 0 ? '…' : ''}${text}${end < characters.length ? '…' : ''}`
}

/**
 * The entries containing every word of the query (or the query with its spaces removed), best
 * match first: label equals, label starts with a word, label contains, summary contains, body only.
 */
export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
): readonly SearchHit[] {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return []
  }
  const joined = words.join('')
  const matches = (text: string) =>
    words.every((word) => indexOfWord(text, word) !== -1) || indexOfWord(text, joined) !== -1

  const ranked = entries.flatMap((entry, order) => {
    const folded = foldedOf(entry)
    if (!matches(folded.all)) {
      return []
    }
    let tier = 4
    if (folded.label === words.join(' ') || folded.label === joined) {
      tier = 0
    } else if (
      words.some((word) => folded.label.startsWith(word)) ||
      folded.label.startsWith(joined)
    ) {
      tier = 1
    } else if (matches(folded.label)) {
      tier = 2
    } else if (matches(folded.summary)) {
      tier = 3
    }
    return [{ entry, order, tier }]
  })
  ranked.sort((a, b) => a.tier - b.tier || a.order - b.order)

  return ranked.map(({ entry, tier }): SearchHit => {
    if (tier < 4) {
      return { entry }
    }
    const { body } = foldedOf(entry)
    const found = [...words, joined]
      .map((word) => ({ word, index: indexOfWord(body, word) }))
      .find(({ index }) => index !== -1)
    if (found === undefined) {
      return { entry }
    }
    // Code point index: `fold` keeps one character per code point.
    const index = Array.from(body.slice(0, found.index)).length
    return { entry, excerpt: excerptAround(entry.body, index, Array.from(found.word).length) }
  })
}
