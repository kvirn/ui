import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface AnnouncerTexts {
  saved: { message: string; button: string }
  expired: { message: string; button: string }
  digits: { message: string; label: string; hint: string }
  search: { label: string; services: string[]; results: (count: number) => string }
}

export const useAnnouncerTexts = defineExampleTexts<AnnouncerTexts>({
  en: {
    saved: { message: 'Your changes are saved', button: 'Save' },
    expired: { message: 'Your session has expired. Sign in again.', button: 'Simulate expiry' },
    digits: {
      message: 'Only digits are allowed here',
      label: 'Phone number',
      hint: 'Digits only, without spaces',
    },
    search: {
      label: 'Search services',
      services: [
        'Building permit',
        'Housing allowance',
        'Library card',
        'Parking permit',
        'Waste collection',
      ],
      results: (count) =>
        count === 0
          ? 'No services found'
          : count === 1
            ? '1 service found'
            : `${count} services found`,
    },
  },
})
