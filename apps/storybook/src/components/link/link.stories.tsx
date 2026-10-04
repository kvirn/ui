import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider, Link } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/link/link.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, waitFor } from 'storybook/test'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
// Package-internal fixture, shared with link.test.tsx. Not part of the public API.
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../../../../../packages/react/src/link/link.fixture.tsx'

// Components/Link: the headless Link, styled by @kvirn-ui/theme/theme.css.
// link.e2e.ts runs its keyboard contract against Default, SamePageLink, CurrentPage, NewTab,
// NewTabNoticeOverrides, RouterLink, OtherLanguage, RTL and ForcedColors, so their play
// functions only read.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

// 2.5.8: a plain list of inline links is about 24px tall per row. The gap keeps each link's
// 24px target circle clear of its neighbours, as a theme would. Link itself ships no CSS.
const linkListStyle: CSSProperties = { display: 'grid', gap: '0.5rem' }

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
            <Link.Root href="#sida-1" current="page">
              {current}
            </Link.Root>
          </li>
          {others.map((item, index) => (
            <li key={item}>
              <Link.Root href={`#sida-${index + 2}`}>{item}</Link.Root>
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
      Du kan <Link.Root href="#ansokan">ansöka om parkeringstillstånd</Link.Root> på webben.
    </p>
  )
}

const meta = {
  title: 'Components/Link',
  component: Link.Root,
  args: { href: '#ansok', children: 'Ansök om bygglov' },
  argTypes: {
    current: {
      control: 'select',
      options: [undefined, 'page', 'step', 'location', 'date', 'time', true],
    },
    target: { control: 'select', options: [undefined, '_blank'] },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  // Library strings follow the locale toolbar, like an app's provider would.
  decorators: [
    (Story, { globals }) => {
      const locale = String(globals['locale'] ?? 'sv')
      return (
        <KvirnProvider locale={locale} messages={catalogs[locale] ?? en}>
          <Story />
        </KvirnProvider>
      )
    },
  ],
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Link.Root>

export default meta
type Story = StoryObj<typeof meta>

/** On its own, a link has the link colour and an underline. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ansök om bygglov' })
    await expect(link).toHaveAttribute('href', '#ansok')
    await expect(link).toHaveClass('kv-link')
  },
}

/** A link to a heading on the same page: Enter moves there. */
export const SamePageLink: Story = {
  render: (args) => (
    <>
      <p>
        <Link.Root {...args} />
      </p>
      <h2 id="ansok">Ansök</h2>
    </>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ansök om bygglov' })
    await expect(link).toHaveAttribute('href', '#ansok')
    await expect(link).not.toHaveAttribute('aria-current')
  },
}

/**
 * The fixture the keyboard tests drive: two links. Try the keys in the Keyboard section above:
 * Tab and Shift+Tab move between the links, and Enter follows the focused one.
 */
export const Keyboard: Story = {
  render: (args) => (
    <>
      <p>
        <Link.Root {...args} />
      </p>
      <p>
        <Link.Root href="#kontakt">Kontakta oss</Link.Root>
      </p>
    </>
  ),
}

/** In a sentence, a link is told apart by its underline, not colour alone (1.4.1). */
export const InRunningText: Story = {
  render: () => <RunningTextLink />,
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })
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
            <Link.Root href="#start">Start</Link.Root>
          </li>
          <li>
            <Link.Root href="#ansok" current="page">
              Ansök
            </Link.Root>
          </li>
          <li>
            <Link.Root href="#kontakt">Kontakt</Link.Root>
          </li>
        </ul>
      </nav>
    </div>
  ),
  play: async ({ canvas }) => {
    const current = canvas.getByRole('link', { name: 'Ansök' })
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current).toHaveAttribute('data-current', '')
    const weightOf = (link: HTMLElement) => Number(getComputedStyle(link).fontWeight)
    for (const name of ['Start', 'Kontakt']) {
      const link = canvas.getByRole('link', { name })
      await expect(link).not.toHaveAttribute('aria-current')
      await expect(link).not.toHaveAttribute('data-current')
      // The current page isn't shown by colour alone (1.4.1): it's also heavier.
      await expect(weightOf(current)).toBeGreaterThan(weightOf(link))
    }
  },
}

/** `target="_blank"` with a visible NewTabNotice, in the provider's language. */
export const NewTab: Story = {
  args: {
    href: 'https://www.digg.se/',
    target: '_blank',
    children: (
      <>
        Digg <Link.NewTabNotice />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Digg (öppnas i en ny flik)' })
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

/** Instance `messages` beat the provider, and children beat every message. */
export const NewTabNoticeOverrides: Story = {
  render: () => (
    <ul style={linkListStyle}>
      <li>
        <Link.Root
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(öppnas i nytt fönster)' }}
        >
          Digg <Link.NewTabNotice />
        </Link.Root>
      </li>
      <li>
        <Link.Root href="https://www.riksdagen.se/" target="_blank">
          Riksdagen <Link.NewTabNotice>(extern länk, ny flik)</Link.NewTabNotice>
        </Link.Root>
      </li>
    </ul>
  ),
  play: async ({ canvas }) => {
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
            <Link.Root href="/start" current={pathname === '/start' ? 'page' : false}>
              Start
            </Link.Root>
          </li>
          <li>
            <Link.Root href="/ansok" current={pathname === '/ansok' ? 'page' : false}>
              Ansök
            </Link.Root>
          </li>
        </ul>
      </nav>
      <p>Nuvarande sida: {pathname}</p>
    </>
  )
}

/** The provider's registered router link renders every Link. A mock router here. */
export const RouterLink: Story = {
  render: () => (
    <KvirnProvider linkComponent={mockRouterLinkComponent}>
      <MockRouterProvider initialPathname="/start">
        <RouterNavigation />
      </MockRouterProvider>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    const start = canvas.getByRole('link', { name: 'Start' })
    await expect(start).toHaveAttribute('data-router-link', '')
    await expect(start).toHaveAttribute('aria-current', 'page')
  },
}

/** Each link is in its own language, and says so with `lang` and `hrefLang` (3.1.2). */
export const OtherLanguage: Story = {
  render: () => (
    <ul className="kv-story-inline-list">
      <li>
        <Link.Root href="#fi" lang="fi" hrefLang="fi">
          Suomeksi
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#sv" lang="sv" hrefLang="sv">
          På svenska
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#se" lang="se" hrefLang="se">
          Sámegillii
        </Link.Root>
      </li>
    </ul>
  ),
  play: async ({ canvas }) => {
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

/** Keyboard focus shows a 2px ring, in running text and in navigation (2.4.7, 2.4.13). */
export const FocusVisible: Story = {
  render: () => (
    <>
      <RunningTextLink />
      <Navigation />
    </>
  ),
  play: async ({ canvas, userEvent }) => {
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

/** A long Finnish link wraps inside a narrow column instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  args: {
    href: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
    target: '_blank',
    children: (
      <>
        Lue saavutettavuusohjeet <Link.NewTabNotice />
      </>
    ),
  },
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <p>
          <Story />
        </p>
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', {
        name: 'Lue saavutettavuusohjeet (avautuu uuteen välilehteen)',
      }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** `kv-compact` navigation: items stay at least 24 × 24 (2.5.8). */
export const CompactNavigation: Story = {
  render: () => <Navigation density="compact" />,
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link')
    for (const link of links) {
      await expectMinimumTargetSize(link)
    }
    await expect(links[0]).toHaveAttribute('aria-current', 'page')
  },
}

/** Right to left, in English: the notice and the navigation follow `dir`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <>
      <p>
        <Link.Root href="#apply">Apply for a parking permit</Link.Root>{' '}
        <Link.Root href="https://www.digg.se/" target="_blank">
          Digg <Link.NewTabNotice />
        </Link.Root>
      </p>
      <Navigation label="Parking permits" items={['Overview', 'Apply', 'Contact us']} />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Digg (opens in a new tab)' })).toBeVisible()
  },
}

/** Every link style with the forced-colors marker. The e2e suite checks it with real emulation. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <>
      <p>
        Läs mer om <Link.Root href="#parkering">parkering</Link.Root>.
      </p>
      <nav aria-label="Huvudmeny">
        <ul className="kv-nav">
          <li>
            <Link.Root href="#start">Start</Link.Root>
          </li>
          <li>
            <Link.Root href="#ansok" current="page">
              Ansök
            </Link.Root>
          </li>
          <li>
            <Link.Root href="https://www.digg.se/" target="_blank">
              Digg <Link.NewTabNotice />
            </Link.Root>
          </li>
        </ul>
      </nav>
    </>
  ),
}
