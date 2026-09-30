/** WCAG 2.x relative luminance and contrast ratio for sRGB hex colours (#rgb or #rrggbb). */

function parseHexColor(color: string): [number, number, number] {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color)
  if (match?.[1] === undefined) {
    throw new Error(`Unsupported colour "${color}". Use #rgb or #rrggbb.`)
  }
  const digits =
    match[1].length === 3 ? match[1].replaceAll(/[\da-f]/gi, (digit) => digit + digit) : match[1]
  return [0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ]
}

function channelLuminance(channel: number): number {
  const srgb = channel / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color: string): number {
  const [red, green, blue] = parseHexColor(color).map(channelLuminance) as [number, number, number]
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (first, second) => second - first,
  ) as [number, number]
  return (lighter + 0.05) / (darker + 0.05)
}
