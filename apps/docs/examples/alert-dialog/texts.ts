import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useAlertDialogTexts = defineExampleTexts({
  en: {
    deleteDraft: 'Delete the draft',
    deleteTitle: 'Delete the draft application?',
    deleteDescription: 'You can’t undo this. Your answers will be deleted.',
    deleteConfirm: 'Delete draft',
    deleteKeep: 'Keep draft',
    deleted: 'The draft was deleted.',
    showTimeout: 'Show the timeout warning',
    timeoutTitle: 'Do you want to stay signed in?',
    timeoutDescription: (time: string) =>
      `For your security, we will sign you out at ${time}. Your answers are saved.`,
    timeoutRemaining: (minutes: number) =>
      minutes === 1 ? '1 minute left.' : `${minutes} minutes left.`,
    timeoutStay: 'Stay signed in',
    timeoutSignOut: 'Sign out',
    signedOut: 'You were signed out.',
    stayed: 'You are still signed in.',
    deleteCases: 'Delete the chosen cases',
    casesTitle: 'Delete 3 cases?',
    casesDescription: 'You can’t undo this. The cases and the notes on them will be deleted.',
    casesConfirm: 'Delete 3 cases',
    casesKeep: 'Keep the cases',
    casesDeleted: '3 cases were deleted.',
    caseNumbers: ['2026-0142', '2026-0155', '2026-0161'],
  },
})
