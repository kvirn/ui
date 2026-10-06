import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface StackTexts {
  sections: { contact: string; contactText: string; hours: string; hoursText: string }
  gaps: { related: readonly string[]; label: string }
  list: { label: string; items: readonly string[] }
  form: { title: string; name: string; email: string; send: string }
}

export const useStackTexts = defineExampleTexts<StackTexts>({
  en: {
    sections: {
      contact: 'Contact us',
      contactText: 'Call the service number or write to us.',
      hours: 'Opening hours',
      hoursText: 'We answer on weekdays from 9 to 16.',
    },
    gaps: {
      label: 'Gap',
      related: ['Visiting address', 'Kvirnvägen 1', 'Kvirnby'],
    },
    list: {
      label: 'Services',
      items: ['Pay a parking fine', 'Book a recycling visit', 'Apply for a building permit'],
    },
    form: { title: 'Send feedback', name: 'Name', email: 'Email', send: 'Send' },
  },
  sv: {
    sections: {
      contact: 'Kontakta oss',
      contactText: 'Ring servicenumret eller skriv till oss.',
      hours: 'Öppettider',
      hoursText: 'Vi svarar vardagar 9–16.',
    },
    gaps: {
      label: 'Avstånd',
      related: ['Besöksadress', 'Kvirnvägen 1', 'Kvirnby'],
    },
    list: {
      label: 'Tjänster',
      items: ['Betala parkeringsavgift', 'Boka återvinningsbesök', 'Ansök om bygglov'],
    },
    form: { title: 'Lämna synpunkter', name: 'Namn', email: 'E-post', send: 'Skicka' },
  },
})
