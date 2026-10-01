import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider, Link } from '@kvirn-ui/react'
import type { LinkProps } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  expectMinimumTargetSize,
  expectNoHorizontalOverflow,
  expectThemeApplied,
} from '../theme-story-assertions.ts'
import type { FixedStoryTheme } from '../theme-story-assertions.ts'
// Package-internal fixture, shared with link.test.tsx. Not part of the public API.
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../../../../../packages/react/src/link/link.fixture.tsx'

// Components/Link: the headless Link, styled by @kvirn-ui/theme/theme.css from the Storybook
// preview (ADR-0013).
// Default is the playground: one Link, with every prop as a control.
// link.e2e.ts runs its keyboard contract against SamePageLink, CurrentPage, NewTab,
// NewTabNoticeOverrides, RouterLink, OtherLanguage, RTL and ForcedColors, so their play
// functions only read.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

// 2.5.8: a plain list of inline links is about 24px tall per row. The gap keeps each link's
// 24px target circle clear of its neighbours, as a theme would. Link itself ships no CSS.
const linkListStyle: CSSProperties = { display: 'grid', gap: '0.5rem' }

const guidelinesUrl = 'https://www.w3.org/WAI/standards-guidelines/wcag/'

/** A labelled navigation list: `kv-nav` turns its links into navigation items. */
function Navigation({
  label = 'Parkeringstillstånd',
  items = ['Översikt', 'Ansök', 'Kontakta oss'],
  density,
}: {
  label?: string
  items?: readonly [string, string, string]
  density?: 'compact' | undefined
}) {
  const [current, ...others] = items
  return (
    <div className={density === 'compact' ? 'kv-story-surface kv-compact' : 'kv-story-surface'}>
      <nav aria-label={label}>
        <ul className="kv-nav">
          <li>
            <Link href="#sida-1" current="page">
              {current}
            </Link>
          </li>
          {others.map((item, index) => (
            <li key={item}>
              <Link href={`#sida-${index + 2}`}>{item}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function RunningTextLink() {
  return (
    <p>
      Du kan <Link href="#ansokan">ansöka om parkeringstillstånd</Link> på webben.
    </p>
  )
}

/** The notice is visible and part of the link's name, in the provider's language. */
function NewTabLink({ text = 'Läs riktlinjerna för tillgänglighet' }: { text?: string }) {
  return (
    <p>
      <Link href={guidelinesUrl} target="_blank">
        {text} <Link.NewTabNotice />
      </Link>
    </p>
  )
}

const meta = {
  title: 'Components/Link',
  component: Link,
  globals: { locale: 'sv' },
  // Library strings follow the locale toolbar, like an app's provider would.
  decorators: [
    (Story, context) => {
      const locale = String(context.globals['locale'] ?? 'sv')
      return (
        <KvirnProvider locale={locale} messages={catalogs[locale] ?? en}>
          <main>
            <h1>Link</h1>
            <Story />
          </main>
        </KvirnProvider>
      )
    },
  ],
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

interface LinkPlaygroundArgs extends LinkProps {
  /** Story-only: puts `<Link.NewTabNotice />` inside the link. Needed with `target="_blank"`. */
  newTabNotice: boolean
}

/** One Link, with a NewTabNotice when the control asks for one. */
function LinkPlayground({ newTabNotice, children, ...linkProps }: LinkPlaygroundArgs) {
  return (
    <p>
      <Link {...linkProps}>
        {children}
        {newTabNotice ? (
          <>
            {' '}
            <Link.NewTabNotice />
          </>
        ) : null}
      </Link>
    </p>
  )
}

/** One Link with its whole API as controls. */
export const Default: StoryObj<typeof LinkPlayground> = {
  render: (args) => <LinkPlayground {...args} />,
  args: {
    href: '#ansok',
    children: 'Ansök om bygglov',
    current: undefined,
    target: undefined,
    newTabNotice: false,
    hrefLang: undefined,
    lang: undefined,
    className: undefined,
    messages: { newTabNotice: '(öppnas i en ny flik)' },
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text', description: 'The link text.' },
    current: {
      control: 'select',
      options: [undefined, 'page', 'step', 'location', 'date', 'time', true],
      description: 'Sets `aria-current` and `data-current`.',
    },
    target: {
      control: 'select',
      options: [undefined, '_blank'],
      description: '`_blank` adds `rel="noopener noreferrer"`. Add a NewTabNotice too.',
    },
    newTabNotice: {
      control: 'boolean',
      description: 'Not a prop: renders `<Link.NewTabNotice />` inside the link.',
    },
    hrefLang: { control: 'text' },
    lang: { control: 'text' },
    className: { control: 'text', description: 'Your own classes, added to `kv-link`.' },
    messages: { control: 'object', description: 'Per-instance message overrides (ADR-0007).' },
    render: { control: false },
  },
  parameters: {
    controls: {
      include: [
        'href',
        'children',
        'current',
        'target',
        'newTabNotice',
        'hrefLang',
        'lang',
        'className',
        'messages',
        'render',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Ansök om bygglov' })
    await expect(link).toHaveAttribute('href', '#ansok')
    await expect(link).toHaveClass('kv-link')
  },
}

/** On its own, a link has the link colour and an underline. */
export const SamePageLink: Story = {
  name: 'Same-page link',
  render: () => (
    <>
      <p>
        <Link href="#ansok">Ansök om bygglov</Link>
      </p>
      <h2 id="ansok">Ansök</h2>
    </>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Ansök om bygglov' })
    await expect(link).toHaveAttribute('href', '#ansok')
    await expect(link).not.toHaveAttribute('aria-current')
  },
}

export const InRunningText: Story = {
  name: 'In running text',
  render: () => <RunningTextLink />,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    // A link in running text isn't told apart by colour alone (1.4.1): it's underlined.
    await expect(getComputedStyle(link).textDecorationLine).toContain('underline')
    await expect(link.closest('p')).toHaveTextContent(
      'Du kan ansöka om parkeringstillstånd på webben.',
    )
  },
}

/** Inside `kv-nav` the current page gets a background, a bar and weight. */
export const CurrentPage: Story = {
  render: () => (
    <div className="kv-story-surface">
      <nav aria-label="Huvudmeny">
        <ul className="kv-nav">
          <li>
            <Link href="#start">Start</Link>
          </li>
          <li>
            <Link href="#ansok" current="page">
              Ansök
            </Link>
          </li>
          <li>
            <Link href="#kontakt">Kontakt</Link>
          </li>
        </ul>
      </nav>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const current = within(canvasElement).getByRole('link', { name: 'Ansök' })
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current).toHaveAttribute('data-current', '')
    const weightOf = (link: HTMLElement) => Number(getComputedStyle(link).fontWeight)
    for (const name of ['Start', 'Kontakt']) {
      const link = within(canvasElement).getByRole('link', { name })
      await expect(link).not.toHaveAttribute('aria-current')
      await expect(link).not.toHaveAttribute('data-current')
      // The current page isn't shown by colour alone (1.4.1): it's also heavier.
      await expect(weightOf(current)).toBeGreaterThan(weightOf(link))
    }
  },
}

export const NewTab: Story = {
  render: () => (
    <p>
      <Link href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Digg (öppnas i en ny flik)' })
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/** ADR-0007: instance `messages` beat the provider, and children beat every message. */
export const NewTabNoticeOverrides: Story = {
  render: () => (
    <ul style={linkListStyle}>
      <li>
        <Link
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(öppnas i nytt fönster)' }}
        >
          Digg <Link.NewTabNotice />
        </Link>
      </li>
      <li>
        <Link href="https://www.riksdagen.se/" target="_blank">
          Riksdagen <Link.NewTabNotice>(extern länk, ny flik)</Link.NewTabNotice>
        </Link>
      </li>
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Digg (öppnas i nytt fönster)' })).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Riksdagen (extern länk, ny flik)' }),
    ).toBeVisible()
  },
}

function RouterNavigation() {
  const pathname = useMockPathname()
  return (
    <>
      <nav aria-label="Huvudmeny">
        <ul className="kv-nav">
          <li>
            <Link href="/start" current={pathname === '/start' ? 'page' : false}>
              Start
            </Link>
          </li>
          <li>
            <Link href="/ansok" current={pathname === '/ansok' ? 'page' : false}>
              Ansök
            </Link>
          </li>
        </ul>
      </nav>
      <p>Nuvarande sida: {pathname}</p>
    </>
  )
}

/** The provider's registered router link renders every Link (ADR-0005). A mock router here. */
export const RouterLink: Story = {
  render: () => (
    <KvirnProvider linkComponent={mockRouterLinkComponent}>
      <MockRouterProvider initialPathname="/start">
        <RouterNavigation />
      </MockRouterProvider>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    const start = within(canvasElement).getByRole('link', { name: 'Start' })
    await expect(start).toHaveAttribute('data-router-link', '')
    await expect(start).toHaveAttribute('aria-current', 'page')
  },
}

/** Each link is in its own language, and says so with `lang` and `hrefLang` (3.1.2). */
export const OtherLanguage: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      <li>
        <Link href="#fi" lang="fi" hrefLang="fi">
          Suomeksi
        </Link>
      </li>
      <li>
        <Link href="#sv" lang="sv" hrefLang="sv">
          På svenska
        </Link>
      </li>
      <li>
        <Link href="#se" lang="se" hrefLang="se">
          Sámegillii
        </Link>
      </li>
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const [name, language] of [
      ['Suomeksi', 'fi'],
      ['På svenska', 'sv'],
      ['Sámegillii', 'se'],
    ] as const) {
      const link = canvas.getByRole('link', { name })
      await expect(link).toHaveAttribute('lang', language)
      await expect(link).toHaveAttribute('hreflang', language)
    }
  },
}

export const FocusVisible: Story = {
  name: 'Focus visible',
  render: () => (
    <>
      <RunningTextLink />
      <Navigation />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inText = canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await userEvent.tab()
    await expect(inText).toHaveFocus()
    await waitFor(() => expect(inText).toHaveAttribute('data-focus-visible'))
    await expect(inText).toHaveStyle({ outlineWidth: '2px', outlineStyle: 'solid' })
    const navigationItem = canvas.getByRole('link', { name: 'Översikt' })
    await userEvent.tab()
    await expect(navigationItem).toHaveFocus()
    await expect(navigationItem).toHaveStyle({ outlineWidth: '2px', outlineStyle: 'solid' })
  },
}

export const LongFinnishText: Story = {
  name: 'Long Finnish text',
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <NewTabLink text="Lue saavutettavuusohjeet" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', {
        name: 'Lue saavutettavuusohjeet (avautuu uuteen välilehteen)',
      }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

export const CompactNavigation: Story = {
  name: 'Compact navigation',
  render: () => <Navigation density="compact" />,
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole('link')
    // Compact navigation items are still at least 24 × 24 (2.5.8).
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await expect(links[0]).toHaveAttribute('aria-current', 'page')
  },
}

/** Every link style on one page: the fixed theme stories are the contrast gate. */
function Everything() {
  return (
    <>
      <div className="kv-story-section">
        <RunningTextLink />
      </div>
      <div className="kv-story-section">
        <Navigation />
      </div>
      <div className="kv-story-section">
        <NewTabLink />
      </div>
      <div className="kv-story-section">
        <Navigation
          label="Personal"
          items={['Ärenden', 'Kalender', 'Inställningar']}
          density="compact"
        />
      </div>
    </>
  )
}

function fixedTheme(theme: FixedStoryTheme, name: string): Story {
  return {
    name,
    globals: { theme },
    render: () => <Everything />,
    play: async ({ canvasElement }) => {
      await expectThemeApplied(canvasElement, theme)
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
    <>
      <p>
        <Link href="#apply">Apply for a parking permit</Link>{' '}
        <Link href="https://www.digg.se/" target="_blank">
          Digg <Link.NewTabNotice />
        </Link>
      </p>
      <Navigation label="Parking permits" items={['Overview', 'Apply', 'Contact us']} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Digg (opens in a new tab)' })).toBeVisible()
  },
}

export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <>
      <p>
        Läs mer om <Link href="#parkering">parkering</Link>.
      </p>
      <nav aria-label="Huvudmeny">
        <ul className="kv-nav">
          <li>
            <Link href="#start">Start</Link>
          </li>
          <li>
            <Link href="#ansok" current="page">
              Ansök
            </Link>
          </li>
          <li>
            <Link href="https://www.digg.se/" target="_blank">
              Digg <Link.NewTabNotice />
            </Link>
          </li>
        </ul>
      </nav>
    </>
  ),
}
