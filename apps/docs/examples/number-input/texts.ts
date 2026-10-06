import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useNumberInputTexts = defineExampleTexts({
  en: {
    children: 'Number of children under 18',
    childrenHint: 'Enter a whole number from 0 to 12.',
    rent: 'Monthly rent',
    rentHint: (example: string) =>
      `Enter the amount without a currency sign, for example ${example}.`,
    valueToSend: 'The value your form sends',
    rentInCrowns: 'Monthly rent in kronor',
    unit: 'kr',
    balance: 'Account balance',
    balanceHint: 'Use a minus sign for a negative balance, for example -8450.',
    pasted: 'Amount from your spreadsheet',
    pastedHint: 'Paste or type the amount as it is. We read it when you send the form.',
    errorRange: 'Enter a number from 0 to 12',
    send: 'Send',
  },
  sv: {
    children: 'Antal barn under 18 år',
    childrenHint: 'Skriv ett heltal från 0 till 12.',
    rent: 'Månadshyra',
    rentHint: (example: string) => `Skriv beloppet utan valutatecken, till exempel ${example}.`,
    valueToSend: 'Värdet som ditt formulär skickar',
    rentInCrowns: 'Månadshyra i kronor',
    unit: 'kr',
    balance: 'Kontosaldo',
    balanceHint: 'Använd minustecken för ett negativt saldo, till exempel -8450.',
    pasted: 'Belopp från ditt kalkylblad',
    pastedHint:
      'Klistra in eller skriv beloppet som det är. Vi läser det när du skickar formuläret.',
    errorRange: 'Skriv ett tal från 0 till 12',
    send: 'Skicka',
  },
})

/** A number written the way the page's language writes it, for a help text's example. */
export const exampleAmount = (locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(1250.5)
