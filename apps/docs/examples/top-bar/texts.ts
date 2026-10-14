import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Every example is its own page region, so each Navigation has its own name: two navigations with
// the same name can't be told apart in a screen reader's landmark list.
export const useTopBarTexts = defineExampleTexts({
  en: {
    intro: 'A service from the municipality of Norrvik.',
    news: 'Latest: opening hours over the holidays',
    tools: 'Tools: default bar',
    toolsFilled: 'Tools: filled bar',
    toolsOwn: 'Tools: your own element',
    language: 'Language',
    easyRead: 'Easy to read',
    contact: 'Contact us',
  },
  sv: {
    intro: 'En tjänst från Norrviks kommun.',
    news: 'Nytt: öppettider under helgerna',
    tools: 'Verktyg: standardlist',
    toolsFilled: 'Verktyg: färgad list',
    toolsOwn: 'Verktyg: eget element',
    language: 'Språk',
    easyRead: 'Lättläst',
    contact: 'Kontakta oss',
  },
  nb: {
    intro: 'En tjeneste fra Norrvik kommune.',
    news: 'Nytt: åpningstider i høytiden',
    tools: 'Verktøy: standardlinje',
    toolsFilled: 'Verktøy: farget linje',
    toolsOwn: 'Verktøy: eget element',
    language: 'Språk',
    easyRead: 'Lettlest',
    contact: 'Kontakt oss',
  },
  nn: {
    intro: 'Ei teneste frå Norrvik kommune.',
    news: 'Nytt: opningstider i høgtida',
    tools: 'Verktøy: standardlinje',
    toolsFilled: 'Verktøy: farga linje',
    toolsOwn: 'Verktøy: eige element',
    language: 'Språk',
    easyRead: 'Lettlesen',
    contact: 'Kontakt oss',
  },
  fi: {
    intro: 'Norrvikin kunnan palvelu.',
    news: 'Uutista: aukioloajat juhlapyhinä',
    tools: 'Työkalut: oletuspalkki',
    toolsFilled: 'Työkalut: värillinen palkki',
    toolsOwn: 'Työkalut: oma elementti',
    language: 'Kieli',
    easyRead: 'Selkokieli',
    contact: 'Ota yhteyttä',
  },
})
