import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface AlertTexts {
  permit: { title: string; body: string; renew: string }
  sample: { title: string }
  failed: { title: string; body: string; retry: string; contact: string }
  saved: { title: string; save: string }
  dismissible: { heading: string; title: string; body: string; showAgain: string }
}

export const useAlertTexts = defineExampleTexts<AlertTexts>({
  en: {
    permit: {
      title: 'Your parking permit expires on 12 November 2026',
      body: 'Renew it by 5 November, or you may get a parking fine.',
      renew: 'Renew parking permit',
    },
    sample: { title: 'Something you should know' },
    failed: {
      title: 'We couldn’t send your application',
      body: 'Your answers are saved. Try again in a few minutes.',
      retry: 'Try again',
      contact: 'Contact us',
    },
    saved: { title: 'Your changes are saved', save: 'Save' },
    dismissible: {
      heading: 'Your cases',
      title: 'The service is slower than usual today',
      body: 'Searching can take up to a minute. Your answers are still saved.',
      showAgain: 'Show the message again',
    },
  },
  sv: {
    permit: {
      title: 'Ditt parkeringstillstånd går ut den 12 november 2026',
      body: 'Förnya det senast den 5 november, annars kan du få p-bot.',
      renew: 'Förnya parkeringstillståndet',
    },
    sample: { title: 'Något du bör veta' },
    failed: {
      title: 'Vi kunde inte skicka din ansökan',
      body: 'Dina svar är sparade. Försök igen om några minuter.',
      retry: 'Försök igen',
      contact: 'Kontakta oss',
    },
    saved: { title: 'Dina ändringar är sparade', save: 'Spara' },
    dismissible: {
      heading: 'Dina ärenden',
      title: 'Tjänsten är långsammare än vanligt i dag',
      body: 'En sökning kan ta upp till en minut. Dina svar sparas ändå.',
      showAgain: 'Visa meddelandet igen',
    },
  },
})
