import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useToggleTexts = defineExampleTexts({
  en: {
    unreadOnly: 'Show only unread',
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} messages`,
    messages: [
      { id: 'parking', text: 'Parking permit approved', isUnread: false },
      { id: 'building', text: 'Building permit: more information needed', isUnread: true },
      { id: 'received', text: 'Application received', isUnread: false },
      { id: 'invoice', text: 'Invoice ready', isUnread: true },
    ],
    showPassword: 'Show password',
    passwordLabel: 'Password',
    noMessages: 'There are no messages to filter yet.',
    compare: 'Compare',
    compareLimit: 3,
    preschools: [
      { id: 'birch', name: 'Birch Tree Preschool' },
      { id: 'harbour', name: 'Harbour Preschool' },
      { id: 'meadow', name: 'Meadow Preschool' },
      { id: 'hill', name: 'Hill Preschool' },
    ],
    comparing: (chosen: number, limit: number) => `Comparing ${chosen} of ${limit} preschools`,
    limitReached: (limit: number) =>
      `You can compare up to ${limit} preschools. Turn one off to add another.`,
    easyToRead: 'Show the easy-to-read version',
    decisionText:
      'Application 2026-0412 is approved in accordance with the municipal parking regulations. The permit is valid for the registered vehicle for twelve months from the date of the decision.',
    easyToReadText:
      'Your parking permit is approved. You can park your car in the permit area for 12 months.',
  },
})
