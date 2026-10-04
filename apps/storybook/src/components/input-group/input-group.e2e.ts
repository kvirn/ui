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

/** The edge of a box: width, style, and whether it differs from the fill behind it. */
const edgeOf = (box: Locator) =>
  box.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      width: Number.parseFloat(style.borderTopWidth),
      style: style.borderTopStyle,
      differsFromBackground: style.borderTopColor !== style.backgroundColor,
    }
  })

const ringOf = (element: Locator) =>
  element.evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
      offset: Number.parseFloat(style.outlineOffset),
    }
  })

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
  test('the focus ring is on the Root when the input has focus, and on the Button when the Button does', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const root = page.locator('.kv-input-group')
    const input = page.getByRole('searchbox', { name: 'Sök bland e-tjänster' })
    const button = page.getByRole('button', { name: 'Rensa' })
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await expect(root).toHaveAttribute('data-focus-visible', '')
    expect(await ringOf(root)).toEqual({ style: 'solid', width: 2, offset: 2 })
    // The input draws no ring of its own: the Root's ring goes around the whole box.
    expect((await ringOf(input)).width).toBe(0)
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(root).not.toHaveAttribute('data-focus-visible')
    expect((await ringOf(root)).style).toBe('none')
    expect(await ringOf(button)).toMatchObject({ style: 'solid', width: 2 })
  })

  test('the focus ring is not clipped by the box', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(page.locator('.kv-input-group')).toHaveCSS('overflow', 'visible')
    await expect(page.locator('.kv-field')).toHaveCSS('overflow', 'visible')
  })

  test('the Button is at least 24px by 24px, and 44px by default', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = await page.getByRole('button', { name: 'Rensa' }).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('the icon-only Button in staff density is at least 24px by 24px', async ({ page }) => {
    await openStory(page, 'search-icon-only-clear')
    // The story's play function cleared the search: type again so the Button is back.
    await page.getByRole('searchbox', { name: 'Sök bland e-tjänster' }).fill('parkering')
    const box = await page.getByRole('button', { name: 'Rensa sökningen' }).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  test('the typed text does not move when the group is invalid', async ({ page }) => {
    await openStory(page, 'suffix')
    const root = page.locator('.kv-input-group')
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await input.fill('8450')
    const position = async () => {
      const rootBox = await root.boundingBox()
      const inputBox = await input.boundingBox()
      return {
        rootWidth: rootBox?.width,
        rootHeight: rootBox?.height,
        offsetX: (inputBox?.x ?? 0) - (rootBox?.x ?? 0),
        offsetY: (inputBox?.y ?? 0) - (rootBox?.y ?? 0),
      }
    }
    const valid = await position()
    await root.evaluate((element) => element.setAttribute('data-invalid', ''))
    expect(await edgeOf(root)).toMatchObject({ width: 2 })
    // The 2px edge is paid for by the box's padding, so the box and the text keep their place.
    expect(await position()).toEqual(valid)
  })

  test('the box does not change size between the valid, invalid and Disabled stories', async ({
    page,
  }) => {
    const heights: (number | undefined)[] = []
    for (const story of ['suffix', 'invalid', 'disabled']) {
      await openStory(page, story)
      heights.push((await page.locator('.kv-input-group').first().boundingBox())?.height)
    }
    expect(new Set(heights).size).toBe(1)
  })

  test('right to left: the start Addon is on the right of the input', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const addon = await page.locator('.kv-input-group-addon').boundingBox()
    const input = await page.getByRole('textbox', { name: 'Amount in euros' }).boundingBox()
    // The Addon comes first in the DOM, so it is at the start: the right edge in RTL.
    expect(addon?.x).toBeGreaterThan(input?.x ?? Number.POSITIVE_INFINITY)
  })

  test('left to right: the start Addon is on the left, and the end Addon on the right', async ({
    page,
  }) => {
    await openStory(page, 'search-icon')
    const icon = await page.locator('.kv-input-group-addon').boundingBox()
    const input = await page.getByRole('searchbox').boundingBox()
    expect(icon?.x).toBeLessThan(input?.x ?? 0)
    await openStory(page, 'suffix')
    const unit = await page.locator('.kv-input-group-addon').boundingBox()
    const rentInput = await page.getByRole('textbox', { name: 'Månadshyra i kronor' }).boundingBox()
    expect(unit?.x).toBeGreaterThan(rentInput?.x ?? Number.POSITIVE_INFINITY)
  })

  test('forced colours: the box edge, the invalid width and the ring stay visible', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const roots = page.locator('.kv-input-group')
    const invalid = roots.nth(0)
    const valid = roots.nth(1)
    const disabled = roots.nth(2)
    // The width and the message carry the state, not the colour (1.4.1, 1.4.11).
    expect(await edgeOf(valid)).toEqual({ width: 1, style: 'solid', differsFromBackground: true })
    expect(await edgeOf(invalid)).toEqual({ width: 2, style: 'solid', differsFromBackground: true })
    // Disabled is dashed, not only a different colour.
    expect(await edgeOf(disabled)).toEqual({
      width: 1,
      style: 'dashed',
      differsFromBackground: true,
    })
    // The ring is a system-colour outline around the box, and differs from the box's fill.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toBeFocused()
    const ring = await invalid.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        differsFromBackground: style.outlineColor !== style.backgroundColor,
      }
    })
    expect(ring).toEqual({ style: 'solid', width: 2, differsFromBackground: true })
  })

  test('forced colours: the Addon and the Button’s label stay visible, and the Button has a divider', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const addon = page.locator('.kv-input-group-addon').first()
    await expect(addon).toBeVisible()
    const button = page.getByRole('button', { name: 'Rensa' })
    await expect(button).toBeVisible()
    const colours = await button.evaluate((element) => {
      const style = getComputedStyle(element)
      const divider = getComputedStyle(element, '::before')
      return {
        labelDiffers: style.color !== style.backgroundColor,
        dividerWidth: Number.parseFloat(divider.inlineSize),
      }
    })
    expect(colours.labelDiffers).toBe(true)
    expect(colours.dividerWidth).toBeGreaterThan(0)
  })

  test('reduced motion: the box does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'suffix')
    await expect(page.locator('.kv-input-group')).toHaveCSS('transition-duration', '0s')
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

  test('the Finnish label wraps at 320px, and the box stays 44px high', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-label')
    const lineHeight = await page
      .locator('.kv-field-label')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight))
    expect((await page.locator('.kv-field-label').boundingBox())?.height).toBeGreaterThan(
      lineHeight * 1.5,
    )
    expect((await page.locator('.kv-input-group').boundingBox())?.height).toBeGreaterThanOrEqual(44)
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
