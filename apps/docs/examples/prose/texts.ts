import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface ProseTexts {
  contact: { heading: string; text: string; hours: string; link: string }
  article: { lead: string; heading: string; intro: string; items: readonly string[] }
  large: { heading: string; text: string }
  field: { label: string; description: string }
  own: { heading: string; text: string }
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
  },
  sv: {
    contact: {
      heading: 'Kontakta oss',
      text: 'Vi svarar vardagar klockan 9–16.',
      hours: 'Du kan också',
      link: 'läsa våra öppettider',
    },
    article: {
      lead: 'Det här behöver du för att ansöka om parkeringstillstånd.',
      heading: 'Innan du ansöker',
      intro: 'Ha dessa uppgifter redo:',
      items: ['Ditt registreringsnummer', 'Ditt personnummer', 'En giltig e-postadress'],
    },
    large: {
      heading: 'Vi har tagit emot din ansökan',
      text: 'Vi svarar inom tio arbetsdagar. Spara ärendenumret från bekräftelsemejlet.',
    },
    field: {
      label: 'Registreringsnummer',
      description: 'Du hittar det i registreringsbeviset, i rutan som är märkt A.',
    },
    own: {
      heading: 'Handläggningstider',
      text: 'De flesta ansökningar får beslut inom tio arbetsdagar.',
    },
  },
})
