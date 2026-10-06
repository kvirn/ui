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
  sv: {
    service: {
      heading: 'Sophämtning vid Storgatan 12',
      text: 'Matavfall och restavfall töms varannan vecka.',
      orderExtra: 'Beställ extra tömning',
      pause: 'Pausa hämtningen',
    },
    news: {
      recycling: {
        title: 'Nya öppettider på återvinningscentralen',
        excerpt: 'Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar.',
      },
      snow: {
        title: 'Vinterväghållning: så plogar vi',
        excerpt: 'Vi plogar huvudgator och busslinjer först, sedan bostadsgator.',
      },
      grants: {
        title: 'Ansök om föreningsbidrag senast 1 december',
        excerpt: 'Idrotts- och kulturföreningar kan söka bidrag för nästa år.',
      },
    },
    article: {
      title: 'Nya öppettider på återvinningscentralen',
      text: 'Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar. På lördagar stänger den kl. 15.',
    },
    dividers: {
      heading: 'Bostadsanpassningsbidrag',
      text: 'Väntar på beslut.',
      next: 'Senaste händelse: arbetsterapeutens intyg har kommit in.',
      open: 'Öppna ärendet',
    },
  },
})
