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
  sv: {
    smsLabel: 'Kod från sms:et',
    smsHint:
      'Koden har 6 siffror. Du hittar den i sms:et som vi just skickade. Vi kontrollerar koden så fort du har skrivit alla 6 siffror.',
    emailLabel: 'Kod från e-postmeddelandet',
    emailHint:
      'Koden har 8 tecken, bokstäver och siffror, i 2 grupper om 4. Du hittar den i e-postmeddelandet som vi just skickade.',
    plainHint: 'Koden har 6 siffror. Du hittar den i sms:et som vi just skickade.',
    incomplete: 'Skriv alla 6 siffrorna i koden',
    wrong: 'Koden stämmer inte med den vi skickade. Kontrollera sms:et och skriv koden igen.',
    checking: 'Kontrollerar koden',
    submit: 'Fortsätt',
    entered: 'Du skrev:',
    withoutDash: 'Utan bindestreck:',
  },
})
