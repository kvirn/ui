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
})

/** A number written the way the page's language writes it, for a help text's example. */
export const exampleAmount = (locale: string) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(1250.5)
