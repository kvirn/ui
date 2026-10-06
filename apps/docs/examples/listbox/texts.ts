import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useListboxTexts = defineExampleTexts({
  en: {
    municipality: 'Municipality',
    municipalityPlaceholder: 'Choose a municipality',
    regionWest: 'West',
    regionEast: 'East',
    regionSouth: 'South',
    several: 'Municipalities',
    severalPlaceholder: 'Choose municipalities',
    closedHint: 'Stockholm is closed for new applications until 1 March.',
    send: 'Send',
    sent: 'Sent',
    place: 'Place',
    placePlaceholder: 'Choose a place',
    language: 'Language',
  },
  sv: {
    municipality: 'Kommun',
    municipalityPlaceholder: 'Välj kommun',
    regionWest: 'Väst',
    regionEast: 'Öst',
    regionSouth: 'Syd',
    several: 'Kommuner',
    severalPlaceholder: 'Välj kommuner',
    closedHint: 'Stockholm tar inte emot nya ansökningar före 1 mars.',
    send: 'Skicka',
    sent: 'Skickat',
    place: 'Ort',
    placePlaceholder: 'Välj ort',
    language: 'Språk',
  },
})
