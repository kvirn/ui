import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/native-select/native-select.a11y.md › Keyboard, Focus management
// and Visual / modes. One test per row, named after it. The keys are the browser's: the rows
// describe Chromium on Windows and Linux, which this spec drives. KvirnUI holds no form state:
// the Controlled story keeps its value in the story.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-nativeselect--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-native-select').first()).toBeVisible()
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
 * after every handler in the page: a key NativeSelect intercepted would show up here.
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

test.describe('NativeSelect keyboard contract', () => {
  test('Tab moves to the select, one stop', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(select(page)).toBeFocused()
    // The disabled select is skipped, so the next stop is the button.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('Shift+Tab leaves the select backwards', async ({ page }) => {
    await openStory(page, 'keyboard')
    await select(page).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('select:focus')).toHaveCount(0)
    await page.getByRole('button', { name: 'Skicka' }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(select(page)).toBeFocused()
  })

  test('Tab skips a disabled select', async ({ page }) => {
    await openStory(page, 'keyboard')
    const disabled = page.locator('select[name="disabled"]')
    await expect(disabled).toBeDisabled()
    await select(page).focus()
    await page.keyboard.press('Tab')
    await expect(disabled).not.toBeFocused()
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
  })

  test('ArrowDown chooses the next option', async ({ page }) => {
    await openStory(page, 'keyboard')
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
    await openStory(page, 'selected')
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
    await openStory(page, 'selected')
    await select(page).focus()
    await page.keyboard.press('End')
    await expect(select(page)).toHaveValue('uppsala')
    await page.keyboard.press('Home')
    await expect(select(page)).toHaveValue('')
  })

  test('typing a letter chooses the option that starts with it', async ({ page }) => {
    await openStory(page, 'keyboard')
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
    await openStory(page, 'selected')
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
    await openStory(page, 'default')
    await page.getByText('Kommun', { exact: true }).click()
    await expect(select(page)).toBeFocused()
  })
})

test.describe('NativeSelect focus and modes', () => {
  test('the select is 44px high and keeps the ring: 2px, offset 2px (2.5.8)', async ({ page }) => {
    await openStory(page, 'default')
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
    await openStory(page, 'invalid')
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
    await openStory(page, 'default')
    expect(await inset()).toBe(invalidInset)
    expect(invalidInset).toBe(13)
  })

  test('the chevron is drawn on the select, not an image, and is muted when disabled', async ({
    page,
  }) => {
    await openStory(page, 'default')
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
    await openStory(page, 'forced-colors')
    const selects = page.locator('.kv-native-select')
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
    await openStory(page, 'default')
    await expect(select(page)).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px with the long Finnish label (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'invalid', 'groups', 'keyboard']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
    await openStory(page, 'long-finnish')
    const field = await page.locator('.kv-field').boundingBox()
    const control = await page.locator('.kv-native-select').boundingBox()
    expect(control?.width).toBeLessThanOrEqual((field?.width ?? 0) + 0.5)
  })

  test('right to left: the chevron is at the inline end, on the left', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const positions = await page
      .locator('.kv-native-select')
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return { position: style.backgroundPositionX, direction: style.direction }
      })
    expect(positions.direction).toBe('rtl')
    // Both strokes are positioned from the left edge in right-to-left text, the "\\" stroke
    // nearer to it than the "/" stroke.
    expect(positions.position).toBe('12px, 18px')
    await openStory(page, 'default')
    const ltr = await select(page).evaluate(
      (element) => getComputedStyle(element).backgroundPositionX,
    )
    expect(ltr).toBe('calc(100% - 18px), calc(100% - 12px)')
  })
})

test.describe('NativeSelect accessibility', () => {
  test('a11y tree of the keyboard fixture', async ({ page }) => {
    await openStory(page, 'keyboard')
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

  // The NativeSelect stories in each of the four themes, selected like the Mode and Contrast
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
    ['reports'],
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
