import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/checkbox/checkbox.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. KvirnUI holds no form state: the Keyboard
// story keeps the state of its "select all" box in the story, and the rest is native.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-checkbox--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-checkbox').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

/**
 * Listens for keys that a page handler cancelled. The listener sits on the document, so it runs
 * after every handler in the page: a key Checkbox intercepted would show up here.
 */
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

/** What a CSS system colour keyword resolves to in this page, as the browser computes it. */
async function systemColour(page: Page, keyword: string) {
  return page.evaluate((value) => {
    const probe = document.createElement('div')
    probe.style.backgroundColor = value
    document.body.append(probe)
    const resolved = getComputedStyle(probe).backgroundColor
    probe.remove()
    return resolved
  }, keyword)
}

/** The edge, fill and `::before` mark colours of a checkbox, as computed. */
const paint = (box: Locator) =>
  box.evaluate((element) => {
    const style = getComputedStyle(element)
    const mark = getComputedStyle(element, '::before')
    return {
      edge: style.borderTopColor,
      edgeWidth: Number.parseFloat(style.borderTopWidth),
      edgeStyle: style.borderTopStyle,
      fill: style.backgroundColor,
      mark: mark.content === 'none' ? 'none' : mark.backgroundColor,
    }
  })

const names = {
  newsletter: /Skicka nyhetsbrevet till mig/,
  all: 'Markera alla rader',
  declaration: /Jag intygar att uppgifterna jag har lämnat är korrekta/,
  submit: 'Skicka',
} as const

test.describe('Checkbox keyboard contract', () => {
  test('Tab moves to each checkbox, one stop each', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('checkbox', { name: names.newsletter })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('checkbox', { name: names.all })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('checkbox', { name: names.declaration })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: names.submit })).toBeFocused()
  })

  test('Shift+Tab moves to the previous checkbox', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('checkbox', { name: names.declaration }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('checkbox', { name: names.all })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('checkbox', { name: names.newsletter })).toBeFocused()
  })

  test('Tab skips a disabled checkbox', async ({ page }) => {
    await openStory(page, 'keyboard')
    const disabled = page.getByRole('checkbox', { name: /Ärende 2026-0412/ })
    await expect(disabled).toBeDisabled()
    await page.getByRole('checkbox', { name: names.all }).focus()
    await page.keyboard.press('Tab')
    await expect(disabled).not.toBeFocused()
    await expect(page.getByRole('checkbox', { name: names.declaration })).toBeFocused()
  })

  test('Space toggles the checkbox', async ({ page }) => {
    await openStory(page, 'keyboard')
    const checkbox = page.getByRole('checkbox', { name: names.newsletter })
    await checkbox.focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Space')
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toHaveAttribute('data-state', 'checked')
    await page.keyboard.press('Space')
    await expect(checkbox).not.toBeChecked()
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    await expect(checkbox).toBeFocused()
    // Native: the page took no key.
    expect(await prevented()).toEqual([])
  })

  test('Space on an indeterminate checkbox checks it', async ({ page }) => {
    await openStory(page, 'keyboard')
    const checkbox = page.getByRole('checkbox', { name: names.all })
    await expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    expect(await checkbox.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true)
    await checkbox.focus()
    await page.keyboard.press('Space')
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(await checkbox.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(
      false,
    )
  })

  test('Enter does not toggle the checkbox and is not intercepted', async ({ page }) => {
    await openStory(page, 'keyboard')
    const checkbox = page.getByRole('checkbox', { name: names.newsletter })
    await checkbox.focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Enter')
    await expect(checkbox).not.toBeChecked()
    await expect(checkbox).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('clicking the label text and the padding beside the box toggles it', async ({ page }) => {
    await openStory(page, 'unchecked')
    const checkbox = page.getByRole('checkbox', { name: names.declaration })
    const label = page.locator('label.kv-field-label')
    // The text.
    await label.click({ position: { x: 80, y: 20 } })
    await expect(checkbox).toBeChecked()
    // The gap between the box and the text: the label's padding.
    await label.click({ position: { x: 30, y: 22 } })
    await expect(checkbox).not.toBeChecked()
    // Above the box, inside the 44px row.
    await label.click({ position: { x: 10, y: 3 } })
    await expect(checkbox).toBeChecked()
    await expect(checkbox).toBeFocused()
  })
})

test.describe('Checkbox focus and modes', () => {
  test('the box is 24px and the row at least 44px high (2.5.8)', async ({ page }) => {
    await openStory(page, 'unchecked')
    const box = await page.locator('.kv-checkbox').boundingBox()
    expect([box?.width, box?.height]).toEqual([24, 24])
    const label = await page.locator('label.kv-field-label').boundingBox()
    expect(label?.height).toBeGreaterThanOrEqual(44)
    // The label starts at the box's edge, so the row is one target.
    expect(Math.abs((label?.x ?? 0) - (box?.x ?? 1))).toBeLessThan(1)
  })

  test('the focus ring is visible on keyboard focus: 2px, offset 2px', async ({ page }) => {
    await openStory(page, 'unchecked')
    await page.keyboard.press('Tab')
    const checkbox = page.getByRole('checkbox')
    await expect(checkbox).toBeFocused()
    await expect(checkbox).toHaveAttribute('data-focus-visible', '')
    await expect(checkbox).toHaveCSS('outline-style', 'solid')
    await expect(checkbox).toHaveCSS('outline-width', '2px')
    await expect(checkbox).toHaveCSS('outline-offset', '2px')
  })

  test('an invalid checkbox has a 2px edge and the message under the row', async ({ page }) => {
    await openStory(page, 'invalid')
    const checkbox = page.getByRole('checkbox')
    await expect(checkbox).toHaveCSS('border-top-width', '2px')
    const message = page.locator('.kv-field-error-message')
    await expect(message).toBeVisible()
    const rowBox = await page.locator('label.kv-field-label').boundingBox()
    const messageBox = await message.boundingBox()
    expect(messageBox?.y).toBeGreaterThan((rowBox?.y ?? 0) + (rowBox?.height ?? 0) - 1)
  })

  test('the tick is drawn, not an image: it shows when checked and not when unchecked', async ({
    page,
  }) => {
    await openStory(page, 'forced-colors')
    expect((await paint(page.locator('input[name="unchecked"]'))).mark).toBe('none')
    const checked = await paint(page.locator('input[name="checked"]'))
    expect(checked.mark).not.toBe('none')
    const box = await page.locator('input[name="checked"]').evaluate((element) => {
      const mark = getComputedStyle(element, '::before')
      return { width: mark.width, clipPath: mark.clipPath, image: mark.backgroundImage }
    })
    expect(box.width).toBe('16px')
    expect(box.clipPath).toContain('polygon')
    expect(box.image).toBe('none')
  })

  test('forced colours: checked, indeterminate, invalid and disabled stay distinguishable', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const colours = {
      highlight: await systemColour(page, 'Highlight'),
      highlightText: await systemColour(page, 'HighlightText'),
      field: await systemColour(page, 'Field'),
      canvasText: await systemColour(page, 'CanvasText'),
      grayText: await systemColour(page, 'GrayText'),
      buttonBorder: await systemColour(page, 'ButtonBorder'),
    }
    const unchecked = await paint(page.locator('input[name="unchecked"]'))
    expect(unchecked).toEqual({
      edge: colours.buttonBorder,
      edgeWidth: 1,
      edgeStyle: 'solid',
      fill: colours.field,
      mark: 'none',
    })
    // A tick and a dash: the shape says it, and the colours are the system's.
    for (const name of ['checked', 'indeterminate']) {
      expect(await paint(page.locator(`input[name="${name}"]`)), name).toEqual({
        edge: colours.highlight,
        edgeWidth: 1,
        edgeStyle: 'solid',
        fill: colours.highlight,
        mark: colours.highlightText,
      })
    }
    // The 2px width carries invalid, with the message (1.4.1).
    expect(await paint(page.locator('input[name="invalid"]'))).toMatchObject({
      edge: colours.canvasText,
      edgeWidth: 2,
      edgeStyle: 'solid',
    })
    expect(await paint(page.locator('input[name="disabled"]'))).toMatchObject({
      edge: colours.grayText,
      edgeStyle: 'dashed',
    })
    expect(await paint(page.locator('input[name="disabled-checked"]'))).toMatchObject({
      edge: colours.grayText,
      fill: colours.field,
      mark: colours.grayText,
    })
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
  })

  test('reduced motion: the checkbox does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'unchecked')
    await expect(page.getByRole('checkbox')).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px with the long Finnish label (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-label', 'invalid', 'keyboard']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
    await openStory(page, 'long-label')
    // The box stays beside the first line of a label that wraps over several lines.
    const box = await page.locator('.kv-checkbox').boundingBox()
    const label = await page.locator('label.kv-field-label').boundingBox()
    expect(label?.height).toBeGreaterThan(60)
    expect(box?.y).toBeLessThan((label?.y ?? 0) + 16)
  })

  test('right to left: the box is at the right of its label', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const box = await page.locator('input[name="unchecked"]').boundingBox()
    const label = await page.locator('.kv-field:has(input[name="unchecked"]) > label').boundingBox()
    expect(box?.x).toBeGreaterThan((label?.x ?? 0) + (label?.width ?? 0) / 2 - 1)
    expect(
      Math.abs((box?.x ?? 0) + (box?.width ?? 0) - ((label?.x ?? 0) + (label?.width ?? 0))),
    ).toBeLessThan(2)
  })
})

test.describe('Checkbox accessibility', () => {
  test('a11y tree of the keyboard fixture', async ({ page }) => {
    await openStory(page, 'keyboard')
    await expect(page.locator('form')).toMatchAriaSnapshot(`
      - checkbox "Skicka nyhetsbrevet till mig"
      - text: Skicka nyhetsbrevet till mig
      - checkbox "Markera alla rader" [checked=mixed]
      - text: Markera alla rader
      - checkbox "Ärende 2026-0412" [disabled]
      - text: Ärende 2026-0412
      - checkbox "Jag intygar att uppgifterna jag har lämnat är korrekta"
      - text: Jag intygar att uppgifterna jag har lämnat är korrekta
      - button "Skicka"
    `)
  })

  // The Checkbox stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['unchecked'],
    ['checked'],
    ['indeterminate'],
    ['with-description'],
    ['invalid'],
    ['disabled'],
    ['disabled-checked'],
    ['long-label'],
    ['keyboard'],
    ['controlled'],
    ['plain-form'],
    ['on-surfaces'],
    ['compact'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['forced-colors', theme] as const),
    ...themes.map((theme) => ['on-surfaces', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
