import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/fieldset/fieldset.a11y.md › Keyboard and Visual / modes. One test
// per row, named after it. Fieldset handles no keys: these prove it never gets in the controls'
// way. KvirnUI holds no form state, so every story sets `invalid` and `disabled` itself.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-fieldset--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-fieldset').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

test.describe('Fieldset keyboard contract', () => {
  test('Tab moves through the controls in DOM order', async ({ page }) => {
    await openStory(page, 'keyboard')
    for (const name of ['Gatuadress', 'Postnummer', 'Postort']) {
      await page.keyboard.press('Tab')
      await expect(page.getByRole('textbox', { name })).toBeFocused()
    }
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('textbox', { name: 'Postnummer' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('textbox', { name: 'Gatuadress' })).toBeFocused()
  })

  test('Tab never stops on the fieldset, its legend, its hint or its error', async ({ page }) => {
    await openStory(page, 'invalid')
    // Past the last control, focus leaves the page or wraps back to the first: browsers differ,
    // so only the tag is asserted.
    for (let count = 0; count < 6; count += 1) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.tagName)).toMatch(/^(?:INPUT|BODY)$/)
    }
    await expect(page.locator('.kv-fieldset')).not.toHaveAttribute('tabindex', /.*/)
    await expect(page.locator('.kv-fieldset-legend')).not.toHaveAttribute('tabindex', /.*/)
  })

  test('Tab skips the controls of a disabled fieldset (native)', async ({ page }) => {
    await openStory(page, 'disabled')
    await expect(page.getByRole('textbox', { name: 'Gatuadress' })).toBeDisabled()
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveCount(0)
  })
})

test.describe('Fieldset focus and modes', () => {
  test('a key-focused control inside shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const input = page.getByRole('textbox', { name: 'Gatuadress' })
    await expect(input).toBeFocused()
    expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('forced colours: the error message and its prefix are still there', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const message = page.locator('.kv-fieldset > .kv-field-error-message')
    await expect(message).toBeVisible()
    await expect(message.locator('.kv-icon')).toBeVisible()
    // The prefix is for screen readers, and is in the accessibility tree (3.3.1).
    await expect(message.locator('.kv-field-error-prefix')).toHaveText('Fel:')
  })

  test('no horizontal scrolling at 320px with the Finnish legend and labels (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish')
    await expect(page.getByRole('group', { name: 'Missä asut?' })).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  test('the legend as the page heading is an h1 inside the legend', async ({ page }) => {
    await openStory(page, 'as-page-heading')
    await expect(page.getByRole('heading', { level: 1, name: 'Var bor du?' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Var bor du?' })).toBeVisible()
  })
})

test.describe('Fieldset accessibility', () => {
  test('a11y tree of the address group', async ({ page }) => {
    await openStory(page, 'with-description')
    await expect(page.getByRole('group', { name: 'Var bor du?' })).toMatchAriaSnapshot(`
      - group "Var bor du?":
        - paragraph: Adressen där du är folkbokförd.
        - text: Gatuadress
        - textbox "Gatuadress"
        - text: Postnummer
        - textbox "Postnummer"
        - text: Postort
        - textbox "Postort"
    `)
  })

  // The Fieldset stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['with-description'],
    ['invalid'],
    ['disabled'],
    ['as-page-heading'],
    ['long-finnish'],
    ['compact'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['invalid', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no horizontal scrolling (1.4.10): ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      expect(await hasHorizontalScroll(page)).toBe(false)
    })

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
