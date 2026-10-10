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
      alt: 'Map of parking zone B: the entrance is on the north side, next to the pay station.',
      caption: 'Parking zone B. Source: the City Planning Office.',
      description:
        'Zone B has 40 spaces. The entrance is on the north side, next to the pay station.',
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
    inset: {
      lead: 'Viktigt:',
      text: 'Ansök senast den 30 april. Ansökningar som kommer in senare kan vi inte behandla.',
    },
    steps: {
      heading: 'Så här går det till',
      items: [
        { title: 'Ansök i e-tjänsten', text: 'Det tar ungefär tio minuter.' },
        { title: 'Vi går igenom ansökan', text: 'Vi hör av oss om något saknas.' },
        { title: 'Du får ett beslut', text: 'Det kommer med post inom tio arbetsdagar.' },
        { title: 'Betala avgiften', text: 'Fakturan kommer tillsammans med beslutet.' },
      ],
    },
    figure: {
      alt: 'Karta över parkeringszon B: ingången ligger på norra sidan, intill betalautomaten.',
      caption: 'Parkeringszon B. Källa: stadsbyggnadskontoret.',
      description: 'Zon B har 40 platser. Ingången ligger på norra sidan, intill betalautomaten.',
    },
  },
})
