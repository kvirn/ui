import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/number-input/number-input.a11y.md › Keyboard and Visual / modes.
// One test per row, named after it. The rows that need no real page (Tab order, paste, Enter) are
// component tests in number-input.test.tsx. The look of the input (focus ring, edge, forced
// colours) is the TextInput's: text-input.e2e.ts proves it for the shared `kv-input`.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-numberinput--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-input').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const rentLabel = 'Hur mycket hyra betalar du per månad?'

/** The value with every kind of space as a plain one: the grouping is a no-break space. */
const shownValue = (input: Locator) => input.inputValue().then((value) => value.replace(/\s/g, ' '))

/**
 * Listens for keys that a page handler cancelled. The listener sits on the document, so it runs
 * after every handler in the page: a key NumberInput intercepted would show up here. Returns a
 * function that reads the keys cancelled so far.
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

const caretOf = (input: Locator) =>
  input.evaluate((element: HTMLInputElement) => element.selectionStart)

test.describe('NumberInput keyboard contract', () => {
  test('a letter is left out, and the number types as written', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    await input.focus()
    // Typed the way people write: the mask groups the digits and drops the unit's letters.
    await page.keyboard.type('1 250,50 kr')
    await expect.poll(() => shownValue(input)).toBe('1 250,50')
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    await input.fill('1250')
    await input.focus()
    const before = await input.inputValue()
    const end = before.length
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Home')
    expect(await caretOf(input)).toBe(0)
    await page.keyboard.press('End')
    expect(await caretOf(input)).toBe(end)
    await page.keyboard.press('ArrowLeft')
    expect(await caretOf(input)).toBe(end - 1)
    await page.keyboard.press('ArrowLeft')
    expect(await caretOf(input)).toBe(end - 2)
    await page.keyboard.press('ArrowRight')
    expect(await caretOf(input)).toBe(end - 1)
    await expect(input).toHaveValue(before)
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('ArrowLeft and ArrowRight move the caret in a right-to-left page and are not intercepted', async ({
    page,
  }) => {
    await openStory(page, 'rtl')
    const input = page.getByRole('textbox', { name: 'How much rent do you pay each month?' })
    await input.fill('1250')
    await input.focus()
    const before = await input.inputValue()
    await page.keyboard.press('Home')
    const prevented = await recordPreventedKeys(page)
    // In a right-to-left page the browser decides which arrow moves forward: from the start, one
    // of the two moves the caret, and the page never takes either key.
    await page.keyboard.press('ArrowLeft')
    const afterLeft = (await caretOf(input)) ?? 0
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    const afterRight = (await caretOf(input)) ?? 0
    expect(Math.max(afterLeft, afterRight)).toBeGreaterThan(0)
    await expect(input).toHaveValue(before)
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('ArrowUp and ArrowDown never change the value', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    await input.fill('1250,50')
    await input.focus()
    const before = await input.inputValue()
    const prevented = await recordPreventedKeys(page)
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowDown']) {
      await page.keyboard.press(key)
    }
    await expect(input).toHaveValue(before)
    await expect(input).toBeFocused()
    // Native caret movement only: the page didn't take the key.
    expect(await prevented()).toEqual([])
  })

  test('Backspace and Delete remove a character, also next to a group separator', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    const digitsOf = async () => (await input.inputValue()).replace(/\D/g, '')
    await input.focus()
    await page.keyboard.type('12500')
    await expect.poll(digitsOf).toBe('12500')
    const prevented = await recordPreventedKeys(page)
    // The caret is right after the group separator ("12 |500"): Backspace removes a digit.
    for (let step = 0; step < 3; step += 1) {
      await page.keyboard.press('ArrowLeft')
    }
    await page.keyboard.press('Backspace')
    await expect.poll(async () => (await digitsOf()).length).toBe(4)
    // From the start, Delete removes the next character.
    await page.keyboard.press('Home')
    await page.keyboard.press('Delete')
    await expect.poll(async () => (await digitsOf()).length).toBe(3)
    expect(await prevented()).toEqual([])
  })

  test('Control/Command+A selects all the text', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    await input.fill('1250,50')
    await input.focus()
    const length = (await input.inputValue()).length
    await page.keyboard.press('ControlOrMeta+A')
    const selection = await input.evaluate((element: HTMLInputElement) => [
      element.selectionStart,
      element.selectionEnd,
    ])
    expect(selection).toEqual([0, length])
  })

  test('Escape does nothing: the value and the focus stay', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = page.getByRole('textbox', { name: rentLabel })
    await input.fill('1250,50')
    await input.focus()
    const before = await input.inputValue()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expect(input).toHaveValue(before)
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('clicking the label focuses the input', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.getByText(rentLabel).click()
    await expect(page.getByRole('textbox', { name: rentLabel })).toBeFocused()
  })
})

test.describe('NumberInput modes', () => {
  test('no horizontal scrolling at 320px: Finnish, amounts and a unit (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['default', 'finnish', 'amount', 'amount-with-unit', 'out-of-range']) {
      await openStory(page, story)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll, story).toBe(false)
    }
  })
})

test.describe('NumberInput accessibility', () => {
  // The stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['keyboard'],
    ['whole-number'],
    ['amount'],
    ['amount-with-unit'],
    ['negative'],
    ['out-of-range'],
    ['finnish'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['default', theme] as const),
    ...themes.map((theme) => ['out-of-range', theme] as const),
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
