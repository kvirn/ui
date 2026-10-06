// Plain strings, so the item is its own text and no `itemToString` is needed.
export const streets: readonly string[] = [
  'Almvägen',
  'Björkvägen',
  'Drottninggatan',
  'Fabriksgatan',
  'Hamngatan',
  'Järnvägsgatan',
  'Kungsgatan',
  'Kyrkogatan',
  'Skolgatan',
  'Storgatan',
  'Stora Torget',
  'Västra Hamngatan',
  'Älvgatan',
  'Östra Hamngatan',
]

export interface Street {
  name: string
  district: string
}

export const streetsWithDistrict: readonly Street[] = [
  { name: 'Storgatan', district: 'Centrum' },
  { name: 'Kungsgatan', district: 'Norrmalm' },
  { name: 'Järnvägsgatan', district: 'Station' },
]

/** 5 000 addresses, "Alvikvägen 1" to "Österbovägen 250". */
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

export const addresses: readonly string[] = stems.flatMap((stem) =>
  Array.from({ length: 250 }, (_, number) => `${stem}vägen ${number + 1}`),
)
