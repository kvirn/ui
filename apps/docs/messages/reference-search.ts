// Strings and the static search index of the reference site's search results page (P15, R9).
// The sv object is typed by the en shape, so a missing key is a type error. Kvirnby is fictional.
// The index is searched in the browser: nothing typed is sent anywhere (rule 7). Filter words, counts
// and the sort labels come from the provider's `filters.*` messages, not from here.
import type { ReferenceLocale } from './reference.ts'

export type SearchKind = 'service' | 'news' | 'information'

interface SearchEntry {
  slug: string
  kind: SearchKind
  title: string
  path: string
  excerpt: string
}

const en = {
  title: 'Search',
  heading: 'Search kvirnby.example',
  searchLabel: 'Find a page',
  queryLabel: 'Search for',
  submit: 'Search',
  prompt: 'Type a word to search all pages on the website, for example “preschool”.',
  typeLegend: 'Type of page',
  typeGroup: 'Type',
  kinds: { service: 'Services', news: 'News', information: 'Information' },
  breadcrumb: 'You are here',
  start: 'Start',
  resultsFor: ({ query }: { query: string }) => `Search results for “${query}”`,
  resultsList: 'Search results',
  noMatchTitle: ({ query }: { query: string }) => `Nothing matches “${query}”`,
  noMatchHint: 'Check the spelling, or try a shorter or more general word.',
  popularIntro: 'These pages are often visited:',
  stillCantFind: 'Still can’t find it?',
  contactLink: 'Contact the contact centre',
  popular: [
    {
      slug: 'parking/disabled-parking-permit',
      label: 'Parking permit for people with disabilities',
    },
    { slug: 'housing-and-environment/waste', label: 'Waste and recycling' },
    { slug: 'preschool/apply', label: 'Apply for a preschool place' },
  ],
  entries: [
    {
      slug: 'preschool/apply',
      kind: 'service',
      title: 'Apply for a preschool place',
      path: 'Children and education › Preschool',
      excerpt:
        'Apply online for a place in preschool from the age of one. Siblings share a queue date.',
    },
    {
      slug: 'preschool/hillside',
      kind: 'information',
      title: 'Hillside preschool',
      path: 'Children and education › Preschool',
      excerpt: 'Opening hours, the staff, the outdoor yard and how to visit Hillside preschool.',
    },
    {
      slug: 'compulsory-school/primary',
      kind: 'information',
      title: 'Primary school',
      path: 'Children and education › Compulsory school',
      excerpt: 'School start, after-school care, school meals and the school transport rules.',
    },
    {
      slug: 'upper-secondary',
      kind: 'information',
      title: 'Upper secondary school',
      path: 'Children and education',
      excerpt: 'Programmes, how to apply and what support you can get in your studies.',
    },
    {
      slug: 'support-and-care/elderly-care',
      kind: 'service',
      title: 'Elderly care',
      path: 'Support and care',
      excerpt:
        'Home help, safety alarms, meals at home and how to apply for a care needs assessment.',
    },
    {
      slug: 'support-and-care/disability-support',
      kind: 'service',
      title: 'Disability support',
      path: 'Support and care',
      excerpt:
        'Personal assistance, a companion service and transport for people with disabilities.',
    },
    {
      slug: 'housing-and-environment/waste',
      kind: 'information',
      title: 'Waste and recycling',
      path: 'Housing and environment',
      excerpt: 'Collection days, recycling centres, bulky waste and how to sort food waste.',
    },
    {
      slug: 'housing-and-environment/water',
      kind: 'information',
      title: 'Water and sewage',
      path: 'Housing and environment',
      excerpt: 'Report a fault, planned water shut-offs and your water bill.',
    },
    {
      slug: 'parking/disabled-parking-permit',
      kind: 'service',
      title: 'Parking permit for people with disabilities',
      path: 'Transport and parking',
      excerpt: 'Apply for a parking permit if you have a disability that makes walking hard.',
    },
    {
      slug: 'transport-and-parking/roads',
      kind: 'information',
      title: 'Roads and street works',
      path: 'Transport and parking',
      excerpt: 'Street works, snow clearing, report a pothole or a broken street light.',
    },
    {
      slug: 'culture-and-leisure/libraries',
      kind: 'information',
      title: 'Libraries',
      path: 'Culture and leisure',
      excerpt: 'Opening hours, borrowing, e-books and study rooms at the library.',
    },
    {
      slug: 'business-and-work/start-a-business',
      kind: 'service',
      title: 'Start a business',
      path: 'Business and work',
      excerpt: 'Permits, advice for new companies and a contact for business questions.',
    },
    {
      slug: 'news',
      kind: 'news',
      title: 'Water shut-off on Thursday 9–15',
      path: 'News',
      excerpt:
        'The water is off while we work on the main pipe. Fill containers beforehand if you can.',
    },
    {
      slug: 'news',
      kind: 'news',
      title: 'The new preschool opens in August',
      path: 'News',
      excerpt: 'Hillside preschool gets forty new places. Applications are open now.',
    },
    {
      slug: 'contact',
      kind: 'information',
      title: 'Contact and opening hours',
      path: 'Municipality and democracy',
      excerpt:
        'Call, write or visit the contact centre. Opening hours, address and how to get here.',
    },
  ] as readonly SearchEntry[],
}

const sv: typeof en = {
  title: 'Sök',
  heading: 'Sök på kvirnby.example',
  searchLabel: 'Hitta en sida',
  queryLabel: 'Sök efter',
  submit: 'Sök',
  prompt: 'Skriv ett ord för att söka bland alla sidor på webbplatsen, till exempel ”förskola”.',
  typeLegend: 'Typ av sida',
  typeGroup: 'Typ',
  kinds: { service: 'Tjänster', news: 'Nyheter', information: 'Information' },
  breadcrumb: 'Du är här',
  start: 'Start',
  resultsFor: ({ query }) => `Sökresultat för ”${query}”`,
  resultsList: 'Sökresultat',
  noMatchTitle: ({ query }) => `Inget matchar ”${query}”`,
  noMatchHint: 'Kontrollera stavningen eller prova ett kortare eller mer allmänt ord.',
  popularIntro: 'De här sidorna besöks ofta:',
  stillCantFind: 'Hittar du fortfarande inte det du söker?',
  contactLink: 'Kontakta kontaktcenter',
  popular: [
    { slug: 'parking/disabled-parking-permit', label: 'Parkeringstillstånd för rörelsehindrade' },
    { slug: 'housing-and-environment/waste', label: 'Avfall och återvinning' },
    { slug: 'preschool/apply', label: 'Ansök om förskoleplats' },
  ],
  entries: [
    {
      slug: 'preschool/apply',
      kind: 'service',
      title: 'Ansök om förskoleplats',
      path: 'Barn och utbildning › Förskola',
      excerpt: 'Ansök online om plats i förskola från ett års ålder. Syskon delar ködatum.',
    },
    {
      slug: 'preschool/hillside',
      kind: 'information',
      title: 'Förskolan Backen',
      path: 'Barn och utbildning › Förskola',
      excerpt: 'Öppettider, personalen, utegården och hur du besöker Förskolan Backen.',
    },
    {
      slug: 'compulsory-school/primary',
      kind: 'information',
      title: 'Grundskola',
      path: 'Barn och utbildning › Grundskola',
      excerpt: 'Skolstart, fritidshem, skolmat och reglerna för skolskjuts.',
    },
    {
      slug: 'upper-secondary',
      kind: 'information',
      title: 'Gymnasieskola',
      path: 'Barn och utbildning',
      excerpt: 'Program, hur du ansöker och vilket stöd du kan få i studierna.',
    },
    {
      slug: 'support-and-care/elderly-care',
      kind: 'service',
      title: 'Äldreomsorg',
      path: 'Stöd och omsorg',
      excerpt: 'Hemtjänst, trygghetslarm, matdistribution och hur du ansöker om biståndsbedömning.',
    },
    {
      slug: 'support-and-care/disability-support',
      kind: 'service',
      title: 'Stöd vid funktionsnedsättning',
      path: 'Stöd och omsorg',
      excerpt:
        'Personlig assistans, ledsagarservice och färdtjänst för personer med funktionsnedsättning.',
    },
    {
      slug: 'housing-and-environment/waste',
      kind: 'information',
      title: 'Avfall och återvinning',
      path: 'Bostad och miljö',
      excerpt: 'Hämtdagar, återvinningscentraler, grovavfall och hur du sorterar matavfall.',
    },
    {
      slug: 'housing-and-environment/water',
      kind: 'information',
      title: 'Vatten och avlopp',
      path: 'Bostad och miljö',
      excerpt: 'Felanmälan, planerade vattenavstängningar och din vattenräkning.',
    },
    {
      slug: 'parking/disabled-parking-permit',
      kind: 'service',
      title: 'Parkeringstillstånd för rörelsehindrade',
      path: 'Trafik och parkering',
      excerpt:
        'Ansök om parkeringstillstånd om du har en funktionsnedsättning som gör det svårt att gå.',
    },
    {
      slug: 'transport-and-parking/roads',
      kind: 'information',
      title: 'Vägar och gatuarbeten',
      path: 'Trafik och parkering',
      excerpt: 'Gatuarbeten, snöröjning, anmäl ett hål i vägen eller en trasig gatlampa.',
    },
    {
      slug: 'culture-and-leisure/libraries',
      kind: 'information',
      title: 'Bibliotek',
      path: 'Kultur och fritid',
      excerpt: 'Öppettider, lån, e-böcker och studierum på biblioteket.',
    },
    {
      slug: 'business-and-work/start-a-business',
      kind: 'service',
      title: 'Starta företag',
      path: 'Näringsliv och arbete',
      excerpt: 'Tillstånd, rådgivning för nya företag och en kontakt för företagsfrågor.',
    },
    {
      slug: 'news',
      kind: 'news',
      title: 'Vattnet stängs av på torsdag kl. 9–15',
      path: 'Nyheter',
      excerpt:
        'Vattnet är avstängt medan vi arbetar på huvudledningen. Fyll kärl i förväg om du kan.',
    },
    {
      slug: 'news',
      kind: 'news',
      title: 'Den nya förskolan öppnar i augusti',
      path: 'Nyheter',
      excerpt: 'Förskolan Backen får fyrtio nya platser. Ansökan är öppen nu.',
    },
    {
      slug: 'contact',
      kind: 'information',
      title: 'Kontakt och öppettider',
      path: 'Kommun och demokrati',
      excerpt: 'Ring, skriv eller besök kontaktcenter. Öppettider, adress och hur du hittar hit.',
    },
  ],
}

export const referenceSearchMessages: Record<ReferenceLocale, typeof en> = { sv, en }
