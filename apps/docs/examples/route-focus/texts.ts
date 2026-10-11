import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  toStart: 'To the start page',
  toServices: 'To services',
  toDetails: 'Jump to the details',
  start: { title: 'Welcome', body: 'This is the start page.' },
  services: { title: 'Our services', body: 'This is the services page.' },
  details: 'Details further down the page',
}

export const useRouteFocusTexts = defineExampleTexts({ en })
