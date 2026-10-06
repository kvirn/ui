import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useInputGroupTexts = defineExampleTexts({
  en: {
    distance: 'Distance to work in kilometres',
    unit: 'km',
    errorDistance: 'Enter the distance to work in whole kilometres',
    lockedHint: 'The distance was set when your application was received.',
    searchLabel: 'Search services',
    searchClear: 'Clear search',
  },
  sv: {
    distance: 'Avstånd till arbetet i kilometer',
    unit: 'km',
    errorDistance: 'Skriv avståndet till arbetet i hela kilometer',
    lockedHint: 'Avståndet fastställdes när din ansökan kom in.',
    searchLabel: 'Sök bland tjänster',
    searchClear: 'Rensa sökningen',
  },
})
