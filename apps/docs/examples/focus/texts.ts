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

const sv: typeof en = {
  open: 'Öppna filter',
  close: 'Stäng',
  apply: 'Använd',
  search: 'Sök',
  filterLabel: 'Filter',
  step: ({ step }) => `Steg ${step}`,
  stepBody: 'Fyll i det här steget och gå vidare.',
  next: 'Nästa steg',
}

export const useFocusTexts = defineExampleTexts({ en, sv })
