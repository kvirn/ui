import type { MapLayer, MapPlace } from '@kvirn-ui/core'

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const streets = [
  'Hornsgatan',
  'Sveavägen',
  'Götgatan',
  'Drottninggatan',
  'Valhallavägen',
  'Folkungagatan',
  'Odengatan',
  'Kungsholmsgatan',
  'Birger Jarlsgatan',
  'Nynäsvägen',
  'Essingeleden',
  'Södertäljevägen',
  'Roslagsvägen',
  'Strandvägen',
  'Karlbergsvägen',
]

const areas = [
  ['Södermalm', '118 20'],
  ['Norrmalm', '111 22'],
  ['Östermalm', '114 32'],
  ['Kungsholmen', '112 20'],
  ['Hägersten', '126 30'],
  ['Solna', '171 45'],
  ['Nacka', '131 30'],
  ['Bromma', '168 67'],
] as const

const fuelNames = ['Nordtank', 'Vägkant', 'Energia', 'Tankstopp', 'Mälarbränsle']
const hotelNames = [
  'Hotell Strandvik',
  'Hotell Mälarsund',
  'Stadshotellet',
  'Hotell Skärgård',
  'Hotell Nordljus',
]

function generate(layer: 'fuel' | 'hotels', prefix: string, seed: number): MapPlace[] {
  const random = mulberry32(seed)
  return Array.from({ length: 100 }, (_, index) => {
    const centred = random() < 0.6
    const spread = centred ? 0.3 : 1
    const longitude = 18.02 + (random() + random() - 1) * 0.28 * spread
    const latitude = 59.33 + (random() + random() - 1) * 0.13 * spread
    const street = streets[Math.floor(random() * streets.length)]!
    const [area, postcode] = areas[Math.floor(random() * areas.length)]!
    const name =
      layer === 'fuel'
        ? `${fuelNames[index % fuelNames.length]} ${street}`
        : `${hotelNames[index % hotelNames.length]} ${area}`
    return {
      id: `${prefix}-${index + 1}`,
      name,
      address: `${street} ${1 + Math.floor(random() * 90)}, ${postcode} Stockholm`,
      position: {
        longitude: Math.min(18.3, Math.max(17.75, longitude)),
        latitude: Math.min(59.45, Math.max(59.2, latitude)),
      },
      layer,
    }
  })
}

export const fuelStations = generate('fuel', 'fuel', 1187)
export const hotels = generate('hotels', 'hotel', 2291)

export const demoLayers: MapLayer[] = [
  { id: 'fuel', label: 'Fuel stations', description: 'Petrol, diesel and charging stops.' },
  { id: 'hotels', label: 'Hotels', description: 'Places to stay in and around the city.' },
]
