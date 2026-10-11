import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { beforeEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { en } from '@kvirn-ui/i18n/en'
import { messages } from '../messages/en.ts'
import { SiteShell } from './site-shell.tsx'

// Contract: docs/design/docs-header-bands.md §7. Component tests load no theme, and the viewport is
// narrow (below 64rem): the Menu and the sidebar button are shown.
const text = messages.docs
const narrowViewport = { width: 414, height: 896 }

beforeEach(async () => {
  await page.viewport(narrowViewport.width, narrowViewport.height)
})

const renderShell = (pathname = '/components/button') =>
  render(
    <KvirnProvider locale="en">
      {/* Space around the targets, so the axe target-size rule has room without the theme. */}
      <style>{'a, button { display: inline-block; padding: 8px; margin: 4px; }'}</style>
      <SiteShell pathname={pathname}>
        <h1 tabIndex={-1}>A page</h1>
      </SiteShell>
    </KvirnProvider>,
  )

const toolsNav = () => page.getByRole('navigation', { name: text.header.toolsLabel })
// The Menu panel is `hidden` while closed below 64rem, so the query includes hidden elements.
const siteNav = () =>
  page.getByRole('navigation', { name: text.header.navLabel, includeHidden: true })
const sidebarButton = () =>
  page.getByRole('button', {
    name: text.nav.sidebarButton({ section: text.nav.sections.components }),
  })

describe('Docs site header', () => {
  test('there is one banner and the Tools and Site navigations are named', async () => {
    await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    expect(document.querySelectorAll('header, [role="banner"]')).toHaveLength(1)
    await expect.element(toolsNav()).toBeVisible()
    expect(siteNav().element()).not.toBeNull()
  })

  test('the sidebar is reachable from its own button, which no link shares a name with', async () => {
    await renderShell()
    expect(sidebarButton().element().getAttribute('aria-controls')).toBe('docs-sidebar')
    expect(sidebarButton().element().getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(sidebarButton())
    expect(sidebarButton().element().getAttribute('aria-expanded')).toBe('true')
    await expect
      .element(page.getByRole('navigation', { name: text.nav.sections.components }))
      .toBeVisible()
  })

  test('Tab goes Latest, GitHub, Display settings, KvirnUI, Search, Menu, then the sidebar button', async () => {
    await renderShell()
    const reached: string[] = []
    for (let stop = 0; stop < 9; stop += 1) {
      await userEvent.tab()
      reached.push(document.activeElement?.textContent?.trim() ?? '')
    }
    expect(reached.slice(1, 9)).toEqual([
      text.header.latest({ status: text.header.status }),
      `${text.header.tools.github} (opens in a new tab)`,
      en.displaySettings.button,
      text.header.home,
      '',
      text.header.searchButton,
      text.nav.menuButton,
      text.nav.sidebarButton({ section: text.nav.sections.components }),
    ])
  })

  test('the header has no axe violations', async () => {
    const { container } = await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
