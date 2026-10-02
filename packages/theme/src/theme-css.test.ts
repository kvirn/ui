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

describe('theme.css form fields (ADR-0029, docs/design/form-fields.md)', () => {
  const isFieldSelector = (selector: string) =>
    /\.kv-(?:field|fieldset|input)\b(?!-group)/.test(selector) && !selector.includes('.kv-prose')
  const fieldRules = rules.filter((rule) => rule.selectors.every(isFieldSelector))
  // The error prefix is visually hidden: a 1px clipped box is its whole job, so it's the one
  // part the no-clip and no-fixed-size guards leave out.
  const isErrorPrefix = (rule: (typeof rules)[number]) =>
    rule.selectors.every((selector) => selector.includes('.kv-field-error-prefix'))
  const textRules = fieldRules.filter((rule) => !isErrorPrefix(rule))
  const forcedFieldRules = fieldRules.filter((rule) =>
    rule.media.some((media) => media.includes('forced-colors')),
  )

  it('never clips and never fixes a height, so focus rings and spaced-out text survive', () => {
    expect(textRules.length).toBeGreaterThan(20)
    const declarations = textRules.flatMap((rule) => rule.declarations)
    // Clipping would cut off a focus ring (2.4.11, 2.4.13) or spaced-out text (1.4.12).
    expect(
      declarations.filter(([property]) =>
        /^(?:overflow(?:-[xy]|-block|-inline)?|clip-path)$/.test(property),
      ),
    ).toEqual([])
    // A fixed height would clip text under the 1.4.12 overrides: min-block-size only.
    expect(
      declarations.filter(
        ([property, value]) =>
          /^(?:height|min-height|max-height|max-block-size)$/.test(property) ||
          (property === 'block-size' && value !== 'auto'),
      ),
    ).toEqual([])
  })

  it('uses logical properties only, so right to left works', () => {
    const physical =
      /^(?:(?:margin|padding|border)-(?:top|right|bottom|left)(?:-.+)?|(?:top|right|bottom|left)|(?:min-|max-)?(?:width|height)|float|clear)$/
    expect(
      fieldRules
        .flatMap((rule) => rule.declarations)
        .filter(
          ([property, value]) =>
            physical.test(property) ||
            (property === 'text-align' && /^(?:left|right)$/.test(value)),
        ),
    ).toEqual([])
  })

  it('draws an invalid input from data-invalid and aria-invalid, never :invalid (ADR-0029)', () => {
    // The browser's own validity isn't the form's: the consumer decides when a field is invalid.
    const selectors = rules.flatMap((rule) => rule.selectors)
    expect(selectors.filter((selector) => /:(?:user-)?(?:in)?valid\b/.test(selector))).toEqual([])
    expect(
      selectors.filter((selector) =>
        selector.includes(".kv-input:is([data-invalid], [aria-invalid='true'])"),
      ).length,
    ).toBeGreaterThan(1)
  })

  it('hides the error prefix visually and never with display: none (3.3.1)', () => {
    const prefixRules = rules.filter(
      (rule) =>
        isErrorPrefix(rule) && rule.media.length === 0 && !rule.selectors.includes('.kv-prose'),
    )
    expect(prefixRules.length).toBeGreaterThan(0)
    const declarations = prefixRules.flatMap((rule) => rule.declarations)
    expect(declarations).toContainEqual(['position', 'absolute'])
    expect(
      declarations.filter(
        ([property, value]) =>
          (property === 'display' && value === 'none') ||
          (property === 'visibility' && value === 'hidden') ||
          (property === 'content-visibility' && value === 'hidden'),
      ),
    ).toEqual([])
  })

  it('keeps an input edge in every state, and an invalid one at 2px, for forced colours (1.4.11)', () => {
    // The border shorthand reads --kv-input-edge and --kv-input-edge-width, so the edge is
    // never none or transparent, and forced colours only change the edge colour.
    const declarations = fieldRules.flatMap((rule) => rule.declarations)
    expect(
      declarations.filter(
        ([property, value]) =>
          property.startsWith('border') && /\b(?:none|transparent|hidden)\b/.test(value),
      ),
    ).toEqual([])
    expect(declarations).toContainEqual([
      '--kv-input-edge-width',
      'var(--kv-control-border-width-invalid)',
    ])
    const forced = forcedFieldRules.flatMap((rule) => rule.declarations)
    expect(forced.filter(([property]) => property === '--kv-input-edge-width')).toEqual([])
    expect(forced.filter(([property]) => /^border(?:-width)?$/.test(property))).toEqual([])
    // System colours, set explicitly: the edge, the field and its text.
    expect(forced).toContainEqual(['--kv-input-edge', 'ButtonBorder'])
    expect(forced).toContainEqual(['--kv-input-edge', 'CanvasText'])
    expect(forced).toContainEqual(['--kv-input-edge', 'GrayText'])
    expect(forced).toContainEqual(['background-color', 'Field'])
    expect(forced).toContainEqual(['color', 'FieldText'])
  })

  it('an invalid input gives back the extra edge pixel, so its text does not move', () => {
    const input = fieldRules
      .filter((rule) => rule.media.length === 0 && rule.selectors.includes('.kv-input'))
      .flatMap((rule) => rule.declarations)
    const padding = input.find(([property]) => property === 'padding-inline')?.[1] ?? ''
    expect(padding).toContain('var(--kv-input-edge-width)')
    expect(padding).toContain('var(--kv-border-width)')
  })

  it('keeps the expected answer visible: width classes count the text spacing and the invalid edge', () => {
    const widthRule = fieldRules.find((rule) =>
      rule.declarations.some(([, value]) => value.includes('var(--kv-input-chars)')),
    )
    expect(widthRule).toBeDefined()
    const inlineSize = widthRule?.declarations.find(([property]) => property === 'inline-size')?.[1]
    // 1ch per character in the input's own font, the 1.4.12 letter-spacing allowance, both
    // paddings, and 2px edges on both sides.
    expect(inlineSize).toContain('1ch + 0.12em')
    expect(inlineSize).toContain('var(--kv-input-padding-inline)')
    expect(inlineSize).toContain('4px')
    const characters = Object.fromEntries(
      fieldRules
        .filter((rule) => rule.selectors.some((selector) => /--width-\d+$/.test(selector)))
        .flatMap((rule) =>
          rule.declarations
            .filter(([property]) => property === '--kv-input-chars')
            .map(([, value]) => [rule.selectors[0], Number(value)]),
        ),
    )
    expect(characters).toEqual({
      '.kv-input.kv-input--width-2': 2,
      '.kv-input.kv-input--width-4': 4,
      '.kv-input.kv-input--width-6': 6,
      '.kv-input.kv-input--width-10': 10,
      '.kv-input.kv-input--width-20': 20,
    })
    // They shrink to fit a 320px screen (1.4.10), and the plain input does too.
    const base = fieldRules
      .filter((rule) => rule.media.length === 0 && rule.selectors.includes('.kv-input'))
      .flatMap((rule) => rule.declarations)
    expect(base).toContainEqual(['max-inline-size', '100%'])
  })

  it('wraps and hyphenates long words in a field and a fieldset, as prose does (ADR-0028)', () => {
    for (const selector of ['.kv-field', '.kv-fieldset']) {
      const declarations = rules
        .filter((rule) => rule.media.length === 0 && rule.selectors.includes(selector))
        .flatMap((rule) => rule.declarations)
      expect(declarations).toContainEqual(['hyphens', 'auto'])
      expect(declarations).toContainEqual(['hyphenate-limit-chars', '10 4 4'])
      expect(declarations).toContainEqual(['overflow-wrap', 'break-word'])
      // A fieldset's default min-inline-size is min-content, which breaks 320px reflow.
      expect(declarations).toContainEqual(['min-inline-size', '0'])
    }
  })

  it('keeps hints, errors and typed answers at 16px in compact density', () => {
    // Compact only changes the --kv-control-* tokens: the text parts must not read them, except
    // the labels, and the input reads the body size.
    const declarationsOf = (selector: string) =>
      fieldRules
        .filter((rule) => rule.media.length === 0 && rule.selectors.includes(selector))
        .flatMap((rule) => rule.declarations)
    for (const selector of ['.kv-field-description', '.kv-field-error-message', '.kv-input']) {
      const sizes = declarationsOf(selector).filter(([property]) =>
        /^(?:font-size|line-height)$/.test(property),
      )
      expect(sizes.length).toBeGreaterThan(0)
      for (const [, value] of sizes) {
        expect(value).not.toContain('--kv-control-')
        expect(value).not.toContain('compact')
      }
    }
    expect(declarationsOf('.kv-field-description')).toContainEqual([
      'color',
      'var(--kv-color-text)',
    ])
  })

  it.each(themeNames)('%s: the invalid edge is held to 3:1 on every plain background', (theme) => {
    for (const background of ['canvas', 'surface', 'surface-raised']) {
      expect(
        contrastRequirements[theme].filter(
          (requirement) =>
            requirement.foreground === 'danger' &&
            requirement.background === background &&
            requirement.minimum === 3,
        ),
      ).toHaveLength(1)
    }
  })
})

describe('theme.css input group (ADR-0031, docs/design/form-fields.md)', () => {
  const isGroupSelector = (selector: string) =>
    /\.kv-input-group(?:-addon)?\b/.test(selector) && !selector.includes('.kv-prose')
  const groupRules = rules.filter((rule) => rule.selectors.every(isGroupSelector))
  const forcedGroupRules = groupRules.filter((rule) =>
    rule.media.some((media) => media.includes('forced-colors')),
  )
  const groupDeclarations = groupRules.flatMap((rule) => rule.declarations)
  const declarationsOf = (selector: string) =>
    groupRules
      .filter((rule) => rule.media.length === 0 && rule.selectors.includes(selector))
      .flatMap((rule) => rule.declarations)

  it('never clips and never fixes a height, so both focus rings and spaced-out text survive', () => {
    expect(groupRules.length).toBeGreaterThan(20)
    // The Root's ring and the Button's ring are drawn outside the box: no overflow, no clip.
    expect(
      groupDeclarations.filter(([property]) =>
        /^(?:overflow(?:-[xy]|-block|-inline)?|clip-path)$/.test(property),
      ),
    ).toEqual([])
    expect(
      groupDeclarations.filter(
        ([property, value]) =>
          /^(?:height|min-height|max-height|max-block-size)$/.test(property) ||
          (property === 'block-size' && value !== 'auto'),
      ),
    ).toEqual([])
  })

  it('uses logical properties only, so the start addon is on the right in right to left', () => {
    const physical =
      /^(?:(?:margin|padding|border)-(?:top|right|bottom|left)(?:-.+)?|(?:top|right|bottom|left)|(?:min-|max-)?(?:width|height)|float|clear)$/
    expect(
      groupDeclarations.filter(
        ([property, value]) =>
          physical.test(property) || (property === 'text-align' && /^(?:left|right)$/.test(value)),
      ),
    ).toEqual([])
  })

  it('draws the edge from two variables, and gives the extra invalid pixel back, so nothing moves', () => {
    const base = declarationsOf('.kv-input-group')
    expect(base).toContainEqual([
      'border',
      'var(--kv-input-group-edge-width) solid var(--kv-input-group-edge)',
    ])
    expect(base).toContainEqual([
      'padding',
      'calc(var(--kv-control-border-width-invalid) - var(--kv-input-group-edge-width))',
    ])
    expect(groupDeclarations).toContainEqual([
      '--kv-input-group-edge-width',
      'var(--kv-control-border-width-invalid)',
    ])
    expect(groupDeclarations).toContainEqual(['--kv-input-group-edge', 'var(--kv-color-danger)'])
  })

  it('draws the focus ring around the group, from the attribute and from :has() (2.4.7, 2.4.13)', () => {
    const ringRules = groupRules.filter(
      (rule) =>
        rule.media.length === 0 &&
        rule.declarations.some(
          ([property, value]) =>
            property === 'outline' && value.includes('var(--kv-color-focus-ring)'),
        ),
    )
    const selectors = ringRules.flatMap((rule) => rule.selectors).join(' ')
    expect(selectors).toContain('[data-focus-visible]')
    expect(selectors).toContain(':has(> .kv-input:focus-visible)')
    // The input inside has no ring of its own: the group's is the one, and it is never doubled.
    expect(declarationsOf('.kv-input-group > .kv-input')).toContainEqual(['outline', '0'])
  })

  it('keeps a button in the group as tall as the box, at least 24px (2.5.8)', () => {
    const button = declarationsOf('.kv-input-group > .kv-button')
    expect(button).toContainEqual(['min-inline-size', 'var(--kv-control-min-block-size)'])
    expect(button).toContainEqual([
      'margin-block',
      'calc(-1 * var(--kv-control-border-width-invalid))',
    ])
    expect(button).toContainEqual(['align-self', 'stretch'])
  })

  it('hides the search input’s native clear button only when the group has a button of its own', () => {
    const hidden = groupRules.filter((rule) =>
      rule.selectors.some((selector) => selector.includes('::-webkit-search-cancel-button')),
    )
    expect(hidden.length).toBeGreaterThan(0)
    for (const rule of hidden) {
      expect(rule.selectors.every((selector) => selector.includes(':has(> .kv-button)'))).toBe(true)
    }
  })

  it('sets system colours explicitly in forced colours, and never changes the edge width there', () => {
    const forced = forcedGroupRules.flatMap((rule) => rule.declarations)
    expect(forced.length).toBeGreaterThan(8)
    expect(forced.filter(([property]) => property === '--kv-input-group-edge-width')).toEqual([])
    expect(forced.filter(([property]) => /^border(?:-width)?$/.test(property))).toEqual([])
    expect(forced).toContainEqual(['--kv-input-group-edge', 'ButtonBorder'])
    expect(forced).toContainEqual(['--kv-input-group-edge', 'CanvasText'])
    expect(forced).toContainEqual(['--kv-input-group-edge', 'GrayText'])
    expect(forced).toContainEqual(['background-color', 'Field'])
    expect(forced).toContainEqual(['color', 'FieldText'])
    expect(forced).toContainEqual(['outline-color', 'Highlight'])
    // The divider is a filled line, so it gets a system colour of its own.
    expect(forced).toContainEqual(['background-color', 'ButtonText'])
  })

  it('transitions only under prefers-reduced-motion: no-preference (2.3.3)', () => {
    const transitioned = rules.filter(
      (rule) =>
        rule.selectors.includes('.kv-input-group') &&
        rule.declarations.some(([property]) => property.startsWith('transition')),
    )
    expect(transitioned.length).toBeGreaterThan(0)
    for (const rule of transitioned) {
      expect(rule.media).toContain('(prefers-reduced-motion: no-preference)')
    }
  })
})

describe('theme.css long words and small screens (ADR-0028)', () => {
  const declarationsOf = (selector: string) =>
    rules
      .filter((rule) => rule.media.length === 0 && rule.selectors.includes(selector))
      .flatMap((rule) => rule.declarations)

  it.each([':where(.kv-prose)', '.kv-card'])(
    '%s hyphenates long words at dictionary points, and still wraps any word that has none (1.4.10)',
    (selector) => {
      const declarations = declarationsOf(selector)
      expect(declarations).toContainEqual(['hyphens', 'auto'])
      expect(declarations).toContainEqual(['hyphenate-limit-chars', '10 4 4'])
      expect(declarations).toContainEqual(['overflow-wrap', 'break-word'])
    },
  )

  it('never hyphenates code, where a hyphen would read as part of it', () => {
    expect(declarationsOf(':where(.kv-prose, .kv-card) :where(code, kbd, samp, pre)')).toEqual([
      ['hyphens', 'manual'],
    ])
  })

  const smallScreenRoot = rules.filter(
    (rule) => rule.media.includes('(width < 40rem)') && rule.selectors.includes(':root'),
  )
  const smallScreenTokens = Object.fromEntries(smallScreenRoot.flatMap((rule) => rule.declarations))

  it('steps the large roles down below 40rem, in rem so they follow the text size (1.4.4)', () => {
    expect(smallScreenTokens).toEqual({
      '--kv-font-display-size': '2rem',
      '--kv-font-display-letter-spacing': '0em',
      '--kv-font-heading-1-size': '1.5rem',
      '--kv-font-heading-2-size': '1.25rem',
      '--kv-font-lead-size': '1.125rem',
    })
  })

  it('never makes a role smaller than the role below it, and never touches body text', () => {
    const rootTokens = Object.fromEntries(declarationsOf(':root'))
    const size = (role: string) =>
      Number.parseFloat(
        smallScreenTokens[`--kv-font-${role}-size`] ?? rootTokens[`--kv-font-${role}-size`] ?? '',
      )
    const descending = ['display', 'heading-1', 'heading-2', 'heading-3'].map(size)
    expect(descending).toEqual(descending.toSorted((first, second) => second - first))
    expect(new Set(descending).size).toBe(descending.length)
    expect(size('lead')).toBeGreaterThanOrEqual(size('body-large'))
    expect(size('body')).toBe(1)
  })
})
