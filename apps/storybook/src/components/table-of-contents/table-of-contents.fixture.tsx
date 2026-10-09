import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en as enMessages } from '@kvirn-ui/i18n/en'
import { fi as fiMessages } from '@kvirn-ui/i18n/fi'
import { nb as nbMessages } from '@kvirn-ui/i18n/nb'
import { nn as nnMessages } from '@kvirn-ui/i18n/nn'
import { se as seMessages } from '@kvirn-ui/i18n/se'
import { sv as svMessages } from '@kvirn-ui/i18n/sv'
import { Heading, KvirnProvider, TableOfContents } from '@kvirn-ui/react'
import type { HeadingTag, TableOfContentsEntry } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

// Story fixtures for Components/TableOfContents (docs/design/table-of-contents.md): the sample
// pages, the decorators that make a page long enough to scroll, and the one example (the function
// child) that a story can't show inline. Texts are real: a resident's guide to a building permit,
// in sv by default, with the strings of the library following the locale toolbar.

const catalogs: Record<string, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  se: seMessages,
  en: enMessages,
}

/**
 * The library's strings (the landmark's name) follow the locale toolbar through a provider, like
 * an app's would. The provider also renders the two live regions.
 */
export const withContentsLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? svMessages}>
      <Story />
    </KvirnProvider>
  )
}

/**
 * The page a contents list belongs to: every section is tall (a story's own CSS), so the page
 * scrolls and the list has something to follow. A decorator, so the code a story shows is the
 * list and the article and nothing around them.
 */
export const withContentsPage: Decorator = (Story) => (
  <div className="kv-story-contents-page">
    <Story />
  </div>
)

/**
 * The layout of the design spec, from 64rem: the contents list in a sticky column at the inline
 * start, the article beside it. Placement and stickiness are the page's, never the component's.
 * Below 64rem the list stays above the article.
 */
export const withContentsColumns: Decorator = (Story) => (
  <div className="kv-story-contents-columns">
    <Story />
  </div>
)

/**
 * A sticky header of 64px, and `scroll-padding-top: 64px` on the page (WCAG technique C43), which
 * is what `offset` must equal: a link lands the heading below the header, and so does focus
 * scrolled into view, and the heading becomes the current one.
 */
function StickyScrollPadding({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    root.style.scrollPaddingTop = '64px'
    return () => {
      root.style.removeProperty('scroll-padding-top')
    }
  }, [])
  return <>{children}</>
}

export const withStickyHeader: Decorator = (Story) => (
  <StickyScrollPadding>
    <div className="kv-story-sticky-header">Kvirnby kommun</div>
    <Story />
  </StickyScrollPadding>
)

/** A narrow column for the wrapping example. */
export const withNarrowColumn: Decorator = (Story) => (
  <div className="kv-story-narrow" data-testid="narrow">
    <Story />
  </div>
)

type Sample = ReadonlyArray<readonly [slug: string, label: string, level: number]>

/** "Bygglov: så går det till". Two levels, as a resident-facing page has. */
export const bygglov: Sample = [
  ['vem-behover-bygglov', 'Vem behöver bygglov?', 2],
  ['sa-ansoker-du', 'Så ansöker du', 2],
  ['ritningar', 'Ritningar', 3],
  ['avgifter', 'Avgifter', 3],
  ['efter-beslutet', 'Efter beslutet', 2],
]

/** Three levels, and a skipped one: "Buller" is an h4 right under an h2. */
export const levels: Sample = [
  ['bygga-och-bo', 'Bygga och bo', 2],
  ['bygglov', 'Bygglov', 3],
  ['ritningar', 'Ritningar', 4],
  ['kontrollplan', 'Kontrollplan', 4],
  ['miljo-och-halsa', 'Miljö och hälsa', 2],
  ['buller', 'Buller', 4],
]

/** Long Finnish compounds, for 320px. */
export const finnish: Sample = [
  ['rakentaminen', 'Rakentaminen ja asuminen', 2],
  ['kasittelyaika', 'Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut', 3],
  ['liitteet', 'Rakennuslupahakemuksen liitteet ja selvitykset', 4],
]

/** The same page in English, for right to left. */
export const permit: Sample = [
  ['who-needs-a-permit', 'Who needs a building permit?', 2],
  ['how-to-apply', 'How to apply', 2],
  ['drawings', 'Drawings', 3],
  ['fees', 'Fees', 3],
  ['after-the-decision', 'After the decision', 2],
]

/**
 * The entries of a sample page. The ids start with the story's own `prefix`, because a Docs page
 * shows every story in one document, and an id must be unique on the page.
 */
export function sampleItems(prefix: string, sample: Sample = bygglov): TableOfContentsEntry[] {
  return sample.map(([slug, label, level]) => ({ id: `${prefix}-${slug}`, label, level }))
}

const paragraphs: Record<string, string> = {
  'Vem behöver bygglov?':
    'Du behöver bygglov för att bygga nytt, bygga till eller ändra hur en byggnad används. Mindre komplementbyggnader kan vara undantagna.',
  'Så ansöker du':
    'Ansökan görs digitalt eller på blankett. Du behöver en situationsplan, ritningar och en kontrollplan.',
  Ritningar: 'Ritningarna ska visa fasader, planer och sektioner i skala 1:100.',
  Avgifter:
    'Avgiften beror på byggnadens area och på hur omfattande ärendet är. Fakturan kommer efter beslutet.',
  'Efter beslutet':
    'När du har fått bygglov behöver du ett startbesked innan du börjar bygga. Det får du av byggnadsnämnden.',
  'Bygga och bo': 'Här samlar vi det du behöver veta när du bygger, bygger om eller flyttar.',
  Bygglov: 'Bygglov söker du hos byggnadsnämnden, innan du börjar bygga.',
  Kontrollplan: 'Kontrollplanen säger hur du visar att bygget följer reglerna.',
  'Miljö och hälsa': 'Byggen kan påverka grannar och miljön runt omkring.',
  Buller: 'Bullret från ett bygge har tidsgränser, och i vissa områden gäller skärpta regler.',
  'Rakentaminen ja asuminen': 'Tässä kerromme, mitä rakentajan ja asukkaan on hyvä tietää.',
  'Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut':
    'Käsittelyaika riippuu hakemuksen laajuudesta, ja maksu määräytyy rakennuksen koon mukaan.',
  'Rakennuslupahakemuksen liitteet ja selvitykset':
    'Hakemukseen liitetään asemapiirros, pohjapiirrokset ja julkisivut.',
  'Who needs a building permit?':
    'You need a building permit to build something new, extend a building or change how it is used. Small outbuildings may be exempt.',
  'How to apply':
    'You apply online or on a form. You need a site plan, drawings and a control plan.',
  Drawings: 'The drawings must show elevations, plans and sections at a scale of 1:100.',
  Fees: 'The fee depends on the floor area and on how complicated the case is. The invoice comes after the decision.',
  'After the decision':
    'Once you have the permit, you need a start notice before you begin building.',
}

/** The text of a section, found by its heading's text. */
export function paragraphOf(label: string): string {
  return paragraphs[label] ?? 'Här beskrivs avsnittet.'
}

const headingTags: readonly HeadingTag[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/** The `Heading` element of an entry: its own level, or `h2` when it isn't a level a heading can have. */
export function headingTagOf(level: number): HeadingTag {
  return headingTags.find((candidate) => candidate === `h${level}`) ?? 'h2'
}

/**
 * Your own list, drawn from the tree the function child gets: here only the top level, with the
 * number of sub-sections after each link. The Root draws nothing when `items` is empty, so a title
 * drawn in this function would go with the list.
 */
export function ContentsWithOwnList() {
  return (
    <>
      <TableOfContents.Root
        items={[
          { id: 'own-list-vem-behover-bygglov', label: 'Vem behöver bygglov?', level: 2 },
          { id: 'own-list-sa-ansoker-du', label: 'Så ansöker du', level: 2 },
          { id: 'own-list-ritningar', label: 'Ritningar', level: 3 },
          { id: 'own-list-avgifter', label: 'Avgifter', level: 3 },
          { id: 'own-list-efter-beslutet', label: 'Efter beslutet', level: 2 },
        ]}
      >
        {({ tree }) => (
          <TableOfContents.List>
            {tree.map((node) => (
              <TableOfContents.Item key={node.item.id}>
                <TableOfContents.Link item={node.item} />
                {node.children.length > 0 && <small>{node.children.length} underavsnitt</small>}
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        )}
      </TableOfContents.Root>
      <div>
        <section>
          <Heading as="h2" id="own-list-vem-behover-bygglov">
            Vem behöver bygglov?
          </Heading>
          <p>
            Du behöver bygglov för att bygga nytt, bygga till eller ändra hur en byggnad används.
          </p>
        </section>
        <section>
          <Heading as="h2" id="own-list-sa-ansoker-du">
            Så ansöker du
          </Heading>
          <p>Ansökan görs digitalt eller på blankett.</p>
          <Heading as="h3" id="own-list-ritningar">
            Ritningar
          </Heading>
          <p>Ritningarna ska visa fasader, planer och sektioner.</p>
          <Heading as="h3" id="own-list-avgifter">
            Avgifter
          </Heading>
          <p>Avgiften beror på byggnadens area.</p>
        </section>
        <section>
          <Heading as="h2" id="own-list-efter-beslutet">
            Efter beslutet
          </Heading>
          <p>När du har fått bygglov behöver du ett startbesked innan du börjar bygga.</p>
        </section>
      </div>
    </>
  )
}
