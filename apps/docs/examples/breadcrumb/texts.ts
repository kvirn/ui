import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Every example is its own landmark on the page, so each but the first has its own name: two
// navigations with the same name can't be told apart in a screen reader's landmark list.
export const useBreadcrumbTexts = defineExampleTexts({
  en: {
    start: 'Start',
    children: 'Children and education',
    preschool: 'Preschool',
    services: 'Services and support',
    social: 'Care and support',
    homeCare: 'Home care',
    homeCareHelp: 'Help at home',
    homeCareApply: 'Apply for home help',
    homeCareFees: 'Fees for home help',
    longLabel: 'You are here: a long trail',
    ownLabel: 'Path to this page',
  },
})
