import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { checkThemeCss } from './check-theme.ts'
import { relativeLuminance } from './contrast.ts'
import { colorTokenNames, contrastRequirements, themeNames } from './contrast-requirements.ts'
import {
  parseCssRules,
  readRootProperties,
  resolveThemeColors,
  themeEnvironment,
} from './read-theme.ts'

// The shipped theme.css, the source of truth (ADR-0013).
const themeCss = readFileSync(new URL('../theme.css', import.meta.url), 'utf8')

// Named by role, never by hue, so a rebrand overrides a scale without a refactor.
const scales = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'danger',
  'success',
  'warning',
] as const
const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

/** The documented rebrand: a teal brand scale for --kv-primary-* (README, Foundation/Theming). */
const tealBrandScale: Record<string, string> = {
  '50': '#edfafa',
  '100': '#cdf0f0',
  '200': '#9be0e2',
  '300': '#5fc6cb',
  '400': '#26a4ac',
  '500': '#007d86',
  '600': '#00707a',
  '700': '#005a62',
  '800': '#00474e',
  '900': '#003a40',
  '950': '#00262a',
}

const scaleOverride = (scale: string, values: Record<string, string>) =>
  `:root { ${Object.entries(values)
    .map(([step, value]) => `--kv-${scale}-${step}: ${value};`)
    .join(' ')} }`
const paletteProperty = /^--kv-(?:white|black|[a-z]+-\d+)$/
const systemColors = new Set([
  'Canvas',
  'CanvasText',
  'LinkText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Highlight',
  'HighlightText',
  'GrayText',
])

const rules = parseCssRules(themeCss)
const colorDeclarations = rules.flatMap((rule) =>
  rule.declarations.filter(([property]) => property.startsWith('--kv-color-')),
)

describe('theme.css palette', () => {
  const palette = readRootProperties(themeCss, {
    attributes: {},
    media: {
      'prefers-color-scheme': 'light',
      'prefers-contrast': 'no-preference',
      'forced-colors': 'none',
    },
  })

  it.each(scales)('%s has the 11 Tailwind-style steps, each darker than the last', (scale) => {
    const values = steps.map((step) => palette[`--kv-${scale}-${step}`])
    expect(values.every((value) => value !== undefined && /^#[\da-f]{6}$/.test(value))).toBe(true)
    const luminances = values.map((value) => relativeLuminance(value ?? ''))
    expect(new Set(luminances).size).toBe(steps.length)
    expect(luminances).toEqual(luminances.toSorted((first, second) => second - first))
  })

  it('keeps the Linear reference values as steps', () => {
    expect(palette).toMatchObject({
      '--kv-white': '#ffffff',
      '--kv-black': '#010102',
      '--kv-primary-500': '#5e6ad2',
      '--kv-neutral-950': '#0f1011',
      '--kv-neutral-900': '#18191a',
      '--kv-neutral-800': '#23252a',
      '--kv-neutral-50': '#f7f8f8',
    })
  })

  it('has no scale named after a hue', () => {
    const [paletteBlock] = rules
    const scaleNames = new Set(
      (paletteBlock?.declarations ?? []).flatMap(
        ([property]) => /^--kv-([a-z]+)-\d+$/.exec(property)?.[1] ?? [],
      ),
    )
    expect([...scaleNames].toSorted()).toEqual([...scales].toSorted())
  })

  it('secondary is the neutral steps by default, by reference', () => {
    const [paletteBlock] = rules
    const declared = Object.fromEntries(paletteBlock?.declarations ?? [])
    for (const step of steps) {
      expect(declared[`--kv-secondary-${step}`]).toBe(`var(--kv-neutral-${step})`)
    }
  })

  it('is the first block, the only place with raw colours', () => {
    const [paletteBlock, ...otherRules] = rules
    expect(paletteBlock?.declarations.every(([property]) => paletteProperty.test(property))).toBe(
      true,
    )
    for (const rule of otherRules) {
      expect(rule.declarations.filter(([, value]) => /#[\da-f]{3,8}\b/i.test(value))).toEqual([])
    }
  })
})

describe('theme.css semantic tokens', () => {
  it('passes theme:check: every token, every fallback, every contrast pair', () => {
    expect(checkThemeCss(themeCss)).toEqual([])
  })

  it.each(themeNames)('%s: every colour token points at a palette step', (themeName) => {
    const declared = rules
      .filter((rule) => rule.media.length === 0 || !rule.media[0]?.includes('forced-colors'))
      .flatMap((rule) => rule.declarations)
      .filter(([property]) => property.startsWith('--kv-color-'))
    expect(declared.length).toBeGreaterThan(0)
    for (const [, value] of declared) {
      expect(value).toMatch(/^var\(--kv-(?:white|black|[a-z]+-\d+)\)$/)
    }
    expect(Object.keys(resolveThemeColors(themeCss, themeName))).toHaveLength(
      colorTokenNames.length,
    )
  })

  it('maps light and dark to the Linear values', () => {
    expect(resolveThemeColors(themeCss, 'light')).toMatchObject({
      canvas: '#ffffff',
      primary: '#5e6ad2',
      'on-primary': '#ffffff',
      'focus-ring': '#5e6ad2',
    })
    expect(resolveThemeColors(themeCss, 'dark')).toMatchObject({
      canvas: '#010102',
      surface: '#0f1011',
      'surface-raised': '#18191a',
      'border-subtle': '#23252a',
      primary: '#5e6ad2',
      text: '#f7f8f8',
    })
  })

  it('maps every colour token to a system colour in forced colours', () => {
    const forced = rules.filter((rule) => rule.media.some((media) => media.includes('forced')))
    const tokens = forced
      .flatMap((rule) => rule.declarations)
      .filter(([property]) => property.startsWith('--kv-color-'))
    expect(tokens.map(([property]) => property).toSorted()).toEqual(
      colorTokenNames.map((name) => `--kv-color-${name}`).toSorted(),
    )
    for (const [, value] of tokens) {
      expect(systemColors.has(value)).toBe(true)
    }
    expect(colorDeclarations.length).toBeGreaterThan(tokens.length)
  })

  it.each(themeNames)('%s: text needs 7:1 in contrast themes, 4.5:1 otherwise', (themeName) => {
    const textMinimum = themeName.endsWith('contrast') ? 7 : 4.5
    const pair = (foreground: string, background: string) =>
      contrastRequirements[themeName].find(
        (requirement) =>
          requirement.foreground === foreground && requirement.background === background,
      )?.minimum
    expect(pair('on-primary', 'primary')).toBe(textMinimum)
    expect(pair('text-muted', 'surface')).toBe(textMinimum)
    expect(pair('border-control', 'surface-raised')).toBe(3)
    expect(pair('secondary', 'surface-raised')).toBe(3)
    expect(pair('focus-ring', 'canvas')).toBe(3)
    // ADR-0014 lists 42 required pairs per theme; the components and docs use a few more.
    expect(contrastRequirements[themeName].length).toBeGreaterThanOrEqual(42)
  })

  it.each(themeNames)('%s: guards prose on the status panels (ADR-0018)', (themeName) => {
    const textMinimum = themeName.endsWith('contrast') ? 7 : 4.5
    const minimumFor = (foreground: string, background: string) =>
      contrastRequirements[themeName].find(
        (requirement) =>
          requirement.foreground === foreground && requirement.background === background,
      )?.minimum
    for (const background of ['danger-subtle', 'success-subtle', 'warning-subtle']) {
      expect(minimumFor('text-muted', background)).toBe(textMinimum)
      expect(minimumFor('link', background)).toBe(textMinimum)
      expect(minimumFor('link-hover', background)).toBe(textMinimum)
      expect(minimumFor('border-control', background)).toBe(3)
      expect(minimumFor('secondary', background)).toBe(3)
      expect(minimumFor('focus-ring', background)).toBe(3)
    }
    expect(minimumFor('link-hover', 'primary-subtle')).toBe(textMinimum)
  })
})

describe('overrides', () => {
  it('a rebrand is one scale: the documented teal brand scale passes in all four themes', () => {
    const rebrand = `${themeCss}\n${scaleOverride('primary', tealBrandScale)}`
    expect(checkThemeCss(rebrand)).toEqual([])
    expect(resolveThemeColors(rebrand, 'light')).toMatchObject({
      primary: '#007d86',
      'primary-hover': '#00707a',
      link: '#00707a',
      'focus-ring': '#007d86',
    })
    expect(resolveThemeColors(rebrand, 'dark').link).toBe('#26a4ac')
    expect(resolveThemeColors(rebrand, 'light-contrast').primary).toBe('#00474e')
    expect(resolveThemeColors(rebrand, 'dark-contrast').primary).toBe('#9be0e2')
  })

  it('swapping a scale can break contrast, and theme:check says where', () => {
    const accent = Object.fromEntries(
      steps.map((step) => [
        step,
        readRootProperties(themeCss, themeEnvironment('light'))[`--kv-accent-${step}`] ?? '',
      ]),
    )
    const problems = checkThemeCss(`${themeCss}\n${scaleOverride('primary', accent)}`)
    expect(problems).toContain('light: on-primary on primary is 4.37:1, needs 4.5:1')
    expect(problems).toContain('dark: on-primary on primary is 4.37:1, needs 4.5:1')
  })

  it('a secondary hue reaches the secondary button edge, and nothing else', () => {
    const tinted = `${themeCss}\n${scaleOverride('secondary', { '500': '#00707a' })}`
    const colors = resolveThemeColors(tinted, 'light')
    expect(colors.secondary).toBe('#00707a')
    expect(colors['border-control']).toBe(resolveThemeColors(themeCss, 'light')['border-control'])
    const button = rules.find((rule) => rule.selectors.includes("[data-kv='button']"))
    expect(Object.fromEntries(button?.declarations ?? []).border).toBe(
      'var(--kv-border-width) solid var(--kv-color-secondary)',
    )
  })

  it('redefining a palette step reaches every token that uses it', () => {
    const colors = resolveThemeColors(`${themeCss}\n:root { --kv-primary-500: #00707a; }`, 'light')
    expect(colors.primary).toBe('#00707a')
    expect(colors['focus-ring']).toBe('#00707a')
  })

  it('redefining a neutral step reaches secondary too', () => {
    const colors = resolveThemeColors(`${themeCss}\n:root { --kv-neutral-500: #4a4e55; }`, 'light')
    expect(colors['border-control']).toBe('#4a4e55')
    expect(colors.secondary).toBe('#4a4e55')
  })

  it('reports a copy whose colours fail, and a fallback that drifted', () => {
    const faint = `${themeCss}\n:root { --kv-neutral-600: #aeb3bb; }`
    expect(checkThemeCss(faint)).toContain('light: text-muted on canvas is 2.11:1, needs 4.5:1')
    const drifted = themeCss.replace(
      /(@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-kv-color-scheme\]\) \{[^}]*?--kv-color-link: )var\(--kv-primary-400\)/,
      '$1var(--kv-primary-300)',
    )
    expect(drifted).not.toBe(themeCss)
    expect(checkThemeCss(drifted)).toContain(
      'dark: --kv-color-link is #828fff, but #a3acff in the system fallback',
    )
  })
})

describe('theme.css non-colour tokens', () => {
  const light = readRootProperties(themeCss, {
    attributes: {},
    media: {
      'prefers-color-scheme': 'light',
      'prefers-contrast': 'no-preference',
      'forced-colors': 'none',
    },
  })

  it('has the 4px spacing scale in rem, the Linear radii and a 2px focus ring', () => {
    expect(light).toMatchObject({
      '--kv-space-1': '0.25rem',
      '--kv-space-4': '1rem',
      '--kv-space-24': '6rem',
      '--kv-radius-md': '8px',
      '--kv-radius-lg': '12px',
      '--kv-focus-ring-width': '2px',
      '--kv-focus-ring-offset': '2px',
    })
  })

  it('keeps comfortable controls at 44px, and compact density switches the same tokens', () => {
    expect(light['--kv-control-min-block-size']).toBe('2.75rem')
    const compact = rules.find((rule) => rule.selectors.includes("[data-kv-density='compact']"))
    expect(compact?.media).toEqual(['(width >= 64rem)'])
    expect(Object.fromEntries(compact?.declarations ?? [])).toMatchObject({
      '--kv-control-min-block-size': '2rem',
    })
    expect(compact?.declarations.map(([property]) => property).toSorted()).toEqual(
      Object.keys(light)
        .filter((property) => property.startsWith('--kv-control-'))
        .toSorted(),
    )
  })

  it('has the lead role, one step above body-large, without tracking (ADR-0018)', () => {
    expect(light).toMatchObject({
      '--kv-font-lead-size': '1.25rem',
      '--kv-font-lead-weight': '400',
      '--kv-font-lead-line-height': '1.5',
      '--kv-font-lead-letter-spacing': '0em',
    })
  })

  it('has elevation shadows from the palette in light, and none in the dark themes', () => {
    expect(light['--kv-shadow-popup']).toBe(
      '0 8px 24px -4px color-mix(in srgb, #0f1011 12%, transparent)',
    )
    expect(light['--kv-shadow-dialog']).toBe(
      '0 24px 48px -8px color-mix(in srgb, #0f1011 20%, transparent)',
    )
    for (const themeName of themeNames) {
      for (const source of ['attributes', 'system'] as const) {
        const properties = readRootProperties(themeCss, themeEnvironment(themeName, source))
        const expected = themeName.startsWith('dark') ? 'none' : light['--kv-shadow-popup']
        expect(properties['--kv-shadow-popup']).toBe(expected)
        expect(properties['--kv-shadow-dialog']).toBe(
          themeName.startsWith('dark') ? 'none' : light['--kv-shadow-dialog'],
        )
      }
    }
  })

  it('has the prose tokens, in rem except the two relative ones', () => {
    expect(light).toMatchObject({
      '--kv-prose-measure': '70ch',
      '--kv-prose-font-size': '1rem',
      '--kv-prose-line-height': '1.5',
      '--kv-prose-lead-font-size': '1.125rem',
      '--kv-prose-space': '1.25rem',
      '--kv-prose-space-item': '0.5rem',
      '--kv-prose-space-block': '2rem',
      '--kv-prose-space-section': '2.5rem',
      '--kv-prose-list-indent': '1.75em',
      '--kv-prose-code-size': '0.875em',
    })
    const large = rules.find((rule) => rule.selectors.includes(":where([data-kv-prose='large'])"))
    expect(Object.fromEntries(large?.declarations ?? [])).toMatchObject({
      '--kv-prose-font-size': 'var(--kv-font-body-large-size)',
      '--kv-prose-lead-font-size': 'var(--kv-font-lead-size)',
      '--kv-prose-space': 'var(--kv-space-6)',
      '--kv-prose-space-block': 'var(--kv-space-10)',
      '--kv-prose-space-section': 'var(--kv-space-12)',
    })
  })

  it('puts everything in @layer kv, so unlayered consumer CSS wins', () => {
    const withoutComments = themeCss.replaceAll(/\/\*[\s\S]*?\*\//g, '').trim()
    expect(withoutComments.startsWith('@layer kv {')).toBe(true)
    expect(withoutComments.endsWith('}')).toBe(true)
    expect(withoutComments.match(/@layer/g)).toHaveLength(1)
  })
})

describe('theme.css prose (ADR-0018)', () => {
  const proseScope =
    ':is(:where([data-kv-prose]) :where(*):not(:where([data-kv], :is([data-kv-not-prose], [data-kv-nav], [data-kv-button-group]) *)))'
  const notProseElements =
    ':not(:where([data-kv-not-prose], [data-kv-nav], [data-kv-button-group]))'
  const proseRules = rules.filter((rule) =>
    rule.selectors.some((selector) => selector.includes('[data-kv-prose]')),
  )
  const rootRules = [':where([data-kv-prose])', ":where([data-kv-prose='large'])"]
  const elementRules = proseRules.filter((rule) => !rootRules.includes(rule.selectors[0] ?? ''))

  /** Removes every `:where(…)`, which adds no specificity. */
  function withoutWhere(selector: string): string {
    let result = selector
    let start = result.indexOf(':where(')
    while (start !== -1) {
      let depth = 0
      let end = start + ':where'.length
      for (; end < result.length; end += 1) {
        depth += result[end] === '(' ? 1 : result[end] === ')' ? -1 : 0
        if (depth === 0) {
          break
        }
      }
      result = result.slice(0, start) + result.slice(end + 1)
      start = result.indexOf(':where(')
    }
    return result
  }

  it('has rules for every element in the spec', () => {
    const selectors = elementRules.flatMap((rule) => rule.selectors).join('\n')
    const specElements = [
      'h1',
      'h2',
      'h3',
      'h4, h5, h6',
      'p',
      'p[data-kv-lead]',
      'a',
      'a:hover, a:active',
      'a:focus-visible',
      'strong, b',
      'em, i, cite',
      'ul',
      'ol:not([type])',
      'li',
      'ul > li',
      'ol > li',
      'blockquote',
      'hr',
      'code',
      'pre',
      'pre code',
      'kbd',
      'table',
      'caption',
      'th, td',
      'thead th',
      'figure',
      'figcaption',
      'dl',
      'dt',
      'dd',
      'small',
      'abbr[title]',
      'sub, sup',
      'mark',
      '[data-kv-not-prose], [data-kv-scroll-region]',
    ]
    expect(specElements.filter((element) => !selectors.includes(`:where(${element})`))).toEqual([])
    expect(selectors).toContain('::marker')
    expect(selectors).toMatch(/:where\(img, video, picture,/)
  })

  it('every rule has zero specificity (a ::marker adds only its pseudo-element)', () => {
    // Selectors that keep anything once :where(), :is(), :not() and combinators are gone.
    const specific = proseRules
      .flatMap((rule) => rule.selectors)
      .filter(
        (selector) =>
          withoutWhere(selector)
            .replace(/::marker$/, '')
            .replaceAll(/:is\(|:not\(|[()*\s>+~]/g, '') !== '',
      )
    expect(specific).toEqual([])
  })

  it('never styles a component or anything inside data-kv-not-prose, data-kv-nav or a button group', () => {
    expect(elementRules.length).toBeGreaterThan(40)
    for (const selector of elementRules.flatMap((rule) => rule.selectors)) {
      // Directly in the scope, or in the nested element block inside it.
      expect([proseScope, `:is(${proseScope}`].some((start) => selector.startsWith(start))).toBe(
        true,
      )
    }
    // Only margins reach the not-prose, nav and button-group elements themselves.
    const flowRules = elementRules.filter((rule) =>
      rule.selectors.every((selector) => !selector.includes(notProseElements)),
    )
    for (const rule of flowRules) {
      expect(rule.declarations.every(([property]) => property.startsWith('margin'))).toBe(true)
    }
  })

  it('uses only logical properties, and never hides overflow or fixes a height', () => {
    const declarations = proseRules.flatMap((rule) => rule.declarations)
    const physical =
      /^(?:margin|padding|border)-(?:top|right|bottom|left)\b|^(?:width|height|top|left|right|bottom)$|^text-align$/
    // `margin: 1rem 0` sets top, right, bottom and left: only a single value is direction-free.
    const physicalShorthand = /^(?:margin|padding|border-width|border-style|border-color)$/
    expect(
      declarations.filter(
        ([property, value]) =>
          (physical.test(property) && !(property === 'text-align' && value === 'start')) ||
          (physicalShorthand.test(property) && value.trim().split(/\s+/).length > 1) ||
          (property === 'overflow' && value === 'hidden') ||
          (property === 'block-size' && value !== 'auto'),
      ),
    ).toEqual([])
  })

  it('never removes list markers or changes the display of tables and lists', () => {
    const removesMarkers = elementRules.filter((rule) =>
      rule.declarations.some(
        ([property, value]) =>
          property === 'list-style' || (property === 'list-style-type' && value === 'none'),
      ),
    )
    expect(removesMarkers.map((rule) => rule.selectors[0])).toEqual([])
    const tableAndListRules = elementRules.filter((rule) =>
      rule.selectors.some((selector) => /:where\((?:table|ul|ol|li|tr|td|th)\b/.test(selector)),
    )
    expect(tableAndListRules.length).toBeGreaterThan(5)
    const changesDisplay = tableAndListRules.filter((rule) =>
      rule.declarations.some(([property]) => property === 'display'),
    )
    expect(changesDisplay.map((rule) => rule.selectors[0])).toEqual([])
  })
})
