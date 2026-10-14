import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  open: 'Filter cases',
  close: 'Close filters',
  apply: 'Show cases',
  search: 'Case number',
  filterLabel: 'Filter cases',
  stepHeading: ({ step, total, title }: { step: number; total: number; title: string }) =>
    `Step ${step} of ${total}: ${title}`,
  steps: [
    { title: 'Your details', body: 'Enter your name and how we can reach you.' },
    { title: 'The property', body: 'Enter the property designation and describe the work.' },
    { title: 'Attachments', body: 'Attach a site plan, then send your application.' },
  ],
  back: 'Previous step',
  next: 'Next step',
}

export const useFocusTexts = defineExampleTexts({ en })
