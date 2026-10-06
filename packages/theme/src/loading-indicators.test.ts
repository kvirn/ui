import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { mixButtonEdge } from './button-edge.ts'
import { contrastRatio } from './contrast.ts'
import { themeNames } from './contrast-requirements.ts'
import { resolveThemeColors } from './read-theme.ts'

// Loading indicators (docs/design/loading-indicators.md §6.5): the gradient between `primary` and
// `accent` and the sheen over it aren't token pairs, so theme:check can't see them. The bar
// is a graphical object (1.4.11): wherever along it, it keeps 3:1 against its track.
const themeCss = readFileSync(new URL('../theme.css', import.meta.url), 'utf8')

const plainBackgrounds = ['canvas', 'surface', 'surface-raised'] as const

// `linear-gradient(… in oklab, a, b)`, the colour at `position` (0 to 1) along it.
function mixInOklab(from: string, to: string, position: number): string {
  const toOklab = (hex: string) => {
    const [red, green, blue] = [1, 3, 5]
      .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      ) as [number, number, number]
    const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
    const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
    const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
    return [
      0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
      1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
      0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
    ] as const
  }
  const [startL, startA, startB] = toOklab(from)
  const [endL, endA, endB] = toOklab(to)
  const lightness = startL + (endL - startL) * position
  const greenRed = startA + (endA - startA) * position
  const blueYellow = startB + (endB - startB) * position
  const long = (lightness + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3
  const medium = (lightness - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3
  const short = (lightness - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3
  const linear = [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ]
  const hex = linear
    .map((channel) => Math.min(1, Math.max(0, channel)))
    .map((channel) =>
      channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055,
    )
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0'),
    )
  return `#${hex.join('')}`
}

const positions = [0, 0.25, 0.5, 0.75, 1]

describe('theme.css loading indicators (docs/design/loading-indicators.md §6.5)', () => {
  it.each(themeNames)(
    '%s: every point of the gradient is 3:1 on every plain background',
    (themeName) => {
      const colors = resolveThemeColors(themeCss, themeName)
      for (const position of positions) {
        const fill = mixInOklab(colors.primary ?? '', colors.accent ?? '', position)
        for (const background of plainBackgrounds) {
          expect(
            contrastRatio(fill, colors[background] ?? ''),
            `${themeName} gradient at ${position * 100}% on ${background}`,
          ).toBeGreaterThanOrEqual(3)
        }
      }
    },
  )

  it.each(themeNames)('%s: the sheen peak on the fill is 3:1 on the track', (themeName) => {
    const colors = resolveThemeColors(themeCss, themeName)
    const sheen = { color: colors['on-primary'] ?? '', percent: 20 }
    for (const position of positions) {
      const fill = mixInOklab(colors.primary ?? '', colors.accent ?? '', position)
      expect(
        contrastRatio(mixButtonEdge(fill, sheen), colors.surface ?? ''),
        `${themeName} sheen over the gradient at ${position * 100}%`,
      ).toBeGreaterThanOrEqual(3)
    }
  })
})
