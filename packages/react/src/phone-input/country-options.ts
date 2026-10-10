import { callingCodeCountries, callingCodeFor } from '@kvirn-ui/core'

export interface CountryOption {
  country: string
  label: string
}

function regionName(names: Intl.DisplayNames | undefined, country: string): string {
  try {
    return names?.of(country) ?? country
  } catch {
    return country
  }
}

/**
 * One option per country: `Sverige (+46)`, the name in the page's language, the resolved country
 * first and the rest in the locale's alphabetical order. No flags: they would be colour or
 * emoji only.
 */
export function countryOptions(locale: string, first: string | undefined): CountryOption[] {
  let names: Intl.DisplayNames | undefined
  let collator: Intl.Collator
  try {
    names = new Intl.DisplayNames(locale, { type: 'region' })
    collator = new Intl.Collator(locale)
  } catch {
    collator = new Intl.Collator()
  }
  const options = callingCodeCountries.map((country) => ({
    country,
    label: `${regionName(names, country)} (+${callingCodeFor(country)})`,
  }))
  options.sort((left, right) => {
    if (left.country === first || right.country === first) {
      return left.country === first ? -1 : 1
    }
    return collator.compare(left.label, right.label)
  })
  return options
}
