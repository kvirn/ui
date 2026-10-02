import { useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Button, Card, Field, Fieldset, Input, Link, Panel } from '@kvirn-ui/react'
import { textsFor } from '../card/card.fixture.tsx'
import type { CardFixtureLocale } from '../card/card.fixture.tsx'

// Story and e2e fixture: the design spec's examples A and B (docs/design/panel.md §4, §5) and the
// Panel-or-Card example (§6.9). The `contact.*` strings moved here from the Card fixture: the
// sidebar text block is a Panel now (ADR-0044). Example B reuses the Card fixture's NewsList.
// sv and en are written. The fi strings are the designer's drafts, for length checks only. nb,
// nn and se come from a translator, not an agent: until then those locales show the English
// text, marked lang="en" (3.1.2). Times are values, formatted with Intl.

export type PanelFixtureLocale = CardFixtureLocale

interface PanelTexts {
  contact: {
    heading: string
    phone: (phone: ReactNode) => ReactNode
    hours: (open: ReactNode, close: ReactNode) => ReactNode
    email: string
  }
  users: {
    heading: string
    edit: string
    delete: string
  }
  details: {
    legend: string
    email: string
  }
}

const en: PanelTexts = {
  contact: {
    heading: 'Contact us',
    phone: (phone) => <>Call the customer centre on {phone}.</>,
    hours: (open, close) => (
      <>
        We answer Monday to Friday, {open}–{close}.
      </>
    ),
    email: 'Email the customer centre',
  },
  users: { heading: 'Anna Lindqvist', edit: 'Edit', delete: 'Delete' },
  details: { legend: 'Contact details', email: 'Email address' },
}

const sv: PanelTexts = {
  contact: {
    heading: 'Kontakta oss',
    phone: (phone) => <>Ring kundcenter på {phone}.</>,
    hours: (open, close) => (
      <>
        Vi svarar måndag–fredag kl. {open}–{close}.
      </>
    ),
    email: 'Mejla kundcenter',
  },
  users: { heading: 'Anna Lindqvist', edit: 'Redigera', delete: 'Ta bort' },
  details: { legend: 'Kontaktuppgifter', email: 'E-postadress' },
}

/** Designer drafts (docs/design/panel.md §4), for length checks. Not reviewed by a translator. */
const fi: PanelTexts = {
  contact: {
    heading: 'Ota yhteyttä',
    phone: (phone) => <>Soita asiakaspalvelukeskukseen numeroon {phone}.</>,
    hours: (open, close) => (
      <>
        Vastaamme maanantaista perjantaihin klo {open}–{close}.
      </>
    ),
    email: 'Lähetä sähköpostia asiakaspalvelukeskukseen',
  },
  users: { heading: 'Anna Lindqvist', edit: 'Muokkaa', delete: 'Poista' },
  details: { legend: 'Yhteystiedot', email: 'Sähköpostiosoite' },
}

/** nb, nn and se: `undefined` until a translator delivers them. */
const panelTexts: Record<PanelFixtureLocale, PanelTexts | undefined> = {
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

interface ResolvedPanelTexts {
  text: PanelTexts
  /** `'en'` when the locale isn't translated yet: put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` until it's translated. */
function panelTextsFor(locale: PanelFixtureLocale): ResolvedPanelTexts {
  const text = panelTexts[locale]
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
const opens = new Date(Date.UTC(2026, 9, 1, 8, 0))
const closes = new Date(Date.UTC(2026, 9, 1, 16, 0))

function TimeValue({ date, formatLocale }: { date: Date; formatLocale: string }) {
  const text = new Intl.DateTimeFormat(formatLocale, {
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
  return <time dateTime={date.toISOString().slice(11, 16)}>{text}</time>
}

export interface PanelFixtureProps {
  locale: PanelFixtureLocale
}

export interface ContactPanelProps extends PanelFixtureProps {
  /**
   * The documented recipe for the one edge that meets the content: the transparent border is
   * already there, so colouring one side moves nothing.
   */
  hasEdge?: boolean
}

const oneEdge: CSSProperties = { borderInlineEndColor: 'var(--kv-color-border-subtle)' }

/** Example A: a text block in a sidebar, a Panel rendered as a named `aside`, with prose. */
export function ContactPanel({ locale, hasEdge = false }: ContactPanelProps) {
  const { text, lang, formatLocale } = panelTextsFor(locale)
  const headingId = useId()
  return (
    <Panel
      render={<aside aria-labelledby={headingId} />}
      className="kv-prose"
      style={hasEdge ? oneEdge : undefined}
      lang={lang}
    >
      <h2 id={headingId}>{text.contact.heading}</h2>
      <p>{text.contact.phone('0123-45 67 89')}</p>
      <p>
        {text.contact.hours(
          <TimeValue date={opens} formatLocale={formatLocale} />,
          <TimeValue date={closes} formatLocale={formatLocale} />,
        )}
      </p>
      <p>
        <Link href="mailto:kundcenter@kvirnby.example">{text.contact.email}</Link>
      </p>
    </Panel>
  )
}

/**
 * One thing with several independent actions: a Panel, not a Card (design spec §6.9). The
 * controls are the reason the container exists, and there is no one destination.
 */
export function UserPanel({ locale }: PanelFixtureProps) {
  const { text, lang } = panelTextsFor(locale)
  return (
    <Panel lang={lang} data-testid="panel-with-actions">
      <h2>{text.users.heading}</h2>
      <div className="kv-button-group">
        <Button>{text.users.edit}</Button>
        <Button>{text.users.delete}</Button>
      </div>
    </Panel>
  )
}

/** One thing with one destination: a Card. The link is in the heading. */
export function NewsCard({ locale }: PanelFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Card.Root render={<article />} lang={lang} data-testid="news-card">
      <Card.Body className="kv-prose">
        <h2>
          <Link href="#vintervaghallning">{text.news.snow.title}</Link>
        </h2>
        <p>{text.news.snow.excerpt}</p>
      </Card.Body>
    </Card.Root>
  )
}

/** A form section is neither: a `<fieldset>` with a legend, on the page. */
export function ContactDetailsFieldset({ locale }: PanelFixtureProps) {
  const { text, lang } = panelTextsFor(locale)
  return (
    <Fieldset.Root lang={lang} data-testid="form-section">
      <Fieldset.Legend>{text.details.legend}</Fieldset.Legend>
      <Field.Root>
        <Field.Label>{text.details.email}</Field.Label>
        <Input name="email" autoComplete="email" />
      </Field.Root>
    </Fieldset.Root>
  )
}
