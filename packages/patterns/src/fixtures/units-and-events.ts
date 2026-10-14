export type KvirnbyUnitArea = 'north' | 'centre' | 'south'
export type KvirnbyUnitLanguage = 'sv' | 'fi' | 'en'

export interface KvirnbyUnit {
  readonly name: string
  readonly area: KvirnbyUnitArea
  /** Street and postal line, written as two lines in an `Address`. */
  readonly street: string
  readonly town: string
  readonly languages: readonly KvirnbyUnitLanguage[]
  readonly hoursSummary: string
  readonly opensEarly: boolean
  readonly closesLate: boolean
  readonly href: string
}

export const kvirnbyUnitAreas: Record<KvirnbyUnitArea, string> = {
  north: 'North',
  centre: 'Centre',
  south: 'South',
}

export const kvirnbyUnitLanguages: Record<KvirnbyUnitLanguage, string> = {
  sv: 'Swedish',
  fi: 'Finnish',
  en: 'English',
}

/** Eight preschools of the fictional municipality; the finder shows five a page. */
export const kvirnbyUnits: readonly KvirnbyUnit[] = [
  {
    name: 'Hillside preschool',
    area: 'north',
    street: 'Old Mill Road 12',
    town: '123 45 Kvirnby',
    languages: ['sv', 'en'],
    hoursSummary: 'Open Monday to Friday, 6.30–18.30',
    opensEarly: true,
    closesLate: true,
    href: '#unit-hillside',
  },
  {
    name: 'Riverside preschool',
    area: 'north',
    street: 'River Lane 3',
    town: '123 46 Kvirnby',
    languages: ['sv'],
    hoursSummary: 'Open Monday to Friday, 7.00–17.30',
    opensEarly: false,
    closesLate: false,
    href: '#unit-riverside',
  },
  {
    name: 'Lakeview preschool',
    area: 'north',
    street: 'Lake Road 8',
    town: '123 47 Kvirnby',
    languages: ['sv', 'fi'],
    hoursSummary: 'Open Monday to Friday, 6.30–17.00',
    opensEarly: true,
    closesLate: false,
    href: '#unit-lakeview',
  },
  {
    name: 'Town Hall preschool',
    area: 'centre',
    street: 'Main Street 14',
    town: '123 45 Kvirnby',
    languages: ['sv', 'en'],
    hoursSummary: 'Open Monday to Friday, 7.00–18.00',
    opensEarly: false,
    closesLate: true,
    href: '#unit-townhall',
  },
  {
    name: 'Market Square preschool',
    area: 'centre',
    street: 'Torget 6',
    town: '123 45 Kvirnby',
    languages: ['sv', 'fi', 'en'],
    hoursSummary: 'Open Monday to Friday, 6.30–18.30',
    opensEarly: true,
    closesLate: true,
    href: '#unit-market',
  },
  {
    name: 'Birch Grove preschool',
    area: 'centre',
    street: 'Birch Way 21',
    town: '123 48 Kvirnby',
    languages: ['sv'],
    hoursSummary: 'Open Monday to Friday, 7.30–16.30',
    opensEarly: false,
    closesLate: false,
    href: '#unit-birch',
  },
  {
    name: 'Meadow preschool',
    area: 'south',
    street: 'Meadow Road 5',
    town: '123 49 Kvirnby',
    languages: ['sv', 'fi'],
    hoursSummary: 'Open Monday to Friday, 7.00–17.00',
    opensEarly: false,
    closesLate: false,
    href: '#unit-meadow',
  },
  {
    name: 'Harbour preschool',
    area: 'south',
    street: 'Harbour Street 2',
    town: '123 50 Kvirnby',
    languages: ['sv', 'en'],
    hoursSummary: 'Open Monday to Friday, 6.30–18.00',
    opensEarly: true,
    closesLate: true,
    href: '#unit-harbour',
  },
]

export type KvirnbyEventCategory = 'family' | 'culture' | 'community'

export const kvirnbyEventCategoryLabels: Record<KvirnbyEventCategory, string> = {
  family: 'Children and families',
  culture: 'Culture',
  community: 'Community',
}

/** The category of each event in `kvirnbyEvents`, by its `href`. */
export const kvirnbyEventCategories: Record<string, KvirnbyEventCategory> = {
  '#event-storytime': 'family',
  '#event-open-house': 'family',
  '#event-concert': 'culture',
  '#event-bus': 'community',
  '#event-cooking': 'community',
}
