import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useSwitchTexts = defineExampleTexts({
  en: {
    smsReminders: 'Text message reminders',
    smsRemindersHint: 'We send a text message the day before your appointment.',
    savedAtOnce: 'Changes are saved straight away.',
    savedOn: 'Text message reminders are on and saved.',
    savedOff: 'Text message reminders are off and saved.',
    send: 'Send in',
    sent: 'Sent:',
    notChosen: 'off',
  },
  sv: {
    smsReminders: 'Påminnelser via sms',
    smsRemindersHint: 'Vi skickar ett sms dagen före din tid.',
    savedAtOnce: 'Ändringar sparas direkt.',
    savedOn: 'Påminnelser via sms är på och sparade.',
    savedOff: 'Påminnelser via sms är av och sparade.',
    send: 'Skicka in',
    sent: 'Skickat:',
    notChosen: 'av',
  },
})
