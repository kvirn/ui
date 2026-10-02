import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/input/input.a11y.md › Masked input and Keyboard. One test per
// row, named after it. The Keyboard story is the fixture: masked fields in a plain form.
// KvirnUI holds no form state: the fields are uncontrolled, and the form reads them on submit.
//
// Engines: paste writes the system clipboard and presses Control or Command with V where the
// browser lets a page write it (Chromium), and inserts the text like a paste otherwise. A
// composition runs through CDP (`Input.imeSetComposition`) in Chromium, which is a real IME
// session. Firefox and WebKit have no such control, so there the same events are dispatched
// from the page: it proves the same rule (nothing is rewritten until compositionend) but not
// the engine's own event order. Real IMEs and dead keys stay in the manual AT matrix.

const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-mask--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-input').first()).toBeVisible()
  // The stories' play functions type into the fields: wait until they are done, then start
  // from empty fields. The Keyboard story has none.
}

const personalIdentityNumber = (page: Page) =>
  page.getByRole('textbox', { name: 'Personnummer', exact: true })
const postalCode = (page: Page) => page.getByRole('textbox', { name: 'Postnummer', exact: true })
const digits = (page: Page) => page.getByRole('textbox', { name: 'Kod med sex siffror' })
const amount = (page: Page) =>
  page.getByRole('textbox', { name: 'Hur mycket hyra betalar du per månad?' })
const quiet = (page: Page) => page.getByRole('textbox', { name: 'Tyst fält' })
const letters = (page: Page) => page.getByRole('textbox', { name: 'Bokstäver', exact: true })

const caret = (input: Locator) =>
  input.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd])

/**
 * Listens for keys that a page handler cancelled. The listener sits on the document, so it runs
 * after every handler in the page: a key the mask intercepted would show up here.
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

/** Records every non-empty text the live region held, in order. */
async function recordAnnouncements(page: Page) {
  await page.evaluate(() => {
    const region = document.querySelector('output[aria-live="polite"]')
    const texts: string[] = []
    if (region !== null) {
      new MutationObserver(() => {
        if (region.textContent !== '') texts.push(region.textContent ?? '')
      }).observe(region, { childList: true, characterData: true, subtree: true })
    }
    Reflect.set(window, 'announcements', texts)
  })
  return (): Promise<string[]> => page.evaluate(() => Reflect.get(window, 'announcements'))
}

/** Pastes with the keyboard shortcut, from the clipboard where the page may write it. */
async function paste(page: Page, text: string) {
  await page
    .context()
    .grantPermissions(['clipboard-read', 'clipboard-write'])
    .catch(() => undefined)
  const isOnClipboard = await page.evaluate(async (value) => {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      return false
    }
  }, text)
  if (isOnClipboard) {
    await page.keyboard.press('ControlOrMeta+V')
  } else {
    await page.keyboard.insertText(text)
  }
}

/**
 * Composes `steps` and commits the last one: a dead key or an IME. A real composition session
 * through CDP in Chromium, and the same events dispatched from the page elsewhere.
 */
async function compose(
  page: Page,
  browserName: string,
  input: Locator,
  steps: readonly string[],
  /** Runs while the composition is still open, before the commit. */
  whileComposing: () => Promise<void>,
) {
  const final = steps.at(-1) ?? ''
  if (browserName === 'chromium') {
    const client = await page.context().newCDPSession(page)
    for (const step of steps) {
      await client.send('Input.imeSetComposition', {
        text: step,
        selectionStart: step.length,
        selectionEnd: step.length,
      })
    }
    await whileComposing()
    await client.send('Input.insertText', { text: final })
    await client.detach()
    return
  }
  await input.evaluate((element: HTMLInputElement, composed: string[]) => {
    const setter: unknown = Reflect.get(
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') ?? {},
      'set',
    )
    Reflect.set(element, 'valueBeforeComposition', element.value)
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' }))
    for (const step of composed) {
      if (typeof setter === 'function') {
        Reflect.apply(setter, element, [Reflect.get(element, 'valueBeforeComposition') + step])
      }
      element.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          inputType: 'insertCompositionText',
          data: step,
          isComposing: true,
        }),
      )
    }
  }, steps as string[])
  await whileComposing()
  await input.evaluate((element: HTMLInputElement, data: string) => {
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data }))
  }, final)
}

test.describe('Masked Input keyboard contract', () => {
  test('Tab and Shift+Tab move through the masked inputs in DOM order', async ({ page }) => {
    await openStory(page, 'keyboard')
    const order = [
      personalIdentityNumber(page),
      postalCode(page),
      digits(page),
      amount(page),
      quiet(page),
      letters(page),
    ]
    for (const input of order) {
      await page.keyboard.press('Tab')
      await expect(input).toBeFocused()
    }
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(letters(page)).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(quiet(page)).toBeFocused()
  })

  test('typing an allowed character inserts it, and a literal comes only when the next character is typed', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('123')
    await expect(input).toHaveValue('123')
    await page.keyboard.type('4')
    await expect(input).toHaveValue('123 4')
    expect(await caret(input)).toEqual([5, 5])
  })

  test('typing a literal at its spot is accepted once, not doubled', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = personalIdentityNumber(page)
    await input.focus()
    await page.keyboard.type('19900101-2385')
    await expect(input).toHaveValue('19900101-2385')
    await input.clear()
    // The same number as twelve digits, and with the hyphen typed at its spot.
    await page.keyboard.type('199001012385')
    await expect(input).toHaveValue('19900101-2385')
  })

  test('typing a refused character inserts nothing, and the caret stays', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = digits(page)
    await input.focus()
    await page.keyboard.type('12a3')
    await expect(input).toHaveValue('123')
    expect(await caret(input)).toEqual([3, 3])
  })

  test('Control/Command+V pastes in each separator style and fills the mask', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = personalIdentityNumber(page)
    for (const pasted of [
      '19900101-2385',
      '19900101 2385',
      '199001012385',
      '1990 0101 2385',
      '1990-01-01-2385',
    ]) {
      await input.focus()
      await page.keyboard.press('ControlOrMeta+A')
      await paste(page, pasted)
      await expect(input, pasted).toHaveValue('19900101-2385')
    }
  })

  test('a paste with refused characters drops them, and nothing is cut early', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = personalIdentityNumber(page)
    await input.focus()
    await paste(page, 'nr: 1990 0101-2385!')
    await expect(input).toHaveValue('19900101-2385')
    expect(await caret(input)).toEqual([13, 13])
  })

  test('Backspace next to a literal removes a character', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('12345')
    await expect(input).toHaveValue('123 45')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect(await caret(input)).toEqual([4, 4])
    await page.keyboard.press('Backspace')
    await expect(input).toHaveValue('124 5')
    expect(await caret(input)).toEqual([2, 2])
  })

  test('Delete before a literal removes the next character', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('12345')
    await page.keyboard.press('Home')
    for (let step = 0; step < 3; step += 1) {
      await page.keyboard.press('ArrowRight')
    }
    await page.keyboard.press('Delete')
    await expect(input).toHaveValue('123 5')
    expect(await caret(input)).toEqual([3, 3])
  })

  test('the caret stays after the typed character, also when the mask inserts a literal', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('124')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.type('3')
    await expect(input).toHaveValue('123 4')
    // Right after the 3, in front of the space the mask put in.
    expect(await caret(input)).toEqual([3, 3])
    await page.keyboard.type('9')
    await expect(input).toHaveValue('123 94')
    // After the 9, which is now behind the space.
    expect(await caret(input)).toEqual([5, 5])
  })

  test('Control/Command+Z undoes typing that the mask did not rewrite', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = digits(page)
    await input.focus()
    await page.keyboard.type('123')
    await expect(input).toHaveValue('123')
    await page.keyboard.press('ControlOrMeta+Z')
    await expect(input).toHaveValue('')
  })

  test('Control/Command+Z after a step the mask rewrote leaves a valid value', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('1234')
    await expect(input).toHaveValue('123 4')
    // Writing the value (to insert the space) clears the browser's undo history before that
    // step (ADR-0032), so undo can't go back past it: nothing is undone and the value stays.
    await page.keyboard.press('ControlOrMeta+Z')
    await expect(input).toHaveValue('123 4')
  })

  test('an IME or dead key composition is left alone until compositionend', async ({
    page,
    browserName,
  }) => {
    await openStory(page, 'keyboard')
    const input = digits(page)
    await input.focus()
    await page.keyboard.type('12')
    await compose(page, browserName, input, ['´', 'á'], async () => {
      // Mid-composition nothing is rewritten: the accent shows, though digits take no letters.
      await expect(input).toHaveValue('12á')
    })
    // Digits only: the composed á is refused at compositionend, and the digits stay.
    await expect(input).toHaveValue('12')
    await page.keyboard.type('3')
    await expect(input).toHaveValue('123')
  })

  test('a composed character the mask accepts is kept, and nothing is rewritten during it', async ({
    page,
    browserName,
  }) => {
    await openStory(page, 'keyboard')
    const input = letters(page)
    await input.focus()
    await compose(page, browserName, input, ['¨', 'ä'], async () => {
      await expect(input).toHaveValue('ä')
    })
    await expect(input).toHaveValue('ä')
    await page.keyboard.type('b')
    await expect(input).toHaveValue('äb')
  })

  test('a refused character is announced once, and throttled per field', async ({ page }) => {
    await openStory(page, 'keyboard')
    const announcements = await recordAnnouncements(page)
    const input = digits(page)
    await input.focus()
    await page.keyboard.type('abcdef')
    await expect(page.getByRole('status')).toHaveText('Här kan du bara skriva siffror.')
    await page.waitForTimeout(400)
    expect(await announcements()).toEqual(['Här kan du bara skriva siffror.'])
    await expect(input).toHaveValue('')
  })

  test('a full mask says so with the number of characters', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = digits(page)
    await input.focus()
    await page.keyboard.type('1234567')
    await expect(input).toHaveValue('123456')
    await expect(page.getByRole('status')).toHaveText('Du har skrivit alla 6 tecken.')
  })

  test('announceRejections off keeps the live region quiet, and the character is still refused', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const announcements = await recordAnnouncements(page)
    const input = quiet(page)
    await input.focus()
    await page.keyboard.type('a1b2')
    await expect(input).toHaveValue('12')
    await page.waitForTimeout(400)
    expect(await announcements()).toEqual([])
    await expect(page.getByRole('status')).toBeEmpty()
  })

  test('ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = personalIdentityNumber(page)
    await input.focus()
    await page.keyboard.type('199001012385')
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Home')
    expect(await caret(input)).toEqual([0, 0])
    await page.keyboard.press('End')
    expect(await caret(input)).toEqual([13, 13])
    await page.keyboard.press('ArrowLeft')
    expect(await caret(input)).toEqual([12, 12])
    await page.keyboard.press('ArrowRight')
    expect(await caret(input)).toEqual([13, 13])
    await expect(input).toHaveValue('19900101-2385')
    expect(await prevented()).toEqual([])
  })

  test('ArrowUp and ArrowDown never change a masked number', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = amount(page)
    await input.focus()
    await page.keyboard.type('1250,5')
    const prevented = await recordPreventedKeys(page)
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowDown']) {
      await page.keyboard.press(key)
    }
    await expect(input).toHaveValue('1250,5')
    expect(await prevented()).toEqual([])
  })

  test('Control/Command+A selects all the text', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = personalIdentityNumber(page)
    await input.focus()
    await page.keyboard.type('199001012385')
    await page.keyboard.press('ControlOrMeta+A')
    expect(await caret(input)).toEqual([0, 13])
    // Typing replaces the selection and the mask starts over.
    await page.keyboard.type('1')
    await expect(input).toHaveValue('1')
  })

  test('Enter in the form submits it with the masked values (native)', async ({ page }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    await personalIdentityNumber(page).focus()
    await page.keyboard.type('199001012385')
    await postalCode(page).focus()
    await page.keyboard.type('12345')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('sent')).toHaveText('Skickat: 19900101-2385 | 123 45 | | ')
    expect(await prevented()).not.toContain('Enter')
  })

  test('Escape does nothing: the value and the focus stay', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('12345')
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expect(input).toHaveValue('123 45')
    await expect(input).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Backspace and Delete are not intercepted by the page', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await input.focus()
    await page.keyboard.type('12345')
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Home')
    await page.keyboard.press('Delete')
    expect(await prevented()).toEqual([])
  })
})

test.describe('Masked Input focus and modes', () => {
  test('a number mask follows the page language: a comma in sv and a point in en', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await amount(page).focus()
    await page.keyboard.type('12.5')
    await expect(amount(page)).toHaveValue('12,5')
    await openStory(page, 'english')
    const english = page.getByRole('textbox', { name: 'How much rent do you pay each month?' })
    await english.focus()
    await page.keyboard.type('12,5')
    await expect(english).toHaveValue('12.5')
  })

  test('right to left: identifiers stay left to right', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const input = page.getByRole('textbox', { name: 'Personal identity number', exact: true })
    await expect(input).toHaveAttribute('dir', 'ltr')
    await expect(input).toHaveCSS('direction', 'ltr')
    await input.focus()
    await page.keyboard.type('199001012385')
    await expect(input).toHaveValue('19900101-2385')
    // Typing in a left-to-right box in a right-to-left page keeps the caret at the end.
    expect(await caret(input)).toEqual([13, 13])
  })

  test('forced colours: the masked input keeps a visible edge and the ring', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const input = personalIdentityNumber(page)
    await expect(input).toHaveCSS('border-top-style', 'solid')
    const width = await input.evaluate((element) =>
      parseFloat(getComputedStyle(element).borderTopWidth),
    )
    expect(width).toBeGreaterThanOrEqual(1)
    await input.focus()
    await expect(input).toBeFocused()
    await expect(input).not.toHaveCSS('outline-style', 'none')
  })

  test('no horizontal scrolling at 320px: identifiers, filters and numbers (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['identifiers', 'filters', 'pattern-and-regexp', 'numbers', 'keyboard']) {
      await openStory(page, story)
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(overflows, story).toBe(false)
    }
  })
})

test.describe('Masked Input accessibility', () => {
  test('axe: no violations with a refused character announced', async ({ page }) => {
    await openStory(page, 'keyboard')
    await digits(page).focus()
    await page.keyboard.type('a')
    await expect(page.getByRole('status')).toHaveText('Här kan du bara skriva siffror.')
    const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(results.violations).toEqual([])
  })

  test('a11y tree: a masked input is a plain textbox with its hint as its description', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    const input = postalCode(page)
    await expect(input).toHaveAccessibleDescription('Fem siffror, till exempel 123 45.')
    await expect(input).not.toHaveAttribute('role')
    await expect(input).not.toHaveAttribute('maxlength')
    await expect(input).not.toHaveAttribute('pattern')
    await expect(input).not.toHaveAttribute('placeholder')
  })
})
