import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/input/input.a11y.md › Keyboard, Focus management and Visual /
// modes. One test per row, named after it. The Number page is the same Input with `inputMode`
//, so its stories are covered here. KvirnUI holds no form state: the Controlled and
// PlainForm stories keep their state in the story, or in the browser.

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
 * after every handler in the page: a key Input intercepted would show up here. Returns a
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

test.describe('Input keyboard contract', () => {
  test('Tab moves through the inputs in DOM order', async ({ page }) => {
    await openStory(page, 'input', 'types')
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

  test('any character types, and nothing is filtered, also for numbers', async ({ page }) => {
    await openStory(page, 'number', 'amount')
    const input = page.getByRole('textbox', { name: 'Hur mycket hyra betalar du per månad?' })
    // The story's play function typed an example: wait for it, then start from an empty input.
    await expect(input).toHaveValue('1 250,50')
    await input.clear()
    // Typed the way people write: spaces, comma and point, and letters too: the form validates.
    await page.keyboard.type('1 250,50 kr')
    await expect(input).toHaveValue('1 250,50 kr')
  })

  test('numbers are text, so leading zeros survive typing', async ({ page }) => {
    await openStory(page, 'number', 'postcode')
    const input = page.getByRole('textbox', { name: 'Postnummer' })
    await expect(input).toHaveValue('00100')
    await input.clear()
    await page.keyboard.type('00100')
    await expect(input).toHaveValue('00100')
    await expect(input).toHaveAttribute('type', 'text')
    await expect(input).toHaveAttribute('inputmode', 'numeric')
  })

  test('clicking the label focuses the input', async ({ page }) => {
    await openStory(page, 'input', 'default')
    await page.getByText('Fullständigt namn').click()
    await expect(page.getByRole('textbox', { name: 'Fullständigt namn' })).toBeFocused()
  })

  test('Enter in a plain form submits it with the typed values (native)', async ({ page }) => {
    await openStory(page, 'input', 'plain-form')
    // The story's play function fills and submits the form once: wait for it to finish.
    await expect(page.getByTestId('sent')).toHaveText('Skickat: Anna Andersson, anna@example.se')
    await page.getByRole('textbox', { name: 'Fullständigt namn' }).fill('Britta Berg')
    await page.getByRole('textbox', { name: 'E-postadress' }).fill('britta@example.se')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('sent')).toHaveText('Skickat: Britta Berg, britta@example.se')
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted', async ({
    page,
  }) => {
    await openStory(page, 'input', 'keyboard')
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

  test('ArrowUp and ArrowDown never change a number value', async ({ page }) => {
    await openStory(page, 'number', 'keyboard')
    const input = page.getByRole('textbox', { name: 'Hur mycket hyra betalar du per månad?' })
    await input.fill('1 250,50')
    await input.focus()
    const prevented = await recordPreventedKeys(page)
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowDown']) {
      await page.keyboard.press(key)
    }
    await expect(input).toHaveValue('1 250,50')
    await expect(input).toBeFocused()
    // Native caret movement only: the page didn't take the key.
    expect(await prevented()).toEqual([])
  })

  test('Control/Command+A selects all the text', async ({ page }) => {
    await openStory(page, 'input', 'keyboard')
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
    await openStory(page, 'input', 'keyboard')
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
    await openStory(page, 'input', 'controlled')
    // The story's play function typed "Anna": wait for it to finish.
    await expect(page.getByTestId('mirror')).toHaveText('Du skrev: Anna')
    await page.getByRole('textbox', { name: 'Fullständigt namn' }).fill('Britta')
    await expect(page.getByTestId('mirror')).toHaveText('Du skrev: Britta')
  })
})

test.describe('Input focus and modes', () => {
  test('the focus ring is visible on keyboard focus: 2px, offset 2px', async ({ page }) => {
    await openStory(page, 'input', 'default')
    await page.keyboard.press('Tab')
    const input = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('data-focus-visible', '')
    await expect(input).toHaveCSS('outline-style', 'solid')
    await expect(input).toHaveCSS('outline-width', '2px')
    await expect(input).toHaveCSS('outline-offset', '2px')
  })

  test('the focus ring is visible on a click in the input too', async ({ page }) => {
    await openStory(page, 'input', 'default')
    await page.getByRole('textbox', { name: 'Fullständigt namn' }).click()
    await expect(page.getByRole('textbox', { name: 'Fullständigt namn' })).toHaveCSS(
      'outline-style',
      'solid',
    )
  })

  test('an invalid input is 2px, and its text does not move', async ({ page }) => {
    await openStory(page, 'input', 'invalid')
    const invalid = page.getByRole('textbox', { name: 'E-postadress' })
    await expect(invalid).toHaveCSS('border-top-width', '2px')
    await openStory(page, 'input', 'default')
    const valid = page.getByRole('textbox', { name: 'Fullständigt namn' })
    await expect(valid).toHaveCSS('border-top-width', '1px')
    // Border and padding add up to the same 12px, valid or invalid.
    const inset = (input: typeof valid) =>
      input.evaluate((element) => {
        const style = getComputedStyle(element)
        return (
          Number.parseFloat(style.borderInlineStartWidth) +
          Number.parseFloat(style.paddingInlineStart)
        )
      })
    expect(await inset(valid)).toBe(13)
    await openStory(page, 'input', 'invalid')
    expect(await inset(invalid)).toBe(13)
  })

  test('the input is 44px high, and 24px at the least (2.5.8)', async ({ page }) => {
    await openStory(page, 'input', 'default')
    const box = await page.getByRole('textbox', { name: 'Fullständigt namn' }).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('forced colours: border and invalid state are visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'input', 'forced-colors')
    const valid = page.getByRole('textbox', { name: 'Fullständigt namn' })
    const invalid = page.getByRole('textbox', { name: 'E-postadress' })
    const disabled = page.getByRole('textbox', { name: 'Fordonets registreringsnummer' })
    const readOnly = page.getByRole('textbox', { name: 'Personnummer' })
    const edge = (input: typeof valid) =>
      input.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          width: Number.parseFloat(style.borderTopWidth),
          style: style.borderTopStyle,
          differsFromBackground: style.borderTopColor !== style.backgroundColor,
        }
      })
    expect(await edge(valid)).toEqual({ width: 1, style: 'solid', differsFromBackground: true })
    // The 2px width carries the state, together with the message above it (1.4.1).
    expect(await edge(invalid)).toEqual({ width: 2, style: 'solid', differsFromBackground: true })
    expect(await edge(disabled)).toEqual({ width: 1, style: 'dashed', differsFromBackground: true })
    expect(await edge(readOnly)).toEqual({ width: 1, style: 'solid', differsFromBackground: true })
    // The ring is a system colour too.
    await valid.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(valid).toHaveCSS('outline-style', 'solid')
    await expect(valid).toHaveCSS('outline-width', '2px')
  })

  test('reduced motion: the input does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'input', 'default')
    await expect(page.getByRole('textbox')).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px: widths, Finnish label and numbers (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const [pageName, story] of [
      ['input', 'widths'],
      ['input', 'long-finnish'],
      ['input', 'types'],
      ['number', 'finnish'],
      ['number', 'amount'],
    ] as const) {
      await openStory(page, pageName, story)
      expect(await hasHorizontalScroll(page), `${pageName}: ${story}`).toBe(false)
    }
  })

  test('a width-class input shrinks to the 288px column at 320px (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'input', 'widths')
    const widest = await page.locator('.kv-input--width-20').boundingBox()
    // 258px at 16px text fits the column without help.
    expect(widest?.width).toBeLessThanOrEqual(288)
    // At 200% text size it would be 516px: it shrinks to the column instead of overflowing.
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    expect(await hasHorizontalScroll(page)).toBe(false)
    const shrunk = await page.locator('.kv-input--width-20').boundingBox()
    expect(shrunk?.width).toBeLessThanOrEqual(288)
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing).
  test('the expected answer stays visible in every width class, valid or invalid (1.4.12)', async ({
    page,
  }) => {
    await openStory(page, 'input', 'widths')
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

  test('right to left: the text starts at the right, and the edge is the same', async ({
    page,
  }) => {
    await openStory(page, 'input', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const email = page.getByRole('textbox', { name: 'Email address' })
    // `text-align: start` in a right-to-left page is the right.
    await expect(email).toHaveCSS('direction', 'rtl')
    await expect(email).toHaveCSS('text-align', 'start')
    await expect(email).toHaveCSS('border-top-width', '2px')
    // The narrow phone input sits at the inline start, the right.
    const boxes = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)?.getBoundingClientRect()
      return { field: box('.kv-field'), phone: box('.kv-input--width-20') }
    })
    expect(Math.abs((boxes.phone?.right ?? 0) - (boxes.field?.right ?? 1))).toBeLessThan(2)
  })
})

test.describe('Input accessibility', () => {
  test('a11y tree of the types', async ({ page }) => {
    await openStory(page, 'input', 'types')
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

  // The Input stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string, string?])[] = [
    ['input', 'default'],
    ['input', 'typing'],
    ['input', 'types'],
    ['input', 'widths'],
    ['input', 'invalid'],
    ['input', 'disabled'],
    ['input', 'read-only'],
    ['input', 'controlled'],
    ['input', 'plain-form'],
    ['input', 'on-surfaces'],
    ['input', 'compact'],
    ['input', 'long-finnish'],
    ['input', 'rtl'],
    ['input', 'forced-colors'],
    ['number', 'whole-number'],
    ['number', 'amount'],
    ['number', 'reference-number'],
    ['number', 'postcode'],
    ['number', 'invalid'],
    ['number', 'finnish'],
    ['number', 'rtl'],
    ['number', 'forced-colors'],
    ...themes.map((theme) => ['input', 'forced-colors', theme] as const),
    ...themes.map((theme) => ['input', 'on-surfaces', theme] as const),
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
