export interface NewsItem {
  readonly title: string
  /** ISO date (`YYYY-MM-DD`), written by the component with `useFormat`. */
  readonly publishedOn: string
  readonly summary: string
  readonly href: string
}

export interface EventItem {
  readonly title: string
  /** ISO date and time in UTC; the component writes them with `useFormat`. */
  readonly startsAt: string
  readonly endsAt: string
  readonly where: string
  readonly cost: string
  readonly href: string
  readonly status: 'upcoming' | 'cancelled' | 'moved' | 'fullyBooked'
  /** Only for `moved`: the new start, ISO date and time in UTC. */
  readonly movedTo?: string
}

/** Ten news items of the fictional municipality, newest first (fixture clock: Monday 12 October 2026). */
export const kvirnbyNews: readonly NewsItem[] = [
  {
    title: 'The recycling centre opens an hour earlier on Saturdays',
    publishedOn: '2026-10-12',
    summary:
      'From 17 October the centre opens at 9.00, so you can drop off bulky waste before lunch.',
    href: '#news-recycling',
  },
  {
    title: 'Roadworks on Storgatan until the end of November',
    publishedOn: '2026-10-09',
    summary: 'Buses are diverted via Skolvägen. Walking and cycling routes stay open.',
    href: '#news-roadworks',
  },
  {
    title: 'New opening hours at Kvirnby library',
    publishedOn: '2026-10-07',
    summary: 'The library is open until 20.00 on Tuesdays and Thursdays from November.',
    href: '#news-library',
  },
  {
    title: 'Apply for a preschool place for the spring term',
    publishedOn: '2026-10-02',
    summary: 'Applications are open on My pages until 15 November.',
    href: '#news-preschool',
  },
  {
    title: 'The swimming hall reopens after maintenance',
    publishedOn: '2026-09-28',
    summary: 'The pool and the sauna are open again, with a new ramp at the entrance.',
    href: '#news-swimming',
  },
  {
    title: 'Winter parking rules start on 1 November',
    publishedOn: '2026-09-24',
    summary: 'Cars may not be parked on streets marked with a snow sign between 22.00 and 06.00.',
    href: '#news-parking',
  },
  {
    title: 'Decision on the new school in Hillside',
    publishedOn: '2026-09-18',
    summary: 'The council has decided to build a school for 400 pupils. Building starts in 2027.',
    href: '#news-school',
  },
  {
    title: 'Free advice on saving energy at home',
    publishedOn: '2026-09-11',
    summary: 'Book a time with the energy adviser at the contact centre. The service is free.',
    href: '#news-energy',
  },
  {
    title: 'The harvest market is back on the square',
    publishedOn: '2026-09-04',
    summary: 'Local growers sell vegetables, bread and honey every Saturday until October.',
    href: '#news-market',
  },
  {
    title: 'Results of the resident survey are published',
    publishedOn: '2026-08-28',
    summary: 'Nine out of ten residents are satisfied with their local preschool.',
    href: '#news-survey',
  },
]

/** One event in each state the Event list shows. */
export const kvirnbyEvents: readonly EventItem[] = [
  {
    title: 'Storytime for children',
    startsAt: '2026-10-17T10:00:00Z',
    endsAt: '2026-10-17T10:45:00Z',
    where: 'Kvirnby library, Storgatan 4',
    cost: 'Free',
    href: '#event-storytime',
    status: 'upcoming',
  },
  {
    title: 'Open house at Hillside preschool',
    startsAt: '2026-10-21T16:00:00Z',
    endsAt: '2026-10-21T18:00:00Z',
    where: 'Hillside preschool, Skolvägen 2',
    cost: 'Free',
    href: '#event-open-house',
    status: 'upcoming',
  },
  {
    title: 'Autumn concert with the town band',
    startsAt: '2026-10-24T17:00:00Z',
    endsAt: '2026-10-24T19:00:00Z',
    where: 'Culture hall, Torget 1',
    cost: '120 kronor',
    href: '#event-concert',
    status: 'cancelled',
  },
  {
    title: 'Meeting about the new bus timetable',
    startsAt: '2026-10-28T18:00:00Z',
    endsAt: '2026-10-28T19:30:00Z',
    where: 'Town hall, Rådhusgatan 5',
    cost: 'Free',
    href: '#event-bus',
    status: 'moved',
    movedTo: '2026-11-04T18:00:00Z',
  },
  {
    title: 'Cooking class: autumn vegetables',
    startsAt: '2026-11-07T11:00:00Z',
    endsAt: '2026-11-07T14:00:00Z',
    where: 'Skolvägen community kitchen',
    cost: '80 kronor',
    href: '#event-cooking',
    status: 'fullyBooked',
  },
]
