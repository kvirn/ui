import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  hint: 'A screen reader also reads the hidden text. Nobody sees it.',
  unread: 'Unread messages: 3',
  unreadHidden: ', 1 needs an answer',
  remove: 'Remove',
  removeSavedSearch: ' saved search “housing allowance”',
  removeAddress: ' address “Storgatan 1”',
  openingHours: 'Opening hours',
  openingHoursText: 'Monday to Friday, 9 to 16',
  approvedHidden: 'Approved: ',
  application: 'Application 4821',
}

export const useVisuallyHiddenTexts = defineExampleTexts({ en })
