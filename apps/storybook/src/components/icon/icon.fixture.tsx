import { Button, Icon } from '@kvirn-ui/react'
import type { BuiltInIconName } from '@kvirn-ui/react'
import { useCallback, useState } from 'react'
import type { HTMLAttributes, ReactNode, Ref, SVGProps } from 'react'
import { createPortal } from 'react-dom'

// Story and e2e fixture: the design spec's strings (docs/design/icon.md §4.3). sv and en are
// written. The fi strings are the designer's drafts, for length checks only. nb, nn and se come
// from a translator, not an agent: until then those locales show the English text, marked
// lang="en" (3.1.2). Icon names are code, so they aren't translated. Dates are values,
// formatted with Intl.

export type IconFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

/** The 24 built-in icons, in the order of the design spec (§4.1). */
export const builtInIconNames = [
  'chevron-down',
  'chevron-up',
  'chevron-back',
  'chevron-forward',
  'arrow-back',
  'arrow-forward',
  'external',
  'close',
  'menu',
  'search',
  'add',
  'check',
  'info',
  'success',
  'warning',
  'error',
  'calendar',
  'upload',
  'download',
  'document',
  'delete',
  'language',
  'eye',
  'eye-off',
] as const satisfies readonly BuiltInIconName[]

/** Icons 3–7 show a horizontal direction, so they flip in right-to-left text (§4.1). */
export const mirroredIconNames = [
  'chevron-back',
  'chevron-forward',
  'arrow-back',
  'arrow-forward',
  'external',
] as const satisfies readonly BuiltInIconName[]

export const isMirroredIcon = (name: BuiltInIconName): boolean =>
  (mirroredIconNames as readonly BuiltInIconName[]).includes(name)

export type StatusKind = 'info' | 'success' | 'warning' | 'error'
export const statusKinds = [
  'info',
  'success',
  'warning',
  'error',
] as const satisfies readonly StatusKind[]

interface StatusText {
  /** The visible status word, such as "Warning". */
  word: string
  /** The status line. Only the error line has an example. */
  line: (example: string) => string
}

interface IconTexts {
  button: {
    addChild: string
    continue: string
    download: string
    close: string
    search: string
    menu: string
    removeFile: (fileName: string) => string
    showPassword: string
    hidePassword: string
  }
  status: Record<StatusKind, StatusText>
  text: {
    collection: (date: ReactNode) => ReactNode
    guide: string
  }
  label: { logo: string }
  language: { current: string }
  gallery: { mirrors: string; doesNotMirror: string }
  pagination: { previous: string; next: string }
}

const en: IconTexts = {
  button: {
    addChild: 'Add another child',
    continue: 'Continue',
    download: 'Download the decision as a PDF',
    close: 'Close',
    search: 'Search',
    menu: 'Menu',
    removeFile: (fileName) => `Remove ${fileName}`,
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  status: {
    error: { word: 'Error', line: (example) => `Enter the date in the format ${example}.` },
    warning: { word: 'Warning', line: () => 'Your session ends in 5 minutes.' },
    success: { word: 'Done', line: () => 'Your application has been sent.' },
    info: { word: 'Good to know', line: () => 'We answer within 2 working days.' },
  },
  text: {
    collection: (date) => <>Your next collection is on {date}.</>,
    guide: 'Read the guide',
  },
  label: { logo: 'Exempelby municipality' },
  language: { current: 'Svenska' },
  gallery: { mirrors: 'Mirrors in RTL', doesNotMirror: 'Doesn’t mirror in RTL' },
  pagination: { previous: 'Previous', next: 'Next' },
}

const sv: IconTexts = {
  button: {
    addChild: 'Lägg till ett barn till',
    continue: 'Fortsätt',
    download: 'Ladda ner beslutet som pdf',
    close: 'Stäng',
    search: 'Sök',
    menu: 'Meny',
    removeFile: (fileName) => `Ta bort ${fileName}`,
    showPassword: 'Visa lösenord',
    hidePassword: 'Dölj lösenord',
  },
  status: {
    error: { word: 'Fel', line: (example) => `Ange datumet i formatet ${example}.` },
    warning: { word: 'Varning', line: () => 'Din session avslutas om 5 minuter.' },
    success: { word: 'Klart', line: () => 'Din ansökan har skickats.' },
    info: { word: 'Bra att veta', line: () => 'Vi svarar inom 2 arbetsdagar.' },
  },
  text: {
    collection: (date) => <>Nästa tömning är {date}.</>,
    guide: 'Läs guiden',
  },
  label: { logo: 'Exempelby kommun' },
  language: { current: 'Svenska' },
  gallery: { mirrors: 'Speglas vid RTL', doesNotMirror: 'Speglas inte vid RTL' },
  pagination: { previous: 'Föregående', next: 'Nästa' },
}

/** Designer drafts (docs/design/icon.md §4.3), for length checks. Not reviewed by a translator. */
const fi: IconTexts = {
  button: {
    addChild: 'Lisää toinen lapsi',
    continue: 'Jatka',
    download: 'Lataa päätös PDF-tiedostona',
    close: 'Sulje',
    search: 'Hae',
    menu: 'Valikko',
    removeFile: (fileName) => `Poista tiedosto ${fileName}`,
    showPassword: 'Näytä salasana',
    hidePassword: 'Piilota salasana',
  },
  status: {
    error: { word: 'Virhe', line: (example) => `Anna päivämäärä muodossa ${example}.` },
    warning: { word: 'Varoitus', line: () => 'Istuntosi päättyy 5 minuutin kuluttua.' },
    success: { word: 'Valmis', line: () => 'Hakemuksesi on lähetetty.' },
    info: { word: 'Hyvä tietää', line: () => 'Vastaamme kahden arkipäivän kuluessa.' },
  },
  text: {
    collection: (date) => <>Seuraava tyhjennys on {date}.</>,
    guide: 'Lue ohje',
  },
  label: { logo: 'Exempelbyn kunta' },
  language: { current: 'Svenska' },
  gallery: {
    mirrors: 'Peilataan oikealta vasemmalle -suunnassa',
    doesNotMirror: 'Ei peilata oikealta vasemmalle -suunnassa',
  },
  pagination: { previous: 'Edellinen', next: 'Seuraava' },
}

/** nb, nn and se: `undefined` until a translator delivers them. */
const iconTexts: Record<IconFixtureLocale, IconTexts | undefined> = {
  sv,
  fi,
  nb: undefined,
  nn: undefined,
  se: undefined,
  en,
}

const formatLocales: Record<'sv' | 'fi' | 'en', string> = {
  sv: 'sv-SE',
  fi: 'fi-FI',
  en: 'en-GB',
}

export const isIconFixtureLocale = (value: unknown): value is IconFixtureLocale =>
  typeof value === 'string' && value in iconTexts

interface ResolvedTexts {
  text: IconTexts
  /** `'en'` when the locale isn't translated yet: put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` until it's translated. */
export function textsFor(locale: IconFixtureLocale): ResolvedTexts {
  const text = iconTexts[locale]
  if (text === undefined) {
    return { text: en, lang: 'en', formatLocale: formatLocales.en }
  }
  return {
    text,
    lang: undefined,
    formatLocale: formatLocales[locale === 'sv' || locale === 'fi' ? locale : 'en'],
  }
}

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const nextCollection = new Date(Date.UTC(2026, 9, 14))
const exampleDeadline = new Date(Date.UTC(2026, 11, 31))

/** The next collection: a `<time>`, in the locale's long date format. */
export function CollectionDate({ formatLocale }: { formatLocale: string }) {
  const text = new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    nextCollection,
  )
  return <time dateTime={nextCollection.toISOString().slice(0, 10)}>{text}</time>
}

/** `31.12.2026` in fi, `2026-12-31` in sv: the date format the error line asks for. */
const exampleDate = (formatLocale: string): string =>
  new Intl.DateTimeFormat(formatLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(exampleDeadline)

export const exampleFileName = 'beslut.pdf'

export interface IconFixtureProps {
  locale: IconFixtureLocale
}

/** A status line: the icon, the status word and the line, which is what carries the meaning. */
export function StatusLine({ locale, status }: IconFixtureProps & { status: StatusKind }) {
  const { text, lang, formatLocale } = textsFor(locale)
  const { word, line } = text.status[status]
  return (
    <p lang={lang}>
      <Icon
        name={status}
        color={status === 'info' ? undefined : `var(--kv-color-${statusColorToken[status]})`}
      />{' '}
      <strong>{word}:</strong> {line(exampleDate(formatLocale))}
    </p>
  )
}

const statusColorToken = {
  success: 'success',
  warning: 'warning',
  error: 'danger',
} as const satisfies Record<Exclude<StatusKind, 'info'>, string>

/** The four status lines, each on its own, or each in its `-subtle` panel with a bar. */
export function StatusLines({
  locale,
  panels = false,
}: IconFixtureProps & { panels?: boolean | undefined }) {
  return (
    <div className="kv-story-status-lines">
      {statusKinds.map((status) =>
        panels ? (
          <div key={status} className="kv-story-status-panel" data-status={status}>
            <StatusLine locale={locale} status={status} />
          </div>
        ) : (
          <StatusLine key={status} locale={locale} status={status} />
        ),
      )}
    </div>
  )
}

/**
 * An icon component the way SVGR or a hand-written one has it: it forwards its ref and spreads
 * the SVG props onto one `<svg>`. Stands in for an imported `.svg` file.
 */
export function MunicipalityMark({
  ref,
  ...svgProps
}: SVGProps<SVGSVGElement> & { ref?: Ref<SVGSVGElement> | undefined }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgProps}
      ref={ref}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l4.5 5-4.5 5-4.5-5Z" />
    </svg>
  )
}

/**
 * Renders its children in a shadow root, where `theme.css` doesn't reach: the Unstyled story.
 * Custom properties and inherited text styles still do, like on a site without the theme.
 */
export function ShadowIsland({
  children,
  ...hostProps
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const [root, setRoot] = useState<ShadowRoot | null>(null)
  const attach = useCallback((host: HTMLDivElement | null) => {
    setRoot(host === null ? null : (host.shadowRoot ?? host.attachShadow({ mode: 'open' })))
  }, [])
  return (
    <div {...hostProps} ref={attach}>
      {root === null ? null : createPortal(children, root)}
    </div>
  )
}

/** The icon in the right place: start, end or alone. Names come from the fixture. */
function ButtonsRow({ locale, className }: IconFixtureProps & { className?: string | undefined }) {
  const { text, lang } = textsFor(locale)
  return (
    <div className="kv-button-group" lang={lang}>
      <Button className={className}>
        <Icon name="add" />
        {text.button.addChild}
      </Button>
      <Button className={className}>
        {text.button.continue}
        <Icon name="arrow-forward" />
      </Button>
      <Button
        className={joinClasses('kv-button--icon-only', className)}
        aria-label={text.button.close}
      >
        <Icon name="close" />
      </Button>
      <Button
        className={joinClasses('kv-button--icon-only', className)}
        aria-label={text.button.search}
      >
        <Icon name="search" />
      </Button>
    </div>
  )
}

const joinClasses = (...classNames: (string | undefined)[]): string =>
  classNames.filter((className) => className !== undefined).join(' ')

/** The same row disabled. A disabled button's icon takes the muted text colour. */
function DisabledButtonsRow({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <div className="kv-button-group" lang={lang}>
      <Button disabled>
        <Icon name="add" />
        {text.button.addChild}
      </Button>
      <Button disabled>
        {text.button.continue}
        <Icon name="arrow-forward" />
      </Button>
      <Button className="kv-button--icon-only" aria-label={text.button.close} disabled>
        <Icon name="close" />
      </Button>
      <Button className="kv-button--icon-only" aria-label={text.button.search} disabled>
        <Icon name="search" />
      </Button>
    </div>
  )
}

const buttonGroups = [
  { id: 'secondary', className: undefined, label: 'kv-button' },
  { id: 'primary', className: 'kv-button--primary', label: 'kv-button--primary' },
  { id: 'danger', className: 'kv-button--danger', label: 'kv-button--danger' },
] as const

/**
 * Icon at the start, icon at the end and icon-only, in secondary, primary, danger and
 * disabled. The group names are class names, so they aren't translated.
 */
export function ButtonMatrix({ locale }: IconFixtureProps) {
  return (
    <div className="kv-story-states">
      {buttonGroups.map((group) => (
        <div key={group.id} className="kv-story-state">
          <p>
            <code>{group.label}</code>
          </p>
          <ButtonsRow locale={locale} className={group.className} />
        </div>
      ))}
      <div className="kv-story-state">
        <p>
          <code>disabled</code>
        </p>
        <DisabledButtonsRow locale={locale} />
      </div>
    </div>
  )
}

/** More actions with an icon at the start: remove a file, the password toggle, menu, language. */
export function MoreButtons({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <div className="kv-button-group" lang={lang}>
      <Button>
        <Icon name="delete" />
        {text.button.removeFile(exampleFileName)}
      </Button>
      <Button>
        <Icon name="eye" />
        {text.button.showPassword}
      </Button>
      <Button>
        <Icon name="eye-off" />
        {text.button.hidePassword}
      </Button>
      <Button>
        <Icon name="menu" />
        {text.button.menu}
      </Button>
      <Button>
        <Icon name="language" />
        <span lang="sv">{text.language.current}</span>
      </Button>
    </div>
  )
}

/** A long Finnish label next to its icon, in a narrow column: the label wraps, the icon stays. */
export function NarrowButtons() {
  const { text } = textsFor('fi')
  return (
    <div className="kv-story-narrow" lang="fi" data-testid="narrow-buttons">
      <div className="kv-button-group">
        <Button className="kv-button--primary" data-testid="download-button">
          <Icon name="download" />
          {text.button.download}
        </Button>
        <Button className="kv-button--icon-only" aria-label={text.button.close}>
          <Icon name="close" />
        </Button>
      </div>
    </div>
  )
}
