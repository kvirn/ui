export type KvirnbyOpeningDay = { days: string; hours: string; today?: boolean }

/** A normal week for the Opening hours pattern. Monday 12 October 2026 is the fixture's today. */
export const kvirnbyOpeningWeek: readonly KvirnbyOpeningDay[] = [
  { days: 'Monday', hours: '8.00–17.00', today: true },
  { days: 'Tuesday to Thursday', hours: '8.00–16.00' },
  { days: 'Friday', hours: '8.00–15.00' },
  { days: 'Saturday and Sunday', hours: 'Closed' },
]

export type KvirnbyAccessFact = { term: string; description: string }

/** Access facts for the Address and visit pattern, written as statements a visitor can plan by. */
export const kvirnbyAccessFacts: readonly KvirnbyAccessFact[] = [
  { term: 'Entrance', description: 'Level entrance from Main Street, automatic door.' },
  { term: 'Parking for disabled people', description: 'Two spaces next to the entrance.' },
  { term: 'Hearing loop', description: 'At the reception desk.' },
  { term: 'Lift', description: 'To all floors, with room for a wheelchair.' },
  { term: 'Bus stop', description: 'Town Hall, line 4, 100 metres from the entrance.' },
]
