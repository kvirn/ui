import { Button, Link, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/prose/prose.a11y.md?raw'
import guide from '../../../../../packages/react/src/prose/prose.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { expect, within } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { ProseArticle, articleFor, updatedDate } from '../../foundation/foundations.fixture.tsx'
import type { FixtureLocale } from '../../foundation/foundations.fixture.tsx'
import {
  caseNumberSample,
  fixtureLocaleOf,
  requireElement,
} from '../../foundation/typography-helpers.tsx'

// Components/Prose: the headless Prose, styled by @kvirn-ui/theme (docs/design/foundations-and-prose.md
// §6.1–6.6 and §7). The Default story is the small example. The others put kv-prose on the fixture
// article, a municipality's guidance page that uses every element prose styles. The article follows
// the Locale toolbar: sv, nb, nn and en are written, and fi and se show the English article marked
// lang="en". Prose has no focusable part, so there's no Keyboard story.

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

/** The article in a page, as an adopter would put it. */
function ArticlePage({
  locale,
  size,
  className,
}: {
  locale: FixtureLocale
  size?: 'large'
  className?: string
}): ReactNode {
  return (
    <main className={className}>
      <ProseArticle locale={locale} size={size} />
    </main>
  )
}

const surfaces: readonly { name: string; className: string; style?: CSSProperties }[] = [
  {
    name: 'On surface',
    className: 'kv-story-panel',
    style: { backgroundColor: 'var(--kv-color-surface)' },
  },
  {
    name: 'On surface-raised',
    className: 'kv-story-panel',
    style: { backgroundColor: 'var(--kv-color-surface-raised)' },
  },
  {
    name: 'On a warning panel (warning-subtle, with a warning bar)',
    className: 'kv-story-panel kv-story-warning-panel',
  },
]

/**
 * Short prose blocks on surface, surface-raised and a warning panel: the link, muted text,
 * code and blockquote bar on each background (§6.5). The surface names are English
 * maintainer text; the prose is fixture text in the locale.
 */
function SurfacePanels({ locale }: { locale: FixtureLocale }): ReactNode {
  const { text, lang } = articleFor(locale)
  const contentLang = lang ?? locale
  const date = new Intl.DateTimeFormat(contentLang, { dateStyle: 'long' })
  const ids = useId()
  return (
    <div className="kv-story-columns" lang="en">
      {surfaces.map((surface, index) => (
        <div key={surface.name}>
          <h2 id={`${ids}-${index}`}>{surface.name}</h2>
          <section
            lang={contentLang}
            className={`${surface.className} kv-prose`}
            style={surface.style}
            aria-labelledby={`${ids}-${index}`}
          >
            <h3>{text.paper.heading}</h3>
            <p>{text.paper.text}</p>
            <p>{text.caseNumber(<code>{caseNumberSample}</code>)}</p>
            <blockquote>
              <p>{text.quote}</p>
            </blockquote>
            <p>
              {text.contact.body((linkText) => (
                <a href="https://kvirnby.example/e-tjanst">{linkText}</a>
              ))}
            </p>
            <p>
              <small>
                {text.updated(<time dateTime="2026-09-14">{date.format(updatedDate)}</time>)}
              </small>
            </p>
          </section>
        </div>
      ))}
    </div>
  )
}

function SurfacesPage({ locale }: { locale: FixtureLocale }): ReactNode {
  return (
    <main>
      <h1 lang="en">Prose on surfaces</h1>
      <SurfacePanels locale={locale} />
    </main>
  )
}

const articleOf = (canvasElement: HTMLElement) => requireElement(canvasElement, 'article.kv-prose')

/** The wide table is in a labelled, focusable region (2.1.1, 1.4.10). */
async function expectScrollRegion(canvasElement: HTMLElement, caption: string) {
  const region = within(canvasElement).getByRole('region', { name: caption })
  await expect(region).toHaveAttribute('tabindex', '0')
}

/** The fixture in the toolbar locale, at the default 16px size. */
export const Article: Story = {
  render: (_args, { globals }) => <ArticlePage locale={fixtureLocaleOf(globals['locale'])} />,
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
  render: (_args, { globals }) => (
    <ArticlePage locale={fixtureLocaleOf(globals['locale'])} size="large" />
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
  render: () => (
    <>
      {sizes.map(({ modifier, label }) => (
        <Prose
          key={label}
          className={modifier}
          data-testid={label}
          style={{ marginBlockEnd: '3rem' }}
        >
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
  render: (_args, { globals }) => (
    <>
      <ArticlePage locale={fixtureLocaleOf(globals['locale'])} />
      <Prose>
        <p>
          A <mark>highlight</mark> loses its background in forced colours.
        </p>
      </Prose>
    </>
  ),
}

/** `--full` fills its container, and a colour role is set on the block alone. */
export const FullWidthAndRoles: Story = {
  name: 'Full width and colour roles',
  render: () => (
    <Prose
      className="kv-prose--full"
      data-testid="full"
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
  render: () => <ArticlePage locale="en" />,
}

/** WCAG 1.4.12's overrides, as a user's bookmarklet sets them: nothing clips or overlaps. */
export const TextSpacing: Story = {
  name: 'Text spacing',
  render: (_args, { globals }) => (
    <ArticlePage locale={fixtureLocaleOf(globals['locale'])} className="kv-story-text-spacing" />
  ),
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

export const OnSurfaces: Story = {
  name: 'On surfaces',
  render: (_args, { globals }) => <SurfacesPage locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement }) => {
    // One named region per surface.
    await expect(within(canvasElement).getAllByRole('region')).toHaveLength(surfaces.length)
  },
}

const notProseText = {
  title: 'Components inside prose',
  intro:
    'Prose never styles a component part, such as kv-button or kv-link, so KvirnUI components keep their own look anywhere in an article. kv-nav and kv-button-group are never prose either. Wrap anything else prose shouldn’t touch, such as a card or your own widget, in kv-not-prose: it then only gets prose’s block spacing.',
  without: 'Without kv-not-prose',
  with: 'With kv-not-prose',
  link: 'read the guidance on housing adaptation',
  linkSentence: 'Before you apply, ',
  navigation: ['Apply', 'Your cases', 'Contact'] as const,
  apply: 'Apply online',
  saveDraft: 'Save draft',
  proseList: 'This list is in prose, so it gets prose’s markers and indent.',
  plainList: 'This list is inside kv-not-prose, so it keeps the browser’s own style.',
}

/** A running-text Link, a navigation list and a button group: the components' own look. */
function ComponentSamples({ navigationLabel }: { navigationLabel: string }): ReactNode {
  return (
    <>
      <p>
        {notProseText.linkSentence}
        <Link.Root href="#guidance">{notProseText.link}</Link.Root>.
      </p>
      <nav aria-label={navigationLabel}>
        <ul className="kv-nav">
          {notProseText.navigation.map((item) => (
            <li key={item}>
              <Link.Root href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</Link.Root>
            </li>
          ))}
        </ul>
      </nav>
      <div className="kv-button-group">
        <Button className="kv-button--primary">{notProseText.apply}</Button>
        <Button>{notProseText.saveDraft}</Button>
      </div>
    </>
  )
}

function NotProsePage(): ReactNode {
  return (
    <main lang="en">
      <article className="kv-prose">
        <h1>{notProseText.title}</h1>
        <p>{notProseText.intro}</p>
        <section aria-labelledby="not-prose-without">
          <h2 id="not-prose-without">{notProseText.without}</h2>
          <ComponentSamples navigationLabel={`Example navigation, ${notProseText.without}`} />
          <ul>
            <li>{notProseText.proseList}</li>
          </ul>
        </section>
        <section aria-labelledby="not-prose-with">
          <h2 id="not-prose-with">{notProseText.with}</h2>
          <div className="kv-not-prose">
            <ComponentSamples navigationLabel={`Example navigation, ${notProseText.with}`} />
            <ul>
              <li>{notProseText.plainList}</li>
            </ul>
          </div>
        </section>
      </article>
    </main>
  )
}

/** Components look the same with and without kv-not-prose. Maintainer text, in English. */
export const NotProse: Story = {
  name: 'Not prose',
  globals: { locale: 'en' },
  render: () => <NotProsePage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const without = within(canvas.getByRole('region', { name: notProseText.without }))
    const withNotProse = within(canvas.getByRole('region', { name: notProseText.with }))
    for (const section of [without, withNotProse]) {
      // Prose doesn't shrink the components inside it below 24 × 24 (2.5.8).
      for (const control of [
        ...section.getAllByRole('button'),
        ...notProseText.navigation.map((name) => section.getByRole('link', { name })),
      ]) {
        const { width, height } = control.getBoundingClientRect()
        await expect(width).toBeGreaterThanOrEqual(24)
        await expect(height).toBeGreaterThanOrEqual(24)
      }
      await expect(section.getByRole('link', { name: notProseText.link })).toBeVisible()
    }
  },
}
