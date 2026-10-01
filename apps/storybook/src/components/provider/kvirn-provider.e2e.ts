import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/provider/kvirn-provider.a11y.md. The theme switcher is fixture
// markup (native radio groups) on useTheme(); these rows prove the provider keeps native
// behaviour intact.

const storyUrl = (story: string) =>
  `/iframe.html?id=foundation-kvirnprovider--${story}&viewMode=story`
const themeStorageKey = 'kvirn-ui:theme'

async function openThemeSwitcher(page: Page) {
  await page.goto(storyUrl('theme-switcher'))
  const colorSchemeGroup = page.getByRole('group', { name: 'Färgschema' })
  const contrastGroup = page.getByRole('group', { name: 'Kontrast' })
  await expect(colorSchemeGroup).toBeVisible()
  return {
    colorSchemeGroup,
    contrastGroup,
    colorSchemeRadio: (name: string) => colorSchemeGroup.getByRole('radio', { name, exact: true }),
    contrastRadio: (name: string) => contrastGroup.getByRole('radio', { name, exact: true }),
  }
}

/** Under the chromium-forced-colors project the switcher says the system colours win. */
const isForcedColors = (page: Page) =>
  page.evaluate(() => window.matchMedia('(forced-colors: active)').matches)
const forcedColorsText = 'Systemets tvingade färger används och går före ditt val.'

const readStorage = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), themeStorageKey)
const readHtmlAttribute = (page: Page, name: string) =>
  page.evaluate((attribute) => document.documentElement.getAttribute(attribute), name)

test.describe('KvirnProvider theme switcher keyboard contract', () => {
  test('Tab moves focus to the checked radio of the colour-scheme group', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await expect(switcher.colorSchemeRadio('Följ systemet')).toBeFocused()
    await expect(switcher.colorSchemeRadio('Följ systemet')).toBeChecked()
  })

  test('Tab moves to the next group: one Tab stop per radio group', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(switcher.contrastRadio('Följ systemet')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(switcher.colorSchemeRadio('Följ systemet')).toBeFocused()
  })

  test('ArrowUp / ArrowLeft select the previous option and keep focus on it', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowUp')
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeChecked()
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(switcher.colorSchemeRadio('Ljust')).toBeChecked()
    await expect(switcher.colorSchemeRadio('Ljust')).toBeFocused()
    expect(await readHtmlAttribute(page, 'data-kv-color-scheme')).toBe('light')
  })

  test('ArrowDown / ArrowRight select the next option and wrap around', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown')
    await expect(switcher.colorSchemeRadio('Ljust')).toBeChecked()
    await page.keyboard.press('ArrowRight')
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeChecked()
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeFocused()
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', 'dark')
  })

  test('Arrow keys change the contrast group independently', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowUp')
    await expect(switcher.contrastRadio('Hög kontrast')).toBeChecked()
    await expect(switcher.colorSchemeRadio('Följ systemet')).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', 'more')
  })

  test('a theme change moves no focus and announces nothing', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowUp')
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeFocused()
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.locator('[aria-live]')).toHaveCount(0)
  })
})

test.describe('KvirnProvider theme persistence (ADR-0006)', () => {
  test('nothing is stored until the user chooses', async ({ page }) => {
    await openThemeSwitcher(page)
    expect(await readStorage(page)).toBeNull()
  })

  test('the choice persists across a reload', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await switcher.colorSchemeRadio('Mörkt').check()
    await switcher.contrastRadio('Hög kontrast').check()
    expect(JSON.parse((await readStorage(page)) ?? 'null')).toEqual({
      colorScheme: 'dark',
      contrast: 'more',
    })

    await page.reload()
    await expect(switcher.colorSchemeGroup).toBeVisible()
    await expect(switcher.colorSchemeRadio('Mörkt')).toBeChecked()
    await expect(switcher.contrastRadio('Hög kontrast')).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', 'dark')
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', 'more')
  })

  test('selecting system on both groups clears storage', async ({ page }) => {
    const switcher = await openThemeSwitcher(page)
    await switcher.colorSchemeRadio('Mörkt').check()
    await switcher.contrastRadio('Hög kontrast').check()
    await switcher.colorSchemeRadio('Följ systemet').check()
    expect(JSON.parse((await readStorage(page)) ?? 'null')).toEqual({ contrast: 'more' })
    await switcher.contrastRadio('Följ systemet').check()
    await expect(switcher.contrastRadio('Följ systemet')).toBeChecked()
    expect(await readStorage(page)).toBeNull()
  })

  test('follows OS changes while the preference is system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await openThemeSwitcher(page)
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', 'light')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', 'dark')
    await expect(
      (await isForcedColors(page))
        ? page.getByText(forcedColorsText)
        : page.getByText(/^Används nu: Mörkt,/),
    ).toBeVisible()
    expect(await readStorage(page)).toBeNull()
  })
})

test.describe('KvirnProvider accessibility', () => {
  test('a11y tree of the theme switcher', async ({ page }) => {
    await openThemeSwitcher(page)
    const statusText = (await isForcedColors(page)) ? '/Systemets tvingade färger/' : '/Används nu/'
    await expect(page.getByRole('region', { name: 'Tema' })).toMatchAriaSnapshot(`
      - heading "Tema" [level=2]
      - group "Färgschema":
        - radio "Ljust"
        - radio "Mörkt"
        - radio "Följ systemet" [checked]
      - group "Kontrast":
        - radio "Normal kontrast"
        - radio "Hög kontrast"
        - radio "Följ systemet" [checked]
      - paragraph: ${statusText}
    `)
  })

  test('the nested locale section has its own lang', async ({ page }) => {
    await page.goto(storyUrl('nested-locale'))
    const finnish = page.getByRole('region', { name: 'Asetukset' })
    await expect(finnish).toBeVisible()
    await expect(finnish).toHaveAttribute('lang', 'fi-FI')
    await expect(page.getByRole('region', { name: 'Inställningar' })).toHaveAttribute(
      'lang',
      'sv-SE',
    )
  })

  for (const story of ['swedish', 'theme-switcher', 'nested-locale', 'right-to-left-override']) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await page.goto(storyUrl(story))
      await expect(page.getByRole('heading', { name: 'KvirnProvider', level: 1 })).toBeVisible()
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await page.goto(storyUrl(story))
      await expect(page.getByRole('heading', { name: 'KvirnProvider', level: 1 })).toBeVisible()
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
