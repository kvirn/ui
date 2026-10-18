import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

// A docs use case lists "Props in this example" (`propsUsed`). Each entry must be true of the
// example's own source: a component part carries the prop as an attribute on its opening tag, and a
// hook is called with the prop as a key of its first argument. Whatever this can't parse is
// reported, never skipped, so a person decides. A part with no JSX tag anywhere in the example (a
// data type such as `MapPlace`) is a data-type part: the prop must be an object-literal key in the
// example source or in a file it imports by a relative path inside its own examples directory
// (`./texts.ts`), one level deep. Tags and hook options are read from the example source alone.

function walk(directory: string, keep: (name: string) => boolean): string[] {
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      return []
    }
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path, keep) : keep(entry.name) ? [path] : []
  })
}

const readText = (file: string) => {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return undefined
  }
}

const isSpace = (character: string | undefined) => character !== undefined && /\s/.test(character)

/** Index after a string or comment starting at `index`, or `index` when none starts there. */
function skipLiteral(source: string, index: number): number {
  const character = source[index]
  if (character === '"' || character === "'") {
    let cursor = index + 1
    while (cursor < source.length && source[cursor] !== '\n') {
      if (source[cursor] === '\\') {
        cursor += 2
        continue
      }
      if (source[cursor] === character) {
        return cursor + 1
      }
      cursor += 1
    }
    // An apostrophe in JSX text, not a string.
    return index
  }
  if (character === '`') {
    let cursor = index + 1
    while (cursor < source.length) {
      if (source[cursor] === '\\') {
        cursor += 2
        continue
      }
      if (source[cursor] === '`') {
        return cursor + 1
      }
      if (source[cursor] === '$' && source[cursor + 1] === '{') {
        cursor = skipBalanced(source, cursor + 1)
        continue
      }
      cursor += 1
    }
    return index
  }
  if (
    character === '/' &&
    (index === 0 || isSpace(source[index - 1]) || source[index - 1] === '{')
  ) {
    if (source[index + 1] === '/') {
      const end = source.indexOf('\n', index)
      return end === -1 ? source.length : end
    }
    if (source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2)
      return end === -1 ? source.length : end + 2
    }
  }
  return index
}

const closers: Record<string, string> = { '{': '}', '[': ']', '(': ')' }

/** Index just after the bracket that closes the one at `index`; `source.length` when it never closes. */
function skipBalanced(source: string, index: number): number {
  let depth = 0
  let cursor = index
  while (cursor < source.length) {
    const skipped = skipLiteral(source, cursor)
    if (skipped !== cursor) {
      cursor = skipped
      continue
    }
    const character = source[cursor] ?? ''
    if (character in closers) {
      depth += 1
    } else if (character === '}' || character === ']' || character === ')') {
      depth -= 1
      if (depth === 0) {
        return cursor + 1
      }
    }
    cursor += 1
  }
  return source.length
}

/** Split `text` on `separator` at bracket depth 0, outside strings and comments. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  let cursor = 0
  while (cursor < text.length) {
    const skipped = skipLiteral(text, cursor)
    if (skipped !== cursor) {
      cursor = skipped
      continue
    }
    const character = text[cursor] ?? ''
    if (character in closers) {
      depth += 1
    } else if (character === '}' || character === ']' || character === ')') {
      depth -= 1
    } else if (character === separator && depth === 0) {
      parts.push(text.slice(start, cursor))
      start = cursor + 1
    }
    cursor += 1
  }
  parts.push(text.slice(start))
  return parts.map((part) => part.trim()).filter((part) => part !== '')
}

interface Tag {
  attributes: Map<string, string | true>
  selfClosing: boolean
  end: number
}

/**
 * The opening tag whose `<Name` starts at `start`. Braces are skipped whole, so an arrow function's
 * `=>` never ends the tag, and a spread adds no attribute.
 */
function readTag(source: string, start: number, nameLength: number): Tag | undefined {
  const attributes = new Map<string, string | true>()
  let cursor = start + 1 + nameLength
  while (cursor < source.length) {
    const character = source[cursor] ?? ''
    const skipped = skipLiteral(source, cursor)
    if (skipped !== cursor) {
      cursor = skipped
    } else if (isSpace(character)) {
      cursor += 1
    } else if (character === '/' && source[cursor + 1] === '>') {
      return { attributes, selfClosing: true, end: cursor + 2 }
    } else if (character === '>') {
      return { attributes, selfClosing: false, end: cursor + 1 }
    } else if (character === '{') {
      cursor = skipBalanced(source, cursor)
    } else {
      const name = /^[\w:.-]+/.exec(source.slice(cursor))?.[0]
      if (name === undefined) {
        return undefined
      }
      cursor += name.length
      if (source[cursor] !== '=') {
        attributes.set(name, true)
        continue
      }
      cursor += 1
      const valueStart = cursor
      const quote = source[cursor]
      if (quote === '"' || quote === "'") {
        const close = source.indexOf(quote, cursor + 1)
        if (close === -1) {
          return undefined
        }
        cursor = close + 1
        attributes.set(name, source.slice(valueStart + 1, close))
      } else if (quote === '{') {
        cursor = skipBalanced(source, cursor)
        attributes.set(name, source.slice(valueStart + 1, cursor - 1))
      } else {
        return undefined
      }
    }
  }
  return undefined
}

function tagStarts(source: string, name: string): number[] {
  const starts: number[] = []
  const pattern = new RegExp(String.raw`<${name.replaceAll('.', String.raw`\.`)}(?=[\s/>])`, 'g')
  for (let match = pattern.exec(source); match !== null; match = pattern.exec(source)) {
    starts.push(match.index)
  }
  return starts
}

interface Problem {
  reason: string
}

/** `undefined` when the example passes the prop on a tag of one of the part's names. */
function componentPartProblem(
  source: string,
  part: string,
  prop: string,
  importedSources: string[],
): Problem | undefined {
  const names = part.split(',').map((name) => name.trim())
  let tagsSeen = 0
  for (const name of names) {
    if (!/^[A-Z][\w]*(\.[A-Z]\w*)*$/.test(name)) {
      return { reason: `"${name}" isn't a component name this check understands` }
    }
    for (const start of tagStarts(source, name)) {
      const tag = readTag(source, start, name.length)
      if (tag === undefined) {
        return { reason: `couldn't read the <${name}> tag at offset ${start}` }
      }
      tagsSeen += 1
      if (prop === 'children') {
        const rest = source.slice(tag.end)
        const hasContent = !tag.selfClosing && !new RegExp(String.raw`^\s*</${name}\s*>`).test(rest)
        if (hasContent || tag.attributes.has('children')) {
          return undefined
        }
      } else if (tag.attributes.has(prop)) {
        return undefined
      }
    }
  }
  if (tagsSeen === 0) {
    const escaped = prop.replaceAll('$', String.raw`\$`)
    const key = new RegExp(String.raw`(?<![\w$.])['"]?${escaped}['"]?\s*:`)
    return [source, ...importedSources].some((text) => key.test(text))
      ? undefined
      : { reason: `the example has no <${names.join('> or <')}> tag and no \`${prop}\` object key` }
  }
  return {
    reason: `no <${names.join('> or <')}> tag passes \`${prop}\``,
  }
}

function firstArgumentKeys(argument: string): Set<string> | undefined {
  if (!argument.startsWith('{')) {
    return undefined
  }
  const keys = new Set<string>()
  for (const field of splitTopLevel(argument.slice(1, -1), ',')) {
    const key = /^(?:['"]([^'"]+)['"]|([\w$]+))\s*(?:[:(,]|$)/.exec(field)
    const name = key?.[1] ?? key?.[2]
    if (name !== undefined) {
      keys.add(name)
    }
  }
  return keys
}

/** A hook or function: `prop` is a key of the options object a call to it passes. */
function hookOptionProblem(source: string, hook: string, prop: string): Problem | undefined {
  const pattern = new RegExp(String.raw`(?<![\w$])${hook}\s*(?:<[^>()]*>)?\(`, 'g')
  let calls = 0
  let literalCalls = 0
  for (let match = pattern.exec(source); match !== null; match = pattern.exec(source)) {
    calls += 1
    const open = match.index + match[0].length - 1
    const close = skipBalanced(source, open)
    // A hook takes its options first; a function such as `announce(message, options)` takes them
    // after other arguments.
    const argumentList = splitTopLevel(source.slice(open + 1, close - 1), ',')
    for (const argument of hook.startsWith('use') ? argumentList.slice(0, 1) : argumentList) {
      const keys = firstArgumentKeys(argument)
      if (keys === undefined) {
        continue
      }
      literalCalls += 1
      if (keys.has(prop)) {
        return undefined
      }
    }
  }
  if (calls === 0) {
    return { reason: `the example never calls ${hook}` }
  }
  if (literalCalls === 0) {
    return { reason: `${hook} is never called with an object literal this check can read` }
  }
  return { reason: `no call to ${hook} has \`${prop}\` as a key of its options object` }
}

/** A hook's result: the example reads `prop` off it, or destructures it. */
function hookResultProblem(source: string, hook: string, prop: string): Problem | undefined {
  const escaped = prop.replaceAll('$', String.raw`\$`)
  if (!source.includes(hook)) {
    return { reason: `the example never uses ${hook}` }
  }
  return new RegExp(String.raw`\??\.${escaped}\b|[{,]\s*${escaped}\s*[,}:=]`).test(source)
    ? undefined
    : { reason: `the example never reads \`${prop}\` from ${hook}'s result` }
}

const stringLiteral = /^(['"])(.*)\1$/s

interface Resolver {
  /** The value of a part expression as a string, or why it can't be read. */
  part: (expression: string) => { value: string } | { reason: string }
  /** The fields of an object-valued identifier a spread names. */
  spread: (identifier: string) => string[] | undefined
}

function constantInitialiser(source: string, identifier: string): string | undefined {
  const match = new RegExp(
    String.raw`(?:^|\n)(?:export\s+)?const\s+${identifier}\b[^=\n]*=\s*`,
  ).exec(source)
  if (match === null) {
    return undefined
  }
  const start = match.index + match[0].length
  if ('{[('.includes(source[start] ?? '')) {
    return source.slice(start, skipBalanced(source, start))
  }
  const end = source.indexOf('\n', start)
  return source.slice(start, end === -1 ? undefined : end).replace(/;\s*$/, '')
}

function createResolver(pageSource: string, pageFile: string): Resolver {
  const importedSource = (identifier: string) => {
    const match = new RegExp(
      String.raw`import\s*(?:type\s*)?\{[^}]*\b${identifier}\b[^}]*\}\s*from\s*'(\.[^']+)'`,
    ).exec(pageSource)
    return match === null ? undefined : readText(resolve(dirname(pageFile), match[1] ?? ''))
  }
  const initialiser = (identifier: string) => {
    const local = constantInitialiser(pageSource, identifier)
    if (local !== undefined) {
      return local
    }
    const imported = importedSource(identifier)
    return imported === undefined ? undefined : constantInitialiser(imported, identifier)
  }
  const part = (expression: string): { value: string } | { reason: string } => {
    const literal = stringLiteral.exec(expression)
    if (literal !== null) {
      return { value: literal[2] ?? '' }
    }
    const hook = /^apiHookPart\(\s*'([^']+)'\s*,\s*'(options|result)'\s*\)$/.exec(expression)
    if (hook !== null) {
      return { value: `${hook[1]}\u0000${hook[2]}` }
    }
    const reference = /^([A-Za-z_$][\w$]*)(?:\.(\w+))?$/.exec(expression)
    if (reference === null) {
      return { reason: `can't read the part expression \`${expression}\`` }
    }
    const resolved = initialiser(reference[1] ?? '')
    if (resolved === undefined) {
      return { reason: `can't find the constant \`${reference[1]}\`` }
    }
    if (reference[2] === undefined) {
      return part(resolved.trim())
    }
    const field = splitTopLevel(resolved.trim().slice(1, -1), ',')
      .map((entry) => new RegExp(String.raw`^${reference[2]}\s*:\s*([\s\S]+)$`).exec(entry))
      .find((match) => match !== null)
    return field === undefined
      ? { reason: `can't find \`${expression}\`` }
      : part((field?.[1] ?? '').trim())
  }
  const spread = (identifier: string) => {
    const resolved = initialiser(identifier)?.trim()
    return resolved?.startsWith('{') === true
      ? splitTopLevel(resolved.slice(1, -1), ',')
      : undefined
  }
  return { part, spread }
}

interface Entry {
  part: string | undefined
  prop: string | undefined
  reason?: string
}

function readEntry(object: string, resolver: Resolver): Entry {
  let fields = splitTopLevel(object.slice(1, -1), ',')
  const values = new Map<string, string>()
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index] ?? ''
    const spreadName = /^\.\.\.([A-Za-z_$][\w$]*)$/.exec(field)?.[1]
    if (spreadName !== undefined) {
      const spreadFields = resolver.spread(spreadName)
      if (spreadFields === undefined) {
        return {
          part: undefined,
          prop: undefined,
          reason: `can't read the spread \`...${spreadName}\``,
        }
      }
      fields = [...fields.slice(0, index), ...spreadFields, ...fields.slice(index + 1)]
      index -= 1
      continue
    }
    const keyed = /^([\w$]+)\s*:\s*([\s\S]+)$/.exec(field)
    if (keyed !== null) {
      values.set(keyed[1] ?? '', (keyed[2] ?? '').trim())
    } else if (/^[\w$]+$/.test(field)) {
      values.set(field, field)
    }
  }
  const prop = values.get('prop')
  const propLiteral = prop === undefined ? undefined : stringLiteral.exec(prop)?.[2]
  if (propLiteral === undefined) {
    return { part: undefined, prop: undefined, reason: `can't read the prop \`${prop ?? ''}\`` }
  }
  const partExpression = values.get('part')
  if (partExpression === undefined) {
    return { part: undefined, prop: propLiteral, reason: 'the entry has no part' }
  }
  const resolved = resolver.part(partExpression)
  return 'value' in resolved
    ? { part: resolved.value, prop: propLiteral }
    : { part: undefined, prop: propLiteral, reason: resolved.reason }
}

export interface UseCaseRecord {
  page: string
  id: string
  problems: string[]
}

/** `sources` key → example file (relative to `examples/`), from a route's `readExampleSource` calls. */
function exampleFilesByKey(routeSource: string): Map<string, string> {
  const files = new Map<string, string>()
  const pattern =
    /(?:'([^']+)'|"([^"]+)"|([\w$]+))\s*:\s*readExampleSource\(\s*'([^']+)'\s*,?\s*\)/g
  for (let match = pattern.exec(routeSource); match !== null; match = pattern.exec(routeSource)) {
    files.set(match[1] ?? match[2] ?? match[3] ?? '', match[4] ?? '')
  }
  return files
}

function checkEntry(
  entry: Entry,
  exampleSource: string,
  importedSources: string[],
): string | undefined {
  if (entry.reason !== undefined || entry.part === undefined || entry.prop === undefined) {
    return entry.reason ?? 'unreadable entry'
  }
  const [hook, table] = entry.part.split('\u0000')
  const problem =
    table === 'options'
      ? hookOptionProblem(exampleSource, hook ?? '', entry.prop)
      : table === 'result'
        ? hookResultProblem(exampleSource, hook ?? '', entry.prop)
        : /^[a-z]\w*$/.test(entry.part)
          ? hookOptionProblem(exampleSource, entry.part, entry.prop)
          : componentPartProblem(exampleSource, entry.part, entry.prop, importedSources)
  return problem?.reason
}

/** Texts of the files an example imports by a relative path inside its own directory. */
function relativeImports(exampleFile: string, source: string): string[] {
  const directory = dirname(exampleFile)
  const texts: string[] = []
  for (const match of source.matchAll(/from\s+'(\.[^']*)'/g)) {
    const file = resolve(directory, match[1] ?? '')
    const text = file.startsWith(directory + sep) ? readText(file) : undefined
    if (text !== undefined) {
      texts.push(text)
    }
  }
  return texts
}

/** Every use case with a `propsUsed` list, with the problems found in it. */
export function checkComponentPage(
  docsRoot: string,
  componentPageFile: string,
  exampleFiles: Map<string, string>,
): UseCaseRecord[] {
  const pageSource = readText(componentPageFile) ?? ''
  const resolver = createResolver(pageSource, componentPageFile)
  const page = relative(docsRoot, componentPageFile)
  const records: UseCaseRecord[] = []
  for (const start of tagStarts(pageSource, 'UseCase')) {
    const tag = readTag(pageSource, start, 'UseCase'.length)
    const rawId = tag?.attributes.get('id')
    const id = typeof rawId === 'string' ? rawId.replaceAll(/^['"]|['"]$/g, '') : '?'
    const propsUsed = tag?.attributes.get('propsUsed')
    if (tag === undefined) {
      records.push({ page, id, problems: ['couldn’t read the <UseCase> tag'] })
      continue
    }
    if (typeof propsUsed !== 'string') {
      continue
    }
    const problems: string[] = []
    const code = tag.attributes.get('code')
    const key =
      typeof code === 'string'
        ? /^sources(?:\[\s*['"]([^'"]+)['"]\s*\]|\.([\w$]+))$/.exec(code.trim())
        : null
    const exampleFile = key === null ? undefined : exampleFiles.get(key[1] ?? key[2] ?? '')
    const exampleSource =
      exampleFile === undefined ? undefined : readText(join(docsRoot, 'examples', exampleFile))
    const importedSources =
      exampleFile === undefined || exampleSource === undefined
        ? []
        : relativeImports(join(docsRoot, 'examples', exampleFile), exampleSource)
    const array = propsUsed.trim()
    const objects = array.startsWith('[') ? splitTopLevel(array.slice(1, -1), ',') : []
    if (!array.startsWith('[') || objects.some((object) => !object.startsWith('{'))) {
      problems.push(`can't read propsUsed \`${array.slice(0, 40)}\``)
    } else if (exampleSource === undefined) {
      problems.push(
        key === null
          ? 'code isn’t `sources[…]`, so there is no example source to check'
          : `no example file for sources "${key[1] ?? key[2]}" in the route's readExampleSource calls`,
      )
    } else {
      for (const object of objects) {
        const entry = readEntry(object, resolver)
        const reason = checkEntry(entry, exampleSource, importedSources)
        if (reason !== undefined) {
          problems.push(
            `part ${entry.part?.replace('\u0000', ' ') ?? '?'}, prop ${entry.prop ?? '?'}: ${reason} (${exampleFile ?? '?'})`,
          )
        }
      }
    }
    records.push({ page, id, problems })
  }
  return records
}

/** The route pages and the component pages they render, with each route's example files. */
function listPagePairs(docsRoot: string) {
  const routes = walk(join(docsRoot, 'app'), (name) => name === 'page.tsx').toSorted()
  const pairs = new Map<string, Map<string, string>>()
  for (const route of routes) {
    const source = readText(route) ?? ''
    const imported = /from\s+'(\.[^']*\/components\/[\w-]+-page\.tsx)'/.exec(source)?.[1]
    if (imported !== undefined) {
      pairs.set(resolve(dirname(route), imported), exampleFilesByKey(source))
    }
  }
  return pairs
}

/** All use cases of the docs site, checked. */
export function listUseCases(repositoryRoot: string): UseCaseRecord[] {
  const docsRoot = join(repositoryRoot, 'apps/docs')
  return [...listPagePairs(docsRoot)]
    .flatMap(([componentPageFile, exampleFiles]) =>
      checkComponentPage(docsRoot, componentPageFile, exampleFiles),
    )
    .toSorted((first, second) => first.page.localeCompare(second.page))
}

/** One line per entry whose prop its example doesn't pass on that part. */
export function findPropsUsedProblems(repositoryRoot: string): string[] {
  return listUseCases(repositoryRoot).flatMap(({ page, id, problems }) =>
    problems.map((problem) => `${page} › ${id}: ${problem}`),
  )
}
