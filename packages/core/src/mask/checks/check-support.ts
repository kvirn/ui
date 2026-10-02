/** Removes whitespace, which people and autofill put between the groups of an identifier. */
export function removeWhitespace(value: string): string {
  return value.replace(/\s+/g, '')
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function isCalendarDate(year: number, month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
}

/** The Luhn check (modulus 10) over all the digits, the last one being the check digit. */
export function passesLuhn(digits: string): boolean {
  let sum = 0
  for (let position = 0; position < digits.length; position += 1) {
    const digit = Number(digits.charAt(digits.length - 1 - position))
    const weighted = position % 2 === 1 ? digit * 2 : digit
    sum += weighted > 9 ? weighted - 9 : weighted
  }
  return sum % 10 === 0
}

export function weightedSum(digits: string, weights: readonly number[]): number {
  let sum = 0
  for (let position = 0; position < weights.length; position += 1) {
    sum += Number(digits.charAt(position)) * (weights[position] ?? 0)
  }
  return sum
}
