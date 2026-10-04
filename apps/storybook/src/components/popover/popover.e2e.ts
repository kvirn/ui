import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/popover/popover.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The popup is the browser's own `popover`
// element, so "open" is `:popover-open`. The keys are the button's and Escape.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-popover--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-popover-trigger').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

const trigger = (page: Page) => page.getByRole('button', { name: 'Om tjänsten', exact: true })
const closeButton = (page: Page) => page.getByRole('button', { name: 'Stäng', exact: true })
const before = (page: Page) => page.getByRole('button', { name: 'Före', exact: true })
const after = (page: Page) => page.getByRole('button', { name: 'Efter', exact: true })
const popupAt = (page: Page, selector = '.kv-popover-popup') => page.locator(selector).first()
const isShown = (popup: Locator) => popup.evaluate((element) => element.matches(':popover-open'))

/** Listens for keys that a page handler cancelled, after every handler in the page has run. */
async function recordPreventedKeys(page: Page) {
  await page.evaluate(() => {
    const keys: string[] = []
    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) keys.push(event.key)
    })
    Reflect.set(window, 'preventedKeys', keys)
  })
  return (): Promise<string[]> => page.evaluate(() => Reflect.get(window, 'preventedKeys'))
}

/** Opens the Keyboard story's popup with the keyboard and checks that focus stays on the trigger. */
async function openWithKeyboard(page: Page) {
  await openStory(page, 'keyboard')
  await trigger(page).focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => isShown(popupAt(page))).toBe(true)
  await expect(trigger(page)).toBeFocused()
}

test.describe('Popover keyboard contract', () => {
  test('Tab focuses the trigger', async ({ page }) => {
    await openStory(page, 'keyboard')
    await before(page).focus()
    await page.keyboard.press('Tab')
    await expect(trigger(page)).toBeFocused()
    // The popup is closed, so the next stop is the button after it.
    await page.keyboard.press('Tab')
    await expect(after(page)).toBeFocused()
  })

  test('Shift+Tab leaves the trigger backwards', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(before(page)).toBeFocused()
  })

  test('Enter and Space toggle the popover', async ({ page }) => {
    await openStory(page, 'keyboard')
    const popup = popupAt(page)
    await trigger(page).focus()
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(popup)).toBe(true)
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger(page)).toBeFocused()
    await page.keyboard.press('Space')
    await expect.poll(() => isShown(popup)).toBe(false)
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('Space')
    await expect.poll(() => isShown(popup)).toBe(true)
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(popup)).toBe(false)
    await expect(trigger(page)).toBeFocused()
  })

  test('Tab moves from the trigger into the open popup', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Tab')
    await expect(closeButton(page)).toBeFocused()
  })

  test('Tab leaves the popup and keeps it open', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Tab')
    await expect(closeButton(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(after(page)).toBeFocused()
    expect(await isShown(popupAt(page))).toBe(true)
  })

  test('Shift+Tab returns from the popup to the trigger', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Tab')
    await expect(closeButton(page)).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(trigger(page)).toBeFocused()
    expect(await isShown(popupAt(page))).toBe(true)
  })

  test('Close closes the popup and returns focus to the trigger', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Tab')
    await expect(closeButton(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(popupAt(page))).toBe(false)
    await expect(trigger(page)).toBeFocused()

    // Space works the same way.
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(popupAt(page))).toBe(true)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await expect.poll(() => isShown(popupAt(page))).toBe(false)
    await expect(trigger(page)).toBeFocused()
  })

  test('Escape in the popup closes it and returns focus to the trigger', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Tab')
    await expect(closeButton(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect.poll(() => isShown(popupAt(page))).toBe(false)
    await expect(trigger(page)).toBeFocused()
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('Escape on the trigger closes the popup', async ({ page }) => {
    await openWithKeyboard(page)
    await page.keyboard.press('Escape')
    await expect.poll(() => isShown(popupAt(page))).toBe(false)
    await expect(trigger(page)).toBeFocused()
  })

  test('Escape closes only the innermost popup', async ({ page }) => {
    await openStory(page, 'nested')
    const outer = popupAt(page, '.outer')
    const inner = popupAt(page, '.inner')
    await page.getByRole('button', { name: 'Yttre', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(outer)).toBe(true)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Inre', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => isShown(inner)).toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => isShown(inner)).toBe(false)
    expect(await isShown(outer)).toBe(true)
    await expect(page.getByRole('button', { name: 'Inre', exact: true })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect.poll(() => isShown(outer)).toBe(false)
    await expect(page.getByRole('button', { name: 'Yttre', exact: true })).toBeFocused()
  })

  test('Escape does nothing when the popup is closed', async ({ page }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    await trigger(page).focus()
    await page.keyboard.press('Escape')
    expect(await isShown(popupAt(page))).toBe(false)
    await expect(trigger(page)).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('a press on the trigger toggles the popup', async ({ page }) => {
    await openStory(page, 'keyboard')
    const popup = popupAt(page)
    await trigger(page).click()
    await expect.poll(() => isShown(popup)).toBe(true)
    await trigger(page).click()
    await expect.poll(() => isShown(popup)).toBe(false)
    // The platform's light dismiss and our click must not reopen it.
    await page.waitForTimeout(200)
    expect(await isShown(popup)).toBe(false)
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false')
    await trigger(page).click()
    await expect.poll(() => isShown(popup)).toBe(true)
  })

  test('a press outside closes the popup', async ({ page }) => {
    await openStory(page, 'keyboard')
    const popup = popupAt(page)
    await trigger(page).click()
    await expect.poll(() => isShown(popup)).toBe(true)
    await page.getByText('Text utanför').click()
    await expect.poll(() => isShown(popup)).toBe(false)
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false')

    // Another control that is pressed keeps the focus.
    await trigger(page).click()
    await expect.poll(() => isShown(popup)).toBe(true)
    await after(page).click()
    await expect.poll(() => isShown(popup)).toBe(false)
    await expect(after(page)).toBeFocused()
  })
})

test.describe('Popover placement', () => {
  test('the popup sits under the trigger and never covers it', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).click()
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    await expect(popup).toHaveAttribute('data-placement', 'bottom-start')
    const triggerBox = await trigger(page).boundingBox()
    const popupBox = await popup.boundingBox()
    expect(popupBox?.y).toBeGreaterThanOrEqual((triggerBox?.y ?? 0) + (triggerBox?.height ?? 0))
    const viewportWidth = page.viewportSize()?.width ?? 1280
    if (viewportWidth >= 600) {
      expect(popupBox?.x).toBeCloseTo(triggerBox?.x ?? 0, 0)
    } else {
      // At 320px the popup shifts to stay inside the viewport, with the 8px padding (1.4.10).
      expect(popupBox?.x).toBeGreaterThanOrEqual(8)
      expect((popupBox?.x ?? 0) + (popupBox?.width ?? 0)).toBeLessThanOrEqual(viewportWidth - 8)
    }
  })

  test('it flips above the trigger at the bottom edge', async ({ page }) => {
    await openStory(page, 'flips-at-the-edge')
    // The story's play function opens the popup, so don't press the trigger again.
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    await expect(popup).toHaveAttribute('data-placement', 'top-start')
    const triggerBox = await trigger(page).boundingBox()
    const popupBox = await popup.boundingBox()
    expect((popupBox?.y ?? 0) + (popupBox?.height ?? 0)).toBeLessThanOrEqual(
      (triggerBox?.y ?? 0) + 0.5,
    )
  })

  test('a tall popup stays in the viewport and scrolls inside', async ({ page }) => {
    await openStory(page, 'long-content')
    await page.getByRole('button', { name: 'Villkor', exact: true }).click()
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    const { bottom, scrollable, viewportHeight } = await popup.evaluate((element) => ({
      bottom: element.getBoundingClientRect().bottom,
      scrollable: element.scrollHeight > element.clientHeight,
      viewportHeight: document.documentElement.clientHeight,
    }))
    expect(bottom).toBeLessThanOrEqual(viewportHeight)
    expect(scrollable).toBe(true)
  })

  test('matchAnchorWidth makes the popup as wide as the trigger', async ({ page }) => {
    await openStory(page, 'match-anchor-width')
    await page.getByRole('button', { name: 'Välj hur vi ska nå dig' }).click()
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    const triggerBox = await page
      .getByRole('button', { name: 'Välj hur vi ska nå dig' })
      .boundingBox()
    const popupBox = await popup.boundingBox()
    expect(popupBox?.width).toBeCloseTo(triggerBox?.width ?? 0, 0)
  })

  test('the popup follows the trigger when the page scrolls', async ({ page }) => {
    await openStory(page, 'open')
    await page.evaluate(() => {
      const spacer = document.createElement('div')
      spacer.style.height = '3000px'
      document.body.append(spacer)
    })
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    const startTop = (await popup.boundingBox())?.y ?? 0
    await page.evaluate(() => window.scrollTo(0, 40))
    await expect.poll(async () => (await popup.boundingBox())?.y ?? 0).toBeCloseTo(startTop - 40, 0)
  })

  test('right to left: the popup lines up with the trigger right edge', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    const triggerBox = await page.locator('.kv-popover-trigger').boundingBox()
    const popupBox = await popup.boundingBox()
    const viewportWidth = page.viewportSize()?.width ?? 1280
    const popupRight = (popupBox?.x ?? 0) + (popupBox?.width ?? 0)
    if (viewportWidth >= 600) {
      expect(popupRight).toBeCloseTo((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0), 0)
    } else {
      // At 320px the popup shifts to stay inside the viewport, with the 8px padding (1.4.10).
      expect(popupBox?.x).toBeGreaterThanOrEqual(8)
      expect(popupRight).toBeLessThanOrEqual(viewportWidth - 8)
    }
  })
})

test.describe('Popover modes', () => {
  test('forced colours: the popup keeps a visible edge (1.4.11)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const popup = popupAt(page)
    await expect.poll(() => isShown(popup)).toBe(true)
    const edge = await popup.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        width: Number.parseFloat(style.borderTopWidth),
        style: style.borderTopStyle,
      }
    })
    expect(edge.style).not.toBe('none')
    expect(edge.width).toBeGreaterThan(0)
    // The state is in the attribute, not in a colour.
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true')
  })

  test('at 320px the popup stays inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['keyboard', 'long-content', 'match-anchor-width', 'with-form']) {
      await openStory(page, story)
      await page.locator('.kv-popover-trigger').first().click()
      const popup = popupAt(page)
      await expect.poll(() => isShown(popup)).toBe(true)
      const box = await popup.boundingBox()
      expect(box?.x, story).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0), story).toBeLessThanOrEqual(320)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })
})

test.describe('Popover accessibility', () => {
  test('the popup is a named dialog, wired to its trigger', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).click()
    const dialog = page.getByRole('dialog', { name: 'Om tjänsten' })
    await expect(dialog).toBeVisible()
    await expect(trigger(page)).toHaveAttribute(
      'aria-controls',
      (await dialog.getAttribute('id')) ?? '',
    )
    await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(dialog).not.toHaveAttribute('aria-modal')
    // Not modal: the rest of the page is still in the tree.
    await expect(before(page)).toBeVisible()
    await expect(page.locator('[inert]')).toHaveCount(0)
  })

  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['open'],
    ['keyboard'],
    ['toggles'],
    ['controlled'],
    ['nested'],
    ['flips-at-the-edge'],
    ['match-anchor-width'],
    ['long-content'],
    ['with-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['open', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }

  test('no axe violations: keyboard, popup open', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).click()
    await expect.poll(() => isShown(popupAt(page))).toBe(true)
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
