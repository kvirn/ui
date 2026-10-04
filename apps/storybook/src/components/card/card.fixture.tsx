import type { ReactNode } from 'react'
import { Button, Card, Link } from '@kvirn-ui/react'

// Story and e2e fixture: the design spec's examples B–D (docs/design/card.md §4, §5). Example A,
// the sidebar text block, is a Section now: see ../section/section.fixture.tsx. sv, en, nb and
// nn are written. The fi strings are the designer's drafts, for length checks only. se: English,
// marked lang="en" (3.1.2). Dates and times are values, formatted with Intl.

export type CardFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'se' | 'en'

interface NewsItemText {
  title: string
  excerpt: string
}

interface CardTexts {
  waste: {
    heading: string
    next: (date: ReactNode) => ReactNode
    plan: string
    orderExtra: string
    pause: string
  }
  news: {
    heading: string
    recycling: NewsItemText
    snow: NewsItemText
    grants: NewsItemText
    published: (date: ReactNode) => ReactNode
  }
  case: {
    heading: (caseNumber: ReactNode) => ReactNode
    status: string
    latestHeading: string
    latestText: (date: ReactNode) => ReactNode
  }
}

const en: CardTexts = {
  waste: {
    heading: 'Waste collection at Storgatan 12',
    next: (date) => <>Your next collection is on {date}.</>,
    plan: 'Food waste and residual waste are collected every other week.',
    orderExtra: 'Order an extra collection',
    pause: 'Pause collection',
  },
  news: {
    heading: 'News',
    recycling: {
      title: 'New opening hours at the recycling centre',
      excerpt: 'From 1 November the recycling centre is open until 19:00 on weekdays.',
    },
    snow: {
      title: 'Winter road maintenance: how we clear snow',
      excerpt: 'We clear main roads and bus routes first, then residential streets.',
    },
    grants: {
      title: 'Apply for association grants by 1 December',
      excerpt: 'Sports and culture associations can apply for grants for next year.',
    },
    published: (date) => <>Published {date}</>,
  },
  case: {
    heading: (caseNumber) => <>Case {caseNumber}</>,
    status: 'Housing adaptation grant. Waiting for a decision.',
    latestHeading: 'Latest event',
    latestText: (date) => <>The occupational therapist’s certificate arrived on {date}.</>,
  },
}

const sv: CardTexts = {
  waste: {
    heading: 'Sophämtning vid Storgatan 12',
    next: (date) => <>Nästa tömning är {date}.</>,
    plan: 'Matavfall och restavfall töms varannan vecka.',
    orderExtra: 'Beställ extra tömning',
    pause: 'Pausa hämtningen',
  },
  news: {
    heading: 'Nyheter',
    recycling: {
      title: 'Nya öppettider på återvinningscentralen',
      excerpt: 'Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar.',
    },
    snow: {
      title: 'Vinterväghållning: så plogar vi',
      excerpt: 'Vi plogar huvudgator och busslinjer först, sedan bostadsgator.',
    },
    grants: {
      title: 'Ansök om föreningsbidrag senast 1 december',
      excerpt: 'Idrotts- och kulturföreningar kan söka bidrag för nästa år.',
    },
    published: (date) => <>Publicerad {date}</>,
  },
  case: {
    heading: (caseNumber) => <>Ärende {caseNumber}</>,
    status: 'Bostadsanpassningsbidrag. Väntar på beslut.',
    latestHeading: 'Senaste händelse',
    latestText: (date) => <>Arbetsterapeutens intyg kom in {date}.</>,
  },
}

/** Designer drafts (docs/design/card.md §4), for length checks. */
const fi: CardTexts = {
  waste: {
    heading: 'Jäteastioiden tyhjennys osoitteessa Storgatan 12',
    next: (date) => <>Seuraava tyhjennys on {date}.</>,
    plan: 'Biojäte ja sekajäte tyhjennetään joka toinen viikko.',
    orderExtra: 'Tilaa ylimääräinen tyhjennys',
    pause: 'Keskeytä jäteastioiden tyhjennykset',
  },
  news: {
    heading: 'Ajankohtaista',
    recycling: {
      title: 'Kierrätyskeskuksen uudet aukioloajat',
      excerpt: 'Kierrätyskeskus on 1. marraskuuta alkaen auki arkisin kello 19:ään.',
    },
    snow: {
      title: 'Talvikunnossapito: näin aurausjärjestys toimii',
      excerpt: 'Auraamme ensin pääkadut ja bussireitit, sen jälkeen asuinkadut.',
    },
    grants: {
      title: 'Hae yhdistysavustusta viimeistään 1. joulukuuta',
      excerpt: 'Urheilu- ja kulttuuriyhdistykset voivat hakea avustusta ensi vuodelle.',
    },
    published: (date) => <>Julkaistu {date}</>,
  },
  case: {
    heading: (caseNumber) => <>Asia {caseNumber}</>,
    status: 'Asunnonmuutostyöavustus. Odottaa päätöstä.',
    latestHeading: 'Viimeisin tapahtuma',
    latestText: (date) => <>Toimintaterapeutin lausunto saapui {date}.</>,
  },
}

const nb: CardTexts = {
  waste: {
    heading: 'Renovasjon på Storgata 12',
    next: (date) => <>Neste tømming er {date}.</>,
    plan: 'Matavfall og restavfall tømmes annenhver uke.',
    orderExtra: 'Bestill ekstra tømming',
    pause: 'Sett tømmingen på pause',
  },
  news: {
    heading: 'Nyheter',
    recycling: {
      title: 'Nye åpningstider på gjenvinningsstasjonen',
      excerpt: 'Fra 1. november er gjenvinningsstasjonen åpen til kl. 19 på hverdager.',
    },
    snow: {
      title: 'Vintervedlikehold: slik brøyter vi',
      excerpt: 'Vi brøyter hovedveier og bussruter først, deretter boliggater.',
    },
    grants: {
      title: 'Søk om foreningstilskudd innen 1. desember',
      excerpt: 'Idretts- og kulturforeninger kan søke om tilskudd for neste år.',
    },
    published: (date) => <>Publisert {date}</>,
  },
  case: {
    heading: (caseNumber) => <>Sak {caseNumber}</>,
    status: 'Tilskudd til tilpasning av bolig. Venter på vedtak.',
    latestHeading: 'Siste hendelse',
    latestText: (date) => <>Erklæringen fra ergoterapeuten kom inn {date}.</>,
  },
}

const nn: CardTexts = {
  waste: {
    heading: 'Renovasjon på Storgata 12',
    next: (date) => <>Neste tømming er {date}.</>,
    plan: 'Matavfall og restavfall blir tømt annakvar veke.',
    orderExtra: 'Bestill ekstra tømming',
    pause: 'Set tømminga på pause',
  },
  news: {
    heading: 'Nyheiter',
    recycling: {
      title: 'Nye opningstider på gjenvinningsstasjonen',
      excerpt: 'Frå 1. november er gjenvinningsstasjonen open til kl. 19 på kvardagar.',
    },
    snow: {
      title: 'Vintervedlikehald: slik brøytar vi',
      excerpt: 'Vi brøytar hovudvegar og bussrutar først, deretter bustadgater.',
    },
    grants: {
      title: 'Søk om foreiningstilskot innan 1. desember',
      excerpt: 'Idretts- og kulturforeiningar kan søkje om tilskot for neste år.',
    },
    published: (date) => <>Publisert {date}</>,
  },
  case: {
    heading: (caseNumber) => <>Sak {caseNumber}</>,
    status: 'Tilskot til tilpassing av bustad. Ventar på vedtak.',
    latestHeading: 'Siste hending',
    latestText: (date) => <>Erklæringa frå ergoterapeuten kom inn {date}.</>,
  },
}

/** se has no texts: it shows the English ones, marked lang="en". */
const cardTexts: Record<CardFixtureLocale, CardTexts | undefined> = {
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

export const isCardFixtureLocale = (value: unknown): value is CardFixtureLocale =>
  typeof value === 'string' && value in cardTexts

interface ResolvedTexts {
  text: CardTexts
  /** `'en'` when the locale has no texts (se): put it on the element (3.1.2). */
  lang: 'en' | undefined
  formatLocale: string
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function textsFor(locale: CardFixtureLocale): ResolvedTexts {
  const text = cardTexts[locale]
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
const certificateArrived = new Date(Date.UTC(2026, 8, 30))
const publishedDates = {
  recycling: new Date(Date.UTC(2026, 8, 28)),
  snow: new Date(Date.UTC(2026, 8, 21)),
  grants: new Date(Date.UTC(2026, 8, 14)),
}

const longDate = (date: Date, formatLocale: string): string =>
  new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long', timeZone: 'UTC' }).format(date)

/** A local file, never a network request (hard rule 7): an SVG as a data URI. */
const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`

/** Decorative: two waste bins, a green lid and a grey lid. */
export const binsImage = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240">
    <rect width="640" height="240" fill="#e9f6ef"/>
    <rect y="196" width="640" height="44" fill="#c8ecd8"/>
    <rect x="212" y="78" width="96" height="128" rx="6" fill="#1f8052"/>
    <rect x="204" y="64" width="112" height="18" rx="4" fill="#0f5132"/>
    <rect x="332" y="78" width="96" height="128" rx="6" fill="#5d6169"/>
    <rect x="324" y="64" width="112" height="18" rx="4" fill="#3a3d45"/>
  </svg>`,
)

/** Decorative: the recycling centre, a hall and three containers. */
export const recyclingImage = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240">
    <rect width="640" height="240" fill="#eff0fb"/>
    <rect y="200" width="640" height="40" fill="#d0d6e0"/>
    <path d="M80 200V110l120-50 120 50v90z" fill="#5e6ad2"/>
    <rect x="170" y="140" width="60" height="60" fill="#1e2140"/>
    <rect x="360" y="150" width="70" height="50" rx="4" fill="#00707a"/>
    <rect x="440" y="150" width="70" height="50" rx="4" fill="#a36500"/>
    <rect x="520" y="150" width="70" height="50" rx="4" fill="#1f8052"/>
  </svg>`,
)

export interface CardFixtureProps {
  locale: CardFixtureLocale
}

const caseNumber = 'BAB-2026-004512'

/** Example B: a service card on My pages, with a full-bleed image and two actions. */
export function ServiceCard({ locale }: CardFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <Card.Root lang={lang} data-testid="service-card">
      <Card.Header className="kv-card-header--padding-none">
        <img src={binsImage} alt="" width={640} height={240} />
      </Card.Header>
      <Card.Body className="kv-prose">
        <h2>{text.waste.heading}</h2>
        <p>
          {text.waste.next(
            <time dateTime="2026-10-14">{longDate(nextCollection, formatLocale)}</time>,
          )}
        </p>
        <p>{text.waste.plan}</p>
      </Card.Body>
      <Card.Footer className="kv-button-group">
        <Button className="kv-button--primary">{text.waste.orderExtra}</Button>
        <Button>{text.waste.pause}</Button>
      </Card.Footer>
    </Card.Root>
  )
}

/**
 * Example C: a list of news cards, each card a list item with one link, in its heading. The
 * grid is story CSS: the theme has no card-list attribute yet (Plan 0007, decision 3).
 */
export function NewsList({ locale }: CardFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  const items = [
    ['atervinning', text.news.recycling, publishedDates.recycling],
    ['vintervaghallning', text.news.snow, publishedDates.snow],
    ['foreningsbidrag', text.news.grants, publishedDates.grants],
  ] as const
  return (
    <div lang={lang}>
      <h2>{text.news.heading}</h2>
      <ul className="kv-story-card-list">
        {items.map(([id, item, published], index) => (
          <Card.Root key={id} render={<li />}>
            {index === 0 ? (
              <Card.Header className="kv-card-header--padding-none">
                <img src={recyclingImage} alt="" width={640} height={240} />
              </Card.Header>
            ) : null}
            <Card.Body className="kv-prose">
              <h3>
                <Link.Root href={`#${id}`}>{item.title}</Link.Root>
              </h3>
              <p>{item.excerpt}</p>
              <p>
                <small>
                  {text.news.published(
                    <time dateTime={published.toISOString().slice(0, 10)}>
                      {longDate(published, formatLocale)}
                    </time>,
                  )}
                </small>
              </p>
            </Card.Body>
          </Card.Root>
        ))}
      </ul>
    </div>
  )
}

/** Example D: a staff case card in compact density, with a nested card. */
export function CaseCard({ locale }: CardFixtureProps) {
  const { text, lang, formatLocale } = textsFor(locale)
  return (
    <div className="kv-compact" lang={lang}>
      <Card.Root data-testid="case-card">
        <Card.Body className="kv-prose">
          <h2>{text.case.heading(caseNumber)}</h2>
          <p>{text.case.status}</p>
          <Card.Root className="kv-card--radius-md kv-prose" data-testid="nested-card">
            <h3>{text.case.latestHeading}</h3>
            <p>
              {text.case.latestText(
                <time dateTime="2026-09-30">{longDate(certificateArrived, formatLocale)}</time>,
              )}
            </p>
          </Card.Root>
        </Card.Body>
      </Card.Root>
    </div>
  )
}
