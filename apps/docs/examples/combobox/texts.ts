import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useComboboxTexts = defineExampleTexts({
  en: {
    municipality: 'Municipality',
    hint: 'Type a few letters, then choose one from the list.',
    several: 'Municipalities',
    severalHint: 'Choose as many as you like.',
    notInList: 'Choose a municipality from the list.',
    place: 'Place',
    placeHint: 'Type the first letters of the place.',
    send: 'Send',
    sent: 'Sent',
  },
  sv: {
    municipality: 'Kommun',
    hint: 'Skriv några bokstäver och välj sedan ett alternativ i listan.',
    several: 'Kommuner',
    severalHint: 'Välj så många du vill.',
    notInList: 'Välj en kommun i listan.',
    place: 'Ort',
    placeHint: 'Skriv ortens första bokstäver.',
    send: 'Skicka',
    sent: 'Skickat',
  },
})
