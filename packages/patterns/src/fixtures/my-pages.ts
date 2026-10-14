export type KvirnbyCaseStatus = 'received' | 'in-progress' | 'action-needed' | 'decided' | 'closed'

export type KvirnbyCase = {
  title: string
  href: string
  number: string
  sent: string
  lastChange: string
  status: KvirnbyCaseStatus
  /** The status word, which the Badge shows and the text repeats. */
  statusLabel: string
  /** What happens next, or what the resident must do, in words. */
  nextStep: string
}

/** The Badge variant of each status. The word always comes with it, never the colour alone. */
export const kvirnbyCaseBadgeVariants = {
  received: 'neutral',
  'in-progress': 'info',
  'action-needed': 'warning',
  decided: 'success',
  closed: 'neutral',
} as const

/** Cases for the Case card and My pages: fictional, dates ISO so the page formats them. */
export const kvirnbyCases: readonly KvirnbyCase[] = [
  {
    title: 'Application for a preschool place',
    href: '#case-preschool',
    number: 'KV-2026-004217',
    sent: '2026-09-21',
    lastChange: '2026-10-05',
    status: 'action-needed',
    statusLabel: 'Action needed',
    nextStep: 'Answer the offer of a place at Birch Tree preschool by 19 October.',
  },
  {
    title: 'Building permit for a garden shed',
    href: '#case-building',
    number: 'KV-2026-003880',
    sent: '2026-08-14',
    lastChange: '2026-10-02',
    status: 'in-progress',
    statusLabel: 'In progress',
    nextStep: 'The case officer is reviewing your drawings. You get an answer by 6 November.',
  },
  {
    title: 'Parking permit for residents',
    href: '#case-parking',
    number: 'KV-2026-004602',
    sent: '2026-10-08',
    lastChange: '2026-10-08',
    status: 'received',
    statusLabel: 'Received',
    nextStep: 'We have your application. A case officer is assigned within three working days.',
  },
  {
    title: 'Home help for a family member',
    href: '#case-home-help',
    number: 'KV-2026-002951',
    sent: '2026-06-03',
    lastChange: '2026-09-18',
    status: 'decided',
    statusLabel: 'Decided',
    nextStep: 'The decision is made. Read it under Documents. You can appeal until 9 October.',
  },
  {
    title: 'Change of school',
    href: '#case-school',
    number: 'KV-2026-001744',
    sent: '2026-03-12',
    lastChange: '2026-04-30',
    status: 'closed',
    statusLabel: 'Closed',
    nextStep: 'Nothing more to do. The case is closed.',
  },
]
