import { defineExampleTexts } from '../../components/local-example-texts.ts'

// The library's own words (Previous page, Page 2, Page 2 of 3) come from the provider's
// messages in every language. Only the landmark names that tell the examples apart, and the
// custom words, are the page's own.
export const usePaginationTexts = defineExampleTexts({
  en: {
    newsLabel: 'News pages',
    firstLabel: 'Case pages',
    ownWordsLabel: 'Search result pages',
    back: 'Previous results',
    forward: 'Next results',
    status: 'Results page 2 of 3',
    searchLabel: 'Permit search pages',
    messagesLabel: 'Message pages',
    documentsLabel: 'Document pages',
    messagesCaption: 'Messages about your case',
    documentsCaption: 'Documents in your case',
  },
})
