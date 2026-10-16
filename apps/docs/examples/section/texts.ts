import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useSectionTexts = defineExampleTexts({
  en: {
    contact: {
      heading: 'Contact us',
      text: 'We answer on weekdays 9–16.',
      link: 'Email customer service',
    },
    news: {
      heading: 'News',
      text: 'Opening hours at the recycling centre change on 1 November.',
    },
    band: {
      heading: 'Waste collection',
      text: 'Food waste and residual waste are collected every other week.',
      cardHeading: 'Your next collection',
      cardText: 'Tuesday at Main Street 12.',
    },
    guide: {
      eligibility: {
        heading: 'Who can apply',
        text: 'You live in the permit zone and your car is registered at your address.',
      },
      documents: {
        heading: 'What you need',
        text: 'Your registration number and a photo of the vehicle registration certificate.',
      },
      cost: {
        heading: 'What it costs',
        text: 'The permit costs 400 kronor a year. You pay when you apply.',
      },
    },
    navigation: {
      heading: 'Your cases',
      overview: 'Overview',
      open: 'Open cases',
      closed: 'Closed cases',
    },
  },
})

// Swedish text for the notice in another language. It is not in the page's own texts: the
// provider that sets the language decides which words are shown.
export const swedishNotice = {
  // kv-lang-ok: the notice is in Swedish on purpose, to show a page part in another language (3.1.2)
  heading: 'Snöröjning',
  // kv-lang-ok: the notice is in Swedish on purpose, to show a page part in another language (3.1.2)
  text: 'Vi plogar gator och cykelvägar när det har fallit mer än fem centimeter snö.',
}
