export type KvirnbyDocument = {
  name: string
  type: string
  bytes: number
  date: string
  href: string
}

/** Documents for the Document list pattern: fictional, the size in bytes so the list formats it. */
export const kvirnbyDocuments: readonly KvirnbyDocument[] = [
  {
    name: 'Preschool fees 2027',
    type: 'PDF',
    bytes: 240_000,
    date: '2026-09-15',
    href: '#fees-2027',
  },
  { name: 'Budget 2027', type: 'PDF', bytes: 2_000_000, date: '2026-06-30', href: '#budget-2027' },
  {
    name: 'Application form',
    type: 'DOCX',
    bytes: 58_000,
    date: '2026-03-02',
    href: '#application-form',
  },
  {
    name: 'Annual report 2025',
    type: 'PDF',
    bytes: 4_800_000,
    date: '2026-02-11',
    href: '#annual-2025',
  },
  {
    name: 'Minutes, council 12 December',
    type: 'PDF',
    bytes: 310_000,
    date: '2025-12-12',
    href: '#minutes-dec',
  },
  {
    name: 'Minutes, council 14 November',
    type: 'PDF',
    bytes: 296_000,
    date: '2025-11-14',
    href: '#minutes-nov',
  },
  {
    name: 'Preschool fees 2026',
    type: 'PDF',
    bytes: 228_000,
    date: '2025-09-12',
    href: '#fees-2026',
  },
  { name: 'Budget 2026', type: 'PDF', bytes: 1_900_000, date: '2025-06-27', href: '#budget-2026' },
  {
    name: 'Annual report 2024',
    type: 'PDF',
    bytes: 4_500_000,
    date: '2025-02-10',
    href: '#annual-2024',
  },
  {
    name: 'Waste collection calendar',
    type: 'PDF',
    bytes: 120_000,
    date: '2025-01-08',
    href: '#waste',
  },
  {
    name: 'Minutes, council 5 December',
    type: 'PDF',
    bytes: 280_000,
    date: '2024-12-05',
    href: '#minutes-2024',
  },
  { name: 'Budget 2025', type: 'PDF', bytes: 1_800_000, date: '2024-06-28', href: '#budget-2025' },
]
