import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/text-input/text-input.a11y.md › Keyboard, Focus management and Visual /
// modes. One test per row, named after it. NumberInput has its own contract and spec (number-input.e2e.ts).
// KvirnUI holds no form state: the Controlled and PlainForm stories keep their state in the
// story, or in the browser.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (pageName: string, story: string, globals?: string) =>
  `/iframe.html?id=components-form-${pageName}--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, pageName: string, story: string, globals?: string) {
  await page.goto(storyUrl(pageName, story, globals))
  await expect(page.locator('.kv-input').first()).toBeVisible()
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
 * after every handler in the page: a key TextInput intercepted would show up here. Returns a
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

test.describe('TextInput keyboard contract', () => {
  test('Tab moves through the inputs in DOM order', async ({ page }) => {
    await openStory(page, 'textinput', 'types')
    const email = page.getByRole('textbox', { name: 'E-postadress' })
    const phone = page.getByRole('textbox', { name: 'Telefonnummer' })
    const website = page.getByRole('textbox', { name: 'Webbplats' })
    const password = page.getByLabel('Lösenord')
    const search = page.getByRole('searchbox', { name: 'Sök i tjänsten' })
    for (const input of [email, phone, website, password, search]) {
      await page.keyboard.press('Tab')
      await expect(input).toBeFocused()
    }
    await page.keyboard.press('Shift+Tab')
    await expect(password).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(website).toBeFocused()
  })

  test('without a mask nothing is filtered, and a mask leaves out what it cannot take', async ({
    page,
  }) => {
    await openStory(page, 'textinput', 'default')
    const name = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await name.click()
    await page.keyboard.type('Anna 12 -x!')
    await expect(name).toHaveValue('Anna 12 -x!')

    await openStory(page, 'textinput', 'masked-postcode')
    const postcode = page.getByRole('textbox', { name: 'Postnummer' })
    // The story's play function typed an example: wait for it, then start from an empty input.
    await expect(postcode).toHaveValue('123 45')
    await postcode.clear()
    await postcode.click()
    // The mask leaves the letters out and puts the space in; the digits type as written.
    await page.keyboard.type('12x3y45')
    await expect(postcode).toHaveValue('123 45')
  })

  test('clicking the label focuses the input', async ({ page }) => {
    await openStory(page, 'textinput', 'default')
    await page.getByText('Fullständigt namn').click()
    await expect(page.getByRole('textbox', { name: 'Fullständigt namn' })).toBeFocused()
  })

  test('Enter in a plain form submits it with the typed values (native)', async ({ page }) => {
    await openStory(page, 'textinput', 'plain-form')
    // The story's play function fills and submits the form once: wait for it to finish.
    const sent = (text: string) => page.getByText(text, { exact: true })
    await expect(sent('Skickat: Anna Andersson, anna@example.se')).toBeVisible()
    await page.getByRole('textbox', { name: 'Fullständigt namn' }).fill('Britta Berg')
    await page.getByRole('textbox', { name: 'E-postadress' }).fill('britta@example.se')
    await page.keyboard.press('Enter')
    await expect(sent('Skickat: Britta Berg, britta@example.se')).toBeVisible()
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted', async ({
    page,
  }) => {
    await openStory(page, 'textinput', 'keyboard')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await input.fill('Anna')
    await input.focus()
    const prevented = await recordPreventedKeys(page)
    const caret = () => input.evaluate((element: HTMLInputElement) => element.selectionStart)
    await page.keyboard.press('Home')
    expect(await caret()).toBe(0)
    await page.keyboard.press('End')
    expect(await caret()).toBe(4)
    await page.keyboard.press('ArrowLeft')
    expect(await caret()).toBe(3)
    await page.keyboard.press('ArrowLeft')
    expect(await caret()).toBe(2)
    await page.keyboard.press('ArrowRight')
    expect(await caret()).toBe(3)
    await expect(input).toHaveValue('Anna')
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Control/Command+A selects all the text', async ({ page }) => {
    await openStory(page, 'textinput', 'keyboard')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await input.fill('Anna Andersson')
    await input.focus()
    await page.keyboard.press('ControlOrMeta+A')
    const selection = await input.evaluate((element: HTMLInputElement) => [
      element.selectionStart,
      element.selectionEnd,
    ])
    expect(selection).toEqual([0, 'Anna Andersson'.length])
  })

  test('Escape does nothing: the value and the focus stay', async ({ page }) => {
    await openStory(page, 'textinput', 'keyboard')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await input.fill('Anna')
    await input.focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expect(input).toHaveValue('Anna')
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('a controlled input shows the value the story gives it', async ({ page }) => {
    await openStory(page, 'textinput', 'controlled')
    // The story's play function typed "Anna": wait for it to finish.
    const mirror = (text: string) => page.getByText(text, { exact: true })
    await expect(mirror('Du skrev: Anna')).toBeVisible()
    await page.getByRole('textbox', { name: 'Fullständigt namn' }).fill('Britta')
    await expect(mirror('Du skrev: Britta')).toBeVisible()
  })
})

test.describe('TextInput focus and modes', () => {
  test('a key-focused input shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'textinput', 'default')
    await page.keyboard.press('Tab')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('data-focus-visible', '')
    expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('a click marks focus, but not focus-visible, and a key brings it back', async ({ page }) => {
    await openStory(page, 'textinput', 'default')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await input.click()
    await expect(input).toBeFocused()
    await expect(input).not.toHaveAttribute('data-focus-visible')
    // A key press after the click brings focus-visible back at the next focus.
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('data-focus-visible', '')
  })

  test('the input is at least 24px high (2.5.8)', async ({ page }) => {
    await openStory(page, 'textinput', 'default')
    const box = await page.getByRole('textbox', { name: 'Fullständigt namn' }).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  test('forced colours keep the input edge and the focus indicator visible (1.4.11, 2.4.7)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'textinput', 'forced-colors')
    const valid = page.getByRole('textbox', { name: 'Fullständigt namn' })
    const invalid = page.getByRole('textbox', { name: 'E-postadress' })
    const disabled = page.getByRole('textbox', { name: 'Fordonets registreringsnummer' })
    const readOnly = page.getByRole('textbox', { name: 'Personnummer' })
    for (const input of [valid, invalid, disabled, readOnly]) {
      const edge = await input.evaluate((element) => {
        const style = getComputedStyle(element)
        return { width: Number.parseFloat(style.borderTopWidth), style: style.borderTopStyle }
      })
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    await valid.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    expect(await valid.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('no horizontal scrolling at 320px: widths, Finnish label and masked fields (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of [
      'widths',
      'long-finnish',
      'types',
      'masked-personal-identity-number',
      'masked-date',
    ] as const) {
      await openStory(page, 'textinput', story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })

  test('no horizontal scrolling at 320px and 200% text size with a width-class input (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'textinput', 'widths')
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing).
  test('the expected answer stays visible in every width class, valid or invalid (1.4.12)', async ({
    page,
  }) => {
    await openStory(page, 'textinput', 'widths')
    await page.evaluate(() => {
      document.body.classList.add('kv-story-text-spacing')
      for (const input of document.querySelectorAll('.kv-input')) {
        input.setAttribute('aria-invalid', 'true')
      }
    })
    for (const className of ['2', '4', '6', '10', '20']) {
      const input = page.locator(`.kv-input--width-${className}`)
      const fits = await input.evaluate((element) => element.scrollWidth <= element.clientWidth)
      expect(fits, `kv-input--width-${className}`).toBe(true)
    }
  })
})

test.describe('TextInput accessibility', () => {
  test('a11y tree of the types', async ({ page }) => {
    await openStory(page, 'textinput', 'types')
    await expect(page.locator('.kv-story-form .kv-story-form')).toMatchAriaSnapshot(`
      - text: E-postadress
      - textbox "E-postadress"
      - text: Telefonnummer
      - textbox "Telefonnummer"
      - text: Webbplats
      - textbox "Webbplats"
      - text: Lösenord
      - textbox "Lösenord"
      - text: Sök i tjänsten
      - searchbox "Sök i tjänsten"
    `)
  })

  // The TextInput stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string, string?])[] = [
    ['textinput', 'default'],
    ['textinput', 'keyboard'],
    ['textinput', 'typing'],
    ['textinput', 'types'],
    ['textinput', 'widths'],
    ['textinput', 'invalid'],
    ['textinput', 'disabled'],
    ['textinput', 'read-only'],
    ['textinput', 'controlled'],
    ['textinput', 'plain-form'],
    ['textinput', 'on-surfaces'],
    ['textinput', 'compact'],
    ['textinput', 'masked-personal-identity-number'],
    ['textinput', 'masked-postcode'],
    ['textinput', 'masked-date'],
    ['textinput', 'reference-number'],
    ['textinput', 'inline-filter'],
    ['textinput', 'inline-filter-compact'],
    ['textinput', 'long-finnish'],
    ['textinput', 'rtl'],
    ['textinput', 'forced-colors'],
    ...themes.map((theme) => ['textinput', 'forced-colors', theme] as const),
    ...themes.map((theme) => ['textinput', 'on-surfaces', theme] as const),
  ]

  for (const [pageName, story, globals] of stories) {
    const name =
      globals === undefined ? `${pageName} ${story}` : `${pageName} ${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, pageName, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
