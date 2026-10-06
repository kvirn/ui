import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useKvirnProviderTexts = defineExampleTexts({
  en: {
    language: 'Language',
    direction: 'Direction',
    country: 'Country for masks',
    noCountry: 'None: a country mask only takes digits',
    timeZone: 'Time zone',
    decisionDate: 'Decision date',
    newTab: 'Read the decision',
  },
  sv: {
    language: 'Språk',
    direction: 'Riktning',
    country: 'Land för masker',
    noCountry: 'Inget: en landsmask tar bara siffror',
    timeZone: 'Tidszon',
    decisionDate: 'Beslutsdatum',
    newTab: 'Läs beslutet',
  },
})
