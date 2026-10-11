// Every component's keys live in the `## Keyboard` section of its `<name>.a11y.md`.
// This module reads that section. The Storybook Docs block renders what it returns, and the
// check in keyboard-docs.test.ts fails on what it reports. Pure: no DOM, no file access, and no
// markdown library.

/** The sentence a component with no focusable part starts its Keyboard section with. */
export const noKeysSentence = 'This component has no focusable parts and handles no keys.'

export interface KeyboardRow {
  key: string
  context: string
  action: string
  /** The raw Test cell: backticked `file › test name` references. */
  test: string
}

export interface KeyboardSection {
  /** The section is the no-keys sentence, with no focus lines. */
  noKeys: boolean
  focusStrategy?: string
  selectionFollowsFocus?: string
  arrowsWrap?: string
  shortcuts?: string
  rows: KeyboardRow[]
}

export interface ParsedKeyboardSection {
  /** `undefined` when the contract has no Keyboard section. */
  section: KeyboardSection | undefined
  /** What is wrong with the section's format. Empty when it is valid. */
  problems: string[]
}

const columns = ['Key', 'Context', 'Action', 'Test'] as const

type FocusLineName = 'Focus strategy' | 'Selection follows focus' | 'Arrows wrap' | 'Shortcuts'

const focusLineNames: readonly FocusLineName[] = [
  'Focus strategy',
  'Selection follows focus',
  'Arrows wrap',
  'Shortcuts',
]

const focusLineValues: Partial<Record<FocusLineName, readonly string[]>> = {
  'Focus strategy': ['native', 'roving tabindex', 'aria-activedescendant'],
  'Selection follows focus': ['n/a', 'yes', 'no'],
  'Arrows wrap': ['n/a', 'yes', 'no'],
}

/** The lines of the `## Keyboard` section, up to the next `## ` heading. */
function keyboardSectionLines(markdown: string): string[] | undefined {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => /^##\s+Keyboard\s*$/.test(line))
  if (start === -1) {
    return undefined
  }
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => /^##\s/.test(line))
  return end === -1 ? rest : rest.slice(0, end)
}

/** The cells of a `| a | b |` line. `\|` stays inside its cell. */
function tableCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return inner.split(/(?<!\\)\|/).map((cell) => cell.trim().replaceAll(String.raw`\|`, '|'))
}

const isSeparatorRow = (cells: string[]) => cells.every((cell) => /^:?-+:?$/.test(cell))

/** The first run of consecutive `|` lines: the header, the separator and the rows. */
function firstTable(lines: string[]): string[][] | undefined {
  const start = lines.findIndex((line) => line.trim().startsWith('|'))
  if (start === -1) {
    return undefined
  }
  const table: string[][] = []
  for (const line of lines.slice(start)) {
    if (!line.trim().startsWith('|')) {
      break
    }
    table.push(tableCells(line))
  }
  return table
}

function readFocusLines(lines: string[]): Partial<Record<FocusLineName, string>> {
  const found: Partial<Record<FocusLineName, string>> = {}
  for (const line of lines) {
    for (const name of focusLineNames) {
      const match = new RegExp(String.raw`^-\s+\*\*${name}:\*\*\s*(.*)$`).exec(line.trim())
      if (match !== null) {
        found[name] = (match[1] ?? '').trim()
      }
    }
  }
  return found
}

/**
 * Reads the Keyboard section of a contract: the four focus lines (or the no-keys sentence)
 * and the `Key | Context | Action | Test` table. Format problems are listed, never thrown.
 */
export function parseKeyboardSection(markdown: string): ParsedKeyboardSection {
  const lines = keyboardSectionLines(markdown)
  if (lines === undefined) {
    return { section: undefined, problems: ['no "## Keyboard" section'] }
  }

  const problems: string[] = []
  const focusLines = readFocusLines(lines)
  const foundNames = focusLineNames.filter((name) => focusLines[name] !== undefined)
  const firstLine = lines.map((line) => line.trim()).find((line) => line !== '')
  const noKeys = firstLine === noKeysSentence
  const hasFocusLines = foundNames.length > 0

  if (noKeys && hasFocusLines) {
    problems.push('has the no-keys sentence and focus lines: a component has one or the other')
  } else if (!noKeys && !hasFocusLines) {
    problems.push(`has neither the four focus lines nor the exact sentence "${noKeysSentence}"`)
  } else if (hasFocusLines) {
    for (const name of focusLineNames) {
      const value = focusLines[name]
      if (value === undefined) {
        problems.push(`focus line "${name}" is missing`)
        continue
      }
      const allowed = focusLineValues[name]
      if (allowed !== undefined && !allowed.some((word) => value.toLowerCase().startsWith(word))) {
        problems.push(
          `focus line "${name}" must start with ${allowed.slice(0, -1).join(', ')} or ${allowed.at(-1)}, not "${value}"`,
        )
      } else if (value === '') {
        problems.push(`focus line "${name}" is empty`)
      }
    }
  }

  const rows: KeyboardRow[] = []
  const table = firstTable(lines)
  const header = table?.[0]
  const headerIsRight =
    header !== undefined &&
    header.length === columns.length &&
    header.every((cell, index) => cell.toLowerCase() === columns[index]?.toLowerCase())
  if (table === undefined || !headerIsRight) {
    if (hasFocusLines && !noKeys) {
      problems.push(`has focus lines but no table with the columns ${columns.join(', ')}`)
    } else if (table !== undefined) {
      problems.push(`the table doesn't have the columns ${columns.join(', ')}`)
    }
  } else {
    const body = table.slice(1).filter((cells) => !isSeparatorRow(cells))
    for (const [index, cells] of body.entries()) {
      const [key = '', context = '', action = '', test = ''] = cells
      if (cells.length === columns.length) {
        rows.push({ key, context, action, test })
      } else {
        problems.push(
          `table row ${index + 1} ("${key}") has ${cells.length} cells, expected ${columns.length}`,
        )
      }
    }
    if (body.length === 0 && hasFocusLines && !noKeys) {
      problems.push('the table has no rows')
    }
  }

  const section: KeyboardSection = { noKeys, rows }
  if (focusLines['Focus strategy'] !== undefined)
    section.focusStrategy = focusLines['Focus strategy']
  if (focusLines['Selection follows focus'] !== undefined)
    section.selectionFollowsFocus = focusLines['Selection follows focus']
  if (focusLines['Arrows wrap'] !== undefined) section.arrowsWrap = focusLines['Arrows wrap']
  if (focusLines['Shortcuts'] !== undefined) section.shortcuts = focusLines['Shortcuts']
  // Keep the key order stable for callers that compare sections.
  return { section: reorder(section), problems }
}

function reorder(section: KeyboardSection): KeyboardSection {
  const { noKeys, focusStrategy, selectionFollowsFocus, arrowsWrap, shortcuts, rows } = section
  return {
    noKeys,
    ...(focusStrategy === undefined ? {} : { focusStrategy }),
    ...(selectionFollowsFocus === undefined ? {} : { selectionFollowsFocus }),
    ...(arrowsWrap === undefined ? {} : { arrowsWrap }),
    ...(shortcuts === undefined ? {} : { shortcuts }),
    rows,
  }
}

/** A reference in a Test cell: `button.test.tsx › Tab moves focus to the button`. */
export interface TestReference {
  /** The test file's name, like `button.test.tsx`. */
  file: string
  /** The names after the file: describe blocks, then the test. */
  path: string[]
}

const testReference = /^([\w.-]+\.test\.tsx) › (\S.*)$/

/** The backticked spans of a Test cell that look like test references, and the ones that don't. */
export function parseTestCell(cell: string): { references: TestReference[]; invalid: string[] } {
  const references: TestReference[] = []
  const invalid: string[] = []
  for (const match of cell.matchAll(/`([^`]+)`/g)) {
    const span = (match[1] ?? '').trim()
    const reference = testReference.exec(span)
    if (reference === null) {
      invalid.push(span)
    } else {
      references.push({
        file: reference[1] ?? '',
        path: (reference[2] ?? '').split(' › ').map((name) => name.trim()),
      })
    }
  }
  return { references, invalid }
}

/** The keys of a Key cell: `Tab / Shift+Tab` is `Tab` and `Shift+Tab`. */
const keyCellKeys = (cell: string): string[] => cell.split(/\s*\/\s*/).map((key) => key.trim())

/**
 * What is wrong with the rows: the Tab rows a focusable component needs, and every row's test. A
 * pattern's rows need no test (`requireTests: false`): patterns are proved by axe in their stories.
 */
export function keyboardRowProblems(
  section: KeyboardSection,
  { requireTests = true }: { requireTests?: boolean } = {},
): string[] {
  const problems: string[] = []
  const hasFocusLines = !section.noKeys
  if (hasFocusLines) {
    const keys = section.rows.flatMap((row) => keyCellKeys(row.key))
    if (!keys.includes('Tab')) problems.push('has focus lines but no Tab row')
    if (!keys.includes('Shift+Tab')) problems.push('has focus lines but no Shift+Tab row')
  }
  for (const row of requireTests ? section.rows : []) {
    const { references, invalid } = parseTestCell(row.test)
    if (references.length === 0 || invalid.length > 0) {
      problems.push(`row "${row.key}" names no test: "${row.test}"`)
    }
  }
  return problems
}

/** One part of a Key cell: keys to show in `<kbd>`, or plain text. */
export type KeyCellPart = { keys: string[] } | { text: string }

const keyName =
  /^(?:Tab|Enter|Space|Escape|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Arrow(?:Up|Down|Left|Right)|Shift|Control|Alt|Meta|Command|Control\/Command|F\d{1,2}|[A-Za-z0-9])$/

/**
 * Splits a Key cell for display. `Tab / Shift+Tab` gives `[{ keys: ['Tab'] }, { keys: ['Shift',
 * 'Tab'] }]`, so each key gets its own `<kbd>`. Anything that isn't a key ("any character",
 * "click", "–") stays text.
 */
export function splitKeyCell(cell: string): KeyCellPart[] {
  return cell.split(/\s+\/\s+/).map((token): KeyCellPart => {
    const keys = token.trim().split('+')
    return keys.every((key) => keyName.test(key)) ? { keys } : { text: token.trim() }
  })
}
