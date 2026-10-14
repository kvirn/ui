import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useSliderTexts = defineExampleTexts({
  en: {
    distanceLabel: 'Distance from your address, in kilometres',
    distanceHint: 'From 1 to 20 km. You can also type a number.',
    distanceEnds: 'From 1 to 20 km.',
    distanceUnit: 'km',
    distanceOutOfRange: 'Enter a distance from 1 to 20 km',
    send: 'Search',
    sent: 'Sent:',
    stations: [
      { name: 'Harbour recycling centre', distance: 2 },
      { name: 'Hill Road collection point', distance: 4 },
      { name: 'Mill Street recycling point', distance: 7 },
      { name: 'Northern recycling centre', distance: 11 },
      { name: 'Lake Road collection point', distance: 16 },
    ],
    results: (count: number, km: number) =>
      count === 0
        ? `No recycling points within ${km} km`
        : count === 1
          ? `1 recycling point within ${km} km`
          : `${count} recycling points within ${km} km`,
    wholeMunicipality: 'Search the whole municipality',
    distanceOff: 'Not available while you search the whole municipality.',
  },
})
