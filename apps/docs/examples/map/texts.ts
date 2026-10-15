import type { MapLayer, MapPlace } from '@kvirn-ui/map'
import { defineExampleTexts } from '../../components/local-example-texts.ts'

// The pictures are inline SVG data, so the page requests nothing from a server.
const houseDrawing = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160"><rect width="320" height="160" fill="#dbeadf"/><path d="M110 140V70l50-35 50 35v70z" fill="#f2c94c"/><rect x="148" y="95" width="24" height="45" fill="#3f6b57"/></svg>`
const houseImage = `data:image/svg+xml;utf8,${encodeURIComponent(houseDrawing)}`

const stations: MapPlace[] = [
  {
    id: 'bjorkvagen',
    name: 'Björkvägen recycling station',
    address: 'Björkvägen 12',
    description: 'Glass, metal, paper, plastic and cardboard packaging. Open all day, every day.',
    position: { longitude: 18.0537, latitude: 59.3339 },
  },
  {
    id: 'torget',
    name: 'Torget recycling station',
    address: 'Stora torget 3',
    description: 'Paper, cardboard, glass and metal packaging. Emptied on Mondays and Thursdays.',
    position: { longitude: 18.0649, latitude: 59.3274 },
  },
  {
    id: 'ekskolan',
    name: 'Ekskolan recycling station',
    address: 'Skolgatan 8',
    description: 'Glass, metal and plastic packaging. Open all day, every day.',
    position: { longitude: 18.0769, latitude: 59.3347 },
  },
  {
    id: 'idrottsplatsen',
    name: 'Sports ground recycling station',
    address: 'Idrottsvägen 2',
    position: { longitude: 18.0846, latitude: 59.3279 },
  },
  {
    id: 'hamnen',
    name: 'Harbour recycling station',
    address: 'Hamnplan 1',
    description: 'Paper, cardboard and glass packaging.',
    position: { longitude: 18.0717, latitude: 59.3249 },
  },
]

const preschools: MapPlace[] = [
  {
    id: 'solrosen',
    name: 'Solrosen preschool',
    address: 'Blomstervägen 4',
    description: 'Four groups and a garden. Call the office to book a visit.',
    image: {
      src: houseImage,
      alt: 'A yellow house with a green door on a light green background',
    },
    position: { longitude: 18.0554, latitude: 59.333 },
  },
  {
    id: 'lingonet',
    name: 'Lingonet preschool',
    address: 'Skogsstigen 17',
    description: 'A small unit for children aged one to three.',
    position: { longitude: 18.0674, latitude: 59.3266 },
  },
  {
    id: 'bryggan',
    name: 'Bryggan preschool',
    address: 'Hamngatan 9',
    description: 'Next to the harbour. Children are outdoors every day.',
    position: { longitude: 18.0803, latitude: 59.3317 },
  },
  {
    id: 'kvarnen',
    name: 'Kvarnen preschool',
    address: 'Kvarngatan 21',
    position: { longitude: 18.0863, latitude: 59.3257 },
  },
]

const layers: MapLayer[] = [
  { id: 'recycling', label: 'Recycling stations' },
  { id: 'hazardous', label: 'Hazardous waste', description: 'Paint, batteries, chemicals' },
  { id: 'reuse', label: 'Reuse shops' },
]

const wastePlaces: MapPlace[] = [
  {
    id: 'bjorkvagen',
    name: 'Björkvägen recycling station',
    address: 'Björkvägen 12',
    layer: 'recycling',
    position: { longitude: 18.0546, latitude: 59.3334 },
  },
  {
    id: 'torget',
    name: 'Torget recycling station',
    address: 'Stora torget 3',
    layer: 'recycling',
    position: { longitude: 18.0666, latitude: 59.327 },
  },
  {
    id: 'ekskolan',
    name: 'Ekskolan recycling station',
    address: 'Skolgatan 8',
    layer: 'recycling',
    position: { longitude: 18.0812, latitude: 59.3339 },
  },
  {
    id: 'hamnen',
    name: 'Harbour recycling station',
    address: 'Hamnplan 1',
    layer: 'recycling',
    position: { longitude: 18.0846, latitude: 59.3261 },
  },
  {
    id: 'depot',
    name: 'Hazardous waste depot',
    address: 'Verkstadsvägen 30',
    description: 'Hand in paint, batteries and chemicals. Staffed Tuesday to Saturday.',
    layer: 'hazardous',
    position: { longitude: 18.0614, latitude: 59.3317 },
  },
  {
    id: 'mobile',
    name: 'Mobile hazardous waste point',
    address: 'Stora torget 3',
    description: 'Visits on the first Saturday of each month.',
    layer: 'hazardous',
    position: { longitude: 18.0751, latitude: 59.3296 },
  },
  {
    id: 'aterbruket',
    name: 'Återbruket reuse shop',
    address: 'Gjutarvägen 5',
    description: 'Hand in furniture and household items in good condition.',
    layer: 'reuse',
    position: { longitude: 18.0691, latitude: 59.3343 },
  },
  {
    id: 'loppis',
    name: 'Church flea market',
    address: 'Kyrkogatan 14',
    layer: 'reuse',
    position: { longitude: 18.0786, latitude: 59.3253 },
  },
]

const pollingStations: MapPlace[] = [
  {
    id: 'ekbacken-gym',
    name: 'Ekbacken school gym',
    address: 'Ekbacksvägen 3',
    description: 'Step-free entrance and a lift.',
    position: { longitude: 18.0082, latitude: 59.342 },
  },
  {
    id: 'ekbacken-library',
    name: 'Ekbacken library',
    address: 'Ekbacksvägen 9',
    description: 'Step-free entrance.',
    position: { longitude: 18.0134, latitude: 59.3406 },
  },
  {
    id: 'ekbacken-hall',
    name: 'Ekbacken parish hall',
    address: 'Kyrkvägen 2',
    description: 'Three steps at the entrance. Call to arrange a ramp.',
    position: { longitude: 18.0116, latitude: 59.3386 },
  },
  {
    id: 'strand-canteen',
    name: 'Strand school canteen',
    address: 'Strandvägen 40',
    description: 'Step-free entrance.',
    position: { longitude: 18.1078, latitude: 59.3454 },
  },
  {
    id: 'strand-sports',
    name: 'Strand sports centre',
    address: 'Strandvägen 52',
    description: 'Step-free entrance and a lift.',
    position: { longitude: 18.1129, latitude: 59.3437 },
  },
  {
    id: 'strand-day-centre',
    name: 'Strand day centre',
    address: 'Hamnvägen 7',
    position: { longitude: 18.1043, latitude: 59.3434 },
  },
  {
    id: 'torpet-hall',
    name: 'Torpet community hall',
    address: 'Torpvägen 6',
    description: 'Step-free entrance.',
    position: { longitude: 18.0734, latitude: 59.3128 },
  },
  {
    id: 'torpet-scouts',
    name: 'Torpet scout hut',
    address: 'Torpvägen 14',
    position: { longitude: 18.0776, latitude: 59.3115 },
  },
  {
    id: 'torpet-gym',
    name: 'Torpet school gym',
    address: 'Skolvägen 1',
    description: 'Step-free entrance and a lift.',
    position: { longitude: 18.07, latitude: 59.3108 },
  },
]

export const useMapTexts = defineExampleTexts({
  en: {
    stationsLabel: 'Map of recycling stations',
    stations,
    preschoolsLabel: 'Map of preschools',
    preschools,
    hours: {
      solrosen: 'Open 6:30 to 18:00',
      lingonet: 'Open 7:00 to 17:30',
      bryggan: 'Open 6:30 to 18:00',
      kvarnen: 'Open 7:00 to 17:00',
    } as Readonly<Record<string, string>>,
    wasteLabel: 'Map of places for sorting waste and reuse',
    layers,
    wastePlaces,
    pollingLabel: 'Map of polling stations',
    pollingStations,
    ownListHeading: (shown: number, total: number) =>
      `${shown} of ${total} recycling stations in the map view`,
  },
})
