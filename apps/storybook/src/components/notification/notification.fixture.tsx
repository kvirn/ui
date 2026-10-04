import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en as enMessages } from '@kvirn-ui/i18n/en'
import { fi as fiMessages } from '@kvirn-ui/i18n/fi'
import { nb as nbMessages } from '@kvirn-ui/i18n/nb'
import { nn as nnMessages } from '@kvirn-ui/i18n/nn'
import { se as seMessages } from '@kvirn-ui/i18n/se'
import { sv as svMessages } from '@kvirn-ui/i18n/sv'
import { Button, KvirnProvider, Link, Notification, useAnnouncer } from '@kvirn-ui/react'
import type { NotificationStatusRootProps, NotificationVariant } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Story and e2e fixture for Components/Notification (docs/design/notification.md §4.4, §5.2). sv,
// en, nb and nn are written. The fi strings are the designer's drafts, for length checks only. se:
// English, marked lang="en" (3.1.2), and the library's own status words follow in English too. The
// status words ("Klart:", "Varning:") come from the provider, like an app's would. Dates and
// times are values, formatted with Intl.

export type NotificationFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

interface NotificationTexts {
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
  override: { danger: string; warning: string; dangerTitle: string; warningTitle: string }
  dynamic: { label: string }
  prose: { heading: string }
}

const en: NotificationTexts = {
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
  },
  dynamic: { label: 'Status' },
  prose: { heading: 'Summer jobs in the municipality' },
}

const sv: NotificationTexts = {
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
  },
  dynamic: { label: 'Status' },
  prose: { heading: 'Sommarjobb i kommunen' },
}

/** Designer drafts (docs/design/notification.md §4.4), for length checks. */
const fi: NotificationTexts = {
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
  },
  dynamic: { label: 'Tila' },
  prose: { heading: 'Kesätyöt kunnassa' },
}

const nb: NotificationTexts = {
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
  },
  dynamic: { label: 'Status' },
  prose: { heading: 'Sommerjobb i kommunen' },
}

const nn: NotificationTexts = {
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
  },
  dynamic: { label: 'Status' },
  prose: { heading: 'Sommarjobb i kommunen' },
}

/** se has no texts: it shows the English ones, marked lang="en". */
const notificationTexts: Record<NotificationFixtureLocale, NotificationTexts | undefined> = {
  sv,
  fi,
  nb,
  nn,
  se: undefined,
  en,
}

const formatLocales: Record<'sv' | 'fi' | 'nb' | 'nn' | 'en', string> = {
  sv: 'sv-SE',
  fi: 'fi-FI',
  nb: 'nb-NO',
  nn: 'nn-NO',
  en: 'en-GB',
}

export const isNotificationFixtureLocale = (value: unknown): value is NotificationFixtureLocale =>
  typeof value === 'string' && value in notificationTexts

/** The Locale toolbar's value, `sv` when it's missing. */
export const localeOf = (globals: Record<string, unknown>): NotificationFixtureLocale => {
  const locale = globals['locale']
  return isNotificationFixtureLocale(locale) ? locale : 'sv'
}

interface ResolvedTexts {
  text: NotificationTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function textsFor(locale: NotificationFixtureLocale): ResolvedTexts {
  const text = notificationTexts[locale]
  if (text === undefined) {
    return { text: en, lang: 'en', formatLocale: formatLocales.en }
  }
  return {
    text,
    lang: undefined,
    formatLocale: formatLocales[locale === 'se' ? 'en' : locale],
  }
}

const catalogs: Record<NotificationFixtureLocale, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  se: seMessages,
  en: enMessages,
}

/** The library strings a story shows in a locale: English where the fixture has no texts (se). */
const messagesFor = (locale: NotificationFixtureLocale): KvirnMessages =>
  notificationTexts[locale] === undefined ? enMessages : catalogs[locale]

/**
 * The status words ("Klart:", "Varning:") follow the locale toolbar through a provider, like an
 * app's would. The provider also renders the live regions that `announce` needs. Where the
 * fixture shows English (se), the words are English too, so a `lang="en"` element is all
 * English.
 */
export const withNotificationLocale: Decorator = (Story, { globals }) => {
  const locale = localeOf(globals)
  return (
    <KvirnProvider locale={locale} messages={messagesFor(locale)}>
      <Story />
    </KvirnProvider>
  )
}

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const applicationsClose = new Date(Date.UTC(2026, 7, 31))
const replyBy = new Date(Date.UTC(2026, 8, 30))
const permitExpires = new Date(Date.UTC(2026, 10, 12))
const opensAt = new Date(Date.UTC(2026, 9, 1, 9, 0))
const closesAt = new Date(Date.UTC(2026, 9, 1, 16, 0))

function DateValue({ date, formatLocale }: { date: Date; formatLocale: string }) {
  const text = new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    date,
  )
  return <time dateTime={date.toISOString().slice(0, 10)}>{text}</time>
}

function TimeValue({ time, formatLocale }: { time: Date; formatLocale: string }) {
  const text = new Intl.DateTimeFormat(formatLocale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(time)
  return <time dateTime={time.toISOString().slice(11, 16)}>{text}</time>
}

/** An invented number, as the other fixtures use, written the way the locale writes one. */
const phoneFor = (locale: NotificationFixtureLocale): string =>
  locale === 'nb' || locale === 'nn' ? '800 12 345' : '0123-45 67 89'

export interface NotificationFixtureProps {
  locale: NotificationFixtureLocale
}

/**
 * Example A, info, present at load: a deadline on a start page. No `announce`. The Docs page's
 * controls reach the root through `rootProps`.
 */
export function DeadlineNotification({
  locale,
  ...rootProps
}: NotificationFixtureProps & NotificationStatusRootProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <Notification.Info lang={lang} data-testid="deadline" {...rootProps}>
      <Notification.Title>
        {text.deadline.title(<DateValue date={applicationsClose} formatLocale={formatLocale} />)}
      </Notification.Title>
      <Notification.Body>
        <p>{text.deadline.body(<DateValue date={replyBy} formatLocale={formatLocale} />)}</p>
      </Notification.Body>
    </Notification.Info>
  )
}

/** Example C, warning with an action, present at load: a permit about to expire. */
export function PermitNotification({ locale }: NotificationFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <Notification.Warning lang={lang} data-testid="permit">
      <Notification.Title>
        {text.permit.title(<DateValue date={permitExpires} formatLocale={formatLocale} />)}
      </Notification.Title>
      <Notification.Body>
        <p>{text.permit.body}</p>
      </Notification.Body>
      <Notification.Actions>
        <Link.Root href="#renew">{text.permit.renew}</Link.Root>
      </Notification.Actions>
    </Notification.Warning>
  )
}

/** Example C2, warning text next to an action: the Title as a paragraph, no Body. */
export function ConsequenceNotification({ locale }: NotificationFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Notification.Warning lang={lang} data-testid="consequence">
      <Notification.Title render={<p />}>{text.consequence.title}</Notification.Title>
    </Notification.Warning>
  )
}

/** Example B as it looks once shown, without the button: a success with only a Title as `<p>`. */
export function SavedNotification({ locale }: NotificationFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Notification.Success lang={lang} data-testid="saved">
      <Notification.Title render={<p />}>{text.saved.title}</Notification.Title>
    </Notification.Success>
  )
}

/** Example D as it looks once shown, without the announcement: a danger with a Button. */
export function SendFailedNotification({ locale }: NotificationFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <Notification.Danger lang={lang} data-testid="send-failed-notification">
      <Notification.Title>{text.sendFailed.title}</Notification.Title>
      <Notification.Body>
        <p>
          {text.sendFailed.body(
            phoneFor(locale),
            <TimeValue time={opensAt} formatLocale={formatLocale} />,
            <TimeValue time={closesAt} formatLocale={formatLocale} />,
          )}
        </p>
      </Notification.Body>
      <Notification.Actions>
        <Button>{text.sendFailed.retry}</Button>
      </Notification.Actions>
    </Notification.Danger>
  )
}

/**
 * Example B, success, inserted after Save: the Save button keeps focus, and the notification
 * above it is announced politely once. Saving again shows it again and announces it again.
 */
export function SavedExample({ locale }: NotificationFixtureProps) {
  const { text, lang } = textsFor(locale)
  const [saveCount, setSaveCount] = useState(0)
  return (
    <div className="kv-story-notification-column" lang={lang} data-testid="saved-example">
      {saveCount === 0 ? null : (
        <Notification.Success key={saveCount} announce="polite" data-testid="saved">
          <Notification.Title render={<p />}>{text.saved.title}</Notification.Title>
        </Notification.Success>
      )}
      <div className="kv-button-group">
        <Button className="kv-button--primary" onClick={() => setSaveCount((count) => count + 1)}>
          {text.saved.save}
        </Button>
      </div>
    </div>
  )
}

/**
 * Example D, danger, inserted after Send fails: placed directly above Send, so Shift+Tab from Send
 * reaches "Försök igen". The first Send shows it, announced once on mount. Every next failure
 * keeps the same instance, because "Försök igen" is inside it and a remount would drop the focus
 * to the page, and announces through `useAnnouncer()` instead.
 */
export function SendFailedExample({ locale }: NotificationFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
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
    <div className="kv-story-notification-column" lang={lang} data-testid="send-failed-example">
      {failed ? (
        <Notification.Danger announce="polite" data-testid="send-failed-notification">
          <Notification.Title>{text.sendFailed.title}</Notification.Title>
          <Notification.Body>
            <p>
              {text.sendFailed.body(
                phoneFor(locale),
                <TimeValue time={opensAt} formatLocale={formatLocale} />,
                <TimeValue time={closesAt} formatLocale={formatLocale} />,
              )}
            </p>
          </Notification.Body>
          <Notification.Actions>
            <Button onClick={fail}>{text.sendFailed.retry}</Button>
          </Notification.Actions>
        </Notification.Danger>
      ) : null}
      <div className="kv-button-group">
        <Button className="kv-button--primary" onClick={fail}>
          {text.sendFailed.send}
        </Button>
      </div>
    </div>
  )
}

/**
 * The arrival pattern, and the mechanics of the later error summary: a danger notification that
 * takes focus once when it mounts (`tabIndex={-1}`), with no `announce`, because focus already
 * reads it. Tab from it goes to its first action.
 */
export function FocusTargetExample({ locale }: NotificationFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    // Only after the user asked for it: on a Docs page the stories share one document, and a
    // notification that took focus on load would pull it away from the page.
    if (shown) {
      ref.current?.focus()
    }
  }, [shown])
  return (
    <div className="kv-story-notification-column" lang={lang}>
      <Button onClick={() => setShown(true)}>{text.sendFailed.send}</Button>
      {shown ? (
        <Notification.Danger ref={ref} tabIndex={-1} data-testid="focus-target">
          <Notification.Title>{text.sendFailed.title}</Notification.Title>
          <Notification.Body>
            <p>
              {text.sendFailed.body(
                phoneFor(locale),
                <TimeValue time={opensAt} formatLocale={formatLocale} />,
                <TimeValue time={closesAt} formatLocale={formatLocale} />,
              )}
            </p>
          </Notification.Body>
          <Notification.Actions>
            <Button>{text.sendFailed.retry}</Button>
            <Link.Root href="#help">{text.permit.renew}</Link.Root>
          </Notification.Actions>
        </Notification.Danger>
      ) : null}
    </div>
  )
}

/** The statuses by their component, so a status that comes from data is a typed map. */
const notificationFor = {
  info: Notification.Info,
  success: Notification.Success,
  warning: Notification.Warning,
  danger: Notification.Danger,
} satisfies Record<NotificationVariant, unknown>

export const notificationVariants = Object.keys(notificationFor) as NotificationVariant[]

/** A status from data: a select picks it, and the typed map picks the component. */
export function DynamicStatusExample({ locale }: NotificationFixtureProps) {
  const { text, lang } = textsFor(locale)
  const [variant, setVariant] = useState<NotificationVariant>('warning')
  const selectId = useId()
  const ResultNotification = notificationFor[variant]
  return (
    <div className="kv-story-notification-column" lang={lang}>
      <div>
        <label htmlFor={selectId}>{text.dynamic.label}</label>{' '}
        <select
          id={selectId}
          value={variant}
          onChange={(event) => {
            const next = notificationVariants.find((name) => name === event.target.value)
            if (next !== undefined) {
              setVariant(next)
            }
          }}
        >
          {notificationVariants.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <ResultNotification data-testid="dynamic">
        <Notification.Title>{text.sample.title}</Notification.Title>
      </ResultNotification>
    </div>
  )
}
