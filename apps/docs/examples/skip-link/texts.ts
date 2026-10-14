import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  hint: 'Press Tab until the link appears here, then Enter to jump.',
  hintTwo: 'Press Tab to show the first link, and Tab again to show the second.',
  header: 'Site header with a menu and a search field',
  main: 'The main content starts here.',
  customLabel: 'Skip to the application form',
  searchLabel: 'Skip to search',
  search: 'The search field is here.',
  form: 'The application form starts here.',
  ownElement: 'The page content starts here.',
  designSystem: 'The main content starts here.',
}

export const useSkipLinkTexts = defineExampleTexts({ en })
