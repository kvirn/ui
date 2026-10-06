import { useId } from 'react'
import type { ReactNode } from 'react'
import { Button, Card, Field, Fieldset, Link, Section, TextInput, useFormat } from '@kvirn-ui/react'
import type { UseFormatResult } from '@kvirn-ui/react'
import { NewsList, textsFor, withCardLocale } from '../card/card.fixture.tsx'
import type { CardFixtureLocale } from '../card/card.fixture.tsx'

// Story fixture: the design spec's examples A and B (docs/design/section.md §4, §5) and the
// Section-or-Card example (§6.9). The `contact.*` strings moved here from the Card fixture: the
// sidebar text block is a Section now. Example B reuses the Card fixture's NewsList.
// sv, en, nb and nn are written. The fi strings are the designer's drafts, for length checks only.
// se: English, marked lang="en" (3.1.2). Times are values, formatted with `useFormat()`.

/** The same provider as the Card stories: Section reuses the Card fixture's texts and NewsList. */
export const withSectionLocale = withCardLocale

export type SectionFixtureLocale = CardFixtureLocale

interface SectionTexts {
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

const en: SectionTexts = {
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

const sv: SectionTexts = {
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

/** Designer drafts (docs/design/section.md §4), for length checks. */
const fi: SectionTexts = {
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

const nb: SectionTexts = {
  contact: {
    heading: 'Kontakt oss',
    phone: (phone) => <>Ring kundesenteret på {phone}.</>,
    hours: (open, close) => (
      <>
        Vi svarer mandag–fredag kl. {open}–{close}.
      </>
    ),
    email: 'Send e-post til kundesenteret',
  },
  users: { heading: 'Anna Lindqvist', edit: 'Rediger', delete: 'Slett' },
  details: { legend: 'Kontaktopplysninger', email: 'E-postadresse' },
}

const nn: SectionTexts = {
  contact: {
    heading: 'Kontakt oss',
    phone: (phone) => <>Ring kundesenteret på {phone}.</>,
    hours: (open, close) => (
      <>
        Vi svarer måndag–fredag kl. {open}–{close}.
      </>
    ),
    email: 'Send e-post til kundesenteret',
  },
  users: { heading: 'Anna Lindqvist', edit: 'Rediger', delete: 'Slett' },
  details: { legend: 'Kontaktopplysingar', email: 'E-postadresse' },
}

/** se has no texts: it shows the English ones, marked lang="en". */
const sectionTexts: Record<SectionFixtureLocale, SectionTexts | undefined> = {
  sv,
  fi,
  nb,
  nn,
  se: undefined,
  en,
}

interface ResolvedSectionTexts {
  text: SectionTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
function sectionTextsFor(locale: SectionFixtureLocale): ResolvedSectionTexts {
  const text = sectionTexts[locale]
  if (text === undefined) {
    return { text: en, lang: 'en' }
  }
  return {
    text,
    lang: undefined,
  }
}

// Fixed instants, so stories and tests are deterministic. Formatted in UTC.
const opens = new Date(Date.UTC(2026, 9, 1, 8, 0))
const closes = new Date(Date.UTC(2026, 9, 1, 16, 0))

const shortTime = (date: Date, format: UseFormatResult): string =>
  format.date(date, { timeStyle: 'short', timeZone: 'UTC' })

export interface SectionFixtureProps {
  locale: SectionFixtureLocale
}

/** Example A: a text block in a sidebar, a Section rendered as a named `aside`, with prose. */
export function ContactSection({ locale }: SectionFixtureProps) {
  const { text, lang } = sectionTextsFor(locale)
  const format = useFormat()
  const headingId = useId()
  return (
    <Section render={<aside aria-labelledby={headingId} />} className="kv-prose" lang={lang}>
      <h2 id={headingId}>{text.contact.heading}</h2>
      <p>
        {text.contact.phone(locale === 'nb' || locale === 'nn' ? '800 12 345' : '0123-45 67 89')}
      </p>
      <p>
        {text.contact.hours(
          <time dateTime="08:00">{shortTime(opens, format)}</time>,
          <time dateTime="16:00">{shortTime(closes, format)}</time>,
        )}
      </p>
      <p>
        <Link.Root href="mailto:kundcenter@kvirnby.example">{text.contact.email}</Link.Root>
      </p>
    </Section>
  )
}

/**
 * The documented recipe for the one edge that meets the content: the 1px border is already
 * there and transparent, so colouring one side moves nothing. It follows `dir`, and every theme.
 */
export function ContactSectionWithEdge({ locale }: SectionFixtureProps) {
  const { text, lang } = sectionTextsFor(locale)
  const format = useFormat()
  const headingId = useId()
  return (
    <Section
      render={<aside aria-labelledby={headingId} />}
      className="kv-prose"
      style={{ borderInlineEndColor: 'var(--kv-color-border-subtle)' }}
      lang={lang}
    >
      <h2 id={headingId}>{text.contact.heading}</h2>
      <p>
        {text.contact.phone(locale === 'nb' || locale === 'nn' ? '800 12 345' : '0123-45 67 89')}
      </p>
      <p>
        {text.contact.hours(
          <time dateTime="08:00">{shortTime(opens, format)}</time>,
          <time dateTime="16:00">{shortTime(closes, format)}</time>,
        )}
      </p>
      <p>
        <Link.Root href="mailto:kundcenter@kvirnby.example">{text.contact.email}</Link.Root>
      </p>
    </Section>
  )
}

/**
 * One thing with several independent actions: a Section, not a Card (design spec §6.9). The
 * controls are the reason the container exists, and there is no one destination.
 */
export function UserSection({ locale }: SectionFixtureProps) {
  const { text, lang } = sectionTextsFor(locale)
  return (
    <Section lang={lang} data-testid="section-with-actions">
      <h2>{text.users.heading}</h2>
      <div className="kv-button-group">
        <Button>{text.users.edit}</Button>
        <Button>{text.users.delete}</Button>
      </div>
    </Section>
  )
}

/**
 * Example B: a band of cards. A Card on a Section keeps its default look, and the band is a
 * visual region only: a `<div>`, no landmark.
 */
export function NewsBand({ locale }: SectionFixtureProps) {
  return (
    <Section data-testid="band">
      <NewsList locale={locale} />
    </Section>
  )
}

/** One thing with one destination: a Card. The link is in the heading. */
export function NewsCard({ locale }: SectionFixtureProps) {
  const { text, lang } = textsFor(locale)
  return (
    <Card.Root render={<article />} lang={lang} data-testid="news-card">
      <Card.Body className="kv-prose">
        <h2>
          <Link.Root href="#vintervaghallning">{text.news.snow.title}</Link.Root>
        </h2>
        <p>{text.news.snow.excerpt}</p>
      </Card.Body>
    </Card.Root>
  )
}

/** A form section is neither: a `<fieldset>` with a legend, on the page. */
export function ContactDetailsFieldset({ locale }: SectionFixtureProps) {
  const { text, lang } = sectionTextsFor(locale)
  return (
    <Fieldset.Root lang={lang} data-testid="form-section">
      <Fieldset.Legend>{text.details.legend}</Fieldset.Legend>
      <Field.Root>
        <Field.Label>{text.details.email}</Field.Label>
        <TextInput name="email" autoComplete="email" />
      </Field.Root>
    </Fieldset.Root>
  )
}

/**
 * `render` gives a Section the element its role needs: a `<section>` and a `<nav>`, each named by
 * its heading (`aria-labelledby`), and an `<li>` in a list. The function form spreads the
 * props, so `kv-section` stays. A `<div>` is not a landmark, so keep these few.
 */
export function RenderedSections({ locale }: SectionFixtureProps) {
  const { text, lang } = textsFor(locale)
  const statusId = useId()
  const navigationId = useId()
  return (
    <div lang={lang}>
      <Section render={<section aria-labelledby={statusId} />} data-testid="status-section">
        <h2 id={statusId}>{text.waste.heading}</h2>
        <p>{text.waste.plan}</p>
      </Section>
      <Section
        render={(sectionProps) => <nav {...sectionProps} aria-labelledby={navigationId} />}
        data-testid="news-navigation"
      >
        <h2 id={navigationId}>{text.news.heading}</h2>
        <ul>
          <li>
            <Link.Root href="#atervinning">{text.news.recycling.title}</Link.Root>
          </li>
          <li>
            <Link.Root href="#vintervaghallning">{text.news.snow.title}</Link.Root>
          </li>
        </ul>
      </Section>
      <ul>
        <Section render={<li />}>
          <p>{text.news.grants.title}</p>
        </Section>
        <Section render={<li />}>
          <p>{text.news.snow.title}</p>
        </Section>
      </ul>
    </div>
  )
}
