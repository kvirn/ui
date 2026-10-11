import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useScrollAreaTexts = defineExampleTexts({
  en: {
    feesLabel: 'Permit fees for 2026',
    headers: ['Permit', 'Category', 'Processing time', 'Fee', 'Appeal period'],
    rows: [
      ['Building permit', 'Housing', '10 weeks', '12,400 kr', '3 weeks'],
      ['Demolition permit', 'Housing', '6 weeks', '4,200 kr', '3 weeks'],
      ['Change of use', 'Commercial', '8 weeks', '9,800 kr', '3 weeks'],
      ['Sign permit', 'Commercial', '4 weeks', '1,900 kr', '3 weeks'],
      ['Outdoor serving', 'Hospitality', '5 weeks', '2,700 kr', '3 weeks'],
      ['Event permit', 'Culture', '3 weeks', '1,200 kr', '2 weeks'],
    ],
    shortText: 'Three fees, all shown at once: nothing here scrolls.',
  },
})
