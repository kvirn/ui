import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useSidebarLayoutTexts = defineExampleTexts({
  en: {
    side: 'Side column',
    content: 'The content column. Its text is read after the side column.',
    service: {
      navigationLabel: 'In this section',
      links: ['Apply for a place', 'Fees and invoices', 'Term dates', 'Contact the preschool'],
      current: 'Apply for a place',
      heading: 'Apply for a place at a preschool',
      text: 'You can apply from the day your child is four months old. Apply at least four months before you need the place.',
    },
    contact: {
      heading: 'Contact',
      text: 'Customer service: 0123-45 67 89, weekdays 08:00–16:00.',
      article: 'Housing adaptation grant',
      articleText:
        'You can get a grant if you need to adapt your home because of a disability. Apply before the work starts.',
    },
  },
})
