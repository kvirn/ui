import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface CodeBlockTexts {
  installLabel: string
  requestLabel: string
  statusLabel: string
  copyCommand: string
  copyRequest: string
  installCopied: string
  installFailed: string
  requestCopied: string
  requestFailed: string
}

export const useCodeBlockTexts = defineExampleTexts<CodeBlockTexts>({
  en: {
    installLabel: 'Install',
    requestLabel: 'Send an application',
    statusLabel: 'Check that the service is running',
    copyCommand: 'Copy command',
    copyRequest: 'Copy request',
    installCopied: 'The install command is copied.',
    installFailed: 'Could not copy the install command. Select it and copy it yourself.',
    requestCopied: 'The request is copied.',
    requestFailed: 'Could not copy the request. Select it and copy it yourself.',
  },
})
