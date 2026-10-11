import { defineExampleTexts } from '../../components/local-example-texts.ts'

const en = {
  open: 'Open filters',
  close: 'Close',
  apply: 'Apply',
  search: 'Search',
  filterLabel: 'Filters',
  step: ({ step }: { step: number }) => `Step ${step}`,
  stepBody: 'Fill in this step, then go on.',
  next: 'Next step',
}

export const useFocusTexts = defineExampleTexts({ en })
