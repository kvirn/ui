import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface CopyButtonTexts {
  referenceNumber: string
  yourNumber: string
  copyNumber: string
  copiedCue: string
  ownCue: string
}

export const useCopyButtonTexts = defineExampleTexts<CopyButtonTexts>({
  en: {
    referenceNumber: 'PK-2026-004217',
    yourNumber: 'Your case number is',
    copyNumber: 'Copy case number',
    copiedCue: 'The case number is copied.',
    ownCue: 'Copy case number',
  },
  sv: {
    referenceNumber: 'PK-2026-004217',
    yourNumber: 'Ditt ärendenummer är',
    copyNumber: 'Kopiera ärendenumret',
    copiedCue: 'Ärendenumret är kopierat.',
    ownCue: 'Kopiera ärendenumret',
  },
})
