import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  hint: 'Press Tab inside the example to see the panel. Use the Up and Down arrow keys to move through it, Tab to leave it, and Enter on a link to jump.',
  hintShortcuts:
    'Press Tab inside the example to see the panel. Or press Alt+Shift+S (Option+Shift+S on a Mac) anywhere on this page to search, and Alt+Shift+M for My cases.',
  hintReopen:
    'Press Tab inside the example to see the panel, then Tab through the cases. Press Alt+Shift+K (Option+Shift+K on a Mac) to open the list again, and Escape to go back to the case you were on.',
  hintTurnOff:
    'Press Tab inside the example to see the panel. Turn the switch off and press Tab again: the panel now says Quick links and shows no keys. Alt+Shift+B (Option+Shift+B on a Mac) does nothing then.',
  navigationLabel: 'Site navigation',
  header: 'Site header with a logo, a menu and a language switcher',
  navigation: 'The site navigation is here.',
  main: 'The main content starts here.',
  searchLabel: 'Search',
  searchFieldLabel: 'Search the site',
  searchExample: 'for example, parking permit',
  myCasesLabel: 'My cases',
  myCases: 'Your open cases are listed here.',
  keyboardHelpLabel: 'Keyboard help',
  keyboardHelp: 'The keyboard section of the accessibility statement is here.',
  casesHeading: 'Open cases',
  case1: 'Parking permit: waiting for your documents',
  case2: 'Building notice: being processed',
  case3: 'School place: decision sent',
  case4: 'Waste collection: change confirmed',
  bookLabel: 'Book a time',
  bookDone: 'The booking form opens here.',
  useShortcuts: 'Use keyboard shortcuts',
  switchHelp: 'Turn this off if the keys clash with your assistive technology or browser.',
}

export const useSkipPanelTexts = defineExampleTexts({ en })
