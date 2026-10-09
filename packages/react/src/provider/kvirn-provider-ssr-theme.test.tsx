import {
  colorSchemeAttribute,
  contrastAttribute,
  motionAttribute,
  themeStorageKey,
} from '@kvirn-ui/core'
import { sv } from '@kvirn-ui/i18n/sv'
import { afterEach, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { KvirnProvider } from './kvirn-provider.tsx'
import { ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'
import { hydrate, runInlineScripts, serverRender } from './kvirn-provider-ssr.fixture.tsx'
import { KvirnThemeScript } from './kvirn-theme-script.tsx'

// Its own file: hydration mutates <html>, and the document theme store must be untouched.

let hydrated: ReturnType<typeof hydrate> | undefined

afterEach(() => {
  hydrated?.root.unmount()
  hydrated?.consoleError.mockRestore()
  localStorage.clear()
})

test('hydration with a stored theme keeps the attributes the script set and the radios reflect it', async () => {
  localStorage.setItem(
    themeStorageKey,
    JSON.stringify({ colorScheme: 'dark', contrast: 'more', motion: 'reduce' }),
  )
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
      <KvirnThemeScript nonce="r4nd0m" />
      <ThemeSwitcherFixture />
    </KvirnProvider>
  )
  const container = serverRender(app)
  runInlineScripts(container)
  const root = document.documentElement
  const attributesBefore = [colorSchemeAttribute, contrastAttribute, motionAttribute].map(
    (attribute) => root.getAttribute(attribute),
  )
  expect(attributesBefore).toEqual(['dark', 'more', 'reduce'])
  hydrated = hydrate(container, app)

  await expect.element(page.getByRole('radio', { name: 'Mörkt' })).toBeChecked()
  await expect.element(page.getByRole('radio', { name: 'Hög kontrast' })).toBeChecked()
  await expect.element(page.getByRole('radio', { name: 'Mindre rörelse' })).toBeChecked()
  expect(
    [colorSchemeAttribute, contrastAttribute, motionAttribute].map((attribute) =>
      root.getAttribute(attribute),
    ),
  ).toEqual(attributesBefore)
  expect(hydrated.recoverableErrors).toEqual([])
  expect(hydrated.consoleError).not.toHaveBeenCalled()
})
