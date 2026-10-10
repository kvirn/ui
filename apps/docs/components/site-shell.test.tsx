import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { SiteShell } from './site-shell.tsx'

// Contract: docs/design/docs-header-bands.md §7. Component tests load no theme: the viewport
// decides narrow (below 40rem) or wide.
const text = messages.docs
const narrowViewport = { width: 414, height: 896 }
const wideViewport = { width: 1280, height: 800 }

afterEach(async () => {
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
const siteNav = () => page.getByRole('navigation', { name: text.header.navLabel })
const menuButton = () => page.getByRole('button', { name: text.nav.menuButton })

describe('Docs site header', () => {
  test('there is one banner and the Tools and Site navigations are named', async () => {
    await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    expect(document.querySelectorAll('header, [role="banner"]')).toHaveLength(1)
    await expect.element(toolsNav()).toBeVisible()
    await expect.element(siteNav()).toBeVisible()
  })

  test('Tools has Documentation as its one current item', async () => {
    await renderShell()
    const current = toolsNav().element().querySelectorAll('[aria-current]')
    expect(current).toHaveLength(1)
    expect(current[0]?.textContent).toBe(text.header.tools.docs)
    expect(current[0]?.getAttribute('aria-current')).toBe('true')
  })

  test('Site has one current item, the section of the page', async () => {
    await renderShell()
    const current = siteNav().element().querySelectorAll('[aria-current]')
    expect(current).toHaveLength(1)
    expect(current[0]?.textContent).toBe(text.nav.sections.components)
  })

  test('the name of the GitHub link includes that it opens in a new tab', async () => {
    await renderShell()
    const github = page.getByRole('link', {
      name: `${text.header.tools.github} (opens in a new tab)`,
    })
    await expect.element(github).toBeVisible()
    expect(github.element().getAttribute('target')).toBe('_blank')
    expect(github.element().getAttribute('rel')).toContain('noopener')
  })

  test('there is no Storybook link', async () => {
    const { container } = await renderShell()
    expect(container.querySelector('header')?.textContent).not.toContain('Storybook')
  })

  test('Latest links to the status on the Get started page', async () => {
    await renderShell()
    const latest = page.getByRole('link', {
      name: text.header.latest({ status: text.header.status }),
    })
    expect(latest.element().getAttribute('href')).toBe('/docs#status')
  })

  test('the Menu controls the Site navigation and the sidebar on a narrow screen', async () => {
    await page.viewport(narrowViewport.width, narrowViewport.height)
    await renderShell()
    await expect
      .poll(() => menuButton().element().getAttribute('aria-controls'))
      .toBe('docs-site-nav docs-sidebar')
    expect(menuButton().element().getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(menuButton())
    expect(menuButton().element().getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById('docs-site-nav')).not.toBeNull()
    expect(document.getElementById('docs-sidebar')).not.toBeNull()
  })

  test('the Menu controls only the sidebar from 40rem', async () => {
    await page.viewport(wideViewport.width, wideViewport.height)
    await renderShell()
    await expect
      .poll(() => menuButton().element().getAttribute('aria-controls'))
      .toBe('docs-sidebar')
  })

  test('Tab goes Latest, Tools, brand, Menu, Display settings, then the Site links', async () => {
    await renderShell()
    const reached: string[] = []
    for (let stop = 0; stop < 13; stop += 1) {
      await userEvent.tab()
      reached.push(document.activeElement?.textContent?.trim() ?? '')
    }
    expect(reached.slice(1, 12)).toEqual([
      text.header.latest({ status: text.header.status }),
      text.header.tools.docs,
      `${text.header.tools.github} (opens in a new tab)`,
      text.header.home,
      text.nav.menuButton,
      text.display.button,
      text.nav.sections.home,
      text.nav.sections.docs,
      text.nav.sections.components,
      text.nav.sections.patterns,
      text.nav.sections.contentTypes,
    ])
  })

  test('the header has no axe violations', async () => {
    const { container } = await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
