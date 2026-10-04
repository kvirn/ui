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

// The shipped theme.css, the source of truth. Only theme:check lives here: contrast pairs
// (1.4.3, 1.4.6, 1.4.11), the system fallbacks and the forced-colours mapping. The look is
// reviewed visually, never tested (AGENTS.md rule 13).
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
    // The theme-css skill lists 42 required pairs per theme; the components and docs use a few more.
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

  it.each(themeNames)('%s: guards hovered filled buttons on every card surface', (themeName) => {
    const minimumFor = (foreground: string, background: string) =>
      contrastRequirements[themeName].find(
        (requirement) =>
          requirement.foreground === foreground && requirement.background === background,
      )?.minimum
    for (const background of ['canvas', 'surface', 'surface-raised']) {
      // A hovered danger button's edge is its fill.
      expect(minimumFor('danger-hover', background)).toBe(3)
      // A hovered primary button's edge is its primary border.
      expect(minimumFor('primary', background)).toBe(3)
    }
    expect(minimumFor('primary-hover', 'canvas')).toBe(3)
    expect(minimumFor('primary-hover', 'surface')).toBe(3)
  })

  it.each(themeNames)(
    '%s: a hovered filled button keeps a 3:1 edge on every plain surface',
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
      // The edge is --kv-button-edge, or the fill when that is transparent.
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

  it.each(themeNames)('%s: guards prose on the status alerts', (themeName) => {
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

  it('reports a button edge tint that lowers a boundary under 3:1', () => {
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

describe('theme.css button edge (docs/design/button-depth.md)', () => {
  const propertiesOf = (themeName: ThemeName, source: 'attributes' | 'system') =>
    readRootProperties(themeCss, themeEnvironment(themeName, source))

  it.each(themeNames)('%s: the system fallback equals the theme', (themeName) => {
    const theme = propertiesOf(themeName, 'attributes')
    const fallback = propertiesOf(themeName, 'system')
    for (const token of buttonDepthTokens) {
      expect(fallback[token], `${themeName} ${token}`).toBe(theme[token])
    }
  })

  it('every tinted edge keeps 3:1 on every surface (1.4.11)', () => {
    for (const themeName of ['light', 'dark'] as const) {
      const colors = resolveThemeColors(themeCss, themeName)
      const properties = propertiesOf(themeName, 'attributes')
      const tint = themeName === 'light' ? 'shade' : 'highlight'
      const partner = parseButtonEdgeTint(properties[`--kv-button-edge-${tint}`])
      if (partner === undefined) {
        throw new Error(`${themeName}: --kv-button-edge-${tint} is not a colour and a percentage`)
      }
      for (const base of ['secondary', 'primary', 'danger', 'danger-hover'] as const) {
        const mixed = mixButtonEdge(colors[base] ?? '', partner)
        for (const background of ['canvas', 'surface', 'surface-raised'] as const) {
          expect(
            contrastRatio(mixed, colors[background] ?? ''),
            `${themeName} ${base} on ${background}`,
          ).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })
})
