import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'
import { textSpacingProblems } from '../e2e-text-spacing.ts'

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

/** The edge of a radio, as computed: a boundary that stays visible has a style and a width. */
const edgeOf = (radio: Locator) =>
  radio.evaluate((element) => {
    const style = getComputedStyle(element)
    return { style: style.borderTopStyle, width: Number.parseFloat(style.borderTopWidth) }
  })

const radio = (page: Page, name: string) => page.getByRole('radio', { name, exact: true })
/** The button before the group in the Keyboard story. */
const before = (page: Page) => page.getByRole('button', { name: 'Tillbaka' })
const checkedValue = (page: Page) =>
  page.evaluate(() => document.querySelector('.kv-radio:checked')?.getAttribute('value') ?? null)

test.describe('RadioGroup keyboard contract', () => {
  test('Tab enters the group at the first radio when none is checked', async ({ page }) => {
    await openStory(page, 'keyboard')
    await before(page).focus()
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
    await before(page).focus()
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
    await openStory(page, 'keyboard')
    await radio(page, '1 månad').focus()
    // The arrow key checks 6 månader: the group has a checked radio now.
    await page.keyboard.press('ArrowDown')
    await expect(radio(page, '6 månader')).toBeChecked()
    await page.keyboard.press('Shift+Tab')
    await expect(before(page)).toBeFocused()
    // From after the group, Shift+Tab enters it at the checked radio.
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
    await before(page).focus()
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
  test('a key-focused radio shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const circle = radio(page, '1 månad')
    await expect(circle).toBeFocused()
    expect(await circle.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('forced colours keep the radio edge visible in every state (1.4.11)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const radios = [
      page.locator('input[name^="selected-"]').nth(0),
      page.locator('input[name^="selected-"]').nth(1),
      page.locator('input[name^="invalid-"]').first(),
      page.locator('input[name^="disabled-"]').nth(0),
      page.locator('input[name^="disabled-"]').nth(2),
    ]
    for (const circle of radios) {
      const edge = await edgeOf(circle)
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
  })

  test('no horizontal scrolling at 320px with the long Finnish legend and options (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'with-option-help-texts', 'as-page-heading', 'invalid']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing), at 320px.
  test('text spacing overrides clip nothing at 320px, with the long Finnish legend, help texts and the error (1.4.12)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'with-option-help-texts', 'invalid']) {
      await openStory(page, story)
      expect(await textSpacingProblems(page), story).toEqual([])
    }
  })
})

test.describe('RadioGroup accessibility', () => {
  test('a11y tree of the group', async ({ page }) => {
    await openStory(page, 'with-option-help-texts')
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
    ['with-option-help-texts'],
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
