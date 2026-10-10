import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en as enMessages } from '@kvirn-ui/i18n/en'
import { fi as fiMessages } from '@kvirn-ui/i18n/fi'
import { nb as nbMessages } from '@kvirn-ui/i18n/nb'
import { nn as nnMessages } from '@kvirn-ui/i18n/nn'
import { sv as svMessages } from '@kvirn-ui/i18n/sv'
import { Alert, Button, KvirnProvider, Link, useAnnouncer, useFormat } from '@kvirn-ui/react'
import type { UseFormatResult } from '@kvirn-ui/react'
import type { AlertVariant } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { providerLocaleOf } from '../form/form.fixture.tsx'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Story fixture for Components/Alert (docs/design/alert.md §4.4, §5.2). sv,
// en, nb and nn are written. The fi strings are the designer's drafts, for length checks only. The
// status words ("Klart:", "Varning:") come from the provider, like an app's would. Dates and
// times are values, formatted with `useFormat()`.

export type AlertFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'en'

interface AlertTexts {
  deadline: {
    title: (date: ReactNode) => ReactNode
    body: (replyDate: ReactNode) => ReactNode
  }
  saved: { title: string; save: string }
  permit: {
    title: (date: ReactNode) => ReactNode
    body: string
    renew: string
  }
  consequence: { title: string }
  sendFailed: {
    title: string
    body: (phone: string, open: ReactNode, close: ReactNode) => ReactNode
    retry: string
    send: string
  }
  longFinnish: { title: string }
  ownStatus: { word: string }
  /** The same title on all four statuses, so the icon and the colour are the only difference. */
  sample: { title: string }
  /** The words that replace the status word in MessagesOverride. */
  override: {
    danger: string
    warning: string
    info: string
    success: string
    dangerTitle: string
    warningTitle: string
  }
  /** Site-wide outage (landmark and assertive), a list in the Body, and the close button options. */
  more: {
    outage: { title: string; body: string; simulate: string }
    missing: { title: string; items: readonly [string, string]; fix: string }
    close: { visibleText: string; customName: string; tip: string }
  }
  dynamic: { label: string }
  prose: { heading: string }
  /** A dismissible info alert on a page with a heading, and the button that brings it back. */
  dismissible: {
    heading: string
    title: string
    body: string
    link: string
    showAgain: string
  }
}

const en: AlertTexts = {
  deadline: {
    title: (date) => <>Applications close on {date}</>,
    body: (replyDate) => (
      <>
        Apply before then if you want a summer job in the municipality. We reply to everyone by{' '}
        {replyDate}.
      </>
    ),
  },
  saved: { title: 'Your changes are saved', save: 'Save' },
  permit: {
    title: (date) => <>Your parking permit expires on {date}</>,
    body: 'Renew it before then, or you may get a parking fine. It takes about 5 minutes.',
    renew: 'Renew parking permit',
  },
  consequence: { title: 'You can’t change your answers after you send the application.' },
  sendFailed: {
    title: 'We couldn’t send your application',
    body: (phone, open, close) => (
      <>
        Something went wrong on our side. Your answers are saved. Try again in a few minutes, or
        call us on {phone}, weekdays {open}–{close}.
      </>
    ),
    retry: 'Try again',
    send: 'Send application',
  },
  longFinnish: {
    title: 'Processing of your housing adaptation grant application is paused',
  },
  ownStatus: { word: 'Notice:' },
  sample: { title: 'Something you should know' },
  override: {
    danger: 'Important:',
    warning: 'Note:',
    dangerTitle: 'We couldn’t save your answers',
    warningTitle: 'Check your answers before you send',
    info: 'Tip:',
    success: 'Saved:',
  },
  dynamic: { label: 'Status' },
  more: {
    outage: {
      title: 'The service is down',
      body: 'We are working on it. You can’t send applications right now.',
      simulate: 'Simulate an outage',
    },
    missing: {
      title: 'Check your answers before you send',
      items: ['Your personal identity number is missing', 'Your phone number is incomplete'],
      fix: 'Go to your answers',
    },
    close: {
      visibleText: 'Hide',
      customName: 'Hide the tip',
      tip: 'You can save a draft at any time',
    },
  },
  prose: { heading: 'Summer jobs in the municipality' },
  dismissible: {
    heading: 'Your cases',
    title: 'The service is slower than usual today',
    body: 'Searching can take up to a minute. Your answers are still saved.',
    link: 'See service status',
    showAgain: 'Show the message again',
  },
}

const sv: AlertTexts = {
  deadline: {
    title: (date) => <>Sista dag att ansöka är {date}</>,
    body: (replyDate) => (
      <>
        Ansök senast då om du vill ha ett sommarjobb i kommunen. Vi svarar alla senast {replyDate}.
      </>
    ),
  },
  saved: { title: 'Dina ändringar är sparade', save: 'Spara' },
  permit: {
    title: (date) => <>Ditt parkeringstillstånd går ut den {date}</>,
    body: 'Förnya det innan dess, annars kan du få en parkeringsbot. Det tar ungefär 5 minuter.',
    renew: 'Förnya parkeringstillstånd',
  },
  consequence: { title: 'Du kan inte ändra dina svar när du har skickat ansökan.' },
  sendFailed: {
    title: 'Vi kunde inte skicka din ansökan',
    body: (phone, open, close) => (
      <>
        Det blev fel hos oss. Dina svar är sparade. Försök igen om några minuter, eller ring oss på{' '}
        {phone}, vardagar {open}–{close}.
      </>
    ),
    retry: 'Försök igen',
    send: 'Skicka ansökan',
  },
  longFinnish: {
    title: 'Handläggningen av din ansökan om bostadsanpassningsbidrag är pausad',
  },
  ownStatus: { word: 'Observera:' },
  sample: { title: 'Något du bör veta' },
  override: {
    danger: 'Viktigt:',
    warning: 'Obs:',
    dangerTitle: 'Vi kunde inte spara dina svar',
    warningTitle: 'Kontrollera dina svar innan du skickar',
    info: 'Tips:',
    success: 'Sparat:',
  },
  dynamic: { label: 'Status' },
  more: {
    outage: {
      title: 'Tjänsten är nere',
      body: 'Vi arbetar med felet. Du kan inte skicka in ansökningar just nu.',
      simulate: 'Visa en driftstörning',
    },
    missing: {
      title: 'Kontrollera dina svar innan du skickar',
      items: ['Personnummer saknas', 'Telefonnumret är ofullständigt'],
      fix: 'Gå till dina svar',
    },
    close: {
      visibleText: 'Dölj',
      customName: 'Dölj tipset',
      tip: 'Du kan spara ett utkast när som helst',
    },
  },
  prose: { heading: 'Sommarjobb i kommunen' },
  dismissible: {
    heading: 'Dina ärenden',
    title: 'Tjänsten är långsammare än vanligt i dag',
    body: 'Det kan ta upp till en minut att söka. Dina svar sparas som vanligt.',
    link: 'Se driftinformation',
    showAgain: 'Visa meddelandet igen',
  },
}

/** Designer drafts (docs/design/alert.md §4.4), for length checks. */
const fi: AlertTexts = {
  deadline: {
    title: (date) => <>Hakuaika päättyy {date}</>,
    body: (replyDate) => (
      <>
        Hae viimeistään silloin, jos haluat kesätyön kunnalta. Vastaamme kaikille viimeistään{' '}
        {replyDate}.
      </>
    ),
  },
  saved: { title: 'Muutoksesi on tallennettu', save: 'Tallenna' },
  permit: {
    title: (date) => <>Pysäköintilupasi päättyy {date}</>,
    body: 'Uusi lupa ennen sitä, muuten voit saada pysäköintivirhemaksun. Se vie noin 5 minuuttia.',
    renew: 'Uusi pysäköintilupa',
  },
  consequence: {
    title: 'Et voi muuttaa vastauksiasi sen jälkeen, kun olet lähettänyt hakemuksen.',
  },
  sendFailed: {
    title: 'Emme voineet lähettää hakemustasi',
    body: (phone, open, close) => (
      <>
        Järjestelmässämme tapahtui virhe. Vastauksesi on tallennettu. Yritä uudelleen muutaman
        minuutin kuluttua tai soita meille numeroon {phone} arkisin klo {open}–{close}.
      </>
    ),
    retry: 'Yritä uudelleen',
    send: 'Lähetä hakemus',
  },
  longFinnish: {
    title: 'Asunnonmuutostyöavustushakemuksesi käsittely on keskeytetty',
  },
  ownStatus: { word: 'Huomio:' },
  sample: { title: 'Jotain, mitä sinun kannattaa tietää' },
  override: {
    danger: 'Tärkeää:',
    warning: 'Huom:',
    dangerTitle: 'Emme voineet tallentaa vastauksiasi',
    warningTitle: 'Tarkista vastauksesi ennen lähettämistä',
    info: 'Vinkki:',
    success: 'Tallennettu:',
  },
  dynamic: { label: 'Tila' },
  more: {
    outage: {
      title: 'Palvelu ei ole käytettävissä',
      body: 'Korjaamme vikaa. Hakemuksia ei voi lähettää juuri nyt.',
      simulate: 'Näytä käyttökatko',
    },
    missing: {
      title: 'Tarkista vastauksesi ennen lähettämistä',
      items: ['Henkilötunnus puuttuu', 'Puhelinnumero on epätäydellinen'],
      fix: 'Siirry vastauksiisi',
    },
    close: {
      visibleText: 'Piilota',
      customName: 'Piilota vinkki',
      tip: 'Voit tallentaa luonnoksen milloin tahansa',
    },
  },
  prose: { heading: 'Kesätyöt kunnassa' },
  dismissible: {
    heading: 'Asiasi',
    title: 'Palvelu on tänään tavallista hitaampi',
    body: 'Haku voi kestää jopa minuutin. Vastauksesi tallentuvat silti.',
    link: 'Katso palvelun tila',
    showAgain: 'Näytä ilmoitus uudelleen',
  },
}

const nb: AlertTexts = {
  deadline: {
    title: (date) => <>Fristen for å søke er {date}</>,
    body: (replyDate) => (
      <>Søk innen da hvis du vil ha sommerjobb i kommunen. Vi svarer alle innen {replyDate}.</>
    ),
  },
  saved: { title: 'Endringene dine er lagret', save: 'Lagre' },
  permit: {
    title: (date) => <>Parkeringstillatelsen din utløper {date}</>,
    body: 'Forny den før da, ellers kan du få parkeringsgebyr. Det tar omtrent 5 minutter.',
    renew: 'Forny parkeringstillatelse',
  },
  consequence: { title: 'Du kan ikke endre svarene dine etter at du har sendt søknaden.' },
  sendFailed: {
    title: 'Vi kunne ikke sende søknaden din',
    body: (phone, open, close) => (
      <>
        Det oppstod en feil hos oss. Svarene dine er lagret. Prøv igjen om noen minutter, eller ring
        oss på {phone}, hverdager {open}–{close}.
      </>
    ),
    retry: 'Prøv igjen',
    send: 'Send søknad',
  },
  longFinnish: {
    title: 'Behandlingen av søknaden din om tilskudd til tilpasning av bolig er satt på pause',
  },
  ownStatus: { word: 'Vær oppmerksom:' },
  sample: { title: 'Noe du bør vite' },
  override: {
    danger: 'Viktig:',
    warning: 'Obs:',
    dangerTitle: 'Vi kunne ikke lagre svarene dine',
    warningTitle: 'Sjekk svarene dine før du sender',
    info: 'Tips:',
    success: 'Lagret:',
  },
  dynamic: { label: 'Status' },
  more: {
    outage: {
      title: 'Tjenesten er nede',
      body: 'Vi jobber med feilen. Du kan ikke sende inn søknader akkurat nå.',
      simulate: 'Vis en driftsforstyrrelse',
    },
    missing: {
      title: 'Sjekk svarene dine før du sender',
      items: ['Fødselsnummer mangler', 'Telefonnummeret er ufullstendig'],
      fix: 'Gå til svarene dine',
    },
    close: {
      visibleText: 'Skjul',
      customName: 'Skjul tipset',
      tip: 'Du kan lagre et utkast når som helst',
    },
  },
  prose: { heading: 'Sommerjobb i kommunen' },
  dismissible: {
    heading: 'Sakene dine',
    title: 'Tjenesten er tregere enn vanlig i dag',
    body: 'Det kan ta opptil ett minutt å søke. Svarene dine blir lagret som vanlig.',
    link: 'Se driftsinformasjon',
    showAgain: 'Vis meldingen igjen',
  },
}

const nn: AlertTexts = {
  deadline: {
    title: (date) => <>Fristen for å søkje er {date}</>,
    body: (replyDate) => (
      <>Søk innan då viss du vil ha sommarjobb i kommunen. Vi svarer alle innan {replyDate}.</>
    ),
  },
  saved: { title: 'Endringane dine er lagra', save: 'Lagre' },
  permit: {
    title: (date) => <>Parkeringsløyvet ditt går ut {date}</>,
    body: 'Forny det før då, elles kan du få parkeringsgebyr. Det tek om lag 5 minutt.',
    renew: 'Forny parkeringsløyve',
  },
  consequence: { title: 'Du kan ikkje endre svara dine etter at du har sendt søknaden.' },
  sendFailed: {
    title: 'Vi kunne ikkje sende søknaden din',
    body: (phone, open, close) => (
      <>
        Det oppstod ein feil hos oss. Svara dine er lagra. Prøv igjen om nokre minutt, eller ring
        oss på {phone}, kvardagar {open}–{close}.
      </>
    ),
    retry: 'Prøv igjen',
    send: 'Send søknad',
  },
  longFinnish: {
    title: 'Behandlinga av søknaden din om tilskot til tilpassing av bustad er sett på pause',
  },
  ownStatus: { word: 'Vær merksam:' },
  sample: { title: 'Noko du bør vite' },
  override: {
    danger: 'Viktig:',
    warning: 'Obs:',
    dangerTitle: 'Vi kunne ikkje lagre svara dine',
    warningTitle: 'Sjekk svara dine før du sender',
    info: 'Tips:',
    success: 'Lagra:',
  },
  dynamic: { label: 'Status' },
  more: {
    outage: {
      title: 'Tenesta er nede',
      body: 'Vi arbeider med feilen. Du kan ikkje sende inn søknader akkurat no.',
      simulate: 'Vis ei driftsforstyrring',
    },
    missing: {
      title: 'Sjekk svara dine før du sender',
      items: ['Fødselsnummer manglar', 'Telefonnummeret er ufullstendig'],
      fix: 'Gå til svara dine',
    },
    close: {
      visibleText: 'Skjul',
      customName: 'Skjul tipset',
      tip: 'Du kan lagre eit utkast når som helst',
    },
  },
  prose: { heading: 'Sommarjobb i kommunen' },
  dismissible: {
    heading: 'Sakene dine',
    title: 'Tenesta er tregare enn vanleg i dag',
    body: 'Det kan ta opptil eitt minutt å søkje. Svara dine blir lagra som vanleg.',
    link: 'Sjå driftsinformasjon',
    showAgain: 'Vis meldinga igjen',
  },
}

const alertTexts: Record<AlertFixtureLocale, AlertTexts | undefined> = {
  sv,
  fi,
  nb,
  nn,
  en,
}

export const isAlertFixtureLocale = (value: unknown): value is AlertFixtureLocale =>
  typeof value === 'string' && value in alertTexts

/** The Locale toolbar's value, `sv` when it's missing. */
export const localeOf = (globals: Record<string, unknown>): AlertFixtureLocale => {
  const locale = globals['locale']
  return isAlertFixtureLocale(locale) ? locale : 'sv'
}

interface ResolvedTexts {
  text: AlertTexts
  /** `'en'` when the locale has no texts: put it on the element (3.1.2). */
  lang: 'en' | undefined
}

/** The fixture text in a locale. */
export function textsFor(locale: AlertFixtureLocale): ResolvedTexts {
  const text = alertTexts[locale]
  if (text === undefined) {
    return { text: en, lang: 'en' }
  }
  return {
    text,
    lang: undefined,
  }
}

const catalogs: Record<AlertFixtureLocale, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  en: enMessages,
}

/** The library strings a story shows in a locale: English where the fixture has no texts. */
const messagesFor = (locale: AlertFixtureLocale): KvirnMessages =>
  alertTexts[locale] === undefined ? enMessages : catalogs[locale]

/**
 * The status words ("Klart:", "Varning:") follow the locale toolbar through a provider, like an
 * app's would. The provider also renders the live regions that `announce` needs. Where the
 * fixture shows English, the words are English too, so a `lang="en"` element is all
 * English.
 */
export const withAlertLocale: Decorator = (Story, { globals }) => {
  const locale = localeOf(globals)
  return (
    <KvirnProvider locale={providerLocaleOf(locale)} messages={messagesFor(locale)}>
      <Story />
    </KvirnProvider>
  )
}

/**
 * The layout of every story: one column that can shrink to 320px, with room between examples, and
 * the `lang` of the texts where the locale has none of its own. It is a
 * decorator so that the code a story shows is the alert and nothing around it.
 */
export const withAlertColumn: Decorator = (Story, { globals }) => (
  <div className="kv-story-alert-column" lang={textsFor(localeOf(globals)).lang}>
    <Story />
  </div>
)

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const applicationsClose = new Date(Date.UTC(2026, 7, 31))
const replyBy = new Date(Date.UTC(2026, 8, 30))
const permitExpires = new Date(Date.UTC(2026, 10, 12))
const opensAt = new Date(Date.UTC(2026, 9, 1, 9, 0))
const closesAt = new Date(Date.UTC(2026, 9, 1, 16, 0))

/** A date as the locale writes it, for the text inside a `<time>`. */
const longDate = (date: Date, format: UseFormatResult): string =>
  format.date(date, { dateStyle: 'long', timeZone: 'UTC' })

/** A time of day as the locale writes it, for the text inside a `<time>`. */
const shortTime = (date: Date, format: UseFormatResult): string =>
  format.date(date, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

/** An invented number, as the other fixtures use, written the way the locale writes one. */
const phoneFor = (locale: AlertFixtureLocale): string =>
  locale === 'nb' || locale === 'nn' ? '800 12 345' : '0123-45 67 89'

export interface AlertFixtureProps {
  locale: AlertFixtureLocale
}

/** The four ready-made roots, each labelled with its component name, with the same title. */
export function FourStatuses({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  return (
    <>
      <div>
        <p>
          <code>Alert.Info</code>
        </p>
        <Alert.Info>
          <Alert.Title>{text.sample.title}</Alert.Title>
        </Alert.Info>
      </div>
      <div>
        <p>
          <code>Alert.Success</code>
        </p>
        <Alert.Success>
          <Alert.Title>{text.sample.title}</Alert.Title>
        </Alert.Success>
      </div>
      <div>
        <p>
          <code>Alert.Warning</code>
        </p>
        <Alert.Warning>
          <Alert.Title>{text.sample.title}</Alert.Title>
        </Alert.Warning>
      </div>
      <div>
        <p>
          <code>Alert.Danger</code>
        </p>
        <Alert.Danger>
          <Alert.Title>{text.sample.title}</Alert.Title>
        </Alert.Danger>
      </div>
    </>
  )
}

/** Example A, info, present at load: a deadline on a start page. No `announce`. */
export function DeadlineAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  return (
    <Alert.Info data-testid="deadline">
      <Alert.Title>
        {text.deadline.title(
          <time dateTime="2026-08-31">{longDate(applicationsClose, format)}</time>,
        )}
      </Alert.Title>
      <Alert.Body>
        <p>{text.deadline.body(<time dateTime="2026-09-30">{longDate(replyBy, format)}</time>)}</p>
      </Alert.Body>
    </Alert.Info>
  )
}

/** Example C, warning with an action, present at load: a permit about to expire. */
export function PermitAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  return (
    <Alert.Warning data-testid="permit">
      <Alert.Title>
        {text.permit.title(<time dateTime="2026-11-12">{longDate(permitExpires, format)}</time>)}
      </Alert.Title>
      <Alert.Body>
        <p>{text.permit.body}</p>
      </Alert.Body>
      <Alert.Actions>
        <Link.Root href="#renew">{text.permit.renew}</Link.Root>
      </Alert.Actions>
    </Alert.Warning>
  )
}

/** Example C2, warning text next to an action: the Title as a paragraph, no Body. */
export function ConsequenceAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  return (
    <Alert.Warning data-testid="consequence">
      <Alert.Title as="p">{text.consequence.title}</Alert.Title>
    </Alert.Warning>
  )
}

/** Example B as it looks once shown, without the button: a success with only a Title as `<p>`. */
export function SavedAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  return (
    <Alert.Success data-testid="saved">
      <Alert.Title as="p">{text.saved.title}</Alert.Title>
    </Alert.Success>
  )
}

/** Example D as it looks once shown, without the announcement: a danger with a Button. */
export function SendFailedAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  return (
    <Alert.Danger data-testid="send-failed-alert">
      <Alert.Title>{text.sendFailed.title}</Alert.Title>
      <Alert.Body>
        <p>
          {text.sendFailed.body(
            phoneFor(locale),
            <time dateTime="09:00">{shortTime(opensAt, format)}</time>,
            <time dateTime="16:00">{shortTime(closesAt, format)}</time>,
          )}
        </p>
      </Alert.Body>
      <Alert.Actions>
        <Button>{text.sendFailed.retry}</Button>
      </Alert.Actions>
    </Alert.Danger>
  )
}

/**
 * Examples B and D in `kv-compact`: less padding from 64rem, the title at 16px. For staff tools.
 * Put `kv-compact` on any container.
 */
export function CompactAlerts({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  return (
    <div className="kv-compact">
      <Alert.Success>
        <Alert.Title as="p">{text.saved.title}</Alert.Title>
      </Alert.Success>
      <Alert.Danger>
        <Alert.Title>{text.sendFailed.title}</Alert.Title>
        <Alert.Body>
          <p>
            {text.sendFailed.body(
              phoneFor(locale),
              <time dateTime="09:00">{shortTime(opensAt, format)}</time>,
              <time dateTime="16:00">{shortTime(closesAt, format)}</time>,
            )}
          </p>
        </Alert.Body>
        <Alert.Actions>
          <Button>{text.sendFailed.retry}</Button>
        </Alert.Actions>
      </Alert.Danger>
    </div>
  )
}

/**
 * Example B, success, inserted after Save: the Save button keeps focus, and the alert
 * above it is announced politely once. Saving again shows it again and announces it again.
 */
export function SavedExample({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const [saveCount, setSaveCount] = useState(0)
  return (
    <>
      {saveCount === 0 ? null : (
        <Alert.Success key={saveCount} announce="polite" data-testid="saved">
          <Alert.Title as="p">{text.saved.title}</Alert.Title>
        </Alert.Success>
      )}
      <div className="kv-button-group">
        <Button className="kv-button--primary" onClick={() => setSaveCount((count) => count + 1)}>
          {text.saved.save}
        </Button>
      </div>
    </>
  )
}

/**
 * Example D, danger, inserted after Send fails: placed directly above Send, so Shift+Tab from Send
 * reaches "Försök igen". The first Send shows it, announced once on mount. Every next failure
 * keeps the same instance, because "Försök igen" is inside it and a remount would drop the focus
 * to the page, and announces through `useAnnouncer()` instead.
 */
export function SendFailedExample({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [failed, setFailed] = useState(false)
  const fail = () => {
    if (failed) {
      announce(text.sendFailed.title)
    } else {
      setFailed(true)
    }
  }
  return (
    <>
      {failed ? (
        <Alert.Danger announce="polite" data-testid="send-failed-alert">
          <Alert.Title>{text.sendFailed.title}</Alert.Title>
          <Alert.Body>
            <p>
              {text.sendFailed.body(
                phoneFor(locale),
                <time dateTime="09:00">{shortTime(opensAt, format)}</time>,
                <time dateTime="16:00">{shortTime(closesAt, format)}</time>,
              )}
            </p>
          </Alert.Body>
          <Alert.Actions>
            <Button onClick={fail}>{text.sendFailed.retry}</Button>
          </Alert.Actions>
        </Alert.Danger>
      ) : null}
      <div className="kv-button-group">
        <Button className="kv-button--primary" onClick={fail}>
          {text.sendFailed.send}
        </Button>
      </div>
    </>
  )
}

/**
 * The arrival pattern, and the mechanics of the later error summary: a danger alert that
 * takes focus once when it mounts (`tabIndex={-1}`), with no `announce`, because focus already
 * reads it. Tab from it goes to its first action.
 */
export function FocusTargetExample({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const format = useFormat()
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    // Only after the user asked for it: on a Docs page the stories share one document, and a
    // alert that took focus on load would pull it away from the page.
    if (shown) {
      ref.current?.focus()
    }
  }, [shown])
  return (
    <>
      <Button onClick={() => setShown(true)}>{text.sendFailed.send}</Button>
      {shown ? (
        <Alert.Danger ref={ref} tabIndex={-1} data-testid="focus-target">
          <Alert.Title>{text.sendFailed.title}</Alert.Title>
          <Alert.Body>
            <p>
              {text.sendFailed.body(
                phoneFor(locale),
                <time dateTime="09:00">{shortTime(opensAt, format)}</time>,
                <time dateTime="16:00">{shortTime(closesAt, format)}</time>,
              )}
            </p>
          </Alert.Body>
          <Alert.Actions>
            <Button>{text.sendFailed.retry}</Button>
            <Link.Root href="#help">{text.permit.renew}</Link.Root>
          </Alert.Actions>
        </Alert.Danger>
      ) : null}
    </>
  )
}

/**
 * A status from data: a select picks it, and a typed map picks the component, so the choice
 * stays visible in the code. There is no status prop.
 */
export function DynamicStatusExample({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const [variant, setVariant] = useState<AlertVariant>('warning')
  const selectId = useId()
  const variants = [
    'info',
    'success',
    'warning',
    'danger',
  ] as const satisfies readonly AlertVariant[]
  const alertFor = {
    info: Alert.Info,
    success: Alert.Success,
    warning: Alert.Warning,
    danger: Alert.Danger,
  } satisfies Record<AlertVariant, unknown>
  const ResultAlert = alertFor[variant]
  return (
    <>
      <div>
        <label htmlFor={selectId}>{text.dynamic.label}</label>{' '}
        <select
          id={selectId}
          value={variant}
          onChange={(event) => {
            const next = variants.find((name) => name === event.target.value)
            if (next !== undefined) {
              setVariant(next)
            }
          }}
        >
          {variants.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <ResultAlert data-testid="dynamic">
        <Alert.Title>{text.sample.title}</Alert.Title>
      </ResultAlert>
    </>
  )
}

/**
 * The optional close button, and the focus rule that comes with it (WCAG 2.4.3): the Alert owns no
 * open or closed state, so you remove it in `onClick`, and because the button that had focus is gone
 * you move focus to a sensible place first. Here that is the heading of the part of the page the
 * alert belonged to (`tabIndex={-1}`). Without that, focus falls to the page.
 */
export function DismissibleExample({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const [isShown, setIsShown] = useState(true)
  const heading = useRef<HTMLHeadingElement>(null)
  return (
    <>
      <h2 ref={heading} tabIndex={-1} data-testid="dismissible-heading">
        {text.dismissible.heading}
      </h2>
      {isShown ? (
        <Alert.Info data-testid="dismissible">
          <Alert.Title as="h3">{text.dismissible.title}</Alert.Title>
          <Alert.Body>
            <p>{text.dismissible.body}</p>
          </Alert.Body>
          <Alert.Actions>
            <Link.Root href="#status">{text.dismissible.link}</Link.Root>
          </Alert.Actions>
          <Alert.Close
            onClick={() => {
              setIsShown(false)
              heading.current?.focus()
            }}
          />
        </Alert.Info>
      ) : (
        <Button onClick={() => setIsShown(true)}>{text.dismissible.showAgain}</Button>
      )}
    </>
  )
}

/**
 * The close button on each layout, for review: a full alert, a title-only one, a warning with
 * actions, and the plain Root without a status icon. The buttons do nothing here: see
 * `DismissibleExample` for the working version.
 */
export function ClosableAlerts({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  return (
    <>
      <Alert.Info>
        <Alert.Title>{text.dismissible.title}</Alert.Title>
        <Alert.Body>
          <p>{text.dismissible.body}</p>
        </Alert.Body>
        <Alert.Close />
      </Alert.Info>
      <Alert.Success>
        <Alert.Title as="p">{text.saved.title}</Alert.Title>
        <Alert.Close />
      </Alert.Success>
      <Alert.Warning>
        <Alert.Title>{text.sample.title}</Alert.Title>
        <Alert.Actions>
          <Link.Root href="#status">{text.dismissible.link}</Link.Root>
        </Alert.Actions>
        <Alert.Close />
      </Alert.Warning>
      <Alert.Root>
        <Alert.Title>
          <span className="kv-alert-status">{text.ownStatus.word}</span> {text.sample.title}
        </Alert.Title>
        <Alert.Close />
      </Alert.Root>
    </>
  )
}

/**
 * One site-wide alert as a landmark, announced assertively: `as` gives the root a named
 * `<section>` (the Title's `id` names it), and `announce="assertive"` interrupts, which is only for
 * something urgent that the user must act on now. The button stands in for the outage starting.
 */
export function OutageAlert({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  const titleId = useId()
  const [hasOutage, setHasOutage] = useState(false)
  return (
    <>
      <Button onClick={() => setHasOutage(true)}>{text.more.outage.simulate}</Button>
      {hasOutage ? (
        <Alert.Danger
          announce="assertive"
          as="section"
          aria-labelledby={titleId}
          data-testid="outage"
        >
          <Alert.Title id={titleId}>{text.more.outage.title}</Alert.Title>
          <Alert.Body>
            <p>{text.more.outage.body}</p>
          </Alert.Body>
        </Alert.Danger>
      ) : null}
    </>
  )
}

/**
 * Three ways to name the close button: `messages` on the root changes its name, `messages` on the
 * button changes only that button's, and visible text in its children replaces the icon and
 * becomes the name. The buttons do nothing here: see `DismissibleExample` for the working version.
 */
export function CloseButtonNames({ locale }: AlertFixtureProps) {
  const { text } = textsFor(locale)
  return (
    <>
      <Alert.Info messages={{ close: text.more.close.customName }}>
        <Alert.Title as="p">{text.more.close.tip}</Alert.Title>
        <Alert.Close />
      </Alert.Info>
      <Alert.Info>
        <Alert.Title as="p">{text.more.close.tip}</Alert.Title>
        <Alert.Close messages={{ close: text.more.close.customName }} />
      </Alert.Info>
      <Alert.Info>
        <Alert.Title as="p">{text.more.close.tip}</Alert.Title>
        <Alert.Close>{text.more.close.visibleText}</Alert.Close>
      </Alert.Info>
    </>
  )
}
