import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface AnnouncerTexts {
  saved: { message: string; button: string }
  expired: { message: string; button: string }
  digits: { message: string; label: string; hint: string }
  search: { label: string; services: string[]; results: (count: number) => string }
  booking: {
    open: string
    title: string
    monday: string
    tuesday: string
    close: string
    freeTimes: (day: string, count: number) => string
  }
  draft: { street: string; description: string; saved: string }
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
    booking: {
      open: 'Change your appointment',
      title: 'Change your appointment',
      monday: 'Monday',
      tuesday: 'Tuesday',
      close: 'Close',
      freeTimes: (day, count) =>
        count === 0
          ? `${day}: no free times`
          : count === 1
            ? `${day}: 1 free time`
            : `${day}: ${count} free times`,
    },
    draft: {
      street: 'Street where the fault is',
      description: 'What is wrong',
      saved: 'Draft saved',
    },
  },
})
