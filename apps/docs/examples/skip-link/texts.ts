import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  hint: 'Press Tab once to show the link, then Enter to jump.',
  header: 'Site header with a menu and a search field',
  main: 'The main content starts here.',
  customLabel: 'Skip to the application form',
  form: 'The application form starts here.',
  ownElement: 'The page content starts here.',
}

const sv: typeof en = {
  hint: 'Tryck på Tab en gång för att visa länken, sedan Enter för att hoppa.',
  header: 'Sidhuvud med meny och sökfält',
  main: 'Huvudinnehållet börjar här.',
  customLabel: 'Hoppa till ansökningsformuläret',
  form: 'Ansökningsformuläret börjar här.',
  ownElement: 'Sidans innehåll börjar här.',
}

export const useSkipLinkTexts = defineExampleTexts({ en, sv })
