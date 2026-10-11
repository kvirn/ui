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
    timeoutDescription:
      'For your security, we will sign you out in 2 minutes. Your answers are saved.',
    timeoutStay: 'Stay signed in',
    timeoutSignOut: 'Sign out',
    signedOut: 'You were signed out.',
  },
})
