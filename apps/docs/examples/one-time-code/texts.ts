import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useOneTimeCodeTexts = defineExampleTexts({
  en: {
    smsLabel: 'Code from the text message',
    smsHint:
      'The code has 6 digits. You find it in the text message we just sent you. We check it as soon as you have entered all 6 digits.',
    emailLabel: 'Code from the email',
    emailHint:
      'The code has 8 letters and digits in 2 groups of 4. You find it in the email we just sent you.',
    plainHint: 'The code has 6 digits. You find it in the text message we just sent you.',
    incomplete: 'Enter all 6 digits of the code',
    wrong:
      'The code doesn’t match the one we sent. Check the text message and enter the code again.',
    checking: 'Checking the code',
    submit: 'Continue',
    entered: 'You entered:',
    withoutDash: 'Without the dash:',
  },
})
