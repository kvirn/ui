import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useGridTexts = defineExampleTexts({
  en: {
    service: {
      navigationLabel: 'In this section',
      links: ['Apply for a place', 'Fees and invoices', 'Term dates', 'Contact the preschool'],
      current: 'Apply for a place',
      heading: 'Apply for a place at a preschool',
      text: 'You can apply from the year your child turns one. Apply at least four months before you need the place.',
    },
    contact: {
      heading: 'Contact',
      text: 'Customer service: 0123-45 67 89, weekdays 08:00–16:00.',
      article: 'Housing adaptation grant',
      articleText:
        'You can get a grant if you need to adapt your home because of a disability. Apply before the work starts.',
    },
    services: {
      waste: { title: 'Waste and recycling', text: 'Collection days and recycling centres.' },
      school: { title: 'Schools and childcare', text: 'Apply for a place and see term dates.' },
      housing: { title: 'Housing and building', text: 'Permits, adaptations and grants.' },
    },
    quickLinks: {
      pay: 'Pay an invoice',
      report: 'Report a fault',
      book: 'Book a time',
      contact: 'Contact us',
      opening: 'Opening hours',
      news: 'News',
    },
    layout: {
      main: {
        title: 'Apply for a preschool place',
        text: 'You can apply from the year your child turns one. Apply at least four months before you need the place.',
      },
      contact: {
        title: 'Contact',
        text: 'Preschool administration, 08:00 to 16:00 on weekdays.',
      },
    },
  },
})
