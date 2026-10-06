import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useSliderTexts = defineExampleTexts({
  en: {
    distanceLabel: 'Distance from your address, in kilometres',
    distanceHint: 'From 0 to 50 km. You can also type a number.',
    distanceEnds: 'From 0 to 50 km.',
    distanceUnit: 'km',
    distanceTooFar: 'Enter a distance of 50 km or less',
    send: 'Search',
    sent: 'Sent:',
  },
  sv: {
    distanceLabel: 'Avstånd från din adress i kilometer',
    distanceHint: 'Från 0 till 50 km. Du kan också skriva ett tal.',
    distanceEnds: 'Från 0 till 50 km.',
    distanceUnit: 'km',
    distanceTooFar: 'Ange ett avstånd på högst 50 km',
    send: 'Sök',
    sent: 'Skickat:',
  },
})
