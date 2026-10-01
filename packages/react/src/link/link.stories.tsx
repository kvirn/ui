import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  blockSize,
  expectNoHorizontalOverflow,
  expectThemeApplied,
  isThemeLoaded,
  isViewportAtLeast,
  tokenColor,
} from '../stories/theme-story-assertions.ts'
import type { FixedStoryTheme } from '../stories/theme-story-assertions.ts'
import { Link } from './link.tsx'
import { MockRouterProvider, mockRouterLinkComponent, useMockPathname } from './link.fixture.tsx'

// Components/Link: the headless Link, styled by @kvirn-ui/theme/theme.css from the Storybook
// preview (ADR-0013). Theme toolbar › "None (unstyled)" removes the theme again.
// link.e2e.ts runs its keyboard contract against Default, CurrentPage, NewTab,
// NewTabNoticeOverrides, RouterLink, OtherLanguage, RTL and ForcedColors, so their play
// functions only read.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

// 2.5.8: a plain list of inline links is about 24px tall per row. The gap keeps each link's
// 24px target circle clear of its neighbours, as a theme would. Link itself ships no CSS.
const linkListStyle: CSSProperties = { display: 'grid', gap: '0.5rem' }

const guidelinesUrl = 'https://www.w3.org/WAI/standards-guidelines/wcag/'

/** A labelled navigation list: `data-kv-nav` turns its links into navigation items. */
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
    <div className="kv-story-surface" data-kv-density={density}>
      <nav aria-label={label}>
        <ul data-kv-nav="">
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

/** On its own, a link has the link colour and an underline. */
export const Default: Story = {
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
    await expect(link).toHaveAttribute('data-kv', 'link')
    await expect(link).not.toHaveAttribute('aria-current')
    await expect(link).toHaveStyle({ color: tokenColor(canvasElement, 'link') })
    await expect(getComputedStyle(link).textDecorationLine).toContain('underline')
  },
}

export const InRunningText: Story = {
  name: 'In running text',
  render: () => <RunningTextLink />,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await expect(getComputedStyle(link).textDecorationLine).toContain('underline')
    await expect(link.closest('p')).toHaveTextContent(
      'Du kan ansöka om parkeringstillstånd på webben.',
    )
  },
}

/** Inside `data-kv-nav` the current page gets a background, a bar and weight. */
export const CurrentPage: Story = {
  render: () => (
    <div className="kv-story-surface">
      <nav aria-label="Huvudmeny">
        <ul data-kv-nav="">
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
    await expect(current).toHaveStyle({ fontWeight: '600', borderInlineStartWidth: '4px' })
    await expect(getComputedStyle(current).textDecorationLine).toBe('none')
    for (const name of ['Start', 'Kontakt']) {
      const link = within(canvasElement).getByRole('link', { name })
      await expect(link).not.toHaveAttribute('aria-current')
      await expect(link).not.toHaveAttribute('data-current')
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
    await expect(within(link).getByText('(öppnas i en ny flik)')).toHaveAttribute(
      'data-kv',
      'link-new-tab-notice',
    )
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
        <ul data-kv-nav="">
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
    await expect(start).toHaveAttribute('data-kv', 'link')
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
    for (const link of links) {
      if (isViewportAtLeast(canvasElement, '64rem')) {
        await expect(blockSize(link)).toBeGreaterThanOrEqual(32)
        await expect(blockSize(link)).toBeLessThan(44)
      } else {
        await expect(blockSize(link)).toBeGreaterThanOrEqual(44)
      }
    }
    await expect(links[0]).toHaveAttribute('aria-current', 'page')
    await expect(links[0]).toHaveStyle({ fontWeight: '600', borderInlineStartWidth: '4px' })
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
      const canvas = within(canvasElement)
      await expect(canvas.getByRole('link', { name: 'ansöka om parkeringstillstånd' })).toHaveStyle(
        { color: tokenColor(canvasElement, 'link') },
      )
      await expect(canvas.getByRole('link', { name: 'Översikt' })).toHaveStyle({
        backgroundColor: tokenColor(canvasElement, 'primary-subtle'),
        borderInlineStartColor: tokenColor(canvasElement, 'primary'),
      })
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
    // The current bar is at the inline start, which is the right in RTL.
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveStyle({
      borderRightWidth: '4px',
      borderLeftWidth: '0px',
    })
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
        <ul data-kv-nav="">
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

/** Without theme.css the Link is a plain native link: the package ships no CSS. */
export const Unstyled: Story = {
  globals: { theme: 'none' },
  render: () => (
    <>
      <RunningTextLink />
      <NewTabLink />
    </>
  ),
  play: async ({ canvasElement }) => {
    await expect(isThemeLoaded(canvasElement)).toBe(false)
    const link = within(canvasElement).getByRole('link', { name: 'ansöka om parkeringstillstånd' })
    await expect(link).toHaveAttribute('data-kv', 'link')
    await expect(link).toHaveStyle({ outlineStyle: 'none', fontWeight: '400' })
  },
}
