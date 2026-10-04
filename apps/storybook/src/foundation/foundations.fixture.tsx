import { Button } from '@kvirn-ui/react'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { scrollRegionTabIndex } from './foundation-helpers.tsx'

// Fixture text for Components/Prose (docs/design/foundations-and-prose.md §4):
// a fictional municipality's guidance page that uses every element prose styles. sv, en, nb
// and nn are written. fi and se: the English article, marked lang="en" (3.1.2).

export type FixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

interface ArticleText {
  title: string
  lead: string
  who: {
    heading: string
    intro: string
    items: readonly [string, string, string]
    tenure: { intro: string; items: readonly [string, string] }
  }
  what: {
    heading: string
    intro: string
    items: readonly string[]
    figureLabel: string
    figureCaption: string
  }
  how: {
    heading: string
    steps: readonly [string, string, string, string]
    quoteSteps: readonly [string, string]
    keyboard: (key: ReactNode) => ReactNode
  }
  attach: { heading: string; items: readonly (readonly [term: string, description: string])[] }
  paper: { heading: string; text: string }
  send: { heading: string; address: readonly string[] }
  times: {
    heading: string
    intro: string
    caption: string
    columns: readonly [string, string, string]
    rows: readonly (readonly [adaptation: string, weeks: number, grants: number])[]
  }
  caseNumber: (code: ReactNode) => ReactNode
  sms: string
  quote: string
  quoteSource: string
  contact: {
    heading: string
    body: (link: (text: string) => ReactNode) => ReactNode
  }
  easyRead: string
  otherLanguage: string
  apply: string
  updated: (date: ReactNode) => ReactNode
}

const caseNumber = 'BAB-2026-004512'
const smsCode = `BAB ${caseNumber}`

const en: ArticleText = {
  title: 'Apply for a housing adaptation grant',
  lead: 'If you have a disability, you can get a grant to adapt your home so you can keep living there safely. The grant does not depend on your income.',
  who: {
    heading: 'Who can get the grant',
    intro:
      'You can get the grant if you have a lasting disability and need to change your home so that you can keep living in it. You apply to the municipality you live in, and it doesn’t matter how old you are.',
    items: [
      'You live in Kvirnby municipality, and the home is your permanent address.',
      'You have a disability that will last at least a year.',
      'The change is needed because of your disability, not because the home is old.',
    ],
    tenure: {
      intro: 'You can own or rent the home:',
      items: [
        'If you own it, you can apply straight away.',
        'If you rent it, the owner must agree to the changes in writing.',
      ],
    },
  },
  what: {
    heading: 'What the grant can pay for',
    intro:
      'The grant pays for changes to the home itself that you need because of your disability. It doesn’t pay for normal maintenance, or for things you can take with you when you move.',
    items: [
      'Removing thresholds and making doors wider',
      'Replacing a bathtub with a shower',
      'A ramp at the entrance',
      'A stairlift',
    ],
    figureLabel:
      'Plan of a bathroom. The bathtub along one wall is replaced by a shower area with a fold-down seat and grab rails, and the door is made wider.',
    figureCaption: 'Example drawing: Kvirnby municipality, 2025.',
  },
  how: {
    heading: 'How to apply',
    steps: [
      'Talk to an occupational therapist. They write a certificate that describes what you need.',
      'Get a quote for the work from a contractor.',
      'Fill in the application online or on paper, and attach the documents listed below.',
      'Wait for our decision before the work starts. We don’t pay for work that is already done.',
    ],
    quoteSteps: [
      'Ask at least two contractors.',
      'Check that the quote says what each part costs.',
    ],
    keyboard: (key) => <>You can move between the fields in the form with {key}.</>,
  },
  attach: {
    heading: 'What to include',
    items: [
      [
        'Certificate',
        'From an occupational therapist, a physiotherapist or a doctor. It describes your disability and what you need.',
      ],
      ['Drawing', 'A simple drawing of the room, with the changes marked.'],
      ['Quote', 'From the contractor, with the cost of each part of the work.'],
    ],
  },
  paper: {
    heading: 'Apply on paper',
    text: 'Print the form, or call us and we’ll send it to you. Sign it, and send it to us with the documents.',
  },
  send: {
    heading: 'Where to send it',
    address: ['Kvirnby municipality', 'Housing adaptation', 'Box 100', '123 45 Kvirnby'],
  },
  times: {
    heading: 'How long it takes',
    intro:
      'We usually decide within six weeks if your application is complete. Bigger changes take longer, because we often need to visit your home first.',
    caption: 'Typical processing time in 2025',
    columns: ['Adaptation', 'Processing time (weeks)', 'Grants decided'],
    rows: [
      ['Bathroom', 6, 1412],
      ['Entrance ramp', 4, 238],
      ['Stairlift', 10, 57],
    ],
  },
  caseNumber: (code) => <>Your case number looks like {code}. Use it when you contact us.</>,
  sms: 'To check your case by text message, send this to 71120:',
  quote: 'Now I can shower on my own again, and I don’t have to wait for help in the mornings.',
  quoteSource: 'Resident in Kvirnby, 81 years old',
  contact: {
    heading: 'Contact us',
    body: (link) => (
      <>
        Call us on <strong>0123-45 67 89</strong> on weekdays between 9 and 12.{' '}
        <em>Have your case number ready.</em> You can also{' '}
        {link('write to us through the e-service')}.
      </>
    ),
  },
  easyRead: 'Read about the grant in easy language',
  otherLanguage: 'Sámegillii',
  apply: 'Apply online',
  updated: (date) => <>Last updated {date}</>,
}

const sv: ArticleText = {
  title: 'Ansök om bostadsanpassningsbidrag',
  lead: 'Om du har en funktionsnedsättning kan du få bidrag för att anpassa din bostad så att du kan bo kvar tryggt. Bidraget beror inte på din inkomst.',
  who: {
    heading: 'Vem kan få bidrag',
    intro:
      'Du kan få bidrag om du har en varaktig funktionsnedsättning och behöver ändra din bostad för att kunna bo kvar. Du ansöker hos kommunen där du bor, och det spelar ingen roll hur gammal du är.',
    items: [
      'Du bor i Kvirnby kommun och bostaden är din permanenta adress.',
      'Du har en funktionsnedsättning som varar i minst ett år.',
      'Ändringen behövs på grund av din funktionsnedsättning, inte för att bostaden är gammal.',
    ],
    tenure: {
      intro: 'Du kan äga eller hyra bostaden:',
      items: [
        'Om du äger den kan du ansöka direkt.',
        'Om du hyr den måste ägaren godkänna ändringarna skriftligt.',
      ],
    },
  },
  what: {
    heading: 'Vad bidraget kan betala',
    intro:
      'Bidraget betalar ändringar i själva bostaden som du behöver på grund av din funktionsnedsättning. Det betalar inte vanligt underhåll, eller saker som du kan ta med dig när du flyttar.',
    items: [
      'Ta bort trösklar och göra dörrar bredare',
      'Byta ett badkar mot en dusch',
      'En ramp vid entrén',
      'En trapphiss',
    ],
    figureLabel:
      'Ritning av ett badrum. Badkaret längs ena väggen är utbytt mot en duschplats med uppfällbar sits och stödhandtag, och dörren är breddad.',
    figureCaption: 'Exempelritning: Kvirnby kommun, 2025.',
  },
  how: {
    heading: 'Så här ansöker du',
    steps: [
      'Prata med en arbetsterapeut. Hen skriver ett intyg som beskriver vad du behöver.',
      'Be en entreprenör om en offert på arbetet.',
      'Fyll i ansökan i e-tjänsten eller på papper, och bifoga handlingarna i listan nedan.',
      'Vänta på vårt beslut innan arbetet börjar. Vi betalar inte för arbete som redan är gjort.',
    ],
    quoteSteps: [
      'Fråga minst två entreprenörer.',
      'Kontrollera att offerten visar vad varje del kostar.',
    ],
    keyboard: (key) => <>Du kan flytta mellan fälten i formuläret med {key}.</>,
  },
  attach: {
    heading: 'Det här ska du skicka med',
    items: [
      [
        'Intyg',
        'Från en arbetsterapeut, fysioterapeut eller läkare. Det beskriver din funktionsnedsättning och vad du behöver.',
      ],
      ['Ritning', 'En enkel ritning av rummet, med ändringarna markerade.'],
      ['Offert', 'Från entreprenören, med kostnaden för varje del av arbetet.'],
    ],
  },
  paper: {
    heading: 'Ansök på papper',
    text: 'Skriv ut blanketten, eller ring oss så skickar vi den till dig. Skriv under och skicka den till oss tillsammans med handlingarna.',
  },
  send: {
    heading: 'Vart du skickar den',
    address: ['Kvirnby kommun', 'Bostadsanpassning', 'Box 100', '123 45 Kvirnby'],
  },
  times: {
    heading: 'Hur lång tid det tar',
    intro:
      'Vi fattar oftast beslut inom sex veckor om din ansökan är komplett. Större ändringar tar längre tid, eftersom vi ofta behöver besöka din bostad först.',
    caption: 'Normal handläggningstid 2025',
    columns: ['Anpassning', 'Handläggningstid (veckor)', 'Beviljade bidrag'],
    rows: [
      ['Badrum', 6, 1412],
      ['Ramp vid entrén', 4, 238],
      ['Trapphiss', 10, 57],
    ],
  },
  caseNumber: (code) => (
    <>Ditt ärendenummer ser ut så här: {code}. Ange det när du kontaktar oss.</>
  ),
  sms: 'Skicka det här till 71120 för att se hur det går med ditt ärende:',
  quote: 'Nu kan jag duscha själv igen och behöver inte vänta på hjälp på morgonen.',
  quoteSource: 'Invånare i Kvirnby, 81 år',
  contact: {
    heading: 'Kontakta oss',
    body: (link) => (
      <>
        Ring oss på <strong>0123-45 67 89</strong> vardagar mellan 9 och 12.{' '}
        <em>Ha ditt ärendenummer till hands.</em> Du kan också{' '}
        {link('skriva till oss i e-tjänsten')}.
      </>
    ),
  },
  easyRead: 'Läs om bidraget på lätt svenska',
  otherLanguage: 'Sámegillii',
  apply: 'Ansök via e-tjänsten',
  updated: (date) => <>Senast uppdaterad {date}</>,
}

const nb: ArticleText = {
  title: 'Søk om tilskudd til tilpasning av bolig',
  lead: 'Hvis du har en funksjonsnedsettelse, kan du få tilskudd til å tilpasse boligen din, slik at du kan bo trygt hjemme. Tilskuddet avhenger ikke av inntekten din.',
  who: {
    heading: 'Hvem kan få tilskudd',
    intro:
      'Du kan få tilskudd hvis du har en varig funksjonsnedsettelse og må endre boligen din for å kunne bo hjemme. Du søker i kommunen der du bor, og det spiller ingen rolle hvor gammel du er.',
    items: [
      'Du bor i Kvirnby kommune, og boligen er din faste adresse.',
      'Du har en funksjonsnedsettelse som varer i minst ett år.',
      'Endringen er nødvendig på grunn av funksjonsnedsettelsen din, ikke fordi boligen er gammel.',
    ],
    tenure: {
      intro: 'Du kan eie eller leie boligen:',
      items: [
        'Hvis du eier den, kan du søke med en gang.',
        'Hvis du leier den, må eieren godkjenne endringene skriftlig.',
      ],
    },
  },
  what: {
    heading: 'Hva tilskuddet kan dekke',
    intro:
      'Tilskuddet dekker endringer i selve boligen som du trenger på grunn av funksjonsnedsettelsen din. Det dekker ikke vanlig vedlikehold eller ting du kan ta med deg når du flytter.',
    items: [
      'Fjerne terskler og gjøre dørene bredere',
      'Bytte badekar med dusj',
      'Rampe ved inngangen',
      'Trappeheis',
    ],
    figureLabel:
      'Tegning av et bad. Badekaret langs den ene veggen er byttet ut med en dusjplass med nedfellbart sete og støttehåndtak, og døren er gjort bredere.',
    figureCaption: 'Eksempeltegning: Kvirnby kommune, 2025.',
  },
  how: {
    heading: 'Slik søker du',
    steps: [
      'Snakk med en ergoterapeut. Ergoterapeuten skriver en erklæring som beskriver hva du trenger.',
      'Be en entreprenør om et tilbud på arbeidet.',
      'Fyll ut søknaden på nett eller på papir, og legg ved dokumentene i listen nedenfor.',
      'Vent på vedtaket vårt før arbeidet starter. Vi dekker ikke arbeid som allerede er utført.',
    ],
    quoteSteps: ['Spør minst to entreprenører.', 'Sjekk at tilbudet viser hva hver del koster.'],
    keyboard: (key) => <>Du kan flytte mellom feltene i skjemaet med {key}.</>,
  },
  attach: {
    heading: 'Dette skal du legge ved',
    items: [
      [
        'Erklæring',
        'Fra en ergoterapeut, fysioterapeut eller lege. Den beskriver funksjonsnedsettelsen din og hva du trenger.',
      ],
      ['Tegning', 'En enkel tegning av rommet, med endringene markert.'],
      ['Tilbud', 'Fra entreprenøren, med kostnaden for hver del av arbeidet.'],
    ],
  },
  paper: {
    heading: 'Søk på papir',
    text: 'Skriv ut skjemaet, eller ring oss, så sender vi det til deg. Skriv under og send det til oss sammen med dokumentene.',
  },
  send: {
    heading: 'Hvor du sender det',
    address: ['Kvirnby kommune', 'Boligtilpasning', 'Postboks 100', '0150 Kvirnby'],
  },
  times: {
    heading: 'Hvor lang tid det tar',
    intro:
      'Vi avgjør som regel saken innen seks uker hvis søknaden er komplett. Større endringer tar lengre tid, fordi vi ofte må besøke boligen din først.',
    caption: 'Vanlig saksbehandlingstid i 2025',
    columns: ['Tilpasning', 'Saksbehandlingstid (uker)', 'Innvilgede tilskudd'],
    rows: [
      ['Bad', 6, 1412],
      ['Rampe ved inngangen', 4, 238],
      ['Trappeheis', 10, 57],
    ],
  },
  caseNumber: (code) => <>Saksnummeret ditt ser slik ut: {code}. Oppgi det når du kontakter oss.</>,
  sms: 'Send dette til 71120 for å se hvordan det går med saken din:',
  quote: 'Nå kan jeg dusje selv igjen, og jeg trenger ikke vente på hjelp om morgenen.',
  quoteSource: 'Innbygger i Kvirnby, 81 år',
  contact: {
    heading: 'Kontakt oss',
    body: (link) => (
      <>
        Ring oss på <strong>800 12 345</strong> på hverdager mellom kl. 9 og 12.{' '}
        <em>Ha saksnummeret klart.</em> Du kan også {link('skrive til oss i e-tjenesten')}.
      </>
    ),
  },
  easyRead: 'Les om tilskuddet på lettlest norsk',
  otherLanguage: 'Sámegillii',
  apply: 'Søk på nett',
  updated: (date) => <>Sist oppdatert {date}</>,
}

const nn: ArticleText = {
  title: 'Søk om tilskot til tilpassing av bustad',
  lead: 'Viss du har ei funksjonsnedsetting, kan du få tilskot til å tilpasse bustaden din, slik at du kan bu trygt heime. Tilskotet er ikkje avhengig av inntekta di.',
  who: {
    heading: 'Kven kan få tilskot',
    intro:
      'Du kan få tilskot viss du har ei varig funksjonsnedsetting og må endre bustaden din for å kunne bu heime. Du søkjer i kommunen der du bur, og det spelar inga rolle kor gammal du er.',
    items: [
      'Du bur i Kvirnby kommune, og bustaden er den faste adressa di.',
      'Du har ei funksjonsnedsetting som varer i minst eitt år.',
      'Endringa er nødvendig på grunn av funksjonsnedsettinga di, ikkje fordi bustaden er gammal.',
    ],
    tenure: {
      intro: 'Du kan eige eller leige bustaden:',
      items: [
        'Viss du eig han, kan du søkje med éin gong.',
        'Viss du leiger han, må eigaren godkjenne endringane skriftleg.',
      ],
    },
  },
  what: {
    heading: 'Kva tilskotet kan dekkje',
    intro:
      'Tilskotet dekkjer endringar i sjølve bustaden som du treng på grunn av funksjonsnedsettinga di. Det dekkjer ikkje vanleg vedlikehald eller ting du kan ta med deg når du flyttar.',
    items: [
      'Fjerne terskler og gjere dørene breiare',
      'Byte ut badekar med dusj',
      'Rampe ved inngangen',
      'Trappeheis',
    ],
    figureLabel:
      'Teikning av eit bad. Badekaret langs den eine veggen er bytt ut med ein dusjplass med nedfellbart sete og støttehandtak, og døra er gjord breiare.',
    figureCaption: 'Døme på teikning: Kvirnby kommune, 2025.',
  },
  how: {
    heading: 'Slik søkjer du',
    steps: [
      'Snakk med ein ergoterapeut. Ergoterapeuten skriv ei erklæring som skildrar kva du treng.',
      'Be ein entreprenør om eit tilbod på arbeidet.',
      'Fyll ut søknaden på nett eller på papir, og legg ved dokumenta i lista nedanfor.',
      'Vent på vedtaket vårt før arbeidet startar. Vi dekkjer ikkje arbeid som alt er utført.',
    ],
    quoteSteps: ['Spør minst to entreprenørar.', 'Sjekk at tilbodet viser kva kvar del kostar.'],
    keyboard: (key) => <>Du kan flytte mellom felta i skjemaet med {key}.</>,
  },
  attach: {
    heading: 'Dette skal du leggje ved',
    items: [
      [
        'Erklæring',
        'Frå ein ergoterapeut, fysioterapeut eller lege. Ho skildrar funksjonsnedsettinga di og kva du treng.',
      ],
      ['Teikning', 'Ei enkel teikning av rommet, med endringane markerte.'],
      ['Tilbod', 'Frå entreprenøren, med kostnaden for kvar del av arbeidet.'],
    ],
  },
  paper: {
    heading: 'Søk på papir',
    text: 'Skriv ut skjemaet, eller ring oss, så sender vi det til deg. Skriv under og send det til oss saman med dokumenta.',
  },
  send: {
    heading: 'Kvar du sender det',
    address: ['Kvirnby kommune', 'Bustadtilpassing', 'Postboks 100', '0150 Kvirnby'],
  },
  times: {
    heading: 'Kor lang tid det tek',
    intro:
      'Vi avgjer vanlegvis saka innan seks veker viss søknaden er komplett. Større endringar tek lengre tid, fordi vi ofte må besøkje bustaden din først.',
    caption: 'Vanleg saksbehandlingstid i 2025',
    columns: ['Tilpassing', 'Saksbehandlingstid (veker)', 'Innvilga tilskot'],
    rows: [
      ['Bad', 6, 1412],
      ['Rampe ved inngangen', 4, 238],
      ['Trappeheis', 10, 57],
    ],
  },
  caseNumber: (code) => <>Saksnummeret ditt ser slik ut: {code}. Oppgi det når du kontaktar oss.</>,
  sms: 'Send dette til 71120 for å sjå korleis det går med saka di:',
  quote: 'No kan eg dusje sjølv igjen, og eg treng ikkje vente på hjelp om morgonen.',
  quoteSource: 'Innbyggjar i Kvirnby, 81 år',
  contact: {
    heading: 'Kontakt oss',
    body: (link) => (
      <>
        Ring oss på <strong>800 12 345</strong> på kvardagar mellom kl. 9 og 12.{' '}
        <em>Ha saksnummeret klart.</em> Du kan òg {link('skrive til oss i e-tenesta')}.
      </>
    ),
  },
  easyRead: 'Les om tilskotet på lettlesen nynorsk',
  otherLanguage: 'Sámegillii',
  apply: 'Søk på nett',
  updated: (date) => <>Sist oppdatert {date}</>,
}

/** fi and se have no article: they show the English one, marked lang="en". */
const articleTexts: Record<FixtureLocale, ArticleText | undefined> = {
  sv,
  en,
  fi: undefined,
  nb,
  nn,
  se: undefined,
}

export const isFixtureLocale = (value: unknown): value is FixtureLocale =>
  typeof value === 'string' && value in articleTexts

/** The article in a locale, or the English one with `lang="en"` for fi and se. */
export function articleFor(locale: FixtureLocale): { text: ArticleText; lang?: 'en' } {
  const text = articleTexts[locale]
  return text === undefined ? { text: en, lang: 'en' } : { text }
}

export const updatedDate = new Date(2026, 8, 14)

/**
 * A bathroom plan as a real `<img>`, so the prose `img` rules are what the story shows. Mid grey
 * lines keep 3:1 or more on every theme's canvas (1.4.11): 3.95:1 on white, 5.3:1 on near-black.
 */
const bathroomPlanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
<g fill="none" stroke="gray" stroke-width="3">
<rect x="10" y="10" width="460" height="280"/>
<rect x="20" y="20" width="150" height="260" stroke-dasharray="8 6"/>
<rect x="40" y="180" width="80" height="60"/>
<line x1="30" y1="60" x2="30" y2="160" stroke-width="6"/>
<line x1="180" y1="30" x2="280" y2="30" stroke-width="6"/>
<path d="M 340 290 L 340 200 A 90 90 0 0 1 430 290" stroke-dasharray="4 4"/>
<rect x="360" y="40" width="90" height="60"/>
<circle cx="260" cy="220" r="36"/>
</g>
</svg>`
const bathroomPlanSource = `data:image/svg+xml,${encodeURIComponent(bathroomPlanSvg)}`

function BathroomPlan({ label }: { label: string }) {
  return <img src={bathroomPlanSource} width={480} height={300} alt={label} />
}

/** The article. `size: 'large'` adds kv-prose--large; `locale` formats numbers and dates. */
export function ProseArticle({
  locale,
  size,
}: {
  locale: FixtureLocale
  size?: 'large' | undefined
}): ReactNode {
  const { text, lang } = articleFor(locale)
  const formatLocale = lang ?? locale
  const number = new Intl.NumberFormat(formatLocale)
  const date = new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long' })
  const ids = useId()
  return (
    <article className={size === 'large' ? 'kv-prose kv-prose--large' : 'kv-prose'} lang={lang}>
      <h1>{text.title}</h1>
      <p className="kv-lead">{text.lead}</p>

      <h2>{text.who.heading}</h2>
      <p>{text.who.intro}</p>
      <ul>
        {text.who.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
        <li>
          {text.who.tenure.intro}
          <ul>
            {text.who.tenure.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
      </ul>

      <h2>{text.what.heading}</h2>
      <p>{text.what.intro}</p>
      <ul>
        {text.what.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <figure>
        <BathroomPlan label={text.what.figureLabel} />
        <figcaption>{text.what.figureCaption}</figcaption>
      </figure>

      <h2>{text.how.heading}</h2>
      <ol>
        <li>
          <p>{text.how.steps[0]}</p>
        </li>
        <li>
          <p>{text.how.steps[1]}</p>
          <ol>
            {text.how.quoteSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </li>
        <li>
          <p>{text.how.steps[2]}</p>
        </li>
        <li>
          <p>{text.how.steps[3]}</p>
        </li>
      </ol>
      <p>{text.how.keyboard(<kbd lang="en">Tab</kbd>)}</p>

      <h3>{text.attach.heading}</h3>
      <dl>
        {text.attach.items.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>

      <h3>{text.paper.heading}</h3>
      <p>{text.paper.text}</p>
      <h4>{text.send.heading}</h4>
      <p>
        {text.send.address.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>

      <h2>{text.times.heading}</h2>
      <p>{text.times.intro}</p>
      <p>{text.caseNumber(<code>{caseNumber}</code>)}</p>
      <p>{text.sms}</p>
      <pre>
        <code>{smsCode}</code>
      </pre>
      <section
        className="kv-scroll-region"
        aria-labelledby={`${ids}-times`}
        tabIndex={scrollRegionTabIndex}
      >
        <table>
          <caption id={`${ids}-times`}>{text.times.caption}</caption>
          <thead>
            <tr>
              {text.times.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {text.times.rows.map(([adaptation, weeks, grants]) => (
              <tr key={adaptation}>
                <th scope="row">{adaptation}</th>
                <td>{number.format(weeks)}</td>
                <td>{number.format(grants)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <figure>
        <blockquote>
          <p>{text.quote}</p>
        </blockquote>
        <figcaption>{text.quoteSource}</figcaption>
      </figure>

      <hr />
      <h2>{text.contact.heading}</h2>
      <p>
        {text.contact.body((linkText) => (
          <a href="https://kvirnby.example/e-tjanst">{linkText}</a>
        ))}
      </p>
      <p>
        <a href="https://kvirnby.example/latt-las">{text.easyRead}</a>
      </p>
      <p>
        <a href="https://kvirnby.example/se" lang="se" hrefLang="se">
          {text.otherLanguage}
        </a>
      </p>
      <div className="kv-not-prose">
        <div className="kv-button-group">
          <Button className="kv-button--primary">{text.apply}</Button>
        </div>
      </div>
      <p>
        <small>{text.updated(<time dateTime="2026-09-14">{date.format(updatedDate)}</time>)}</small>
      </p>
    </article>
  )
}
