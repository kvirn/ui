export type SearchResultKind = 'service' | 'news' | 'document'

export interface SearchResult {
  readonly title: string
  /** Where the page sits, written as text; the title is the only link. */
  readonly path: string
  /** The excerpt as segments: a string is plain text, `{ match }` is the searched word, drawn as `<mark>`. */
  readonly excerpt: readonly (string | { readonly match: string })[]
  readonly kind: SearchResultKind
  /** ISO date (`YYYY-MM-DD`), for the year filter and for newest and oldest first. */
  readonly publishedOn: string
  readonly href: string
}

export const kvirnbySearchQuery = 'preschool'

/** Ten hits for `preschool` in relevance order. There are no documents from 2024, so a filter on both leaves none. */
export const kvirnbySearchResults: readonly SearchResult[] = [
  {
    title: 'Apply for a preschool place',
    path: 'Start › Education › Preschool',
    excerpt: [
      'Apply for a ',
      { match: 'preschool' },
      ' place from the month your child is one year old.',
    ],
    kind: 'service',
    publishedOn: '2026-08-20',
    href: '#result-apply',
  },
  {
    title: 'Preschool fees',
    path: 'Start › Education › Preschool',
    excerpt: [
      'The fee for ',
      { match: 'preschool' },
      ' depends on household income and the number of children.',
    ],
    kind: 'service',
    publishedOn: '2026-01-05',
    href: '#result-fees',
  },
  {
    title: 'Hillside preschool',
    path: 'Start › Education › Preschool › Units',
    excerpt: [
      { match: 'Preschool' },
      ' for children aged one to five, with a garden and a forest nearby.',
    ],
    kind: 'service',
    publishedOn: '2025-11-14',
    href: '#result-hillside',
  },
  {
    title: 'Apply for a preschool place for the spring term',
    path: 'Start › News',
    excerpt: [
      'Applications for a ',
      { match: 'preschool' },
      ' place are open on My pages until 15 November.',
    ],
    kind: 'news',
    publishedOn: '2026-10-02',
    href: '#result-news-spring',
  },
  {
    title: 'Preschool guidelines 2026',
    path: 'Start › Education › Documents',
    excerpt: [
      'How the municipality organises ',
      { match: 'preschool' },
      ', from admission to the daily routine.',
    ],
    kind: 'document',
    publishedOn: '2026-02-12',
    href: '#result-guidelines',
  },
  {
    title: 'Closed preschools during the summer',
    path: 'Start › News',
    excerpt: [
      'Two ',
      { match: 'preschools' },
      ' close for three weeks in July. Cover is arranged at nearby units.',
    ],
    kind: 'news',
    publishedOn: '2026-05-28',
    href: '#result-summer',
  },
  {
    title: 'Preschool: how we handle your child’s data',
    path: 'Start › About the website › Privacy',
    excerpt: [
      'What we keep when you apply for a ',
      { match: 'preschool' },
      ' place, and for how long.',
    ],
    kind: 'document',
    publishedOn: '2025-09-01',
    href: '#result-data',
  },
  {
    title: 'Change or cancel a preschool place',
    path: 'Start › Education › Preschool',
    excerpt: ['Tell us one month before the ', { match: 'preschool' }, ' place changes or ends.'],
    kind: 'service',
    publishedOn: '2025-06-17',
    href: '#result-change',
  },
  {
    title: 'New outdoor areas at three preschools',
    path: 'Start › News',
    excerpt: [
      'The ',
      { match: 'preschool' },
      ' gardens at Hillside, Mill and Brook are being rebuilt this autumn.',
    ],
    kind: 'news',
    publishedOn: '2024-09-30',
    href: '#result-outdoor',
  },
  {
    title: 'Preschool quality report 2024',
    path: 'Start › Education › Documents',
    excerpt: [
      'The yearly follow-up of ',
      { match: 'preschool' },
      ' activities: staff, groups and results.',
    ],
    kind: 'service',
    publishedOn: '2024-03-04',
    href: '#result-quality',
  },
]

export const kvirnbyPopularPages = [
  { title: 'Apply for a preschool place', href: '#popular-preschool' },
  { title: 'Book a waste collection', href: '#popular-waste' },
  { title: 'Opening hours at the library', href: '#popular-library' },
] as const
