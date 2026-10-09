import { afterEach, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'
import { hydrate, serverRender } from './kvirn-provider-ssr.fixture.tsx'

// Its own file: without a provider, useTheme() uses this page's real document store.

let hydrated: (ReturnType<typeof hydrate> & { container: HTMLElement }) | undefined

afterEach(() => {
  hydrated?.root.unmount()
  hydrated?.consoleError.mockRestore()
  localStorage.clear()
})

test('useTheme without a provider server-renders and hydrates without errors', async () => {
  const app = <ThemeSwitcherFixture />
  const container = serverRender(app)
  hydrated = { container, ...hydrate(container, app) }
  expect(hydrated.container.textContent).toContain('In use: Light, Standard contrast, Full motion')

  await expect.element(page.getByRole('radio', { name: 'Follow system' }).first()).toBeChecked()
  expect(hydrated.recoverableErrors).toEqual([])
  expect(hydrated.consoleError).not.toHaveBeenCalled()
})
