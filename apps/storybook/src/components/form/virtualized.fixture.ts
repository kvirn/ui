// Story and test data for the Virtualized stories of Listbox, Combobox and Autocomplete
// (contracts: the "Virtualization" sections of listbox.a11y.md, combobox.a11y.md and
// autocomplete.a11y.md). 10 000 deterministic labels, in the Swedish alphabet, so typeahead and
// filtering mean something: 40 stems that start with a-z and then å, ä and ö, each numbered 1 to
// 250. The first label is "Alvik 1" and the last is "Österbo 250".

export interface VirtualizedPlace {
  code: string
  name: string
}

/** In the Swedish alphabet: å, ä and ö come last, and typeahead keeps them apart from a and o. */
const stems = [
  'Alvik',
  'Backa',
  'Björkby',
  'Bromma',
  'Dala',
  'Ekeby',
  'Falla',
  'Forsa',
  'Gammelby',
  'Gransjö',
  'Hamra',
  'Hässelby',
  'Idre',
  'Järna',
  'Kalvö',
  'Klinta',
  'Lunda',
  'Mora',
  'Nynäs',
  'Orsa',
  'Persbo',
  'Ramsele',
  'Rönnby',
  'Salem',
  'Skuru',
  'Stenby',
  'Tyresö',
  'Ulvik',
  'Vallby',
  'Vretby',
  'Åkerby',
  'Åsele',
  'Älvsbo',
  'Ängby',
  'Äskhult',
  'Ödeby',
  'Ölme',
  'Örby',
  'Östanbyn',
  'Österbo',
] as const

const variantsPerStem = 250

/** How many options the Virtualized stories have. */
export const virtualizedCount = stems.length * variantsPerStem

/** The index of the first label that starts with each letter that the tests type. */
export const firstIndexOf = {
  /** "Orsa 1": typing `o` finds it, and not the ones that start with ö. */
  o: stems.indexOf('Orsa') * variantsPerStem,
  /** "Åkerby 1". */
  å: stems.indexOf('Åkerby') * variantsPerStem,
  /** "Ödeby 1". */
  ö: stems.indexOf('Ödeby') * variantsPerStem,
} as const

/** 10 000 places, with a key each: "Alvik 1" to "Österbo 250". */
export const virtualizedPlaces: readonly VirtualizedPlace[] = stems.flatMap((stem, stemIndex) =>
  Array.from({ length: variantsPerStem }, (_, variantIndex) => ({
    code: `ort-${stemIndex * variantsPerStem + variantIndex + 1}`,
    name: `${stem} ${variantIndex + 1}`,
  })),
)

/** 10 000 street addresses for an Autocomplete: "Alvikvägen 1" to "Österbovägen 250". */
export const virtualizedStreets: readonly string[] = stems.flatMap((stem) =>
  Array.from({ length: variantsPerStem }, (_, number) => `${stem}vägen ${number + 1}`),
)
