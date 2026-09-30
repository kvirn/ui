import {
  colorSchemeAttribute,
  contrastAttribute,
  getDefaultEnv,
  getThemeStore,
} from '@kvirn-ui/core'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { KvirnProvider } from './kvirn-provider.tsx'
import type { KvirnProviderProps } from './kvirn-provider.tsx'
import { ProviderFixture, ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'

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
