import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface ProseTexts {
  contact: { heading: string; text: string; hours: string; link: string }
  article: { lead: string; heading: string; intro: string; items: readonly string[] }
  large: { heading: string; text: string }
  field: { label: string; description: string }
  own: { heading: string; text: string }
  inset: { lead: string; text: string }
  steps: { heading: string; items: readonly { title: string; text: string }[] }
  figure: { alt: string; caption: string; description: string }
}

export const useProseTexts = defineExampleTexts<ProseTexts>({
  en: {
    contact: {
      heading: 'Contact us',
      text: 'We answer on weekdays from 9 to 16.',
      hours: 'You can also',
      link: 'read the opening hours',
    },
    article: {
      lead: 'What you need to apply for a parking permit.',
      heading: 'Before you apply',
      intro: 'Have these ready:',
      items: ['Your registration number', 'Your personal identity number', 'A valid email address'],
    },
    large: {
      heading: 'Your application is received',
      text: 'We reply within ten working days. Keep the case number from the confirmation email.',
    },
    field: {
      label: 'Registration number',
      description: 'You find it in the registration certificate, in the box marked A.',
    },
    own: {
      heading: 'Processing times',
      text: 'Most applications are decided within ten working days.',
    },
    inset: {
      lead: 'Important:',
      text: 'Apply by 30 April. We can’t process applications that arrive later.',
    },
    steps: {
      heading: 'How it works',
      items: [
        { title: 'Apply in the e-service', text: 'It takes about ten minutes.' },
        { title: 'We check your application', text: 'We contact you if something is missing.' },
        { title: 'You get a decision', text: 'It arrives by post within ten working days.' },
        { title: 'Pay the fee', text: 'The invoice comes with the decision.' },
      ],
    },
    figure: {
      alt: 'Map of the zone with the entrance marked on its north side.',
      caption: 'Parking zone B. Source: the City Planning Office.',
      description:
        'Zone B has 40 spaces. The entrance is on the north side, next to the pay station.',
    },
  },
})
