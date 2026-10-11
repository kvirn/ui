import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useFieldTexts = defineExampleTexts({
  en: {
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    search: 'Search the register',
    send: 'Send application',
    emailDescription: 'We send the decision to this address, so check it before you send.',
    emailHelpText: 'For example name@example.com',
    emailError: 'Enter your email address, for example name@example.com.',
    lockedName: 'Name on the application',
    lockedHelpText: 'You can’t change this here. Contact your case worker to correct it.',
    contactMethod: 'How should we contact you?',
    contactByEmail: 'By email',
    contactByPhone: 'By phone',
    contactHelpText: 'We only use it to tell you about your case.',
  },
})
