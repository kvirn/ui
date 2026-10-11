import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface CodeBlockTexts {
  installLabel: string
  requestLabel: string
  copyCommand: string
}

export const useCodeBlockTexts = defineExampleTexts<CodeBlockTexts>({
  en: { installLabel: 'Install', requestLabel: 'Send an application', copyCommand: 'Copy command' },
})
