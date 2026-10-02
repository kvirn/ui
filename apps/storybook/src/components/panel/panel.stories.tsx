import { Card, Link, Panel } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/panel/panel.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  binsImage,
  isCardFixtureLocale,
  NewsList,
  ServiceCard,
  textsFor,
} from '../card/card.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import guidance from './panel-or-card.md?raw'
import { ContactDetailsFieldset, ContactPanel, NewsCard, UserPanel } from './panel.fixture.tsx'
import type { PanelFixtureLocale } from './panel.fixture.tsx'

// Components/Panel: the headless Panel, styled by @kvirn-ui/theme/theme.css (ADR-0013, ADR-0044,
// design spec docs/design/panel.md). Panel has no focusable part, so there's no Keyboard story:
// panel.e2e.ts runs its Tab rows against CardsOnAPanel, and its focus-ring, forced-colours and
// reflow checks against Padding, ForcedColors, ImageInPanel and LongFinnishText.

const localeOf = (globals: Record<string, unknown>): PanelFixtureLocale => {
  const locale = globals['locale']
  return isCardFixtureLocale(locale) ? locale : 'sv'
}

const pixels = (value: string): number => Number.parseFloat(value)

const description = `A plain container for a region of the page, such as a sidebar or a band of content. It renders a \`<div>\`. To make it a landmark, render it as a \`<section>\`, \`<aside>\` or \`<nav>\` with a name.

This \`Panel\` is a region of the page. It is not the \`Panel\` part of Disclosure or Tabs.

### Panel, Card or a surface token: when to use which

${guidance}`

const meta = {
  title: 'Components/Panel',
  component: Panel.Root,
  args: {
    children: (
      <>
        <h2>Kontakta oss</h2>
        <p>Vi svarar vardagar 9–16.</p>
      </>
    ),
  },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-panel`. The theme styles `kv-panel--surface`, `kv-panel--canvas` and `kv-panel--padding-none|sm|md|lg`.',
    },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Panel.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A Panel with a heading and a paragraph: a `<div>`, so it adds no landmark. */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2, name: 'Kontakta oss' })
    await expect(heading.closest('.kv-panel')).not.toBeNull()
    await expect(canvas.queryByRole('complementary')).toBeNull()
    await expect(canvas.queryByRole('region')).toBeNull()
  },
}

/**
 * Example A: a text block in a sidebar. The Panel is rendered as an `<aside>` with a name, so it
 * is a complementary landmark worth jumping to. Prose styles the text.
 */
export const SidebarTextBlock: Story = {
  render: (_args, { globals }) => (
    <div className="kv-story-card-column">
      <ContactPanel locale={localeOf(globals)} />
    </div>
  ),
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
 * Example B: a band of cards. A Card on a Panel keeps its default look, and the band is a
 * visual region only: a `<div>`, no landmark.
 */
export const CardsOnAPanel: Story = {
  render: (_args, { globals }) => (
    <Panel data-testid="band">
      <NewsList locale={localeOf(globals)} />
    </Panel>
  ),
  play: async ({ canvas }) => {
    const band = canvas.getByTestId('band')
    await expect(within(band).getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.queryByRole('region')).toBeNull()
  },
}

/**
 * `kv-panel--surface` (the default) and `kv-panel--canvas`, each on the page and inside a
 * `surface` Panel. A canvas Panel goes back to the page colour inside a frame, and a `surface`
 * Panel on a `surface` frame draws nothing but its padding.
 */
export const Surfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const surfaces = [
      ['surface', 'kv-panel--surface'],
      ['canvas', 'kv-panel--canvas'],
    ] as const
    const samples = (place: 'page' | 'frame') =>
      surfaces.map(([surface, className]) => (
        <Panel
          key={surface}
          className={className}
          data-testid={`${surface}-on-${place}`}
          lang={lang}
        >
          <p>
            <code>{className}</code>
          </p>
          <p>{text.waste.plan}</p>
        </Panel>
      ))
    return (
      <>
        <div className="kv-story-columns">{samples('page')}</div>
        <Panel className="kv-panel--padding-lg kv-story-section" data-testid="frame">
          <div className="kv-story-columns">{samples('frame')}</div>
        </Panel>
      </>
    )
  },
  play: async ({ canvas }) => {
    const background = (testId: string) =>
      getComputedStyle(canvas.getByTestId(testId)).backgroundColor
    await expect(background('surface-on-page')).not.toBe(background('canvas-on-page'))
    // On a surface frame, the canvas Panel is the one that shows.
    await expect(background('canvas-on-frame')).not.toBe(background('frame'))
  },
}

/**
 * `kv-panel--padding-none`, `-sm`, `-md` (the default) and `-lg`. They're the same steps as a
 * card's: 24px for `md`, and 16px below `40rem` and in compact density. `none` is for a frame
 * whose children pad themselves, and for full-bleed media. The link sits at the edge, to show
 * that its focus ring isn't clipped.
 */
export const Padding: Story = {
  render: (_args, { globals }) => {
    const { text } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-columns">
        {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
          <Panel
            key={padding}
            className={padding === 'md' ? undefined : `kv-panel--padding-${padding}`}
            data-testid={padding}
          >
            <p>
              <code>{padding === 'md' ? 'kv-panel' : `kv-panel--padding-${padding}`}</code>
            </p>
            <p>
              <Link href={`#${padding}`} data-testid={`${padding}-link`}>
                {text.news.recycling.title}
              </Link>
            </p>
          </Panel>
        ))}
      </div>
    )
  },
}

/**
 * The documented recipe for the one edge that meets the content: the 1px border is already
 * there and transparent, so colouring one side with `border-inline-end-color:
 * var(--kv-color-border-subtle)` moves nothing. It follows `dir`, and every theme.
 */
export const OneEdge: Story = {
  render: (_args, { globals }) => (
    <div className="kv-story-card-column">
      <ContactPanel locale={localeOf(globals)} hasEdge />
    </div>
  ),
}

/**
 * The elevation levels (Foundation/Borders and elevation), 0 to 4, each labelled with when to
 * use it. Levels 0 to 2 are the page, a `kv-panel` and a default card. In the light themes the
 * page and the raised card are both white, so the panel between them and the 1px border of the
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
        <Panel className="kv-panel--padding-lg" data-testid="surface">
          <p>
            <strong>Level 1, a region: </strong>
            <code>kv-panel</code>, <code>surface</code>. Use it to set a region of the page apart: a
            sidebar, a filter panel or a band of related cards. It has no shadow and no visible
            edge, except in forced colours.
          </p>
          <Card.Root data-testid="surface-raised">
            <p>
              <strong>Level 2, a card: </strong>
              <code>kv-card</code>, <code>surface-raised</code>. Use it for one thing on the page or
              on a panel. It has a border and no shadow, and is never interactive.
            </p>
            <p lang={lang}>{text.waste.plan}</p>
          </Card.Root>
        </Panel>
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
  play: async ({ canvas }) => {
    // The panel differs from the page and from the card on it. The page and the card can share
    // a colour (white in the light themes), so the card's edge is checked below.
    const [page, panel, card] = ['canvas', 'surface', 'surface-raised'].map(
      (id) => getComputedStyle(canvas.getByTestId(id)).backgroundColor,
    )
    await expect(panel).not.toBe(page)
    await expect(panel).not.toBe(card)
    // Every level from 1 up has a 1px border: a shadow can disappear (dark themes, forced
    // colours), so the border is what shows the boundary where it is drawn.
    for (const id of ['surface', 'surface-raised', 'popup', 'dialog']) {
      await expect(getComputedStyle(canvas.getByTestId(id)).borderTopWidth).toBe('1px')
    }
  },
}

/**
 * Panel, Card or neither, on the same page. A user with Edit and Delete is one thing with
 * several independent actions, so it's a Panel. A news item is one thing with one destination,
 * so it's a Card. A form section is neither: a `<fieldset>` with a legend.
 */
export const CardOrPanel: Story = {
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    return (
      <div className="kv-story-columns">
        <UserPanel locale={locale} />
        <NewsCard locale={locale} />
        <ContactDetailsFieldset locale={locale} />
      </div>
    )
  },
  play: async ({ canvas }) => {
    const users = canvas.getByTestId('panel-with-actions')
    await expect(users.classList.contains('kv-panel')).toBe(true)
    await expect(within(users).getAllByRole('button')).toHaveLength(2)
    const news = canvas.getByTestId('news-card')
    await expect(news.classList.contains('kv-card')).toBe(true)
    await expect(within(news).getAllByRole('link')).toHaveLength(1)
    const form = canvas.getByTestId('form-section')
    await expect(form.closest('.kv-panel, .kv-card')).toBeNull()
    await expect(canvas.getByRole('group', { name: 'Kontaktuppgifter' })).toBeVisible()
  },
}

/**
 * A Panel is not a prose boundary. `kv-prose` on a Panel makes its content prose. A Panel in
 * prose gets prose's block margins on its own element, and its content stays prose. The Panel
 * keeps its full width. For a 70ch reading column in a band, `kv-prose` goes on an element
 * inside.
 */
export const ProseAndPanels: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const titles = [text.news.recycling.title, text.news.snow.title] as const
    return (
      <>
        <Panel className="kv-prose" data-testid="prose-on-panel" lang={lang}>
          <h2>{text.news.heading}</h2>
          <p>{text.news.recycling.excerpt}</p>
          <ul>
            {titles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </Panel>
        <article className="kv-prose kv-story-section" lang={lang}>
          <h2>{text.news.heading}</h2>
          <p>{text.news.snow.excerpt}</p>
          <Panel data-testid="panel-in-prose">
            <p>{text.news.grants.excerpt}</p>
            <ul>
              {titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </Panel>
          <p>{text.news.grants.excerpt}</p>
        </article>
        <Panel className="kv-story-section" data-testid="band" lang={lang}>
          <div className="kv-prose">
            <h2>{text.news.heading}</h2>
            <p>{text.news.snow.excerpt}</p>
          </div>
        </Panel>
      </>
    )
  },
}

/** An image directly in a Panel: the theme keeps it inside, because a Panel never clips. */
export const ImageInPanel: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div data-testid="column">
        <Panel lang={lang}>
          <img src={binsImage} alt="" width={640} height={240} data-testid="wide-image" />
          <p>{text.waste.plan}</p>
        </Panel>
      </div>
    )
  },
  play: async ({ canvas }) => {
    // A 640px image in a padded Panel shrinks with it instead of overflowing (1.4.10).
    const image = canvas.getByTestId('wide-image')
    const panel = image.parentElement as HTMLElement
    const panelStyle = getComputedStyle(panel)
    const contentWidth =
      panel.clientWidth -
      pixels(panelStyle.paddingInlineStart) -
      pixels(panelStyle.paddingInlineEnd)
    await expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(contentWidth + 0.5)
    await expectNoHorizontalOverflow(canvas.getByTestId('column'))
  },
}

/** Finnish text in a narrow column: the Panel wraps instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <ContactPanel locale="fi" />
      <Panel className="kv-story-section">
        <ServiceCard locale="fi" />
      </Panel>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Keskeytä jäteastioiden tyhjennykset' }),
    ).toBeVisible()
    await expect(canvas.getByRole('complementary', { name: 'Ota yhteyttä' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Examples A and B, and Panel, Card or neither, on one page. */
function AllExamplesPage({ locale }: { locale: PanelFixtureLocale }) {
  return (
    <>
      <ContactPanel locale={locale} />
      <Panel className="kv-story-section">
        <NewsList locale={locale} />
      </Panel>
      <div className="kv-story-columns kv-story-section">
        <UserPanel locale={locale} />
        <NewsCard locale={locale} />
        <ContactDetailsFieldset locale={locale} />
      </div>
    </>
  )
}

/** The Panel examples together: a sidebar, a band of cards, and Panel, Card or neither. */
export const AllExamples: Story = {
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}

/** Right to left, in English: the padding, the text and the one edge follow `dir`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <div className="kv-story-columns">
      <ContactPanel locale="en" hasEdge />
      <UserPanel locale="en" />
    </div>
  ),
}

/** The Panel edge survives forced colours. The e2e suite checks it with real emulation. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}
