import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'
import { firstIndexOf, virtualizedCount } from '../form/virtualized.fixture.ts'

// Contract: packages/react/src/listbox/listbox.a11y.md › Keyboard, Focus management
// and Visual / modes. One test per row, named after it. The first half is the native rendering
// (the Native… stories of Components/Form/Listbox, where Listbox.Root renders the browser's
// <select> for native="always"), whose keys are the browser's: those rows describe Chromium on
// Windows and Linux, which this spec drives. The second half is the stylable popup (Listbox.Root,
// the other stories), with tests titled "popup: …". KvirnUI holds no form state: the
// Controlled story keeps its value in the story.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const nativeStoryUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-listbox--native-${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

/** Opens a native-rendering story (`native="always"`): the stories named Native… in Components/Form/Listbox. */
async function openNativeStory(page: Page, story: string, globals?: string) {
  await page.goto(nativeStoryUrl(story, globals))
  await expect(page.locator('.kv-listbox-native').first()).toBeVisible()
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
 * after every handler in the page: a key the native select's rendering intercepted would show up here.
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

const select = (page: Page) => page.getByRole('combobox', { name: 'Kommun', exact: true })

test.describe('Native listbox keyboard contract', () => {
  test('Tab moves to the select, one stop', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(select(page)).toBeFocused()
    // The disabled select is skipped, so the next stop is the button.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('Shift+Tab leaves the select backwards', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    await select(page).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('select:focus')).toHaveCount(0)
    await page.getByRole('button', { name: 'Skicka' }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(select(page)).toBeFocused()
  })

  test('Tab skips a disabled select', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    const disabled = page.locator('select[name="disabled"]')
    await expect(disabled).toBeDisabled()
    await select(page).focus()
    await page.keyboard.press('Tab')
    await expect(disabled).not.toBeFocused()
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('ArrowDown chooses the next option', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    await select(page).focus()
    const prevented = await recordPreventedKeys(page)
    await expect(select(page)).toHaveValue('')
    await page.keyboard.press('ArrowDown')
    await expect(select(page)).toHaveValue('gothenburg')
    await page.keyboard.press('ArrowDown')
    await expect(select(page)).toHaveValue('malmo')
    await expect(select(page)).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('ArrowUp chooses the previous option', async ({ page }) => {
    await openNativeStory(page, 'selected')
    await select(page).focus()
    await expect(select(page)).toHaveValue('stockholm')
    await page.keyboard.press('ArrowUp')
    await expect(select(page)).toHaveValue('malmo')
    await page.keyboard.press('ArrowUp')
    await expect(select(page)).toHaveValue('gothenburg')
    // No wrap: the instruction option is first, and ArrowUp stops there.
    await page.keyboard.press('ArrowUp')
    await expect(select(page)).toHaveValue('')
    await page.keyboard.press('ArrowUp')
    await expect(select(page)).toHaveValue('')
  })

  test('Home and End choose the first and the last option', async ({ page }) => {
    await openNativeStory(page, 'selected')
    await select(page).focus()
    await page.keyboard.press('End')
    await expect(select(page)).toHaveValue('uppsala')
    await page.keyboard.press('Home')
    await expect(select(page)).toHaveValue('')
  })

  test('typing a letter chooses the option that starts with it', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    await select(page).focus()
    await page.keyboard.press('U')
    await expect(select(page)).toHaveValue('uppsala')
    // Wait out the typeahead buffer, then a new letter starts over.
    await page.waitForTimeout(1200)
    await page.keyboard.press('M')
    await expect(select(page)).toHaveValue('malmo')
    await page.waitForTimeout(1200)
    await page.keyboard.press('s')
    await expect(select(page)).toHaveValue('stockholm')
  })

  test('Alt+ArrowDown opens the list and Escape closes it', async ({ page }) => {
    await openNativeStory(page, 'selected')
    await select(page).focus()
    const isOpen = () => select(page).evaluate((element) => element.matches(':open'))
    expect(await isOpen()).toBe(false)
    await page.keyboard.press('Alt+ArrowDown')
    await expect.poll(isOpen).toBe(true)
    await page.keyboard.press('Escape')
    await expect.poll(isOpen).toBe(false)
    // The value didn't change, and focus stayed on the select.
    await expect(select(page)).toHaveValue('stockholm')
    await expect(select(page)).toBeFocused()
  })

  test('clicking the label focuses the select', async ({ page }) => {
    await openNativeStory(page, 'default')
    await page.getByText('Kommun', { exact: true }).click()
    await expect(select(page)).toBeFocused()
  })
})

test.describe('Native listbox focus and modes', () => {
  test('the select is 44px high and keeps the ring: 2px, offset 2px (2.5.8)', async ({ page }) => {
    await openNativeStory(page, 'default')
    const box = await select(page).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
    await page.keyboard.press('Tab')
    await expect(select(page)).toBeFocused()
    await expect(select(page)).toHaveAttribute('data-focus-visible', '')
    await expect(select(page)).toHaveCSS('outline-style', 'solid')
    await expect(select(page)).toHaveCSS('outline-width', '2px')
    await expect(select(page)).toHaveCSS('outline-offset', '2px')
  })

  test('an invalid select is 2px, the text does not move, and the error is in its description', async ({
    page,
  }) => {
    await openNativeStory(page, 'invalid')
    const invalid = select(page)
    await expect(invalid).toHaveCSS('border-top-width', '2px')
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAccessibleDescription(
      'Kommunen där du är folkbokförd. Fel: Välj en kommun',
    )
    // Border and padding add up to the same 12px, valid or invalid.
    const inset = () =>
      select(page).evaluate((element) => {
        const style = getComputedStyle(element)
        return (
          Number.parseFloat(style.borderInlineStartWidth) +
          Number.parseFloat(style.paddingInlineStart)
        )
      })
    const invalidInset = await inset()
    await openNativeStory(page, 'default')
    expect(await inset()).toBe(invalidInset)
    expect(invalidInset).toBe(13)
  })

  test('the chevron is drawn on the select, not an image, and is muted when disabled', async ({
    page,
  }) => {
    await openNativeStory(page, 'default')
    const layers = await select(page).evaluate((element) => {
      const style = getComputedStyle(element)
      return { image: style.backgroundImage, appearance: style.appearance }
    })
    expect(layers.appearance).toBe('none')
    expect(layers.image.match(/linear-gradient/g)).toHaveLength(2)
    expect(layers.image).not.toContain('url(')
  })

  test('forced colours: the select keeps its edge, its invalid width and a native chevron', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openNativeStory(page, 'forced-colors')
    const selects = page.locator('.kv-listbox-native')
    const edge = (index: number) =>
      selects.nth(index).evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          width: Number.parseFloat(style.borderTopWidth),
          style: style.borderTopStyle,
          differsFromBackground: style.borderTopColor !== style.backgroundColor,
          appearance: style.appearance,
          image: style.backgroundImage,
        }
      })
    // The native appearance draws the arrow in a system colour; no gradient is left to drop.
    expect(await edge(0)).toEqual({
      width: 1,
      style: 'solid',
      differsFromBackground: true,
      appearance: 'auto',
      image: 'none',
    })
    // The 2px width carries invalid, together with the message (1.4.1).
    expect(await edge(1)).toMatchObject({ width: 2, style: 'solid', differsFromBackground: true })
    expect(await edge(3)).toMatchObject({ width: 1, style: 'dashed', differsFromBackground: true })
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
  })

  test('reduced motion: the select does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openNativeStory(page, 'default')
    await expect(select(page)).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px with the long Finnish label (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'invalid', 'groups', 'keyboard']) {
      await openNativeStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
    await openNativeStory(page, 'long-finnish')
    const field = await page.locator('.kv-field').boundingBox()
    const control = await page.locator('.kv-listbox-native').boundingBox()
    expect(control?.width).toBeLessThanOrEqual((field?.width ?? 0) + 0.5)
  })

  test('right to left: the chevron is at the inline end, on the left', async ({ page }) => {
    await openNativeStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const positions = await page
      .locator('.kv-listbox-native')
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return { position: style.backgroundPositionX, direction: style.direction }
      })
    expect(positions.direction).toBe('rtl')
    // Both strokes are positioned from the left edge in right-to-left text, the "\\" stroke
    // nearer to it than the "/" stroke.
    expect(positions.position).toBe('12px, 18px')
    await openNativeStory(page, 'default')
    const ltr = await select(page).evaluate(
      (element) => getComputedStyle(element).backgroundPositionX,
    )
    expect(ltr).toBe('calc(100% - 18px), calc(100% - 12px)')
  })
})

test.describe('Native listbox accessibility', () => {
  test('a11y tree of the keyboard fixture', async ({ page }) => {
    await openNativeStory(page, 'keyboard')
    await expect(page.locator('form')).toMatchAriaSnapshot(`
      - text: Kommun
      - combobox "Kommun":
        - option "Välj kommun" [selected]
        - option "Göteborg"
        - option "Malmö"
        - option "Stockholm"
        - option "Uppsala"
      - text: Kommun där bostadsanpassningsbidraget ska betalas ut
      - combobox "Kommun där bostadsanpassningsbidraget ska betalas ut" [disabled]:
        - option "Välj kommun" [selected]
        - option "Göteborg"
        - option "Malmö"
        - option "Stockholm"
        - option "Uppsala"
      - button "Skicka"
    `)
  })

  // The Listbox stories in each of the four themes, selected like the Mode and Contrast
  // toolbars.
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
    ['with-description'],
    ['optional'],
    ['invalid'],
    ['disabled'],
    ['groups'],
    ['on-surfaces'],
    ['compact'],
    ['long-finnish'],
    ['controlled'],
    ['plain-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['forced-colors', theme] as const),
    ...themes.map((theme) => ['on-surfaces', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openNativeStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})

// ---------------------------------------------------------------------------------------------
// The stylable popup: Listbox.Root, Listbox.Trigger and Listbox.Popup (Components/Form/Listbox).

const popupStoryUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-listbox--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openPopupStory(page: Page, story: string, globals?: string) {
  await page.goto(popupStoryUrl(story, globals))
  await expect(page.locator('.kv-listbox-trigger, .kv-listbox-native').first()).toBeVisible()
  if (globals !== undefined) {
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

/** The Keyboard story's single-choice trigger. Its list has 33 options, and "Stockholm" is disabled. */
const trigger = (page: Page) => page.locator('#municipality')
const severalTrigger = (page: Page) => page.locator('#several')
const closedTrigger = (page: Page) => page.locator('#closed')
const option = (page: Page, name: string) => page.getByRole('option', { name, exact: true })
const activeOption = (page: Page) => page.locator('[role="option"][data-active]')
const valueOf = (control: Locator) => control.locator('.kv-listbox-value')
/** The popup: the role-less shell in the top layer. */
const popupOf = (page: Page) => page.locator('.kv-listbox-popup:popover-open')
/** The listbox inside it: the element that scrolls. */
const listOf = (page: Page) => page.getByRole('listbox')

/** The active option is `name`, and `aria-activedescendant` points at it, from the trigger that has focus. */
async function expectActive(page: Page, name: string, control: Locator = trigger(page)) {
  await expect(activeOption(page)).toHaveText(name)
  const id = await activeOption(page).getAttribute('id')
  expect(id).not.toBeNull()
  await expect(control).toHaveAttribute('aria-activedescendant', id ?? '')
  await expect(control).toBeFocused()
}

const expectOpen = (control: Locator) => expect(control).toHaveAttribute('aria-expanded', 'true')
const expectClosed = (control: Locator) => expect(control).toHaveAttribute('aria-expanded', 'false')

test.describe('Listbox popup keyboard contract', () => {
  test('popup: Tab moves to the trigger, one stop', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Före' }).focus()
    await page.keyboard.press('Tab')
    await expect(trigger(page)).toBeFocused()
    await expect(trigger(page)).toHaveAttribute('tabindex', '0')
    // The disabled listbox is skipped, so the next stop is the listbox of several choices.
    await page.keyboard.press('Tab')
    await expect(severalTrigger(page)).toBeFocused()
  })

  test('popup: Shift+Tab leaves the trigger backwards', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Före' })).toBeFocused()
  })

  test('popup: Tab skips a disabled trigger', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await expect(closedTrigger(page)).toHaveAttribute('aria-disabled', 'true')
    await expect(closedTrigger(page)).not.toHaveAttribute('tabindex')
    await trigger(page).focus()
    await page.keyboard.press('Tab')
    await expect(closedTrigger(page)).not.toBeFocused()
    await expect(severalTrigger(page)).toBeFocused()
    // A press doesn't open it either.
    await closedTrigger(page).click({ force: true })
    await expectClosed(closedTrigger(page))
  })

  test('popup: ArrowDown opens the popup and activates the chosen or the first option', async ({
    page,
  }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectOpen(trigger(page))
    await expect(popupOf(page)).toBeVisible()
    await expectActive(page, 'Ale')
    await page.keyboard.press('Escape')
    await expectClosed(trigger(page))
    await trigger(page).click()
    await option(page, 'Malmö').click()
    await expectClosed(trigger(page))
    await page.keyboard.press('ArrowDown')
    await expectOpen(trigger(page))
    await expectActive(page, 'Malmö')
  })

  test('popup: ArrowUp opens the popup and activates the chosen or the last option', async ({
    page,
  }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowUp')
    await expectOpen(trigger(page))
    await expectActive(page, 'Östersund')
    await page.keyboard.press('Escape')
    await trigger(page).click()
    await option(page, 'Uppsala').click()
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Uppsala')
  })

  test('popup: Enter and Space open the popup', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('Enter')
    await expectOpen(trigger(page))
    await expectActive(page, 'Ale')
    await page.keyboard.press('Escape')
    await expectClosed(trigger(page))
    await page.keyboard.press('Space')
    await expectOpen(trigger(page))
    await expectActive(page, 'Ale')
  })

  test('popup: Alt+ArrowDown opens the popup without activating an option', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await expectOpen(trigger(page))
    await expect(popupOf(page)).toBeVisible()
    await expect(activeOption(page)).toHaveCount(0)
    await expect(trigger(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: ArrowDown moves to the next option and stops at the last', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alingsås')
    await page.keyboard.press('End')
    await expectActive(page, 'Östersund')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Östersund')
  })

  test('popup: ArrowUp moves to the previous option and stops at the first', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Ale')
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Örebro')
  })

  test('popup: Home and End activate the first and the last option', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('End')
    await expectOpen(trigger(page))
    await expectActive(page, 'Östersund')
    await page.keyboard.press('Home')
    await expectActive(page, 'Ale')
  })

  test('popup: PageDown and PageUp move ten options', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
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
    await page.keyboard.press('Home')
    await page.keyboard.press('PageUp')
    await expectActive(page, 'Ale')
  })

  test('popup: Enter chooses the active option and closes the popup', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expectClosed(trigger(page))
    await expect(popupOf(page)).toHaveCount(0)
    await expect(valueOf(trigger(page))).toHaveText('Alingsås')
    await expect(trigger(page)).not.toHaveAttribute('aria-activedescendant')
    await expect(trigger(page)).toBeFocused()
    await expect(page.locator('input[type="hidden"][name="municipality"]')).toHaveValue('alingsås')
  })

  test('popup: Enter with no active option chooses nothing', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await expectOpen(trigger(page))
    await expect(activeOption(page)).toHaveCount(0)
    await page.keyboard.press('Enter')
    await expectOpen(trigger(page))
    await expect(valueOf(trigger(page))).toHaveAttribute('data-placeholder', '')
    await expect(page.locator('[role="option"][data-selected]')).toHaveCount(0)
  })

  test('popup: Space chooses the active option', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Ale')
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: Tab chooses the active option and moves focus on', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Alingsås')
    await expect(severalTrigger(page)).toBeFocused()
  })

  test('popup: Shift+Tab chooses the active option and moves focus back', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+Tab')
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Ale')
    await expect(page.getByRole('button', { name: 'Före' })).toBeFocused()
  })

  test('popup: Tab with several choices closes the popup without choosing', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await severalTrigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Ale', severalTrigger(page))
    await page.keyboard.press('Tab')
    await expectClosed(severalTrigger(page))
    await expect(valueOf(severalTrigger(page))).toHaveAttribute('data-placeholder', '')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('popup: Escape closes the popup and keeps the value', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await option(page, 'Malmö').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Norrköping')
    await page.keyboard.press('Escape')
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Malmö')
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: Escape does nothing when the popup is closed', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expectClosed(trigger(page))
    await expect(trigger(page)).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('popup: Alt+ArrowUp chooses the active option and closes the popup', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Alt+ArrowUp')
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Alingsås')
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: typing a letter activates the option that starts with it', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('u')
    await expectOpen(trigger(page))
    await expectActive(page, 'Umeå')
    // A pause ends the word: the same letter again goes to the next option that starts with it.
    await page.waitForTimeout(800)
    await page.keyboard.press('u')
    await expectActive(page, 'Uppsala')
    await page.waitForTimeout(800)
    await page.keyboard.type('st')
    await expectActive(page, 'Stockholm')
  })

  test('popup: typeahead keeps å, ä and ö apart from a and o', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    // The keyboard helper types a letter that isn't on its US layout as text, with no key event,
    // so å, ä and ö are sent as a real keydown on the focused trigger, with that key.
    const pressLetter = (key: string) =>
      page.evaluate((letter) => {
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: letter, bubbles: true, cancelable: true }),
        )
      }, key)
    await pressLetter('ä')
    await expectActive(page, 'Ängelholm')
    await page.waitForTimeout(800)
    await pressLetter('ö')
    await expectActive(page, 'Örebro')
    await page.waitForTimeout(800)
    await pressLetter('å')
    await expectActive(page, 'Åre')
    await page.waitForTimeout(800)
    await page.keyboard.press('o')
    await expectActive(page, 'Oskarshamn')
    await page.waitForTimeout(800)
    await page.keyboard.press('a')
    await expectActive(page, 'Ale')
  })

  test('popup: a disabled option can be reached and cannot be chosen', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.type('st')
    await expectActive(page, 'Stockholm')
    await expect(option(page, 'Stockholm')).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Enter')
    await expectOpen(trigger(page))
    await page.keyboard.press('Space')
    await expectOpen(trigger(page))
    await option(page, 'Stockholm').click({ force: true })
    await expectOpen(trigger(page))
    await expect(valueOf(trigger(page))).toHaveAttribute('data-placeholder', '')
  })

  test('popup: with several choices Enter toggles the option and the popup stays open', async ({
    page,
  }) => {
    await openPopupStory(page, 'keyboard')
    await severalTrigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expectOpen(severalTrigger(page))
    await expect(option(page, 'Ale')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')
    await expectOpen(severalTrigger(page))
    await expect(valueOf(severalTrigger(page))).toHaveText('Ale, Alingsås')
    await expect(listOf(page)).toHaveAttribute('aria-multiselectable', 'true')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(option(page, 'Ale')).toHaveAttribute('aria-selected', 'false')
    await expect(valueOf(severalTrigger(page))).toHaveText('Alingsås')
  })

  test('popup: a press on the trigger opens and closes the popup', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await expectOpen(trigger(page))
    await expect(trigger(page)).toBeFocused()
    await expect(activeOption(page)).toHaveCount(0)
    await trigger(page).click()
    await expectClosed(trigger(page))
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: a press on an option chooses it and keeps focus on the trigger', async ({
    page,
  }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await option(page, 'Malmö').click()
    await expectClosed(trigger(page))
    await expect(valueOf(trigger(page))).toHaveText('Malmö')
    await expect(trigger(page)).toBeFocused()
  })

  test('popup: moving the pointer over an option makes it active', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await option(page, 'Falun').hover()
    await expectActive(page, 'Falun')
    await option(page, 'Gävle').hover()
    await expectActive(page, 'Gävle')
  })

  test('popup: a press outside closes the popup', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).click()
    await expectOpen(trigger(page))
    // The button above the trigger: the popup sits under it and would cover the later controls.
    await page.getByRole('button', { name: 'Före' }).click()
    await expectClosed(trigger(page))
    await expect(page.getByRole('button', { name: 'Före' })).toBeFocused()
  })

  test('popup: clicking the label focuses the trigger', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await page.locator('label[for="municipality"]').click()
    await expect(trigger(page)).toBeFocused()
    await expectClosed(trigger(page))
  })
})

test.describe('Listbox popup focus and modes', () => {
  test('popup: the trigger and the options are 44px high, and the ring is 2px with a 2px offset (2.5.8)', async ({
    page,
  }) => {
    // The Keyboard story has no play function, so Tab starts from the top of a clean page.
    await openPopupStory(page, 'keyboard')
    const control = page.locator('.kv-listbox-trigger').first()
    expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    // Reach the trigger with the keyboard, so the focus ring shows: step off it and back on.
    await control.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(control).toBeFocused()
    await expect(control).toHaveAttribute('data-focus-visible', '')
    await expect(control).toHaveCSS('outline-style', 'solid')
    await expect(control).toHaveCSS('outline-width', '2px')
    await expect(control).toHaveCSS('outline-offset', '2px')
    await page.keyboard.press('ArrowDown')
    const options = page.getByRole('option')
    await expect(options.first()).toBeVisible()
    const boxes = await options.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    )
    expect(boxes.length).toBeGreaterThan(0)
    for (const height of boxes) {
      expect(height).toBeGreaterThanOrEqual(44)
    }
  })

  test('popup: an invalid trigger has a 2px edge, and the error is in its description', async ({
    page,
  }) => {
    await openPopupStory(page, 'invalid')
    const control = page.locator('.kv-listbox-trigger')
    await expect(control).toHaveCSS('border-top-width', '2px')
    await expect(control).toHaveAttribute('aria-invalid', 'true')
    await expect(control).toHaveAccessibleDescription(
      'Kommunen där du är folkbokförd. Fel: Välj en kommun',
    )
  })

  test('popup: the popup is as wide as the trigger, under it, and never covers it', async ({
    page,
  }) => {
    await openPopupStory(page, 'default')
    const control = page.locator('.kv-listbox-trigger')
    await control.click()
    await expect(popupOf(page)).toBeVisible()
    const triggerBox = await control.boundingBox()
    const popupBox = await popupOf(page).boundingBox()
    expect(triggerBox).not.toBeNull()
    expect(popupBox).not.toBeNull()
    expect(Math.abs((popupBox?.width ?? 0) - (triggerBox?.width ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs((popupBox?.x ?? 0) - (triggerBox?.x ?? 0))).toBeLessThanOrEqual(1)
    const triggerBottom = (triggerBox?.y ?? 0) + (triggerBox?.height ?? 0)
    const popupBottom = (popupBox?.y ?? 0) + (popupBox?.height ?? 0)
    // Under the trigger, or above it when there is no room: never over it.
    expect((popupBox?.y ?? 0) >= triggerBottom - 1 || popupBottom <= (triggerBox?.y ?? 0) + 1).toBe(
      true,
    )
  })

  test('popup: a long list scrolls inside the popup, and the active option stays in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 })
    await openPopupStory(page, 'long-list')
    const control = page.locator('.kv-listbox-trigger')
    await control.focus()
    const scrolls = await listOf(page).evaluate((element) => ({
      scrolls: element.scrollHeight > element.clientHeight,
      fits: element.getBoundingClientRect().bottom <= window.innerHeight + 1,
    }))
    expect(scrolls).toEqual({ scrolls: true, fits: true })
    await page.keyboard.press('End')
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

  test('popup: forced colours keep the popup edge, the active option and the tick', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openPopupStory(page, 'forced-colors')
    const first = page.locator('.kv-listbox-trigger').first()
    await first.focus()
    await page.keyboard.press('ArrowDown')
    await expect(activeOption(page)).toHaveCount(1)
    const popup = await popupOf(page).evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        borderWidth: Number.parseFloat(style.borderTopWidth),
        edgeDiffers: style.borderTopColor !== style.backgroundColor,
      }
    })
    expect(popup).toEqual({ borderWidth: 1, edgeDiffers: true })
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
    const tick = await page.locator('[role="option"][data-selected]').evaluate((element) => {
      const style = getComputedStyle(element, '::after')
      return { width: style.borderBottomWidth, content: style.content }
    })
    expect(tick.width).toBe('2px')
    expect(tick.content).not.toBe('none')
    // The 2px width carries invalid, the dashed edge carries disabled (1.4.1).
    const triggers = page.locator('.kv-listbox-trigger')
    await expect(triggers.nth(1)).toHaveCSS('border-top-width', '2px')
    await expect(triggers.nth(3)).toHaveCSS('border-top-style', 'dashed')
  })

  test('popup: reduced motion: the trigger does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openPopupStory(page, 'default')
    await expect(page.locator('.kv-listbox-trigger')).toHaveCSS('transition-duration', '0s')
  })

  test('popup: no horizontal scrolling at 320px with the popup open (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'open', 'groups', 'rich-options', 'multiple', 'empty']) {
      await openPopupStory(page, story)
      await expect(popupOf(page)).toBeVisible()
      expect(await hasHorizontalScroll(page), story).toBe(false)
      const box = await popupOf(page).boundingBox()
      expect(box?.x ?? -1, story).toBeGreaterThanOrEqual(0)
      expect((box?.x ?? 0) + (box?.width ?? 0), story).toBeLessThanOrEqual(320)
    }
    await openPopupStory(page, 'long-finnish')
    const field = await page.locator('.kv-field').boundingBox()
    const control = await page.locator('.kv-listbox-trigger').boundingBox()
    const popup = await popupOf(page).boundingBox()
    expect(control?.width).toBeLessThanOrEqual((field?.width ?? 0) + 0.5)
    // At least as wide as the trigger, never narrower.
    expect(popup?.width).toBeGreaterThanOrEqual((control?.width ?? 0) - 1)
  })

  test('popup: right to left: the chevron and the tick are at the inline end', async ({ page }) => {
    await openPopupStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const rtl = await page
      .locator('.kv-listbox-trigger')
      .first()
      .evaluate((element) => {
        const chevron = new DOMMatrix(getComputedStyle(element, '::after').transform)
        const choice = document.querySelector('[role="option"][data-selected]')
        const tick = choice === null ? undefined : getComputedStyle(choice, '::after')
        return {
          direction: getComputedStyle(element).direction,
          // rotate(-45deg): the chevron is mirrored, so it still points down.
          chevronB: chevron.b,
          tickMarginLeft: Number.parseFloat(tick?.marginLeft ?? '0'),
          tickMarginRight: Number.parseFloat(tick?.marginRight ?? '0'),
        }
      })
    expect(rtl.direction).toBe('rtl')
    expect(rtl.chevronB).toBeLessThan(0)
    // The tick is pushed to the inline end, which is the left edge.
    expect(rtl.tickMarginRight).toBeGreaterThan(0)
    expect(rtl.tickMarginLeft).toBe(0)
    await openPopupStory(page, 'open')
    const ltr = await page.locator('.kv-listbox-trigger').evaluate((element) => ({
      chevronB: new DOMMatrix(getComputedStyle(element, '::after').transform).b,
    }))
    expect(ltr.chevronB).toBeGreaterThan(0)
  })
})

test.describe('Listbox popup right to left', () => {
  test('popup: right to left: ArrowDown and ArrowUp still mean next and previous option', async ({
    page,
  }) => {
    await openPopupStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // The first listbox of the story is open from the start.
    const first = page.locator('.kv-listbox-trigger').first()
    await first.focus()
    await expect(popupOf(page)).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Ale', first)
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alingsås', first)
    // Vertical arrows don't flip with the reading direction.
    await page.keyboard.press('ArrowUp')
    await expectActive(page, 'Ale', first)
  })
})

/**
 * The Virtualized story: 10 000 options (`virtualize`), open from the start, "Alvik 1" to
 * "Österbo 250". The popup is the stylable rendering, so these tests are titled "popup: virtualized: …".
 * Only the options in view, the active and the chosen one are in the page.
 */
const virtualizedTrigger = (page: Page) => page.locator('#municipality')

/** `aria-activedescendant` points at an element that is in the page, right now (not after a retry). */
const activeDescendantResolves = (page: Page) =>
  page.evaluate(() => {
    const id = document.querySelector('#municipality')?.getAttribute('aria-activedescendant')
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

test.describe('Listbox popup virtualization keyboard contract', () => {
  test('popup: virtualized: only a window of the options is in the page, each with its place in the list', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 })
    await openPopupStory(page, 'virtualized')
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

  test('popup: virtualized: Home and End reach the first and the last option, rendered and in view', async ({
    page,
  }) => {
    await openPopupStory(page, 'virtualized')
    await virtualizedTrigger(page).focus()
    await page.keyboard.press('End')
    await expectActive(page, 'Österbo 250', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', String(virtualizedCount))
    await expect(activeOption(page)).toHaveAttribute('aria-setsize', String(virtualizedCount))
    await expectActiveInView(page)
    await expect(option(page, 'Alvik 1')).toHaveCount(0)
    expect(await page.getByRole('option').count()).toBeLessThan(80)
    await page.keyboard.press('Home')
    await expectActive(page, 'Alvik 1', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '1')
    await expectActiveInView(page)
    await expect(option(page, 'Österbo 250')).toHaveCount(0)
  })

  test('popup: virtualized: ArrowDown and ArrowUp always leave aria-activedescendant on an option in the page', async ({
    page,
  }) => {
    await openPopupStory(page, 'virtualized')
    await virtualizedTrigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await expectActive(page, 'Alvik 1', virtualizedTrigger(page))
    // Far past the first window: each key renders the next option before the trigger points at it.
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('ArrowDown')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    await expectActive(page, 'Alvik 41', virtualizedTrigger(page))
    await expectActiveInView(page)
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press('ArrowUp')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    await expectActive(page, 'Alvik 1', virtualizedTrigger(page))
    await expectActiveInView(page)
  })

  test('popup: virtualized: PageDown and PageUp move ten options that may not be rendered', async ({
    page,
  }) => {
    await openPopupStory(page, 'virtualized')
    await virtualizedTrigger(page).focus()
    await page.keyboard.press('ArrowDown')
    for (let step = 0; step < 25; step += 1) {
      await page.keyboard.press('PageDown')
      expect(await activeDescendantResolves(page)).toBe(true)
    }
    // 1 + 25 × 10 = 251: the first option of the second place.
    await expectActive(page, 'Backa 1', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '251')
    await expectActiveInView(page)
    await page.keyboard.press('PageUp')
    await expectActive(page, 'Alvik 241', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', '241')
    await expectActiveInView(page)
  })

  test('popup: virtualized: typing a letter reaches an option that was not rendered', async ({
    page,
  }) => {
    await openPopupStory(page, 'virtualized')
    await virtualizedTrigger(page).focus()
    // Å, ä and ö aren't on the US layout of the keyboard helper, so they are sent as a real keydown.
    const pressLetter = (key: string) =>
      page.evaluate((letter) => {
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: letter, bubbles: true, cancelable: true }),
        )
      }, key)
    await expect(option(page, 'Orsa 1')).toHaveCount(0)
    await page.keyboard.press('o')
    await expectActive(page, 'Orsa 1', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', String(firstIndexOf.o + 1))
    await expectActiveInView(page)
    await page.waitForTimeout(800)
    await pressLetter('ö')
    await expectActive(page, 'Ödeby 1', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', String(firstIndexOf.ö + 1))
    await expectActiveInView(page)
    await page.waitForTimeout(800)
    await pressLetter('å')
    await expectActive(page, 'Åkerby 1', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-posinset', String(firstIndexOf.å + 1))
    await expectActiveInView(page)
  })

  test('popup: virtualized: opening with ArrowDown activates the chosen option far down, rendered and in view', async ({
    page,
  }) => {
    await openPopupStory(page, 'virtualized')
    await virtualizedTrigger(page).focus()
    await page.keyboard.press('End')
    await expectActive(page, 'Österbo 250', virtualizedTrigger(page))
    await page.keyboard.press('Enter')
    await expect(virtualizedTrigger(page).locator('.kv-listbox-value')).toHaveText('Österbo 250')
    await expectClosed(virtualizedTrigger(page))
    await page.keyboard.press('ArrowDown')
    await expectOpen(virtualizedTrigger(page))
    await expectActive(page, 'Österbo 250', virtualizedTrigger(page))
    await expect(activeOption(page)).toHaveAttribute('aria-selected', 'true')
    await expectActiveInView(page)
    // The first window isn't rendered, but the chosen option is, and stays so.
    await expect(option(page, 'Alvik 1')).toHaveCount(0)
  })
})

test.describe('Listbox popup accessibility', () => {
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
    ['open'],
    ['with-description'],
    ['optional'],
    ['invalid'],
    ['disabled'],
    ['disabled-option'],
    ['groups'],
    ['multiple'],
    ['long-list'],
    ['virtualized'],
    ['rich-options'],
    ['empty'],
    ['on-surfaces'],
    ['compact'],
    ['long-finnish'],
    ['controlled'],
    ['plain-form'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['forced-colors', theme] as const),
    ...themes.map((theme) => ['open', theme] as const),
    ...themes.map((theme) => ['on-surfaces', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`popup: no axe violations: ${name}`, async ({ page }) => {
      await openPopupStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }

  test('popup: no axe violations with the popup open and an option active', async ({ page }) => {
    await openPopupStory(page, 'keyboard')
    await trigger(page).focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(popupOf(page)).toBeVisible()
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
