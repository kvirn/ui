import {
  colorSchemeAttribute,
  contrastAttribute,
  getDefaultEnv,
  getThemeStore,
} from '@kvirn-ui/core'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/provider/kvirn-provider.a11y.md?raw'
import guide from '../../../../../packages/react/src/provider/kvirn-provider.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
// Package-internal fixture, shared with the provider's tests. Not part of the public API.
import {
  ProviderFixture,
  ThemeSwitcherFixture,
} from '../../../../../packages/react/src/provider/kvirn-provider.fixture.tsx'
import { ServerHead, ThemedApp, TranslatedApp } from './kvirn-provider.fixture.tsx'

// Foundation/KvirnProvider: the provider and a fixture that shows what it gives components.
// These stories drive the theme store themselves, so the preview's Mode and Contrast don't apply
// to them.

const meta = {
  title: 'Foundation/KvirnProvider',
  component: KvirnProvider,
  args: {
    locale: 'sv-SE',
    messages: sv,
    timeZone: 'Europe/Stockholm',
    children: (
      <>
        <ProviderFixture />
        <ThemeSwitcherFixture />
      </>
    ),
  },
  argTypes: {
    locale: {
      control: 'select',
      // Only locales the fixture has text for, so `lang` matches the content (3.1.2).
      options: ['sv-SE', 'sv-FI', 'fi-FI', 'en-GB'],
    },
    messages: { control: 'object' },
    dir: { control: 'inline-radio', options: [undefined, 'ltr', 'rtl'] },
    theme: { control: 'object', description: 'Theme defaults and storage. Read once.' },
    linkComponent: { control: false },
    env: { control: false },
    children: { control: false },
  },
  globals: { locale: 'sv' },
  parameters: {
    themeStore: 'story',
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof KvirnProvider>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A provider and what it gives components. `theme` is read once, when the document's theme
 * store is created: reload the story after changing it.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const settings = canvas.getByRole('region', { name: 'Inställningar' })
    await expect(settings).toHaveAttribute('lang', 'sv-SE')
  },
}

/** Swedish strings from `@kvirn-ui/i18n/sv`. */
export const Swedish: Story = {
  play: async ({ canvas }) => {
    const settings = canvas.getByRole('region', { name: 'Inställningar' })
    await expect(settings).toHaveAttribute('lang', 'sv-SE')
    await expect(within(settings).getByText('(öppnas i en ny flik)')).toBeVisible()
  },
}

/** Finnish strings and the Helsinki time zone. */
export const Finnish: Story = {
  args: { locale: 'fi-FI', messages: fi, timeZone: 'Europe/Helsinki' },
  globals: { locale: 'fi' },
  play: async ({ canvas }) => {
    const settings = canvas.getByRole('region', { name: 'Asetukset' })
    await expect(settings).toHaveAttribute('lang', 'fi-FI')
    await expect(within(settings).getByText('(avautuu uuteen välilehteen)')).toBeVisible()
  },
}

/** Without `messages` the English defaults apply. */
export const English: Story = {
  args: { locale: 'en-GB', messages: undefined, timeZone: 'Europe/London' },
  globals: { locale: 'en' },
  play: async ({ canvas }) => {
    const settings = canvas.getByRole('region', { name: 'Settings' })
    await expect(within(settings).getByText('(opens in a new tab)')).toBeVisible()
  },
}

/** `dir="rtl"` overrides the direction the locale implies. */
export const RightToLeftOverride: Story = {
  args: { locale: 'en', messages: undefined, dir: 'rtl', timeZone: 'UTC' },
  globals: { locale: 'en', dir: 'rtl' },
  play: async ({ canvas }) => {
    const settings = canvas.getByRole('region', { name: 'Settings' })
    await expect(settings).toHaveAttribute('dir', 'rtl')
  },
}

/** A section in another language spreads `localeProps`, so `lang` matches its strings (3.1.2). */
export const NestedLocale: Story = {
  args: {
    children: (
      <>
        <ProviderFixture />
        <KvirnProvider locale="fi-FI" messages={fi}>
          <ProviderFixture />
        </KvirnProvider>
      </>
    ),
  },
  play: async ({ canvas }) => {
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
  args: {
    locale: 'fi-FI',
    messages: fi,
    timeZone: 'Europe/Helsinki',
    children: (
      <>
        <ProviderFixture />
        <KvirnProvider locale="en-GB" messages={en}>
          <ProviderFixture />
        </KvirnProvider>
      </>
    ),
  },
  globals: { locale: 'fi' },
  play: async ({ canvas }) => {
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
 * A theme switcher of native radio groups on `useTheme()`. Its play function only
 * reads: it must not change the persisted theme.
 */
export const ThemeSwitcher: Story = {
  play: async ({ canvas }) => {
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
    play: async ({ canvas, canvasElement, userEvent }) => {
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

/** Light, standard contrast, chosen in the switcher. */
export const LightStandardContrast: Story = themeCombination('Ljust', 'Normal kontrast')
/** Light, high contrast, chosen in the switcher. */
export const LightHighContrast: Story = themeCombination('Ljust', 'Hög kontrast')
/** Dark, standard contrast, chosen in the switcher. */
export const DarkStandardContrast: Story = themeCombination('Mörkt', 'Normal kontrast')
/** Dark, high contrast, chosen in the switcher. */
export const DarkHighContrast: Story = themeCombination('Mörkt', 'Hög kontrast')

/**
 * The `theme` option: the defaults used until the user chooses (here dark and high contrast), and
 * where a choice is kept, here a `storage` adapter whose `write` receives only the axes that differ
 * from the defaults. The provider has an `env` of its own, so this example's theme store doesn't
 * touch the page you're reading. Choose "Ljust" and the saved choice appears; choose "Mörkt" again
 * and it is removed.
 */
export const ThemeDefaultsAndStorage: Story = {
  parameters: showSource('provider/kvirn-provider.fixture.tsx', 'ThemedApp', 'ThemeChoice'),
  render: () => <ThemedApp />,
  play: async ({ canvas, userEvent }) => {
    // The defaults apply until the user chooses, and nothing is stored yet.
    await expect(canvas.getByText('Används nu: dark, more')).toBeVisible()
    await expect(canvas.getByText('Sparat val: inget')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Ljust' }))
    await expect(canvas.getByText('Används nu: light, more')).toBeVisible()
    await expect(canvas.getByText('Sparat val: {"colorScheme":"light"}')).toBeVisible()
    // Back to the default: there is nothing to store, so the entry is removed.
    await userEvent.click(canvas.getByRole('button', { name: 'Mörkt' }))
    await expect(canvas.getByText('Sparat val: inget')).toBeVisible()
  },
}

/**
 * Your own strings: `defineMessages` builds a catalog once, a function-valued key gets its values
 * and a `format` for the locale (`plural`, `number`), and a nested provider with a partial object
 * changes only its own section.
 */
export const OwnMessages: Story = {
  parameters: showSource('provider/kvirn-provider.fixture.tsx', 'TranslatedApp'),
  render: () => <TranslatedApp />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/497 tecken kvar av ditt utrymme\./)).toBeVisible()
    await expect(canvas.getByText('Skriv gärna lite till.')).toBeVisible()
  },
}

/**
 * `KvirnThemeScript` as a server sends it: a blocking inline script with the CSP `nonce` and the
 * same defaults as the provider. React doesn't run it in the browser, so the markup is shown as
 * text.
 */
export const ThemeScriptWithNonce: Story = {
  parameters: showSource('provider/kvirn-provider.fixture.tsx', 'ServerHead'),
  render: () => <ServerHead />,
  play: async ({ canvasElement }) => {
    const markup = canvasElement.querySelector('pre')?.textContent ?? ''
    await expect(markup).toContain('nonce="abc123"')
    await expect(markup).toContain('"colorScheme":"dark"')
    await expect(markup).toContain('"contrast":"more"')
  },
}

/** With the forced-colors marker. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
