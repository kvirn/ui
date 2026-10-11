import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useCardTexts = defineExampleTexts({
  en: {
    service: {
      heading: 'Waste collection at Storgatan 12',
      text: 'Food waste and residual waste are collected every other week.',
      orderExtra: 'Order an extra collection',
      pause: 'Pause collection',
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
      grants: {
        title: 'Apply for association grants by 1 December',
        excerpt: 'Sports and culture associations can apply for grants for next year.',
      },
    },
    article: {
      title: 'New opening hours at the recycling centre',
      text: 'From 1 November the recycling centre is open until 19:00 on weekdays. On Saturdays it closes at 15:00.',
    },
    dividers: {
      heading: 'Housing adaptation grant',
      text: 'Waiting for a decision.',
      next: 'Latest event: the occupational therapist’s certificate arrived.',
      open: 'Open the case',
    },
  },
})
