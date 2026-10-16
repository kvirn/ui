// kv-lang-ok-file: the reference site is bilingual (sv and en), so this file holds its Swedish and English copy.
// Strings of the reference site's e-service pages: the parking permit's start page (P4) and sign-in (P5).
// The sv object is typed by the en shape, so a missing key is a type error. Kvirnby is fictional.
import type { ReferenceLocale } from './reference.ts'

const en = {
  start: {
    title: 'Parking permit for people with disabilities',
    heading: 'Parking permit for people with disabilities',
    lead: 'A permit lets you park closer to where you are going. Apply online, or contact us and we help you.',
    action: 'Apply for a parking permit',
    whoHeading: 'Who can apply',
    whoBody:
      'You can apply if you live in Kvirnby and have a disability that makes it hard to walk far. A passenger can apply on behalf of a child.',
    needHeading: 'What you need',
    need: [
      'An e-identification, to sign in.',
      'A doctor’s certificate that is less than three months old.',
      'A passport photo, as a file, if you do not have a photo on record.',
    ],
    timeHeading: 'How long it takes',
    timeBody: 'We decide within four weeks. You get the answer in My pages and by post.',
    costHeading: 'What it costs',
    costBody: 'The permit is free. A replacement for a lost permit costs 200 kronor.',
    helpHeading: 'Other ways to apply',
    helpBody: 'Call or visit the contact centre. We fill in the application with you.',
    contact: 'Contact and opening hours',
  },
  signIn: {
    title: 'Sign in',
    heading: 'Sign in',
    back: 'Back to the service description',
    notice: 'Nothing is checked on this page: every choice leads to the next step as an example.',
    noticeTitle: 'This is an example',
    choose: 'Choose how to sign in',
    methods: ['E-identification, example one', 'E-identification, example two'],
    otherHeading: 'Other ways to apply',
    otherBody: 'You can also contact us or visit the service centre. We help you fill in the form.',
    contact: 'Contact us',
  },
  apply: {
    titleSuffix: 'Parking permit',
    back: { signIn: 'Back to sign in', previous: 'Back to the previous question' },
    steps: ['Who the permit is for', 'Your vehicle', 'How to reach you'],
    next: 'Continue',
    who: {
      title: 'Who is the permit for?',
      options: [
        { value: 'me', label: 'For me' },
        { value: 'child', label: 'For my child' },
      ],
      error: 'Choose who the permit is for',
    },
    vehicle: {
      title: 'What is the vehicle’s registration number?',
      help: 'For example ABC 123. The permit is tied to this vehicle.',
      error: 'Enter the registration number, for example ABC 123',
    },
    contact: {
      title: 'What is your phone number?',
      help: 'We call only if something is missing from your application.',
      error: 'Enter a phone number with at least six digits, for example 070 000 00 00',
    },
    check: {
      title: 'Check your answers',
      heading: 'Check your answers',
      lead: 'Read your answers before you send the application. Use Change to correct one.',
      terms: ['Who the permit is for', 'Registration number', 'Phone number'],
      who: { me: 'For me', child: 'For my child' },
      missing: {
        who: 'Answer who the permit is for',
        vehicle: 'Answer the registration number',
        contact: 'Answer your phone number',
      },
      send: 'Send application',
    },
    sent: {
      title: 'Application sent',
      heading: 'Your application is sent',
      successTitle: 'We have received your application',
      referenceIntro: 'Your reference number is',
      copy: 'Copy reference number',
      nextHeading: 'What happens next',
      nextBody: 'We decide within four weeks and send the answer to My pages and by post.',
      exampleNote: 'Nothing was sent: this is an example.',
      noReference: 'There is no application to show. Start a new one.',
      toStart: 'Back to the start page',
      toService: 'Start a new application',
      toMyPages: 'Go to My pages',
    },
  },
  timeout: {
    simulate: 'Simulate session timeout',
    warningTitle: 'You will be signed out soon',
    warningBody: ({ time }: { time: string }) =>
      `For your security, we will sign you out in ${time}. Your answers are kept.`,
    minutes: ({ count }: { count: number }) => `${count} ${count === 1 ? 'minute' : 'minutes'}`,
    oneMinuteLeft: 'One minute left until you are signed out.',
    stay: 'Stay signed in',
    signOut: 'Sign out',
    title: 'You have been signed out',
    heading: 'You have been signed out',
    lead: 'The session ended after a period of inactivity.',
    kept: 'Your answers are kept in this browser, so you do not have to start over. Sign in again to continue.',
    signInAgain: 'Sign in again',
    toStart: 'Back to the start page',
  },
  myPages: {
    title: 'My pages',
    heading: 'My pages',
    lead: 'The cases you have started with Kvirnby municipality. The cases here are made up for the example.',
    casesHeading: 'Your cases',
    caseNumber: 'Case number',
    sent: 'Sent',
    lastChange: 'Last change',
    contactHeading: 'Questions about the case',
    contactBody: 'Call the contact centre and give the case number.',
    contact: 'Contact and opening hours',
    nextStep: 'Next step',
    toMyPages: 'Back to My pages',
    statuses: { received: 'Received', 'in-progress': 'In progress', decided: 'Decision made' },
    cases: [
      {
        id: 'pk-2026-004217',
        number: 'PK-2026-004217',
        title: 'Parking permit for people with disabilities',
        status: 'in-progress',
        nextStep: 'We are reading your doctor’s certificate. You get a decision by 11 November.',
        sent: '2026-10-14',
        lastChange: '2026-10-14',
      },
      {
        id: 'fk-2026-001893',
        number: 'FK-2026-001893',
        title: 'Preschool place, Hillside preschool',
        status: 'decided',
        nextStep: 'Accept or decline the place in the decision letter before 30 October.',
        sent: '2026-08-20',
        lastChange: '2026-10-02',
      },
    ] as readonly {
      id: string
      number: string
      title: string
      status: 'received' | 'in-progress' | 'decided'
      nextStep: string
      sent: string
      lastChange: string
    }[],
  },
}

const sv: typeof en = {
  start: {
    title: 'Parkeringstillstånd för rörelsehindrade',
    heading: 'Parkeringstillstånd för rörelsehindrade',
    lead: 'Med ett tillstånd kan du parkera närmare dit du ska. Ansök på nätet, eller kontakta oss så hjälper vi dig.',
    action: 'Ansök om parkeringstillstånd',
    whoHeading: 'Vem kan ansöka',
    whoBody:
      'Du kan ansöka om du bor i Kvirnby och har en funktionsnedsättning som gör det svårt att gå långt. Du kan ansöka för ett barns räkning.',
    needHeading: 'Det här behöver du',
    need: [
      'En e-legitimation för att logga in.',
      'Ett läkarintyg som är yngre än tre månader.',
      'Ett passfoto som fil, om vi inte redan har ett foto på dig.',
    ],
    timeHeading: 'Hur lång tid det tar',
    timeBody: 'Vi beslutar inom fyra veckor. Du får svaret på Mina sidor och med post.',
    costHeading: 'Vad det kostar',
    costBody:
      'Tillståndet är gratis. Ett ersättningstillstånd för ett borttappat kostar 200 kronor.',
    helpHeading: 'Andra sätt att ansöka',
    helpBody: 'Ring eller besök kontaktcenter. Vi fyller i ansökan tillsammans med dig.',
    contact: 'Kontakt och öppettider',
  },
  signIn: {
    title: 'Logga in',
    heading: 'Logga in',
    back: 'Tillbaka till beskrivningen av tjänsten',
    notice: 'Inget kontrolleras på den här sidan: varje val leder till nästa steg som ett exempel.',
    noticeTitle: 'Det här är ett exempel',
    choose: 'Välj hur du vill logga in',
    methods: ['E-legitimation, exempel ett', 'E-legitimation, exempel två'],
    otherHeading: 'Andra sätt att ansöka',
    otherBody:
      'Du kan också kontakta oss eller besöka servicecenter. Vi hjälper dig att fylla i blanketten.',
    contact: 'Kontakta oss',
  },
  apply: {
    titleSuffix: 'Parkeringstillstånd',
    back: { signIn: 'Tillbaka till inloggningen', previous: 'Tillbaka till föregående fråga' },
    steps: ['Vem tillståndet gäller', 'Ditt fordon', 'Så når vi dig'],
    next: 'Fortsätt',
    who: {
      title: 'Vem gäller tillståndet?',
      options: [
        { value: 'me', label: 'Mig' },
        { value: 'child', label: 'Mitt barn' },
      ],
      error: 'Välj vem tillståndet gäller',
    },
    vehicle: {
      title: 'Vilket registreringsnummer har fordonet?',
      help: 'Till exempel ABC 123. Tillståndet knyts till det här fordonet.',
      error: 'Ange registreringsnumret, till exempel ABC 123',
    },
    contact: {
      title: 'Vilket telefonnummer har du?',
      help: 'Vi ringer bara om något saknas i din ansökan.',
      error: 'Ange ett telefonnummer med minst sex siffror, till exempel 070 000 00 00',
    },
    check: {
      title: 'Kontrollera dina svar',
      heading: 'Kontrollera dina svar',
      lead: 'Läs igenom svaren innan du skickar ansökan. Använd Ändra för att rätta ett svar.',
      terms: ['Vem tillståndet gäller', 'Registreringsnummer', 'Telefonnummer'],
      who: { me: 'Mig', child: 'Mitt barn' },
      missing: {
        who: 'Svara på vem tillståndet gäller',
        vehicle: 'Svara på registreringsnumret',
        contact: 'Svara på telefonnumret',
      },
      send: 'Skicka ansökan',
    },
    sent: {
      title: 'Ansökan skickad',
      heading: 'Din ansökan är skickad',
      successTitle: 'Vi har tagit emot din ansökan',
      referenceIntro: 'Ditt ärendenummer är',
      copy: 'Kopiera ärendenumret',
      nextHeading: 'Det här händer sedan',
      nextBody: 'Vi beslutar inom fyra veckor och skickar svaret till Mina sidor och med post.',
      exampleNote: 'Inget skickades: det här är ett exempel.',
      noReference: 'Det finns ingen ansökan att visa. Starta en ny.',
      toStart: 'Tillbaka till startsidan',
      toService: 'Starta en ny ansökan',
      toMyPages: 'Gå till Mina sidor',
    },
  },
  timeout: {
    simulate: 'Simulera avslutad session',
    warningTitle: 'Du loggas snart ut',
    warningBody: ({ time }: { time: string }) =>
      `Av säkerhetsskäl loggar vi ut dig om ${time}. Dina svar finns kvar.`,
    minutes: ({ count }: { count: number }) => `${count} ${count === 1 ? 'minut' : 'minuter'}`,
    oneMinuteLeft: 'En minut kvar tills du loggas ut.',
    stay: 'Fortsätt',
    signOut: 'Logga ut',
    title: 'Du har loggats ut',
    heading: 'Du har loggats ut',
    lead: 'Sessionen avslutades efter en tid utan aktivitet.',
    kept: 'Dina svar finns kvar i den här webbläsaren, så du behöver inte börja om. Logga in igen för att fortsätta.',
    signInAgain: 'Logga in igen',
    toStart: 'Tillbaka till startsidan',
  },
  myPages: {
    title: 'Mina sidor',
    heading: 'Mina sidor',
    lead: 'Ärendena du har startat hos Kvirnby kommun. Ärendena här är påhittade för exemplet.',
    casesHeading: 'Dina ärenden',
    caseNumber: 'Ärendenummer',
    sent: 'Skickat',
    lastChange: 'Senast ändrat',
    contactHeading: 'Frågor om ärendet',
    contactBody: 'Ring kontaktcenter och uppge ärendenumret.',
    contact: 'Kontakt och öppettider',
    nextStep: 'Nästa steg',
    toMyPages: 'Tillbaka till Mina sidor',
    statuses: {
      received: 'Mottaget',
      'in-progress': 'Under handläggning',
      decided: 'Beslut fattat',
    },
    cases: [
      {
        id: 'pk-2026-004217',
        number: 'PK-2026-004217',
        title: 'Parkeringstillstånd för rörelsehindrade',
        status: 'in-progress',
        nextStep: 'Vi läser ditt läkarintyg. Du får beslut senast den 11 november.',
        sent: '2026-10-14',
        lastChange: '2026-10-14',
      },
      {
        id: 'fk-2026-001893',
        number: 'FK-2026-001893',
        title: 'Förskoleplats, Backens förskola',
        status: 'decided',
        nextStep: 'Tacka ja eller nej till platsen i beslutsbrevet senast den 30 oktober.',
        sent: '2026-08-20',
        lastChange: '2026-10-02',
      },
    ],
  },
}

export const referenceEserviceMessages: Record<ReferenceLocale, typeof en> = { sv, en }
