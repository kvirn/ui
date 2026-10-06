import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useCheckboxTexts = defineExampleTexts({
  en: {
    declaration: 'I confirm that the information is correct',
    declarationError: 'Confirm that the information is correct',
    send: 'Send application',
    newsletter: 'Send me news about the service',
    newsletterHint: 'We send at most one message a month. You can unsubscribe in every message.',
    selectAll: 'Select all rows',
    rowOne: 'Case 2026-0411',
    rowTwo: 'Case 2026-0412',
    rowThree: 'Case 2026-0413',
    sent: 'Sent:',
    notChosen: 'not chosen',
  },
  sv: {
    declaration: 'Jag intygar att uppgifterna är korrekta',
    declarationError: 'Bekräfta att uppgifterna är korrekta',
    send: 'Skicka ansökan',
    newsletter: 'Skicka nyheter om tjänsten till mig',
    newsletterHint: 'Vi skickar högst ett meddelande i månaden. Du kan avsluta i varje meddelande.',
    selectAll: 'Markera alla rader',
    rowOne: 'Ärende 2026-0411',
    rowTwo: 'Ärende 2026-0412',
    rowThree: 'Ärende 2026-0413',
    sent: 'Skickat:',
    notChosen: 'inte valt',
  },
})
