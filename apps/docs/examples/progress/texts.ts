import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useProgressTexts = defineExampleTexts({
  en: {
    start: 'Start',
    stop: 'Stop',
    sending: 'Sending your application.',
    send: 'Send application',
    failed: 'We could not send your application.',
    retry: 'Try again',
    exporting: 'Exporting your cases.',
    export: 'Export cases',
    slowSending: 'Sending your application and its attachments.',
  },
  sv: {
    start: 'Starta',
    stop: 'Stoppa',
    sending: 'Skickar din ansökan.',
    send: 'Skicka ansökan',
    failed: 'Vi kunde inte skicka din ansökan.',
    retry: 'Försök igen',
    exporting: 'Exporterar dina ärenden.',
    export: 'Exportera ärenden',
    slowSending: 'Skickar din ansökan och bilagorna.',
  },
})
