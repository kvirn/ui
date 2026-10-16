// kv-lang-ok-file: the reference site is bilingual (sv and en), so this file holds its Swedish and English copy.
// Strings of the reference site's accessibility statement (P17) and feedback form (P18, R5).
// The sv object is typed by the en shape, so a missing key is a type error. Kvirnby is fictional.
// The statement never states a conformance status: the fill-in box is the adopter's to write.
import type { ReferenceLocale } from './reference.ts'

const en = {
  statement: {
    title: 'Accessibility',
    heading: 'Accessibility of the Kvirnby website',
    lead: 'Kvirnby municipality wants everyone to be able to use this website. This statement says how accessible it is, what is not yet, and how to tell us.',
    howHeading: 'How accessible the website is',
    fillIn: 'Fill in:',
    fillInBody:
      'write how well the website meets the requirements (fully, partly or not), the standard and version you tested against, and the date. The reference site never states a status.',
    notHeading: 'What is not accessible',
    notLead: 'These parts do not yet meet the requirements.',
    problems: [
      'Some PDF documents on the council pages have no heading structure. They were published before the requirements applied. We ask for an accessible version on request and replace the PDFs by 31 March 2027.',
      'The recorded council meetings have no captions. The captioning service is not yet in place. Captions are added from 1 January 2027.',
    ],
    testedHeading: 'How we tested',
    testedBody:
      'We tested the website with a keyboard, with a screen reader and at 400 % zoom, and checked it with automated tools. A person with a disability took part in the test.',
    reportHeading: 'Report a problem',
    reportBody: "Can't use something on this website? Tell us and we will help you or fix it.",
    reportLink: 'Report an accessibility problem',
    contactBefore: 'Or ask the ',
    contactLink: 'contact centre',
    supervisorHeading: 'Supervisory authority',
    supervisorBody:
      'If you are not satisfied with our answer, you can report it to the market surveillance authority in your country. Fill in the name and the address of the authority that supervises you.',
    published: 'Published:',
    reviewed: 'Reviewed:',
    publishedDate: '1 September 2026',
    reviewedDate: '1 October 2026',
  },
  form: {
    title: 'Report an accessibility problem',
    back: 'Back to accessibility',
    heading: 'Report an accessibility problem',
    pageLabel: 'Which page has the problem?',
    pageHelp: 'We filled in the page you came from. Change it if needed.',
    pageValue: 'https://www.kvirnby.example/preschool',
    problemLabel: 'What is wrong?',
    emailLabel: 'Your email address',
    emailHelp: 'Only if you want a reply. We use it for nothing else.',
    send: 'Send',
    pageError: 'Enter the address of the page',
    problemError: 'Describe what is wrong',
    emailError: 'Enter your email address in the form name@example.com',
  },
  sent: {
    title: 'Report sent',
    heading: 'Thank you for your report',
    alertTitle: 'Your report is sent',
    reference: 'Your reference number is',
    referenceNumber: 'KV-2026-004217',
    copy: 'Copy reference number',
    nextHeading: 'What happens next',
    nextBody:
      'We read your report within five working days. If you gave an email address, we reply there and tell you when the problem is fixed.',
    nothingSent: 'Nothing was sent: this is an example.',
    backToStart: 'Back to the start page',
  },
}

const sv: typeof en = {
  statement: {
    title: 'Tillgänglighet',
    heading: 'Tillgänglighetsredogörelse för Kvirnbys webbplats',
    lead: 'Kvirnby kommun vill att alla ska kunna använda webbplatsen. Här beskriver vi hur tillgänglig den är, vad som inte är det ännu och hur du kan höra av dig.',
    howHeading: 'Hur tillgänglig webbplatsen är',
    fillIn: 'Fyll i:',
    fillInBody:
      'skriv hur väl webbplatsen uppfyller kraven (helt, delvis eller inte alls), vilken standard och version ni har testat mot och datum. Referensplatsen anger aldrig en status.',
    notHeading: 'Innehåll som inte är tillgängligt',
    notLead: 'De här delarna uppfyller ännu inte kraven.',
    problems: [
      'Vissa pdf-dokument på nämndsidorna saknar rubrikstruktur. De publicerades innan kraven gällde. Vi tillhandahåller en tillgänglig version på begäran och ersätter pdf-filerna senast 31 mars 2027.',
      'De inspelade nämndsammanträdena saknar textning. Textningstjänsten är ännu inte på plats. Textning läggs till från 1 januari 2027.',
    ],
    testedHeading: 'Hur vi har testat',
    testedBody:
      'Vi har testat webbplatsen med tangentbord, med skärmläsare och med 400 % förstoring och kontrollerat den med automatiska verktyg. En person med funktionsnedsättning deltog i testet.',
    reportHeading: 'Anmäl brister',
    reportBody:
      'Kan du inte använda något på webbplatsen? Berätta för oss, så hjälper vi dig eller åtgärdar bristen.',
    reportLink: 'Anmäl brister i tillgängligheten',
    contactBefore: 'Eller fråga ',
    contactLink: 'kontaktcentret',
    supervisorHeading: 'Tillsynsmyndighet',
    supervisorBody:
      'Om du inte är nöjd med vårt svar kan du anmäla det till Myndigheten för digital förvaltning (Digg), som granskar att kraven i lagen om tillgänglighet till digital offentlig service följs. Från 1 januari 2027 är Post- och telestyrelsen (PTS) tillsynsmyndighet.',
    published: 'Publicerad:',
    reviewed: 'Granskad:',
    publishedDate: '1 september 2026',
    reviewedDate: '1 oktober 2026',
  },
  form: {
    title: 'Anmäl brister i tillgängligheten',
    back: 'Tillbaka till tillgänglighet',
    heading: 'Anmäl brister i tillgängligheten',
    pageLabel: 'Vilken sida har bristen?',
    pageHelp: 'Vi har fyllt i sidan du kom från. Ändra om det behövs.',
    pageValue: 'https://www.kvirnby.example/sv/preschool',
    problemLabel: 'Vad är fel?',
    emailLabel: 'Din e-postadress',
    emailHelp: 'Bara om du vill ha svar. Vi använder den inte till något annat.',
    send: 'Skicka',
    pageError: 'Ange adressen till sidan',
    problemError: 'Beskriv vad som är fel',
    emailError: 'Ange din e-postadress i formen namn@exempel.se',
  },
  sent: {
    title: 'Anmälan skickad',
    heading: 'Tack för din anmälan',
    alertTitle: 'Din anmälan är skickad',
    reference: 'Ditt ärendenummer är',
    referenceNumber: 'KV-2026-004217',
    copy: 'Kopiera ärendenummer',
    nextHeading: 'Vad händer nu',
    nextBody:
      'Vi läser din anmälan inom fem arbetsdagar. Om du har angett en e-postadress svarar vi dit och berättar när bristen är åtgärdad.',
    nothingSent: 'Inget skickades: det här är ett exempel.',
    backToStart: 'Tillbaka till startsidan',
  },
}

export const referenceStatementMessages: Record<ReferenceLocale, typeof en> = { sv, en }
