// kv-lang-ok-file: Swedish example text, used when the example runs under a Swedish provider (the 'A trail in Swedish' use case).
import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Every example is its own landmark on the page, and the site's own trail above the title is
// named You are here, so each example has its own name: two navigations with the same name can't
// be told apart in a screen reader's landmark list.
export const useBreadcrumbTexts = defineExampleTexts({
  en: {
    defaultLabel: 'You are here: the preschool page',
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
    separatorLabel: 'You are here: your own separator',
    ownMarkupLabel: 'You are here: your own markup',
    cases: 'Cases',
    permits: 'Building permits',
    permitCase: 'Permit 2026-0412',
  },
  sv: {
    defaultLabel: 'Du är här: förskolesidan',
    start: 'Start',
    children: 'Barn och utbildning',
    preschool: 'Förskola',
    services: 'Service och stöd',
    social: 'Vård och omsorg',
    homeCare: 'Hemtjänst',
    homeCareHelp: 'Hjälp i hemmet',
    homeCareApply: 'Ansök om hemtjänst',
    homeCareFees: 'Avgifter för hemtjänst',
    longLabel: 'Du är här: en lång sökväg',
    ownLabel: 'Sökväg till den här sidan',
    separatorLabel: 'Du är här: eget skiljetecken',
    ownMarkupLabel: 'Du är här: eget element',
    cases: 'Ärenden',
    permits: 'Bygglov',
    permitCase: 'Bygglov 2026-0412',
  },
})
