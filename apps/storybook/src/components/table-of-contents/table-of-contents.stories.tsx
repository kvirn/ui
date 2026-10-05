import { Heading, Link, TableOfContents } from '@kvirn-ui/react'
import type { TableOfContentsRootProps } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/table-of-contents/table-of-contents.a11y.md?raw'
import guide from '../../../../../packages/react/src/table-of-contents/table-of-contents.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactElement } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ContentsWithOwnList,
  finnish,
  headingLevelOf,
  levels,
  paragraphOf,
  permit,
  sampleItems,
  withContentsColumns,
  withContentsLocale,
  withContentsPage,
  withNarrowColumn,
  withStickyHeader,
} from './table-of-contents.fixture.tsx'

// Components/TableOfContents: the headless TableOfContents, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/table-of-contents.md). Their play functions only read, or scroll to a
// heading to show the current state. Every story is a page that scrolls (its sections are 70vh, and shorter on a
// Docs page, preview.css). The heading ids start with the story's own name: an id is unique on a
// page, and a Docs page shows every story in one document. The library's own string, the
// landmark's name, follows the locale toolbar.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/TableOfContents',
  component: TableOfContents.Root,
  args: { items: sampleItems('default'), offset: 0 },
  argTypes: {
    items: {
      control: 'object',
      description:
        'The headings of the page, in document order: `{ id, label, level }`. The `id` is the heading’s own, unique on the page, and the link is `#id`. `level` is the heading’s level (`2` for an `h2`): a deeper level nests, a skipped level nests one step. Empty renders nothing, so there is no empty landmark. An id with no heading on the page warns in development.',
    },
    offset: {
      control: 'number',
      description:
        'The line a heading has to reach to become the current one, in px from the top of the viewport. Default `0`. With a sticky header, give its height here and as `scroll-padding-top` on the root (StickyOffset): if they differ, a heading a link scrolls to lands below the line, and the one above it stays current.',
    },
    'aria-labelledby': {
      control: 'text',
      description:
        'The id of a visible heading that names the landmark (LabelledByHeading). Preferred over the message, and it replaces it: the landmark has one name, never both. Without it the landmark is named by `tableOfContents.label` (“På den här sidan”), in the locale of the toolbar.',
    },
    messages: {
      control: 'object',
      description:
        'Per-instance message overrides: `{ label: "Innehåll" }`. An `aria-label` of your own wins over the message.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-compact'],
      description:
        'Your own classes, added to `kv-table-of-contents`. `kv-compact` makes the rows 32px for manuals and staff tools (never under 24px). The theme has no other modifier: the look comes from the parts.',
    },
    children: {
      control: false,
      description:
        'A function, `({ tree, activeId }) => …`, that draws your own list instead of the whole nested list (CustomRender). It is not called when `items` is empty.',
    },
    render: {
      control: false,
      description: 'Another element. Root must stay a `<nav>`, or the landmark is gone.',
    },
    ref: { control: false, description: 'The rendered `<nav>`.' },
  },
  globals: { locale: 'sv' },
  decorators: [withContentsPage, withContentsLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof TableOfContents.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The page the contents list belongs to: one section per entry, so the page has something to
 * scroll and the list something to follow.
 */
function renderPage(args: TableOfContentsRootProps): ReactElement {
  return (
    <>
      <TableOfContents.Root {...args} />
      <div>
        {args.items.map((item) => (
          <section key={item.id}>
            <Heading level={headingLevelOf(item.level)} id={item.id}>
              {item.label}
            </Heading>
            <p>{paragraphOf(item.label)}</p>
          </section>
        ))}
      </div>
    </>
  )
}

/**
 * Scrolls a heading to the top of the page, as a reader scrolling to it would, and waits for its
 * link to become the current one. For the stories that show the current heading and the trail.
 */
async function scrollToHeading(canvasElement: HTMLElement, name: string) {
  const canvas = within(canvasElement)
  canvas.getByRole('heading', { name }).scrollIntoView({ block: 'start' })
  await waitFor(() =>
    expect(canvas.getByRole('link', { name })).toHaveAttribute('aria-current', 'location'),
  )
}

/**
 * The main example: every option is a control below. The landmark is named by the message, in the
 * language of the Locale toolbar. In a side column from 64rem, as here, and above the article below
 * that. Scroll the page: nothing is current until the first heading is passed, then the link of
 * the heading being read is the solid fill, and its parents are the quiet trail.
 */
export const Default: Story = {
  decorators: [withContentsColumns],
  render: renderPage,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'På den här sidan' })
    await expect(within(navigation).getAllByRole('list')).toHaveLength(2)
    await expect(within(navigation).getAllByRole('link')).toHaveLength(5)
    // Nothing is current until the reader has passed the first heading.
    await expect(navigation.querySelector('[aria-current]')).toBeNull()
  },
}

/**
 * The fixture the keyboard tests drive: a link before the contents list, the list with a nested
 * level, a link after it, and a link inside a section. Try the keys in the Keyboard section above:
 * Tab and Shift+Tab move through the links in DOM order, nested ones included. Enter follows the
 * hash, and the next Tab continues after the heading, in the section. The arrow keys, Home and End
 * do nothing: it is a list of links, not a menu.
 */
export const Keyboard: Story = {
  render: () => (
    <>
      <p>
        <Link.Root href="#keyboard-vem-behover-bygglov">Hoppa till första avsnittet</Link.Root>
      </p>
      <TableOfContents.Root items={sampleItems('keyboard')} />
      <p>
        <Link.Root href="#keyboard-kontakt">Kontakta oss</Link.Root>
      </p>
      <section>
        <Heading level={2} id="keyboard-vem-behover-bygglov">
          Vem behöver bygglov?
        </Heading>
        <p>{paragraphOf('Vem behöver bygglov?')}</p>
      </section>
      <section>
        <Heading level={2} id="keyboard-sa-ansoker-du">
          Så ansöker du
        </Heading>
        <p>{paragraphOf('Så ansöker du')}</p>
        <Heading level={3} id="keyboard-ritningar">
          Ritningar
        </Heading>
        <p>{paragraphOf('Ritningar')}</p>
        <Heading level={3} id="keyboard-avgifter">
          Avgifter
        </Heading>
        <p>
          {paragraphOf('Avgifter')}{' '}
          <Link.Root href="#keyboard-vem-behover-bygglov">Läs om vem som behöver bygglov</Link.Root>
          .
        </p>
      </section>
      <section>
        <Heading level={2} id="keyboard-efter-beslutet">
          Efter beslutet
        </Heading>
        <p>{paragraphOf('Efter beslutet')}</p>
      </section>
      <section>
        <Heading level={2} id="keyboard-kontakt">
          Kontakt
        </Heading>
        <p>Frågor om ditt ärende ställer du till byggnadsnämnden.</p>
      </section>
    </>
  ),
}

/**
 * Where there is room for a title, make it a real heading and point `aria-labelledby` at it: the
 * visible name and the accessible name are the same text, and the message is not used. Beside an
 * article it has the `heading-4` look, so it doesn’t compete with the article’s own headings.
 */
export const LabelledByHeading: Story = {
  args: { items: sampleItems('labelled-by-heading') },
  decorators: [withContentsColumns],
  render: (args) => (
    <>
      <div>
        <Heading level={2} size="heading-4" id="labelled-by-heading-title">
          På den här sidan
        </Heading>
        <TableOfContents.Root {...args} aria-labelledby="labelled-by-heading-title" />
      </div>
      <div>
        {args.items.map((item) => (
          <section key={item.id}>
            <Heading level={headingLevelOf(item.level)} id={item.id}>
              {item.label}
            </Heading>
            <p>{paragraphOf(item.label)}</p>
          </section>
        ))}
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'På den här sidan' })
    await expect(navigation).toHaveAttribute('aria-labelledby', 'labelled-by-heading-title')
    await expect(navigation).not.toHaveAttribute('aria-label')
  },
}

/**
 * Three levels, and a skipped one: “Buller” is an `h4` right under an `h2`, and nests one step.
 * The indent is 16px a level, so the level shows without colour. The page opens scrolled to
 * “Ritningar”: it is the current heading, and its parents, “Bygglov” and “Bygga och bo”, are the
 * trail. Resident pages list `h2` and `h3`, and `h4` at most.
 */
export const Levels: Story = {
  args: { items: sampleItems('levels', levels) },
  decorators: [withContentsColumns],
  render: renderPage,
  play: async ({ canvas, canvasElement }) => {
    await expect(within(canvas.getByRole('navigation')).getAllByRole('list')).toHaveLength(4)
    await scrollToHeading(canvasElement, 'Ritningar')
    await expect(canvasElement.querySelectorAll('[aria-current]')).toHaveLength(1)
  },
}

/**
 * A sticky header of 64px would cover a heading that a link scrolls to, and a link that focus
 * scrolls to, unless the page sets `scroll-padding-top: 64px` on the root, as this page does. `offset={64}` is the same line, so the
 * heading a link lands is the current one. If the two differed, the heading above it would stay
 * current.
 */
export const StickyOffset: Story = {
  args: { items: sampleItems('sticky-offset'), offset: 64 },
  decorators: [withStickyHeader],
  render: renderPage,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'På den här sidan' })).toBeVisible()
  },
}

/**
 * Your own list: the function child gets the tree and the active id. Here only the top level is
 * drawn, with the number of sub-sections after each link. `render` changes any part’s element. The
 * Root draws nothing when `items` is empty, so a title drawn in this function goes with the list.
 */
export const CustomRender: Story = {
  parameters: showSource('table-of-contents/table-of-contents.fixture.tsx', 'ContentsWithOwnList'),
  render: () => <ContentsWithOwnList />,
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'På den här sidan' })
    // Only the top level: the function drew its own list.
    await expect(within(navigation).getAllByRole('link')).toHaveLength(3)
  },
}

/**
 * `kv-compact` for manuals and staff tools: 32px rows, never under 24 × 24 (2.5.8). The page opens
 * scrolled to “Avgifter”.
 */
export const CompactDensity: Story = {
  args: { className: 'kv-compact', items: sampleItems('compact-density') },
  decorators: [withContentsColumns],
  render: renderPage,
  play: async ({ canvas, canvasElement }) => {
    const links = within(canvas.getByRole('navigation')).getAllByRole('link')
    await expect(links).toHaveLength(5)
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await scrollToHeading(canvasElement, 'Avgifter')
  },
}

/**
 * Long Finnish compounds wrap inside a narrow column instead of overflowing (1.4.10). The landmark
 * is named in Finnish by the message.
 */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  args: { items: sampleItems('long-finnish-text', finnish) },
  decorators: [withNarrowColumn],
  render: renderPage,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('navigation', { name: 'Tällä sivulla' })).toBeVisible()
    await scrollToHeading(
      canvasElement,
      'Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut',
    )
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Right to left, in English: the indent and the forced-colours bar sit on the right, and the
 * landmark is named by the English message. The page opens scrolled to “Fees”.
 */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { items: sampleItems('rtl', permit) },
  decorators: [withContentsColumns],
  render: renderPage,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('navigation', { name: 'On this page' })).toBeVisible()
    await scrollToHeading(canvasElement, 'Fees')
  },
}

/**
 * The marker for forced colours, with “Avgifter” as the current heading. In real emulation the
 * fills drop, the current link gets a straight `LinkText` bar, and the trail keeps its weight.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { items: sampleItems('forced-colors') },
  decorators: [withContentsColumns],
  render: renderPage,
  play: async ({ canvasElement }) => {
    await scrollToHeading(canvasElement, 'Avgifter')
  },
}
