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
      cardText: 'Tuesday at Storgatan 12.',
    },
    navigation: {
      heading: 'Your cases',
      overview: 'Overview',
      open: 'Open cases',
      closed: 'Closed cases',
    },
  },
  sv: {
    contact: {
      heading: 'Kontakta oss',
      text: 'Vi svarar vardagar 9–16.',
      link: 'Mejla kundcenter',
    },
    news: {
      heading: 'Nyheter',
      text: 'Öppettiderna på återvinningscentralen ändras den 1 november.',
    },
    band: {
      heading: 'Sophämtning',
      text: 'Matavfall och restavfall töms varannan vecka.',
      cardHeading: 'Din nästa tömning',
      cardText: 'Tisdag vid Storgatan 12.',
    },
    navigation: {
      heading: 'Dina ärenden',
      overview: 'Översikt',
      open: 'Pågående ärenden',
      closed: 'Avslutade ärenden',
    },
  },
})
