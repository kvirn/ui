import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/radio-group/radio-group.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The keys are the browser's: the group is
// native radios that share a name, so these tests prove the component gets in their way
// nowhere. KvirnUI holds no form state: the Controlled story keeps its value in the story.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-radiogroup--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-radio').first()).toBeVisible()
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
 * after every handler in the page: a key RadioGroup intercepted would show up here.
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

/** The edge, fill and `::before` dot colours of a radio, as computed. */
const paint = (radio: Locator) =>
  radio.evaluate((element) => {
    const style = getComputedStyle(element)
    const dot = getComputedStyle(element, '::before')
    return {
      edge: style.borderTopColor,
      edgeWidth: Number.parseFloat(style.borderTopWidth),
      edgeStyle: style.borderTopStyle,
      fill: style.backgroundColor,
      dot: dot.content === 'none' ? 'none' : dot.backgroundColor,
    }
  })

const radio = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
const checkedValue = (page: Page) =>
  page.evaluate(() => document.querySelector('.kv-radio:checked')?.getAttribute('value') ?? null)

test.describe('RadioGroup keyboard contract', () => {
  test('Tab enters the group at the first radio when none is checked', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(radio(page, '1 månad')).toBeFocused()
    // Focus alone checks nothing.
    expect(await checkedValue(page)).toBeNull()
  })

  test('Tab enters the group at the checked radio', async ({ page }) => {
    await openStory(page, 'selected')
    await page.keyboard.press('Tab')
    await expect(radio(page, '6 månader')).toBeFocused()
  })

  test('Tab leaves the group after one stop', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(radio(page, '1 månad')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
    // Also after the arrow keys moved inside the group, and when the group has a checked radio.
    await openStory(page, 'selected')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, '12 månader')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('a controlled group is still one Tab stop after an arrow key', async ({ page }) => {
    await openStory(page, 'controlled')
    // The story's play function chose 12 months: wait for it, then move with the keys.
    await expect(page.getByTestId('mirror')).toHaveText('Du valde: 12')
    await radio(page, '12 månader').focus()
    await page.keyboard.press('ArrowUp')
    await expect(radio(page, '6 månader')).toBeFocused()
    await expect(page.getByTestId('mirror')).toHaveText('Du valde: 6')
    await page.keyboard.press('Tab')
    await expect(page.locator('.kv-radio:focus')).toHaveCount(0)
  })

  test('Shift+Tab enters the group at the last radio when none is checked', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Skicka' }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(radio(page, '12 månader')).toBeFocused()
    expect(await checkedValue(page)).toBeNull()
  })

  test('Shift+Tab leaves the group after one stop', async ({ page }) => {
    await openStory(page, 'selected')
    await radio(page, '6 månader').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('.kv-radio:focus')).toHaveCount(0)
    await page.getByRole('button', { name: 'Skicka' }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(radio(page, '6 månader')).toBeFocused()
  })

  test('ArrowDown and ArrowRight move to the next radio and check it, wrapping', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await radio(page, '1 månad').focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, '6 månader')).toBeFocused()
    await expect(radio(page, '6 månader')).toBeChecked()
    await page.keyboard.press('ArrowRight')
    await expect(radio(page, '12 månader')).toBeFocused()
    await expect(radio(page, '12 månader')).toBeChecked()
    // From the last radio to the first.
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, '1 månad')).toBeFocused()
    await expect(radio(page, '1 månad')).toBeChecked()
    expect(await checkedValue(page)).toBe('1')
    expect(await prevented()).toEqual([])
  })

  test('ArrowUp and ArrowLeft move to the previous radio and check it, wrapping', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await radio(page, '1 månad').focus()
    // From the first radio to the last.
    await page.keyboard.press('ArrowUp')
    await expect(radio(page, '12 månader')).toBeFocused()
    await expect(radio(page, '12 månader')).toBeChecked()
    await page.keyboard.press('ArrowLeft')
    await expect(radio(page, '6 månader')).toBeFocused()
    await expect(radio(page, '6 månader')).toBeChecked()
    await page.keyboard.press('ArrowUp')
    await expect(radio(page, '1 månad')).toBeFocused()
    expect(await checkedValue(page)).toBe('1')
  })

  test('right to left: ArrowLeft moves to the next radio and ArrowRight to the previous', async ({
    page,
  }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // The first group of the story: three radios in the order 1, 6, 12 months.
    const first = page.locator('input[name^="selected-"]')
    await first.nth(0).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(first.nth(1)).toBeFocused()
    await expect(first.nth(1)).toBeChecked()
    await page.keyboard.press('ArrowLeft')
    await expect(first.nth(2)).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(first.nth(1)).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(first.nth(0)).toBeFocused()
    await expect(first.nth(0)).toBeChecked()
    // The vertical keys are not mirrored.
    await page.keyboard.press('ArrowDown')
    await expect(first.nth(1)).toBeFocused()
  })

  test('Arrow keys skip a disabled radio', async ({ page }) => {
    await openStory(page, 'disabled-option')
    await expect(radio(page, '6 månader')).toBeDisabled()
    await page.keyboard.press('Tab')
    await expect(radio(page, '1 månad')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, '12 månader')).toBeFocused()
    await expect(radio(page, '12 månader')).toBeChecked()
    await page.keyboard.press('ArrowUp')
    await expect(radio(page, '1 månad')).toBeFocused()
    await expect(radio(page, '6 månader')).not.toBeChecked()
  })

  test('Space checks the focused radio', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    const first = radio(page, '1 månad')
    await expect(first).toBeFocused()
    await expect(first).not.toBeChecked()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Space')
    await expect(first).toBeChecked()
    // On a checked radio, Space does nothing: it can't be unchecked.
    await page.keyboard.press('Space')
    await expect(first).toBeChecked()
    await expect(first).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('clicking the label text selects the radio', async ({ page }) => {
    await openStory(page, 'keyboard')
    const label = page.locator('label', { hasText: '6 månader' })
    await label.click({ position: { x: 80, y: 20 } })
    await expect(radio(page, '6 månader')).toBeChecked()
    await expect(radio(page, '6 månader')).toBeFocused()
    // The padding between the circle and the text is the label too.
    await page.locator('label', { hasText: '12 månader' }).click({ position: { x: 30, y: 22 } })
    await expect(radio(page, '12 månader')).toBeChecked()
  })
})

test.describe('RadioGroup focus and modes', () => {
  test('the circle is 24px, the row at least 44px high, and every radio has the group’s name (2.5.8)', async ({
    page,
  }) => {
    await openStory(page, 'default')
    for (const name of ['1 månad', '6 månader', '12 månader']) {
      const circle = await radio(page, name).boundingBox()
      expect([circle?.width, circle?.height], name).toEqual([24, 24])
      const row = await page.locator('label', { hasText: name }).boundingBox()
      expect(row?.height, name).toBeGreaterThanOrEqual(44)
      await expect(radio(page, name)).toHaveAttribute('name', /^duration-/)
    }
  })

  test('the focus ring is visible on keyboard focus: 2px, offset 2px', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const circle = radio(page, '1 månad')
    await expect(circle).toBeFocused()
    await expect(circle).toHaveCSS('outline-style', 'solid')
    await expect(circle).toHaveCSS('outline-width', '2px')
    await expect(circle).toHaveCSS('outline-offset', '2px')
  })

  test('an invalid group has 2px edges and the message under the options, and no aria-invalid', async ({
    page,
  }) => {
    await openStory(page, 'invalid')
    for (const name of ['1 månad', '6 månader', '12 månader']) {
      await expect(radio(page, name)).toHaveCSS('border-top-width', '2px')
      await expect(radio(page, name)).not.toHaveAttribute('aria-invalid')
    }
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
    const last = await page.locator('label', { hasText: '12 månader' }).boundingBox()
    const message = await page.locator('.kv-field-error-message').boundingBox()
    expect(message?.y).toBeGreaterThan((last?.y ?? 0) + (last?.height ?? 0) - 1)
  })

  test('the dot is drawn, not an image: it shows when checked and not when unchecked', async ({
    page,
  }) => {
    await openStory(page, 'selected')
    expect((await paint(radio(page, '1 månad'))).dot).toBe('none')
    const checked = radio(page, '6 månader')
    expect((await paint(checked)).dot).not.toBe('none')
    const dot = await checked.evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return { width: style.width, radius: style.borderTopLeftRadius, image: style.backgroundImage }
    })
    expect(dot.width).toBe('12px')
    // A circle: the full radius token, 9999px.
    expect(Number.parseFloat(dot.radius)).toBeGreaterThanOrEqual(6)
    expect(dot.image).toBe('none')
  })

  test('forced colours: checked, invalid and disabled stay distinguishable', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const colours = {
      highlight: await systemColour(page, 'Highlight'),
      field: await systemColour(page, 'Field'),
      canvasText: await systemColour(page, 'CanvasText'),
      grayText: await systemColour(page, 'GrayText'),
      buttonBorder: await systemColour(page, 'ButtonBorder'),
    }
    const selected = page.locator('input[name^="selected-"]')
    expect(await paint(selected.nth(0))).toEqual({
      edge: colours.buttonBorder,
      edgeWidth: 1,
      edgeStyle: 'solid',
      fill: colours.field,
      dot: 'none',
    })
    // A dot in a ring: the shape says it, and the colours are the system's.
    expect(await paint(selected.nth(1))).toEqual({
      edge: colours.highlight,
      edgeWidth: 1,
      edgeStyle: 'solid',
      fill: colours.field,
      dot: colours.highlight,
    })
    // The 2px width carries invalid, with the message (1.4.1).
    expect(await paint(page.locator('input[name^="invalid-"]').first())).toMatchObject({
      edge: colours.canvasText,
      edgeWidth: 2,
      edgeStyle: 'solid',
    })
    expect(await paint(page.locator('input[name^="disabled-"]').nth(0))).toMatchObject({
      edge: colours.grayText,
      edgeStyle: 'dashed',
    })
    expect(await paint(page.locator('input[name^="disabled-"]').nth(2))).toMatchObject({
      edge: colours.grayText,
      fill: colours.field,
      dot: colours.grayText,
    })
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
  })

  test('reduced motion: the radio does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'default')
    await expect(radio(page, '1 månad')).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px with the long Finnish legend and options (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'with-option-hints', 'as-page-heading', 'invalid']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })

  test('right to left: the circles are at the right of their labels', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const circle = await page.locator('input[name^="selected-"]').first().boundingBox()
    const label = await page
      .locator('.kv-field:has(input[name^="selected-"][value="1"]) > label')
      .boundingBox()
    expect(
      Math.abs((circle?.x ?? 0) + (circle?.width ?? 0) - ((label?.x ?? 0) + (label?.width ?? 0))),
    ).toBeLessThan(2)
  })
})

test.describe('RadioGroup accessibility', () => {
  test('a11y tree of the group', async ({ page }) => {
    await openStory(page, 'with-option-hints')
    await expect(page.getByRole('group')).toMatchAriaSnapshot(`
      - group "Hur länge behöver du tillståndet? (valfritt)":
        - text: Hur länge behöver du tillståndet? (valfritt)
        - paragraph: Välj ett alternativ.
        - radio "1 månad"
        - text: 1 månad
        - radio "6 månader"
        - text: 6 månader
        - radio "12 månader"
        - text: 12 månader
        - paragraph: Lägst pris per månad.
    `)
  })

  // The RadioGroup stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['keyboard'],
    ['selected'],
    ['with-option-hints'],
    ['invalid'],
    ['disabled-option'],
    ['disabled'],
    ['as-page-heading'],
    ['in-card'],
    ['compact'],
    ['long-finnish'],
    ['controlled'],
    ['plain-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['forced-colors', theme] as const),
    ...themes.map((theme) => ['in-card', theme] as const),
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
