import { describe, expect, it } from 'vite-plus/test'
import {
  keyboardRowProblems,
  noKeysSentence,
  parseKeyboardSection,
  splitKeyCell,
} from './parse-keyboard-section.ts'

// Inline fixtures: the parser reads only the `## Keyboard` section (skill keyboard).

const focusLines = `- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none`

const tableHeader = `| Key | Context | Action | Test |
| --- | --- | --- | --- |`

const contract = (keyboard: string) => `# Accessibility contract: Thing

## Roles, states, properties

| Part | Role |
| --- | --- |
| Thing | button |

## Keyboard

${keyboard}

## Focus management

- Initial focus: not moved.
`

describe('parseKeyboardSection', () => {
  it('reads the four focus lines and every row of the table', () => {
    const { section, problems } = parseKeyboardSection(
      contract(`${focusLines}

${tableHeader}
| Tab | Before the box | Moves focus into the input | \`input.e2e.ts › Tab focuses the input\` |
| Shift+Tab | In the input | Moves focus to the previous focusable | \`input.e2e.ts › Shift+Tab leaves the input\` |
`),
    )
    expect(problems).toEqual([])
    expect(section).toEqual({
      noKeys: false,
      focusStrategy: 'native',
      selectionFollowsFocus: 'n/a',
      arrowsWrap: 'n/a',
      shortcuts: 'none',
      rows: [
        {
          key: 'Tab',
          context: 'Before the box',
          action: 'Moves focus into the input',
          test: '`input.e2e.ts › Tab focuses the input`',
        },
        {
          key: 'Shift+Tab',
          context: 'In the input',
          action: 'Moves focus to the previous focusable',
          test: '`input.e2e.ts › Shift+Tab leaves the input`',
        },
      ],
    })
  })

  it('reads only the Keyboard section, up to the next heading', () => {
    const { section } = parseKeyboardSection(
      contract(`${focusLines}

${tableHeader}
| Tab | A | B | \`x.e2e.ts › y\` |
`),
    )
    // The Roles table above and the list below it aren't rows.
    expect(section?.rows).toHaveLength(1)
  })

  it('accepts the exact no-keys sentence, and no focus lines', () => {
    const { section, problems } = parseKeyboardSection(contract(noKeysSentence))
    expect(problems).toEqual([])
    expect(section).toEqual({ noKeys: true, rows: [] })
  })

  it('accepts the no-keys sentence followed by Tab rows that prove Tab passes over it', () => {
    const { section, problems } = parseKeyboardSection(
      contract(`${noKeysSentence}

${tableHeader}
| Tab | Card with links | Skips the card | \`card.e2e.ts › Tab skips the card\` |
`),
    )
    expect(problems).toEqual([])
    expect(section?.noKeys).toBe(true)
    expect(section?.rows).toHaveLength(1)
  })

  it('reports a missing Keyboard section', () => {
    const { section, problems } = parseKeyboardSection('# Thing\n\n## Focus management\n')
    expect(section).toBeUndefined()
    expect(problems).toEqual(['no "## Keyboard" section'])
  })

  it('reports prose that is neither the focus lines nor the no-keys sentence', () => {
    const { problems } = parseKeyboardSection(contract('Card handles no keys.'))
    expect(problems).toEqual([
      `has neither the four focus lines nor the exact sentence "${noKeysSentence}"`,
    ])
  })

  it('reports a near-miss of the no-keys sentence as not exact', () => {
    const { problems } = parseKeyboardSection(
      contract('This component has no focusable parts and handles no keys'),
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('exact sentence')
  })

  it('names every missing focus line', () => {
    const { problems } = parseKeyboardSection(
      contract(`- **Focus strategy:** native
- **Shortcuts:** none

${tableHeader}
| Tab | A | B | \`x.e2e.ts › y\` |
`),
    )
    expect(problems).toEqual([
      'focus line "Selection follows focus" is missing',
      'focus line "Arrows wrap" is missing',
    ])
  })

  it('reports an unknown focus strategy and a value that is not n/a, yes or no', () => {
    const { problems } = parseKeyboardSection(
      contract(`- **Focus strategy:** magic
- **Selection follows focus:** maybe
- **Arrows wrap:** n/a
- **Shortcuts:** none

${tableHeader}
| Tab | A | B | \`x.e2e.ts › y\` |
`),
    )
    expect(problems).toEqual([
      'focus line "Focus strategy" must start with native, roving tabindex or aria-activedescendant, not "magic"',
      'focus line "Selection follows focus" must start with n/a, yes or no, not "maybe"',
    ])
  })

  it('reports focus lines together with the no-keys sentence', () => {
    const { problems } = parseKeyboardSection(contract(`${noKeysSentence}\n\n${focusLines}`))
    expect(problems).toEqual([
      'has the no-keys sentence and focus lines: a component has one or the other',
    ])
  })

  it('reports focus lines without a table', () => {
    const { problems } = parseKeyboardSection(contract(focusLines))
    expect(problems).toEqual([
      'has focus lines but no table with the columns Key, Context, Action, Test',
    ])
  })

  it('reports a table with the wrong columns', () => {
    const { problems } = parseKeyboardSection(
      contract(`${focusLines}

| Key | Action |
| --- | --- |
| Tab | Moves |
`),
    )
    expect(problems).toEqual([
      'has focus lines but no table with the columns Key, Context, Action, Test',
    ])
  })

  it('reports a row with the wrong number of cells', () => {
    const { problems } = parseKeyboardSection(
      contract(`${focusLines}

${tableHeader}
| Tab | Input | Moves focus |
`),
    )
    expect(problems).toEqual(['table row 1 ("Tab") has 3 cells, expected 4'])
  })

  it('reports a table with no rows', () => {
    const { problems } = parseKeyboardSection(contract(`${focusLines}\n\n${tableHeader}\n`))
    expect(problems).toEqual(['the table has no rows'])
  })

  it('keeps an escaped pipe inside a cell', () => {
    const { section } = parseKeyboardSection(
      contract(`${focusLines}

${tableHeader}
| Tab | A \\| B | Moves | \`x.e2e.ts › y\` |
`),
    )
    expect(section?.rows[0]?.context).toBe('A | B')
  })
})

describe('keyboardRowProblems', () => {
  const row = (key: string, test: string) => ({ key, context: 'c', action: 'a', test })
  const section = (rows: ReturnType<typeof row>[], noKeys = false) => ({
    noKeys,
    ...(noKeys
      ? {}
      : {
          focusStrategy: 'native',
          selectionFollowsFocus: 'n/a',
          arrowsWrap: 'n/a',
          shortcuts: 'none',
        }),
    rows,
  })
  const tab = row('Tab', '`x.e2e.ts › Tab focuses it`')
  const shiftTab = row('Shift+Tab', '`x.e2e.ts › Shift+Tab leaves it`')

  it('passes a section with Tab and Shift+Tab rows that name tests', () => {
    expect(keyboardRowProblems(section([tab, shiftTab]))).toEqual([])
  })

  it('accepts one combined "Tab / Shift+Tab" row', () => {
    expect(
      keyboardRowProblems(section([row('Tab / Shift+Tab', '`x.e2e.ts › Tab moves through`')])),
    ).toEqual([])
  })

  it('requires a Tab row and a Shift+Tab row when there are focus lines', () => {
    expect(keyboardRowProblems(section([tab]))).toEqual(['has focus lines but no Shift+Tab row'])
    expect(keyboardRowProblems(section([shiftTab]))).toEqual(['has focus lines but no Tab row'])
  })

  it('does not require Tab rows for a component with no keys', () => {
    expect(keyboardRowProblems(section([], true))).toEqual([])
  })

  it('requires every row to name an e2e or a component test', () => {
    expect(
      keyboardRowProblems(
        section([
          tab,
          shiftTab,
          row('Enter', 'Native behaviour, not asserted'),
          row('Escape', '–'),
          row('Home', ''),
          row('End', '`x.stories.tsx › Foo`'),
          row('Space', '`button.test.tsx › disabled › …`'),
        ]),
      ),
    ).toEqual([
      'row "Enter" names no test: "Native behaviour, not asserted"',
      'row "Escape" names no test: "–"',
      'row "Home" names no test: ""',
      'row "End" names no test: "`x.stories.tsx › Foo`"',
    ])
  })

  it('accepts several tests in one cell', () => {
    expect(
      keyboardRowProblems(
        section([tab, shiftTab, row('Space', '`a.test.tsx › one`, `a.e2e.ts › two`')]),
      ),
    ).toEqual([])
  })
})

describe('splitKeyCell', () => {
  it('shows each key in its own kbd, and Shift+Tab as Shift then Tab', () => {
    expect(splitKeyCell('Tab / Shift+Tab')).toEqual([{ keys: ['Tab'] }, { keys: ['Shift', 'Tab'] }])
  })

  it('keeps the platform pair together', () => {
    expect(splitKeyCell('Control/Command+A')).toEqual([{ keys: ['Control/Command', 'A'] }])
  })

  it('leaves words that are not keys as text', () => {
    expect(splitKeyCell('any character')).toEqual([{ text: 'any character' }])
    expect(splitKeyCell('click')).toEqual([{ text: 'click' }])
    expect(splitKeyCell('–')).toEqual([{ text: '–' }])
    expect(splitKeyCell('Arrow keys')).toEqual([{ text: 'Arrow keys' }])
  })

  it('mixes keys and text', () => {
    expect(splitKeyCell('ArrowUp / ArrowLeft')).toEqual([
      { keys: ['ArrowUp'] },
      { keys: ['ArrowLeft'] },
    ])
  })
})
