import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useTextareaTexts = defineExampleTexts({
  en: {
    label: 'Describe your situation',
    description: 'Tell us what has happened and what you need help with.',
    errorEmpty: 'Describe your situation',
    errorTooLong: (limit: number) =>
      `The description can be at most ${limit} characters. Remove some text.`,
    send: 'Send',
    restoreDraft: 'Restore saved draft',
    draft: 'I received a letter about my housing allowance and I do not understand what to do.',
    lineBreakHint: 'Our case system counts a line break as two characters, and so does the count.',
    summaryLabel: 'Short summary',
    summaryHint: 'One sentence, for the case list.',
  },
  sv: {
    label: 'Beskriv din situation',
    description: 'Berätta vad som har hänt och vad du behöver hjälp med.',
    errorEmpty: 'Beskriv din situation',
    errorTooLong: (limit: number) =>
      `Beskrivningen kan vara högst ${limit} tecken. Ta bort lite text.`,
    send: 'Skicka',
    restoreDraft: 'Hämta sparat utkast',
    draft: 'Jag har fått ett brev om mitt bostadsbidrag och förstår inte vad jag ska göra.',
    lineBreakHint:
      'Vårt ärendesystem räknar en radbrytning som två tecken, och det gör räknaren också.',
    summaryLabel: 'Kort sammanfattning',
    summaryHint: 'En mening, till ärendelistan.',
  },
})
