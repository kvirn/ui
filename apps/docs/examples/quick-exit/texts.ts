import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  destination: 'https://www.smhi.se',
  endpoint: '/api/quick-exit',
  wouldLeave: 'On your site, the visitor would now go to:',
  tryShortcut: 'Try the Shift shortcut in this example',
  tryShortcutHelp:
    'Off to start with, so this page stays quiet for people who use a screen reader. When it is on, press Shift three times, anywhere on the page.',
  tabOrder: 'Press Tab. The first stop is the skip link, the second is the exit link.',
  skipLabel: 'Skip to the content',
  header: 'Header of the municipality’s support service',
  supportHeading: 'Help if someone close to you hurts or frightens you',
  supportText: 'This page explains who can help you and how to make a report.',
  signedIn: 'Signed in as Alex Berg',
  reportHeading: 'Your report',
  reportText: 'Your report is saved as a draft. You can finish it later.',
  healthHeading: 'Your test results',
  healthText: 'Your latest test results are ready to read.',
  ownMarkup: 'This link is your own <a> element, with the behaviour from the hook.',
}

export const useQuickExitTexts = defineExampleTexts({ en })
