// kv-lang-ok-file: the reference site is bilingual (sv and en), so this file holds its Swedish and English copy.
// Strings of the reference start page (P1) and topic pages (P2). Menu labels and routes come from
// `referenceMessages[locale].chrome.topics`, so only the copy the menu does not hold is here.

const en = {
  start: {
    title: 'Start',
    heading: 'Kvirnby municipality',
    lead: 'Find services, news and events in Kvirnby, from preschool to building permits.',
    popularHeading: 'Popular services',
    topicsHeading: 'Municipal services',
  },
  topic: {
    breadcrumbLabel: 'You are here',
    start: 'Start',
    shortcutsHeading: 'Shortcuts',
    lastUpdated: 'Last updated:',
    updated: '2 October 2026',
    copyLink: 'Copy link',
    print: 'Print',
  },
  topicTexts: {
    'children-and-education':
      'Preschool, school and adult education. Find where to apply and who to ask.',
    'support-and-care': 'Elderly care and support for people with disabilities.',
    'housing-and-environment': 'Waste, recycling, water and sewage.',
    'transport-and-parking': 'Parking permits, roads and street works.',
    'culture-and-leisure': 'Libraries, events and things to do in Kvirnby.',
    'business-and-work': 'Starting a business and working for the municipality.',
    'municipality-and-democracy': 'News, contact details and how the municipality is run.',
  } as Record<string, string>,
}

const sv: typeof en = {
  start: {
    title: 'Start',
    heading: 'Kvirnby kommun',
    lead: 'Hitta tjänster, nyheter och evenemang i Kvirnby, från förskola till bygglov.',
    popularHeading: 'Populära tjänster',
    topicsHeading: 'Kommunens tjänster',
  },
  topic: {
    breadcrumbLabel: 'Du är här',
    start: 'Start',
    shortcutsHeading: 'Genvägar',
    lastUpdated: 'Senast uppdaterad:',
    updated: '2 oktober 2026',
    copyLink: 'Kopiera länk',
    print: 'Skriv ut',
  },
  topicTexts: {
    'children-and-education':
      'Förskola, skola och vuxenutbildning. Hitta var du ansöker och vem du frågar.',
    'support-and-care': 'Äldreomsorg och stöd vid funktionsnedsättning.',
    'housing-and-environment': 'Avfall, återvinning, vatten och avlopp.',
    'transport-and-parking': 'Parkeringstillstånd, vägar och gatuarbeten.',
    'culture-and-leisure': 'Bibliotek, evenemang och saker att göra i Kvirnby.',
    'business-and-work': 'Starta företag och arbeta i kommunen.',
    'municipality-and-democracy': 'Nyheter, kontaktuppgifter och hur kommunen styrs.',
  },
}

export const referencePageMessages = { sv, en }

export const popularServiceSlugs = [
  'preschool/apply',
  'housing-and-environment/waste',
  'parking/disabled-parking-permit',
  'support-and-care/elderly-care',
  'events',
  'contact',
] as const
