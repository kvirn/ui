import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface AnnouncerTexts {
  saved: { message: string; button: string }
  expired: { message: string; button: string }
  digits: { message: string; label: string }
}

export const useAnnouncerTexts = defineExampleTexts<AnnouncerTexts>({
  en: {
    saved: { message: 'Your changes are saved', button: 'Save' },
    expired: { message: 'Your session has expired. Sign in again.', button: 'Simulate expiry' },
    digits: { message: 'Only digits are allowed here', label: 'Phone number' },
  },
  sv: {
    saved: { message: 'Dina ändringar är sparade', button: 'Spara' },
    expired: { message: 'Sessionen har gått ut. Logga in igen.', button: 'Simulera utgång' },
    digits: { message: 'Här kan du bara skriva siffror', label: 'Telefonnummer' },
  },
})
