import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/date-input/date-input.a11y.md › Keyboard and Visual / modes. One
// test per row, named after it. The keys are the browser's: the boxes are three native text
// inputs, so these tests prove the component gets in their way nowhere: three Tab stops in the
// order of the boxes, no arrow-key stepping. The one thing it adds is the auto-advance (Plan
// 0040): typing the digit that fills a box moves focus to the next box, with a visible hint, and
// `autoAdvance={false}` turns it off. The default story is Swedish with no region (`sv`), which
// Intl writes year first: År, Månad, Dag.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-dateinput--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  // The one-field stories are a single masked TextInput, with no DateInput boxes.
  await expect(page.locator('.kv-date-input, .kv-input').first()).toBeVisible()
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
 * after every handler in the page: a key DateInput intercepted would show up here.
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

/** The edge of a box, as computed: a boundary that stays visible has a style and a width. */
const edgeOf = (input: Locator) =>
  input.evaluate((element) => {
    const style = getComputedStyle(element)
    return { style: style.borderTopStyle, width: Number.parseFloat(style.borderTopWidth) }
  })

const textbox = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })

const caretOf = (input: Locator) =>
  input.evaluate((element) => (element as HTMLInputElement).selectionStart)

test.describe('DateInput keyboard contract', () => {
  test('Tab enters the date at the first box of the field order', async ({ page }) => {
    await openStory(page, 'keyboard')
    // The button before the date is the first stop; the legend, hint and labels are not stops.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Tillbaka' })).toBeFocused()
    await page.keyboard.press('Tab')
    // `sv` writes the year first.
    await expect(textbox(page, 'År')).toBeFocused()
    await openStory(page, 'swedish-finland')
    await page.keyboard.press('Tab')
    await expect(textbox(page, 'Dag')).toBeFocused()
  })

  test('Tab moves from box to box in the field order and leaves after the last', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Tillbaka' }).focus()
    for (const name of ['År', 'Månad', 'Dag']) {
      await page.keyboard.press('Tab')
      await expect(textbox(page, name)).toBeFocused()
    }
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('Shift+Tab moves back through the boxes and leaves before the first', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Skicka' }).focus()
    for (const name of ['Dag', 'Månad', 'År']) {
      await page.keyboard.press('Shift+Tab')
      await expect(textbox(page, name)).toBeFocused()
    }
    // Leaves the date, to the button before it.
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('.kv-input:focus')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Tillbaka' })).toBeFocused()
  })

  test('typing the digit that fills a box moves focus to the next box and selects it', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    await textbox(page, 'Månad').fill('1')
    await textbox(page, 'År').focus()
    // Three digits is not a whole year: focus stays.
    await page.keyboard.type('199')
    await expect(textbox(page, 'År')).toBeFocused()
    await page.keyboard.type('0')
    // Year, then month (which held "1": the move selects it, so typing replaces it), then day.
    await expect(textbox(page, 'Månad')).toBeFocused()
    await page.keyboard.type('12')
    await expect(textbox(page, 'Dag')).toBeFocused()
    await expect(textbox(page, 'År')).toHaveValue('1990')
    await expect(textbox(page, 'Månad')).toHaveValue('12')
    // The hint said so beforehand (3.2.2), and it is visible.
    await expect(page.getByText('Fokus flyttas till nästa ruta när en ruta är full.')).toBeVisible()
    expect(await prevented()).toEqual([])
  })

  test('typing in the last box, or typing that does not fill a box, never moves focus and filters nothing', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    const dayBox = textbox(page, 'Dag')
    await dayBox.focus()
    // The last box is full at two digits, and focus stays: there is no box after it.
    await page.keyboard.type('27')
    await expect(dayBox).toBeFocused()
    // Nothing is filtered or cut: more digits and letters are all typed.
    await page.keyboard.type('12ab')
    await expect(dayBox).toBeFocused()
    await expect(dayBox).toHaveValue('2712ab')
    // Four letters fill the year box and are not digits: focus stays.
    const yearBox = textbox(page, 'År')
    await yearBox.focus()
    await page.keyboard.type('tjug')
    await expect(yearBox).toBeFocused()
    await expect(yearBox).toHaveValue('tjug')
    await expect(textbox(page, 'Månad')).toHaveValue('')
    expect(await prevented()).toEqual([])
  })

  test('editing a box that was already full never moves focus', async ({ page }) => {
    await openStory(page, 'keyboard')
    const yearBox = textbox(page, 'År')
    await yearBox.focus()
    await page.keyboard.type('1990')
    await expect(textbox(page, 'Månad')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(yearBox).toBeFocused()
    // A fifth digit, and replacing a character of the full box: focus stays.
    await page.keyboard.press('End')
    await page.keyboard.type('1')
    await expect(yearBox).toBeFocused()
    await expect(yearBox).toHaveValue('19901')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Shift+ArrowLeft')
    await page.keyboard.type('2')
    await expect(yearBox).toBeFocused()
    await expect(yearBox).toHaveValue('1992')
  })

  test('Backspace and Delete never move focus, not even in an empty box', async ({ page }) => {
    await openStory(page, 'keyboard')
    const monthBox = textbox(page, 'Månad')
    await monthBox.focus()
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Delete')
    await expect(monthBox).toBeFocused()
    await page.keyboard.type('1')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await expect(monthBox).toBeFocused()
    await expect(monthBox).toHaveValue('')
  })

  test('autoAdvance={false}: typing never moves focus to the next box, and there is no hint', async ({
    page,
  }) => {
    await openStory(page, 'no-auto-advance')
    const prevented = await recordPreventedKeys(page)
    const yearBox = textbox(page, 'År')
    await yearBox.focus()
    await page.keyboard.type('1990')
    await expect(yearBox).toBeFocused()
    await page.keyboard.type('12')
    await expect(yearBox).toBeFocused()
    await expect(yearBox).toHaveValue('199012')
    await expect(textbox(page, 'Månad')).toHaveValue('')
    await expect(page.getByText('Fokus flyttas till nästa ruta när en ruta är full.')).toHaveCount(
      0,
    )
    expect(await prevented()).toEqual([])
  })

  test('ArrowUp and ArrowDown never step the value', async ({ page }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    const dayBox = textbox(page, 'Dag')
    await dayBox.focus()
    await page.keyboard.type('27')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowDown')
    await expect(dayBox).toHaveValue('27')
    await expect(dayBox).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and never leave the box', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    // The year box is first: typing four digits in it would move on, so use the day box.
    const dayBox = textbox(page, 'Dag')
    await dayBox.focus()
    await page.keyboard.type('27')
    await page.keyboard.press('Home')
    expect(await caretOf(dayBox)).toBe(0)
    await page.keyboard.press('ArrowRight')
    expect(await caretOf(dayBox)).toBe(1)
    await page.keyboard.press('End')
    expect(await caretOf(dayBox)).toBe(2)
    await page.keyboard.press('ArrowLeft')
    expect(await caretOf(dayBox)).toBe(1)
    // At the end of the text the next press does nothing: focus stays in the box.
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowRight')
    await expect(dayBox).toBeFocused()
    await expect(textbox(page, 'Månad')).not.toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Enter in a box submits the form', async ({ page }) => {
    await openStory(page, 'keyboard')
    await expect(page.getByTestId('submits')).toHaveText('Skickat: 0')
    const prevented = await recordPreventedKeys(page)
    await textbox(page, 'Dag').focus()
    await page.keyboard.type('27')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('submits')).toHaveText('Skickat: 1')
    // Enter was not cancelled by DateInput: the form's own submit handler did the work.
    expect(await prevented()).toEqual([])
  })

  test('right to left: Tab follows the DOM order and the arrow keys stay in the box', async ({
    page,
  }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // The first date of the story: English, so day, month, year in the DOM.
    const boxes = page.locator('fieldset').first().locator('input')
    await page.keyboard.press('Tab')
    await expect(boxes.nth(0)).toBeFocused()
    await expect(boxes.nth(0)).toHaveAccessibleName('Day')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowLeft')
    await expect(boxes.nth(0)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(boxes.nth(1)).toBeFocused()
    await expect(boxes.nth(1)).toHaveAccessibleName('Month')
    await page.keyboard.press('Tab')
    await expect(boxes.nth(2)).toBeFocused()
    await expect(boxes.nth(2)).toHaveAccessibleName('Year')
  })
})

test.describe('DateInput focus and modes', () => {
  test('forced colours keep the edge of every box visible (1.4.11)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
    for (let index = 0; index < count; index += 1) {
      const edge = await edgeOf(inputs.nth(index))
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    await expect(page.locator('.kv-field-error-message').first()).toBeVisible()
  })

  test('no horizontal scrolling at 320px in the Finnish and invalid stories (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['default', 'finnish', 'invalid-year', 'invalid-date', 'narrow']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })
})

test.describe('DateInput accessibility', () => {
  // The DateInput stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['keyboard'],
    ['swedish-sweden'],
    ['swedish-finland'],
    ['finnish'],
    ['english'],
    ['own-order'],
    ['no-auto-advance'],
    ['one-field'],
    ['one-field-finnish'],
    ['invalid-year'],
    ['invalid-date'],
    ['not-a-birthday'],
    ['disabled'],
    ['read-only'],
    ['compact'],
    ['narrow'],
    ['controlled'],
    ['plain-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['invalid-year', theme] as const),
    ...themes.map((theme) => ['forced-colors', theme] as const),
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
