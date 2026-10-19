import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useTableTexts = defineExampleTexts({
  en: {
    paymentsCaption: 'Housing allowance paid in 2026',
    month: 'Month',
    payoutDate: 'Payout date',
    amountPaid: 'Amount (SEK)',
    total: 'Total',
    january: 'January',
    february: 'February',
    march: 'March',
    casesCaption: 'Open cases',
    name: 'Name',
    caseNumber: 'Case number',
    amount: 'Amount (SEK)',
    handler: 'Handler',
    handlerLabel: 'Handler',
    decisionLabel: 'Decision',
    decisions: {
      approved: 'Approved',
      moreInformation: 'More information needed',
      inProgress: 'In progress',
    },
    emptyCases: 'You have no open cases. New applications show up here when you send them.',
    allCases: 'All cases',
    searchCases: 'Search cases',
    noMatchingCases:
      'No case matches your search. Check the spelling, or search for a case number.',
  },
})
