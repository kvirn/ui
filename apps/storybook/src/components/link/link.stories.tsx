import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import { Icon, KvirnProvider, Link } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/link/link.a11y.md?raw'
import guide from '../../../../../packages/react/src/link/link.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { AppRoot, RoutedLinkList, RouterAndPlainLinks } from './link.fixture.tsx'

// Components/Link: the headless Link, styled by @kvirn-ui/theme/theme.css.
// The keyboard contract is proved in link.test.tsx, so the play functions only read. A list of
// page links with a current page is Components/Navigation.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, en }

const meta = {
  title: 'Components/Actions/Link',
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
    as: {
      control: false,
      description: 'Another element or component. `as="a"` bypasses the registered router link.',
    },
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
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Link.Root>

export default meta
type Story = StoryObj<typeof meta>

/** On its own, a link has the link colour, and an underline on hover. */
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

/** In a sentence, a link is told apart by 3:1 contrast with the text around it and an underline on hover (1.4.1). */
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

/**
 * `current` is not only `page`: `step` marks the step in a process, `location`, `date` and `time`
 * the current item of a set, and `true` a plain `aria-current="true"`. `false` gives none.
 */
export const CurrentKinds: Story = {
  render: () => (
    <ul>
      <li>
        <Link.Root href="#steg-1" current="step">
          Steg 1: Fyll i uppgifter
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#plats" current="location">
          Du är här: Bygglov
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#datum" current="date">
          Idag
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#tid" current="time">
          Nu
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#aktuell" current>
          Aktuellt val
        </Link.Root>
      </li>
      <li>
        <Link.Root href="#andra" current={false}>
          Andra val
        </Link.Root>
      </li>
    </ul>
  ),
  play: async ({ canvas }) => {
    for (const [name, value] of [
      ['Steg 1: Fyll i uppgifter', 'step'],
      ['Du är här: Bygglov', 'location'],
      ['Idag', 'date'],
      ['Nu', 'time'],
      ['Aktuellt val', 'true'],
    ] as const) {
      await expect(canvas.getByRole('link', { name })).toHaveAttribute('aria-current', value)
    }
    await expect(canvas.getByRole('link', { name: 'Andra val' })).not.toHaveAttribute(
      'aria-current',
    )
  },
}

/**
 * Next to a registered router: `as="a"` bypasses the router for one link (a download), your
 * own `rel` joins `noopener noreferrer` on a new-tab link, and the notice takes `as` too.
 */
export const BypassRouterAndKeepRel: Story = {
  parameters: showSource('link/link.fixture.tsx', 'RouterAndPlainLinks'),
  render: () => <RouterAndPlainLinks />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Ansök' })).toHaveAttribute(
      'data-router-link',
      '',
    )
    await expect(canvas.getByRole('link', { name: 'Blankett (PDF)' })).not.toHaveAttribute(
      'data-router-link',
    )
    const external = canvas.getByRole('link', { name: 'Digg (öppnas i en ny flik)' })
    await expect(external).toHaveAttribute('rel', 'author noopener noreferrer')
    await expect(external.querySelector('small')).toHaveClass('kv-link-new-tab-notice')
  },
}

/**
 * The underline is three custom properties (`--kv-link-underline-thickness`,
 * `--kv-link-underline-thickness-hover`, `--kv-link-underline-offset`). Set them once on `:root`,
 * or on a container as here. Keep the link colour 3:1 against the text, which is what lets the
 * underline show on hover only (1.4.1).
 */
export const UnderlineProperties: Story = {
  decorators: [
    (Story) => (
      <div
        style={
          {
            '--kv-link-underline-thickness': '2px',
            '--kv-link-underline-thickness-hover': '3px',
            '--kv-link-underline-offset': '0.3em',
          } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
  render: () => (
    <p>
      Du kan <Link.Root href="#ansokan">ansöka om parkeringstillstånd</Link.Root> på webben.
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })).toBeVisible()
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
          <Icon name="arrow-forward" size="24" />
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
          <Icon name="arrow-forward" size="24" />
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

/**
 * `target="_blank"` with a visible NewTabNotice, in the provider's language. A link that opens a
 * new window or tab must say so: that is a WCAG requirement (3.2.5, Level AAA; technique G201). Link doesn't check it
 * for you, so there is no type error and no warning when the notice is missing.
 */
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
 * for your own (`NextLink`, TanStack Router's link). A list of these in a navigation is
 * Components/Navigation's RouterLink.
 */
export const RoutedLinks: Story = {
  parameters: showSource('link/link.fixture.tsx', 'AppRoot', 'RoutedLinkList'),
  render: () => (
    <AppRoot>
      <RoutedLinkList />
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
    </ul>
  ),
  play: async ({ canvas }) => {
    for (const [name, language] of [
      ['Suomeksi', 'fi'],
      ['På svenska', 'sv'],
    ] as const) {
      const link = canvas.getByRole('link', { name })
      await expect(link).toHaveAttribute('lang', language)
      await expect(link).toHaveAttribute('hreflang', language)
    }
  },
}

/**
 * Keyboard focus shows a 2px ring in running text (2.4.7, 2.4.13). A link in a navigation has its
 * own FocusVisible in Components/Navigation.
 */
export const FocusVisible: Story = {
  render: () => (
    <p>
      Du kan <Link.Root href="#ansokan">ansöka om parkeringstillstånd</Link.Root> på webben.
    </p>
  ),
  play: async ({ canvas, userEvent }) => {
    const inText = canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await userEvent.tab()
    await expect(inText).toHaveFocus()
    await waitFor(() => expect(inText).toHaveAttribute('data-focus-visible'))
    // 2.4.7: a focused link shows an indicator.
    await expect(getComputedStyle(inText).outlineStyle).not.toBe('none')
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

/** Right to left, in English: the new-tab notice follows `dir`. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => (
    <p>
      <Link.Root href="#apply">Apply for a parking permit</Link.Root>{' '}
      <Link.Root href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link.Root>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Digg (opens in a new tab)' })).toBeVisible()
  },
}

/** Every link style with the forced-colors marker. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <>
      <p>
        Läs mer om <Link.Root href="#parkering">parkering</Link.Root>.
      </p>
      <p>
        <Link.Root href="https://www.digg.se/" target="_blank">
          Digg <Link.NewTabNotice />
        </Link.Root>
      </p>
      <p>
        <Link.Root href="#bygglov" className="kv-link--service">
          <Link.Icon>
            <Icon name="arrow-forward" size="24" />
          </Link.Icon>
          Starta e-tjänsten
        </Link.Root>
      </p>
    </>
  ),
}
