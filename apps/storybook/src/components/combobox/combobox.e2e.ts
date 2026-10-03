import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'
import { virtualizedCount } from '../form/virtualized.fixture.ts'

// Contract: packages/react/src/combobox/combobox.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The stories are Components/Form/Combobox. The
// Keyboard story is the fixture the key tests drive: it has no play function, so nothing else
// touches it. KvirnUI holds no form state: the Controlled story keeps its value in the story.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-combobox--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-combobox-input').first()).toBeVisible()
  if (globals !== undefined) {
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    // The theme store resolved the selected theme onto <html>.
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

/**
 * Listens for keys that a page handler cancelled. The listener sits on the document, so it runs
 * after every handler in the page: a key that the Combobox cancelled shows up here.
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

/** The Keyboard story: a single choice (44px box, 33 options, "Stockholm" disabled), a disabled one, and one of several choices with two values. */
const input = (page: Page) => page.locator('#municipality')
const severalInput = (page: Page) => page.locator('#several')
const closedInput = (page: Page) => page.locator('#closed')
const hiddenValue = (page: Page, name: string) =>
  page.locator(`input[type="hidden"][name="${name}"]`)
const option = (page: Page, name: string) => page.getByRole('option', { name, exact: true })
const activeOption = (page: Page) => page.locator('[role="option"][data-active]')
/** The popup: the role-less shell in the top layer. */
const popupOf = (page: Page) => page.locator('.kv-listbox-popup:popover-open')
/** The listbox inside it: the element that scrolls. */
const listOf = (page: Page) => page.getByRole('listbox')
const removeButton = (page: Page, name: string) =>
  page.getByRole('button', { name: `Ta bort ${name}`, exact: true })
const before = (page: Page) => page.getByRole('button', { name: 'Före' })
const status = (page: Page) => page.getByRole('status')

/** The active option is `name`, and `aria-activedescendant` points at it, from the input that has focus. */
async function expectActive(page: Page, name: string, control: Locator = input(page)) {
  await expect(activeOption(page)).toHaveText(name)
  const id = await activeOption(page).getAttribute('id')
  expect(id).not.toBeNull()
  await expect(control).toHaveAttribute('aria-activedescendant', id ?? '')
  await expect(control).toBeFocused()
}

const expectOpen = (control: Locator) => expect(control).toHaveAttribute('aria-expanded', 'true')
const expectClosed = (control: Locator) => expect(control).toHaveAttribute('aria-expanded', 'false')

/** Focuses the input and types with the keyboard, so the key events fire. */
async function typeInto(control: Locator, page: Page, text: string) {
  await control.focus()
  await page.keyboard.type(text)
}

test.describe('Combobox keyboard contract', () => {
  test('Tab moves to the input, one stop', async ({ page }) => {
    await openStory(page, 'keyboard')
    await before(page).focus()
    await page.keyboard.press('Tab')
    await expect(input(page)).toBeFocused()
    await expect(input(page)).not.toHaveAttribute('tabindex')
    // Toggle and Clear are not tab stops, and the disabled input is skipped: next are the remove buttons.
    await page.keyboard.press('Tab')
    await expect(removeButton(page, 'Malmö')).toBeFocused()
  })

  test('Shift+Tab leaves the input backwards', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(before(page)).toBeFocused()
  })

  test('Tab skips a disabled input', async ({ page }) => {
    await openStory(page, 'keyboard')
    await expect(closedInput(page)).toBeDisabled()
    await input(page).focus()
    await page.keyboard.press('Tab')
    await expect(closedInput(page)).not.toBeFocused()
    await expect(removeButton(page, 'Malmö')).toBeFocused()
    await expect(popupOf(page)).toHaveCount(0)
  })

  test('Tab reaches the remove buttons before the input', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('Tab')
    await expect(removeButton(page, 'Malmö')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(removeButton(page, 'Uppsala')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(severalInput(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('any character filters the list and opens the popup', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await expectOpen(input(page))
    await expect(page.getByRole('option')).toHaveText([
      'Arvika',
      'Kalmar',
      'Karlstad',
      'Oskarshamn',
    ])
    // Nothing is active until an arrow key, and focus stays on the input.
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(input(page)).toBeFocused()
    // Nothing was said while typing: the count comes once typing stops.
    await expect(status(page)).toHaveText('4 resultat', { timeout: 3000 })
  })

  test('any character: å, ä and ö are kept apart from a and o in Swedish', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await input(page).fill('ä')
    await expectOpen(input(page))
    await expect(option(page, 'Gävle')).toBeVisible()
    await expect(option(page, 'Ale')).toHaveCount(0)
    await input(page).fill('a')
    // Gävle has an ä and no a, so a doesn't find it.
    await expect(option(page, 'Ale')).toBeVisible()
    await expect(option(page, 'Gävle')).toHaveCount(0)
    await input(page).fill('ö')
    await expect(option(page, 'Jönköping')).toBeVisible()
    await expect(option(page, 'Oskarshamn')).toHaveCount(0)
  })

  test('ArrowDown opens the popup and activates the chosen or the first option', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectOpen(input(page))
    await expect(popupOf(page)).toBeVisible()
    await expectActive(page, 'Ale')
    await page.keyboard.press('Escape')
    await expectClosed(input(page))
    await page.keyboard.press('ArrowDown')
    await option(page, 'Malmö').click()
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('Malmö')
    await page.keyboard.press('ArrowDown')
    await expectOpen(input(page))
    await expectActive(page, 'Malmö')
  })

  test('ArrowUp opens the popup and activates the chosen or the last option', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowUp')
    await expectOpen(input(page))
    await expectActive(page, 'Östersund')
    await option(page, 'Uppsala').click()
    await expectClosed(input(page))
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Uppsala')
  })

  test('ArrowDown moves to the next option and stops at the last', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alingsås')
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press('PageDown')
    }
    await expectActive(page, 'Östersund')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Östersund')
  })

  test('ArrowUp moves to the previous option and stops at the first', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Ale')
    await page.keyboard.press('PageDown')
    await page.keyboard.press('PageDown')
    await expectActive(page, 'Skellefteå')
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Oskarshamn')
  })

  test('PageDown and PageUp move ten options', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('PageDown')
    await expectActive(page, 'Jönköping')
    await page.keyboard.press('PageDown')
    await expectActive(page, 'Skellefteå')
    await page.keyboard.press('PageDown')
    await page.keyboard.press('PageDown')
    await expectActive(page, 'Östersund')
    await page.keyboard.press('PageUp')
    await expectActive(page, 'Sundsvall')
    for (let step = 0; step < 3; step += 1) {
      await page.keyboard.press('PageUp')
    }
    await expectActive(page, 'Ale')
  })

  test('Home and End move the caret and leave no option active', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Arvika')
    const prevented = await recordPreventedKeys(page)
    const caret = () =>
      input(page).evaluate((element) => (element as HTMLInputElement).selectionStart)
    await page.keyboard.press('Home')
    expect(await caret()).toBe(0)
    // Visual focus is back in the field: the highlight and aria-activedescendant go, the popup stays.
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(activeOption(page)).toHaveCount(0)
    await expectOpen(input(page))
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Arvika')
    await page.keyboard.press('End')
    expect(await caret()).toBe(2)
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    // The keys weren't cancelled: the caret moved natively.
    // The ArrowDown that activates an option is cancelled on purpose: only the caret keys count.
    expect((await prevented()).filter((key) => key !== 'ArrowDown')).toEqual([])
  })

  test('ArrowLeft and ArrowRight move the caret and leave no option active', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Arvika')
    const prevented = await recordPreventedKeys(page)
    const caret = () =>
      input(page).evaluate((element) => (element as HTMLInputElement).selectionStart)
    await page.keyboard.press('ArrowLeft')
    expect(await caret()).toBe(1)
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(activeOption(page)).toHaveCount(0)
    await expectOpen(input(page))
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Arvika')
    await page.keyboard.press('ArrowRight')
    expect(await caret()).toBe(2)
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    // The ArrowDown that activates an option is cancelled on purpose: only the caret keys count.
    expect((await prevented()).filter((key) => key !== 'ArrowDown')).toEqual([])
  })

  test('Enter chooses the active option, fills the input and closes the popup', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Kalmar')
    await page.keyboard.press('Enter')
    await expectClosed(input(page))
    await expect(popupOf(page)).toHaveCount(0)
    await expect(input(page)).toHaveValue('Kalmar')
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(input(page)).toBeFocused()
    await expect(hiddenValue(page, 'municipality')).toHaveValue('kalmar')
    // Enter chose an option: it didn't submit the form.
    await expect(page.getByTestId('sent')).toHaveCount(0)
  })

  test('Enter with several choices adds the value, empties the text and keeps the popup open', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await typeInto(severalInput(page), page, 'lule')
    await expect(page.getByRole('option')).toHaveText(['Luleå'])
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(removeButton(page, 'Luleå')).toBeVisible()
    await expect(severalInput(page)).toHaveValue('')
    await expectOpen(severalInput(page))
    await expect(listOf(page)).toHaveAttribute('aria-multiselectable', 'true')
    // The whole list is back, with the chosen option marked.
    await expect(option(page, 'Luleå')).toHaveAttribute('aria-selected', 'true')
    await expect(option(page, 'Ale')).toBeVisible()
    await expect(hiddenValue(page, 'several')).toHaveCount(3)
    await expect(severalInput(page)).toBeFocused()
  })

  test('Enter with no active option is the browser’s own and submits the form', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await expectOpen(input(page))
    await expect(activeOption(page)).toHaveCount(0)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('sent')).toBeVisible()
    // Nothing was chosen, and the text stays.
    await expect(input(page)).toHaveValue('ka')
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
  })

  test('Space types a space and chooses nothing', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Space')
    await expect(input(page)).toHaveValue('ka ')
    await expectOpen(input(page))
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
    expect(await prevented()).toEqual([])
  })

  test('Escape closes the popup and keeps the text and the value', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await option(page, 'Malmö').click()
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Malmö')
    await page.keyboard.press('Escape')
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('Malmö')
    await expect(hiddenValue(page, 'municipality')).toHaveValue('malmö')
    // A second Escape does nothing: losing typed text is worse than an extra key.
    await page.keyboard.press('Escape')
    await expect(input(page)).toHaveValue('Malmö')
    await expect(input(page)).toBeFocused()
    // Typed text stays too.
    await input(page).fill('ka')
    await expectOpen(input(page))
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('ka')
  })

  test('Escape does nothing when the popup is closed', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expectClosed(input(page))
    await expect(input(page)).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Alt+ArrowDown opens the popup without activating an option', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expectOpen(input(page))
    await expect(popupOf(page)).toBeVisible()
    await expect(activeOption(page)).toHaveCount(0)
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(input(page)).toBeFocused()
  })

  test('Alt+ArrowUp chooses the active option and closes the popup', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Alt+ArrowUp')
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('Alingsås')
    await expect(input(page)).toBeFocused()
  })

  test('Tab closes the popup without choosing and moves focus on', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Arvika')
    await page.keyboard.press('Tab')
    await expectClosed(input(page))
    // Nothing was chosen, and the text stays.
    await expect(input(page)).toHaveValue('ka')
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
    await expect(removeButton(page, 'Malmö')).toBeFocused()
  })

  test('Shift+Tab closes the popup without choosing and moves focus back', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+Tab')
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('ka')
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
    await expect(before(page)).toBeFocused()
  })

  test('a disabled option can be reached and cannot be chosen', async ({ page }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'stock')
    await expect(page.getByRole('option')).toHaveText(['Stockholm'])
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Stockholm')
    await expect(option(page, 'Stockholm')).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Enter')
    await expectOpen(input(page))
    await option(page, 'Stockholm').click({ force: true })
    await expectOpen(input(page))
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
    await expect(page.getByTestId('sent')).toHaveCount(0)
  })

  test('Backspace in the empty input does not remove a value', async ({ page }) => {
    await openStory(page, 'keyboard')
    await severalInput(page).focus()
    await expect(severalInput(page)).toHaveValue('')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await expect(removeButton(page, 'Malmö')).toBeVisible()
    await expect(removeButton(page, 'Uppsala')).toBeVisible()
    await expect(hiddenValue(page, 'several')).toHaveCount(2)
  })

  test('Enter and Space on a remove button remove the value and move focus on', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await removeButton(page, 'Malmö').focus()
    await page.keyboard.press('Enter')
    await expect(removeButton(page, 'Malmö')).toHaveCount(0)
    // The next remove button gets focus, else the previous one, else the input.
    await expect(removeButton(page, 'Uppsala')).toBeFocused()
    await page.keyboard.press('Space')
    await expect(removeButton(page, 'Uppsala')).toHaveCount(0)
    await expect(severalInput(page)).toBeFocused()
    await expect(hiddenValue(page, 'several')).toHaveCount(0)
  })

  test('a press on an option chooses it and keeps focus on the input', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await option(page, 'Malmö').click()
    await expectClosed(input(page))
    await expect(input(page)).toHaveValue('Malmö')
    await expect(input(page)).toBeFocused()
    await expect(hiddenValue(page, 'municipality')).toHaveValue('malmö')
  })

  test('moving the pointer over an option makes it active', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await option(page, 'Falun').hover()
    await expectActive(page, 'Falun')
    await option(page, 'Gävle').hover()
    await expectActive(page, 'Gävle')
  })

  test('a press on Toggle opens and closes the popup and keeps focus on the input', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const toggle = page.getByRole('button', { name: 'Visa alternativ' })
    await expect(toggle).toHaveAttribute('tabindex', '-1')
    await toggle.click()
    await expectOpen(input(page))
    await expect(popupOf(page)).toBeVisible()
    await expect(input(page)).toBeFocused()
    await expect(activeOption(page)).toHaveCount(0)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await toggle.click()
    await expectClosed(input(page))
    await expect(input(page)).toBeFocused()
  })

  test('a press on Clear empties the text and the value', async ({ page }) => {
    await openStory(page, 'keyboard')
    const clear = page.getByRole('button', { name: 'Rensa' })
    // Nothing to clear yet, so there is no button.
    await expect(clear).toHaveCount(0)
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await option(page, 'Malmö').click()
    await expect(clear).toHaveAttribute('tabindex', '-1')
    await clear.click()
    await expect(input(page)).toHaveValue('')
    await expect(hiddenValue(page, 'municipality')).toHaveValue('')
    await expect(input(page)).toBeFocused()
    await expect(clear).toHaveCount(0)
  })

  test('a press on Clear with several choices empties the typed text and keeps the chosen values', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const clear = page.locator('.kv-combobox-control:has(#several)').getByRole('button', {
      name: 'Rensa',
    })
    // Nothing typed: the chosen values alone don't make a Clear button.
    await expect(clear).toHaveCount(0)
    await typeInto(severalInput(page), page, 'lu')
    await expect(clear).toHaveCount(1)
    await clear.click()
    await expect(severalInput(page)).toHaveValue('')
    await expect(severalInput(page)).toBeFocused()
    await expect(removeButton(page, 'Malmö')).toBeVisible()
    await expect(removeButton(page, 'Uppsala')).toBeVisible()
    await expect(hiddenValue(page, 'several')).toHaveCount(2)
    await expect(clear).toHaveCount(0)
  })

  test('a press outside closes the popup', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectOpen(input(page))
    // The button above the field: the popup sits under it and would cover the later controls.
    await before(page).click()
    await expectClosed(input(page))
    await expect(before(page)).toBeFocused()
  })

  test('clicking the label focuses the input', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.locator('label[for="municipality"]').click()
    await expect(input(page)).toBeFocused()
    await expectClosed(input(page))
  })
})

test.describe('Combobox focus and modes', () => {
  test('the box and the options are 44px high, and the ring is 2px with a 2px offset (2.5.8)', async ({
    page,
  }) => {
    // The Keyboard story has no play function, so Tab starts from the top of a clean page.
    await openStory(page, 'keyboard')
    const box = page.locator('.kv-combobox-control').first()
    expect((await box.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    // Reach the input with the keyboard, so the focus ring shows.
    await before(page).focus()
    await page.keyboard.press('Tab')
    await expect(input(page)).toBeFocused()
    await expect(box).toHaveAttribute('data-focus-visible', '')
    await expect(box).toHaveCSS('outline-style', 'solid')
    await expect(box).toHaveCSS('outline-width', '2px')
    await expect(box).toHaveCSS('outline-offset', '2px')
    await page.keyboard.press('ArrowDown')
    const options = page.getByRole('option')
    await expect(options.first()).toBeVisible()
    const heights = await options.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    )
    expect(heights.length).toBeGreaterThan(0)
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44)
    }
    // Toggle, and the remove buttons of the chips, are at least 24px (2.5.8) and 44px in the theme.
    const remove = await removeButton(page, 'Malmö').boundingBox()
    expect(remove?.width).toBeGreaterThanOrEqual(44)
    expect(remove?.height).toBeGreaterThanOrEqual(44)
    const toggle = await page.getByRole('button', { name: 'Visa alternativ' }).boundingBox()
    expect(toggle?.width).toBeGreaterThanOrEqual(44)
    expect(toggle?.height).toBeGreaterThanOrEqual(24)
  })

  test('the remove button’s ring is 2px', async ({ page }) => {
    await openStory(page, 'keyboard')
    await input(page).focus()
    await page.keyboard.press('Tab')
    const remove = removeButton(page, 'Malmö')
    await expect(remove).toBeFocused()
    await expect(remove).toHaveCSS('outline-style', 'solid')
    await expect(remove).toHaveCSS('outline-width', '2px')
  })

  test('an invalid box has a 2px edge, and the error is in the input’s description', async ({
    page,
  }) => {
    await openStory(page, 'invalid')
    const box = page.locator('.kv-combobox-control')
    await expect(box).toHaveCSS('border-top-width', '2px')
    await expect(page.locator('.kv-combobox-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('.kv-combobox-input')).toHaveAccessibleDescription(
      'Börja skriva och välj sedan i listan. Fel: Välj en kommun i listan',
    )
    // The text that matched nothing stays.
    await expect(page.locator('.kv-combobox-input')).toHaveValue('Gö')
  })

  test('the popup is as wide as the box, under it, and never covers it', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = page.locator('.kv-combobox-control').first()
    await page.getByRole('button', { name: 'Visa alternativ' }).click()
    await expect(popupOf(page)).toBeVisible()
    const boxBox = await box.boundingBox()
    const popupBox = await popupOf(page).boundingBox()
    expect(boxBox).not.toBeNull()
    expect(popupBox).not.toBeNull()
    expect(Math.abs((popupBox?.width ?? 0) - (boxBox?.width ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs((popupBox?.x ?? 0) - (boxBox?.x ?? 0))).toBeLessThanOrEqual(1)
    const boxBottom = (boxBox?.y ?? 0) + (boxBox?.height ?? 0)
    const popupBottom = (popupBox?.y ?? 0) + (popupBox?.height ?? 0)
    // Under the box, or above it when there is no room: never over it.
    expect((popupBox?.y ?? 0) >= boxBottom - 1 || popupBottom <= (boxBox?.y ?? 0) + 1).toBe(true)
  })

  test('the popup never covers the input after a choice or when the chips wrap (2.4.11)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'keyboard')
    // Neither scrolling nor a resize of the input: choosing adds a chip above it, which pushes it down.
    const isClear = () =>
      page.evaluate(() => {
        const field = document.querySelector('#several')?.getBoundingClientRect()
        const popup = document
          .querySelector('.kv-listbox-popup:popover-open')
          ?.getBoundingClientRect()
        if (!field || !popup) return false
        return popup.top >= field.bottom - 1 || popup.bottom <= field.top + 1
      })
    await typeInto(severalInput(page), page, 'lule')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(removeButton(page, 'Luleå')).toBeVisible()
    await expectOpen(severalInput(page))
    await expect.poll(isClear).toBe(true)
    // More choices wrap the chips onto more rows at 320px, and push the input further down.
    for (const [typed, name] of [
      ['lund', 'Lund'],
      ['karl', 'Karlstad'],
    ] as const) {
      await page.keyboard.type(typed)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expect(removeButton(page, name)).toBeVisible()
      await expect.poll(isClear).toBe(true)
    }
  })

  test('a long list scrolls inside the popup, and the active option stays in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 })
    await openStory(page, 'long-list')
    // The story's play function opens the popup: wait for it, then move the highlight.
    await expect(popupOf(page)).toBeVisible()
    const control = page.locator('.kv-combobox-input')
    await control.focus()
    const scrolls = await listOf(page).evaluate((element) => ({
      scrolls: element.scrollHeight > element.clientHeight,
      fits: element.getBoundingClientRect().bottom <= window.innerHeight + 1,
    }))
    expect(scrolls).toEqual({ scrolls: true, fits: true })
    for (let step = 0; step < 31; step += 1) {
      await page.keyboard.press('PageDown')
    }
    await expect(activeOption(page)).toHaveText('Ort 300')
    const inView = await page.evaluate(() => {
      const active = document.querySelector('[role="option"][data-active]')
      const popupElement = active?.closest('[role="listbox"]')
      if (!active || !popupElement) return false
      const a = active.getBoundingClientRect()
      const p = popupElement.getBoundingClientRect()
      return a.top >= p.top - 1 && a.bottom <= p.bottom + 1
    })
    expect(inView).toBe(true)
  })

  test('forced colours keep the edges, the cross and the chevron', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    // The story's play function opens the first popup with ArrowDown: the active option is Highlight.
    await expect(popupOf(page)).toBeVisible()
    await expect(activeOption(page)).toHaveCount(1)
    const active = await activeOption(page).evaluate((element) => {
      const style = getComputedStyle(element)
      const popupStyle = getComputedStyle(element.closest('.kv-listbox-popup') as Element)
      return {
        fillDiffers: style.backgroundColor !== popupStyle.backgroundColor,
        textDiffers: style.color !== popupStyle.color,
        bar: Number.parseFloat(style.borderInlineStartWidth),
      }
    })
    expect(active).toEqual({ fillDiffers: true, textDiffers: true, bar: 4 })
    const boxes = page.locator('.kv-combobox-control')
    // The 2px width carries invalid, the dashed edge carries disabled (1.4.1).
    await expect(boxes.nth(0)).toHaveCSS('border-top-width', '1px')
    await expect(boxes.nth(1)).toHaveCSS('border-top-width', '2px')
    await expect(boxes.nth(2)).toHaveCSS('border-top-style', 'dashed')
    const marks = await page.evaluate(() => {
      const chevron = getComputedStyle(
        document.querySelector('.kv-combobox-toggle') as Element,
        '::after',
      )
      const cross = getComputedStyle(
        document.querySelector('.kv-combobox-value-remove') as Element,
        '::before',
      )
      const chip = getComputedStyle(document.querySelector('.kv-combobox-value') as Element)
      return {
        chevron: chevron.borderBottomWidth,
        cross: cross.borderTopWidth,
        chip: chip.borderTopWidth,
      }
    })
    // Borders, not backgrounds, so the system colours keep them.
    expect(marks).toEqual({ chevron: '2px', cross: '2px', chip: '1px' })
  })

  test('reduced motion: the input does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'keyboard')
    await expect(page.locator('.kv-combobox-control').first()).toHaveCSS(
      'transition-duration',
      '0s',
    )
  })

  test('no horizontal scrolling at 320px with the popup open (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    // Each story's play function opens the popup.
    for (const story of ['long-finnish', 'groups', 'rich-options', 'multiple', 'no-results']) {
      await openStory(page, story)
      await expect(popupOf(page)).toBeVisible()
      expect(await hasHorizontalScroll(page), story).toBe(false)
      const box = await popupOf(page).boundingBox()
      expect(box?.x ?? -1, story).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0), story).toBeLessThanOrEqual(320)
    }
    await openStory(page, 'long-finnish')
    await expect(popupOf(page)).toBeVisible()
    const field = await page.locator('.kv-field').first().boundingBox()
    const control = await page.locator('.kv-combobox-control').first().boundingBox()
    const popup = await popupOf(page).boundingBox()
    expect(control?.width).toBeLessThanOrEqual((field?.width ?? 0) + 0.5)
    // At least as wide as the box, never narrower.
    expect(popup?.width).toBeGreaterThanOrEqual((control?.width ?? 0) - 1)
    // The chips wrap: a long chosen value stays inside its column.
    const chips = await page
      .locator('.kv-combobox-value')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().right))
    for (const right of chips) {
      expect(right).toBeLessThanOrEqual(320)
    }
  })

  test('right to left: the chevron is at the inline end, and the chips start at the right', async ({
    page,
  }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const layout = await page.evaluate(() => {
      const input = document.querySelector('.kv-combobox-input') as Element
      const toggle = document.querySelector('.kv-combobox-toggle') as Element
      const chips = [...document.querySelectorAll('.kv-combobox-value')].map(
        (element) => element.getBoundingClientRect().x,
      )
      return {
        direction: getComputedStyle(input).direction,
        toggleLeftOfInput: toggle.getBoundingClientRect().x < input.getBoundingClientRect().x,
        chipsFromRight:
          chips.length > 1 && chips.every((x, index) => index === 0 || x < (chips[index - 1] ?? 0)),
      }
    })
    expect(layout).toEqual({ direction: 'rtl', toggleLeftOfInput: true, chipsFromRight: true })
  })
})

test.describe('Combobox right to left', () => {
  test('right to left: ArrowDown and ArrowUp still mean next and previous option, and ArrowLeft and ArrowRight only move the caret', async ({
    page,
  }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // The story's play function opens the first popup: wait for it, then filter the list.
    await expect(popupOf(page)).toBeVisible()
    const control = page.locator('.kv-combobox-input').first()
    await control.fill('al')
    await expect(page.getByRole('option')).toHaveText(['Ale', 'Alingsås', 'Falun'])
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Ale', control)
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alingsås', control)
    // Vertical arrows don't flip with the reading direction.
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Ale', control)
    // The horizontal ones are the text field's: the caret moves, and no option stays active.
    await page.keyboard.press('ArrowLeft')
    await expect(control).not.toHaveAttribute('aria-activedescendant')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Ale', control)
    await page.keyboard.press('ArrowRight')
    await expect(control).not.toHaveAttribute('aria-activedescendant')
    // The ArrowDown and ArrowUp that move the highlight are cancelled on purpose: only the caret keys count.
    expect((await prevented()).filter((key) => key !== 'ArrowDown' && key !== 'ArrowUp')).toEqual(
      [],
    )
  })
})

/** `aria-activedescendant` points at an element that is in the page, right now (not after a retry). */
const activeDescendantResolves = (page: Page) =>
  page.evaluate(() => {
    const id = document.querySelector('[role="combobox"]')?.getAttribute('aria-activedescendant')
    const element = id === null || id === undefined ? null : document.getElementById(id)
    return element !== null && element.getAttribute('role') === 'option'
  })

/** The active option is inside the list's box: it was scrolled into view, not just rendered. */
async function expectActiveInView(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.querySelector('[role="option"][data-active]')
        const list = active?.closest('[role="listbox"]')
        if (!active || !list) return false
        const a = active.getBoundingClientRect()
        const p = list.getBoundingClientRect()
        return a.top >= p.top - 1 && a.bottom <= p.bottom + 1
      }),
    )
    .toBe(true)
}

test.describe('Combobox virtualization keyboard contract', () => {
  test('virtualized: only a window of the options is in the page, each with its place in the list', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 })
    await openStory(page, 'virtualized-keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectOpen(input(page))
    await expect(listOf(page)).toHaveAttribute('data-virtualized', '')
    const options = page.getByRole('option')
    await expect.poll(() => options.count()).toBeGreaterThan(5)
    expect(await options.count()).toBeLessThan(80)
    await expect(options.first()).toHaveAttribute('aria-setsize', String(virtualizedCount))
    await expect(options.first()).toHaveAttribute('aria-posinset', '1')
    await expect(options.last()).toHaveAttribute('aria-setsize', String(virtualizedCount))
    const sizes = await listOf(page).evaluate((element) => ({
      scrolls: element.scrollHeight > element.clientHeight * 100,
      fits: element.getBoundingClientRect().bottom <= window.innerHeight + 1,
    }))
    expect(sizes).toEqual({ scrolls: true, fits: true })
  })

  test('virtualized: ArrowUp opens the popup and activates the last option, rendered and in view', async ({
    page,
  }) => {
    await openStory(page, 'virtualized-keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowUp')
    await expectOpen(input(page))
    await expectActive(page, 'Österbo 250')
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', String(virtualizedCount))
    await expect(activeOption(page)).toHaveAttribute('aria-setsize', String(virtualizedCount))
    await expectActiveInView(page)
    await expect(option(page, 'Alvik 1')).toHaveCount(0)
    expect(await page.getByRole('option').count()).toBeLessThan(80)
  })

  test('virtualized: ArrowDown and ArrowUp always leave aria-activedescendant on an option in the page', async ({
    page,
  }) => {
    await openStory(page, 'virtualized-keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alvik 1')
    // Far past the first window: each key renders the next option before the input points at it.
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('ArrowDown')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    await expectActive(page, 'Alvik 41')
    await expectActiveInView(page)
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('ArrowUp')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    await expectActive(page, 'Alvik 1')
    await expectActiveInView(page)
  })

  test('virtualized: PageDown and PageUp move ten options that may not be rendered', async ({
    page,
  }) => {
    await openStory(page, 'virtualized-keyboard')
    await input(page).focus()
    await page.keyboard.press('ArrowDown')
    for (let step = 0; step < 25; step += 1) {
      await page.keyboard.press('PageDown')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    // 1 + 25 × 10 = 251: the first option of the second place.
    await expectActive(page, 'Backa 1')
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '251')
    await expectActiveInView(page)
    await page.keyboard.press('PageUp')
    await expectActive(page, 'Alvik 241')
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '241')
    await expectActiveInView(page)
  })

  test('virtualized: typing filters the whole list, and the size of the set follows', async ({
    page,
  }) => {
    await openStory(page, 'virtualized-keyboard')
    await typeInto(input(page), page, 'Gammelby')
    await expectOpen(input(page))
    // 250 options contain the text: a smaller list, still virtualized, with its size set again.
    await expect(page.getByRole('option').first()).toHaveAttribute('aria-setsize', '250')
    await expect(page.getByRole('option').first()).toHaveText('Gammelby 1')
    await expect(page.getByRole('option').first()).toHaveAttribute('aria-posinset', '1')
    expect(await page.getByRole('option').count()).toBeLessThan(80)
    // Nothing is active until a key moves there.
    await expect(input(page)).not.toHaveAttribute('aria-activedescendant')
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Gammelby 250')
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '250')
    await expectActiveInView(page)
  })
})

test.describe('Combobox accessibility', () => {
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['keyboard'],
    ['minimal'],
    ['selected'],
    ['filtering'],
    ['no-results'],
    ['loading'],
    ['groups'],
    ['disabled-option'],
    ['invalid'],
    ['disabled'],
    ['multiple'],
    ['multiple-one'],
    ['multiple-many'],
    ['long-list'],
    ['virtualized'],
    ['rich-options'],
    ['on-surfaces'],
    ['compact'],
    ['long-finnish'],
    ['controlled'],
    ['plain-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['multiple-many', theme] as const),
    ...themes.map((theme) => ['selected', theme] as const),
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

  test('no axe violations with the popup open, an option active and values chosen', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await typeInto(input(page), page, 'ka')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(popupOf(page)).toBeVisible()
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
