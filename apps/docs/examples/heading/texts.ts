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
})
