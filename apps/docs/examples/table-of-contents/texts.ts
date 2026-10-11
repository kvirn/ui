import { defineExampleTexts } from '../../components/local-example-texts.ts'

// The entries are this page's own headings, so every link in the examples really scrolls.
export const useTableOfContentsTexts = defineExampleTexts({
  en: {
    title: 'In this guide',
    whenToUse: 'When to use it',
    example: 'Example',
    useCases: 'Use cases',
    twoLevels: 'Two levels',
    ownMarkup: 'Your own markup',
    noTitle: 'Without a visible title',
    accessibility: 'Accessibility',
    keyboard: 'Keyboard',
    api: 'API reference',
    sectionCount: ({ count }: { count: number }) => `${count} sections`,
    nameFromMessage: 'Page outline',
  },
})
