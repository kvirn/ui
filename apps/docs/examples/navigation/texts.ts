import { defineExampleTexts } from '../../components/local-example-texts.ts'

// Every example is its own landmark on the page, so each has its own name: two navigations with
// the same name can't be told apart in a screen reader's landmark list.
export const useNavigationTexts = defineExampleTexts({
  en: {
    labelMain: 'Parking permits',
    labelNested: 'Parking section',
    labelHorizontal: 'Services',
    labelNotListed: 'Your applications',
    labelCollapsible: 'Permit guide',
    labelGroups: 'Staff menu',
    groupPermits: 'Permits',
    groupServices: 'Services',
    overview: 'Overview',
    apply: 'Apply',
    contact: 'Contact',
    resident: 'Resident permit',
    visitor: 'Visitor permit',
    parking: 'Parking',
    waste: 'Waste and recycling',
    roads: 'Roads and traffic',
    applications: 'Your applications',
    applicationsOpen: 'Open applications',
    applicationsDecided: 'Decided applications',
    permitTypes: 'Permit types',
  },
})
