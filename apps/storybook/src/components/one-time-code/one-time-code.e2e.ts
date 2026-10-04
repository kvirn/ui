import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/one-time-code/one-time-code.a11y.md › Keyboard, Focus management,
// and Visual / modes. One test per row, named after it. The Keyboard story is the fixture: an
// empty code in two groups (`****-****`), then a Continue button, in a form that does nothing on
// submit. The digits-only rows (a refused letter, a seventh digit, undo) use the Default story
// (`999999`), because they need a code with no dash. KvirnUI holds no form state.
//
// The baseline projects (forced colours, reduced motion, 320px) run every test, so a test that
// needs the drawn boxes asks for them: `openStory` turns forced colours off and uses a desktop
// viewport unless the test says otherwise.

const storyUrl = (story: string, globals?: string, args?: string) =>
  `/iframe.html?id=components-form-onetimecode--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}${args === undefined ? '' : `&args=${args}`}`

interface OpenOptions {
  globals?: string
  /** Story args in the URL, such as `defaultValue:481+920`. */
  args?: string
  /** Default `none`: the boxes are drawn. Forced colours show the plain field. */
  forcedColors?: 'none' | 'active'
  viewport?: { width: number; height: number }
}

async function openStory(page: Page, story: string, options: OpenOptions = {}) {
  await page.emulateMedia({ forcedColors: options.forcedColors ?? 'none' })
  await page.setViewportSize(options.viewport ?? { width: 1280, height: 800 })
  await page.goto(storyUrl(story, options.globals, options.args))
  await expect(page.locator('.kv-one-time-code').first()).toBeVisible()
  // The root has `data-ready` once the hook has started: the boxes are drawn from then on.
  await expect(page.locator('.kv-one-time-code').first()).toHaveAttribute('data-ready', '')
}

const code = (page: Page, name = 'Kod från sms:et') => page.getByRole('textbox', { name })
/** The Keyboard and TwoGroups stories' field: a code from an email. */
const emailCode = (page: Page) => code(page, 'Kod från e-postmeddelandet')
const slots = (page: Page) => page.locator('.kv-one-time-code-slot')
const separators = (page: Page) => page.locator('.kv-one-time-code-separator')
/** Every cell of the pattern, boxes and dashes. */
const cells = (page: Page) => page.locator('.kv-one-time-code-slot, .kv-one-time-code-separator')
const root = (page: Page) => page.locator('.kv-one-time-code').first()
const continueButton = (page: Page) => page.getByRole('button', { name: 'Fortsätt' })

const caret = (input: Locator) =>
  input.evaluate((element: HTMLInputElement) => [element.selectionStart, element.selectionEnd])

const characters = (page: Page) =>
  slots(page).evaluateAll((elements) => elements.map((element) => element.textContent))

/** Indexes of the slots that have the attribute. */
const withAttribute = (page: Page, attribute: string) =>
  slots(page).evaluateAll(
    (elements, name) =>
      elements.flatMap((element, index) => (element.hasAttribute(name) ? [index] : [])),
    attribute,
  )

/** The edge of a field: a boundary that stays visible has a style and a width. */
const edgeOf = (field: Locator) =>
  field.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: Number.parseFloat(style.borderTopWidth), style: style.borderTopStyle }
  })

const outlineStyleOf = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).outlineStyle)

/** Whether the slots are drawn, or the plain field shows instead. */
const isDrawn = (page: Page) => slots(page).first().isVisible()

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

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

/** Counts submits of the story's form: the story's handler cancels them. */
async function recordSubmits(page: Page) {
  await page.evaluate(() => {
    let count = 0
    document.querySelector('form')?.addEventListener('submit', () => {
      count += 1
      Reflect.set(window, 'submits', count)
    })
    Reflect.set(window, 'submits', 0)
  })
  return (): Promise<number> => page.evaluate(() => Reflect.get(window, 'submits'))
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

async function center(locator: Locator) {
  const box = await locator.boundingBox()
  if (box === null) {
    throw new Error('The element has no box')
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test.describe('OneTimeCode keyboard contract', () => {
  test('Tab focuses the input once', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(emailCode(page)).toBeFocused()
    // The whole row is one Tab stop: nothing else in it is focusable, the dash included.
    expect(
      await root(page).evaluate(
        (element) =>
          element.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex], [contenteditable]',
          ).length,
      ),
    ).toBe(1)
    await expect(slots(page).first()).toHaveAttribute('aria-hidden', 'true')
    await expect(separators(page).first()).toHaveAttribute('aria-hidden', 'true')
  })

  test('Tab leaves the field', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABC')
    // Tab goes to Continue, never to another box.
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
    // The same with a complete code: nothing in the row takes focus.
    await emailCode(page).focus()
    await page.keyboard.type('D1234')
    await expect(root(page)).toHaveAttribute('data-complete', '')
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
  })

  test('Shift+Tab leaves the field', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(emailCode(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(emailCode(page)).toBeFocused()
    // From the field it goes to the previous focusable element, never to a box. The story has
    // none before the field, so the test puts one there.
    await page.evaluate(() => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Tillbaka'
      document.querySelector('form')?.before(button)
    })
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Tillbaka' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(emailCode(page)).toBeFocused()
  })

  test('typing fills the boxes and keeps focus', async ({ page }) => {
    await openStory(page, 'keyboard')
    const submits = await recordSubmits(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABC')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', '', '', '', '', ''])
    // The caret is in the next box.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([3])
    // The fifth character crosses the dash: the mask puts the dash in, and the character goes in
    // the first box of the next group.
    await page.keyboard.type('D1')
    await expect(emailCode(page)).toHaveValue('ABCD-1')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', 'D', '1', '', '', ''])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([5])
    await page.keyboard.type('234')
    await expect(emailCode(page)).toHaveValue('ABCD-1234')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', 'D', '1', '2', '3', '4'])
    // Complete: no focus moved, nothing submitted.
    await expect(emailCode(page)).toBeFocused()
    await expect(root(page)).toHaveAttribute('data-complete', '')
    expect(await submits()).toBe(0)
  })

  test('a typed dash is accepted once', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    // The dash at the group break is accepted, and a second one is refused.
    await page.keyboard.type('ABCD--12')
    await expect(emailCode(page)).toHaveValue('ABCD-12')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', 'D', '1', '2', '', ''])
    // Anywhere else a dash is a refused character.
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('AB-')
    await expect(emailCode(page)).toHaveValue('AB')
    await expect(emailCode(page)).toBeFocused()
  })

  test('lower case becomes upper case', async ({ page }) => {
    // TwoGroups is `&&&&-&&&&`: a capital letter or digit in every position.
    await openStory(page, 'two-groups')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('k7qx2m9p')
    await expect(emailCode(page)).toHaveValue('K7QX-2M9P')
    await expect.poll(() => characters(page)).toEqual(['K', '7', 'Q', 'X', '2', 'M', '9', 'P'])
  })

  test('a letter in a digits code is refused', async ({ page }) => {
    // The Default story is `999999`: the refusal names digits.
    await openStory(page, 'default')
    const announcements = await recordAnnouncements(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('48a1')
    await expect(code(page)).toHaveValue('481')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '', '', ''])
    await expect(page.getByRole('status')).toHaveText('Här kan du bara skriva siffror.')
    expect(await announcements()).toEqual(['Här kan du bara skriva siffror.'])
  })

  test('a seventh digit is refused', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    await page.keyboard.type('4819207')
    await expect(code(page)).toHaveValue('481920')
    await expect(page.getByRole('status')).toHaveText('Du har skrivit alla 6 tecken.')
    await expect(code(page)).toBeFocused()
  })

  test('paste normalises the code', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    // With or without the dash, with spaces: the dash ends up where the pattern has it.
    for (const pasted of ['ABCD1234', 'ABCD-1234', 'ABCD 1234', ' ABCD  1234 ']) {
      await page.keyboard.press('ControlOrMeta+A')
      await paste(page, pasted)
      await expect(emailCode(page), pasted).toHaveValue('ABCD-1234')
      await expect
        .poll(() => characters(page), { message: pasted })
        .toEqual(['A', 'B', 'C', 'D', '1', '2', '3', '4'])
    }
    await expect(emailCode(page)).toBeFocused()
  })

  test('Backspace deletes before the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect(await caret(emailCode(page))).toEqual([6, 6])
    await page.keyboard.press('Backspace')
    await expect(emailCode(page)).toHaveValue('ABCD-234')
    // Later characters move back one box.
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', 'D', '2', '3', '4', ''])
    expect(await caret(emailCode(page))).toEqual([5, 5])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([4])
  })

  test('Delete deletes after the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Delete')
    // The rest reflows, and the dash stays between the groups.
    await expect(emailCode(page)).toHaveValue('ABD1-234')
    expect(await caret(emailCode(page))).toEqual([2, 2])
  })

  test('arrows move the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    // A complete code, the caret after the last character: the last box, caret after.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([7])
    await expect(slots(page).nth(7)).toHaveAttribute('data-caret', 'after')
    await page.keyboard.press('ArrowLeft')
    await expect(slots(page).nth(7)).toHaveAttribute('data-caret', 'before')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([7])
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([6])
    await expect(slots(page).nth(6)).toHaveAttribute('data-filled', '')
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([7])
    expect(await caret(emailCode(page))).toEqual([8, 8])
  })

  test('arrows step over the separator', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = emailCode(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD12')
    await expect(input).toHaveValue('ABCD-12')
    // Two presses back from the end: the caret is after the dash, before the first box of the group.
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect(await caret(input)).toEqual([5, 5])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([4])
    await expect(slots(page).nth(4)).toHaveAttribute('data-caret', 'before')
    // One press steps over the dash. The caret is drawn after the last box of the first group.
    await page.keyboard.press('ArrowLeft')
    expect(await caret(input)).toEqual([4, 4])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([3])
    await expect(slots(page).nth(3)).toHaveAttribute('data-caret', 'after')
    await expect(slots(page).nth(3)).toHaveAttribute('data-filled', '')
    // The dash itself is never the active box and never has a caret.
    await expect(separators(page).first()).not.toHaveAttribute('data-active', /.*/)
    await expect(separators(page).first()).not.toHaveAttribute('data-caret', /.*/)
    // Every position draws differently: before D is not after D.
    await page.keyboard.press('ArrowLeft')
    expect(await caret(input)).toEqual([3, 3])
    await expect(slots(page).nth(3)).toHaveAttribute('data-caret', 'before')
    await page.keyboard.press('ArrowRight')
    await expect(slots(page).nth(3)).toHaveAttribute('data-caret', 'after')
    await page.keyboard.press('ArrowRight')
    expect(await caret(input)).toEqual([5, 5])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([4])
    await expect(slots(page).nth(4)).toHaveAttribute('data-caret', 'before')
    await expect(input).toBeFocused()
  })

  test('Backspace and Delete cross the separator', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = emailCode(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    await page.keyboard.press('Home')
    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('ArrowRight')
    }
    expect(await caret(input)).toEqual([5, 5])
    // Backspace just after the dash deletes the character before it in the same press: the dash
    // stays (it is the pattern) and the rest reflows. The key never seems to do nothing.
    await page.keyboard.press('Backspace')
    await expect(input).toHaveValue('ABC1-234')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', '1', '2', '3', '4', ''])
    expect(await caret(input)).toEqual([3, 3])
    // Delete just before the dash deletes the character after it.
    await page.keyboard.press('ArrowRight')
    expect(await caret(input)).toEqual([4, 4])
    await page.keyboard.press('Delete')
    await expect(input).toHaveValue('ABC1-34')
    await expect.poll(() => characters(page)).toEqual(['A', 'B', 'C', '1', '3', '4', '', ''])
    await expect(input).toBeFocused()
  })

  test('arrows follow the code in RTL', async ({ page }) => {
    await openStory(page, 'rtl', { globals: 'dir:rtl;locale:en' })
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const input = code(page, 'Code from the text message')
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await page.keyboard.press('Home')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
    await page.keyboard.press('ArrowRight')
    // The code reads left to right: ArrowRight is the next character, in the box on the right.
    expect(await caret(input)).toEqual([1, 1])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([1])
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
  })

  test('Home and End move to the ends', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD12')
    await page.keyboard.press('Home')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
    expect(await caret(emailCode(page))).toEqual([0, 0])
    await page.keyboard.press('End')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([6])
    expect(await caret(emailCode(page))).toEqual([7, 7])
  })

  test('Shift extends the selection', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    await page.keyboard.press('Home')
    await page.keyboard.press('Shift+ArrowRight')
    await page.keyboard.press('Shift+ArrowRight')
    expect(await caret(emailCode(page))).toEqual([0, 2])
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1])
    // No box is active while there is a selection: no caret is drawn.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([])
    // Across the dash: every filled box is selected, and the dash never is.
    await page.keyboard.press('Shift+End')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    await expect(separators(page).first()).not.toHaveAttribute('data-selected', /.*/)
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
  })

  test('select all highlights every box', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD12')
    await page.keyboard.press('ControlOrMeta+A')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2, 3, 4, 5])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([])
    await expect(separators(page).first()).not.toHaveAttribute('data-selected', /.*/)
    // Typing replaces the code.
    await page.keyboard.type('7')
    await expect(emailCode(page)).toHaveValue('7')
  })

  test('undo restores the code', async ({ page }) => {
    // A code with no dash: undo is native. After the mask has put a dash in, undo can need two
    // presses to step back over it (the contract's Known issues).
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    await page.keyboard.press('Backspace')
    await expect(code(page)).toHaveValue('48192')
    await page.keyboard.press('ControlOrMeta+Z')
    await expect(code(page)).toHaveValue('481920')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '9', '2', '0'])
  })

  test('ArrowUp and ArrowDown never change the value', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD')
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowUp']) {
      await page.keyboard.press(key)
      await expect(emailCode(page)).toHaveValue('ABCD')
    }
    await expect(emailCode(page)).toBeFocused()
  })

  test('Enter submits the form', async ({ page }) => {
    await openStory(page, 'keyboard')
    const submits = await recordSubmits(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('ABCD1234')
    expect(await submits()).toBe(0)
    // The component never prevents it: the form's implicit submission runs.
    await page.keyboard.press('Enter')
    expect(await submits()).toBe(1)
    await expect(emailCode(page)).toBeFocused()
  })

  test('a press on a box focuses the input and places the caret', async ({ page }) => {
    await openStory(page, 'partly-filled')
    const input = code(page)
    // A press on an empty box puts the caret at the end of the code.
    await page.mouse.click(...(await centerPoint(slots(page).nth(4))))
    await expect(input).toBeFocused()
    expect(await caret(input)).toEqual([3, 3])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([3])
    // A press on a filled box puts it before that character.
    await page.mouse.click(...(await centerPoint(slots(page).nth(0))))
    expect(await caret(input)).toEqual([0, 0])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
    await page.mouse.click(...(await centerPoint(slots(page).nth(1))))
    expect(await caret(input)).toEqual([1, 1])
    // A press in a gap goes to the nearer box.
    const second = await slots(page).nth(1).boundingBox()
    const third = await slots(page).nth(2).boundingBox()
    if (second === null || third === null) {
      throw new Error('No box')
    }
    const gapX = (second.x + second.width + third.x) / 2
    await page.mouse.click(gapX + 1, second.y + second.height / 2)
    await expect(input).toBeFocused()
    expect(await caret(input)).toEqual([2, 2])
    // Every point of a box is the input's: the box takes no press.
    for (let index = 0; index < 6; index += 1) {
      const isInput = await slots(page)
        .nth(index)
        .evaluate((element) => {
          const box = element.getBoundingClientRect()
          const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
          return hit?.matches('.kv-one-time-code-input') ?? false
        })
      expect(isInput, `box ${index}`).toBe(true)
    }
  })

  test('a press on a separator goes to the nearest box', async ({ page }) => {
    // ThreeGroups is `&&&-&&&-&&&` holding `H4T-K92`: the first dash is value position 3.
    await openStory(page, 'three-groups')
    const input = code(page, 'Kod från e-postmeddelandet')
    const dash = separators(page).first()
    const box = await dash.boundingBox()
    if (box === null) {
      throw new Error('No separator')
    }
    // Neither the dash nor the gap takes the press: it goes to the input, and the caret to the
    // nearer box. The left half is nearest to the box before the dash (T, position 2), the right
    // half to the first box after it (K, position 4).
    await page.mouse.click(box.x + 3, box.y + box.height / 2)
    await expect(input).toBeFocused()
    expect(await caret(input)).toEqual([2, 2])
    await page.mouse.click(box.x + box.width - 3, box.y + box.height / 2)
    expect(await caret(input)).toEqual([4, 4])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([3])
    // Every point of every cell, the dashes too, is the input's.
    const count = await cells(page).count()
    expect(count).toBe(11)
    for (let index = 0; index < count; index += 1) {
      const isInput = await cells(page)
        .nth(index)
        .evaluate((element) => {
          const rectangle = element.getBoundingClientRect()
          const hit = document.elementFromPoint(
            rectangle.x + rectangle.width / 2,
            rectangle.y + rectangle.height / 2,
          )
          return hit?.matches('.kv-one-time-code-input') ?? false
        })
      expect(isInput, `cell ${index}`).toBe(true)
    }
  })
})

/** The centre of an element, as the two arguments of `page.mouse.click`. */
async function centerPoint(locator: Locator): Promise<[number, number]> {
  const { x, y } = await center(locator)
  return [x, y]
}

test.describe('OneTimeCode focus, states and modes', () => {
  test('a key-focused input shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    const input = emailCode(page)
    await expect(input).toBeFocused()
    expect(await outlineStyleOf(input)).not.toBe('none')
  })

  test('a click marks focus, but not focus-visible, and a key brings it back', async ({ page }) => {
    await openStory(page, 'keyboard')
    const input = emailCode(page)
    await input.click()
    await expect(input).toBeFocused()
    await expect(input).toHaveAttribute('data-focused', '')
    await expect(input).not.toHaveAttribute('data-focus-visible')
    await expect(page.locator('.kv-one-time-code-slot[data-active]')).toHaveCount(1)
    // A key press brings focus-visible back at the next focus.
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(input).toHaveAttribute('data-focus-visible', '')
  })

  test('the caret never blinks: nothing on the page repeats forever (2.2.2)', async ({ page }) => {
    await openStory(page, 'partly-filled')
    await page.keyboard.press('Tab')
    // Tab into a filled field selects the code: End puts the caret after it, in the next box.
    await page.keyboard.press('End')
    await expect(slots(page).nth(3)).toHaveAttribute('data-active', '')
    // Nothing repeats on the page (a blink would). A finished or running transition is not a loop.
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
            .length,
      ),
    ).toBe(0)
  })

  test('disabled: the field is not focusable', async ({ page }) => {
    await openStory(page, 'disabled')
    await expect(code(page)).toBeDisabled()
    await page.keyboard.press('Tab')
    await expect(code(page)).not.toBeFocused()
  })

  test('right to left: the code keeps its order and the input stays left to right', async ({
    page,
  }) => {
    // RTL is `AA-9999` holding `HT-4829`.
    await openStory(page, 'rtl', { globals: 'dir:rtl;locale:en' })
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    // The cells keep the pattern's order: H, T, the dash, then 4, 8, 2, 9.
    const texts = await cells(page).evaluateAll((elements) =>
      elements.map((element) => element.textContent),
    )
    expect(texts).toEqual(['H', 'T', '-', '4', '8', '2', '9'])
    await expect(code(page, 'Code from the text message')).toHaveAttribute('dir', 'ltr')
  })

  test('the dash never takes the selection or the active state of a box', async ({ page }) => {
    await openStory(page, 'two-groups')
    const dash = separators(page).first()
    await page.keyboard.press('Tab')
    await page.keyboard.press('ControlOrMeta+A')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    await expect(dash).not.toHaveAttribute('data-selected', /.*/)
    await expect(dash).not.toHaveAttribute('data-active', /.*/)
  })

  test('compact: the boxes and the input are at least 24px high (2.5.8)', async ({ page }) => {
    await openStory(page, 'compact')
    const box = await slots(page).first().boundingBox()
    const inputBox = await code(page, 'Kod från din autentiseringsapp').boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(24)
    expect(inputBox?.height).toBeGreaterThanOrEqual(24)
  })

  test('forced colours: the plain field shows, with its edge and focus indicator visible (1.4.11, 2.4.7)', async ({
    page,
  }) => {
    await openStory(page, 'forced-colors', {
      forcedColors: 'active',
      globals: 'forcedColors:active',
    })
    expect(await isDrawn(page)).toBe(false)
    for (const cell of await cells(page).all()) {
      await expect(cell).toBeHidden()
    }
    const inputs = page.locator('.kv-one-time-code-input')
    await expect(inputs).toHaveCount(4)
    for (const input of await inputs.all()) {
      await expect(input).toBeVisible()
      const edge = await edgeOf(input)
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
      expect(await input.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      )
    }
    // The focus indicator is there, and the value is kept, the dash included.
    await page.keyboard.press('Tab')
    await expect(inputs.first()).toBeFocused()
    expect(await outlineStyleOf(inputs.first())).not.toBe('none')
    await expect(inputs.nth(1)).toHaveValue('481')
    await expect(inputs.nth(2)).toHaveValue('K7QX-2M9P')
  })

  test('no horizontal scrolling at 320px: six boxes fit, in every story (1.4.10)', async ({
    page,
  }) => {
    for (const story of [
      'default',
      'partly-filled',
      'invalid',
      'compact',
      'rtl',
      'keyboard',
      'two-groups',
      'three-groups',
      'letter-prefix',
    ]) {
      await openStory(page, story, { viewport: { width: 320, height: 640 } })
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
    await openStory(page, 'default', { viewport: { width: 320, height: 640 } })
    expect(await isDrawn(page)).toBe(true)
    const last = await slots(page).last().boundingBox()
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeLessThanOrEqual(320)
  })

  test('at 320px AA-9999 draws its boxes and its dash, and fits (1.4.10)', async ({ page }) => {
    await openStory(page, 'letter-prefix', { viewport: { width: 320, height: 640 } })
    expect(await isDrawn(page)).toBe(true)
    await expect(separators(page).first()).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)
    const last = await slots(page).last().boundingBox()
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeLessThanOrEqual(320)
  })

  test('at 320px eight characters and a dash do not fit at 32px: the plain field shows', async ({
    page,
  }) => {
    for (const [story, value] of [
      ['two-groups', 'K7QX-2M9P'],
      ['three-groups', 'H4T-K92'],
    ] as const) {
      await openStory(page, story, { viewport: { width: 320, height: 640 } })
      expect(await isDrawn(page), story).toBe(false)
      expect(await hasHorizontalScroll(page), story).toBe(false)
      const input = emailCode(page)
      await expect(input).toBeVisible()
      // The same value, with its dashes, in a field as wide as the pattern: nothing scrolls inside it.
      await expect(input).toHaveValue(value)
      expect(await input.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      )
      for (const dash of await separators(page).all()) {
        await expect(dash).toBeHidden()
      }
    }
  })

  test('outside 4 to 10 characters and 2 dashes the plain field shows, at any width', async ({
    page,
  }) => {
    await openStory(page, 'pattern-limits')
    const roots = page.locator('.kv-one-time-code')
    await expect(roots).toHaveCount(6)
    for (const [index, drawn] of [true, true, true, false, false, false].entries()) {
      const root = roots.nth(index)
      const name = (await root.locator('input').getAttribute('name')) ?? ''
      expect(await root.locator('.kv-one-time-code-slot').first().isVisible(), name).toBe(drawn)
    }
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  test('at 200% text on a phone the plain field shows, and on a desktop the boxes stay', async ({
    page,
  }) => {
    await openStory(page, 'default', { viewport: { width: 320, height: 640 } })
    expect(await isDrawn(page)).toBe(true)
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect.poll(() => isDrawn(page)).toBe(false)
    expect(await hasHorizontalScroll(page)).toBe(false)
    // A desktop column is 40rem, so it grows with the text and the boxes stay.
    await openStory(page, 'default')
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    expect(await isDrawn(page)).toBe(true)
  })

  test('resizing to 320px keeps the value, the caret and the focus', async ({ page }) => {
    await openStory(page, 'partly-filled')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    const input = code(page)
    expect(await caret(input)).toEqual([1, 1])
    await page.setViewportSize({ width: 320, height: 640 })
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('481')
    expect(await caret(input)).toEqual([1, 1])
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect.poll(() => isDrawn(page)).toBe(false)
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('481')
    expect(await caret(input)).toEqual([1, 1])
    // And back: the same input, the same caret.
    await page.addStyleTag({ content: 'html { font-size: 100%; }' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect.poll(() => isDrawn(page)).toBe(true)
    await expect(input).toBeFocused()
    expect(await caret(input)).toEqual([1, 1])
  })

  for (const story of ['complete', 'two-groups']) {
    test(`text spacing (1.4.12): no character is clipped (${story})`, async ({ page }) => {
      await openStory(page, story)
      await page.addStyleTag({
        content:
          '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
      })
      // Every cell: the boxes and the dash.
      const clipped = await cells(page).evaluateAll((elements) =>
        elements.map(
          (element) =>
            element.scrollWidth > element.clientWidth ||
            element.scrollHeight > element.clientHeight,
        ),
      )
      for (const [index, isClipped] of clipped.entries()) {
        expect(isClipped, `cell ${index}`).toBe(false)
      }
    })
  }

  test('not ready: the plain field shows, and typed text is visible', async ({ page }) => {
    await openStory(page, 'keyboard')
    // Before the script has run there is no data-ready: the theme shows the plain field.
    await root(page).evaluate((element) => element.removeAttribute('data-ready'))
    expect(await isDrawn(page)).toBe(false)
    const input = emailCode(page)
    await expect(input).toBeVisible()
    await input.focus()
    await page.keyboard.type('AB')
    const colors = await input.evaluate((element) => {
      const computed = getComputedStyle(element)
      return { color: computed.color, fill: computed.webkitTextFillColor }
    })
    expect(colors.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(colors.fill).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('the autofill value present before the script runs is drawn', async ({ page }) => {
    await openStory(page, 'partly-filled')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '', '', ''])
  })

  // The mount path ("abcd 1234" typed before the script runs) is in one-time-code.test.tsx. This is
  // the other half: a form reset puts the markup's default back, and it goes through the mask too,
  // the dash included.
  for (const [written, shown] of [
    ['abcd 1234', ['a', 'b', 'c', 'd', '1', '2', '3', '4']],
    ['abcd12345', ['a', 'b', 'c', 'd', '1', '2', '3', '4']],
  ] as const) {
    test(`a form reset to "${written}" goes through the mask`, async ({ page }) => {
      await openStory(page, 'keyboard')
      await emailCode(page).evaluate((element, defaultValue) => {
        const input = element as HTMLInputElement
        input.defaultValue = defaultValue
        input.form?.reset()
      }, written)
      await expect(emailCode(page)).toHaveValue('abcd-1234')
      await expect.poll(() => characters(page)).toEqual([...shown])
    })
  }
})

test.describe('OneTimeCode accessibility', () => {
  test('a11y tree: one textbox named by the label, with the help text as its description', async ({
    page,
  }) => {
    await openStory(page, 'partly-filled')
    await expect(page.locator('.kv-field')).toMatchAriaSnapshot(`
      - text: Kod från sms:et
      - paragraph: Koden har 6 siffror. Du hittar den i sms:et som vi just skickade till dig.
      - textbox "Kod från sms:et": "481"
    `)
    await expect(code(page)).toHaveAccessibleDescription(
      'Koden har 6 siffror. Du hittar den i sms:et som vi just skickade till dig.',
    )
    for (const slot of await slots(page).all()) {
      await expect(slot).toHaveAttribute('aria-hidden', 'true')
    }
  })

  test('a11y tree with a dash: one textbox holding the value with its dash, the dash hidden', async ({
    page,
  }) => {
    await openStory(page, 'two-groups')
    await expect(page.locator('.kv-field')).toMatchAriaSnapshot(`
      - text: Kod från e-postmeddelandet
      - paragraph: Koden har 8 bokstäver och siffror, i 2 grupper om 4. Du hittar den i e-postmeddelandet som vi just skickade till dig.
      - textbox "Kod från e-postmeddelandet": K7QX-2M9P
    `)
    await expect(emailCode(page)).toHaveAccessibleDescription(
      'Koden har 8 bokstäver och siffror, i 2 grupper om 4. Du hittar den i e-postmeddelandet som vi just skickade till dig.',
    )
    await expect(root(page)).toHaveAttribute('data-character-count', '8')
    await expect(root(page)).toHaveAttribute('data-separator-count', '1')
    for (const cell of await cells(page).all()) {
      await expect(cell).toHaveAttribute('aria-hidden', 'true')
    }
    // Nothing in the row but the input is focusable or named.
    await expect(root(page).getByRole('textbox')).toHaveCount(1)
  })

  test('the input is at least 24px high (2.5.8)', async ({ page }) => {
    await openStory(page, 'default')
    const box = await code(page).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(24)
  })

  const stories = [
    'default',
    'partly-filled',
    'complete',
    'invalid',
    'disabled',
    'two-groups',
    'three-groups',
    'letter-prefix',
    'compact',
    'rtl',
    'forced-colors',
    'keyboard',
  ] as const
  for (const story of stories) {
    test(`no axe violations on ${story}`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('no axe violations while the field has focus and a selection', async ({ page }) => {
    await openStory(page, 'partly-filled')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ControlOrMeta+A')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2])
    const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(results.violations).toEqual([])
  })

  test('no axe violations in the plain field (forced colours)', async ({ page }) => {
    await openStory(page, 'forced-colors', { forcedColors: 'active' })
    const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(results.violations).toEqual([])
  })
})
