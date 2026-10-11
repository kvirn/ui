import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { beforeEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { en } from '@kvirn-ui/i18n/en'
import { messages } from '../messages/en.ts'
import { DocsPage } from './docs-page.tsx'
import { SiteShell } from './site-shell.tsx'
import { contentTypePages } from './site-sections.ts'

// Contract: docs/design/docs-shell-mega-menu.md §3, §5 and §7. Component tests load no theme, and
// the viewport is narrow (below 64rem): the Menu and the sidebar button are shown.
const text = messages.docs
const narrowViewport = { width: 414, height: 896 }

beforeEach(async () => {
  await page.viewport(narrowViewport.width, narrowViewport.height)
})

const renderShell = (pathname = '/components/tabs') =>
  render(
    <KvirnProvider locale="en">
      {/* Space around the targets, so the axe target-size rule has room without the theme. */}
      <style>{'a, button { display: inline-block; padding: 8px; margin: 4px; }'}</style>
      <SiteShell pathname={pathname}>
        <DocsPage title="A page">
          <p>The article.</p>
        </DocsPage>
      </SiteShell>
    </KvirnProvider>,
  )

const toolsNav = () => page.getByRole('navigation', { name: text.header.toolsLabel })
// The Menu panel is `hidden` while closed below 64rem, so the query includes hidden elements.
const siteNav = () =>
  page.getByRole('navigation', { name: text.header.navLabel, includeHidden: true })
const sidebarButton = (section: string) =>
  page.getByRole('button', { name: text.nav.sidebarButton({ section }) })
const countCurrent = (landmark: Element) => landmark.querySelectorAll('[aria-current]').length

describe('Docs site header', () => {
  test('there is one banner, and the Tools and Site navigations and the search are named', async () => {
    await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    expect(document.querySelectorAll('header, [role="banner"]')).toHaveLength(1)
    await expect.element(toolsNav()).toBeVisible()
    expect(siteNav().element()).not.toBeNull()
    expect(document.querySelectorAll('search')).toHaveLength(1)
  })

  test('the Site navigation has three items: Get started, the Components topic and Theming', async () => {
    await renderShell()
    const nav = siteNav().element()
    const topLevel = [...nav.querySelectorAll(':scope > ul > li > :is(a, button)')].map(
      (item) => item.textContent,
    )
    expect(topLevel).toEqual([
      text.nav.sections.docs,
      text.nav.sections.components,
      text.nav.sections.theming,
    ])
    expect([...nav.querySelectorAll('button')].map((button) => button.textContent)).toEqual([
      text.nav.sections.components,
    ])
  })

  test('Patterns and Content types are the last groups of the Components panel', async () => {
    await renderShell()
    const panel = siteNav().element().querySelector('.kv-mega-menu-panel')!
    const groupLinks = [...panel.querySelectorAll('a')]
    expect(groupLinks.find((link) => link.getAttribute('href') === '/patterns')?.textContent).toBe(
      text.nav.sections.patterns,
    )
    const contentTypes = panel.querySelector('a[href="/content-types"]')!
    expect(contentTypes.textContent).toBe(text.nav.sections.contentTypes)
    expect(contentTypes.closest('li')?.querySelectorAll(':scope > ul a')).toHaveLength(
      contentTypePages.length,
    )
    expect(panel.querySelectorAll('ul:empty')).toHaveLength(0)
  })

  test('a content type page marks its own link once, in an open Components panel', async () => {
    await renderShell('/content-types/subpage')
    await userEvent.click(page.getByRole('button', { name: text.nav.menuButton }))
    await userEvent.click(page.getByRole('button', { name: text.nav.sections.components }))
    const nav = siteNav().element()
    expect(countCurrent(nav)).toBe(1)
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Subpage')
  })

  test('the Components panel opens on a button and marks the page the reader is on', async () => {
    await renderShell('/components/tabs')
    await userEvent.click(page.getByRole('button', { name: text.nav.menuButton }))
    await userEvent.click(page.getByRole('button', { name: text.nav.sections.components }))
    const nav = siteNav().element()
    expect(countCurrent(nav)).toBe(1)
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Tabs')
    expect(nav.querySelector('a[href="/components"]')?.textContent).toBe(text.nav.allComponents)
    expect(nav.querySelector('a[href="/components/wayfinding"]')?.textContent).toBe(
      text.nav.componentGroups.wayfinding,
    )
  })

  test('a page the menu does not list marks its section link, once', async () => {
    await renderShell('/foundation/kvirn-provider')
    const nav = siteNav().element()
    expect(countCurrent(nav)).toBe(1)
    expect(nav.querySelector('[aria-current]')?.textContent).toBe(text.nav.sections.docs)
  })

  test('Tab goes Latest, GitHub, Display settings, KvirnUI, Menu, the search field and Search', async () => {
    await renderShell()
    const reached: string[] = []
    for (let stop = 0; stop < 8; stop += 1) {
      await userEvent.tab()
      reached.push(document.activeElement?.textContent?.trim() ?? '')
    }
    expect(reached.slice(1, 8)).toEqual([
      text.header.latest({ status: text.header.status }),
      `${text.header.tools.github} (opens in a new tab)`,
      en.displaySettings.button,
      text.header.home,
      text.nav.menuButton,
      '',
      text.header.searchButton,
    ])
  })

  test('the header has no axe violations', async () => {
    const { container } = await renderShell()
    await expect.element(page.getByRole('banner')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('Docs site sidebar', () => {
  test('a component page has no sidebar', async () => {
    await renderShell('/components/button')
    expect(document.getElementById('docs-sidebar')).toBeNull()
    expect(document.querySelector('.docs-sidebar-toggle')).toBeNull()
  })

  test.each(['/components', '/patterns', '/content-types', '/foundation/theming', '/search'])(
    '%s has no sidebar',
    async (pathname) => {
      await renderShell(pathname)
      expect(document.getElementById('docs-sidebar')).toBeNull()
    },
  )

  test('Get started keeps its sidebar, reachable from its own button, which no link shares a name with', async () => {
    await renderShell('/foundation/rendering')
    const button = sidebarButton(text.nav.sections.docs)
    expect(button.element().getAttribute('aria-controls')).toBe('docs-sidebar')
    expect(button.element().getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(button)
    expect(button.element().getAttribute('aria-expanded')).toBe('true')
    const sidebar = page.getByRole('navigation', { name: text.nav.sections.docs })
    await expect.element(sidebar).toBeVisible()
    expect(countCurrent(sidebar.element())).toBe(1)
    expect(sidebar.element().querySelectorAll('a')).toHaveLength(4)
  })
})

describe('Docs page intro and pager', () => {
  test('the breadcrumb marks the page itself, once', async () => {
    await renderShell('/components/tabs')
    const trail = page.getByRole('navigation', { name: en.breadcrumb.label })
    expect(trail.element().querySelector('[aria-current="page"]')?.textContent).toBe('Tabs')
    expect(countCurrent(trail.element())).toBe(1)
  })

  test('a page that would give a one-item trail has no breadcrumb', async () => {
    await renderShell('/components')
    expect(page.getByRole('navigation', { name: en.breadcrumb.label }).query()).toBeNull()
  })

  test('the h1 is the only heading level one, inside main, in the intro band', async () => {
    await renderShell()
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('main')?.firstElementChild?.querySelector('h1')).not.toBeNull()
  })

  test('the pager links the previous and the next page of the section, named by direction and title', async () => {
    await renderShell('/components/tabs')
    const pager = page.getByRole('navigation', { name: text.pager.label })
    const previous = pager.getByRole('link', { name: `${text.pager.previous} TableOfContents` })
    const next = pager.getByRole('link', { name: `${text.pager.next} Calendar` })
    expect(previous.element().getAttribute('rel')).toBe('prev')
    expect(next.element().getAttribute('rel')).toBe('next')
  })

  test('the first page has only a next link', async () => {
    await renderShell('/components/button')
    const pager = page.getByRole('navigation', { name: text.pager.label })
    expect(pager.element().querySelectorAll('a')).toHaveLength(1)
    expect(pager.element().querySelector('a')?.getAttribute('rel')).toBe('next')
  })

  test('a page with neither a previous nor a next page has no pager', async () => {
    await renderShell('/components')
    expect(page.getByRole('navigation', { name: text.pager.label }).query()).toBeNull()
  })
})

describe('Docs site footer', () => {
  test('the footer is the one contentinfo, with the Sections and Project navigations', async () => {
    await renderShell('/components/tabs')
    expect(document.querySelectorAll('footer, [role="contentinfo"]')).toHaveLength(1)
    const sections = page.getByRole('navigation', { name: text.footer.sectionsHeading })
    const project = page.getByRole('navigation', { name: text.footer.projectHeading })
    expect([...sections.element().querySelectorAll('a')].map((link) => link.textContent)).toEqual([
      text.nav.sections.docs,
      text.nav.sections.components,
      text.nav.sections.patterns,
      text.nav.sections.contentTypes,
      text.nav.sections.theming,
    ])
    expect(countCurrent(sections.element())).toBe(1)
    expect(project.element().querySelector('a[href="/docs#status"]')?.textContent).toBe(
      text.footer.status({ status: text.header.status }),
    )
    expect(project.element().textContent).toContain(
      `${text.header.tools.github} (opens in a new tab)`,
    )
  })

  test('every navigation of the shell has its own name', async () => {
    await renderShell('/foundation/rendering')
    const names = [...document.querySelectorAll('nav')].map(
      (nav) =>
        nav.getAttribute('aria-label') ??
        document.getElementById(nav.getAttribute('aria-labelledby') ?? '')?.textContent,
    )
    expect(names.every((name) => name !== undefined && name !== '')).toBe(true)
    expect(new Set(names).size).toBe(names.length)
  })

  test('the whole page has no axe violations', async () => {
    const { container } = await renderShell('/components/tabs')
    await expect.element(page.getByRole('contentinfo')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('the whole page with the sidebar has no axe violations', async () => {
    const { container } = await renderShell('/foundation/rendering')
    await expect.element(page.getByRole('contentinfo')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
