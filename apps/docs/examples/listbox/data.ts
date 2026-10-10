export interface Municipality {
  code: string
  name: string
  county: string
}

// Proper nouns, so the same in every language. The items are module constants: a Listbox
// compares items by identity, so a list built in render must be memoized.
export const municipalities: readonly Municipality[] = [
  { code: 'boras', name: 'Borås', county: 'Västra Götaland' },
  { code: 'falun', name: 'Falun', county: 'Dalarna' },
  { code: 'goteborg', name: 'Göteborg', county: 'Västra Götaland' },
  { code: 'jonkoping', name: 'Jönköping', county: 'Jönköping' },
  { code: 'linkoping', name: 'Linköping', county: 'Östergötland' },
  { code: 'lund', name: 'Lund', county: 'Skåne' },
  { code: 'malmo', name: 'Malmö', county: 'Skåne' },
  { code: 'stockholm', name: 'Stockholm', county: 'Stockholm' },
  { code: 'umea', name: 'Umeå', county: 'Västerbotten' },
  { code: 'uppsala', name: 'Uppsala', county: 'Uppsala' },
  { code: 'vasteras', name: 'Västerås', county: 'Västmanland' },
  { code: 'orebro', name: 'Örebro', county: 'Örebro' },
]

export const findMunicipality = (code: string) => {
  const municipality = municipalities.find((candidate) => candidate.code === code)
  if (municipality === undefined) {
    throw new Error(`No municipality with the code ${code}.`)
  }
  return municipality
}

export interface Language {
  code: string
  name: string
}

// Each language's name in that language (its endonym), so the same in every page language.
export const languages: readonly Language[] = [
  { code: 'sv', name: 'Svenska' },
  { code: 'fi', name: 'Suomi' },
  { code: 'en', name: 'English' },
]

export interface Place {
  code: string
  name: string
}

const stems = [
  'Alvik',
  'Backa',
  'Dala',
  'Ekeby',
  'Falla',
  'Hamra',
  'Idre',
  'Järna',
  'Kalvö',
  'Lunda',
  'Mora',
  'Nyby',
  'Orsa',
  'Rösta',
  'Sunne',
  'Tuna',
  'Vik',
  'Åsa',
  'Älvsby',
  'Österbo',
]

/** 5 000 places, "Alvik 1" to "Österbo 250": long enough that rendering all of them would be slow. */
export const places: readonly Place[] = stems.flatMap((stem, stemIndex) =>
  Array.from({ length: 250 }, (_, number) => ({
    code: `place-${stemIndex * 250 + number + 1}`,
    name: `${stem} ${number + 1}`,
  })),
)
