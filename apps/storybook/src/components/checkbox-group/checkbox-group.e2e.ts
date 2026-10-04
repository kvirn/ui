import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/checkbox-group/checkbox-group.a11y.md › Keyboard and Visual /
// modes. One test per row, named after it. The keys are the checkboxes' own (checkbox.e2e.ts
// covers one box): these tests prove the group makes each box a Tab stop and handles no keys.
// KvirnUI holds no form state: the Controlled story keeps its values in the story.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-checkboxgroup--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

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
 * after every handler in the page: a key the group intercepted would show up here.
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

const box = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true })
const checkedValues = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLInputElement>('.kv-checkbox:checked')].map(
      (element) => element.value,
    ),
  )

test.describe('CheckboxGroup keyboard contract', () => {
  test('Tab moves through every checkbox in DOM order', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Tillbaka' })).toBeFocused()
    for (const name of ['E-post', 'Sms', 'Brev']) {
      await page.keyboard.press('Tab')
      await expect(box(page, name)).toBeFocused()
    }
    // Then out of the group, to the next focusable element.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
    // The fieldset, the legend and the help text are not Tab stops.
    await expect(page.locator('.kv-checkbox-group')).not.toHaveAttribute('tabindex', /.*/)
    await expect(page.locator('.kv-fieldset-legend')).not.toHaveAttribute('tabindex', /.*/)
  })

  test('Shift+Tab moves back through the checkboxes', async ({ page }) => {
    await openStory(page, 'keyboard')
    await box(page, 'Brev').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(box(page, 'Sms')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(box(page, 'E-post')).toBeFocused()
    // Then out of the group, to the previous focusable element.
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Tillbaka' })).toBeFocused()
  })

  test('Space toggles the focused checkbox and reports the next value', async ({ page }) => {
    await openStory(page, 'controlled')
    // The story's play function chose Brev, then removed E-post: wait for it to finish.
    await expect(page.getByTestId('mirror')).toHaveText('Du valde: letter')
    await box(page, 'Sms').focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Space')
    await expect(box(page, 'Sms')).toBeChecked()
    await expect(page.getByTestId('mirror')).toHaveText('Du valde: letter, text')
    // Only that box changed.
    await expect(box(page, 'Brev')).toBeChecked()
    await expect(box(page, 'E-post')).not.toBeChecked()
    await page.keyboard.press('Space')
    await expect(box(page, 'Sms')).not.toBeChecked()
    await expect(page.getByTestId('mirror')).toHaveText('Du valde: letter')
    await expect(box(page, 'Sms')).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Arrow keys do not move focus between checkboxes', async ({ page }) => {
    await openStory(page, 'keyboard')
    await box(page, 'Sms').focus()
    const prevented = await recordPreventedKeys(page)
    for (const key of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) {
      await page.keyboard.press(key)
      await expect(box(page, 'Sms')).toBeFocused()
    }
    expect(await checkedValues(page)).toEqual([])
    expect(await prevented()).toEqual([])
  })

  test('Tab skips the checkboxes of a disabled group (native)', async ({ page }) => {
    await openStory(page, 'disabled')
    for (const name of ['E-post', 'Sms', 'Brev']) {
      await expect(box(page, name)).toBeDisabled()
    }
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveCount(0)
  })
})

test.describe('CheckboxGroup focus and modes', () => {
  test('forced colours keep the box edge visible in every state (1.4.11)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const edges = await page.evaluate(() => {
      const edge = (selector: string) => {
        const style = getComputedStyle(document.querySelector(selector) as Element)
        return { width: Number.parseFloat(style.borderTopWidth), style: style.borderTopStyle }
      }
      return [
        edge('input[name="contact"][value="email"]'),
        edge('input[name="invalid"][value="email"]'),
        edge('input[name="disabled"][value="text"]'),
      ]
    })
    for (const edge of edges) {
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    await expect(page.locator('.kv-field-error-message')).toBeVisible()
  })

  test('no horizontal scrolling at 320px with the long Finnish legend and options (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['long-finnish', 'with-option-help-texts', 'invalid', 'in-card']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })
})

test.describe('CheckboxGroup accessibility', () => {
  test('a11y tree of the group', async ({ page }) => {
    await openStory(page, 'default')
    await expect(page.getByRole('group')).toMatchAriaSnapshot(`
      - group "Hur ska vi kontakta dig om tillståndet? (valfritt)":
        - text: Hur ska vi kontakta dig om tillståndet? (valfritt)
        - paragraph: Välj alla som passar.
        - checkbox "E-post"
        - text: E-post
        - checkbox "Sms"
        - text: Sms
        - checkbox "Brev"
        - text: Brev
    `)
  })

  // The CheckboxGroup stories in each of the four themes, selected like the Mode and Contrast
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
    ['with-description'],
    ['with-option-help-texts'],
    ['invalid'],
    ['disabled'],
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
