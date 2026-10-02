import type { MessageFormat } from './types.ts'

const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const

/** Rounds to `digits` decimals, the way `Intl.NumberFormat` does for the shown value. */
function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/**
 * One decimal for MB and GB, and for kB under 10. Whole numbers otherwise, and always for bytes.
 * A file of 10,4 MB then never reads "10 MB" next to a 10 MB limit, which would say
 * "10 MB is larger than 10 MB".
 */
function fractionDigits(value: number, unitIndex: number): number {
  if (unitIndex >= 2) return 1
  return unitIndex === 1 && value < 10 ? 1 : 0
}

/**
 * Formats a byte count for people, in decimal units (1 kB is 1000 B): `B`, `kB`, `MB`, `GB`,
 * with the locale's unit symbol and decimal separator, for example `2,4 MB` in `sv` and
 * `2.4 MB` in `en`. One decimal for MB and GB (and kB under 10), and never bytes above 1 kB.
 * Pure: the locale comes from `format`, so a file and its limit always read in the same way
 * (FileUpload, Plan 0021).
 *
 * @example formatFileSize(format, 2_400_000) // "2.4 MB"
 */
export function formatFileSize(format: MessageFormat, bytes: number): string {
  let value = Number.isFinite(bytes) ? Math.max(0, bytes) : 0
  let unitIndex = 0
  while (unitIndex < units.length - 1 && value >= 1000) {
    value /= 1000
    unitIndex += 1
  }
  // 999.96 kB rounds to 1000 kB: show it as 1 MB instead.
  if (unitIndex < units.length - 1 && round(value, fractionDigits(value, unitIndex)) >= 1000) {
    value /= 1000
    unitIndex += 1
  }
  return format.number(value, {
    style: 'unit',
    unit: units[unitIndex],
    unitDisplay: 'short',
    maximumFractionDigits: fractionDigits(value, unitIndex),
  })
}
