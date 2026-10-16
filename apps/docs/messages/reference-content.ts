// kv-lang-ok-file: the reference site is bilingual (sv and en), so this file holds its Swedish and English copy.
import type { ReferenceLocale } from './reference.ts'

const en = {
  youAreHere: 'You are here',
  start: 'Start',
  contents: 'Contents',
  phone: 'Phone',
  email: 'Email',
  phoneHours: 'Phone hours',
  lastUpdated: 'Last updated:',
  updatedDate: '2 October 2026',
  updatedIso: '2026-10-02',
  copyLink: 'Copy link',
  print: 'Print',
  preschoolOffice: {
    name: 'Preschool office',
    phone: '0000-00 00 01',
    email: 'preschool@kvirnby.example',
    phoneHoursValue: 'Monday to Thursday 9.00–11.00',
  },
  preschool: {
    title: 'Preschool',
    parent: 'Children and education',
    sectionNav: 'In this section',
    nav: {
      parent: 'Children and education',
      apply: 'Apply for a place',
      primary: 'Primary school',
      upperSecondary: 'Upper secondary school',
    },
    lead: 'Every child from the age of one has the right to a place in preschool. Here you find who can get a place, how to apply and what it costs.',
    toc: {
      who: 'Who can get a place?',
      apply: 'How to apply',
      fees: 'Fees',
      faq: 'Frequently asked questions',
      contact: 'Contact us',
      related: 'Related pages',
    },
    whoText:
      'Children who live in Kvirnby can get a place in preschool from the age of one. Your child has a place within four months of your application.',
    steps: [
      'Log in to My pages with your e-ID.',
      'Choose the preschools you would like and the date you want the place from.',
      'Send the application. You get an answer by letter.',
    ],
    serviceLink: 'Apply for a preschool place',
    alternativeBefore: 'Other ways to apply: ',
    alternativeLink: 'contact the preschool office',
    alternativeAfter: ' and we send you the form.',
    feesText:
      'The fee depends on your household income and on how many children you have in childcare. The highest fee for the first child is 1 645 kronor a month.',
    faq: [
      {
        question: 'Can I apply before my child is born?',
        answer:
          'No. You can apply when your child has a personal identity number, and at the earliest four months before you need the place.',
      },
      {
        question: 'What happens if I do not answer the offer?',
        answer: 'The offer is withdrawn after ten days, and you will need to apply again.',
      },
      {
        question: 'Can I choose a preschool?',
        answer:
          'You can say which preschools you prefer. We try to offer one of them, but cannot promise it.',
      },
    ],
    related: {
      apply: 'Apply for a place',
      primary: 'Primary school',
      contact: 'Contact us',
    },
  },
  privacy: {
    title: 'How we handle personal data',
    lead: 'Here you read which personal data Kvirnby municipality collects, why, who sees it and what you can ask us to do with it.',
    toc: {
      responsible: 'Who is responsible',
      collect: 'What we collect and why',
      share: 'Who we share it with',
      rights: 'Your rights',
      officer: 'Data protection officer',
      complain: 'Complain to the supervisory authority',
    },
    responsibleText:
      'Kvirnby municipality, through its municipal board, is responsible for the personal data described on this page.',
    collectText:
      'We collect only what we need for the purposes below, and we keep it no longer than the table says.',
    tableCaption: 'Purposes for which Kvirnby municipality handles personal data',
    purposeColumn: 'Purpose',
    basisColumn: 'Legal basis',
    keptColumn: 'How long we keep it',
    purposes: [
      {
        purpose: 'Handle your application for a preschool place',
        legalBasis: 'Public task',
        keptFor: 'Until the place ends, then 2 years',
      },
      {
        purpose: 'Answer your message to the contact centre',
        legalBasis: 'Public task',
        keptFor: '12 months after the case is closed',
      },
      {
        purpose: 'Send the newsletter you signed up for',
        legalBasis: 'Consent',
        keptFor: 'Until you unsubscribe',
      },
      {
        purpose: 'Keep an account on My pages',
        legalBasis: 'Public task',
        keptFor: 'Until you close the account',
      },
    ],
    shareText:
      'We share personal data only with those who need it to do their part of the work, such as the preschool your child is offered a place in. We do not sell personal data.',
    rightsLead: 'You have the right to:',
    rights: [
      'ask which personal data we hold about you',
      'ask us to correct data that is wrong',
      'ask us to delete data we no longer need',
      'ask us to limit how we use your data',
      'object to how we use your data',
    ],
    officerText: 'Ask the data protection officer about how we handle your data.',
    officerEmail: 'dataprotection@kvirnby.example',
    officerPhone: '0000-00 00 02',
    complainText:
      'If you think we handle your data wrongly, you can complain to the supervisory authority. The authority and how to contact it are named here once a lawyer has checked the text.',
  },
  cookies: {
    title: 'Cookies',
    lead: 'This website sets no cookies.',
    storeHeading: 'What we store on your device',
    storeText:
      'If you choose a display setting, such as a larger text size or a darker colour scheme, your browser remembers your choice on your device. It is stored only after you choose it. It is never sent to us or to anyone else.',
    noTrackingText:
      'We do not use analytics, advertising or any service from another company that tracks you, so there is nothing to accept or decline.',
    changeHeading: 'Change or remove it',
    changeText:
      'Choose another display setting or reset it to the default. You can also clear the site data for this website in your browser.',
  },
  easyToRead: {
    title: 'Preschool in easy-to-read',
    onlySwedish: 'This page is only in Swedish.',
    onlySwedishBody:
      'Easy-to-read text is written for one language by people who know it well, so this page has no English version.',
    swedishLink: 'Read the page in easy Swedish',
    swedishName: 'Förskola på lättläst svenska',
    preschoolLink: 'Preschool in English',
  },
}

const sv: typeof en = {
  youAreHere: 'Du är här',
  start: 'Start',
  contents: 'Innehåll',
  phone: 'Telefon',
  email: 'E-post',
  phoneHours: 'Telefontid',
  lastUpdated: 'Senast uppdaterad:',
  updatedDate: '2 oktober 2026',
  updatedIso: '2026-10-02',
  copyLink: 'Kopiera länk',
  print: 'Skriv ut',
  preschoolOffice: {
    name: 'Förskolekontoret',
    phone: '0000-00 00 01',
    email: 'forskola@kvirnby.example',
    phoneHoursValue: 'Måndag till torsdag 9.00–11.00',
  },
  preschool: {
    title: 'Förskola',
    parent: 'Barn och utbildning',
    sectionNav: 'I det här avsnittet',
    nav: {
      parent: 'Barn och utbildning',
      apply: 'Ansök om plats',
      primary: 'Grundskola',
      upperSecondary: 'Gymnasieskola',
    },
    lead: 'Alla barn från ett års ålder har rätt till en plats i förskolan. Här hittar du vem som kan få plats, hur du ansöker och vad det kostar.',
    toc: {
      who: 'Vem kan få en plats?',
      apply: 'Så ansöker du',
      fees: 'Avgifter',
      faq: 'Vanliga frågor',
      contact: 'Kontakta oss',
      related: 'Relaterade sidor',
    },
    whoText:
      'Barn som bor i Kvirnby kan få en plats i förskolan från ett års ålder. Ditt barn får en plats inom fyra månader från din ansökan.',
    steps: [
      'Logga in på Mina sidor med din e-legitimation.',
      'Välj de förskolor du vill ha och det datum du vill ha platsen från.',
      'Skicka ansökan. Du får svar med brev.',
    ],
    serviceLink: 'Ansök om förskoleplats',
    alternativeBefore: 'Andra sätt att ansöka: ',
    alternativeLink: 'kontakta förskolekontoret',
    alternativeAfter: ' så skickar vi blanketten till dig.',
    feesText:
      'Avgiften beror på hushållets inkomst och på hur många barn du har i barnomsorgen. Den högsta avgiften för första barnet är 1 645 kronor i månaden.',
    faq: [
      {
        question: 'Kan jag ansöka innan mitt barn är fött?',
        answer:
          'Nej. Du kan ansöka när ditt barn har ett personnummer, och som tidigast fyra månader innan du behöver platsen.',
      },
      {
        question: 'Vad händer om jag inte svarar på erbjudandet?',
        answer: 'Erbjudandet dras tillbaka efter tio dagar och du behöver ansöka igen.',
      },
      {
        question: 'Kan jag välja förskola?',
        answer:
          'Du kan säga vilka förskolor du helst vill ha. Vi försöker erbjuda någon av dem, men kan inte lova det.',
      },
    ],
    related: {
      apply: 'Ansök om plats',
      primary: 'Grundskola',
      contact: 'Kontakta oss',
    },
  },
  privacy: {
    title: 'Så hanterar vi personuppgifter',
    lead: 'Här läser du vilka personuppgifter Kvirnby kommun samlar in, varför, vem som ser dem och vad du kan be oss göra med dem.',
    toc: {
      responsible: 'Vem som ansvarar',
      collect: 'Vad vi samlar in och varför',
      share: 'Vilka vi delar uppgifterna med',
      rights: 'Dina rättigheter',
      officer: 'Dataskyddsombud',
      complain: 'Klaga hos tillsynsmyndigheten',
    },
    responsibleText:
      'Kvirnby kommun, genom kommunstyrelsen, ansvarar för de personuppgifter som beskrivs på den här sidan.',
    collectText:
      'Vi samlar bara in det vi behöver för ändamålen nedan, och vi sparar det inte längre än tabellen säger.',
    tableCaption: 'Ändamål för vilka Kvirnby kommun hanterar personuppgifter',
    purposeColumn: 'Ändamål',
    basisColumn: 'Rättslig grund',
    keptColumn: 'Hur länge vi sparar',
    purposes: [
      {
        purpose: 'Hantera din ansökan om förskoleplats',
        legalBasis: 'Uppgift av allmänt intresse',
        keptFor: 'Tills platsen upphör, sedan 2 år',
      },
      {
        purpose: 'Svara på ditt meddelande till kontaktcentret',
        legalBasis: 'Uppgift av allmänt intresse',
        keptFor: '12 månader efter att ärendet avslutats',
      },
      {
        purpose: 'Skicka det nyhetsbrev du har anmält dig till',
        legalBasis: 'Samtycke',
        keptFor: 'Tills du avslutar prenumerationen',
      },
      {
        purpose: 'Ha ett konto på Mina sidor',
        legalBasis: 'Uppgift av allmänt intresse',
        keptFor: 'Tills du avslutar kontot',
      },
    ],
    shareText:
      'Vi delar bara personuppgifter med dem som behöver dem för att göra sin del av arbetet, till exempel den förskola som ditt barn erbjuds plats i. Vi säljer inte personuppgifter.',
    rightsLead: 'Du har rätt att:',
    rights: [
      'be om information om vilka personuppgifter vi har om dig',
      'be oss rätta uppgifter som är fel',
      'be oss radera uppgifter vi inte längre behöver',
      'be oss begränsa hur vi använder dina uppgifter',
      'invända mot hur vi använder dina uppgifter',
    ],
    officerText: 'Fråga dataskyddsombudet om hur vi hanterar dina uppgifter.',
    officerEmail: 'dataskydd@kvirnby.example',
    officerPhone: '0000-00 00 02',
    complainText:
      'Om du tycker att vi hanterar dina uppgifter fel kan du klaga hos tillsynsmyndigheten. Myndigheten och hur du kontaktar den anges här när en jurist har granskat texten.',
  },
  cookies: {
    title: 'Kakor',
    lead: 'Den här webbplatsen sätter inga kakor.',
    storeHeading: 'Vad vi sparar på din enhet',
    storeText:
      'Om du väljer en visningsinställning, till exempel större text eller ett mörkare färgtema, kommer din webbläsare ihåg ditt val på din enhet. Det sparas först när du har valt det. Det skickas aldrig till oss eller till någon annan.',
    noTrackingText:
      'Vi använder ingen statistik, ingen annonsering och inga tjänster från andra företag som följer dig, så det finns inget att godkänna eller avstå från.',
    changeHeading: 'Ändra eller ta bort',
    changeText:
      'Välj en annan visningsinställning eller återställ den till standard. Du kan också rensa webbplatsdata för den här webbplatsen i din webbläsare.',
  },
  easyToRead: {
    title: 'Förskola på lättläst svenska',
    onlySwedish: 'Den här sidan finns bara på svenska.',
    onlySwedishBody:
      'Lättläst text skrivs för ett språk av personer som kan det väl, därför finns den här sidan inte på engelska.',
    swedishLink: 'Läs sidan på lättläst svenska',
    swedishName: 'Förskola på lättläst svenska',
    preschoolLink: 'Förskola på svenska',
  },
}

export const referenceContentMessages: Record<ReferenceLocale, typeof en> = { sv, en }

// The easy-to-read page exists in Swedish only (spec P21), so its text is not typed by `en`.
export const easyToReadSwedish = {
  lead: 'Förskola är en plats för barn. Barn leker och lär sig där.',
  who: {
    heading: 'Vem kan gå i förskolan?',
    text: 'Barn från 1 år kan gå där. Barnet måste bo i Kvirnby.',
  },
  ask: {
    heading: 'Hur ber jag om en plats?',
    steps: ['Logga in på Mina sidor.', 'Välj de förskolor du vill ha.', 'Skicka din ansökan.'],
    after: 'Du får svar med brev.',
  },
  cost: {
    heading: 'Vad kostar det?',
    text: [
      'Det beror på hur mycket pengar hemmet har. Det beror också på hur många barn du har.',
      'Mest betalar du 1 645 kronor i månaden för ett barn.',
    ],
  },
  help: {
    heading: 'Vem kan jag fråga?',
    text: 'Du kan ringa eller skriva till oss. Vi hjälper dig.',
    card: 'Ring eller skriv till oss',
  },
}
