import { KvirnProvider } from '@kvirn-ui/react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { en } from '@kvirn-ui/i18n/en'
import { messages } from '../messages/en.ts'
import { DocsPage } from './docs-page.tsx'
import { SiteShell } from './site-shell.tsx'
import { accessibilitySettingsHref } from './site-sections.ts'

// Contract: docs/design/docs-shell-mega-menu.md §3, §5 and §7. Component tests load no theme, and
// the viewport is narrow (below 64rem): the Menu and the sidebar button are shown.
const text = messages.docs
const narrowViewport = { width: 414, height: 896 }

beforeEach(async () => {
  await page.viewport(narrowViewport.width, narrowViewport.height)
})

const renderShell = (pathname = '/components/tabs', content: ReactNode = <p>The article.</p>) =>
  render(
    <KvirnProvider locale="en">
      {/* Space around the targets, so the axe target-size rule has room without the theme. */}
      <style>{'a, button { display: inline-block; padding: 8px; margin: 4px; }'}</style>
      <SiteShell pathname={pathname}>
        <DocsPage title="A page">{content}</DocsPage>
      </SiteShell>
    </KvirnProvider>,
  )

const searchInput = () => document.querySelector<HTMLInputElement>('search input')!
const pressKey = (init: KeyboardEventInit) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  document.activeElement?.dispatchEvent(event)
  return event
}
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

  test('the header and the Components panel have no Patterns or Content types entry, while /patterns still renders', async () => {
    await renderShell('/patterns')
    const nav = siteNav().element()
    expect(nav.querySelector('a[href="/patterns"], a[href="/content-types"]')).toBeNull()
    expect(nav.textContent).not.toContain(text.nav.sections.patterns)
    expect(nav.textContent).not.toContain(text.nav.sections.contentTypes)
    expect(document.querySelector('main')?.textContent).toContain('The article.')
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

  test('Tab goes the two skip links, Latest, Accessibility settings, KvirnUI, Menu, the search field and Search', async () => {
    await renderShell()
    const reached: string[] = []
    for (let stop = 0; stop < 8; stop += 1) {
      await userEvent.tab()
      reached.push(document.activeElement?.textContent?.trim() ?? '')
    }
    expect(reached).toEqual([
      en.skipLink.label,
      text.skipLinks.navigation,
      text.header.latest({ status: text.header.status }),
      text.header.accessibilitySettings,
      text.header.home,
      text.nav.menuButton,
      '',
      text.header.searchButton,
    ])
  })

  test.each([
    ['narrow', narrowViewport.width],
    ['wide', 1280],
  ])('Skip to site navigation moves focus to #site-navigation at a %s width', async (_, width) => {
    await page.viewport(width, narrowViewport.height)
    await renderShell()
    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement?.textContent).toBe(text.skipLinks.navigation)
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(document.getElementById('site-navigation'))
  })

  test('the Tools link to Accessibility settings is the current page on its own route, once in the top bar and once in the footer', async () => {
    await renderShell(accessibilitySettingsHref)
    const toolLinks = toolsNav().element().querySelectorAll('a[href="/accessibility-settings"]')
    expect(toolLinks).toHaveLength(1)
    expect(toolLinks[0]?.getAttribute('aria-current')).toBe('page')
    const project = page.getByRole('navigation', { name: text.footer.projectHeading }).element()
    expect(
      project.querySelector('a[href="/accessibility-settings"]')?.getAttribute('aria-current'),
    ).toBe('page')
    expect(countCurrent(toolsNav().element())).toBe(1)
  })

  test('the Accessibility settings link is not the current page elsewhere', async () => {
    await renderShell('/components/tabs')
    expect(
      toolsNav()
        .element()
        .querySelector('a[href="/accessibility-settings"]')
        ?.hasAttribute('aria-current'),
    ).toBe(false)
  })

  test('there is no Display settings button in the header', async () => {
    await renderShell()
    expect(page.getByRole('button', { name: en.displaySettings.button }).query()).toBeNull()
  })

  test('the search input lists the shortcut in aria-keyshortcuts', async () => {
    await renderShell()
    expect(document.querySelector('search input')?.getAttribute('aria-keyshortcuts')).toBe(
      'Control+K',
    )
  })

  test.each([
    ['k', '{Control>}k{/Control}'],
    ['K', '{Control>}K{/Control}'],
  ])('Control+%s focuses the search input and selects its text', async (_, keys) => {
    await renderShell()
    const input = searchInput()
    input.value = 'tabs'
    await userEvent.keyboard(keys)
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(4)
  })

  test('Control+K works again when focus is already in the search input', async () => {
    await renderShell()
    const input = searchInput()
    input.value = 'tabs'
    input.focus()
    input.setSelectionRange(2, 2)
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(4)
  })

  test('Control+K works on a non-Latin layout, by the physical key', async () => {
    await renderShell()
    const event = pressKey({ key: 'л', code: 'KeyK', ctrlKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(searchInput())
  })

  test('Control+K works while a radio has focus', async () => {
    await renderShell(
      '/components/tabs',
      <>
        <input type="radio" aria-label="Choice" />
      </>,
    )
    const radio = document.querySelector<HTMLElement>('input[type="radio"]')!
    radio.focus()
    const event = pressKey({ key: 'k', code: 'KeyK', ctrlKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(searchInput())
  })

  test.each([
    ['Meta', { metaKey: true }],
    ['Shift', { ctrlKey: true, shiftKey: true }],
    ['Alt', { ctrlKey: true, altKey: true }],
    ['no modifier', {}],
  ])('Control+K is not handled with %s', async (_, modifiers) => {
    await renderShell()
    const event = pressKey({ key: 'k', code: 'KeyK', ...modifiers })
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).not.toBe(searchInput())
  })

  test.each([
    ['a contenteditable', <div key="a" contentEditable suppressContentEditableWarning />],
    ['a textarea', <textarea key="b" aria-label="Notes" />],
    ['a text input', <input key="c" aria-label="Other" />],
    [
      'a select',
      <select key="d" aria-label="Pick">
        <option>One</option>
      </select>,
    ],
  ])('Control+K is left alone inside %s', async (_, field) => {
    await renderShell('/components/tabs', field)
    const target = document.querySelector<HTMLElement>(
      'main :is([contenteditable], textarea, input, select)',
    )!
    target.focus()
    const event = pressKey({ key: 'k', code: 'KeyK', ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(target)
  })

  test('Control+K does nothing when another handler already prevented it', async () => {
    await renderShell()
    const stop = (event: KeyboardEvent) => event.preventDefault()
    document.addEventListener('keydown', stop, true)
    pressKey({ key: 'k', code: 'KeyK', ctrlKey: true })
    document.removeEventListener('keydown', stop, true)
    expect(document.activeElement).not.toBe(searchInput())
  })

  test('on an Apple platform Command+K is handled and Control+K is not', async () => {
    const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    try {
      await renderShell()
      expect(searchInput().getAttribute('aria-keyshortcuts')).toBe('Meta+K')
      expect(pressKey({ key: 'k', code: 'KeyK', ctrlKey: true }).defaultPrevented).toBe(false)
      expect(pressKey({ key: 'k', code: 'KeyK', metaKey: true }).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(searchInput())
    } finally {
      platform.mockRestore()
    }
  })

  test('aria-keyshortcuts and the shortcut are removed when the shell unmounts', async () => {
    const screen = await renderShell()
    const input = searchInput()
    await screen.unmount()
    expect(input.hasAttribute('aria-keyshortcuts')).toBe(false)
    expect(pressKey({ key: 'k', code: 'KeyK', ctrlKey: true }).defaultPrevented).toBe(false)
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
    await renderShell('/components/top-bar')
    const pager = page.getByRole('navigation', { name: text.pager.label })
    const previous = pager.getByRole('link', { name: `${text.pager.previous} Tabs` })
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
