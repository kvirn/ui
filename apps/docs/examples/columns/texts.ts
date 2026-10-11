import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useColumnsTexts = defineExampleTexts({
  en: {
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
    news: {
      recycling: {
        title: 'New opening hours at the recycling centre',
        excerpt: 'From 1 November the recycling centre is open until 19:00 on weekdays.',
      },
      snow: {
        title: 'Winter road maintenance: how we clear snow',
        excerpt: 'We clear main roads and bus routes first, then residential streets.',
      },
    },
  },
})
