import { Link, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/prose/prose.a11y.md?raw'
import guide from '../../../../../packages/react/src/prose/prose.md?raw'
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { articleFor } from '../../foundation/foundations.fixture.tsx'
import { fixtureLocaleOf, requireElement } from '../../foundation/typography-helpers.tsx'
import {
  ComponentsInProse,
  GuidanceArticle,
  HighlightProse,
  ProseOnSurfaces,
} from './prose.fixture.tsx'

// Components/Prose: the headless Prose, styled by @kvirn-ui/theme (docs/design/foundations-and-prose.md
// §6.1–6.6 and §7). The Default story is the small example. The others put `<Prose>` around the
// fixture article, a municipality's guidance page that uses every element prose styles. The article
// follows the Locale toolbar: sv, nb, nn and en are written, and fi and se show the English article
// marked lang="en". Prose has no focusable part, so there's no Keyboard story. The articles are
// fixtures (prose.fixture.tsx) that the stories show with `showSource`: the `<main>` landmark a page
// puts around them is a decorator.

/** A page's landmark around the article: a decorator, so it isn't part of the code shown. */
const inMain: Decorator = (Story) => (
  <main>
    <Story />
  </main>
)

const meta = {
  title: 'Components/Prose',
  component: Prose,
  args: {
    children: (
      <>
        <h2>Kontakta oss</h2>
        <p>Vi svarar vardagar 9–16.</p>
        <p>
          <Link.Root href="#epost">Mejla kundcenter</Link.Root>
        </p>
      </>
    ),
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Your own classes, added to `kv-prose`. The theme styles `kv-prose--large`.',
    },
    render: { control: false },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

/** A heading, a paragraph and a link: a `<div>`, so it adds no landmark. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2, name: 'Kontakta oss' })
    await expect(heading.closest('.kv-prose')).not.toBeNull()
    await expect(canvas.queryByRole('article')).toBeNull()
  },
}

const articleOf = (canvasElement: HTMLElement) => requireElement(canvasElement, 'article.kv-prose')

/** The wide table is in a labelled, focusable region (2.1.1, 1.4.10). */
async function expectScrollRegion(canvasElement: HTMLElement, caption: string) {
  const region = within(canvasElement).getByRole('region', { name: caption })
  await expect(region).toHaveAttribute('tabindex', '0')
}

/** The fixture in the toolbar locale, at the default 16px size. */
export const Article: Story = {
  decorators: [inMain],
  parameters: showSource('prose/prose.fixture.tsx', 'GuidanceArticle'),
  render: (_args, { globals }) => <GuidanceArticle locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement, globals }) => {
    const { text, lang } = articleFor(fixtureLocaleOf(globals['locale']))
    const canvas = within(canvasElement)
    const article = articleOf(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(text.title)
    await expect(article.getAttribute('lang') ?? undefined).toBe(lang)
    await expectScrollRegion(canvasElement, text.times.caption)
  },
}

/** `kv-prose kv-prose--large`: the body-large role, for long resident-facing text. */
export const Large: Story = {
  decorators: [inMain],
  parameters: showSource('prose/prose.fixture.tsx', 'GuidanceArticle'),
  render: (_args, { globals }) => (
    <GuidanceArticle locale={fixtureLocaleOf(globals['locale'])} className="kv-prose--large" />
  ),
}

const sizes = [
  { modifier: undefined, label: 'kv-prose' },
  { modifier: 'kv-prose--small', label: 'kv-prose--small' },
  { modifier: 'kv-prose--large', label: 'kv-prose--large' },
  { modifier: 'kv-prose--xl', label: 'kv-prose--xl' },
  { modifier: 'kv-prose--2xl', label: 'kv-prose--2xl' },
] as const

/**
 * The sizes of Tailwind's typography plugin, by token swap: `--small` (14px, for notes and
 * metadata, never for what a resident must read), the default, `--large`, `--xl` and `--2xl`.
 * Headings keep their type roles, and `--xl` and `--2xl` step down below 40rem. `--full` lifts
 * the 70ch measure, like `max-w-none`.
 */
export const Sizes: Story = {
  // Space between the blocks, so each size reads on its own.
  decorators: [
    (Story) => (
      <>
        <style>{`
.kv-story-prose-stack > .kv-prose {
  margin-block-end: 3rem;
}
`}</style>
        <div className="kv-story-prose-stack">
          <Story />
        </div>
      </>
    ),
  ],
  render: () => (
    <>
      {sizes.map(({ modifier, label }) => (
        <Prose key={label} className={modifier}>
          <h2>{label}</h2>
          <p className="kv-lead">Vi svarar vardagar 9–16.</p>
          <p>
            Skicka in ansökan senast den 1 mars. Du får beslut inom <strong>fyra veckor</strong>.
          </p>
          <ul>
            <li>Personbevis</li>
            <li>Kopia av hyresavtal</li>
          </ul>
        </Prose>
      ))}
    </>
  ),
}

/**
 * Forced colours: the table rules, the quote bar and the rule stay borders, and a `mark` loses its
 * background and gets an outline. The e2e suite checks them with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  decorators: [inMain],
  parameters: showSource('prose/prose.fixture.tsx', 'GuidanceArticle', 'HighlightProse'),
  render: (_args, { globals }) => (
    <>
      <GuidanceArticle locale={fixtureLocaleOf(globals['locale'])} />
      <HighlightProse />
    </>
  ),
}

/** `--full` fills its container, and a colour role is set on the block alone. */
export const FullWidthAndRoles: Story = {
  name: 'Full width and colour roles',
  render: () => (
    <Prose
      className="kv-prose--full"
      style={{ ['--kv-prose-color-links' as string]: 'var(--kv-color-text)' }}
    >
      <p>
        <Link.Root href="#epost">Mejla kundcenter</Link.Root>, or a link in prose:{' '}
        <a href="#epost">Mejla kundcenter</a>
      </p>
    </Prose>
  ),
}

/** Logical properties only: markers, indents and the blockquote bar follow `dir`. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: { dir: 'rtl', locale: 'en' },
  decorators: [inMain],
  parameters: showSource('prose/prose.fixture.tsx', 'GuidanceArticle'),
  render: () => <GuidanceArticle locale="en" />,
}

/** WCAG 1.4.12's overrides, as a user's bookmarklet sets them: nothing clips or overlaps. */
export const TextSpacing: Story = {
  name: 'Text spacing',
  // The overrides sit on the page, as a bookmarklet or a user stylesheet would set them.
  decorators: [
    (Story) => (
      <main className="kv-story-text-spacing">
        <Story />
      </main>
    ),
  ],
  parameters: showSource('prose/prose.fixture.tsx', 'GuidanceArticle'),
  render: (_args, { globals }) => <GuidanceArticle locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement }) => {
    const article = articleOf(canvasElement)
    // No horizontal overflow: long words, code and pre wrap, and the table scrolls in its region.
    await expect(article.scrollWidth).toBeLessThanOrEqual(article.clientWidth)
    // No text container has a fixed height that cuts the larger spacing off.
    for (const element of article.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, li, dd')) {
      await expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight + 1)
    }
  },
}

/** Prose on surface, surface-raised and a warning panel: one named region per surface. */
export const OnSurfaces: Story = {
  name: 'On surfaces',
  // The page: a heading, and a grid that holds the three panels.
  decorators: [
    (Story) => (
      <main>
        <h1 lang="en">Prose on surfaces</h1>
        <div className="kv-story-columns" lang="en">
          <Story />
        </div>
      </main>
    ),
  ],
  parameters: showSource('prose/prose.fixture.tsx', 'ProseOnSurfaces'),
  render: (_args, { globals }) => <ProseOnSurfaces locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement }) => {
    // One named region per surface.
    await expect(within(canvasElement).getAllByRole('region')).toHaveLength(3)
  },
}

/** The names the Not prose story's play looks for: the section headings, a link and the navigation. */
const notProseLabels = {
  without: 'Without kv-not-prose',
  with: 'With kv-not-prose',
  link: 'read the guidance on housing adaptation',
  navigation: ['Apply', 'Your cases', 'Contact'] as const,
}

/** Components look the same with and without kv-not-prose. Maintainer text, in English. */
export const NotProse: Story = {
  name: 'Not prose',
  globals: { locale: 'en' },
  decorators: [
    (Story) => (
      <main lang="en">
        <Story />
      </main>
    ),
  ],
  parameters: showSource('prose/prose.fixture.tsx', 'ComponentsInProse'),
  render: () => <ComponentsInProse />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const without = within(canvas.getByRole('region', { name: notProseLabels.without }))
    const withNotProse = within(canvas.getByRole('region', { name: notProseLabels.with }))
    for (const section of [without, withNotProse]) {
      // Prose doesn't shrink the components inside it below 24 × 24 (2.5.8).
      for (const control of [
        ...section.getAllByRole('button'),
        ...notProseLabels.navigation.map((name) => section.getByRole('link', { name })),
      ]) {
        const { width, height } = control.getBoundingClientRect()
        await expect(width).toBeGreaterThanOrEqual(24)
        await expect(height).toBeGreaterThanOrEqual(24)
      }
      await expect(section.getByRole('link', { name: notProseLabels.link })).toBeVisible()
    }
  },
}
