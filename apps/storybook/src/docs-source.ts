// "Show code" and the Docs description show what an adopter writes. A story that
// renders a fixture component would otherwise show `<DeadlineAlert locale="sv" />`, which
// says nothing about the component. These helpers show the fixture's own source instead, so the
// code on the page is the code that renders the example and cannot drift from it.

// Every fixture and stories file as text. `import.meta.glob` with `?raw`, because a plain
// `import x from './a.fixture.tsx?raw'` is resolved as the module and has no default export for
// the linter.
const sources = import.meta.glob(['./components/*/*.fixture.tsx', './components/*/*.stories.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** One top-level function of a source file, from its `function` line to its closing brace. */
export function sourceOf(raw: string, name: string): string {
  const lines = raw.split('\n')
  const start = lines.findIndex(
    (line) => line.startsWith(`export function ${name}(`) || line.startsWith(`function ${name}(`),
  )
  if (start === -1) {
    throw new Error(`docs-source: no function ${name}`)
  }
  const end = lines.findIndex((line, index) => index > start && line === '}')
  const code = lines.slice(start, end === -1 ? undefined : end + 1).join('\n')
  return code.replace(/^export /, '')
}

/**
 * `parameters.docs.source` for a story whose `render` is made of fixture components: the source of
 * each named function, one after the other. `file` is relative to `src/components/`, such as
 * `alert/alert.fixture.tsx`.
 */
export function showSource(file: string, ...names: string[]) {
  const raw = sources[`./components/${file}`]
  if (typeof raw !== 'string') {
    throw new Error(`docs-source: no file ${file}`)
  }
  return {
    docs: {
      source: {
        code: names.map((name) => sourceOf(raw, name)).join('\n\n'),
        language: 'tsx',
        type: 'code',
      },
    },
  } as const
}

// Sections of the package docs that the Docs page leaves out: theming is its own page later, and the
// hook is code only. The stories' "Show code" is the code documentation.
const leftOutSections = new Set(['Your own look', 'Classes for the default theme', 'Hook'])

/**
 * A component's package docs (`<name>.md`) as the Docs page's description: prose only. It drops
 * the title (the page has its own), the draft note (its links only work in the repository), every
 * fenced code block (the stories' "Show code" is the code) and the sections in
 * `leftOutSections`.
 */
export function usageGuide(raw: string): string {
  const kept: string[] = []
  let isInCode = false
  let leftOutLevel = 0
  raw.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      isInCode = !isInCode
      return
    }
    if (isInCode || (index === 0 && line.startsWith('# ')) || line.startsWith('> **Draft**')) {
      return
    }
    const heading = /^(#{1,6}) (.*)$/.exec(line)
    if (heading !== null) {
      const level = heading[1]?.length ?? 0
      if (leftOutLevel > 0 && level > leftOutLevel) {
        return
      }
      leftOutLevel = leftOutSections.has(heading[2] ?? '') ? level : 0
    }
    if (leftOutLevel === 0) {
      kept.push(line)
    }
  })
  return kept
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()
}

/** The three prose parts of a usage guide, in the order the Docs page template shows them. */
export interface UsageGuideParts {
  /** Before the first `##`: what the component is, and when and where to use it. */
  lead: string
  /** The body of `## API`, without its heading: parts, props the controls can't show, states. */
  api: string
  /** Every other `##` section: anything else worth noting. */
  notes: string
}

/**
 * Splits a usage guide (`usageGuide`'s output) for the Docs page template: the lead goes above
 * the main example, the `## API` body under the controls, and the rest before the examples.
 */
export function splitUsageGuide(guide: string): UsageGuideParts {
  const lead: string[] = []
  const api: string[] = []
  const notes: string[] = []
  let current = lead
  for (const line of guide.split('\n')) {
    if (line.startsWith('## ')) {
      current = line === '## API' ? api : notes
      if (current === api) {
        continue
      }
    }
    current.push(line)
  }
  const tidy = (lines: string[]) => lines.join('\n').trim()
  return { lead: tidy(lead), api: tidy(api), notes: tidy(notes) }
}
