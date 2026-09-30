import { themeStorageKey } from '@kvirn-ui/core'
import { sv } from '@kvirn-ui/i18n/sv'
import { hydrateRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { KvirnProvider } from './kvirn-provider.tsx'
import { ProviderFixture, ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'
import { KvirnThemeScript } from './kvirn-theme-script.tsx'

// Its own file, so hydration runs against this page's untouched document theme store.

let root: Root | undefined

afterEach(() => {
  root?.unmount()
  localStorage.clear()
})

test('server render and hydration match, then the stored theme applies', async () => {
  localStorage.setItem(themeStorageKey, JSON.stringify({ colorScheme: 'dark' }))
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
      <KvirnThemeScript nonce="r4nd0m" />
      <main>
        <ProviderFixture />
        <ThemeSwitcherFixture />
      </main>
    </KvirnProvider>
  )

  const serverHtml = renderToString(app)
  const container = document.createElement('div')
  container.innerHTML = serverHtml
  document.body.append(container)
  // The server knows nothing about the visitor: defaults, and no env.
  expect(container.textContent).toContain('Används nu: Ljust, Normal kontrast')

  const recoverableErrors: unknown[] = []
  const consoleError = vi.spyOn(console, 'error')
  root = hydrateRoot(container, app, {
    onRecoverableError: (error) => {
      recoverableErrors.push(error)
    },
  })

  await expect.element(page.getByRole('radio', { name: 'Mörkt' })).toBeChecked()
  await expect.element(page.getByText('Används nu: Mörkt, Normal kontrast')).toBeVisible()
  expect(recoverableErrors).toEqual([])
  expect(consoleError).not.toHaveBeenCalled()
  consoleError.mockRestore()
})
