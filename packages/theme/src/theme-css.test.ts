import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { checkThemeCss } from './check-theme.ts'
import { contrastRatio, relativeLuminance } from './contrast.ts'
import { colorTokenNames, contrastRequirements, themeNames } from './contrast-requirements.ts'
import type { ColorTokenName } from './contrast-requirements.ts'
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

  it('keeps the reference values as steps', () => {
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

  it('maps light and dark to the reference values', () => {
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

  it.each(themeNames)('%s: guards hovered filled buttons on every card surface', (themeName) => {
    const minimumFor = (foreground: string, background: string) =>
      contrastRequirements[themeName].find(
        (requirement) =>
          requirement.foreground === foreground && requirement.background === background,
      )?.minimum
    for (const background of ['canvas', 'surface', 'surface-raised']) {
      // A hovered danger button's edge is its fill.
      expect(minimumFor('danger-hover', background)).toBe(3)
      // A hovered primary button's edge is its primary border (ADR-0021).
      expect(minimumFor('primary', background)).toBe(3)
    }
    expect(minimumFor('primary-hover', 'canvas')).toBe(3)
    expect(minimumFor('primary-hover', 'surface')).toBe(3)
  })

  it.each(themeNames)(
    '%s: a hovered filled button keeps a 3:1 edge on every plain surface (ADR-0021)',
    (themeName) => {
      const colors = resolveThemeColors(themeCss, themeName)
      const hovered = (variant: string) =>
        Object.fromEntries(
          rules.find((rule) =>
            rule.selectors.includes(
              `[data-kv='button'][data-variant='${variant}']:not(:disabled, [data-disabled]):is(:hover, :active)`,
            ),
          )?.declarations ?? [],
        )
      const edgeToken = (variant: string) => {
        const border = hovered(variant)['border-color'] ?? ''
        const fill = hovered(variant)['background-color'] ?? ''
        const token = /^var\(--kv-color-([\w-]+)\)$/.exec(border === 'transparent' ? fill : border)
        return token?.[1] as ColorTokenName
      }
      expect(hovered('primary')['border-color']).toBe('var(--kv-color-primary)')
      expect(hovered('primary')['background-color']).toBe('var(--kv-color-primary-hover)')
      for (const variant of ['primary', 'danger']) {
        for (const background of ['canvas', 'surface', 'surface-raised'] as const) {
          const edge = colors[edgeToken(variant)] ?? ''
          expect(contrastRatio(edge, colors[background] ?? '')).toBeGreaterThanOrEqual(3)
        }
      }
    },
  )

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

  it('has the 4px spacing scale in rem, the radii and a 2px focus ring', () => {
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
  // A card (without data-kv-prose) stops prose, and data-kv-prose inside the card turns it on
  // again: the nearest of the two wins, for two levels of cards (docs/design/card.md §6.6).
  const card = "[data-kv='card']:not([data-kv-prose])"
  const cardBoundary = `:is(${card} *):not(:is(${card} [data-kv-prose] *):not(:is(${card} [data-kv-prose] ${card} *):not(${card} [data-kv-prose] ${card} [data-kv-prose] *)))`
  const proseScope = `:is(:where([data-kv-prose]) :where(*):not(:where([data-kv]:not([data-kv='card']), :is([data-kv-not-prose], [data-kv-nav], [data-kv-button-group]) *, ${cardBoundary})))`
  const notProseElements =
    ":not(:where([data-kv-not-prose], [data-kv-nav], [data-kv-button-group], [data-kv='card']))"
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
      "[data-kv-not-prose], [data-kv-scroll-region], [data-kv='card']",
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

  it('never styles a component, or anything inside data-kv-not-prose, data-kv-nav, a button group or a card', () => {
    expect(elementRules.length).toBeGreaterThan(40)
    for (const selector of elementRules.flatMap((rule) => rule.selectors)) {
      // Directly in the scope, or in the nested element block inside it.
      expect([proseScope, `:is(${proseScope}`].some((start) => selector.startsWith(start))).toBe(
        true,
      )
    }
    // Only margins reach the not-prose, nav, button-group and card elements themselves.
    const flowRules = elementRules.filter((rule) =>
      rule.selectors.every((selector) => !selector.includes(notProseElements)),
    )
    for (const rule of flowRules) {
      expect(rule.declarations.every(([property]) => property.startsWith('margin'))).toBe(true)
    }
  })

  it('gives a card in prose prose’s block margins, like data-kv-not-prose', () => {
    const marginRule = elementRules.find((rule) =>
      rule.selectors.some((selector) =>
        selector.endsWith(":where([data-kv-not-prose], [data-kv-scroll-region], [data-kv='card'])"),
      ),
    )
    expect(Object.fromEntries(marginRule?.declarations ?? [])).toEqual({
      'margin-block': 'var(--kv-prose-space-block)',
      'margin-inline': '0',
    })
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

describe('theme.css card (ADR-0020, docs/design/card.md)', () => {
  const parts = "[data-kv='card-header'], [data-kv='card-body'], [data-kv='card-footer']"
  const isCardSelector = (selector: string) =>
    /\[data-kv='card(?:-header|-body|-footer)?'\]/.test(selector) &&
    !selector.includes('[data-kv-prose]')
  const cardRules = rules.filter((rule) => rule.selectors.every(isCardSelector))
  const cardTokenRules = rules.filter((rule) =>
    rule.declarations.some(([property]) => property.startsWith('--kv-card-padding-')),
  )
  const declarationsOf = (selector: string) =>
    Object.fromEntries(
      cardRules.find((rule) => rule.selectors.includes(selector))?.declarations ?? [],
    )
  const innerRadius = 'max(0px, var(--kv-card-radius) - var(--kv-border-width))'
  const light = readRootProperties(themeCss, themeEnvironment('light'))

  it('has padding tokens that alias spacing steps: smaller below 40rem and in compact density', () => {
    expect(light).toMatchObject({
      '--kv-card-padding-sm': '0.75rem',
      '--kv-card-padding-md': '1rem',
      '--kv-card-padding-lg': '1.5rem',
    })
    expect(
      cardTokenRules.map((rule) => [
        rule.selectors,
        rule.media,
        Object.fromEntries(rule.declarations),
      ]),
    ).toEqual([
      [
        [':root'],
        [],
        {
          '--kv-card-padding-sm': 'var(--kv-space-3)',
          '--kv-card-padding-md': 'var(--kv-space-4)',
          '--kv-card-padding-lg': 'var(--kv-space-6)',
        },
      ],
      [
        [':root'],
        ['(width >= 40rem)'],
        {
          '--kv-card-padding-md': 'var(--kv-space-6)',
          '--kv-card-padding-lg': 'var(--kv-space-8)',
        },
      ],
      [
        ["[data-kv-density='compact']"],
        ['(width >= 64rem)'],
        {
          '--kv-card-padding-md': 'var(--kv-space-4)',
          '--kv-card-padding-lg': 'var(--kv-space-6)',
        },
      ],
    ])
  })

  it('is elevation level 2 by default: surface-raised, a border-subtle edge, lg radius, md padding', () => {
    expect(declarationsOf("[data-kv='card']")).toEqual({
      '--kv-card-padding': 'var(--kv-card-padding-md)',
      '--kv-card-radius': 'var(--kv-radius-lg)',
      display: 'block',
      'box-sizing': 'border-box',
      'min-inline-size': '0',
      'max-inline-size': '100%',
      border: 'var(--kv-border-width) solid var(--kv-color-border-subtle)',
      'border-radius': 'var(--kv-card-radius)',
      'background-color': 'var(--kv-color-surface-raised)',
      color: 'var(--kv-color-text)',
      'overflow-wrap': 'break-word',
    })
  })

  it('maps data-surface and data-radius to tokens', () => {
    expect(declarationsOf("[data-kv='card'][data-surface='surface']")).toEqual({
      'background-color': 'var(--kv-color-surface)',
    })
    expect(declarationsOf("[data-kv='card'][data-surface='canvas']")).toEqual({
      'background-color': 'var(--kv-color-canvas)',
    })
    expect(declarationsOf("[data-kv='card'][data-radius='md']")).toEqual({
      '--kv-card-radius': 'var(--kv-radius-md)',
    })
    expect(declarationsOf("[data-kv='card'][data-radius='none']")).toEqual({
      '--kv-card-radius': 'var(--kv-radius-none)',
    })
  })

  it('maps data-padding on the Root and on each part to the padding steps', () => {
    const steps = {
      none: 'var(--kv-space-0)',
      sm: 'var(--kv-card-padding-sm)',
      md: 'var(--kv-card-padding-md)',
      lg: 'var(--kv-card-padding-lg)',
    }
    for (const [step, value] of Object.entries(steps)) {
      expect(declarationsOf(`:is([data-kv='card'], ${parts})[data-padding='${step}']`)).toEqual({
        '--kv-card-padding': value,
      })
    }
  })

  it('pads a Root without parts, and makes a Root with parts a column whose body grows', () => {
    expect(declarationsOf(`[data-kv='card']:not(:has(> :is(${parts})))`)).toEqual({
      padding: 'var(--kv-card-padding)',
    })
    expect(declarationsOf(`[data-kv='card']:has(> :is(${parts}))`)).toEqual({
      display: 'flex',
      'flex-direction': 'column',
    })
    expect(declarationsOf(`:is(${parts})`)).toEqual({ padding: 'var(--kv-card-padding)' })
    expect(declarationsOf("[data-kv='card-body']")).toEqual({ 'flex-grow': '1' })
  })

  it('shares one padding between adjacent parts, or draws dividers and keeps every padding', () => {
    expect(
      declarationsOf(
        `[data-kv='card']:not([data-dividers]) > :is(${parts}):not([data-padding='none']) + :is(${parts})`,
      ),
    ).toEqual({ 'padding-block-start': '0' })
    expect(
      declarationsOf(
        `[data-kv='card'][data-dividers] > :is(${parts}):not([data-padding='none']) + :is(${parts})`,
      ),
    ).toEqual({
      'border-block-start': 'var(--kv-border-width) solid var(--kv-color-border-subtle)',
    })
  })

  it('trims the block margins of the first and last child, with zero specificity', () => {
    expect(declarationsOf(`:where(:is([data-kv='card'], ${parts}) > :first-child)`)).toEqual({
      'margin-block-start': '0',
    })
    expect(declarationsOf(`:where(:is([data-kv='card'], ${parts}) > :last-child)`)).toEqual({
      'margin-block-end': '0',
    })
  })

  it('keeps media in any card part or Root within it, with zero specificity (1.4.10)', () => {
    expect(
      declarationsOf(
        `:where(:is([data-kv='card'], ${parts}) > :is(img, video, svg), :is([data-kv='card'], ${parts}) > picture > img)`,
      ),
    ).toEqual({ 'max-inline-size': '100%', 'block-size': 'auto' })
  })

  it('rounds full-bleed media at the card’s inner corners instead of clipping', () => {
    const mediaRules = cardRules.filter((rule) =>
      rule.selectors.some(
        (selector) => selector.includes('img') && !selector.startsWith(':where('),
      ),
    )
    expect(mediaRules.length).toBe(3)
    const declarations = Object.fromEntries(mediaRules.flatMap((rule) => rule.declarations))
    expect(declarations).toMatchObject({
      display: 'block',
      'inline-size': '100%',
      'block-size': 'auto',
      margin: '0',
      'border-start-start-radius': innerRadius,
      'border-start-end-radius': innerRadius,
      'border-end-start-radius': innerRadius,
      'border-end-end-radius': innerRadius,
    })
  })

  it('never clips, never shadows, never looks clickable, and uses only logical properties', () => {
    expect(cardRules.length).toBeGreaterThan(15)
    const declarations = cardRules.flatMap((rule) => rule.declarations)
    const forbidden =
      /^(?:overflow(?:-[xy]|-block|-inline)?|clip-path|box-shadow|cursor|transition(?:-.+)?|animation(?:-.+)?|height|width|min-height|top|left|right|bottom|font(?:-.+)?)$/
    const physical = /^(?:margin|padding|border)-(?:top|right|bottom|left)\b/
    expect(
      declarations.filter(([property]) => forbidden.test(property) || physical.test(property)),
    ).toEqual([])
    // A fixed height would clip text under the 1.4.12 overrides.
    expect(
      declarations.filter(
        ([property, value]) => property.endsWith('block-size') && value !== 'auto',
      ),
    ).toEqual([])
    // Every card keeps its border, so its edge survives forced colours.
    expect(
      declarations.filter(
        ([property, value]) =>
          property.startsWith('border') && /\b(?:none|transparent|hidden)\b/.test(value),
      ),
    ).toEqual([])
    // No hover, focus or active state of its own.
    expect(
      cardRules
        .flatMap((rule) => rule.selectors)
        .filter((selector) => /:(?:hover|focus|active)/.test(selector)),
    ).toEqual([])
  })

  it('styles only card parts, and the media and first and last children directly in them', () => {
    const subjects = [
      /\[data-kv='card(?:-header|-body|-footer)?'\](?:\[[\w-]+(?:='[\w-]+')?\]|:not\(.*\)|:has\(.*\))*$/,
      /\[data-kv='card-(?:header|body|footer)'\]\)(?::not\(\[data-padding='none'\]\))?(?:\[data-padding='\w+'\])?$/,
      /\) > :is\(img, video, svg(?:, picture)?\)(?::(?:first|last)-child)?$/,
      /\) > picture(?::(?:first|last)-child)? > img$/,
      /\) > :(?:first|last)-child\)$/,
      /^:where\(.* > :is\(img, video, svg\), .* > picture > img\)$/,
    ]
    const selectors = cardRules.flatMap((rule) => rule.selectors)
    expect(
      selectors.filter((selector) => !subjects.some((subject) => subject.test(selector))),
    ).toEqual([])
  })
})
