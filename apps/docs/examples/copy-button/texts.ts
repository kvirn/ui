import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface CopyButtonTexts {
  referenceNumber: string
  yourNumber: string
  copyNumber: string
  copiedCue: string
  failedCue: string
  caseNumber: string
  buildingPermit: string
  parkingPermit: string
  secondReferenceNumber: string
  thirdReferenceNumber: string
  yourCases: string
  copyAll: string
  sendApplication: string
  sent: string
  notYet: string
  copyNamed: (number: string) => string
}

export const useCopyButtonTexts = defineExampleTexts<CopyButtonTexts>({
  en: {
    referenceNumber: 'PK-2026-004217',
    yourNumber: 'Your case number is',
    copyNumber: 'Copy case number',
    copiedCue: 'The case number is copied.',
    failedCue: 'Could not copy. Select the case number and copy it yourself.',
    caseNumber: 'case number',
    buildingPermit: 'Building permit',
    parkingPermit: 'Parking permit',
    secondReferenceNumber: 'PK-2026-004218',
    thirdReferenceNumber: 'PK-2026-004219',
    yourCases: 'Your open cases:',
    copyAll: 'Copy all case numbers',
    sendApplication: 'Send the application',
    sent: 'Your application is sent.',
    notYet: 'You get a case number when you send the application.',
    copyNamed: (number) => `Copy case number ${number}`,
  },
})
