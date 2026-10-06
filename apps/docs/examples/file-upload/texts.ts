import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useFileUploadTexts = defineExampleTexts({
  en: {
    label: 'Attachments',
    description: 'Attach your doctor’s certificate and your receipts.',
    send: 'Send',
    sent: 'Sent files',
    noFiles: 'none',
    errorMissing: 'Attach at least one file before you send the application.',
    nameWithSpaces: 'The file name can’t contain spaces. Rename the file and try again.',
    notAccepted: (name: string) =>
      `${name} was stopped by the security check. Remove the file and choose another.`,
    photoLabel: 'Photo for your pass',
    photoDescription: 'Use a recent photo of your face, without a hat or sunglasses.',
  },
  sv: {
    label: 'Bilagor',
    description: 'Bifoga ditt läkarintyg och dina kvitton.',
    send: 'Skicka',
    sent: 'Skickade filer',
    noFiles: 'inga',
    errorMissing: 'Bifoga minst en fil innan du skickar in ansökan.',
    nameWithSpaces: 'Filnamnet får inte innehålla mellanslag. Byt namn på filen och försök igen.',
    notAccepted: (name: string) =>
      `${name} stoppades av säkerhetskontrollen. Ta bort filen och välj en annan.`,
    photoLabel: 'Foto till ditt passerkort',
    photoDescription: 'Använd ett nytt foto på ditt ansikte, utan hatt eller solglasögon.',
  },
})
