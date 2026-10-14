import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useOneTimeCodeTexts = defineExampleTexts({
  en: {
    smsLabel: 'Code from the text message',
    smsHint:
      'We sent you a text message to confirm your mobile number. The code has 6 digits. We check it as soon as you have entered all 6 digits.',
    emailLabel: 'Code from the email',
    emailHint:
      'You are signing in without BankID, so we sent a code to your email. The code has 8 letters and digits in 2 groups of 4. It never contains 0, O, 1 or I.',
    plainHint: 'We sent you a text message to confirm your mobile number. The code has 6 digits.',
    incomplete: 'Enter all 6 digits of the code',
    wrong:
      'The code doesn’t match the one we sent. Check the text message and enter the code again.',
    checking: 'Checking the code',
    submit: 'Continue',
    validHint:
      'We sent you a text message to confirm your mobile number. The code has 6 digits and works for 10 minutes. If it does not arrive, send a new one.',
    sendNew: 'Send a new code',
    newCodeSent: 'We sent you a new code. Use the newest text message.',
    onlyDigits: 'Only digits fit in the code.',
    entered: 'You entered:',
    withoutDash: 'Without the dash:',
  },
})
