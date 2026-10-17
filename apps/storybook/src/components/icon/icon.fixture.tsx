// kv-lang-ok-file: per-locale story texts: the toolbar locale selects the sv, fi, nb, nn or en table
import { search } from '@kvirn-ui/icons'
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Alert, Button, ButtonGroup, defineIcons, Icon, KvirnProvider, Link } from '@kvirn-ui/react'
import type { UseFormatResult } from '@kvirn-ui/react'
import { Warning as PhosphorWarning } from '@phosphor-icons/react'
import { ArrowRight, MapPin, Search, Trash2, X as LucideClose } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { HTMLAttributes, ReactNode, Ref, SVGProps } from 'react'
import { createPortal } from 'react-dom'

// Story fixture: the design spec's strings (docs/design/icon.md §4.3). sv, en, nb
// and nn are written. The fi strings are the designer's drafts, for length checks only.
// Icon names are code, so they aren't translated. Dates are
// values, formatted with `useFormat()`.

export type IconFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'en'

interface IconTexts {
  text: { collection: (date: ReactNode) => ReactNode }
}

const en: IconTexts = {
  text: { collection: (date) => <>Your next collection is on {date}.</> },
}

const sv: IconTexts = {
  text: { collection: (date) => <>Nästa tömning är {date}.</> },
}

const fi: IconTexts = {
  text: { collection: (date) => <>Seuraava tyhjennys on {date}.</> },
}

const nb: IconTexts = {
  text: { collection: (date) => <>Neste tømming er {date}.</> },
}

const nn: IconTexts = {
  text: { collection: (date) => <>Neste tømming er {date}.</> },
}

const iconTexts: Record<IconFixtureLocale, IconTexts | undefined> = {
  sv,
  fi,
  nb,
  nn,
  en,
}

export const isIconFixtureLocale = (value: unknown): value is IconFixtureLocale =>
  typeof value === 'string' && value in iconTexts

interface ResolvedTexts {
  text: IconTexts
  /** True when the locale has no texts and the fixture shows English. */
  isFallback: boolean
}

/** The fixture text in a locale. */
export function textsFor(locale: IconFixtureLocale): ResolvedTexts {
  const text = iconTexts[locale]
  if (text === undefined) {
    return { text: en, isFallback: true }
  }
  return {
    text,
    isFallback: false,
  }
}

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const nextCollection = new Date(Date.UTC(2026, 9, 14))

/** The next collection: a `<time>`, in the locale's long date format. */
export function collectionDate(format: UseFormatResult) {
  const text = format.date(nextCollection, { dateStyle: 'long', timeZone: 'UTC' })
  return <time dateTime={nextCollection.toISOString().slice(0, 10)}>{text}</time>
}

/**
 * The four status alerts: the icon comes from the component, and the status word is the
 * title, so the shapes never carry the meaning alone (1.4.1).
 */
export function StatusAlerts() {
  return (
    <>
      <Alert.Info>
        <Alert.Title>Good to know</Alert.Title>
        <Alert.Body>
          <p>We answer within 2 working days.</p>
        </Alert.Body>
      </Alert.Info>
      <Alert.Success>
        <Alert.Title>Done</Alert.Title>
        <Alert.Body>
          <p>Your application has been sent.</p>
        </Alert.Body>
      </Alert.Success>
      <Alert.Warning>
        <Alert.Title>Warning</Alert.Title>
        <Alert.Body>
          <p>Your session ends in 5 minutes.</p>
        </Alert.Body>
      </Alert.Warning>
      <Alert.Danger>
        <Alert.Title>Error</Alert.Title>
        <Alert.Body>
          <p>Enter the date in the format 31.12.2026.</p>
        </Alert.Body>
      </Alert.Danger>
    </>
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

/** A second icon component, to show `as` with a component that draws one shape. */
export function SquareMark({
  ref,
  ...svgProps
}: SVGProps<SVGSVGElement> & { ref?: Ref<SVGSVGElement> | undefined }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...svgProps} ref={ref}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
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

/**
 * Icon at the start, icon at the end and icon-only, in secondary, primary, danger and disabled.
 * An icon-only button is named by its `aria-label`.
 */
export function ButtonsWithIcons() {
  return (
    <>
      <ButtonGroup>
        <Button>
          <Icon name="add" />
          Add another child
        </Button>
        <Button>
          Continue
          <Icon name="arrow-forward" />
        </Button>
        <Button className="kv-button--icon-only" aria-label="Close">
          <Icon name="close" />
        </Button>
        <Button className="kv-button--icon-only" aria-label="Search">
          <Icon name="search" />
        </Button>
        <Button className="kv-button--icon-only" aria-label="Copy">
          <Icon name="copy" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button className="kv-button--primary">
          <Icon name="add" />
          Add another child
        </Button>
        <Button className="kv-button--primary">
          Continue
          <Icon name="arrow-forward" />
        </Button>
        <Button className="kv-button--primary kv-button--icon-only" aria-label="Close">
          <Icon name="close" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button className="kv-button--danger">
          <Icon name="delete" />
          Delete application
        </Button>
        <Button className="kv-button--danger">
          Continue
          <Icon name="arrow-forward" />
        </Button>
        <Button className="kv-button--danger kv-button--icon-only" aria-label="Close">
          <Icon name="close" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button disabled>
          <Icon name="add" />
          Add another child
        </Button>
        <Button disabled>
          Continue
          <Icon name="arrow-forward" />
        </Button>
        <Button className="kv-button--icon-only" aria-label="Close" disabled>
          <Icon name="close" />
        </Button>
      </ButtonGroup>
    </>
  )
}

/** More actions with an icon at the start: remove a file, the password toggle, menu, language. */
export function MoreButtons() {
  return (
    <ButtonGroup>
      <Button>
        <Icon name="delete" />
        Remove decision.pdf
      </Button>
      <Button>
        <Icon name="eye" />
        Show password
      </Button>
      <Button>
        <Icon name="eye-off" />
        Hide password
      </Button>
      <Button>
        <Icon name="menu" />
        Menu
      </Button>
      <Button>
        <Icon name="language" />
        <span lang="sv">Svenska</span>
      </Button>
    </ButtonGroup>
  )
}

/** A long Finnish label next to its icon: the label wraps, the icon stays. */
export function LongFinnishLabel() {
  return (
    <div lang="fi">
      <ButtonGroup>
        <Button className="kv-button--primary">
          <Icon name="download" />
          Lataa päätös PDF-tiedostona
        </Button>
        <Button className="kv-button--icon-only" aria-label="Sulje">
          <Icon name="close" />
        </Button>
      </ButtonGroup>
    </div>
  )
}

/** The icons that flip in RTL: the horizontal-direction ones (design spec §4.1). */
export function MirroredIcons() {
  return (
    <>
      <Icon name="chevron-back" size="24" />
      <Icon name="chevron-forward" size="24" />
      <Icon name="arrow-back" size="24" />
      <Icon name="arrow-forward" size="24" />
      <Icon name="external" size="24" />
    </>
  )
}

/** Icons that keep their drawing in RTL. */
export function FixedIcons() {
  return (
    <>
      <Icon name="check" size="24" />
      <Icon name="search" size="24" />
      <Icon name="chevron-down" size="24" />
    </>
  )
}

/** A Button with the arrow at its end, and a pagination-like row, point the right way. */
export function ArrowButtons() {
  return (
    <>
      <ButtonGroup>
        <Button className="kv-button--primary">
          Continue
          <Icon name="arrow-forward" />
        </Button>
      </ButtonGroup>
      <nav className="kv-button-group" aria-label="Pagination">
        <Button>
          <Icon name="chevron-back" />
          Previous
        </Button>
        <Button>
          Next
          <Icon name="chevron-forward" />
        </Button>
      </nav>
    </>
  )
}

/** Lucide, one-off: pass the component as `icon`. Icon's own props replace Lucide's. */
export function LucideOneOff() {
  return (
    <>
      <Icon icon={Search} label="Search" />
      <Icon icon={MapPin} size="24" variant="primary" />
      <Icon icon={Trash2} />
    </>
  )
}

/**
 * Lucide, registered: `<Icon name>` and every KvirnUI component use Lucide's drawings. Call
 * `defineIcons` once at module level in your app, next to the provider: a library's drawings
 * replace the library's drawings of the same names, and Lucide draws its own 2 stroke. Names that `@kvirn-ui/icons` doesn't have need `Register` (see the Icon guide).
 */
export function LucideRegistered() {
  const icons = defineIcons({
    search: Search,
    delete: Trash2,
    'arrow-forward': { component: ArrowRight, mirrorInRtl: true },
  })
  return (
    <KvirnProvider icons={icons}>
      <ButtonGroup>
        <Button>
          <Icon name="search" />
          Search
        </Button>
        <Button>
          Continue
          <Icon name="arrow-forward" />
        </Button>
      </ButtonGroup>
    </KvirnProvider>
  )
}

/** Heroicons, one-off: pass the component as `icon`. A `label` removes Heroicons' `aria-hidden`. */
export function HeroiconsOneOff() {
  return (
    <>
      <Icon icon={MagnifyingGlassIcon} label="Search" />
      <Icon icon={MapPinIcon} size="24" variant="primary" />
      <Icon icon={TrashIcon} />
    </>
  )
}

/** Heroicons, registered: `<Icon name>` and every KvirnUI component use Heroicons' drawings. */
export function HeroiconsRegistered() {
  const icons = defineIcons({
    search: MagnifyingGlassIcon,
    delete: TrashIcon,
    'arrow-forward': { component: ArrowRightIcon, mirrorInRtl: true },
  })
  return (
    <KvirnProvider icons={icons}>
      <ButtonGroup>
        <Button>
          <Icon name="search" />
          Search
        </Button>
        <Button>
          Continue
          <Icon name="arrow-forward" />
        </Button>
      </ButtonGroup>
    </KvirnProvider>
  )
}

/**
 * Registered over the library's icons, another library's drawing replaces the name's icon for
 * every component, with the same `size` and `color`. A plain component carries no direction, so
 * `arrow-forward` is registered as `{ component, mirrorInRtl: true }` to keep flipping in
 * right-to-left text (design spec §4.2). `logo` isn't in `@kvirn-ui/icons`: an app adds it with
 * its own entry.
 */
export function LibraryIcons() {
  const icons = defineIcons({
    close: LucideClose,
    delete: TrashIcon,
    warning: PhosphorWarning,
    'arrow-forward': { component: ArrowRight, mirrorInRtl: true },
    logo: MunicipalityMark,
  })
  return (
    <KvirnProvider icons={icons}>
      <Icon name="close" size="24" variant="primary" />
      <Icon name="delete" size="24" variant="primary" />
      <Icon name="warning" size="24" variant="primary" />
      <Icon name="arrow-forward" size="24" variant="primary" />
      <Icon name="logo" size="24" label="Exempelby municipality" />
      <Button>
        Continue
        <Icon name="arrow-forward" />
      </Button>
    </KvirnProvider>
  )
}

/**
 * What a registry can say and what an instance can override. An entry `{ component,
 * mirrorInRtl }` sets the direction per name (here `false` turns the library arrow's flip off),
 * and `mirrorInRtl` on an Icon wins over the entry. `iconDefaults.size` sizes every Icon below,
 * and a nested provider adds icons and replaces fields, over its parent's.
 */
export function RegistryEntries() {
  const icons = defineIcons({
    search: Search,
    'arrow-forward': { component: ArrowRight, mirrorInRtl: false },
  })
  const nestedIcons = defineIcons({ delete: Trash2 })
  return (
    <KvirnProvider icons={icons} iconDefaults={{ size: '24' }}>
      <Icon name="arrow-forward" />
      <Icon name="arrow-forward" mirrorInRtl />
      <Icon name="search" />
      <Icon name="search" size="16" />
      <KvirnProvider icons={nestedIcons}>
        <Icon name="delete" />
        <Icon name="search" />
      </KvirnProvider>
    </KvirnProvider>
  )
}

/**
 * Without the theme: sizes and colours are attributes, so they work. The story renders this in a
 * shadow root, where `theme.css` doesn't reach, like a page that doesn't load the theme.
 */
export function UnstyledIcons() {
  return (
    <>
      <p>
        <Icon name="check" size="16" />
        <Icon name="check" size="20" />
        <Icon name="check" size="24" />
      </p>
      <p>
        <Icon name="arrow-forward" size="24" />
      </p>
      <p>
        <Button aria-label="Close">
          <Icon name="close" />
        </Button>
      </p>
    </>
  )
}

/** No registration: pass the drawing from `@kvirn-ui/icons` as `icon`. */
export function IconFromDrawing() {
  return <Icon icon={search} />
}

/** `size` is the pixel size as a string. */
export function SizeScaleIcons() {
  return (
    <>
      <Icon name="info" size="12" />
      <Icon name="info" size="14" />
      <Icon name="info" size="16" />
      <Icon name="info" size="20" />
      <Icon name="info" size="24" />
      <Icon name="info" size="28" />
      <Icon name="info" size="32" />
      <Icon name="info" size="40" />
      <Icon name="info" size="48" />
      <Icon name="info" size="56" />
      <Icon name="info" size="64" />
      <Icon name="info" size="80" />
      <Icon name="info" size="96" />
    </>
  )
}

/** Inherited colour, then each `variant`. */
export function ColorVariants() {
  return (
    <>
      <Icon name="info" size="24" />
      <Icon name="info" size="24" variant="muted" />
      <Icon name="info" size="24" variant="danger" />
      <Icon name="info" size="24" variant="success" />
      <Icon name="info" size="24" variant="warning" />
      <Icon name="info" size="24" variant="primary" />
    </>
  )
}

/** Decorative next to text that says the same, and an image with a `label`. */
export function DecorativeAndMeaningfulIcons() {
  return (
    <>
      <p>
        <Icon name="calendar" /> Your next collection is on{' '}
        <time dateTime="2026-10-14">14 October 2026</time>.
      </p>
      <p>
        <Icon as={MunicipalityMark} size="48" label="Exempelby municipality" />
      </p>
    </>
  )
}

/** A name that isn't registered: an empty, decorative `<svg>` at the right size. */
export function UnknownNameIcon() {
  return (
    <p>
      Save <Icon name="delte" size="24" />
    </p>
  )
}

/** Icons in text, in a Button and in a Link. */
export function IconsInTextButtonAndLink() {
  return (
    <>
      <p>
        <Icon name="warning" /> Warning <Icon name="warning" variant="danger" /> Warning
      </p>
      <Button>
        <Icon name="add" />
        Add another child
        <Icon name="add" variant="danger" />
      </Button>
      <Link.Root href="#guide">
        <Icon name="external" /> Read the guide <Icon name="external" variant="danger" />
      </Link.Root>
    </>
  )
}

/** Your own SVG: `children` with a `viewBox`, and `as` with a component. */
export function OwnSvgIcons() {
  return (
    <>
      <Icon viewBox="0 0 24 24" size="24">
        <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" strokeWidth={1.5} />
      </Icon>
      <Icon as={MunicipalityMark} size="24" label="Exempelby municipality" />
      <Icon as={SquareMark} size="24" />
    </>
  )
}

/** An icon in running text, and in a link that opens a new tab: the icon after the notice. */
export function IconsInRunningText() {
  return (
    <>
      <p>
        <Icon name="calendar" size="16" /> Your next collection is on{' '}
        <time dateTime="2026-10-14">14 October 2026</time>.
      </p>
      <p>
        <Link.Root href="https://www.digg.se/" target="_blank">
          Read the guide <Link.NewTabNotice /> <Icon name="external" size="16" />
        </Link.Root>
      </p>
    </>
  )
}
