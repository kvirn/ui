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
})
