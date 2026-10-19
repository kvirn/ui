// kv-lang-ok-file: the Finnish notice is on purpose, to show a page part in another language (3.1.2 Language of Parts)
import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useKvirnProviderTexts = defineExampleTexts({
  en: {
    language: 'Language (lang)',
    direction: 'Text direction (dir)',
    timeZone: 'Time zone',
    firstWeekday: 'First day of the week',
    decisionDate: 'Decision date',
    fee: 'Fee',
    pageIntro: 'This sentence is English. The part below is Finnish.',
    finnishNotice: 'Hakemuksesi on vastaanotettu. Käsittelemme sen kolmen viikon kuluessa.',
    finnishLink: 'Suomi.fi-palvelut',
    colorScheme: 'Colour scheme',
    contrast: 'Contrast',
    system: 'Same as my device',
    light: 'Light',
    dark: 'Dark',
    standard: 'Standard',
    more: 'High contrast',
    forcedColors: 'Your device’s own colours are in use. They go before your choice.',
  },
})
