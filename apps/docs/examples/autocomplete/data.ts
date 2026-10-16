// Plain strings, so the item is its own text and no `itemToString` is needed.
export const streets: readonly string[] = [
  'Almgatan',
  'Bokgatan',
  'Drottninggatan',
  'Fabriksgatan',
  'Hamngatan',
  'Kungsgatan',
  'Kyrkogatan',
  'Norra Hamngatan',
  'Nya Hamngatan',
  'Skolgatan',
  'Stationsgatan',
  'Stora Torget',
  'Storgatan',
  'Vasagatan',
]

export interface Street {
  name: string
  district: string
}

export const streetsWithDistrict: readonly Street[] = [
  { name: 'Storgatan', district: 'Centrum' },
  { name: 'Kungsgatan', district: 'Norrmalm' },
  { name: 'Stationsgatan', district: 'Station' },
]

/** 5 000 addresses, "Alvikgatan 1" to "Zebogatan 250". */
const stems = [
  'Alvik',
  'Backa',
  'Dala',
  'Ekeby',
  'Falla',
  'Hamra',
  'Idre',
  'Jorby',
  'Kalby',
  'Lunda',
  'Mora',
  'Nyby',
  'Orsa',
  'Rosby',
  'Sunne',
  'Tuna',
  'Vik',
  'Wiby',
  'Yngby',
  'Zebo',
]

export const addresses: readonly string[] = stems.flatMap((stem) =>
  Array.from({ length: 250 }, (_, number) => `${stem}gatan ${number + 1}`),
)
