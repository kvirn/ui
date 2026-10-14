// Strings of the reference municipality site (docs/design/municipality-reference-site.md §7):
// Kvirnby kommun, a fictional municipality, in Swedish and English. The sv file is typed by the en
// shape, so a missing key is a type error. Visible copy only: strings a shipped component owns
// come from @kvirn-ui/i18n.

export const referenceLocales = ['sv', 'en'] as const
export type ReferenceLocale = (typeof referenceLocales)[number]

export const isReferenceLocale = (value: string): value is ReferenceLocale =>
  (referenceLocales as readonly string[]).includes(value)

interface MenuLink {
  slug: string
  label: string
}

interface MenuTopic {
  slug: string
  label: string
  overview: string
  groups: readonly { slug: string; label: string; links: readonly MenuLink[] }[]
  links: readonly MenuLink[]
}

const en = {
  notice:
    'Kvirnby is a fictional municipality. This is a KvirnUI reference site: no service here is real, and nothing you enter is sent.',
  howBuilt: 'How this page is built',
  docs: 'KvirnUI documentation',
  siteName: 'Kvirnby',
  title: ({ page }: { page: string }) => `${page} – Kvirnby (fictional municipality) – KvirnUI`,
  description: 'A KvirnUI reference site for a fictional Nordic municipality.',
  chrome: {
    logoName: 'Kvirnby municipality',
    language: 'Language',
    languageNames: { sv: 'Svenska', en: 'English' },
    shortcuts: 'Shortcuts',
    contact: 'Contact us',
    eServices: 'E-services',
    myPages: 'My pages',
    searchLabel: 'Search the site',
    search: 'Search',
    menu: 'Menu',
    mainMenu: 'Main menu',
    topics: [
      {
        slug: 'children-and-education',
        label: 'Children and education',
        overview: 'All about children and education',
        groups: [
          {
            label: 'Preschool',
            slug: 'preschool',
            links: [{ slug: 'preschool/apply', label: 'Apply for a place' }],
          },
          {
            label: 'Compulsory school',
            slug: 'compulsory-school',
            links: [{ slug: 'compulsory-school/primary', label: 'Primary school' }],
          },
        ],
        links: [{ slug: 'upper-secondary', label: 'Upper secondary school' }],
      },
      {
        slug: 'support-and-care',
        label: 'Support and care',
        overview: 'All about support and care',
        groups: [],
        links: [
          { slug: 'support-and-care/elderly-care', label: 'Elderly care' },
          { slug: 'support-and-care/disability-support', label: 'Disability support' },
        ],
      },
      {
        slug: 'housing-and-environment',
        label: 'Housing and environment',
        overview: 'All about housing and environment',
        groups: [],
        links: [
          { slug: 'housing-and-environment/waste', label: 'Waste and recycling' },
          { slug: 'housing-and-environment/water', label: 'Water and sewage' },
        ],
      },
      {
        slug: 'transport-and-parking',
        label: 'Transport and parking',
        overview: 'All about transport and parking',
        groups: [],
        links: [
          {
            slug: 'parking/disabled-parking-permit',
            label: 'Parking permit for people with disabilities',
          },
          { slug: 'transport-and-parking/roads', label: 'Roads and street works' },
        ],
      },
      {
        slug: 'culture-and-leisure',
        label: 'Culture and leisure',
        overview: 'All about culture and leisure',
        groups: [],
        links: [
          { slug: 'events', label: 'Events' },
          { slug: 'culture-and-leisure/libraries', label: 'Libraries' },
        ],
      },
      {
        slug: 'business-and-work',
        label: 'Business and work',
        overview: 'All about business and work',
        groups: [],
        links: [
          { slug: 'business-and-work/start-a-business', label: 'Start a business' },
          { slug: 'business-and-work/jobs', label: 'Jobs at Kvirnby' },
        ],
      },
      {
        slug: 'municipality-and-democracy',
        label: 'Municipality and democracy',
        overview: 'All about the municipality and democracy',
        groups: [],
        links: [
          { slug: 'news', label: 'News' },
          { slug: 'contact', label: 'Contact and opening hours' },
        ],
      },
    ] as readonly MenuTopic[],
    alert: {
      title: 'Water shut off in North Kvirnby on Wednesday 14 October',
      body: 'The water is off from 9 to 15 because of work on the water main. Fill containers in advance if you can.',
      link: 'Read more about the water shut-off',
    },
    footer: {
      contact: 'Contact us',
      contactCentre: 'Contact centre',
      phone: 'Phone',
      phoneNumber: '0000-00 00 00',
      email: 'Email',
      phoneHours: 'Phone hours',
      phoneHoursValue: 'Weekdays 8.00–17.00',
      address: ['Municipal building', 'Storgatan 1', '123 45 Kvirnby'],
      about: 'About the website',
      accessibility: 'Accessibility statement',
      reportProblem: 'Report an accessibility problem',
      privacy: 'Personal data',
      cookies: 'Cookies',
      easyToRead: 'Easy-to-read Swedish',
      organisation: 'Kvirnby municipality (fictional), Storgatan 1, 123 45 Kvirnby',
    },
    transaction: {
      accessibilityReport: 'Report an accessibility problem',
      disabledParkingPermit: 'Parking permit for people with disabilities',
    },
  },
  notFound: {
    title: 'Page not found',
    lead: 'The address may be mistyped, or the page may have moved or been removed.',
    whatYouCanDo: 'What you can do',
    steps: [
      'Check that the address is spelled correctly.',
      'Go to the start page and look for it there.',
    ],
    otherPlaces: 'Other places to go',
    start: 'Start page',
    index: 'All reference pages',
  },
  serviceUnavailable: {
    title: 'The service is closed',
    lead: 'This example service is closed for maintenance. Nothing you did caused this.',
    otherWays: 'Other ways to do it',
    start: 'Start page',
    index: 'All reference pages',
  },
}

const sv: typeof en = {
  notice:
    'Kvirnby är en påhittad kommun. Det här är en referenswebbplats för KvirnUI: inga tjänster är riktiga, och inget du skriver skickas.',
  howBuilt: 'Så är sidan byggd',
  docs: 'KvirnUI-dokumentation',
  siteName: 'Kvirnby kommun',
  title: ({ page }) => `${page} – Kvirnby (påhittad kommun) – KvirnUI`,
  description: 'En referenswebbplats för KvirnUI om en påhittad nordisk kommun.',
  chrome: {
    logoName: 'Kvirnby kommun',
    language: 'Språk',
    languageNames: { sv: 'Svenska', en: 'English' },
    shortcuts: 'Genvägar',
    contact: 'Kontakta oss',
    eServices: 'E-tjänster',
    myPages: 'Mina sidor',
    searchLabel: 'Sök på webbplatsen',
    search: 'Sök',
    menu: 'Meny',
    mainMenu: 'Huvudmeny',
    topics: [
      {
        slug: 'children-and-education',
        label: 'Barn och utbildning',
        overview: 'Allt om barn och utbildning',
        groups: [
          {
            label: 'Förskola',
            slug: 'preschool',
            links: [{ slug: 'preschool/apply', label: 'Ansök om plats' }],
          },
          {
            label: 'Grundskola',
            slug: 'compulsory-school',
            links: [{ slug: 'compulsory-school/primary', label: 'Låg- och mellanstadiet' }],
          },
        ],
        links: [{ slug: 'upper-secondary', label: 'Gymnasieskola' }],
      },
      {
        slug: 'support-and-care',
        label: 'Stöd och omsorg',
        overview: 'Allt om stöd och omsorg',
        groups: [],
        links: [
          { slug: 'support-and-care/elderly-care', label: 'Äldreomsorg' },
          { slug: 'support-and-care/disability-support', label: 'Stöd vid funktionsnedsättning' },
        ],
      },
      {
        slug: 'housing-and-environment',
        label: 'Boende och miljö',
        overview: 'Allt om boende och miljö',
        groups: [],
        links: [
          { slug: 'housing-and-environment/waste', label: 'Avfall och återvinning' },
          { slug: 'housing-and-environment/water', label: 'Vatten och avlopp' },
        ],
      },
      {
        slug: 'transport-and-parking',
        label: 'Trafik och parkering',
        overview: 'Allt om trafik och parkering',
        groups: [],
        links: [
          {
            slug: 'parking/disabled-parking-permit',
            label: 'Parkeringstillstånd för rörelsehindrade',
          },
          { slug: 'transport-and-parking/roads', label: 'Vägar och gatuarbeten' },
        ],
      },
      {
        slug: 'culture-and-leisure',
        label: 'Kultur och fritid',
        overview: 'Allt om kultur och fritid',
        groups: [],
        links: [
          { slug: 'events', label: 'Evenemang' },
          { slug: 'culture-and-leisure/libraries', label: 'Bibliotek' },
        ],
      },
      {
        slug: 'business-and-work',
        label: 'Näringsliv och arbete',
        overview: 'Allt om näringsliv och arbete',
        groups: [],
        links: [
          { slug: 'business-and-work/start-a-business', label: 'Starta företag' },
          { slug: 'business-and-work/jobs', label: 'Jobba i Kvirnby' },
        ],
      },
      {
        slug: 'municipality-and-democracy',
        label: 'Kommun och demokrati',
        overview: 'Allt om kommunen och demokrati',
        groups: [],
        links: [
          { slug: 'news', label: 'Nyheter' },
          { slug: 'contact', label: 'Kontakt och öppettider' },
        ],
      },
    ] as readonly MenuTopic[],
    alert: {
      title: 'Vattnet stängs av i norra Kvirnby onsdag 14 oktober',
      body: 'Vattnet är avstängt kl. 9–15 på grund av arbete på huvudledningen. Fyll kärl i förväg om du kan.',
      link: 'Läs mer om vattenavstängningen',
    },
    footer: {
      contact: 'Kontakta oss',
      contactCentre: 'Kontaktcenter',
      phone: 'Telefon',
      phoneNumber: '0000-00 00 00',
      email: 'E-post',
      phoneHours: 'Telefontider',
      phoneHoursValue: 'Vardagar 8.00–17.00',
      address: ['Kommunhuset', 'Storgatan 1', '123 45 Kvirnby'],
      about: 'Om webbplatsen',
      accessibility: 'Tillgänglighetsredogörelse',
      reportProblem: 'Anmäl brister i tillgängligheten',
      privacy: 'Personuppgifter',
      cookies: 'Kakor',
      easyToRead: 'Lättläst svenska',
      organisation: 'Kvirnby kommun (påhittad), Storgatan 1, 123 45 Kvirnby',
    },
    transaction: {
      accessibilityReport: 'Anmäl brister i tillgängligheten',
      disabledParkingPermit: 'Parkeringstillstånd för rörelsehindrade',
    },
  },
  notFound: {
    title: 'Sidan finns inte',
    lead: 'Adressen kan vara felskriven, eller så har sidan flyttats eller tagits bort.',
    whatYouCanDo: 'Det här kan du göra',
    steps: [
      'Kontrollera att adressen är rätt stavad.',
      'Gå till startsidan och leta efter sidan där.',
    ],
    otherPlaces: 'Andra ställen att gå till',
    start: 'Startsidan',
    index: 'Alla referenssidor',
  },
  serviceUnavailable: {
    title: 'Tjänsten är stängd',
    lead: 'Den här exempeltjänsten är stängd för underhåll. Det beror inte på något du har gjort.',
    otherWays: 'Andra sätt att göra det',
    start: 'Startsidan',
    index: 'Alla referenssidor',
  },
}

export const referenceMessages: Record<ReferenceLocale, typeof en> = { sv, en }

// The docs-shell side (`/reference` and `/reference/how/{page}`): English, like the rest of the docs.
export const referenceDocsMessages = {
  meta: { title: 'Reference site', how: 'How it’s built' },
  index: {
    heading: 'Reference site',
    lead: 'Kvirnby kommun is a fictional municipality site built only from @kvirn-ui/* and theme.css, the way an adopter builds theirs. Each page links to how it is built.',
    notice:
      'No service on the reference site is real and nothing you enter is sent. It is an example, not a municipality’s site.',
    pagesHeading: 'Pages',
    open: ({ page, language }: { page: string; language: string }) => `Open ${page} (${language})`,
    howBuilt: ({ page }: { page: string }) => `How ${page} is built`,
    planned: 'Not built yet',
    languages: { sv: 'Swedish', en: 'English' },
  },
  how: {
    heading: ({ page }: { page: string }) => `How ${page} is built`,
    lead: 'The parts this page uses, each with its documentation. The page imports only theme.css, the self-hosted font CSS and @kvirn-ui/*.',
    partsHeading: 'Parts',
    openHeading: 'See the page',
    back: 'Back to the reference site',
  },
}

export interface ReferencePage {
  slug: string
  title: string
  /** The page's path below `/reference/{locale}`; `undefined` while it is not built. */
  path?: string
  parts: readonly { label: string; href: string }[]
}

export const referencePages: readonly ReferencePage[] = [
  {
    slug: 'not-found',
    title: 'Page not found (404)',
    path: '/does-not-exist',
    parts: [
      { label: 'Container', href: '/components/container' },
      { label: 'Heading', href: '/components/heading' },
      { label: 'Link', href: '/components/link' },
      { label: 'Skip link', href: '/components/skip-link' },
      { label: 'Top bar', href: '/components/top-bar' },
      { label: 'Route focus', href: '/components/route-focus' },
    ],
  },
  {
    slug: 'service-unavailable',
    title: 'Service unavailable',
    path: '/service-unavailable',
    parts: [
      { label: 'Container', href: '/components/container' },
      { label: 'Heading', href: '/components/heading' },
      { label: 'Link', href: '/components/link' },
      { label: 'Skip link', href: '/components/skip-link' },
      { label: 'Top bar', href: '/components/top-bar' },
    ],
  },
  {
    slug: 'start',
    title: 'Start page',
    path: '',
    parts: [
      { label: 'Start page content type (layout reference)', href: '/content-types/start-page' },
      { label: 'Hero', href: '/patterns/hero' },
      { label: 'Nav tiles', href: '/patterns/nav-tiles' },
    ],
  },
  {
    slug: 'topic',
    title: 'Topic page',
    path: '/children-and-education',
    parts: [
      { label: 'Subpage content type (layout reference)', href: '/content-types/subpage' },
      { label: 'Page tools', href: '/patterns/page-tools' },
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Nav tiles', href: '/patterns/nav-tiles' },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact and opening hours',
    path: '/contact',
    parts: [
      { label: 'Contact content type', href: '/content-types/contact' },
      { label: 'Service link', href: '/patterns/service-link' },
      { label: 'Alert', href: '/components/alert' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'preschool-unit',
    title: 'Unit page (Hillside preschool)',
    path: '/preschool/hillside',
    parts: [
      { label: 'Unit page content type', href: '/content-types/unit-page' },
      { label: 'Service link', href: '/patterns/service-link' },
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Card', href: '/components/card' },
    ],
  },
  {
    slug: 'eservice-start',
    title: 'E-service start (Parking permit)',
    path: '/parking/disabled-parking-permit',
    parts: [
      { label: 'Service link', href: '/patterns/service-link' },
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'List', href: '/components/list' },
    ],
  },
  {
    slug: 'sign-in',
    title: 'Sign in (Parking permit)',
    path: '/parking/disabled-parking-permit/sign-in',
    parts: [
      { label: 'Form page content type (transaction header)', href: '/content-types/form-page' },
      { label: 'Card', href: '/components/card' },
      { label: 'Grid', href: '/components/grid' },
      { label: 'Alert', href: '/components/alert' },
      { label: 'Link', href: '/components/link' },
    ],
  },
  {
    slug: 'question',
    title: 'Question page (Parking permit)',
    path: '/parking/disabled-parking-permit/apply',
    parts: [
      { label: 'Form page content type (transaction header)', href: '/content-types/form-page' },
      { label: 'Stepper', href: '/components/stepper' },
      { label: 'Error summary', href: '/components/error-summary' },
      { label: 'Radio group', href: '/components/radio-group' },
      { label: 'Field', href: '/components/field' },
    ],
  },
  {
    slug: 'check-answers',
    title: 'Check your answers (Parking permit)',
    path: '/parking/disabled-parking-permit/apply/check',
    parts: [
      { label: 'Definition list', href: '/components/definition-list' },
      { label: 'Alert', href: '/components/alert' },
      { label: 'Button', href: '/components/button' },
    ],
  },
  {
    slug: 'confirmation',
    title: 'Confirmation (Parking permit)',
    path: '/parking/disabled-parking-permit/apply/sent',
    parts: [
      { label: 'Alert', href: '/components/alert' },
      { label: 'Copy button', href: '/components/copy-button' },
    ],
  },
  {
    slug: 'session-timeout',
    title: 'Session timeout (Parking permit)',
    path: '/parking/disabled-parking-permit/apply/timeout',
    parts: [
      { label: 'Alert dialog (timeout warning)', href: '/components/alert-dialog' },
      { label: 'Announcer', href: '/components/announcer' },
      { label: 'Alert', href: '/components/alert' },
    ],
  },
  {
    slug: 'my-pages',
    title: 'My pages',
    path: '/my-pages',
    parts: [
      { label: 'My pages content type', href: '/content-types/my-pages' },
      { label: 'Card', href: '/components/card' },
      { label: 'Badge', href: '/components/badge' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'case-detail',
    title: 'Case detail',
    path: '/my-pages/cases/pk-2026-004217',
    parts: [
      { label: 'Case detail content type', href: '/content-types/case-detail' },
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Badge', href: '/components/badge' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'content-page',
    title: 'Content page (Preschool)',
    path: '/preschool',
    parts: [
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Prose', href: '/components/prose' },
      { label: 'Table of contents', href: '/components/table-of-contents' },
      { label: 'Accordion', href: '/components/accordion' },
      { label: 'Card', href: '/components/card' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    path: '/privacy',
    parts: [
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Prose', href: '/components/prose' },
      { label: 'Table of contents', href: '/components/table-of-contents' },
      { label: 'Table', href: '/components/table' },
      { label: 'Card', href: '/components/card' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    path: '/cookies',
    parts: [
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Prose', href: '/components/prose' },
    ],
  },
  {
    slug: 'easy-to-read',
    title: 'Easy-to-read Swedish',
    path: '/easy-to-read',
    parts: [
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Prose', href: '/components/prose' },
      { label: 'Card', href: '/components/card' },
      { label: 'Definition list', href: '/components/definition-list' },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility statement',
    path: '/accessibility',
    parts: [
      {
        label: 'Accessibility statement content type (layout reference)',
        href: '/content-types/accessibility-statement',
      },
      { label: 'Breadcrumb', href: '/components/breadcrumb' },
      { label: 'Prose', href: '/components/prose' },
      { label: 'Page tools', href: '/patterns/page-tools' },
    ],
  },
  {
    slug: 'accessibility-feedback',
    title: 'Accessibility feedback form',
    path: '/accessibility/report',
    parts: [
      { label: 'Form page content type (layout reference)', href: '/content-types/form-page' },
      { label: 'Error summary', href: '/components/error-summary' },
      { label: 'Field', href: '/components/field' },
      { label: 'Textarea', href: '/components/textarea' },
      { label: 'Alert', href: '/components/alert' },
    ],
  },
  {
    slug: 'news',
    title: 'News list and article',
    path: '/news',
    parts: [
      { label: 'News list content type (layout reference)', href: '/content-types/news-list' },
      {
        label: 'News article content type (layout reference)',
        href: '/content-types/news-article',
      },
      { label: 'Pagination', href: '/components/pagination' },
      { label: 'Page tools', href: '/patterns/page-tools' },
    ],
  },
  {
    slug: 'events',
    title: 'Event list and event',
    path: '/events',
    parts: [
      { label: 'Event list content type (layout reference)', href: '/content-types/event-list' },
      { label: 'Event content type (layout reference)', href: '/content-types/event' },
      { label: 'Alert', href: '/components/alert' },
      { label: 'Definition list', href: '/components/definition-list' },
      { label: 'Service link', href: '/patterns/service-link' },
    ],
  },
]
