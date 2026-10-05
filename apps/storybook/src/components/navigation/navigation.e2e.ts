import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/navigation/navigation.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The links own Enter (link.a11y.md): these
// prove the navigation gets in the way of none of them.

const storyUrl = (story: string) => `/iframe.html?id=components-navigation--${story}&viewMode=story`

async function openStory(page: Page, story: string, navigationName = 'Huvudmeny') {
  await page.goto(storyUrl(story))
  await expect(page.getByRole('navigation', { name: navigationName })).toBeVisible()
}

const link = (page: Page, name: string) => page.getByRole('link', { name, exact: true })

test.describe('Navigation keyboard contract', () => {
  test('Tab moves through the links in DOM order, nested ones included', async ({ page }) => {
    await openStory(page, 'keyboard')
    for (const name of [
      'Hoppa till innehållet',
      'Start',
      'Bygga och bo',
      'Bygglov',
      'Om oss',
      'Kontakta oss',
    ]) {
      await page.keyboard.press('Tab')
      await expect(link(page, name)).toBeFocused()
    }
    // Neither the navigation nor a list is ever a Tab stop.
    await expect(page.locator('.kv-navigation:focus, .kv-navigation-list:focus')).toHaveCount(0)
  })

  test('Shift+Tab moves back through the links, then out of the navigation', async ({ page }) => {
    await openStory(page, 'keyboard')
    await link(page, 'Kontakta oss').focus()
    for (const name of ['Om oss', 'Bygglov', 'Bygga och bo', 'Start']) {
      await page.keyboard.press('Shift+Tab')
      await expect(link(page, name)).toBeFocused()
    }
    await page.keyboard.press('Shift+Tab')
    await expect(link(page, 'Hoppa till innehållet')).toBeFocused()
    await expect(page.getByRole('navigation').locator(':focus')).toHaveCount(0)
  })

  test('Enter follows the link', async ({ page }) => {
    await openStory(page, 'keyboard')
    await link(page, 'Om oss').focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#om-oss$/)
    // Native fragment navigation: the target becomes the focus navigation starting point.
    await expect(page.locator(':target')).toHaveAccessibleName('Om oss')
  })

  test('Arrow keys, Home and End are not handled', async ({ page }) => {
    await openStory(page, 'keyboard')
    const start = link(page, 'Start')
    await start.focus()
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'End', 'Home']) {
      await page.keyboard.press(key)
      await expect(start).toBeFocused()
    }
    // The same in a horizontal bar, left to right and right to left: no key moves focus.
    for (const story of ['horizontal', 'rtl']) {
      await openStory(page, story, story === 'rtl' ? 'Main menu' : 'Huvudmeny')
      const first = page.getByRole('navigation').first().getByRole('link').first()
      await first.focus()
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'End', 'Home']) {
        await page.keyboard.press(key)
        await expect(first).toBeFocused()
      }
    }
  })

  test('Tab skips a collapsed group', async ({ page }) => {
    await openStory(page, 'collapsed-groups')
    // The two groups sit between these links in the DOM. A hidden link that took focus would
    // show up here, in place of the next visible one.
    for (const name of ['Start', 'Bygga och bo', 'Trafik och resor', 'Om kommunen']) {
      await page.keyboard.press('Tab')
      await expect(link(page, name)).toBeFocused()
    }
    // The groups are collapsed with hidden, never unmounted: their links are still in the DOM.
    for (const name of ['Bygglov', 'Bygga om', 'Parkering', 'Kollektivtrafik']) {
      const collapsed = page.getByRole('link', { name, exact: true, includeHidden: true })
      await expect(collapsed).toHaveCount(1)
      await expect(collapsed).toBeHidden()
    }
  })
})

test.describe('Navigation focus and modes', () => {
  test('a key-focused navigation link shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const start = link(page, 'Start')
    await expect(start).toBeFocused()
    await expect(start).toHaveAttribute('data-focus-visible', '')
    expect(await start.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('no horizontal scrolling at 320px with the Finnish text (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-text', 'Päävalikko')
    await expect(link(page, 'Rakennus- ja toimenpidelupahakemuksen liitteet')).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })

  test('no horizontal scrolling at 320px with the horizontal Finnish text (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'horizontal-long-finnish-text', 'Päävalikko')
    await expect(link(page, 'Rakennus- ja toimenpidelupahakemuksen liitteet')).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Navigation accessibility', () => {
  test('a11y tree of the main menu', async ({ page }) => {
    await openStory(page, 'default')
    await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toMatchAriaSnapshot(`
      - navigation "Huvudmeny":
        - list:
          - listitem:
            - link "Start"
          - listitem:
            - link "Bygga och bo"
            - list:
              - listitem:
                - link "Bygglov"
              - listitem:
                - link "Bygga om"
          - listitem:
            - link "Om oss"
    `)
    await expect(link(page, 'Bygglov')).toHaveAttribute('aria-current', 'page')
    await expect(link(page, 'Start')).not.toHaveAttribute('aria-current')
  })

  test('two navigations are two landmarks with two names', async ({ page }) => {
    await openStory(page, 'two-navigations')
    await expect(page.getByRole('navigation')).toHaveCount(2)
    await expect(page.getByRole('navigation', { name: 'Sidfot' })).toBeVisible()
  })

  const stories = [
    ['default', 'Huvudmeny'],
    ['keyboard', 'Huvudmeny'],
    ['horizontal', 'Huvudmeny'],
    ['active-trail', 'Handläggning'],
    ['collapsed-groups', 'Huvudmeny'],
    ['page-not-in-the-menu', 'Huvudmeny'],
    ['labelled-by-heading', 'I det här avsnittet'],
    ['two-navigations', 'Huvudmeny'],
    ['with-service-link', 'Huvudmeny'],
    ['compact-density', 'Huvudmeny'],
    ['long-finnish-text', 'Päävalikko'],
    ['horizontal-long-finnish-text', 'Päävalikko'],
    ['focus-visible', 'Huvudmeny'],
    ['router-link', 'Huvudmeny'],
    ['rtl', 'Main menu'],
    ['forced-colors', 'Huvudmeny'],
  ] as const

  for (const [story, navigationName] of stories) {
    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, navigationName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
