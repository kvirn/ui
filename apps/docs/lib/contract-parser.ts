import { messages } from '../messages/en.ts'

// Reads a component's `<name>.a11y.md` into the data the Accessibility, Keyboard and Announcements
// sections show (docs/design/docs-component-page.md §6). Pure: no file access, so a browser test can
// parse a `?raw` import. Anything the page can't place fails the build, naming the file.

const text = messages.docs.contract

export type ContractBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'heading'; id: string; text: string }

export interface ContractAccessibilitySection {
  id: string
  title: string
  body: ContractBlock[]
}

export interface ContractKeyboardRow {
  key: string
  where: string
  action: string
  /** The test's name, as the contract writes it, with the file when the table header names it. */
  test: string
}

export type ContractKeyboard =
  | { kind: 'none' }
  | {
      kind: 'keys'
      focusStrategy?: string
      selectionFollowsFocus?: string
      arrowsWrap?: string
      shortcuts?: string
      before: ContractBlock[]
      rows: ContractKeyboardRow[]
      after: ContractBlock[]
    }

export interface ContractAnnouncementRow {
  event: string
  messageKeys: string[]
  /** The example text in the key cell, such as `Sorted by Name, ascending.` */
  example?: string
  politeness: 'polite' | 'assertive' | 'polite or assertive'
}

/** A row of the `### Read aloud` table: what a screen reader reads, apart from live-region messages. */
export interface ContractReadAloudRow {
  state: string
  phrases: string
  politeness: string
  test: string
}

export type ContractAnnouncements =
  | { kind: 'none' }
  | { kind: 'rows'; rows: ContractAnnouncementRow[] }

export interface Contract {
  /** The component's name from the contract's title. */
  name: string
  accessibility: ContractAccessibilitySection[]
  keyboard: ContractKeyboard
  /** Empty when the contract says there are none. */
  knownIssues: ContractBlock[]
  announcements: ContractAnnouncements
  /** Rows of a `### Read aloud` table under Announcements, shown even when the section says "None". */
  readAloud: ContractReadAloudRow[]
  /** Derived from the AT test record (Plan 0139): tier counts and one word. */
  status: ContractStatus
}

export type TestTier = 'automated' | 'core' | 'release'

export type TestCell = 'pending' | 'pass' | 'agent-verified' | 'n/a' | 'fail'

/** A row of the AT test record under a tier row, with the cells normalised. */
export interface TestRecordRow {
  label: string
  agent: TestCell
  human: TestCell
  result: TestCell
  notes: string
}

export type TestRecord = Record<TestTier, TestRecordRow[]>

export interface TierCount {
  done: number
  total: number
  /** Every row is `n/a`: nothing to verify, so the tier never earns a word. */
  notApplicable: boolean
  /** At least one row has a human `pass`: a person tested it. */
  humanPassed: boolean
}

/** The word is the highest level that holds, and left out until every Automated row is done. */
export interface ContractStatus {
  counts: Record<TestTier, TierCount>
  word: 'Automated' | 'Agent-verified' | 'AT-verified' | 'Release-tested' | undefined
  /** The maintainer's word from the header's `- **Status:**` line (Plan 0146); it replaces `word` on the page. */
  override?: StatusOverride
}

const statusOverrides = ['Planning', 'Alpha', 'Beta', 'Stable'] as const

export type StatusOverride = (typeof statusOverrides)[number]

export class ContractError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`)
    this.name = 'ContractError'
  }
}

/** The `##` headings of the contract template (`accessibility` skill). */
const standardHeadings = [
  'Roles, states, properties',
  'Keyboard',
  'Focus management',
  'Announcements',
  'Visual / modes',
  'Consumer responsibilities',
  'AT test record',
  'Known issues',
  'WCAG SCs covered',
] as const

/**
 * Headings a few contracts add for what is particular to the component. Each shows as its own h3
 * under Accessibility. A new one is a decision: add it here, or fold it into a standard section.
 */
const componentHeadings = [
  'Virtualization',
  'Rich options',
  'Sizes, width and colour roles',
  'Pointer',
  'Masked input',
  'A Prose in a Field or Fieldset is its description',
  'Content classes: inset, steps, figure, video and audio',
  'Allowed elements',
] as const

/** The `##` headings whose content belongs to the API's Strings, not to these sections. */
const apiHeadings = ['Message keys'] as const

const headerKeys = [
  'Scope',
  'APG pattern',
  'Deviations',
  'Native elements used',
  'Status',
  'Tests',
] as const

const focusFactNames = [
  ['Focus strategy', 'focusStrategy'],
  ['Selection follows focus', 'selectionFollowsFocus'],
  ['Arrows wrap', 'arrowsWrap'],
  ['Shortcuts', 'shortcuts'],
] as const

const noKeysStart = 'This component has no focusable parts and handles no keys'

/** The header cells a pipe table may have, lower case, with a Test column's `(\`file ›\`)` removed. */
const knownColumnSets = [
  ['part', 'element / role', 'aria', 'notes'],
  ['part', 'element / role', 'aria / state', 'notes'],
  ['key', 'context', 'action', 'test'],
  ['event', 'message key (i18n)', 'politeness'],
  ['event', 'message key (i18n)', 'politeness', 'test'],
  ['state or action', 'expected phrase(s) as read aloud', 'live region politeness', 'test'],
  ['key', 'used by (owner)', 'en'],
  ['key', 'part', 'en', 'sv'],
  ['key', 'part', 'en', 'sv', 'fi'],
  ['at + browser + os', 'agent check', 'human check', 'result', 'notes'],
  ['sc', 'name', 'how'],
  ['action', 'result', 'test'],
  ['part', '`as`', 'why'],
]

const normalisedColumn = (cell: string) =>
  cell
    .replace(/\s*\(`[^`]*`\)/, '')
    .trim()
    .toLowerCase()

const slug = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

function tableCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return inner
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())
    .filter((cell) => !/^<!--.*-->$/.test(cell))
    .map((cell) => cell.replaceAll(String.raw`\|`, '|'))
}

const isSeparatorRow = (cells: string[]) => cells.every((cell) => /^:?-+:?$/.test(cell))

const isComment = (line: string) => /^\s*<!--.*-->\s*$/.test(line)

/** Blocks of one section: paragraphs, bullet lists, pipe tables and `###` headings. */
function parseBlocks(lines: string[], file: string, section: string): ContractBlock[] {
  const blocks: ContractBlock[] = []
  let index = 0
  const startsBlock = (line: string) =>
    line.trim() === '' ||
    /^(?:[-*]\s|#{1,6}\s|\|)/.test(line) ||
    line.trim().startsWith('```') ||
    isComment(line)
  while (index < lines.length) {
    const line = lines[index] ?? ''
    const trimmed = line.trim()
    if (trimmed === '' || isComment(line)) {
      index += 1
    } else if (trimmed.startsWith('```')) {
      throw new ContractError(
        file,
        `section "${section}" has a code fence, which the page can't show`,
      )
    } else if (/^#{3}\s/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{3}\s+/, '')
      blocks.push({ type: 'heading', id: slug(headingText), text: headingText })
      index += 1
    } else if (/^#{4,6}\s/.test(trimmed)) {
      throw new ContractError(file, `section "${section}" has a heading below h3: "${trimmed}"`)
    } else if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (index < lines.length && (lines[index] ?? '').trim().startsWith('|')) {
        tableLines.push(lines[index] ?? '')
        index += 1
      }
      const [header = [], ...body] = tableLines.map(tableCells)
      const columnsKey = header.map(normalisedColumn)
      if (
        !knownColumnSets.some(
          (known) =>
            known.length === columnsKey.length && known.every((cell, i) => cell === columnsKey[i]),
        )
      ) {
        throw new ContractError(
          file,
          `section "${section}" has a table with an unknown column set: ${header.join(' | ')}`,
        )
      }
      const rows = body.filter((cells) => !isSeparatorRow(cells))
      for (const [rowIndex, cells] of rows.entries()) {
        if (cells.length !== header.length) {
          throw new ContractError(
            file,
            `section "${section}", table row ${rowIndex + 1} has ${cells.length} cells, expected ${header.length}`,
          )
        }
      }
      blocks.push({ type: 'table', columns: header, rows })
    } else if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = lines[index] ?? ''
        if (/^[-*]\s/.test(current)) {
          items.push(current.replace(/^[-*]\s+/, '').trim())
          index += 1
        } else if (current.trim() !== '' && !startsBlock(current.trim())) {
          items[items.length - 1] += ` ${current.trim()}`
          index += 1
        } else if (/^\s+[-*]\s/.test(current)) {
          items[items.length - 1] += ` ${current.trim()}`
          index += 1
        } else {
          break
        }
      }
      blocks.push({ type: 'list', items })
    } else {
      const paragraphLines: string[] = []
      while (index < lines.length && !startsBlock(lines[index] ?? '')) {
        paragraphLines.push((lines[index] ?? '').trim())
        index += 1
      }
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
    }
  }
  return blocks
}

interface RawSection {
  heading: string
  lines: string[]
}

function splitSections(markdown: string, file: string) {
  // A comment such as a language marker at the end of a line is for the repository check, not the reader. A line that
  // is only a marker stays, and `parseBlocks` skips it.
  const lines = markdown.split(/\r?\n/).map((line) => {
    const stripped = line.replace(/\|\s*<!--.*?-->\s*(\|\s*)?$/, '|').replace(/\s*<!--.*?-->/g, '')
    return stripped.trim() === '' ? line : stripped
  })
  const titleLine = lines.find((line) => /^#\s/.test(line))
  if (titleLine === undefined) {
    throw new ContractError(file, 'has no "# Accessibility contract: <name>" title')
  }
  const name = titleLine
    .replace(/^#\s+Accessibility contract:\s*/, '')
    .replace(/\s*\(.*$/, '')
    .trim()
  const head: string[] = []
  const sections: RawSection[] = []
  for (const line of lines.slice(lines.indexOf(titleLine) + 1)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading !== null) {
      sections.push({ heading: heading[1] ?? '', lines: [] })
    } else if (/^#\s/.test(line)) {
      throw new ContractError(file, `has a second h1: "${line}"`)
    } else {
      ;(sections.at(-1)?.lines ?? head).push(line)
    }
  }
  const known: readonly string[] = [...standardHeadings, ...componentHeadings, ...apiHeadings]
  for (const section of sections) {
    if (!known.includes(section.heading)) {
      throw new ContractError(
        file,
        `unknown heading "## ${section.heading}". Known: ${known.join(', ')}. Add it to the parser on purpose, or fold it into a standard section.`,
      )
    }
  }
  return { name, head, sections }
}

function parseHeader(head: string[], file: string) {
  const header: Partial<Record<(typeof headerKeys)[number], string>> = {}
  const rest: string[] = []
  for (const line of head) {
    const bullet = /^-\s+\*\*([^*]+?):\*\*\s*(.*)$/.exec(line.trim())
    if (bullet === null) {
      rest.push(line)
      continue
    }
    const key = (bullet[1] ?? '').trim()
    if (!(headerKeys as readonly string[]).includes(key)) {
      throw new ContractError(
        file,
        `unknown header line "- **${key}:**". Known: ${headerKeys.join(', ')}`,
      )
    }
    header[key as (typeof headerKeys)[number]] = (bullet[2] ?? '').trim()
  }
  return { header, introduction: parseBlocks(rest, file, 'introduction') }
}

function parseKeyboard(lines: string[], file: string): ContractKeyboard {
  const blocks = parseBlocks(lines, file, 'Keyboard')
  const firstParagraph = blocks.find((block) => block.type === 'paragraph')
  if (firstParagraph?.type === 'paragraph' && firstParagraph.text.startsWith(noKeysStart)) {
    return { kind: 'none' }
  }
  const tableIndex = blocks.findIndex((block) => block.type === 'table')
  const table = blocks[tableIndex]
  if (table?.type !== 'table') {
    throw new ContractError(file, 'section "Keyboard" has no table')
  }
  const columns = table.columns.map(normalisedColumn)
  if (columns.join('|') !== 'key|context|action|test') {
    throw new ContractError(file, `section "Keyboard" has the columns ${table.columns.join(' | ')}`)
  }
  // `Test (\`file.test.tsx ›\`)`: the names in the column name their file once.
  const testFile = /\(`([^`]*?)\s*›?`\)/.exec(table.columns[3] ?? '')?.[1]
  const facts: Partial<Record<(typeof focusFactNames)[number][1], string>> = {}
  const rest: ContractBlock[] = []
  for (const block of blocks) {
    if (block.type !== 'list') {
      rest.push(block)
      continue
    }
    const items = block.items.filter((item) => {
      const fact = focusFactNames.find(([label]) => item.startsWith(`**${label}:**`))
      if (fact === undefined) {
        return true
      }
      facts[fact[1]] = item.slice(`**${fact[0]}:**`.length).trim()
      return false
    })
    if (items.length > 0) {
      rest.push({ type: 'list', items })
    }
  }
  const tablePosition = rest.indexOf(table)
  return {
    kind: 'keys',
    ...facts,
    before: rest.slice(0, tablePosition),
    rows: table.rows.map(([key = '', where = '', action = '', test = '']) => {
      const name = test.replaceAll('`', '')
      return {
        key: key.replaceAll('`', ''),
        where,
        action,
        test: testFile === undefined ? name : `${testFile} › ${name}`,
      }
    }),
    after: rest.slice(tablePosition + 1),
  }
}

const politenessIn = (cell: string): ContractAnnouncementRow['politeness'] | undefined => {
  if (/^(?:nothing|none|–|-)/i.test(cell.trim())) {
    return undefined
  }
  const polite = /\bpolite\b/i.test(cell)
  const assertive = /\bassertive\b/i.test(cell)
  if (polite && assertive) return 'polite or assertive'
  if (polite) return 'polite'
  return assertive ? 'assertive' : undefined
}

function parseAnnouncements(lines: string[], file: string): ContractAnnouncements {
  // The `### Message keys` part belongs to the API's Strings, so reading stops there.
  const end = lines.findIndex((line) => /^###\s+Message keys/.test(line))
  const blocks = parseBlocks(end === -1 ? lines : lines.slice(0, end), file, 'Announcements')
  const rows: ContractAnnouncementRow[] = []
  for (const block of blocks) {
    if (block.type !== 'table' || normalisedColumn(block.columns[0] ?? '') !== 'event') {
      continue
    }
    for (const [event = '', keyCell = '', politenessCell = ''] of block.rows) {
      const politeness = politenessIn(politenessCell)
      if (politeness === undefined) {
        continue
      }
      const example = /\("([^"]+)"/.exec(keyCell)?.[1]
      rows.push({
        event,
        messageKeys: [...keyCell.matchAll(/`([^`]+)`/g)].map((match) => match[1] ?? ''),
        ...(example === undefined ? {} : { example }),
        politeness,
      })
    }
  }
  return rows.length === 0 ? { kind: 'none' } : { kind: 'rows', rows }
}

function parseReadAloud(lines: string[], file: string): ContractReadAloudRow[] {
  return parseBlocks(lines, file, 'Announcements').flatMap((block) =>
    block.type === 'table' && normalisedColumn(block.columns[0] ?? '') === 'state or action'
      ? block.rows.map(([state = '', phrases = '', politeness = '', test = '']) => ({
          state,
          phrases,
          politeness,
          test,
        }))
      : [],
  )
}

const saysNone = (text: string) => /^none\.?$/i.test(text.trim())

function knownIssuesIn(blocks: ContractBlock[]): ContractBlock[] {
  const [only] = blocks
  const isNone =
    blocks.length === 1 &&
    only !== undefined &&
    ((only.type === 'paragraph' && saysNone(only.text)) ||
      (only.type === 'list' && only.items.length === 1 && saysNone(only.items[0] ?? '')))
  return isNone ? [] : blocks
}

const testCells: readonly string[] = ['pending', 'pass', 'agent-verified', 'n/a', 'fail']

const tierPrefixes = [
  ['automated', '**Automated'],
  ['core', '**Core'],
  ['release', '**Release'],
] as const

const doneResult = (row: TestRecordRow) => row.result === 'pass' || row.result === 'n/a'
const doneAgent = (row: TestRecordRow) =>
  row.agent === 'pass' || row.agent === 'agent-verified' || row.agent === 'n/a'

/** Pure: the counts and the status word the plan's table (0139 §Derived status) gives. */
export function deriveStatus(tiers: TestRecord): ContractStatus {
  const count = (rows: TestRecordRow[]): TierCount => ({
    done: rows.filter(doneResult).length,
    total: rows.length,
    notApplicable: rows.length > 0 && rows.every((row) => row.result === 'n/a'),
    humanPassed: rows.some((row) => row.human === 'pass'),
  })
  const counts = {
    automated: count(tiers.automated),
    core: count(tiers.core),
    release: count(tiers.release),
  }
  const all = (tier: TestTier) => counts[tier].total > 0 && counts[tier].done === counts[tier].total
  const automated = all('automated')
  const agentVerified =
    automated && tiers.core.length > 0 && !counts.core.notApplicable && tiers.core.every(doneAgent)
  const verified = automated && all('core') && counts.core.humanPassed
  const word = !automated
    ? undefined
    : verified && all('release') && counts.release.humanPassed
      ? 'Release-tested'
      : verified
        ? 'AT-verified'
        : agentVerified
          ? 'Agent-verified'
          : 'Automated'
  return { counts, word }
}

const derivedRank = {
  Automated: 1,
  'Agent-verified': 1,
  'AT-verified': 2,
  'Release-tested': 2,
} as const

// Stable ranks with Beta: the matrix can't prove an API freeze.
const overrideRank = { Planning: 0, Alpha: 1, Beta: 2, Stable: 2 } as const

function parseStatusOverride(value: string | undefined, file: string): StatusOverride | undefined {
  const word = value?.replaceAll(/<!--.*?-->/g, '').trim()
  if (word === undefined || word === '') {
    return undefined
  }
  const override = statusOverrides.find((candidate) => candidate === word)
  if (override === undefined) {
    throw new ContractError(
      file,
      `has the Status "${word}". Allowed: ${statusOverrides.join(', ')}, or leave the line out`,
    )
  }
  return override
}

function warnOverrideAboveEvidence(status: ContractStatus, file: string) {
  const { override, word } = status
  if (
    override !== undefined &&
    overrideRank[override] > (word === undefined ? 0 : derivedRank[word])
  ) {
    console.warn(
      `${file}: Status override "${override}" is above the AT test record (derived: ${word ?? 'Not yet verified'})`,
    )
  }
}

function parseTestRecord(blocks: ContractBlock[], file: string): TestRecord {
  const tiers: TestRecord = { automated: [], core: [], release: [] }
  const table = blocks.find(
    (block) =>
      block.type === 'table' && normalisedColumn(block.columns[0] ?? '') === 'at + browser + os',
  )
  if (table?.type !== 'table') {
    return tiers
  }
  let current: TestTier | undefined
  for (const [label = '', agent = '', human = '', result = '', notes = ''] of table.rows) {
    const tier = tierPrefixes.find(([, prefix]) => label.startsWith(prefix))
    if (tier !== undefined || label.startsWith('**')) {
      // A bold row of another name (`**Component-specific**`) counts in the Core tier.
      current = tier?.[0] ?? 'core'
      continue
    }
    if (current === undefined) {
      continue
    }
    const cells = [agent, human, result].map((cell) =>
      cell.replaceAll('`', '').trim().toLowerCase(),
    )
    for (const [index, cell] of cells.entries()) {
      if (!testCells.includes(cell)) {
        throw new ContractError(
          file,
          `AT test record row "${label}" has the ${['Agent check', 'Human check', 'Result'][index]} cell "${cell}". Allowed: ${testCells.join(', ')}`,
        )
      }
    }
    // An Automated row's Human check is n/a by rule, so it needs no reason of its own.
    const needsReason = current === 'automated' ? [cells[0], cells[2]] : cells
    if (needsReason.includes('n/a') && notes.trim() === '') {
      throw new ContractError(
        file,
        `AT test record row "${label}" is n/a and needs a reason in Notes`,
      )
    }
    const [agentCell, humanCell, resultCell] = cells as TestCell[]
    const rowError = (message: string) =>
      new ContractError(file, `AT test record row "${label}" ${message}`)
    if (resultCell === 'pass') {
      for (const cell of [agentCell, humanCell]) {
        if (cell !== 'pass' && cell !== 'n/a') {
          throw rowError(
            'has the Result pass but its Agent check and Human check are not both pass or n/a',
          )
        }
      }
    }
    if (current === 'automated' && (humanCell !== 'n/a' || cells.includes('agent-verified'))) {
      throw rowError(
        'is an Automated row: its Human check must be n/a and agent-verified is not allowed',
      )
    }
    tiers[current].push({
      label,
      agent: agentCell ?? 'pending',
      human: humanCell ?? 'pending',
      result: resultCell ?? 'pending',
      notes: notes.trim(),
    })
  }
  return tiers
}

const accessibilityOrder = [
  ['what-it-does-for-you', 'whatItDoes'],
  ['what-you-need-to-do', 'whatYouNeedToDo'],
] as const

export function parseContract(markdown: string, file: string): Contract {
  const { name, head, sections } = splitSections(markdown, file)
  const { header, introduction } = parseHeader(head, file)
  const linesOf = (heading: string) =>
    sections.find((section) => section.heading === heading)?.lines
  const blocksOf = (heading: string) => {
    const lines = linesOf(heading)
    return lines === undefined ? [] : parseBlocks(lines, file, heading)
  }

  const keyboardLines = linesOf('Keyboard')
  if (keyboardLines === undefined) {
    throw new ContractError(file, 'has no "## Keyboard" section')
  }
  const announcementLines = linesOf('Announcements')
  const announcements =
    announcementLines === undefined
      ? ({ kind: 'none' } as const)
      : parseAnnouncements(announcementLines, file)

  const headerItems = (
    [
      ['Scope', header['Scope']],
      ['APG pattern', header['APG pattern']],
      ['Deviations', header['Deviations']],
      ['Native elements used', header['Native elements used']],
    ] as const
  ).flatMap(([label, value]) => (value === undefined ? [] : [`**${label}:** ${value}`]))

  const candidates: Record<string, ContractBlock[]> = {
    whatItDoes: [
      ...(headerItems.length === 0 ? [] : [{ type: 'list', items: headerItems } as const]),
      ...introduction,
      ...blocksOf('Roles, states, properties'),
    ],
    whatYouNeedToDo: blocksOf('Consumer responsibilities'),
    focus: blocksOf('Focus management'),
  }
  const accessibility: ContractAccessibilitySection[] = []
  const add = (id: string, title: string, body: ContractBlock[]) => {
    if (body.length > 0) {
      accessibility.push({ id, title, body })
    }
  }
  const addTitled = (id: string, key: keyof typeof text.accessibility, heading: string) =>
    add(id, text.accessibility[key], blocksOf(heading))
  for (const [id, key] of accessibilityOrder) {
    add(id, text.accessibility[key], candidates[key] ?? [])
  }
  addTitled('visual-and-modes', 'visual', 'Visual / modes')
  add('focus', text.accessibility.focus, candidates['focus'] ?? [])
  for (const heading of componentHeadings) {
    add(slug(heading), heading, blocksOf(heading))
  }
  addTitled('wcag-success-criteria', 'wcag', 'WCAG SCs covered')
  addTitled('testing', 'testing', 'AT test record')

  const override = parseStatusOverride(header['Status'], file)
  const status = {
    ...deriveStatus(parseTestRecord(blocksOf('AT test record'), file)),
    ...(override === undefined ? {} : { override }),
  }
  warnOverrideAboveEvidence(status, file)

  return {
    name,
    accessibility,
    keyboard: parseKeyboard(keyboardLines, file),
    knownIssues: knownIssuesIn(blocksOf('Known issues')),
    announcements,
    readAloud: announcementLines === undefined ? [] : parseReadAloud(announcementLines, file),
    status,
  }
}

const keyName =
  '(?:Tab|Enter|Space|Escape|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Arrows?|Arrow(?:Up|Down|Left|Right)|Shift|Control/Command|Control|Alt|Meta|Command|F\\d{1,2}|[A-Za-z0-9])'
const keyCombination = new RegExp(`^${keyName}(?:\\+${keyName})*$`)
const keyAlternatives = new RegExp(`^${keyName}/${keyName}$`)

export type KeyCellPart = { keys: string[] } | { text: string }

/**
 * Splits a Key cell for display, keeping the contract's names: `Tab / Shift+Tab` is two parts and
 * `Shift+Tab` is the keys `Shift` and `Tab`. What isn't a key (`–`, `(a key already handled)`,
 * `Pointer press`) stays text, and the ` / ` and `, ` between parts stay text too.
 */
export function keyCellParts(cell: string): KeyCellPart[] {
  const parts: KeyCellPart[] = []
  for (const token of cell.split(/(\s+\/\s+|,\s+)/)) {
    if (/^(?:\s+\/\s+|,\s+)$/.test(token)) {
      parts.push({ text: token })
    } else if (keyCombination.test(token)) {
      parts.push({ keys: token.split('+') })
    } else if (keyAlternatives.test(token)) {
      const [first = '', second = ''] = token.split('/')
      parts.push({ keys: [first] }, { text: '/' }, { keys: [second] })
    } else if (token !== '') {
      parts.push({ text: token })
    }
  }
  return parts
}
