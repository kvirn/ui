import { contrastRatio } from './contrast.ts'
import type { ColorTokenName, ThemeName } from './contrast-requirements.ts'

// Button depth (ADR-0026): a button's edge is tinted, darker at the bottom in light and lighter
// at the top in dark. `--kv-button-edge-shade` and `--kv-button-edge-highlight` are a colour and
// a percentage, the second argument of `color-mix(in srgb, <edge>, <colour> <percentage>)`.
// A tint must never lower a boundary under 3:1 (1.4.11), so `theme:check` measures every one.

/** The colour a button's edge is mixed with, and how much of it (0 to 100). */
export interface ButtonEdgeTint {
  color: string
  percent: number
}

/**
 * Reads `#0f1011 35%`: a `#rgb` or `#rrggbb` colour, then a percentage from 0 to 100. Returns
 * `undefined` for anything else, so a name, an unresolved `var()` or a missing percentage is
 * reported instead of guessed.
 */
export function parseButtonEdgeTint(value: string | undefined): ButtonEdgeTint | undefined {
  const match = /^(#(?:[\da-f]{3}|[\da-f]{6})) (\d+(?:\.\d+)?)%$/i.exec(value?.trim() ?? '')
  if (match?.[1] === undefined || match[2] === undefined) {
    return undefined
  }
  const percent = Number(match[2])
  return percent <= 100 ? { color: match[1], percent } : undefined
}

function channels(color: string): [number, number, number] {
  const digits = color.slice(1)
  const full =
    digits.length === 3 ? digits.replaceAll(/[\da-f]/gi, (digit) => digit + digit) : digits
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ]
}

/**
 * The tinted edge as `#rrggbb`: per channel, `base × (1 − p) + partner × p` on the 0 to 255
 * values, rounded. That's `color-mix(in srgb, …)` for an opaque edge, and for a transparent one
 * it's the partner composited at `p` over the button's fill, so pass the fill as `base`.
 */
export function mixButtonEdge(base: string, tint: ButtonEdgeTint): string {
  const share = tint.percent / 100
  const partner = channels(tint.color)
  const mixed = channels(base).map((channel, index) =>
    Math.round(channel * (1 - share) + (partner[index] ?? 0) * share),
  )
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

/**
 * The tokens whose colour is a button's edge or fill, in the states a button can be in: the
 * base button's `secondary`, `primary` (the base on hover, and the primary button's fill and
 * edge) and the danger button's `danger` and `danger-hover` fills.
 */
export const buttonEdgeBases = ['secondary', 'primary', 'danger', 'danger-hover'] as const

const plainBackgrounds = ['canvas', 'surface', 'surface-raised'] as const

/** How many pairs `checkButtonEdges` measures per theme: 4 bases × 2 tints × 3 backgrounds. */
export const buttonEdgePairsPerTheme = buttonEdgeBases.length * 2 * plainBackgrounds.length

/**
 * Requires every tinted button edge to keep 3:1 against `canvas`, `surface` and `surface-raised`
 * (1.4.11). At 0% the result is the token itself, which the colour pairs already require.
 * Returns one message per unmet pair or unknown token.
 */
export function checkButtonEdges(
  themeName: ThemeName,
  colors: Readonly<Partial<Record<ColorTokenName, string>>>,
  shade: ButtonEdgeTint,
  highlight: ButtonEdgeTint,
): string[] {
  const missing = [...buttonEdgeBases, ...plainBackgrounds].filter(
    (name) => colors[name] === undefined,
  )
  if (missing.length > 0) {
    return missing.map((name) => `${themeName}: unknown token "${name}"`)
  }
  return buttonEdgeBases.flatMap((base) =>
    (
      [
        ['shade', shade],
        ['highlight', highlight],
      ] as const
    ).flatMap(([tintName, tint]) => {
      const edge = mixButtonEdge(colors[base] ?? '', tint)
      return plainBackgrounds.flatMap((background) => {
        const ratio = contrastRatio(edge, colors[background] ?? '')
        return ratio >= 3
          ? []
          : [
              `${themeName}: ${base} edge mixed with the ${tintName} (${edge}) on ${background} is ${ratio.toFixed(2)}:1, needs 3:1`,
            ]
      })
    }),
  )
}
