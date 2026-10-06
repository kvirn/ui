import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useLocalesTexts = defineExampleTexts({
  en: {
    amount: 'Fee',
    date: 'Decision date',
    list: 'Documents',
    documents: ['passport', 'invoice', 'certificate'],
    newTab: 'Read the decision',
    newTabNotice: '(external service, new tab)',
  },
  sv: {
    amount: 'Avgift',
    date: 'Beslutsdatum',
    list: 'Handlingar',
    documents: ['pass', 'faktura', 'intyg'],
    newTab: 'Läs beslutet',
    newTabNotice: '(extern tjänst, ny flik)',
  },
})
