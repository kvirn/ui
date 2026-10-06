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
  sv: {
    services: {
      waste: { title: 'Avfall och återvinning', text: 'Hämtningsdagar och återvinningscentraler.' },
      school: { title: 'Skola och barnomsorg', text: 'Ansök om plats och se terminstider.' },
      housing: { title: 'Bostad och byggande', text: 'Bygglov, anpassning och bidrag.' },
    },
    quickLinks: {
      pay: 'Betala en faktura',
      report: 'Felanmälan',
      book: 'Boka tid',
      contact: 'Kontakta oss',
      opening: 'Öppettider',
      news: 'Nyheter',
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
    },
  },
})
