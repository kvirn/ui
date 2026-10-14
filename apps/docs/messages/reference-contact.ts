// Strings of the reference site's contact page (P16) and the Hillside preschool unit page (R4).
// The sv object is typed by the en shape, so a missing key is a type error. Kvirnby is fictional.
import type { ReferenceLocale } from './reference.ts'

const en = {
  breadcrumb: 'You are here',
  start: 'Start',
  phone: 'Phone',
  email: 'Email',
  openingHours: 'Opening hours',
  visitUs: 'Visit us',
  closed: 'Closed',
  directions: ({ place }: { place: string }) => `Directions to ${place} in Example Maps`,
  contact: {
    title: 'Contact',
    heading: 'Contact Kvirnby municipality',
    lead: 'Call, write or visit the contact centre. We answer most questions straight away.',
    centre: 'Contact centre',
    phoneNumber: '0000-00 00 00',
    hours: [
      { days: 'Monday', time: '8.00–17.00' },
      { days: 'Tuesday to Thursday', time: '8.00–16.00' },
      { days: 'Friday', time: '8.00–15.00' },
      { days: 'Saturday and Sunday', time: undefined },
    ],
    holidayTitle: 'Different hours at Christmas',
    holidayBody: 'On 24 December the contact centre is closed. On 23 December it closes at 12.00.',
    address: ['Town Hall', 'Main Street 1', '123 45 Kvirnby'],
    place: 'Town Hall',
    access: [
      { term: 'Entrance', value: 'Level entrance from Main Street, automatic door.' },
      { term: 'Parking for disabled people', value: 'Two spaces next to the entrance.' },
      { term: 'Hearing loop', value: 'At the reception desk.' },
    ],
    parkingPermit: 'Apply for a disabled parking permit',
    otherWays: 'Related pages',
    otherLinks: [
      { slug: 'support-and-care', label: 'Support and care' },
      { slug: 'news', label: 'News' },
      { slug: 'privacy', label: 'How we handle personal data' },
    ],
  },
  unit: {
    title: 'Hillside preschool',
    preschool: 'Preschool',
    lead: 'A small preschool with three groups and a large garden, a short walk from the Hillside bus stop.',
    aboutHeading: 'About the preschool',
    about:
      'Hillside has places for 54 children aged one to five. The groups spend most days outdoors, and the kitchen cooks lunch on site.',
    hours: [
      { days: 'Monday to Friday', time: '6.30–18.30' },
      { days: 'Saturday and Sunday', time: undefined },
    ],
    address: ['Hillside preschool', 'Old Mill Road 12', '123 45 Kvirnby'],
    access: [
      { term: 'Entrance', value: 'Level, with an automatic door.' },
      { term: 'Bus stop', value: 'Hillside, line 7, 50 metres away.' },
    ],
    contactHeading: 'Contact us',
    contactRole: 'Hillside preschool, head of preschool',
    phoneNumber: '0000-00 00 02',
    relatedHeading: 'Related pages',
    related: [
      { slug: 'preschool', label: 'Preschool' },
      { slug: 'children-and-education', label: 'Children and education' },
    ],
  },
}

const sv: typeof en = {
  breadcrumb: 'Du är här',
  start: 'Start',
  phone: 'Telefon',
  email: 'E-post',
  openingHours: 'Öppettider',
  visitUs: 'Besök oss',
  closed: 'Stängt',
  directions: ({ place }) => `Hitta till ${place} i Example Maps`,
  contact: {
    title: 'Kontakt',
    heading: 'Kontakta Kvirnby kommun',
    lead: 'Ring, skriv eller besök kontaktcentret. Vi svarar på de flesta frågor direkt.',
    centre: 'Kontaktcenter',
    phoneNumber: '0000-00 00 00',
    hours: [
      { days: 'Måndag', time: '8.00–17.00' },
      { days: 'Tisdag till torsdag', time: '8.00–16.00' },
      { days: 'Fredag', time: '8.00–15.00' },
      { days: 'Lördag och söndag', time: undefined },
    ],
    holidayTitle: 'Andra öppettider vid jul',
    holidayBody:
      'Den 24 december är kontaktcentret stängt. Den 23 december stänger vi klockan 12.00.',
    address: ['Stadshuset', 'Storgatan 1', '123 45 Kvirnby'],
    place: 'Stadshuset',
    access: [
      { term: 'Entré', value: 'Nivåfri entré från Storgatan, automatisk dörr.' },
      {
        term: 'Parkering för personer med funktionsnedsättning',
        value: 'Två platser intill entrén.',
      },
      { term: 'Hörselslinga', value: 'I receptionen.' },
    ],
    parkingPermit: 'Ansök om parkeringstillstånd för rörelsehindrade',
    otherWays: 'Relaterade sidor',
    otherLinks: [
      { slug: 'support-and-care', label: 'Stöd och omsorg' },
      { slug: 'news', label: 'Nyheter' },
      { slug: 'privacy', label: 'Så hanterar vi personuppgifter' },
    ],
  },
  unit: {
    title: 'Förskolan Backen',
    preschool: 'Förskola',
    lead: 'En liten förskola med tre avdelningar och en stor trädgård, en kort promenad från busshållplatsen Backen.',
    aboutHeading: 'Om förskolan',
    about:
      'Backen har plats för 54 barn i åldern ett till fem år. Barngrupperna är utomhus större delen av dagarna, och köket lagar lunch på plats.',
    hours: [
      { days: 'Måndag till fredag', time: '6.30–18.30' },
      { days: 'Lördag och söndag', time: undefined },
    ],
    address: ['Förskolan Backen', 'Gamla kvarnvägen 12', '123 45 Kvirnby'],
    access: [
      { term: 'Entré', value: 'Nivåfri, med automatisk dörr.' },
      { term: 'Busshållplats', value: 'Backen, linje 7, 50 meter bort.' },
    ],
    contactHeading: 'Kontakta oss',
    contactRole: 'Förskolan Backen, förskolechef',
    phoneNumber: '0000-00 00 02',
    relatedHeading: 'Relaterade sidor',
    related: [
      { slug: 'preschool', label: 'Förskola' },
      { slug: 'children-and-education', label: 'Barn och utbildning' },
    ],
  },
}

export const referenceContactMessages: Record<ReferenceLocale, typeof en> = { sv, en }
