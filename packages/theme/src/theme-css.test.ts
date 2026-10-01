import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { mixButtonEdge, parseButtonEdgeTint } from './button-edge.ts'
import { checkThemeCss } from './check-theme.ts'
import { contrastRatio } from './contrast.ts'
import { colorTokenNames, contrastRequirements, themeNames } from './contrast-requirements.ts'
import type { ColorTokenName, ThemeName } from './contrast-requirements.ts'
import {
  parseCssRules,
  readRootProperties,
  resolveThemeColors,
  themeEnvironment,
} from './read-theme.ts'
import type { ThemeEnvironment } from './read-theme.ts'

// The shipped theme.css, the source of truth (ADR-0013). Only WCAG checks live here: contrast
// (1.4.3, 1.4.6, 1.4.11), forced colours, and nothing that clips under 1.4.12. The look itself
// is reviewed visually, not tested.
const themeCss = readFileSync(new URL('../theme.css', import.meta.url), 'utf8')

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

describe('theme.css contrast and forced colours', () => {
  it('passes theme:check: every token, every fallback, every contrast pair', () => {
    expect(checkThemeCss(themeCss)).toEqual([])
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

  it.each(themeNames)(
    '%s: heading is held to every minimum text is held to (1.4.3, 1.4.6)',
    (themeName) => {
      const requirements = contrastRequirements[themeName]
      const textRequirements = requirements.filter(({ foreground }) => foreground === 'text')
      expect(textRequirements.length).toBeGreaterThan(0)
      for (const { background, minimum } of textRequirements) {
        expect(
          requirements.find(
            (requirement) =>
              requirement.foreground === 'heading' && requirement.background === background,
          )?.minimum,
        ).toBe(minimum)
      }
    },
  )

  it('heading becomes the user’s text colour in forced colours, like body text', () => {
    const forced = readRootProperties(themeCss, {
      attributes: { 'data-kv-color-scheme': 'dark', 'data-kv-contrast': 'more' },
      media: {
        'prefers-color-scheme': 'dark',
        'prefers-contrast': 'more',
        'forced-colors': 'active',
      },
    })
    expect(forced['--kv-color-heading']).toBe('CanvasText')
    expect(forced['--kv-color-text']).toBe('CanvasText')
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
              `.kv-button.kv-button--${variant}:not(:disabled, [data-disabled]):is(:hover, :active)`,
            ),
          )?.declarations ?? [],
        )
      // The edge is --kv-button-edge (ADR-0026), or the fill when that is transparent.
      const edgeToken = (variant: string) => {
        const border = hovered(variant)['--kv-button-edge'] ?? ''
        const fill = hovered(variant)['background-color'] ?? ''
        const token = /^var\(--kv-color-([\w-]+)\)$/.exec(border === 'transparent' ? fill : border)
        return token?.[1] as ColorTokenName
      }
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
  it('the documented teal rebrand passes theme:check in all four themes', () => {
    expect(checkThemeCss(`${themeCss}\n${scaleOverride('primary', tealBrandScale)}`)).toEqual([])
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

  it('reports a button edge tint that lowers a boundary under 3:1 (ADR-0026)', () => {
    const problems = checkThemeCss(`${themeCss}\n:root { --kv-button-edge-shade: #ffffff 90%; }`)
    expect(problems).toContainEqual(
      expect.stringMatching(
        /^light: secondary edge mixed with the shade \(#[\da-f]{6}\) on canvas is \d\.\d\d:1, needs 3:1$/,
      ),
    )
    // Dark has its own value, which a plain :root can't override.
    expect(problems.filter((problem) => problem.startsWith('dark'))).toEqual([])
  })

  it('reports button edge tokens that are missing, malformed or drifted in a fallback', () => {
    const withoutShade = themeCss.replaceAll(/--kv-button-edge-shade:[^;]*;/g, '')
    expect(checkThemeCss(withoutShade)).toContain('light: --kv-button-edge-shade is not defined')
    const named = `${themeCss}\n:root { --kv-button-edge-shade: black 35%; }`
    expect(checkThemeCss(named)).toContain(
      'light: --kv-button-edge-shade is "black 35%", not a "#rgb or #rrggbb" colour and a percentage',
    )
    const drifted = themeCss.replace(
      /(@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-kv-color-scheme\]\) \{[^}]*?--kv-button-edge-highlight: var\(--kv-white\) )25%/,
      '$130%',
    )
    expect(drifted).not.toBe(themeCss)
    expect(checkThemeCss(drifted)).toContain(
      'dark: --kv-button-edge-highlight is #ffffff 25%, but #ffffff 30% in the system fallback',
    )
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

const buttonDepthTokens = [
  '--kv-shadow-button',
  '--kv-shadow-button-hover',
  '--kv-button-edge-shade',
  '--kv-button-edge-highlight',
] as const

/** An environment with forced colours on, whatever the theme (section 5 always matches). */
const forcedColors = (themeName: ThemeName, source: 'attributes' | 'system'): ThemeEnvironment => {
  const environment = themeEnvironment(themeName, source)
  return { ...environment, media: { ...environment.media, 'forced-colors': 'active' } }
}

describe('theme.css button depth (ADR-0026, docs/design/button-depth.md)', () => {
  const sources = ['attributes', 'system'] as const
  const propertiesOf = (themeName: ThemeName, source: 'attributes' | 'system') =>
    readRootProperties(themeCss, themeEnvironment(themeName, source))

  it.each(themeNames)(
    '%s: defines all four tokens, as attributes and as system fallback',
    (themeName) => {
      for (const source of sources) {
        const properties = propertiesOf(themeName, source)
        for (const token of buttonDepthTokens) {
          expect(properties[token], `${themeName} (${source}) ${token}`).toBeDefined()
        }
      }
    },
  )

  it.each(themeNames)('%s: the system fallback equals the theme', (themeName) => {
    const theme = propertiesOf(themeName, 'attributes')
    const fallback = propertiesOf(themeName, 'system')
    for (const token of buttonDepthTokens) {
      expect(fallback[token], `${themeName} ${token}`).toBe(theme[token])
    }
  })

  it.each(['light-contrast', 'dark-contrast'] as const)(
    '%s and forced colours: flat, with no shadow and untinted edges',
    (themeName) => {
      const environments = [
        themeEnvironment(themeName, 'attributes'),
        themeEnvironment(themeName, 'system'),
        forcedColors(themeName, 'attributes'),
        forcedColors(themeName, 'system'),
      ]
      for (const environment of environments) {
        const properties = readRootProperties(themeCss, environment)
        expect(properties['--kv-shadow-button']).toBe('none')
        expect(properties['--kv-shadow-button-hover']).toBe('none')
        expect(parseButtonEdgeTint(properties['--kv-button-edge-shade'])?.percent).toBe(0)
        expect(parseButtonEdgeTint(properties['--kv-button-edge-highlight'])?.percent).toBe(0)
      }
    },
  )

  it.each(['light', 'dark'] as const)('%s: forced colours are flat too', (themeName) => {
    for (const source of sources) {
      const properties = readRootProperties(themeCss, forcedColors(themeName, source))
      expect(properties['--kv-shadow-button']).toBe('none')
      expect(properties['--kv-shadow-button-hover']).toBe('none')
      expect(parseButtonEdgeTint(properties['--kv-button-edge-shade'])?.percent).toBe(0)
      expect(parseButtonEdgeTint(properties['--kv-button-edge-highlight'])?.percent).toBe(0)
    }
  })

  it('light shades the bottom edge and dark highlights the top edge, never the other way', () => {
    const light = propertiesOf('light', 'attributes')
    expect(parseButtonEdgeTint(light['--kv-button-edge-shade'])?.percent).toBe(35)
    expect(parseButtonEdgeTint(light['--kv-button-edge-highlight'])?.percent).toBe(0)
    expect(light['--kv-shadow-button']).not.toBe('none')
    expect(light['--kv-shadow-button-hover']).not.toBe('none')
    const dark = propertiesOf('dark', 'attributes')
    expect(parseButtonEdgeTint(dark['--kv-button-edge-shade'])?.percent).toBe(0)
    expect(parseButtonEdgeTint(dark['--kv-button-edge-highlight'])?.percent).toBe(25)
    expect(dark['--kv-shadow-button']).not.toBe('none')
    expect(dark['--kv-shadow-button-hover']).not.toBe('none')
  })

  it('every tinted edge is the colour in the design spec and keeps 3:1 on every surface', () => {
    // docs/design/button-depth.md, section 10, "Resulting edges".
    const expected = {
      light: {
        shade: {
          secondary: '#4b4e55',
          primary: '#424b8e',
          danger: '#7a1f2f',
          'danger-hover': '#671a28',
        },
      },
      dark: {
        highlight: {
          secondary: '#90949b',
          primary: '#868fdd',
          danger: '#ffa7b3',
          'danger-hover': '#ffc6ce',
        },
      },
    } as const
    for (const themeName of ['light', 'dark'] as const) {
      const colors = resolveThemeColors(themeCss, themeName)
      const properties = propertiesOf(themeName, 'attributes')
      const tint = themeName === 'light' ? 'shade' : 'highlight'
      const partner = parseButtonEdgeTint(properties[`--kv-button-edge-${tint}`])
      if (partner === undefined) {
        throw new Error(`${themeName}: --kv-button-edge-${tint} is not a colour and a percentage`)
      }
      const table: Record<string, string> =
        themeName === 'light' ? expected.light.shade : expected.dark.highlight
      for (const [base, hex] of Object.entries(table)) {
        const mixed = mixButtonEdge(colors[base as ColorTokenName] ?? '', partner)
        expect(mixed, `${themeName} ${base}`).toBe(hex)
        for (const background of ['canvas', 'surface', 'surface-raised'] as const) {
          expect(contrastRatio(mixed, colors[background] ?? '')).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })
})

describe('theme.css prose (ADR-0018)', () => {
  const proseRules = rules.filter((rule) =>
    rule.selectors.some((selector) => selector.includes('.kv-prose')),
  )
  const rootRules = [':where(.kv-prose)', ':where(.kv-prose--large)']
  const elementRules = proseRules.filter((rule) => !rootRules.includes(rule.selectors[0] ?? ''))

  it('never hides overflow or fixes a height, so text spacing clips nothing (1.4.12)', () => {
    const declarations = proseRules.flatMap((rule) => rule.declarations)
    expect(
      declarations.filter(
        ([property, value]) =>
          (property === 'overflow' && value === 'hidden') ||
          (/^(?:height|block-size)$/.test(property) && value !== 'auto'),
      ),
    ).toEqual([])
  })

  it('never removes list markers or changes the display of tables and lists (1.3.1)', () => {
    // `list-style: none` drops list semantics in Safari with VoiceOver, and `display` on a
    // table or list can drop its semantics in some browsers (ADR-0018).
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
  const isCardSelector = (selector: string) =>
    /\.kv-card\b/.test(selector) && !selector.includes('.kv-prose')
  const cardRules = rules.filter((rule) => rule.selectors.every(isCardSelector))

  it('never clips, never fixes a height, and keeps its border for forced colours', () => {
    expect(cardRules.length).toBeGreaterThan(15)
    const declarations = cardRules.flatMap((rule) => rule.declarations)
    // Clipping would cut off a child's focus ring (2.4.11) or spaced-out text (1.4.12).
    expect(
      declarations.filter(([property]) =>
        /^(?:overflow(?:-[xy]|-block|-inline)?|clip-path)$/.test(property),
      ),
    ).toEqual([])
    // A fixed height would clip text under the 1.4.12 overrides.
    expect(
      declarations.filter(
        ([property, value]) =>
          /^(?:height|min-height)$/.test(property) ||
          (property.endsWith('block-size') && value !== 'auto'),
      ),
    ).toEqual([])
    // Every card keeps its border, so its edge survives forced colours (1.4.11).
    expect(
      declarations.filter(
        ([property, value]) =>
          property.startsWith('border') && /\b(?:none|transparent|hidden)\b/.test(value),
      ),
    ).toEqual([])
  })
})
