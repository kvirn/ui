import { colorTokenNames } from './contrast-requirements.ts'
import type { ColorTokenName, ThemeName } from './contrast-requirements.ts'

// Reads `theme.css` the way a browser would for `<html>`, for one theme, and resolves every
// `var()` to a value. Only as much CSS as a theme file needs: rules, `@layer`, `@media` with
// `and`, and `:root` selectors with attributes, `:not()`, `:is()` and `:where()`.

interface CssRule {
  selectors: string[]
  media: string[]
  declarations: [property: string, value: string][]
}

/** What `<html>` looks like: its attributes and the user's settings. */
export interface ThemeEnvironment {
  attributes: Record<string, string>
  media: {
    'prefers-color-scheme': 'light' | 'dark'
    'prefers-contrast': 'no-preference' | 'more'
    'forced-colors': 'none' | 'active'
  }
}

const themeSettings: Record<ThemeName, readonly ['light' | 'dark', 'standard' | 'more']> = {
  light: ['light', 'standard'],
  dark: ['dark', 'standard'],
  'light-contrast': ['light', 'more'],
  'dark-contrast': ['dark', 'more'],
}

/**
 * A theme as KvirnProvider selects it (`data-kv-color-scheme`, `data-kv-contrast`), or, with
 * `'system'`, as the OS selects it before JavaScript runs.
 */
export function themeEnvironment(
  themeName: ThemeName,
  source: 'attributes' | 'system' = 'attributes',
): ThemeEnvironment {
  const [colorScheme, contrast] = themeSettings[themeName]
  return source === 'attributes'
    ? {
        attributes: { 'data-kv-color-scheme': colorScheme, 'data-kv-contrast': contrast },
        media: {
          'prefers-color-scheme': 'light',
          'prefers-contrast': 'no-preference',
          'forced-colors': 'none',
        },
      }
    : {
        attributes: {},
        media: {
          'prefers-color-scheme': colorScheme,
          'prefers-contrast': contrast === 'more' ? 'more' : 'no-preference',
          'forced-colors': 'none',
        },
      }
}

/** Splits on `separator` outside parentheses and quotes. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | undefined
  let start = 0
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quote !== undefined) {
      if (character === quote) {
        quote = undefined
      }
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth -= 1
    } else if (character === separator && depth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map((part) => part.trim()).filter((part) => part !== '')
}

function parseDeclarations(body: string): [string, string][] {
  return splitTopLevel(body, ';').flatMap((declaration) => {
    const colon = declaration.indexOf(':')
    return colon === -1
      ? []
      : [
          [
            declaration.slice(0, colon).trim(),
            declaration
              .slice(colon + 1)
              .trim()
              .replaceAll(/\s+/g, ' '),
          ],
        ]
  })
}

/** The index of the next `{`, `}` or `;` at or after `start`, outside quotes and parentheses. */
function findToken(text: string, start: number): number {
  let depth = 0
  let quote: string | undefined
  for (let index = start; index < text.length; index += 1) {
    const character = text[index]
    if (quote !== undefined) {
      if (character === quote) {
        quote = undefined
      }
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth -= 1
    } else if (depth === 0 && (character === '{' || character === '}' || character === ';')) {
      return index
    }
  }
  return -1
}

/** A nested selector as a full one: `&` is the parent, and without `&` it's a descendant. */
function resolveNestedSelector(selector: string, parents: readonly string[]): string {
  const parent = `:is(${parents.join(', ')})`
  return selector.includes('&') ? selector.replaceAll('&', parent) : `${parent} ${selector}`
}

/**
 * Every style rule, with the `@media` conditions around it, in source order. Nested rules
 * (CSS nesting) come out as rules of their own, with `&` resolved to `:is(<parent>)`.
 */
export function parseCssRules(css: string): CssRule[] {
  const text = css.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const rules: CssRule[] = []
  let position = 0

  /** Parses up to the closing `}`. Inside a style rule it returns that rule's declarations. */
  function parseBlock(media: string[], parents: readonly string[] | undefined) {
    const declarations: [string, string][] = []
    const addDeclarations = (chunk: string) => {
      if (parents !== undefined) {
        declarations.push(...parseDeclarations(chunk))
      }
    }
    while (position < text.length) {
      const tokenIndex = findToken(text, position)
      if (tokenIndex === -1) {
        addDeclarations(text.slice(position))
        position = text.length
        break
      }
      const prelude = text.slice(position, tokenIndex).trim()
      const token = text[tokenIndex]
      position = tokenIndex + 1
      if (token === '}') {
        addDeclarations(prelude)
        break
      }
      if (token === ';') {
        addDeclarations(prelude)
        continue
      }
      if (prelude.startsWith('@')) {
        const blockMedia = prelude.startsWith('@media')
          ? [...media, prelude.slice('@media'.length).trim()]
          : media
        const rule: CssRule = {
          selectors: [...(parents ?? [])],
          media: blockMedia,
          declarations: [],
        }
        rules.push(rule)
        rule.declarations = parseBlock(blockMedia, parents)
      } else {
        const selectors = splitTopLevel(prelude, ',')
          .map((selector) =>
            selector.replaceAll(/\s+/g, ' ').replaceAll(/\( | (?=\))/g, (match) => match.trim()),
          )
          .map((selector) =>
            parents === undefined ? selector : resolveNestedSelector(selector, parents),
          )
        const rule: CssRule = { selectors, media, declarations: [] }
        rules.push(rule)
        rule.declarations = parseBlock(media, selectors)
      }
    }
    return declarations
  }

  parseBlock([], undefined)
  // Wrappers such as @layer, @media and a parent of nested rules declare nothing themselves.
  return rules.filter((rule) => rule.declarations.length > 0)
}

function matchesMedia(condition: string, environment: ThemeEnvironment): boolean {
  return condition.split(/\s+and\s+/).every((feature) => {
    const match = /^\(\s*([\w-]+)\s*:\s*([\w-]+)\s*\)$/.exec(feature.trim())
    if (match === null) {
      // Range queries such as (width >= 64rem) don't choose a theme.
      return false
    }
    const [, name, value] = match
    return (environment.media as Record<string, string | undefined>)[name ?? ''] === value
  })
}

interface SelectorMatch {
  matches: boolean
  specificity: number
}

const noMatch: SelectorMatch = { matches: false, specificity: 0 }

/** The argument of the pseudo-class that starts at `text[0]`, and what comes after it. */
function takeArgument(text: string): [argument: string, rest: string] {
  let depth = 0
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') {
      depth += 1
    } else if (text[index] === ')') {
      depth -= 1
      if (depth === 0) {
        return [text.slice(1, index), text.slice(index + 1)]
      }
    }
  }
  return [text, '']
}

/** A compound selector on `<html>`: `:root`, `*`, attributes, `:not()`, `:is()`, `:where()`. */
function matchCompound(selector: string, environment: ThemeEnvironment): SelectorMatch {
  let rest = selector.trim()
  let specificity = 0
  let matches = true
  while (rest !== '') {
    const attribute = /^\[\s*([\w-]+)\s*(?:=\s*(['"]?)([^'"\]]*)\2\s*)?\]/.exec(rest)
    if (rest.startsWith(':root')) {
      specificity += 1
      rest = rest.slice(':root'.length)
    } else if (rest.startsWith('*')) {
      rest = rest.slice(1)
    } else if (attribute !== null) {
      const [whole, name = '', , value] = attribute
      const actual = environment.attributes[name]
      matches &&= value === undefined ? actual !== undefined : actual === value
      specificity += 1
      rest = rest.slice(whole.length)
    } else {
      const pseudo = /^:(not|is|where)(?=\()/.exec(rest)
      if (pseudo === null) {
        // A combinator, a type or a class: not a rule for <html> alone.
        return noMatch
      }
      const [argument, after] = takeArgument(rest.slice(pseudo[0].length))
      const results = splitTopLevel(argument, ',').map((part) => matchCompound(part, environment))
      const highest = Math.max(0, ...results.map((result) => result.specificity))
      const anyMatches = results.some((result) => result.matches)
      matches &&= pseudo[1] === 'not' ? !anyMatches : anyMatches
      specificity += pseudo[1] === 'where' ? 0 : highest
      rest = after
    }
  }
  return { matches, specificity }
}

/** Custom properties on `<html>` in an environment, with every `var()` resolved. */
export function readRootProperties(
  css: string,
  environment: ThemeEnvironment,
): Record<string, string> {
  const applied = parseCssRules(css).flatMap((rule, order) => {
    if (!rule.media.every((condition) => matchesMedia(condition, environment))) {
      return []
    }
    const rootMatches = rule.selectors
      .filter((selector) => selector.startsWith(':root'))
      .map((selector) => matchCompound(selector, environment))
      .filter((match) => match.matches)
    if (rootMatches.length === 0) {
      return []
    }
    const specificity = Math.max(...rootMatches.map((match) => match.specificity))
    return [{ specificity, order, declarations: rule.declarations }]
  })
  const declared = new Map<string, string>()
  for (const rule of applied.toSorted(
    (first, second) => first.specificity - second.specificity || first.order - second.order,
  )) {
    for (const [property, value] of rule.declarations) {
      declared.set(property, value)
    }
  }

  const resolve = (value: string, seen: ReadonlySet<string>): string =>
    value.replaceAll(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (_, name: string, fallback) => {
      const referenced = declared.get(name)
      if (referenced === undefined || seen.has(name)) {
        return typeof fallback === 'string' ? fallback.trim() : `var(${name})`
      }
      return resolve(referenced, new Set([...seen, name]))
    })

  return Object.fromEntries(
    [...declared].map(([property, value]) => [property, resolve(value, new Set([property]))]),
  )
}

/** The semantic colours of a theme, by name (`primary`, not `--kv-color-primary`). */
export function resolveThemeColors(
  css: string,
  themeName: ThemeName,
  source: 'attributes' | 'system' = 'attributes',
): Partial<Record<ColorTokenName, string>> {
  const properties = readRootProperties(css, themeEnvironment(themeName, source))
  return Object.fromEntries(
    colorTokenNames.flatMap((name) => {
      const value = properties[`--kv-color-${name}`]
      return value === undefined ? [] : [[name, value]]
    }),
  )
}
