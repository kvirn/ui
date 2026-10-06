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
  sv: {
    deleteDraft: 'Ta bort utkastet',
    deleteTitle: 'Vill du ta bort utkastet till ansökan?',
    deleteDescription: 'Det går inte att ångra. Dina svar tas bort.',
    deleteConfirm: 'Ta bort utkastet',
    deleteKeep: 'Behåll utkastet',
    deleted: 'Utkastet har tagits bort.',
    showTimeout: 'Visa varningen om tidsgräns',
    timeoutTitle: 'Vill du fortsätta vara inloggad?',
    timeoutDescription: 'Av säkerhetsskäl loggar vi ut dig om 2 minuter. Dina svar är sparade.',
    timeoutStay: 'Fortsätt vara inloggad',
    timeoutSignOut: 'Logga ut',
    signedOut: 'Du har loggats ut.',
  },
})
