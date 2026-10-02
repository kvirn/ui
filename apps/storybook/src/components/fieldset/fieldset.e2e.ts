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

  test('the group is named by its legend and described by its hint and error', async ({ page }) => {
    await openStory(page, 'invalid')
    const group = page.getByRole('group', { name: 'Var bor du?' })
    await expect(group).toHaveAccessibleDescription(
      'Adressen där du är folkbokförd. Fel: Ange din adress',
    )
    // The fieldset's invalid marks its own parts only: the street was marked on its own.
    await expect(page.getByRole('textbox', { name: 'Gatuadress' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(page.getByRole('textbox', { name: 'Postnummer' })).not.toHaveAttribute(
      'aria-invalid',
    )
  })
})

test.describe('Fieldset focus and modes', () => {
  test('the focus ring of a control inside is not clipped by the fieldset', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const input = page.getByRole('textbox', { name: 'Gatuadress' })
    await expect(input).toBeFocused()
    await expect(input).toHaveCSS('outline-style', 'solid')
    await expect(input).toHaveCSS('outline-width', '2px')
    for (const part of await page.locator('.kv-fieldset, .kv-field').all()) {
      await expect(part).toHaveCSS('overflow', 'visible')
    }
  })

  test('forced colours: the error message stays visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const message = page.locator('.kv-fieldset > .kv-field-error-message')
    await expect(message).toBeVisible()
    // The system text colour, like the legend's, with its icon and a 1px prefix (3.3.1).
    expect(await message.evaluate((element) => getComputedStyle(element).color)).toBe(
      await page
        .locator('.kv-fieldset-legend')
        .evaluate((element) => getComputedStyle(element).color),
    )
    await expect(message.locator('.kv-icon')).toBeVisible()
    const prefix = message.locator('.kv-field-error-prefix')
    await expect(prefix).toHaveText('Fel:')
    await expect(prefix).not.toHaveCSS('display', 'none')
    // The marked street keeps a 2px border: the width carries the state, not the colour.
    await expect(page.getByRole('textbox', { name: 'Gatuadress' })).toHaveCSS(
      'border-top-width',
      '2px',
    )
    await expect(page.getByRole('textbox', { name: 'Postnummer' })).toHaveCSS(
      'border-top-width',
      '1px',
    )
  })

  test('no horizontal scrolling at 320px with the Finnish legend and labels (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish')
    await expect(page.getByRole('group', { name: 'Missä asut?' })).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)
    // A fieldset's default min-inline-size is min-content: the theme resets it to 0.
    await expect(page.locator('.kv-fieldset')).toHaveCSS('min-inline-size', '0px')
  })

  test('the fields in a fieldset are 24px apart, a legend and a hint 8px', async ({ page }) => {
    await openStory(page, 'with-description')
    const gaps = await page.evaluate(() => {
      const fields = [...document.querySelectorAll('.kv-fieldset > .kv-field')].map((field) =>
        field.getBoundingClientRect(),
      )
      return fields.slice(1).map((box, index) => box.top - (fields[index]?.bottom ?? 0))
    })
    expect(gaps.map((gap) => Math.round(gap))).toEqual([24, 24])
  })

  test('right to left: the legend starts at the right', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const boxes = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect()
        return rect === undefined ? undefined : { left: rect.left, right: rect.right }
      }
      return { fieldset: box('.kv-fieldset'), legend: box('.kv-fieldset-legend') }
    })
    expect(Math.abs((boxes.legend?.right ?? 0) - (boxes.fieldset?.right ?? 1))).toBeLessThan(2)
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
