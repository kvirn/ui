import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  toStart: 'To the start page',
  toServices: 'To services',
  toDetails: 'Jump to the details',
  start: { title: 'Welcome', body: 'This is the start page.' },
  services: { title: 'Our services', body: 'This is the services page.' },
  details: 'Details further down the page',
}

const sv: typeof en = {
  toStart: 'Till startsidan',
  toServices: 'Till tjänster',
  toDetails: 'Hoppa till detaljerna',
  start: { title: 'Välkommen', body: 'Det här är startsidan.' },
  services: { title: 'Våra tjänster', body: 'Det här är sidan om tjänsterna.' },
  details: 'Detaljer längre ner på sidan',
}

export const useRouteFocusTexts = defineExampleTexts({ en, sv })
