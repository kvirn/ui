import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'

// Docs and stories write a component the way the naming rules say (api-conventions skill): a
// component with parts is `X.Root` + `X.Part`, a single element is flat, and the flat part
// exports (`FieldRoot`, `CardHeader`) exist for React Server Components, not for examples.
// This test lists every JSX opening of a deprecated or flat form as file:line.
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))

// Components that are namespaces or have a Root. A tag that is one of their flat part exports
// (`<FieldRoot`, `<CardHeader`, `<LinkNewTabNotice`) is banned too. Built from the public entry.
const namespaces = [
  'Autocomplete',
  'Card',
  'CheckboxGroup',
  'Combobox',
  'DateInput',
  'Field',
  'Fieldset',
  'FileUpload',
  'InputGroup',
  'Link',
  'Listbox',
  'Notification',
  'OneTimeCode',
  'Popover',
  'Prose',
  'RadioGroup',
  'Section',
  'Table',
  'Toolbar',
]

interface BannedForm {
  /** Matches the opening of a JSX tag, so prose that mentions a name without `<` is fine. */
  pattern: RegExp
  /** What to write instead. */
  use: string
}

// The one list of deprecated forms. `(?![\w.])` keeps `<Field.Root` and `<FieldRoot` apart from
// `<Field`, and `<Radio` apart from `<RadioGroup`.
const deprecatedForms: BannedForm[] = [
  { pattern: /<Field(?![\w.])/, use: 'Field.Root' },
  { pattern: /<Fieldset(?![\w.])/, use: 'Fieldset.Root' },
  { pattern: /<Link(?![\w.])/, use: 'Link.Root' },
  { pattern: /<Label(?![\w.])/, use: 'Field.Label' },
  { pattern: /<ErrorMessage(?![\w.])/, use: 'Field.ErrorMessage (or the group’s own)' },
  { pattern: /<Legend(?![\w.])/, use: 'Fieldset.Legend (or the group’s own)' },
  { pattern: /<Prose\.Root(?!\w)/, use: 'Prose' },
  { pattern: /<Section\.Root(?!\w)/, use: 'Section' },
  { pattern: /<Radio(?![\w.])/, use: 'RadioGroup.Radio' },
  { pattern: /<LinkNewTabNotice(?!\w)/, use: 'Link.NewTabNotice' },
  { pattern: /<FieldRoot(?!\w)/, use: 'Field.Root' },
  { pattern: /<CardRoot(?!\w)/, use: 'Card.Root' },
]

/** The names `export { … }` (not `export type`) lists in `packages/react/src/index.ts`. */
function exportedNames(): string[] {
  const entry = readFileSync(join(repositoryRoot, 'packages/react/src/index.ts'), 'utf8')
  const names: string[] = []
  for (const block of entry.matchAll(/^export \{([^}]*)\}/gm)) {
    for (const name of (block[1] ?? '').split(',')) {
      const trimmed = name.trim()
      if (trimmed !== '') {
        names.push(trimmed)
      }
    }
  }
  return names
}

/** `<XxxRoot`, `<XxxPart` and every other flat part export of a namespace. */
function flatPartForms(): BannedForm[] {
  const forms: BannedForm[] = []
  for (const name of exportedNames()) {
    const namespace = namespaces.find(
      (candidate) => name.startsWith(candidate) && /^[A-Z]/.test(name.slice(candidate.length)),
    )
    if (namespace !== undefined) {
      const part = name.slice(namespace.length)
      forms.push({ pattern: new RegExp(`<${name}(?!\\w)`), use: `${namespace}.${part}` })
    }
  }
  return forms
}

function bannedForms(): BannedForm[] {
  return [...deprecatedForms, ...flatPartForms()]
}

function walk(directory: string, include: (file: string) => boolean): string[] {
  const found: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      found.push(...walk(path, include))
    } else if (include(path)) {
      found.push(path)
    }
  }
  return found
}

function docFiles(): string[] {
  const stories = walk(
    join(repositoryRoot, 'apps/storybook/src'),
    (file) => /\.(tsx|mdx)$/.test(file) && !file.endsWith('.test.tsx'),
  )
  const guides = walk(join(repositoryRoot, 'packages/react/src'), (file) => file.endsWith('.md'))
  return [...stories, ...guides]
}

function findProblems(files: string[], forms: BannedForm[]): string[] {
  const problems: string[] = []
  for (const file of files) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const form of forms) {
          const match = form.pattern.exec(line)
          if (match !== null) {
            problems.push(
              `${relative(repositoryRoot, file)}:${index + 1}: ${match[0]} → write ${form.use}`,
            )
          }
        }
      })
  }
  return problems
}

describe('component naming in docs and stories', () => {
  it('matches the deprecated and flat forms, and nothing else', () => {
    const forms = bannedForms()
    const hits = (line: string) => forms.filter((form) => form.pattern.test(line)).length

    for (const banned of [
      '<Field>',
      '<Field required>',
      '<Field',
      '<Fieldset>',
      '<Link href="/x">',
      '<Label>',
      '<ErrorMessage>',
      '<Legend>',
      '<Prose.Root>',
      '<Section.Root>',
      '<Radio value="a" />',
      '<LinkNewTabNotice />',
      '<FieldRoot>',
      '<CardRoot>',
      '<CardHeader>',
      '<FieldLabel>',
      '<FieldsetLegend>',
      '<ToolbarRoot>',
      '<ToolbarGroup>',
    ]) {
      expect(hits(banned), banned).toBeGreaterThan(0)
    }
    for (const allowed of [
      '<Field.Root>',
      '<Fieldset.Root group>',
      '<Link.Root href="/x">',
      '<Link.NewTabNotice />',
      '<Field.Label>',
      '<Prose>',
      '<Section>',
      '<RadioGroup.Root>',
      '<RadioGroup.Radio value="a" />',
      '<InputGroup.Input />',
      '<Card.Header>',
      '<Toolbar.Root aria-label="Formatering">',
      '<Toolbar.Group aria-label="Textstil">',
      '<ButtonGroup aria-label="Ärendet">',
      '<Toggle pressed={isOn}>',
      'the Field wires the Label',
      '`Label` is deprecated',
    ]) {
      expect(hits(allowed), allowed).toBe(0)
    }
  })

  it('knows the flat part exports from the public entry', () => {
    const patterns = flatPartForms().map((form) => form.pattern.source)
    expect(patterns).toEqual(
      expect.arrayContaining(['<FieldRoot(?!\\w)', '<CardHeader(?!\\w)', '<ComboboxOption(?!\\w)']),
    )
    // A namespace itself, and a different component that shares a prefix, are not flat parts.
    expect(patterns).not.toContain('<InputGroup(?!\\w)')
    expect(patterns).not.toContain('<CheckboxGroup(?!\\w)')
  })

  it('scans the stories, the MDX and the package guides', () => {
    const files = docFiles().map((file) => relative(repositoryRoot, file))
    expect(files).toEqual(
      expect.arrayContaining([
        'packages/react/src/field/field.md',
        'packages/react/src/link/link.md',
      ]),
    )
    expect(files.some((file) => file.startsWith('apps/storybook/src/'))).toBe(true)
    expect(files.some((file) => file.endsWith('.test.tsx'))).toBe(false)
  })

  it('has no deprecated or flat form in any story, MDX page or package guide', () => {
    expect(findProblems(docFiles(), bannedForms())).toEqual([])
  })
})
