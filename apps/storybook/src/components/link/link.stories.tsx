import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { Icon, KvirnProvider, Link, Navigation } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/link/link.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { showSource } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { AppRoot, RoutedNavigation } from './link.fixture.tsx'

// Components/Link: the headless Link, styled by @kvirn-ui/theme/theme.css.
// link.e2e.ts runs its keyboard contract against Default, SamePageLink, CurrentPage, NewTab,
// NewTabNoticeOverrides, RouterLink, OtherLanguage, RTL and ForcedColors, so their play
// functions only read.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

const meta = {
  title: 'Components/Link',
  component: Link.Root,
  args: { href: '#ansok', children: 'Ansök om bygglov' },
  argTypes: {
    className: {
      control: 'select',
      options: [undefined, 'kv-link--service'],
      description:
        'Joins `kv-link`. The theme styles `kv-link--service`: the one link per view that starts an e-service. Put a `Link.Icon` first for the filled icon block.',
    },
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
  render: () => (
    <p>
      Du kan <Link.Root href="#ansokan">ansöka om parkeringstillstånd</Link.Root> på webben.
    </p>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await expect(link.closest('p')).toHaveTextContent(
      'Du kan ansöka om parkeringstillstånd på webben.',
    )
  },
}

/** Inside a `Navigation.Item` the current page gets a background, a bar and weight. */
export const CurrentPage: Story = {
  decorators: [
    (Story) => (
      <div className="kv-story-surface">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Navigation.Root label="Huvudmeny">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#ansok" current="page">
            Ansök
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#kontakt">Kontakt</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
  play: async ({ canvas }) => {
    const current = canvas.getByRole('link', { name: 'Ansök' })
    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(current).toHaveAttribute('data-current', '')
    for (const name of ['Start', 'Kontakt']) {
      const link = canvas.getByRole('link', { name })
      await expect(link).not.toHaveAttribute('aria-current')
      await expect(link).not.toHaveAttribute('data-current')
    }
  },
}

/**
 * `className="kv-link--service"` is the one link per view that starts an e-service: an
 * outlined label, and with a `Link.Icon` first, a filled block with the icon. It is a link,
 * not a button: it navigates, so it keeps the router, `current` and the new-tab notice.
 */
export const Service: Story = {
  args: {
    href: 'https://eservice.example/bygglov',
    className: 'kv-link--service',
    target: '_blank',
    children: (
      <>
        <Link.Icon>
          <Icon name="arrow-forward" size={6} />
        </Link.Icon>
        Ansök om bygglov <Link.NewTabNotice />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Ansök om bygglov (öppnas i en ny flik)' })
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveClass('kv-link', 'kv-link--service')
    await expectMinimumTargetSize(link)
    // The icon block is decorative: it is not in the name (2.5.3).
    await expect(link.querySelector('.kv-link-icon')).toHaveAttribute('aria-hidden', 'true')
  },
}

/** A service link that wraps: the icon block stretches to the full height of the label. */
export const ServiceLongFinnishText: Story = {
  args: {
    href: 'https://eservice.example/rakennuslupa',
    className: 'kv-link--service',
    children: (
      <>
        <Link.Icon>
          <Icon name="arrow-forward" size={6} />
        </Link.Icon>
        Hae rakennuslupaa sähköisesti
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
    await expect(canvas.getByRole('link', { name: 'Hae rakennuslupaa sähköisesti' })).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
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
    <ul className="kv-story-inline-list">
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

/**
 * Register your router's link once, on the provider: every Link then renders it, and the router
 * handles the click. `current` comes from the router's pathname. The mock router here stands in
 * for your own (`NextLink`, TanStack Router's link).
 */
export const RouterLink: Story = {
  parameters: showSource('link/link.fixture.tsx', 'AppRoot', 'RoutedNavigation'),
  render: () => (
    <AppRoot>
      <RoutedNavigation />
    </AppRoot>
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
      <p>
        Du kan <Link.Root href="#ansokan">ansöka om parkeringstillstånd</Link.Root> på webben.
      </p>
      <Navigation.Root label="Parkeringstillstånd">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#sida-1" current="page">
              Översikt
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#sida-2">Ansök</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#sida-3">Kontakta oss</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const inText = canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await userEvent.tab()
    await expect(inText).toHaveFocus()
    await waitFor(() => expect(inText).toHaveAttribute('data-focus-visible'))
    // 2.4.7: a focused link shows an indicator.
    await expect(getComputedStyle(inText).outlineStyle).not.toBe('none')
    const navigationItem = canvas.getByRole('link', { name: 'Översikt' })
    await userEvent.tab()
    await expect(navigationItem).toHaveFocus()
    await expect(getComputedStyle(navigationItem).outlineStyle).not.toBe('none')
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
  decorators: [
    (Story) => (
      <div className="kv-story-surface kv-compact">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Navigation.Root label="Parkeringstillstånd">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#sida-1" current="page">
            Översikt
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#sida-2">Ansök</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#sida-3">Kontakta oss</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  ),
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
      <Navigation.Root label="Parking permits">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#sida-1" current="page">
              Overview
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#sida-2">Apply</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#sida-3">Contact us</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
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
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#ansok" current="page">
              Ansök
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="https://www.digg.se/" target="_blank">
              Digg <Link.NewTabNotice />
            </Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <p>
        <Link.Root href="#bygglov" className="kv-link--service">
          <Link.Icon>
            <Icon name="arrow-forward" size={6} />
          </Link.Icon>
          Starta e-tjänsten
        </Link.Root>
      </p>
    </>
  ),
}
