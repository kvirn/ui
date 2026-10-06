import { Card, Link, Prose, Section } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/section/section.a11y.md?raw'
import guide from '../../../../../packages/react/src/section/section.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  binsImage,
  isCardFixtureLocale,
  NewsList,
  ServiceCard,
  textsFor,
} from '../card/card.fixture.tsx'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ContactDetailsFieldset,
  ContactSection,
  ContactSectionWithEdge,
  NewsBand,
  NewsCard,
  RenderedSections,
  UserSection,
  withSectionLocale,
} from './section.fixture.tsx'
import type { SectionFixtureLocale } from './section.fixture.tsx'

// Components/Section: the headless Section, styled by @kvirn-ui/theme/theme.css (design spec docs/design/section.md). Section has no focusable part, so there's no Keyboard story.

const localeOf = (globals: Record<string, unknown>): SectionFixtureLocale => {
  const locale = globals['locale']
  return isCardFixtureLocale(locale) ? locale : 'sv'
}

/**
 * "Show code" of a story that composes examples from more than one fixture file: each function's
 * own source, one after the other, as `showSource` reads it.
 */
const showSources = (...sources: ReturnType<typeof showSource>[]) =>
  ({
    docs: {
      source: {
        code: sources.map((source) => source.docs.source.code).join('\n\n'),
        language: 'tsx',
        type: 'code',
      },
    },
  }) as const

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Section',
  component: Section,
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-section`. The theme styles `kv-section--surface`, `kv-section--canvas` and `kv-section--padding-none|sm|md|lg`.',
    },
    render: { control: false, description: 'Another element, such as `<aside>` or `<section>`.' },
  },
  globals: { locale: 'sv' },
  decorators: [withSectionLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

/** A Section with a heading and a paragraph: a `<div>`, so it adds no landmark. */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Section {...args}>
      <Prose>
        <h2>Kontakta oss</h2>
        <p>Vi svarar vardagar 9–16.</p>
      </Prose>
    </Section>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2, name: 'Kontakta oss' })
    await expect(heading.closest('.kv-section')).not.toBeNull()
    await expect(canvas.queryByRole('complementary')).toBeNull()
    await expect(canvas.queryByRole('region')).toBeNull()
  },
}

/**
 * Example A: a text block in a sidebar. The Section is rendered as an `<aside>` with a name, so it
 * is a complementary landmark worth jumping to. Prose styles the text.
 */
export const SidebarTextBlock: Story = {
  parameters: showSource('section/section.fixture.tsx', 'ContactSection'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ContactSection locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const region = canvas.getByRole('complementary', { name: 'Kontakta oss' })
    await expect(within(region).getByRole('heading', { level: 2 })).toBeVisible()
    await expect(within(region).getByRole('link', { name: 'Mejla kundcenter' })).toHaveAttribute(
      'href',
      'mailto:kundcenter@kvirnby.example',
    )
  },
}

/**
 * Example B: a band of cards. A Card on a Section keeps its default look, and the band is a
 * visual region only: a `<div>`, no landmark.
 */
export const CardsOnASection: Story = {
  parameters: showSources(
    showSource('section/section.fixture.tsx', 'NewsBand'),
    showSource('card/card.fixture.tsx', 'NewsList'),
  ),
  render: (_args, { globals }) => <NewsBand locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const band = canvas.getByTestId('band')
    await expect(within(band).getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.queryByRole('region')).toBeNull()
  },
}

/**
 * `kv-section--surface` (the default) and `kv-section--canvas`, each on the page and inside a
 * `surface` Section. A canvas Section goes back to the page colour inside a frame, and a `surface`
 * Section on a `surface` frame draws nothing but its padding.
 */
export const Surfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const surfaces = [
      ['surface', 'kv-section--surface'],
      ['canvas', 'kv-section--canvas'],
    ] as const
    const samples = (place: 'page' | 'frame') =>
      surfaces.map(([surface, className]) => (
        <Section
          key={surface}
          className={className}
          data-testid={`${surface}-on-${place}`}
          lang={lang}
        >
          <p>
            <code>{className}</code>
          </p>
          <p>{text.waste.plan}</p>
        </Section>
      ))
    return (
      <>
        <div className="kv-story-columns">{samples('page')}</div>
        <Section className="kv-section--padding-lg kv-story-section" data-testid="frame">
          <div className="kv-story-columns">{samples('frame')}</div>
        </Section>
      </>
    )
  },
}

/**
 * `kv-section--padding-none`, `-sm`, `-md` (the default) and `-lg`. They're the same steps as a
 * card's: 24px for `md`, and 16px below `40rem` and in compact density. `none` is for a frame
 * whose children pad themselves, and for full-bleed media. The link sits at the edge, to show
 * that its focus ring isn't clipped.
 */
export const Padding: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text } = textsFor(localeOf(globals))
    return (
      <>
        {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
          <Section
            key={padding}
            className={padding === 'md' ? undefined : `kv-section--padding-${padding}`}
            data-testid={padding}
          >
            <p>
              <code>{padding === 'md' ? 'kv-section' : `kv-section--padding-${padding}`}</code>
            </p>
            <p>
              <Link.Root href={`#${padding}`} data-testid={`${padding}-link`}>
                {text.news.recycling.title}
              </Link.Root>
            </p>
          </Section>
        ))}
      </>
    )
  },
}

/**
 * The documented recipe for the one edge that meets the content: the 1px border is already
 * there and transparent, so colouring one side with `border-inline-end-color:
 * var(--kv-color-border-subtle)` moves nothing. It follows `dir`, and every theme.
 */
export const OneEdge: Story = {
  parameters: showSource('section/section.fixture.tsx', 'ContactSectionWithEdge'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ContactSectionWithEdge locale={localeOf(globals)} />,
}

/**
 * The elevation levels (Foundation/Borders and elevation), 0 to 4, each labelled with when to
 * use it. Levels 0 to 2 are the page, a `kv-section` and a default card. In the light themes the
 * page and the raised card are both white, so the section between them and the 1px border of the
 * card are what show the layers. Levels 3 and 4 are stand-ins for a popup and a dialog, which
 * aren't components yet: they show the `xl` radius, the border and the shadow, which the dark
 * themes leave out. Every level from 1 up has a 1px border: transparent at level 1, except in
 * forced colours, and a visible hairline from level 2. Nested cards are one level deep here, as
 * the design spec allows.
 */
export const SurfaceLayers: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div
        lang="en"
        data-testid="canvas"
        style={{ padding: 'var(--kv-space-4)', backgroundColor: 'var(--kv-color-canvas)' }}
      >
        <p>
          <strong>Level 0, the page: </strong>
          <code>canvas</code>. Everything sits on it. Use it for the page itself, and nothing else.
        </p>
        <Section className="kv-section--padding-lg" data-testid="surface">
          <p>
            <strong>Level 1, a region: </strong>
            <code>kv-section</code>, <code>surface</code>. Use it to set a region of the page apart:
            a sidebar, a filter section or a band of related cards. It has no shadow and no visible
            edge, except in forced colours.
          </p>
          <Card.Root data-testid="surface-raised">
            <p>
              <strong>Level 2, a card: </strong>
              <code>kv-card</code>, <code>surface-raised</code>. Use it for one thing on the page or
              on a section. It has a border and no shadow, and is never interactive.
            </p>
            <p lang={lang}>{text.waste.plan}</p>
          </Card.Root>
        </Section>
        <div className="kv-story-columns" style={{ marginBlockStart: 'var(--kv-space-6)' }}>
          <div className="kv-story-popup" data-testid="popup">
            <p>
              <strong>Level 3, a popup: </strong>
              <code>--kv-shadow-popup</code>. Use it for a menu, a listbox or a popover that opens
              over the page and closes again. It has a border and a soft shadow.
            </p>
          </div>
          <div className="kv-story-dialog" data-testid="dialog">
            <p>
              <strong>Level 4, a dialog: </strong>
              <code>--kv-shadow-dialog</code>. Use it for a dialog that takes over the page, over a
              backdrop, with the page behind it inert. It has a border and the deepest shadow.
            </p>
          </div>
        </div>
      </div>
    )
  },
}

/**
 * Section, Card or neither, on the same page. A user with Edit and Delete is one thing with
 * several independent actions, so it's a Section. A news item is one thing with one destination,
 * so it's a Card. A form section is neither: a `<fieldset>` with a legend.
 */
export const CardOrSection: Story = {
  parameters: showSource(
    'section/section.fixture.tsx',
    'ContactDetailsFieldset',
    'NewsCard',
    'UserSection',
  ),
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <>
        <UserSection locale={locale} />
        <NewsCard locale={locale} />
        <ContactDetailsFieldset locale={locale} />
      </>
    )
  },
  play: async ({ canvas }) => {
    const users = canvas.getByTestId('section-with-actions')
    await expect(within(users).getAllByRole('button')).toHaveLength(2)
    const news = canvas.getByTestId('news-card')
    await expect(within(news).getAllByRole('link')).toHaveLength(1)
    await expect(canvas.getByRole('group', { name: 'Kontaktuppgifter' })).toBeVisible()
  },
}

/**
 * A Section is not a prose boundary. `kv-prose` on a Section makes its content prose. A Section in
 * prose gets prose's block margins on its own element, and its content stays prose. The Section
 * keeps its full width. For a 70ch reading column in a band, `kv-prose` goes on an element
 * inside.
 */
export const ProseAndSections: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const titles = [text.news.recycling.title, text.news.snow.title] as const
    return (
      <>
        <Section className="kv-prose" data-testid="prose-on-section" lang={lang}>
          <h2>{text.news.heading}</h2>
          <p>{text.news.recycling.excerpt}</p>
          <ul>
            {titles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </Section>
        <article className="kv-prose kv-story-section" lang={lang}>
          <h2>{text.news.heading}</h2>
          <p>{text.news.snow.excerpt}</p>
          <Section data-testid="section-in-prose">
            <p>{text.news.grants.excerpt}</p>
            <ul>
              {titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </Section>
          <p>{text.news.grants.excerpt}</p>
        </article>
        <Section className="kv-story-section" data-testid="band" lang={lang}>
          <div className="kv-prose">
            <h2>{text.news.heading}</h2>
            <p>{text.news.snow.excerpt}</p>
          </div>
        </Section>
      </>
    )
  },
}

/**
 * `render` as a named `<section>`, as a `<nav>` through the function form, and as `<li>` items in
 * a list. Only the first two are landmarks, and both are named by their heading.
 */
export const RenderedAsLandmarks: Story = {
  parameters: showSource('section/section.fixture.tsx', 'RenderedSections'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <RenderedSections locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Sophämtning vid Storgatan 12' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Nyheter' })).toBeVisible()
    // The list of Sections: two plain items, no landmark.
    const lists = canvas.getAllByRole('list')
    await expect(
      within(lists[lists.length - 1] as HTMLElement).getAllByRole('listitem'),
    ).toHaveLength(2)
  },
}

/** An image directly in a Section: the theme keeps it inside, because a Section never clips. */
export const ImageInSection: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div data-testid="column">
        <Section lang={lang}>
          <img src={binsImage} alt="" width={640} height={240} data-testid="wide-image" />
          <p>{text.waste.plan}</p>
        </Section>
      </div>
    )
  },
  play: async ({ canvas }) => {
    // A 640px image in a padded Section shrinks with it instead of overflowing (1.4.10).
    await expectNoHorizontalOverflow(canvas.getByTestId('column'))
  },
}

/** Finnish text in a narrow column: the Section wraps instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: showSources(
    showSource('section/section.fixture.tsx', 'ContactSection'),
    showSource('card/card.fixture.tsx', 'ServiceCard'),
  ),
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <ContactSection locale="fi" />
      <Section className="kv-story-section">
        <ServiceCard locale="fi" />
      </Section>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Keskeytä jäteastioiden tyhjennykset' }),
    ).toBeVisible()
    await expect(canvas.getByRole('complementary', { name: 'Ota yhteyttä' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Examples A and B, and Section, Card or neither, on one page: layout only, for axe. */
function AllExamplesPage({ locale }: { locale: SectionFixtureLocale }) {
  return (
    <>
      <ContactSection locale={locale} />
      <Section className="kv-story-section">
        <NewsList locale={locale} />
      </Section>
      <div className="kv-story-columns kv-story-section">
        <UserSection locale={locale} />
        <NewsCard locale={locale} />
        <ContactDetailsFieldset locale={locale} />
      </div>
    </>
  )
}

/** The functions the page is made of: the real parts of every example on it. */
const allExamplesSource = showSources(
  showSource(
    'section/section.fixture.tsx',
    'ContactSection',
    'UserSection',
    'NewsCard',
    'ContactDetailsFieldset',
  ),
  showSource('card/card.fixture.tsx', 'NewsList'),
)

/** The Section examples together: a sidebar, a band of cards, and Section, Card or neither. */
export const AllExamples: Story = {
  parameters: allExamplesSource,
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}

/** Right to left, in English: the padding, the text and the one edge follow `dir`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('section/section.fixture.tsx', 'ContactSectionWithEdge', 'UserSection'),
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <ContactSectionWithEdge locale="en" />
      <UserSection locale="en" />
    </>
  ),
}

/** The Section edge survives forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: allExamplesSource,
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}
