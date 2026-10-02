// "Show code" and the Docs description show what an adopter writes (ADR-0023). A story that
// renders a fixture component would otherwise show `<DeadlineNotification locale="sv" />`, which
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
 * `notification/notification.fixture.tsx`.
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

/**
 * A component's package docs (`<name>.md`) as the Docs page's description: the usage guide, without
 * the title (the page has its own) and the draft note, whose links only work in the repository.
 */
export function usageGuide(raw: string): string {
  return raw
    .split('\n')
    .filter(
      (line, index) => !(index === 0 && line.startsWith('# ')) && !line.startsWith('> **Draft**'),
    )
    .join('\n')
    .trimStart()
}
