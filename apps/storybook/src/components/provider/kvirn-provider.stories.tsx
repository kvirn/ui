import {
  colorSchemeAttribute,
  contrastAttribute,
  getDefaultEnv,
  getThemeStore,
} from '@kvirn-ui/core'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
// Package-internal fixture, shared with the provider's tests. Not part of the public API.
import {
  ProviderFixture,
  ThemeSwitcherFixture,
} from '../../../../../packages/react/src/provider/kvirn-provider.fixture.tsx'

function ProviderStory(providerProps: KvirnProviderProps) {
  return (
    <KvirnProvider {...providerProps}>
      <main>
        <h1>KvirnProvider</h1>
        <ProviderFixture />
        <ThemeSwitcherFixture />
      </main>
    </KvirnProvider>
  )
}

const meta = {
  title: 'Foundation/KvirnProvider',
  component: ProviderStory,
  args: { locale: 'sv-SE', messages: sv, timeZone: 'Europe/Stockholm' },
  globals: { locale: 'sv' },
} satisfies Meta<typeof ProviderStory>

export default meta
type Story = StoryObj<typeof meta>

const catalogs = { sv, fi, nb, nn, se, en }

interface ProviderPlaygroundArgs extends Omit<KvirnProviderProps, 'messages'> {
  /** Which `@kvirn-ui/i18n` catalog to pass as `messages`. */
  messages: keyof typeof catalogs
}

function ProviderPlayground({ messages, ...providerProps }: ProviderPlaygroundArgs) {
  return (
    <KvirnProvider {...providerProps} messages={catalogs[messages]}>
      <main>
        <h1>KvirnProvider</h1>
        <ProviderFixture />
      </main>
    </KvirnProvider>
  )
}

/**
 * One provider with its whole API as controls, and a fixture that shows what it gives
 * components. `theme` is read once, when the document's theme store is created: reload the
 * story after changing it.
 */
export const Default: StoryObj<typeof ProviderPlayground> = {
  render: (args) => <ProviderPlayground {...args} />,
  args: {
    locale: 'sv-SE',
    messages: 'sv',
    dir: undefined,
    timeZone: 'Europe/Stockholm',
    theme: { defaultColorScheme: 'system', defaultContrast: 'system', storage: 'local' },
  },
  argTypes: {
    locale: {
      control: 'select',
      // Only locales the fixture has text for, so `lang` matches the content (3.1.2).
      options: ['sv-SE', 'sv-FI', 'fi-FI', 'en-GB'],
      description: 'BCP 47. Drives `Intl.*`, `lang` and `dir`.',
    },
    messages: {
      control: 'select',
      options: Object.keys(catalogs),
      description:
        'A catalog from `@kvirn-ui/i18n` (`@kvirn-ui/i18n/sv`, …), or a partial override.',
    },
    dir: { control: 'inline-radio', options: [undefined, 'ltr', 'rtl'] },
    timeZone: { control: 'text', description: 'IANA time zone.' },
    theme: { control: 'object', description: 'Theme defaults and storage. Read once.' },
    linkComponent: { control: false },
    env: { control: false },
    children: { control: false },
  },
  play: async ({ canvasElement }) => {
    const settings = within(canvasElement).getByRole('region', { name: 'Inställningar' })
    await expect(settings).toHaveAttribute('lang', 'sv-SE')
  },
}

export const Swedish: Story = {
  play: async ({ canvasElement }) => {
    const settings = within(canvasElement).getByRole('region', { name: 'Inställningar' })
    await expect(settings).toHaveAttribute('lang', 'sv-SE')
    await expect(within(settings).getByText('(öppnas i en ny flik)')).toBeVisible()
  },
}

export const Finnish: Story = {
  args: { locale: 'fi-FI', messages: fi, timeZone: 'Europe/Helsinki' },
  globals: { locale: 'fi' },
  play: async ({ canvasElement }) => {
    const settings = within(canvasElement).getByRole('region', { name: 'Asetukset' })
    await expect(settings).toHaveAttribute('lang', 'fi-FI')
    await expect(within(settings).getByText('(avautuu uuteen välilehteen)')).toBeVisible()
  },
}

export const English: Story = {
  args: { locale: 'en-GB', messages: undefined, timeZone: 'Europe/London' },
  globals: { locale: 'en' },
  play: async ({ canvasElement }) => {
    const settings = within(canvasElement).getByRole('region', { name: 'Settings' })
    await expect(within(settings).getByText('(opens in a new tab)')).toBeVisible()
  },
}

export const RightToLeftOverride: Story = {
  args: { locale: 'en', messages: undefined, dir: 'rtl', timeZone: 'UTC' },
  globals: { locale: 'en', dir: 'rtl' },
  play: async ({ canvasElement }) => {
    const settings = within(canvasElement).getByRole('region', { name: 'Settings' })
    await expect(settings).toHaveAttribute('dir', 'rtl')
  },
}

/** A section in another language spreads `localeProps`, so `lang` matches its strings (3.1.2). */
export const NestedLocale: Story = {
  render: (providerProps) => (
    <KvirnProvider {...providerProps}>
      <main>
        <h1>KvirnProvider</h1>
        <ProviderFixture />
        <KvirnProvider locale="fi-FI" messages={fi}>
          <ProviderFixture />
        </KvirnProvider>
      </main>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Inställningar' })).toHaveAttribute(
      'lang',
      'sv-SE',
    )
    const finnish = canvas.getByRole('region', { name: 'Asetukset' })
    await expect(finnish).toHaveAttribute('lang', 'fi-FI')
    await expect(within(finnish).getByText('Europe/Stockholm')).toBeVisible()
  },
}

/**
 * A mixed result: a Finnish page with a section that isn't translated yet. The section gets its
 * own provider with the English catalog and spreads `localeProps`, so `lang="en-GB"` matches its
 * strings and a screen reader switches voice (3.1.2). Everything it doesn't set, such as the
 * time zone, comes from the Finnish page.
 */
export const UntranslatedSection: Story = {
  args: { locale: 'fi-FI', messages: fi, timeZone: 'Europe/Helsinki' },
  globals: { locale: 'fi' },
  render: (providerProps) => (
    <KvirnProvider {...providerProps}>
      <main>
        <h1>KvirnProvider</h1>
        <ProviderFixture />
        <KvirnProvider locale="en-GB" messages={en}>
          <ProviderFixture />
        </KvirnProvider>
      </main>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const finnish = canvas.getByRole('region', { name: 'Asetukset' })
    await expect(finnish).toHaveAttribute('lang', 'fi-FI')
    await expect(within(finnish).getByText('(avautuu uuteen välilehteen)')).toBeVisible()
    const english = canvas.getByRole('region', { name: 'Settings' })
    await expect(english).toHaveAttribute('lang', 'en-GB')
    await expect(within(english).getByText('(opens in a new tab)')).toBeVisible()
    await expect(within(english).getByText('Europe/Helsinki')).toBeVisible()
  },
}

/**
 * The e2e keyboard contract runs against this story, so its play function only reads:
 * it must not change the persisted theme.
 */
export const ThemeSwitcher: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'Färgschema' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Kontrast' })).toBeVisible()
  },
}

/**
 * Back to `system` on both axes after the story, which also removes the stored key, so a
 * combination doesn't leak into the next story when browsing Storybook.
 */
const resetThemePreference = () => {
  const themeStore = getThemeStore(getDefaultEnv())
  themeStore.actions.selectColorScheme('system')
  themeStore.actions.selectContrast('system')
}

/** Each combination selects both axes itself, so the stories don't depend on their order. */
function themeCombination(
  colorScheme: 'Ljust' | 'Mörkt',
  contrast: 'Normal kontrast' | 'Hög kontrast',
) {
  return {
    beforeEach: () => resetThemePreference,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement)
      await userEvent.click(canvas.getByRole('radio', { name: colorScheme }))
      await userEvent.click(canvas.getByRole('radio', { name: contrast }))
      await expect(canvas.getByText(`Används nu: ${colorScheme}, ${contrast}`)).toBeVisible()
      const root = canvasElement.ownerDocument.documentElement
      await expect(root).toHaveAttribute(
        colorSchemeAttribute,
        colorScheme === 'Mörkt' ? 'dark' : 'light',
      )
      await expect(root).toHaveAttribute(
        contrastAttribute,
        contrast === 'Hög kontrast' ? 'more' : 'standard',
      )
    },
  } satisfies Story
}

export const LightStandardContrast: Story = themeCombination('Ljust', 'Normal kontrast')
export const LightHighContrast: Story = themeCombination('Ljust', 'Hög kontrast')
export const DarkStandardContrast: Story = themeCombination('Mörkt', 'Normal kontrast')
export const DarkHighContrast: Story = themeCombination('Mörkt', 'Hög kontrast')

export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
