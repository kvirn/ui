// kv-lang-ok-file: the Finnish sample is a long-word hard case for wrapping (320px)
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en as enMessages } from '@kvirn-ui/i18n/en'
import { fi as fiMessages } from '@kvirn-ui/i18n/fi'
import { nb as nbMessages } from '@kvirn-ui/i18n/nb'
import { nn as nnMessages } from '@kvirn-ui/i18n/nn'
import { sv as svMessages } from '@kvirn-ui/i18n/sv'
import { Heading, KvirnProvider, TableOfContents } from '@kvirn-ui/react'
import type { HeadingTag, TableOfContentsEntry } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

// Story fixtures for Components/TableOfContents (docs/design/table-of-contents.md): the sample
// pages, the decorators that make a page long enough to scroll, and the one example (the function
// child) that a story can't show inline. Texts are real: a resident's guide to a building permit,
// in English by default, with the strings of the library following the locale toolbar.

const catalogs: Record<string, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  en: enMessages,
}

/**
 * The library's strings (the landmark's name) follow the locale toolbar through a provider, like
 * an app's would. The provider also renders the two live regions.
 */
export const withContentsLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'en')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? enMessages}>
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
    <div className="kv-story-sticky-header">Kvirnby municipality</div>
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

/** "Building permits: how it works". Two levels, as a resident-facing page has. */
export const permit: Sample = [
  ['who-needs-a-permit', 'Who needs a building permit?', 2],
  ['how-to-apply', 'How to apply', 2],
  ['drawings', 'Drawings', 3],
  ['fees', 'Fees', 3],
  ['after-the-decision', 'After the decision', 2],
]

/** Three levels, and a skipped one: "Noise" is an h4 right under an h2. */
export const levels: Sample = [
  ['building-and-living', 'Building and living', 2],
  ['building-permits', 'Building permits', 3],
  ['drawings', 'Drawings', 4],
  ['control-plan', 'Control plan', 4],
  ['environment-and-health', 'Environment and health', 2],
  ['noise', 'Noise', 4],
]

/** Long Finnish compounds, for 320px. */
export const finnish: Sample = [
  ['rakentaminen', 'Rakentaminen ja asuminen', 2],
  ['kasittelyaika', 'Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut', 3],
  ['liitteet', 'Rakennuslupahakemuksen liitteet ja selvitykset', 4],
]

/**
 * The entries of a sample page. The ids start with the story's own `prefix`, because a Docs page
 * shows every story in one document, and an id must be unique on the page.
 */
export function sampleItems(prefix: string, sample: Sample = permit): TableOfContentsEntry[] {
  return sample.map(([slug, label, level]) => ({ id: `${prefix}-${slug}`, label, level }))
}

const paragraphs: Record<string, string> = {
  'Building and living': 'Here we collect what you need to know when you build, extend or move.',
  'Building permits':
    'You apply for a building permit from the building board, before you start building.',
  'Control plan': 'The control plan says how you show that the building follows the rules.',
  'Environment and health': 'Building can affect the neighbours and the environment around it.',
  Noise: 'Noise from a building site has time limits, and stricter rules apply in some areas.',
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
  return paragraphs[label] ?? 'This section is described here.'
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
          { id: 'own-list-who-needs-a-permit', label: 'Who needs a building permit?', level: 2 },
          { id: 'own-list-how-to-apply', label: 'How to apply', level: 2 },
          { id: 'own-list-drawings', label: 'Drawings', level: 3 },
          { id: 'own-list-fees', label: 'Fees', level: 3 },
          { id: 'own-list-after-the-decision', label: 'After the decision', level: 2 },
        ]}
      >
        {({ tree }) => (
          <TableOfContents.List>
            {tree.map((node) => (
              <TableOfContents.Item key={node.item.id}>
                <TableOfContents.Link item={node.item} />
                {node.children.length > 0 && <small>{node.children.length} sub-sections</small>}
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        )}
      </TableOfContents.Root>
      <div>
        <section>
          <Heading as="h2" id="own-list-who-needs-a-permit">
            Who needs a building permit?
          </Heading>
          <p>
            You need a building permit to build something new, extend a building or change how it is
            used.
          </p>
        </section>
        <section>
          <Heading as="h2" id="own-list-how-to-apply">
            How to apply
          </Heading>
          <p>You apply online or on a form.</p>
          <Heading as="h3" id="own-list-drawings">
            Drawings
          </Heading>
          <p>The drawings must show elevations, plans and sections.</p>
          <Heading as="h3" id="own-list-fees">
            Fees
          </Heading>
          <p>The fee depends on the floor area.</p>
        </section>
        <section>
          <Heading as="h2" id="own-list-after-the-decision">
            After the decision
          </Heading>
          <p>Once you have the permit, you need a start notice before you begin building.</p>
        </section>
      </div>
    </>
  )
}
