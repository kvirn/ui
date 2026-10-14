import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  toStart: 'To the start page',
  toServices: 'To services',
  toDetails: 'Jump to the details',
  start: { title: 'Welcome', body: 'This is the start page.' },
  services: { title: 'Our services', body: 'This is the services page.' },
  details: 'Details further down the page',
  search: {
    title: 'Search our services',
    label: 'What are you looking for?',
    address: 'The address is now',
  },
  saidAloud: 'A screen reader says:',
  navigated: (title: string) => `You are now on ${title}.`,
}

export const useRouteFocusTexts = defineExampleTexts({ en })
