import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/input-group/input-group.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The Keyboard story is a search with a value,
// so its clear Button is there. KvirnUI holds no form state: the clear Button's value lives in
// the story's `useState`.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-inputgroup--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-input-group').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

/** The edge of a box: a boundary that stays visible has a style and a width. */
const edgeOf = (box: Locator) =>
  box.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: Number.parseFloat(style.borderTopWidth), style: style.borderTopStyle }
  })

const outlineStyleOf = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).outlineStyle)

test.describe('InputGroup keyboard contract', () => {
  test('Tab goes to the input, then to the Button', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    const button = page.getByRole('button', { name: 'Rensa' })
    // The icon Addon is never a Tab stop: the first stop is the input.
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    // Shift+Tab goes back, in DOM order.
    await page.keyboard.press('Shift+Tab')
    await expect(input).toBeFocused()
  })

  test('the Addons are never Tab stops, in a group without a Button', async ({ page }) => {
    await openStory(page, 'suffix')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toBeFocused()
    await page.keyboard.press('Tab')
    // Nothing in the group takes the focus: it left the story's only focusable part.
    await expect(page.locator('.kv-input-group :focus')).toHaveCount(0)
    expect(await page.locator('.kv-input-group-addon').getAttribute('tabindex')).toBeNull()
  })

  test('clearing the search moves focus to the input', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    const button = page.getByRole('button', { name: 'Rensa' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    // Enter activates the Button (native), and focus never lands on the body.
    await page.keyboard.press('Enter')
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    await expect(button).toHaveCount(0)
    // Type again, and Space does the same.
    await page.keyboard.type('bygglov')
    await expect(button).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await page.keyboard.press('Space')
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
  })

  test('any character types, and the unit can be typed too', async ({ page }) => {
    await openStory(page, 'suffix')
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await input.click()
    await page.keyboard.type('8 450 kr')
    await expect(input).toHaveValue('8 450 kr')
  })

  test('a click in the input marks focus, but not focus-visible', async ({ page }) => {
    await openStory(page, 'keyboard')
    const root = page.locator('.kv-input-group')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    await input.click()
    await expect(input).toBeFocused()
    await expect(root).not.toHaveAttribute('data-focus-visible')
  })

  test('a click on an Addon focuses the input', async ({ page }) => {
    await openStory(page, 'suffix')
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await page.locator('.kv-input-group-addon').click()
    await expect(input).toBeFocused()
    // The same for an icon Addon, on a page with a different Addon.
    await openStory(page, 'search-icon')
    await page.locator('.kv-input-group-addon').click()
    await expect(page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })).toBeFocused()
  })

  test('a click on the Button keeps its own behaviour', async ({ page }) => {
    // The Keyboard story only asserts in its play function. SearchWithClear's play types and
    // clears the search itself, which races the clicks here.
    await openStory(page, 'keyboard')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    await input.fill('parkering')
    await page.getByRole('button', { name: 'Rensa' }).click()
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
  })
})

test.describe('InputGroup focus and modes', () => {
  test('focus-visible is on the Root when the input has focus, and on the Button when the Button does (2.4.7)', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const root = page.locator('.kv-input-group')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    const button = page.getByRole('button', { name: 'Rensa' })
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await expect(root).toHaveAttribute('data-focus-visible', '')
    expect(await outlineStyleOf(root)).not.toBe('none')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(root).not.toHaveAttribute('data-focus-visible')
    expect(await outlineStyleOf(button)).not.toBe('none')
  })

  test('the Button is at least 24×24 (2.5.8)', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = await page.getByRole('button', { name: 'Rensa' }).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  test('the icon-only Button in staff density is at least 24×24 (2.5.8)', async ({ page }) => {
    await openStory(page, 'search-icon-only-clear')
    // The story's play function cleared the search: type again so the Button is back.
    await page.getByRole('searchbox', { name: 'Sök bland e-tjänster' }).fill('parkering')
    const box = await page.getByRole('button', { name: 'Rensa sökningen' }).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  test('forced colours: the box edge and the focus indicator stay visible (1.4.11, 2.4.7)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const roots = page.locator('.kv-input-group')
    for (const root of [roots.nth(0), roots.nth(1), roots.nth(2)]) {
      const edge = await edgeOf(root)
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toBeFocused()
    expect(await outlineStyleOf(roots.nth(0))).not.toBe('none')
  })

  test('forced colours: the Addon and the Button stay visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    await expect(page.locator('.kv-input-group-addon').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rensa' })).toBeVisible()
  })

  test('no horizontal scrolling at 320px, with the Finnish label and every state (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of [
      'long-finnish-label',
      'forced-colors',
      'search-with-clear',
      'search-icon-only-clear',
      'compact',
      'rtl',
    ]) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
      for (const root of await page.locator('.kv-input-group').all()) {
        const box = await root.boundingBox()
        expect((box?.x ?? 0) + (box?.width ?? 0), story).toBeLessThanOrEqual(320)
        expect(box?.x ?? 0, story).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

test.describe('InputGroup accessibility', () => {
  test('a11y tree of the search with a clear Button: the icon is out of the tree', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await expect(page.locator('.kv-field')).toMatchAriaSnapshot(`
      - text: Sök bland e-tjänster
      - searchbox "Sök bland e-tjänster": parkering
      - button "Rensa"
    `)
  })

  test('the Input is named by the label alone: the unit is not in its name or description', async ({
    page,
  }) => {
    await openStory(page, 'suffix')
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor', exact: true })
    await expect(input).toHaveAccessibleDescription(/^Till exempel/)
    await expect(page.locator('.kv-input-group-addon')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('.kv-input-group-addon')).toHaveText('kr')
  })

  const stories = [
    'suffix',
    'keyboard',
    'percentage',
    'distance',
    'search-icon',
    'search-with-clear',
    'search-icon-only-clear',
    'calendar-icon',
    'invalid',
    'disabled',
    'read-only',
    'in-card',
    'long-finnish-label',
    'compact',
    'rtl',
    'forced-colors',
  ] as const
  for (const story of stories) {
    test(`no axe violations on ${story}`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
