import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useToggleTexts = defineExampleTexts({
  en: {
    unreadOnly: 'Show only unread',
    messages: [
      { id: 'parking', text: 'Parking permit approved', isUnread: false },
      { id: 'building', text: 'Building permit: more information needed', isUnread: true },
      { id: 'received', text: 'Application received', isUnread: false },
      { id: 'invoice', text: 'Invoice ready', isUnread: true },
    ],
    showPassword: 'Show password',
    passwordLabel: 'Password',
    noMessages: 'There are no messages yet.',
  },
  sv: {
    unreadOnly: 'Visa bara olästa',
    messages: [
      { id: 'parking', text: 'Parkeringstillstånd beviljat', isUnread: false },
      { id: 'building', text: 'Bygglov: mer information behövs', isUnread: true },
      { id: 'received', text: 'Ansökan mottagen', isUnread: false },
      { id: 'invoice', text: 'Faktura finns', isUnread: true },
    ],
    showPassword: 'Visa lösenord',
    passwordLabel: 'Lösenord',
    noMessages: 'Det finns inga meddelanden ännu.',
  },
})
