import { Button, Card } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/card/card.a11y.md?raw'
import guide from '../../../../../packages/react/src/card/card.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ArticleCard as ArticleCardExample,
  binsImage,
  CaseCard as CaseCardExample,
  isCardFixtureLocale,
  NewsList as NewsListExample,
  ServiceCard as ServiceCardExample,
  textsFor,
} from './card.fixture.tsx'
import type { CardFixtureLocale } from './card.fixture.tsx'

// Components/Card: the headless Card, styled by @kvirn-ui/theme/theme.css (design
// spec docs/design/card.md).

const localeOf = (globals: Record<string, unknown>): CardFixtureLocale => {
  const locale = globals['locale']
  return isCardFixtureLocale(locale) ? locale : 'sv'
}

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Card',
  component: Card.Root,
  args: {
    children: (
      <>
        <Card.Header className="kv-card-header--padding-none">
          <img src={binsImage} alt="" width={640} height={240} />
        </Card.Header>
        <Card.Body className="kv-prose">
          <h2>Sophämtning</h2>
          <p>Nästa hämtning är på tisdag. Ställ ut kärlet senast klockan 06.</p>
        </Card.Body>
        <Card.Footer className="kv-button-group">
          <Button className="kv-button--primary">Beställ extra tömning</Button>
          <Button>Pausa hämtningen</Button>
        </Card.Footer>
      </>
    ),
  },
  argTypes: {
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-card`. The theme styles `kv-card--radius-md|none`, `kv-card--padding-none|sm|lg` and `kv-card--dividers`. A card is always `surface-raised`: a region of the page is a Section.',
    },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Card.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A Card with a full-bleed image in its Header, a Body and a Footer with two actions. */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
}

/**
 * Example B: a service card on My pages. A full-bleed image gets the card's inner corners
 * instead of the card hiding overflow, so the footer buttons' focus rings are never clipped.
 */
export const ServiceCard: Story = {
  parameters: showSource('card/card.fixture.tsx', 'ServiceCard'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ServiceCardExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const card = canvas.getByTestId('service-card')
    await expect(within(card).getByRole('heading', { level: 2 })).toBeVisible()
    await expect(within(card).getByRole('button', { name: 'Beställ extra tömning' })).toBeVisible()
    await expect(within(card).getByRole('button', { name: 'Pausa hämtningen' })).toBeVisible()
  },
}

/** Example C: a list of news cards. Each card is a list item with one link, in its heading. */
export const NewsList: Story = {
  parameters: showSource('card/card.fixture.tsx', 'NewsList'),
  render: (_args, { globals }) => <NewsListExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list')
    const items = within(list).getAllByRole('listitem')
    await expect(items).toHaveLength(3)
    for (const item of items) {
      await expect(within(item).getAllByRole('link')).toHaveLength(1)
      await expect(within(item).getByRole('heading', { level: 3 })).toBeVisible()
    }
  },
}

/** Example D: a staff case card in compact density, with a nested card one step down. */
export const NestedCard: Story = {
  parameters: showSource('card/card.fixture.tsx', 'CaseCard'),
  render: (_args, { globals }) => <CaseCardExample locale={localeOf(globals)} />,
}

/**
 * `render` on all three parts: the Root's function form turns it into an `<article>` named by its
 * heading, the Header into a `<figure>`, and the Footer adds a class of its own. Each part keeps
 * its `kv-card-*` class, so the theme still styles it.
 */
export const RenderForms: Story = {
  parameters: showSource('card/card.fixture.tsx', 'ArticleCard'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ArticleCardExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const article = canvas.getByRole('article', { name: 'Nya öppettider på återvinningscentralen' })
    await expect(article.querySelector('figure')).not.toBeNull()
    await expect(within(article).getByRole('button', { name: 'Pausa hämtningen' })).toBeVisible()
  },
}

/**
 * `kv-card--radius-md` on the Root for a card nested in a card, `kv-card--radius-none` for a
 * flush card, or neither for lg.
 */
export const Radii: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <>
        {(
          [
            ['lg', 'kv-card'],
            ['md', 'kv-card--radius-md'],
            ['none', 'kv-card--radius-none'],
          ] as const
        ).map(([radius, className]) => (
          <Card.Root
            key={radius}
            className={radius === 'lg' ? undefined : className}
            data-testid={radius}
            lang={lang}
          >
            <p>
              <code>{className}</code>
            </p>
            <p>{text.waste.plan}</p>
          </Card.Root>
        ))}
      </>
    )
  },
}

/**
 * `kv-card--padding-none`, `-sm` or `-lg` on the Root sets every part's padding (md without
 * one), and a part's own class (`kv-card-header--padding-lg`) overrides the Root. All four steps
 * are allowed per part, but mixed steps misalign the parts' edges, so per-part values are
 * normally `none`, for full-bleed media: `kv-card-body--padding-none` lets an image in the Body
 * reach the card's edge, as in the last card.
 */
export const Padding: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <>
        <div className="kv-story-columns">
          {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
            <Card.Root
              key={padding}
              className={padding === 'md' ? undefined : `kv-card--padding-${padding}`}
              data-testid={padding}
              lang={lang}
            >
              <p>
                <code>{padding === 'md' ? 'kv-card' : `kv-card--padding-${padding}`}</code>
              </p>
            </Card.Root>
          ))}
        </div>
        <div className="kv-story-section kv-story-card-column">
          <Card.Root className="kv-card--padding-sm" data-testid="per-part" lang={lang}>
            <Card.Header className="kv-card-header--padding-lg">
              <p>
                <code>kv-card-header--padding-lg</code>
              </p>
            </Card.Header>
            <Card.Body>
              <p>
                <code>kv-card--padding-sm</code>
              </p>
              <p>{text.waste.plan}</p>
            </Card.Body>
            <Card.Footer className="kv-card-footer--padding-md kv-button-group">
              <Button>{text.waste.pause}</Button>
            </Card.Footer>
          </Card.Root>
          <Card.Root className="kv-story-section" data-testid="body-padding-none" lang={lang}>
            <Card.Body className="kv-card-body--padding-none">
              <img src={binsImage} alt="" width={640} height={240} />
            </Card.Body>
          </Card.Root>
        </div>
      </>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('body-padding-none').querySelector('img')).toBeVisible()
  },
}

/** `kv-card--dividers`: a hairline between parts, and every part keeps its padding. */
export const Dividers: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-columns">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <>
        <Card.Root className="kv-card--dividers" data-testid="dividers" lang={lang}>
          <Card.Header className="kv-prose">
            <h2>{text.waste.heading}</h2>
          </Card.Header>
          <Card.Body className="kv-prose">
            <p>{text.waste.plan}</p>
          </Card.Body>
          <Card.Footer className="kv-button-group">
            <Button>{text.waste.pause}</Button>
          </Card.Footer>
        </Card.Root>
        <Card.Root className="kv-card--dividers" data-testid="dividers-after-image" lang={lang}>
          <Card.Header className="kv-card-header--padding-none">
            <img src={binsImage} alt="" width={640} height={240} />
          </Card.Header>
          <Card.Body className="kv-prose">
            <p>{text.waste.plan}</p>
          </Card.Body>
          <Card.Footer className="kv-button-group">
            <Button>{text.waste.pause}</Button>
          </Card.Footer>
        </Card.Root>
      </>
    )
  },
}

/**
 * Prose stops at a card: nothing inside a card in prose is prose-styled, and the card gets
 * prose's block spacing. `kv-prose` on a card part turns prose on again inside it, and it
 * stops again at a nested card.
 */
export const ProseAndCards: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const titles = [text.news.recycling.title, text.news.snow.title] as const
    return (
      <article className="kv-prose" lang={lang}>
        <h2>{text.news.heading}</h2>
        <p>{text.news.recycling.excerpt}</p>
        <Card.Root data-testid="card-in-prose">
          <p>{text.news.snow.excerpt}</p>
          <ul data-testid="list-in-card">
            {titles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </Card.Root>
        <p>{text.news.grants.excerpt}</p>
        <Card.Root>
          <Card.Body className="kv-prose">
            <p>{text.waste.plan}</p>
            <ul data-testid="prose-in-card">
              {titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <Card.Root className="kv-card--radius-md">
              <ul data-testid="list-in-nested-card">
                {titles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </Card.Root>
          </Card.Body>
        </Card.Root>
      </article>
    )
  },
}

/** A Root with plain children: it stays a block, so a link in the text stays inline. */
export const PlainChildren: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Card.Root data-testid="plain" lang={lang}>
        {text.waste.plan}
      </Card.Root>
    )
  },
}

/** An image in a padded part, without prose: the theme keeps it inside the part. */
export const ImageInPaddedBody: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div data-testid="column">
        <Card.Root lang={lang}>
          <Card.Body>
            <img src={binsImage} alt="" width={640} height={240} data-testid="wide-image" />
            <p>{text.waste.plan}</p>
          </Card.Body>
        </Card.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    // A 640px image in a padded part shrinks with the card instead of overflowing (1.4.10).
    await expectNoHorizontalOverflow(canvas.getByTestId('column'))
  },
}

/**
 * Parts must be direct children of the Root. With a wrapper between them, the Root doesn't
 * see its parts and pads itself too, so the padding doubles. Don't do this.
 */
export const WrapperBetweenParts: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Card.Root data-testid="wrapped" lang={lang}>
        <div>
          <Card.Body>
            <p>
              <code>Card.Root &gt; div &gt; Card.Body</code>
            </p>
            <p>{text.waste.plan}</p>
          </Card.Body>
        </div>
      </Card.Root>
    )
  },
}

/** Finnish text in a narrow column: the cards wrap instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('card/card.fixture.tsx', 'ServiceCard'),
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: () => <ServiceCardExample locale="fi" />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Keskeytä jäteastioiden tyhjennykset' }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Examples B–D on one page: layout only, for axe. */
function AllExamplesPage({ locale }: { locale: CardFixtureLocale }) {
  return (
    <>
      <div className="kv-story-card-column">
        <ServiceCardExample locale={locale} />
      </div>
      <div className="kv-story-section">
        <NewsListExample locale={locale} />
      </div>
      <div className="kv-story-section">
        <CaseCardExample locale={locale} />
      </div>
    </>
  )
}

/** The functions the page is made of: the real parts of every example on it. */
const allExamplesSource = showSource('card/card.fixture.tsx', 'ServiceCard', 'NewsList', 'CaseCard')

/** Examples B–D together: the design spec's uses of a card on one page. */
export const AllExamples: Story = {
  parameters: allExamplesSource,
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}

/** Right to left, in English: the image, text and actions follow `dir`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('card/card.fixture.tsx', 'ServiceCard'),
  decorators: [
    (Story) => (
      <div className="kv-story-card-column">
        <Story />
      </div>
    ),
  ],
  render: () => <ServiceCardExample locale="en" />,
}

/** The card edge survives forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: allExamplesSource,
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}
