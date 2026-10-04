// The country a locale implies, for the masks that differ by country. Pure string work, no Intl.

import type { MaskCountry } from '../mask/masks.ts'

const countries: Readonly<Record<string, MaskCountry>> = Object.freeze({
  SE: 'SE',
  FI: 'FI',
  NO: 'NO',
})

// The language of a bare tag. Northern Sami (`se`) is mostly spoken in Norway.
const languageCountries: Readonly<Record<string, MaskCountry>> = Object.freeze({
  sv: 'SE',
  fi: 'FI',
  nb: 'NO',
  nn: 'NO',
  no: 'NO',
  se: 'NO',
})

/**
 * The country a BCP 47 locale implies for the country masks (`personal-identity-number`,
 * `postal-code`, `organisation-number`): the region of the tag first (`sv-FI` is `FI`), then
 * the language (`sv` is `SE`, `fi` is `FI`, `nb`, `nn`, `no` and `se` are `NO`). `undefined`
 * when neither says (`en`, `da-DK`): the caller decides what to do, nothing is guessed.
 */
export function maskCountryFromLocale(locale: string): MaskCountry | undefined {
  const [language = '', ...subtags] = locale.split(/[-_]/)
  for (const subtag of subtags) {
    // A single-character subtag opens an extension (`u-`) or private use (`x-`): what follows
    // is not a region.
    if (subtag.length === 1) {
      break
    }
    const country = /^[A-Za-z]{2}$/.test(subtag) ? countries[subtag.toUpperCase()] : undefined
    if (country !== undefined) {
      return country
    }
  }
  return languageCountries[language.toLowerCase()]
}
