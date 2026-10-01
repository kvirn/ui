import '@kvirn-ui/theme/theme.css'
import '../app/docs.css'
import { getDefaultEnv, getThemeStore } from '@kvirn-ui/core'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { messages } from '../messages/en.ts'
import { PageHeading } from './page-heading.tsx'
import { SiteShell } from './site-shell.tsx'

// Docs site shell (docs/design/docs-site.md §5 and §7): skip link, landmarks, the Menu and
// Display settings disclosures, the current page, and focus after client-side navigation.

const text = messages.docs

function Page({ title }: { title: string }) {
  return (
    <>
      <PageHeading>{title}</PageHeading>
      <p>A page about {title}.</p>
    </>
  )
}

afterEach(() => {
  // Back to `system`, which removes the stored key, so no choice leaks into other tests.
  const themeStore = getThemeStore(getDefaultEnv())
  themeStore.actions.selectColorScheme('system')
  themeStore.actions.selectContrast('system')
})

describe('SiteShell', () => {
  test('has one banner, documentation navigation, main and contentinfo landmark', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    await expect.element(screen.getByRole('banner')).toBeVisible()
    await expect.element(screen.getByRole('navigation', { name: text.nav.label })).toBeVisible()
    await expect.element(screen.getByRole('main')).toHaveAttribute('id', 'main')
    await expect.element(screen.getByRole('contentinfo').getByText(text.footer.claim)).toBeVisible()
  })

  test('the page content is prose, styled by the theme (ADR-0018)', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Button' }).element()
    const article = heading.closest('[data-kv-prose]')
    expect(article?.parentElement).toBe(screen.getByRole('main').element())
    // docs.css no longer sets the h1's size: the prose heading-1 role (1.75rem) does.
    expect(getComputedStyle(heading).fontSize).toBe('28px')
  })

  test('the skip link is the first Tab stop and moves focus to main', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    await userEvent.keyboard('{Tab}')
    const skipLink = screen.getByRole('link', { name: text.skipLink })
    await expect.element(skipLink).toHaveFocus()
    await expect.element(skipLink).toHaveAttribute('href', '#main')
    await userEvent.keyboard('{Enter}')
    await expect.element(screen.getByRole('main')).toHaveFocus()
  })

  test('marks the current page in the navigation', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    // Below 64rem the list is behind Menu, as at the test viewport's width.
    await userEvent.click(screen.getByRole('button', { name: text.nav.menuButton }))
    const navigation = screen.getByRole('navigation', { name: text.nav.label })
    await expect
      .element(navigation.getByRole('link', { name: 'Button' }))
      .toHaveAttribute('aria-current', 'page')
    await expect
      .element(navigation.getByRole('link', { name: 'Link' }))
      .not.toHaveAttribute('aria-current')
  })

  test('Menu is a disclosure for the navigation list', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    const menu = screen.getByRole('button', { name: text.nav.menuButton })
    await expect.element(menu).toHaveAttribute('aria-expanded', 'false')
    await expect.element(menu).toHaveAttribute('aria-controls', 'docs-nav-list')
    await userEvent.click(menu)
    await expect.element(menu).toHaveAttribute('aria-expanded', 'true')
    await expect.element(menu).toHaveFocus()
    await userEvent.click(menu)
    await expect.element(menu).toHaveAttribute('aria-expanded', 'false')
  })

  test('Display settings change the theme with native radios, and focus stays put', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    const toggle = screen.getByRole('button', { name: text.display.button })
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true')

    const colorScheme = screen.getByRole('group', { name: text.display.colorScheme.legend })
    const dark = colorScheme.getByRole('radio', { name: text.display.colorScheme.dark })
    await userEvent.click(dark)
    await expect.element(dark).toBeChecked()
    await expect.element(dark).toHaveFocus()
    expect(document.documentElement.getAttribute('data-kv-color-scheme')).toBe('dark')
    await expect
      .element(screen.getByText(text.display.inUse({ colorScheme: 'dark', contrast: 'standard' })))
      .toBeVisible()

    const contrast = screen.getByRole('group', { name: text.display.contrast.legend })
    await userEvent.click(contrast.getByRole('radio', { name: text.display.contrast.more }))
    expect(document.documentElement.getAttribute('data-kv-contrast')).toBe('more')
    await expect
      .element(screen.getByText(text.display.inUse({ colorScheme: 'dark', contrast: 'high' })))
      .toBeVisible()
    await expect.element(screen.getByText(text.display.storageNote)).toBeVisible()
  })

  test('does not move focus on the first render', async () => {
    await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    expect(document.activeElement).toBe(document.body)
  })

  test('after client-side navigation, focus moves to the new h1 and the menu closes', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    const menu = screen.getByRole('button', { name: text.nav.menuButton })
    await userEvent.click(menu)
    await expect.element(menu).toHaveAttribute('aria-expanded', 'true')

    await screen.rerender(
      <SiteShell pathname="/components/link">
        <Page title="Link" />
      </SiteShell>,
    )
    await expect.element(screen.getByRole('heading', { level: 1, name: 'Link' })).toHaveFocus()
    await expect.element(menu).toHaveAttribute('aria-expanded', 'false')
  })

  test('has no axe violations, with both disclosures open', async () => {
    const screen = await render(
      <SiteShell pathname="/components/button">
        <Page title="Button" />
      </SiteShell>,
    )
    const menu = screen.getByRole('button', { name: text.nav.menuButton })
    const displaySettings = screen.getByRole('button', { name: text.display.button })
    await userEvent.click(menu)
    await userEvent.click(displaySettings)
    await expect.element(menu).toHaveAttribute('aria-expanded', 'true')
    await expect.element(displaySettings).toHaveAttribute('aria-expanded', 'true')
    await expectNoA11yViolations(screen.container)
  })
})
