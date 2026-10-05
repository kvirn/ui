import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Alert, Button, ButtonGroup, defineIcons, Icon, KvirnProvider } from '@kvirn-ui/react'
import type { BuiltInIconName, IconName } from '@kvirn-ui/react'
import { builtInIcons } from '../../../../../packages/react/src/icon/built-in-icons.tsx'
import { Warning as PhosphorWarning } from '@phosphor-icons/react'
import { ArrowRight, MapPin, Search, Trash2, X as LucideClose } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { HTMLAttributes, ReactNode, Ref, SVGProps } from 'react'
import { createPortal } from 'react-dom'

// Story and e2e fixture: the design spec's strings (docs/design/icon.md §4.3). sv, en, nb
// and nn are written. The fi strings are the designer's drafts, for length checks only. se:
// English, marked lang="en" (3.1.2). Icon names are code, so they aren't translated. Dates are
// values, formatted with Intl.

export type IconFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

/**
 * Every built-in icon, in the order of the design spec (§4.1). Read from `builtInIcons`, the
 * package's own set, so the gallery can't drift from it: a new icon shows up here, and in the
 * gallery, with no edit. The set is not a public export, so this is the one place a fixture
 * reads the package source by relative path.
 */
export const builtInIconNames = Object.keys(builtInIcons) as BuiltInIconName[]

/** The built-ins whose entry sets `mirrorInRtl`: the horizontal-direction icons, flipped in RTL (§4.1). */
export const mirroredIconNames = builtInIconNames.filter((name) => {
  const entry = builtInIcons[name]
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'mirrorInRtl' in entry &&
    entry.mirrorInRtl === true
  )
})

export const isMirroredIcon = (name: BuiltInIconName): boolean => mirroredIconNames.includes(name)

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

/** Designer drafts (docs/design/icon.md §4.3), for length checks. */
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

const nb: IconTexts = {
  button: {
    addChild: 'Legg til et barn til',
    continue: 'Gå videre',
    download: 'Last ned vedtaket som PDF',
    close: 'Lukk',
    search: 'Søk',
    menu: 'Meny',
    removeFile: (fileName) => `Fjern ${fileName}`,
    showPassword: 'Vis passord',
    hidePassword: 'Skjul passord',
  },
  status: {
    error: { word: 'Feil', line: (example) => `Skriv datoen i formatet ${example}.` },
    warning: { word: 'Advarsel', line: () => 'Økten din avsluttes om 5 minutter.' },
    success: { word: 'Ferdig', line: () => 'Søknaden din er sendt.' },
    info: { word: 'Greit å vite', line: () => 'Vi svarer innen 2 arbeidsdager.' },
  },
  text: {
    collection: (date) => <>Neste tømming er {date}.</>,
    guide: 'Les veiledningen',
  },
  label: { logo: 'Eksempelby kommune' },
  language: { current: 'Svenska' },
  gallery: { mirrors: 'Speiles i RTL', doesNotMirror: 'Speiles ikke i RTL' },
  pagination: { previous: 'Forrige', next: 'Neste' },
}

const nn: IconTexts = {
  button: {
    addChild: 'Legg til eit barn til',
    continue: 'Gå vidare',
    download: 'Last ned vedtaket som PDF',
    close: 'Lukk',
    search: 'Søk',
    menu: 'Meny',
    removeFile: (fileName) => `Fjern ${fileName}`,
    showPassword: 'Vis passord',
    hidePassword: 'Skjul passord',
  },
  status: {
    error: { word: 'Feil', line: (example) => `Skriv datoen i formatet ${example}.` },
    warning: { word: 'Åtvaring', line: () => 'Økta di blir avslutta om 5 minutt.' },
    success: { word: 'Ferdig', line: () => 'Søknaden din er send.' },
    info: { word: 'Greitt å vite', line: () => 'Vi svarer innan 2 arbeidsdagar.' },
  },
  text: {
    collection: (date) => <>Neste tømming er {date}.</>,
    guide: 'Les rettleiinga',
  },
  label: { logo: 'Eksempelby kommune' },
  language: { current: 'Svenska' },
  gallery: { mirrors: 'Blir spegla i RTL', doesNotMirror: 'Blir ikkje spegla i RTL' },
  pagination: { previous: 'Førre', next: 'Neste' },
}

/** se has no texts: it shows the English ones, marked lang="en". */
const iconTexts: Record<IconFixtureLocale, IconTexts | undefined> = {
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

export const isIconFixtureLocale = (value: unknown): value is IconFixtureLocale =>
  typeof value === 'string' && value in iconTexts

interface ResolvedTexts {
  text: IconTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function textsFor(locale: IconFixtureLocale): ResolvedTexts {
  const text = iconTexts[locale]
  if (text === undefined) {
    return { text: en, lang: 'en', formatLocale: formatLocales.en }
  }
  return {
    text,
    lang: undefined,
    formatLocale: formatLocales[locale === 'se' ? 'en' : locale],
  }
}

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const nextCollection = new Date(Date.UTC(2026, 9, 14))
const exampleDeadline = new Date(Date.UTC(2026, 11, 31))

/** The next collection: a `<time>`, in the locale's long date format. */
export function collectionDate(formatLocale: string) {
  const text = new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    nextCollection,
  )
  return <time dateTime={nextCollection.toISOString().slice(0, 10)}>{text}</time>
}

/** `31.12.2026` in fi and nb, `2026-12-31` in sv: the date format the error line asks for. */
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

/**
 * The four status alerts: the icon comes from the component, and the status word is the
 * title, so the shapes never carry the meaning alone (1.4.1).
 */
export function StatusAlerts({ locale }: IconFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  const { info, success, warning, error } = text.status
  return (
    <div className="kv-story-status-lines" lang={lang}>
      <Alert.Info>
        <Alert.Title>{info.word}</Alert.Title>
        <Alert.Body>
          <p>{info.line(exampleDate(formatLocale))}</p>
        </Alert.Body>
      </Alert.Info>
      <Alert.Success>
        <Alert.Title>{success.word}</Alert.Title>
        <Alert.Body>
          <p>{success.line(exampleDate(formatLocale))}</p>
        </Alert.Body>
      </Alert.Success>
      <Alert.Warning>
        <Alert.Title>{warning.word}</Alert.Title>
        <Alert.Body>
          <p>{warning.line(exampleDate(formatLocale))}</p>
        </Alert.Body>
      </Alert.Warning>
      <Alert.Danger>
        <Alert.Title>{error.word}</Alert.Title>
        <Alert.Body>
          <p>{error.line(exampleDate(formatLocale))}</p>
        </Alert.Body>
      </Alert.Danger>
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

const joinClasses = (...classNames: (string | undefined)[]): string =>
  classNames.filter((className) => className !== undefined).join(' ')

/** The icon in the right place: start, end or alone. Names come from the fixture. */
function buttonsRow(locale: IconFixtureLocale, className?: string) {
  const { text, lang } = textsFor(locale)
  return (
    <ButtonGroup lang={lang}>
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
    </ButtonGroup>
  )
}

/** The same row disabled. A disabled button's icon takes the muted text colour. */
function disabledButtonsRow(locale: IconFixtureLocale) {
  const { text, lang } = textsFor(locale)
  return (
    <ButtonGroup lang={lang}>
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
    </ButtonGroup>
  )
}

const buttonGroups = [
  { id: 'secondary', className: undefined, label: 'kv-button' },
  { id: 'primary', className: 'kv-button--primary', label: 'kv-button--primary' },
  { id: 'danger', className: 'kv-button--danger', label: 'kv-button--danger' },
] as const

/**
 * Icon at the start, icon at the end and icon-only, in secondary, primary, danger and
 * disabled. The group names are class names, so they aren't translated. Called as a function
 * in the story, so "Show code" shows the Buttons.
 */
export function buttonMatrix(locale: IconFixtureLocale) {
  return (
    <div className="kv-story-states">
      {buttonGroups.map((group) => (
        <div key={group.id} className="kv-story-state">
          <p>
            <code>{group.label}</code>
          </p>
          {buttonsRow(locale, group.className)}
        </div>
      ))}
      <div className="kv-story-state">
        <p>
          <code>disabled</code>
        </p>
        {disabledButtonsRow(locale)}
      </div>
    </div>
  )
}

/** More actions with an icon at the start: remove a file, the password toggle, menu, language. */
export function moreButtons(locale: IconFixtureLocale) {
  const { text, lang } = textsFor(locale)
  return (
    <ButtonGroup lang={lang}>
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
    </ButtonGroup>
  )
}

/** A long Finnish label next to its icon, in a narrow column: the label wraps, the icon stays. */
export function narrowButtons() {
  const { text } = textsFor('fi')
  return (
    <div className="kv-story-narrow" lang="fi" data-testid="narrow-buttons">
      <ButtonGroup>
        <Button className="kv-button--primary" data-testid="download-button">
          <Icon name="download" />
          {text.button.download}
        </Button>
        <Button className="kv-button--icon-only" aria-label={text.button.close}>
          <Icon name="close" />
        </Button>
      </ButtonGroup>
    </div>
  )
}

/** Lucide, one-off: pass the component as `icon`. Icon's own props replace Lucide's. */
export function LucideOneOff({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <ul className="kv-story-inline-list" lang={lang}>
      <li>
        <Icon icon={Search} label={text.button.search} />
      </li>
      <li>
        <Icon icon={MapPin} size={6} color="var(--kv-color-primary)" />
      </li>
      <li>
        <Icon icon={Trash2} strokeWidth={1.5} />
      </li>
    </ul>
  )
}

/**
 * Lucide, registered: `<Icon name>` and every KvirnUI component use Lucide's drawings. Call
 * `defineIcons` once at module level in your app, next to the provider: a library's drawings
 * replace the built-in ones of the same names, and library defaults such as Lucide's 2 stroke go
 * in `iconDefaults`. Names that aren't built in need `Register` (see the Icon guide).
 */
export function LucideRegistered({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  const icons = defineIcons({
    search: Search,
    delete: Trash2,
    'arrow-forward': { component: ArrowRight, mirrorInRtl: true },
  })
  return (
    <KvirnProvider icons={icons} iconDefaults={{ strokeWidth: 1.5 }}>
      <ButtonGroup lang={lang}>
        <Button>
          <Icon name="search" />
          {text.button.search}
        </Button>
        <Button>
          {text.button.continue}
          <Icon name="arrow-forward" />
        </Button>
      </ButtonGroup>
    </KvirnProvider>
  )
}

/** Heroicons, one-off: pass the component as `icon`. A `label` removes Heroicons' `aria-hidden`. */
export function HeroiconsOneOff({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <ul className="kv-story-inline-list" lang={lang}>
      <li>
        <Icon icon={MagnifyingGlassIcon} label={text.button.search} />
      </li>
      <li>
        <Icon icon={MapPinIcon} size={6} color="var(--kv-color-primary)" />
      </li>
      <li>
        <Icon icon={TrashIcon} strokeWidth={1.5} />
      </li>
    </ul>
  )
}

/** Heroicons, registered: `<Icon name>` and every KvirnUI component use Heroicons' drawings. */
export function HeroiconsRegistered({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  const icons = defineIcons({
    search: MagnifyingGlassIcon,
    delete: TrashIcon,
    'arrow-forward': { component: ArrowRightIcon, mirrorInRtl: true },
  })
  return (
    <KvirnProvider icons={icons}>
      <ButtonGroup lang={lang}>
        <Button>
          <Icon name="search" />
          {text.button.search}
        </Button>
        <Button>
          {text.button.continue}
          <Icon name="arrow-forward" />
        </Button>
      </ButtonGroup>
    </KvirnProvider>
  )
}

/**
 * Registered over the built-ins, a library's drawing replaces the built-in one for every
 * component, with the same `size` and `color`. A plain component under `arrow-forward` still
 * mirrors in right-to-left text, because mirroring belongs to the name (design spec §4.2).
 * `logo` isn't built in: an app adds it by augmenting `Register`, so this story casts the name.
 */
export function LibraryIcons({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  const icons = defineIcons({
    close: LucideClose,
    delete: TrashIcon,
    warning: PhosphorWarning,
    'arrow-forward': ArrowRight,
    logo: MunicipalityMark,
  })
  const overridden = ['close', 'delete', 'warning', 'arrow-forward'] as const
  return (
    <div lang={lang}>
      <ul className="kv-story-icon-strip" data-testid="registry">
        {overridden.map((name) => (
          <li key={name} className="kv-story-icon-cell">
            <span className="kv-story-icon-row" data-testid={`built-in-${name}`}>
              <Icon name={name} size={6} color="var(--kv-color-primary)" />
              <code>{name}</code>
            </span>
            <KvirnProvider icons={icons}>
              <span className="kv-story-icon-row" data-testid={`registered-${name}`}>
                <Icon name={name} size={6} color="var(--kv-color-primary)" />
                <code>{name}</code>
              </span>
            </KvirnProvider>
          </li>
        ))}
        <li className="kv-story-icon-cell">
          <KvirnProvider icons={icons}>
            <Icon name={'logo' as IconName} size={6} label={text.label.logo} />
          </KvirnProvider>
          <code>logo</code>
        </li>
      </ul>
      <div dir="rtl">
        <KvirnProvider icons={icons}>
          <Button>
            {text.button.continue}
            <Icon name="arrow-forward" data-testid="overridden-arrow" />
          </Button>
        </KvirnProvider>
      </div>
    </div>
  )
}

/**
 * What a registry can say and what an instance can override. An entry `{ component,
 * mirrorInRtl }` sets the direction per name (here `false` turns the built-in arrow's flip off),
 * and `mirrorInRtl` on an Icon wins over the entry. `iconDefaults.size` sizes every Icon below,
 * and a nested provider adds icons and replaces fields, over its parent's.
 */
export function RegistryEntries({ locale }: IconFixtureProps) {
  const { lang } = textsFor(locale)
  const icons = defineIcons({
    search: Search,
    'arrow-forward': { component: ArrowRight, mirrorInRtl: false },
  })
  const nestedIcons = defineIcons({ delete: Trash2 })
  return (
    <KvirnProvider icons={icons} iconDefaults={{ size: 6 }}>
      <ul className="kv-story-inline-list" lang={lang} dir="rtl">
        <li data-testid="entry-says-no-flip">
          <Icon name="arrow-forward" />
        </li>
        <li data-testid="instance-flips">
          <Icon name="arrow-forward" mirrorInRtl />
        </li>
        <li data-testid="default-size">
          <Icon name="search" />
        </li>
        <li data-testid="own-size">
          <Icon name="search" size={4} />
        </li>
        <KvirnProvider icons={nestedIcons} iconDefaults={{ strokeWidth: 2 }}>
          <li data-testid="nested-delete">
            <Icon name="delete" />
          </li>
          <li data-testid="nested-keeps-parent">
            <Icon name="search" />
          </li>
        </KvirnProvider>
      </ul>
    </KvirnProvider>
  )
}

/**
 * Without the theme: the icons render in a shadow root, where `theme.css` doesn't reach.
 * `ShadowIsland` stands in for a page that doesn't load the theme, so only the Icon and Button
 * inside it are what you write.
 */
export function UnstyledIcons({ locale }: IconFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <ShadowIsland data-testid="unstyled" dir="rtl" lang={lang}>
      <p>
        {([4, 5, 6] as const).map((size) => (
          <Icon key={size} name="check" size={size} color="var(--kv-color-success)" />
        ))}
      </p>
      <p>
        <Icon name="arrow-forward" size={6} />
      </p>
      <p>
        <Button aria-label={text.button.close}>
          <Icon name="close" />
        </Button>
      </p>
    </ShadowIsland>
  )
}
