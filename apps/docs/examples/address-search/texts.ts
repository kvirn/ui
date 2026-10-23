import type { MapPlace } from '@kvirn-ui/map'
import { defineExampleTexts } from '../../components/local-example-texts.ts'

const stations: MapPlace[] = [
  {
    id: 'bokgatan',
    name: 'Bokgatan recycling station',
    address: 'Bokgatan 12',
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
    id: 'hamnen',
    name: 'Harbour recycling station',
    address: 'Hamnplan 1',
    description: 'Paper, cardboard and glass packaging.',
    position: { longitude: 18.0717, latitude: 59.3249 },
  },
]

const fourDecimals = (value: number) => value.toFixed(4)

export const useAddressSearchTexts = defineExampleTexts({
  en: {
    nothingChosen: 'No address is chosen.',
    chosen: (label: string, latitude: number, longitude: number) =>
      `Chosen: ${label}. Latitude ${fourDecimals(latitude)}, longitude ${fourDecimals(longitude)}.`,

    mapLabel: 'Map of recycling stations',
    stations,

    faultLabel: 'Address near the fault',
    faultHelp: 'Type the street, and the town if you can. Then press Search.',
    noPlace: 'No address is chosen.',
    faultAt: (label: string) => `Fault reported near ${label}.`,

    legend: 'Your new address',
    formSearchLabel: 'Find your address',
    helpInForm: (min: number) =>
      `Type at least ${min} characters of a street, postal code or place. Then choose an address from the list, or type it in the boxes below.`,
    pickedInForm: (label: string) =>
      `Chosen: ${label}. The address is filled in below. Check it before you continue.`,
    noAddress:
      'This place has no postal address. Choose another one, or type the address in the boxes below.',
    street: 'Street address',
    line2: 'Address line 2',
    postalCode: 'Postal code',
    city: 'Town or city',
    reportChange: 'Report the change',
    changeReported: 'The change is reported.',
  },
})
