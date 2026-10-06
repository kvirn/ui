import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useHeadingTexts = defineExampleTexts({
  en: {
    contact: { heading: 'Contact us', text: 'We answer on weekdays 9–16.' },
    waste: {
      heading: 'Waste collection',
      text: 'Food waste and residual waste are collected every other week.',
    },
    opening: {
      heading: 'Opening hours',
      text: 'The recycling centre is open until 19:00 on weekdays.',
    },
    look: { levelOnly: 'Services', asLarger: 'Services, set larger' },
  },
  sv: {
    contact: { heading: 'Kontakta oss', text: 'Vi svarar vardagar 9–16.' },
    waste: {
      heading: 'Sophämtning',
      text: 'Matavfall och restavfall töms varannan vecka.',
    },
    opening: {
      heading: 'Öppettider',
      text: 'Återvinningscentralen har öppet till kl. 19 på vardagar.',
    },
    look: { levelOnly: 'Tjänster', asLarger: 'Tjänster, i större storlek' },
  },
})
