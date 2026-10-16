import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useComboboxTexts = defineExampleTexts({
  en: {
    municipality: 'Municipality',
    hint: 'Type a few letters, then choose one from the list.',
    several: 'Municipalities',
    severalHint: 'Choose as many as you like.',
    notInList: 'Choose a municipality from the list.',
    // kv-lang-ok: the start of Göteborg, a Swedish place name with an ö
    typedStart: 'Gö',
    place: 'Place',
    placeHint: 'Type the first letters of the place.',
    send: 'Send',
    sent: 'Sent',
  },
})
