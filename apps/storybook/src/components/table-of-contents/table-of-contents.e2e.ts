import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/table-of-contents/table-of-contents.a11y.md › Keyboard, Focus
// management and Visual / modes. One test per row, named after it. The links are native hash
// links: these prove the contents list gets in the way of none of their keys, and that following
// one lands the reader where the page says (scroll-padding-top, the next Tab).

const storyUrl = (story: string) =>
  `/iframe.html?id=components-tableofcontents--${story}&viewMode=story`

async function openStory(page: Page, story: string, navigationName = 'På den här sidan') {
  await page.goto(storyUrl(story))
  await expect(page.getByRole('navigation', { name: navigationName })).toBeVisible()
}

const link = (page: Page, name: string) => page.getByRole('link', { name, exact: true })

/** Scrolls a heading to the top of the page, the way a reader scrolling to it would. */
async function scrollToHeading(page: Page, name: string) {
  await page
    .getByRole('heading', { name, exact: true })
    .evaluate((element) => element.scrollIntoView({ block: 'start' }))
}

test.describe('TableOfContents keyboard contract', () => {
  test('Tab moves through the links in DOM order, nested ones included', async ({ page }) => {
    await openStory(page, 'keyboard')
    for (const name of [
      'Hoppa till första avsnittet',
      'Vem behöver bygglov?',
      'Så ansöker du',
      'Ritningar',
      'Avgifter',
      'Efter beslutet',
      'Kontakta oss',
    ]) {
      await page.keyboard.press('Tab')
      await expect(link(page, name)).toBeFocused()
    }
    // Neither the landmark, a list nor an item is ever a Tab stop.
    await expect(
      page.locator(
        '.kv-table-of-contents:focus, .kv-table-of-contents-list:focus, .kv-table-of-contents-item:focus',
      ),
    ).toHaveCount(0)
  })

  test('Shift+Tab moves back through the links, then out of the contents', async ({ page }) => {
    await openStory(page, 'keyboard')
    await link(page, 'Kontakta oss').focus()
    for (const name of [
      'Efter beslutet',
      'Avgifter',
      'Ritningar',
      'Så ansöker du',
      'Vem behöver bygglov?',
      'Hoppa till första avsnittet',
    ]) {
      await page.keyboard.press('Shift+Tab')
      await expect(link(page, name)).toBeFocused()
    }
    await expect(page.getByRole('navigation').locator(':focus')).toHaveCount(0)
  })

  test('Enter scrolls to the heading, and the next Tab continues after it', async ({ page }) => {
    await openStory(page, 'keyboard')
    await link(page, 'Avgifter').focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#keyboard-avgifter$/)
    // Native fragment navigation: the heading is the target and is brought into view.
    await expect(page.locator(':target')).toHaveAccessibleName('Avgifter')
    await expect(page.getByRole('heading', { name: 'Avgifter', exact: true })).toBeInViewport()
    // The browser moves its sequential focus starting point to the heading, so the next Tab goes
    // into the section, not to the next link of the contents.
    await page.keyboard.press('Tab')
    await expect(link(page, 'Läs om vem som behöver bygglov')).toBeFocused()
  })

  test('Arrow keys, Home and End are not handled', async ({ page }) => {
    await openStory(page, 'keyboard')
    const start = link(page, 'Så ansöker du')
    await start.focus()
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'End', 'Home']) {
      await page.keyboard.press(key)
      await expect(start).toBeFocused()
    }
  })
})

test.describe('TableOfContents current heading', () => {
  test("scrolling makes the heading's link current", async ({ page }) => {
    await openStory(page, 'default')
    const current = page.locator('a[aria-current]')
    // Nothing is current until the reader has passed the first heading.
    await expect(current).toHaveCount(0)
    await scrollToHeading(page, 'Avgifter')
    await expect(link(page, 'Avgifter')).toHaveAttribute('aria-current', 'location')
    await expect(current).toHaveCount(1)
    await scrollToHeading(page, 'Så ansöker du')
    await expect(link(page, 'Så ansöker du')).toHaveAttribute('aria-current', 'location')
    await expect(link(page, 'Avgifter')).not.toHaveAttribute('aria-current')
    await expect(current).toHaveCount(1)
    // Back above the first heading, nothing is current again.
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(current).toHaveCount(0)
  })

  test('a clicked link becomes current', async ({ page }) => {
    await openStory(page, 'default')
    await link(page, 'Så ansöker du').click()
    await expect(page).toHaveURL(/#default-sa-ansoker-du$/)
    await expect(page.getByRole('heading', { name: 'Så ansöker du', exact: true })).toBeInViewport()
    await expect(link(page, 'Så ansöker du')).toHaveAttribute('aria-current', 'location')
    await expect(page.locator('a[aria-current]')).toHaveCount(1)
  })

  test('StickyOffset: Shift+Tab after following a link is not under the header (2.4.11)', async ({
    page,
  }) => {
    await openStory(page, 'sticky-offset')
    await link(page, 'Så ansöker du').click()
    await page.keyboard.press('Shift+Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeInViewport()
    const headerBottom = await page
      .getByText('Kvirnby kommun')
      .evaluate((header) => header.getBoundingClientRect().bottom)
    const focusedTop = await focused.evaluate((element) => element.getBoundingClientRect().top)
    expect(focusedTop).toBeGreaterThanOrEqual(headerBottom)
  })

  test('no focus movement and no live region on change', async ({ page }) => {
    await openStory(page, 'default')
    const first = link(page, 'Vem behöver bygglov?')
    await first.focus()
    // The provider's two live regions are in the page and empty.
    await expect(page.getByRole('status')).toHaveText('')
    await expect(page.getByRole('alert')).toHaveText('')
    await scrollToHeading(page, 'Avgifter')
    await expect(link(page, 'Avgifter')).toHaveAttribute('aria-current', 'location')
    await scrollToHeading(page, 'Så ansöker du')
    await expect(link(page, 'Så ansöker du')).toHaveAttribute('aria-current', 'location')
    // A message would be put in a region within a tenth of a second.
    await page.waitForTimeout(400)
    await expect(first).toBeFocused()
    await expect(page.getByRole('status')).toHaveText('')
    await expect(page.getByRole('alert')).toHaveText('')
  })
})

test.describe('TableOfContents focus and modes', () => {
  test('a key-focused table of contents link shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const first = link(page, 'Vem behöver bygglov?')
    await expect(first).toBeFocused()
    await expect(first).toHaveAttribute('data-focus-visible', '')
    expect(await first.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('no horizontal scrolling at 320px with the Finnish text (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-text', 'Tällä sivulla')
    await expect(
      link(page, 'Rakennus- ja toimenpidelupahakemuksen käsittelyaika ja maksut'),
    ).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('TableOfContents accessibility', () => {
  test('a11y tree of the contents', async ({ page }) => {
    await openStory(page, 'default')
    await expect(page.getByRole('navigation', { name: 'På den här sidan' })).toMatchAriaSnapshot(`
      - navigation "På den här sidan":
        - list:
          - listitem:
            - link "Vem behöver bygglov?"
          - listitem:
            - link "Så ansöker du"
            - list:
              - listitem:
                - link "Ritningar"
              - listitem:
                - link "Avgifter"
          - listitem:
            - link "Efter beslutet"
    `)
  })

  const stories = [
    ['default', 'På den här sidan'],
    ['keyboard', 'På den här sidan'],
    ['levels', 'På den här sidan'],
    ['sticky-offset', 'På den här sidan'],
    ['labelled-by-heading', 'På den här sidan'],
    ['custom-render', 'På den här sidan'],
    ['compact-density', 'På den här sidan'],
    ['long-finnish-text', 'Tällä sivulla'],
    ['rtl', 'On this page'],
    ['forced-colors', 'På den här sidan'],
  ] as const

  for (const [story, navigationName] of stories) {
    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, navigationName)
      // The current link fades to its fill once the page has been measured: let the transition
      // finish before axe samples colours.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
      await page.waitForFunction(() =>
        document.getAnimations().every((animation) => animation.playState !== 'running'),
      )
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
