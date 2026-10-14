import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  messages: 'Messages',
  messageCount: '3',
  unreadHidden: ' unread',
  hint: 'A screen reader also reads the hidden text. Nobody sees it.',
  remove: 'Remove',
  savedSearch: 'Saved search: housing allowance',
  removeSavedSearch: ' saved search “housing allowance”',
  address: 'Address: Storgatan 1',
  removeAddress: ' address “Storgatan 1”',
  contactHeading: 'Contact the library',
  contactText: 'Phone 0123-45 67 89, weekdays 9 to 16',
  approvedHidden: 'Approved: ',
  application: 'Application 4821',
  decisionHeader: 'Decision',
  dateHeader: 'Decided on',
  actionsHeader: 'Actions',
  download: 'Download',
  decisions: [
    { id: 'parking', title: 'Parking permit 2026-0412', date: '3 March 2026' },
    { id: 'building', title: 'Building permit 2026-0198', date: '21 January 2026' },
  ],
  footerHeading: 'Service information',
  accessibilityStatement: 'Accessibility statement',
  privacy: 'How we handle personal data',
}

export const useVisuallyHiddenTexts = defineExampleTexts({ en })
