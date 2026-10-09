import { colorSchemeAttribute, contrastAttribute, themeStorageKey } from '@kvirn-ui/core'
import { afterEach, beforeEach, expect, test } from 'vite-plus/test'
import { cdp, page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'

// Its own file: without a provider, useTheme() uses this page's real document store.

beforeEach(async () => {
  localStorage.clear()
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  })
})

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  localStorage.clear()
})

test('useTheme works without a provider: follows the OS, writes <html>, persists to localStorage', async () => {
  await render(<ThemeSwitcherFixture />)
  await expect.element(page.getByRole('radio', { name: 'Follow system' }).first()).toBeChecked()
  await expect.element(page.getByText('In use: Dark, Standard contrast, Full motion')).toBeVisible()
  expect(document.documentElement.getAttribute(colorSchemeAttribute)).toBe('dark')
  expect(document.documentElement.getAttribute(contrastAttribute)).toBe('standard')

  await page.getByRole('radio', { name: 'High contrast' }).click()
  await expect.element(page.getByText('In use: Dark, High contrast, Full motion')).toBeVisible()
  expect(document.documentElement.getAttribute(contrastAttribute)).toBe('more')
  expect(localStorage.getItem(themeStorageKey)).toBe(JSON.stringify({ contrast: 'more' }))
})
