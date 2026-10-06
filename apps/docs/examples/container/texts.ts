import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface ContainerTexts {
  page: { title: string; text: string }
  reading: { title: string; intro: string; items: readonly string[] }
  form: { title: string; label: string; send: string }
  main: { title: string; text: string }
  region: { title: string; text: string }
}

export const useContainerTexts = defineExampleTexts<ContainerTexts>({
  en: {
    page: { title: 'Kvirnby municipality', text: 'The content stays inside the page width.' },
    reading: {
      title: 'Waste collection',
      intro: 'Bins are emptied every second week. Put the bin out by 7:00 on the day.',
      items: ['Household waste', 'Food waste', 'Paper packaging'],
    },
    form: { title: 'Report a move', label: 'New address', send: 'Send report' },
    main: { title: 'Welcome to Kvirnby', text: 'Find services, news and contact details.' },
    region: { title: 'News', text: 'The library opens an hour earlier on weekdays.' },
  },
  sv: {
    page: { title: 'Kvirnby kommun', text: 'Innehållet håller sig inom sidans bredd.' },
    reading: {
      title: 'Sophämtning',
      intro: 'Kärlen töms varannan vecka. Ställ ut kärlet senast klockan 7.00 på tömningsdagen.',
      items: ['Hushållsavfall', 'Matavfall', 'Pappersförpackningar'],
    },
    form: { title: 'Anmäl flytt', label: 'Ny adress', send: 'Skicka anmälan' },
    main: { title: 'Välkommen till Kvirnby', text: 'Hitta service, nyheter och kontaktuppgifter.' },
    region: { title: 'Aktuellt', text: 'Biblioteket öppnar en timme tidigare på vardagar.' },
  },
})
