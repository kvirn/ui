import { defineExampleTexts } from '../../components/local-example-texts.ts'

export interface AlertTexts {
  permit: { title: string; body: string; renew: string }
  statuses: { info: string; success: string; warning: string; danger: string }
  failed: { title: string; body: string; retry: string; contact: string }
  saved: { title: string; save: string }
  dismissible: { heading: string; title: string; body: string; showAgain: string }
  siteWide: { title: string; body: string }
}

export const useAlertTexts = defineExampleTexts<AlertTexts>({
  en: {
    permit: {
      title: 'Your parking permit expires on 12 November 2026',
      body: 'Renew it by 5 November, or you may get a parking fine.',
      renew: 'Renew parking permit',
    },
    statuses: {
      info: 'The office is closed on 24 December',
      success: 'Your application was sent',
      warning: 'Your booking is not confirmed yet',
      danger: 'We couldn’t save your changes',
    },
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
    siteWide: {
      title: 'The booking service is closed for maintenance on Saturday 14 November',
      body: 'You can book again from 14:00. For urgent cases, call the service line.',
    },
  },
})
