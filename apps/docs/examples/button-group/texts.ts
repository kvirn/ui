import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useButtonGroupTexts = defineExampleTexts({
  en: {
    groupName: 'Your application',
    send: 'Send',
    saveDraft: 'Save draft',
    cardTitle: 'Waste collection',
    cardBody: 'The next collection is on Tuesday. Put the bin out by 6 am.',
    orderExtra: 'Order an extra collection',
    pause: 'Pause collection',
  },
  sv: {
    groupName: 'Din ansökan',
    send: 'Skicka',
    saveDraft: 'Spara utkast',
    cardTitle: 'Sophämtning',
    cardBody: 'Nästa hämtning är på tisdag. Ställ ut kärlet senast klockan 06.',
    orderExtra: 'Beställ extra tömning',
    pause: 'Pausa hämtningen',
  },
})
