import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from '../button/button.tsx'
import {
  expectNoHorizontalOverflow,
  expectThemeApplied,
  isThemeLoaded,
  isViewportAtLeast,
  tokenColor,
} from '../stories/theme-story-assertions.ts'
import type { FixedStoryTheme } from '../stories/theme-story-assertions.ts'
import { Card } from './card.tsx'
import {
  binsImage,
  CaseCard as CaseCardExample,
  ContactCard as ContactCardExample,
  isCardFixtureLocale,
  NewsList as NewsListExample,
  ServiceCard as ServiceCardExample,
  textsFor,
} from './card.fixture.tsx'
import type { CardFixtureLocale } from './card.fixture.tsx'

// Components/Card: the headless Card, styled by @kvirn-ui/theme/theme.css from the Storybook
// preview (ADR-0013, design spec docs/design/card.md). Theme toolbar › "None (unstyled)"
// removes the theme again. card.e2e.ts runs its keyboard rows, focus-ring, forced-colours and
// reflow checks against ServiceCard, NewsList, Everything, LongFinnishText and ForcedColors.

const localeOf = (globals: Record<string, unknown>): CardFixtureLocale => {
  const locale = globals['locale']
  return isCardFixtureLocale(locale) ? locale : 'sv'
}

const pixels = (value: string): number => Number.parseFloat(value)

/** The padding steps (docs/design/card.md §6.2) at the current viewport, in px. */
function paddingSteps(canvasElement: HTMLElement, { compact = false } = {}) {
  const isWide = isViewportAtLeast(canvasElement, '40rem')
  const isCompact = compact && isViewportAtLeast(canvasElement, '64rem')
  const grows = isWide && !isCompact
  return { none: 0, sm: 12, md: grows ? 24 : 16, lg: grows ? 32 : 24 }
}

const cardBy = (canvasElement: HTMLElement, testId: string) =>
  within(canvasElement).getByTestId(testId)

async function expectPadding(element: HTMLElement, expected: number) {
  const style = getComputedStyle(element)
  for (const side of [
    style.paddingBlockStart,
    style.paddingBlockEnd,
    style.paddingInlineStart,
    style.paddingInlineEnd,
  ]) {
    await expect(pixels(side)).toBe(expected)
  }
}

/** Every card keeps its surface and its hairline in every theme, and never clips. */
async function expectCardLook(card: HTMLElement, surface: string) {
  await expect(card).toHaveStyle({
    backgroundColor: tokenColor(card, surface),
    borderTopColor: tokenColor(card, 'border-subtle'),
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    overflow: 'visible',
    boxShadow: 'none',
  })
}

const meta = {
  title: 'Components/Card',
  component: Card.Root,
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <main>
        <h1>Card</h1>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof Card.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Example B: a service card on My pages. A full-bleed image gets the card's inner corners
 * instead of the card hiding overflow, so the footer buttons' focus rings are never clipped.
 */
export const ServiceCard: Story = {
  name: 'Service card',
  render: (_args, { globals }) => (
    <div className="kv-story-card-column">
      <ServiceCardExample locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const steps = paddingSteps(canvasElement)
    const card = cardBy(canvasElement, 'service-card')
    await expect(card).toHaveAttribute('data-kv', 'card')
    await expectCardLook(card, 'surface-raised')
    await expect(card).toHaveStyle({ borderTopLeftRadius: '12px', display: 'flex' })
    const [header, body, footer] = [...card.children] as HTMLElement[]
    await expect(header).toHaveAttribute('data-kv', 'card-header')
    await expectPadding(header as HTMLElement, 0)
    const image = within(card).getByRole('presentation')
    await expect(image).toHaveStyle({
      display: 'block',
      borderTopLeftRadius: '11px',
      borderTopRightRadius: '11px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
    })
    // After an image the body keeps its top padding. The footer shares the body's.
    await expectPadding(body as HTMLElement, steps.md)
    await expect(pixels(getComputedStyle(footer as HTMLElement).paddingBlockStart)).toBe(0)
    await expect(pixels(getComputedStyle(footer as HTMLElement).paddingBlockEnd)).toBe(steps.md)
    await expect(footer).toHaveStyle({ display: 'flex' })
    const heading = within(card).getByRole('heading', { level: 2 })
    await expect(heading).toHaveStyle({ marginTop: '0px' })
    await expect(
      within(card).getByRole('button', { name: 'Beställ extra tömning' }),
    ).toHaveAttribute('data-variant', 'primary')
    await expect(within(card).getByRole('button', { name: 'Pausa hämtningen' })).toBeVisible()
  },
}

/** Example A: a text block on a surface in a sidebar. A Root without parts pads itself. */
export const SidebarTextBlock: Story = {
  name: 'Sidebar text block',
  render: (_args, { globals }) => (
    <div className="kv-story-card-column">
      <ContactCardExample locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('complementary', { name: 'Kontakta oss' })
    await expect(region).toHaveAttribute('data-kv', 'card')
    await expect(region).toHaveAttribute('data-surface', 'surface')
    await expectCardLook(region, 'surface')
    await expect(region).toHaveStyle({ display: 'block' })
    await expectPadding(region, paddingSteps(canvasElement).md)
    await expect(within(region).getByRole('heading', { level: 2 })).toHaveStyle({
      marginTop: '0px',
    })
    await expect(within(region).getByRole('link', { name: 'Mejla kundcenter' })).toHaveAttribute(
      'href',
      'mailto:kundcenter@kvirnby.example',
    )
  },
}

/** Example C: a list of news cards. Each card is a list item with one link, in its heading. */
export const NewsList: Story = {
  name: 'List of cards',
  render: (_args, { globals }) => <NewsListExample locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list')
    const items = within(list).getAllByRole('listitem')
    await expect(items).toHaveLength(3)
    for (const item of items) {
      await expect(item).toHaveAttribute('data-kv', 'card')
      await expect(within(item).getAllByRole('link')).toHaveLength(1)
      await expect(within(item).getByRole('heading', { level: 3 })).toBeVisible()
      await expect(item).toHaveStyle({ display: 'flex' })
    }
    await expect(within(items[0] as HTMLElement).getByRole('presentation')).toHaveStyle({
      borderTopLeftRadius: '11px',
    })
  },
}

/** Example D: a staff case card in compact density, with a nested card one step down. */
export const NestedCard: Story = {
  name: 'Nested card, compact',
  render: (_args, { globals }) => <CaseCardExample locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    const steps = paddingSteps(canvasElement, { compact: true })
    const outer = cardBy(canvasElement, 'case-card')
    const nested = cardBy(canvasElement, 'nested-card')
    await expectCardLook(outer, 'surface-raised')
    await expectCardLook(nested, 'surface')
    await expect(nested).toHaveStyle({ borderTopLeftRadius: '8px', marginBottom: '0px' })
    // A card in prose gets prose's block spacing, like data-kv-not-prose.
    await expect(nested).toHaveStyle({ marginTop: '32px' })
    await expectPadding(outer.firstElementChild as HTMLElement, steps.md)
    await expectPadding(nested, steps.md)
    // data-kv-prose on the nested card turns prose on inside it again.
    await expect(within(nested).getByRole('heading', { level: 3 })).toHaveStyle({
      fontSize: '18px',
      marginTop: '0px',
    })
  },
}

/** `data-surface` on the Root. A `canvas` card on a `surface` section looks part of the page. */
export const Surfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-card-stage">
        <div className="kv-story-columns">
          {(['surface-raised', 'surface', 'canvas'] as const).map((surface) => (
            <Card.Root key={surface} data-surface={surface} data-testid={surface} lang={lang}>
              <p>
                <code>data-surface="{surface}"</code>
              </p>
              <p>{text.waste.plan}</p>
            </Card.Root>
          ))}
        </div>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    for (const surface of ['surface-raised', 'surface', 'canvas']) {
      await expectCardLook(cardBy(canvasElement, surface), surface)
    }
  },
}

/** `data-radius` on the Root: `md` for a card nested in a card, `none` for a flush card. */
export const Radii: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-columns">
        {(['lg', 'md', 'none'] as const).map((radius) => (
          <Card.Root key={radius} data-radius={radius} data-testid={radius} lang={lang}>
            <p>
              <code>data-radius="{radius}"</code>
            </p>
            <p>{text.waste.plan}</p>
          </Card.Root>
        ))}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    for (const [radius, value] of [
      ['lg', '12px'],
      ['md', '8px'],
      ['none', '0px'],
    ] as const) {
      await expect(cardBy(canvasElement, radius)).toHaveStyle({ borderTopLeftRadius: value })
    }
  },
}

/**
 * `data-padding` on the Root sets every part's padding, and on a part it overrides the Root.
 * All four steps are allowed per part, but mixed steps misalign the parts' edges, so per-part
 * values are normally `none`, for full-bleed media.
 */
export const Padding: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <>
        <div className="kv-story-columns">
          {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
            <Card.Root key={padding} data-padding={padding} data-testid={padding} lang={lang}>
              <p>
                <code>data-padding="{padding}"</code>
              </p>
            </Card.Root>
          ))}
        </div>
        <div className="kv-story-section kv-story-card-column">
          <Card.Root data-padding="sm" data-testid="per-part" lang={lang}>
            <Card.Header data-padding="lg">
              <p>
                <code>Card.Header data-padding="lg"</code>
              </p>
            </Card.Header>
            <Card.Body>
              <p>
                <code>Card.Root data-padding="sm"</code>
              </p>
              <p>{text.waste.plan}</p>
            </Card.Body>
            <Card.Footer data-padding="md" data-kv-button-group="">
              <Button>{text.waste.pause}</Button>
            </Card.Footer>
          </Card.Root>
        </div>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const steps = paddingSteps(canvasElement)
    for (const padding of ['none', 'sm', 'md', 'lg'] as const) {
      await expectPadding(cardBy(canvasElement, padding), steps[padding])
    }
    const [header, body, footer] = [...cardBy(canvasElement, 'per-part').children] as HTMLElement[]
    await expectPadding(header as HTMLElement, steps.lg)
    // Adjacent parts share one padding: the earlier part's.
    const bodyStyle = getComputedStyle(body as HTMLElement)
    await expect(pixels(bodyStyle.paddingBlockStart)).toBe(0)
    await expect(pixels(bodyStyle.paddingInlineStart)).toBe(steps.sm)
    await expect(pixels(getComputedStyle(footer as HTMLElement).paddingInlineStart)).toBe(steps.md)
  },
}

/** `data-dividers`: a hairline between parts, and every part keeps its padding. */
export const Dividers: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-columns">
        <Card.Root data-dividers="" data-testid="dividers" lang={lang}>
          <Card.Header data-kv-prose="">
            <h2>{text.waste.heading}</h2>
          </Card.Header>
          <Card.Body data-kv-prose="">
            <p>{text.waste.plan}</p>
          </Card.Body>
          <Card.Footer data-kv-button-group="">
            <Button>{text.waste.pause}</Button>
          </Card.Footer>
        </Card.Root>
        <Card.Root data-dividers="" data-testid="dividers-after-image" lang={lang}>
          <Card.Header data-padding="none">
            <img src={binsImage} alt="" width={640} height={240} />
          </Card.Header>
          <Card.Body data-kv-prose="">
            <p>{text.waste.plan}</p>
          </Card.Body>
          <Card.Footer data-kv-button-group="">
            <Button>{text.waste.pause}</Button>
          </Card.Footer>
        </Card.Root>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const steps = paddingSteps(canvasElement)
    const [header, body, footer] = [...cardBy(canvasElement, 'dividers').children] as HTMLElement[]
    await expect(header).toHaveStyle({ borderTopWidth: '0px' })
    for (const part of [body, footer] as HTMLElement[]) {
      await expect(part).toHaveStyle({
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: tokenColor(part, 'border-subtle'),
      })
      await expectPadding(part, steps.md)
    }
    const [, bodyAfterImage, footerAfterImage] = [
      ...cardBy(canvasElement, 'dividers-after-image').children,
    ] as HTMLElement[]
    // The image's edge is the boundary already.
    await expect(bodyAfterImage).toHaveStyle({ borderTopWidth: '0px' })
    await expect(footerAfterImage).toHaveStyle({ borderTopWidth: '1px' })
  },
}

/**
 * Prose stops at a card: nothing inside a card in prose is prose-styled, and the card gets
 * prose's block spacing. `data-kv-prose` on a card part turns prose on again inside it, and it
 * stops again at a nested card.
 */
export const ProseAndCards: Story = {
  name: 'Prose and cards',
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    const titles = [text.news.recycling.title, text.news.snow.title] as const
    return (
      <article data-kv-prose="" lang={lang}>
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
          <Card.Body data-kv-prose="">
            <p>{text.waste.plan}</p>
            <ul data-testid="prose-in-card">
              {titles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <Card.Root data-surface="surface" data-radius="md">
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
  play: async ({ canvasElement }) => {
    const card = cardBy(canvasElement, 'card-in-prose')
    await expect(card).toHaveStyle({ marginTop: '32px', marginBottom: '32px' })
    // Browser defaults inside a card in prose: a 40px list indent, not prose's 1.75em (28px).
    await expect(cardBy(canvasElement, 'list-in-card')).toHaveStyle({ paddingInlineStart: '40px' })
    await expect(cardBy(canvasElement, 'prose-in-card')).toHaveStyle({
      paddingInlineStart: '28px',
    })
    await expect(cardBy(canvasElement, 'list-in-nested-card')).toHaveStyle({
      paddingInlineStart: '40px',
    })
  },
}

/** A Root with plain children: it stays a block, so a link in the text stays inline. */
export const PlainChildren: Story = {
  name: 'Root with plain children',
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-card-column">
        <Card.Root data-testid="plain" lang={lang}>
          {text.waste.plan}
        </Card.Root>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const card = cardBy(canvasElement, 'plain')
    await expect(card).toHaveStyle({ display: 'block' })
    await expectPadding(card, paddingSteps(canvasElement).md)
  },
}

/** An image in a padded part, without prose: the theme keeps it inside the part. */
export const ImageInPaddedBody: Story = {
  name: 'Image in a padded body',
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
  play: async ({ canvasElement }) => {
    // A 640px image in a padded part shrinks with the card instead of overflowing (1.4.10).
    const image = cardBy(canvasElement, 'wide-image')
    const body = image.parentElement as HTMLElement
    const bodyStyle = getComputedStyle(body)
    const contentWidth =
      body.clientWidth - pixels(bodyStyle.paddingInlineStart) - pixels(bodyStyle.paddingInlineEnd)
    await expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(contentWidth + 0.5)
    await expectNoHorizontalOverflow(cardBy(canvasElement, 'column'))
  },
}

/**
 * Parts must be direct children of the Root. With a wrapper between them, the Root doesn't
 * see its parts and pads itself too, so the padding doubles. Don't do this.
 */
export const WrapperBetweenParts: Story = {
  name: 'Wrapper between parts',
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-card-column">
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
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const steps = paddingSteps(canvasElement)
    const card = cardBy(canvasElement, 'wrapped')
    await expect(card).toHaveStyle({ display: 'block' })
    await expectPadding(card, steps.md)
    const body = card.querySelector<HTMLElement>('[data-kv="card-body"]')
    await expectPadding(body as HTMLElement, steps.md)
  },
}

export const LongFinnishText: Story = {
  name: 'Long Finnish text',
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <ServiceCardExample locale="fi" />
      <div className="kv-story-section">
        <ContactCardExample locale="fi" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Keskeytä jäteastioiden tyhjennykset' }),
    ).toBeVisible()
    await expect(canvas.getByRole('complementary', { name: 'Ota yhteyttä' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Examples A–D on one page: the fixed theme stories are the contrast gate. */
function Everything({ locale }: { locale: CardFixtureLocale }) {
  return (
    <>
      <div className="kv-story-columns">
        <ServiceCardExample locale={locale} />
        <ContactCardExample locale={locale} />
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

function fixedTheme(theme: FixedStoryTheme, name: string): Story {
  return {
    name,
    globals: { theme },
    render: (_args, { globals }) => <Everything locale={localeOf(globals)} />,
    play: async ({ canvasElement }) => {
      await expectThemeApplied(canvasElement, theme)
      await expectCardLook(cardBy(canvasElement, 'service-card'), 'surface-raised')
      await expectCardLook(
        within(canvasElement).getByRole('complementary', { name: 'Kontakta oss' }),
        'surface',
      )
      await expectCardLook(cardBy(canvasElement, 'nested-card'), 'surface')
      await expect(
        within(canvasElement).getByRole('button', { name: 'Beställ extra tömning' }),
      ).toHaveStyle({ backgroundColor: tokenColor(canvasElement, 'primary') })
    },
  }
}

export const Light: Story = fixedTheme('light', 'Light')
export const Dark: Story = fixedTheme('dark', 'Dark')
export const LightHighContrast: Story = fixedTheme('light-contrast', 'Light, high contrast')
export const DarkHighContrast: Story = fixedTheme('dark-contrast', 'Dark, high contrast')

export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <div className="kv-story-columns">
      <ServiceCardExample locale="en" />
      <ContactCardExample locale="en" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = cardBy(canvasElement, 'service-card')
    // Logical corners: the inline start is the right in RTL. Both top corners are rounded.
    await expect(within(card).getByRole('presentation')).toHaveStyle({
      borderTopRightRadius: '11px',
      borderTopLeftRadius: '11px',
    })
    const primary = within(card).getByRole('button', { name: 'Order an extra collection' })
    const secondary = within(card).getByRole('button', { name: 'Pause collection' })
    if (isViewportAtLeast(canvasElement, '40rem')) {
      // In a row, the primary action comes first: at the inline start, on the right.
      await expect(primary.getBoundingClientRect().right).toBeGreaterThan(
        secondary.getBoundingClientRect().right,
      )
    } else {
      await expect(primary.getBoundingClientRect().top).toBeLessThan(
        secondary.getBoundingClientRect().top,
      )
    }
  },
}

/** The card edge survives forced colours. The e2e suite checks it with real emulation. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <Everything locale={localeOf(globals)} />,
}

/** Without theme.css a card is plain `<div>`s: the package ships no CSS. */
export const Unstyled: Story = {
  globals: { theme: 'none' },
  render: (_args, { globals }) => <ServiceCardExample locale={localeOf(globals)} />,
  play: async ({ canvasElement }) => {
    await expect(isThemeLoaded(canvasElement)).toBe(false)
    const card = cardBy(canvasElement, 'service-card')
    await expect(card).toHaveAttribute('data-kv', 'card')
    await expect(card).toHaveStyle({ display: 'block', borderTopStyle: 'none' })
    await expectPadding(card, 0)
  },
}
