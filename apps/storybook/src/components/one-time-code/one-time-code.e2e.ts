import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/one-time-code/one-time-code.a11y.md › Keyboard, Focus management
// and Visual / modes. One test per row, named after it. The Keyboard story is the fixture: an
// empty six-digit code, then a Continue button, in a form that does nothing on submit.
// KvirnUI holds no form state.
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
const slots = (page: Page) => page.locator('.kv-one-time-code-slot')
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

const edgeOf = (slot: Locator) =>
  slot.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      width: Number.parseFloat(style.borderTopWidth),
      style: style.borderTopStyle,
      color: style.borderTopColor,
      fill: style.backgroundColor,
    }
  })

const ringOf = (element: Locator) =>
  element.evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
      offset: Number.parseFloat(style.outlineOffset),
    }
  })

/** Where the slot's character is drawn, relative to the slot's own box. */
const characterOffset = (slot: Locator) =>
  slot.evaluate((element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    const text = range.getBoundingClientRect()
    const box = element.getBoundingClientRect()
    return { x: text.x - box.x, y: text.y - box.y }
  })

/** Whether the slots are drawn (displayed) or the theme shows the plain field. */
const isDrawn = (page: Page) =>
  slots(page)
    .first()
    .evaluate((element) => getComputedStyle(element).display !== 'none')

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
    await expect(code(page)).toBeFocused()
    // The whole row is one Tab stop: nothing else in it is focusable.
    expect(
      await root(page).evaluate(
        (element) =>
          element.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex], [contenteditable]',
          ).length,
      ),
    ).toBe(1)
    await expect(slots(page).first()).toHaveAttribute('aria-hidden', 'true')
  })

  test('Tab leaves the field', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481')
    // Tab goes to Continue, never to another box.
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
    // The same with a complete code: nothing in the row takes focus.
    await code(page).focus()
    await page.keyboard.type('920')
    await expect(root(page)).toHaveAttribute('data-complete', '')
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
  })

  test('Shift+Tab leaves the field', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(code(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(continueButton(page)).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(code(page)).toBeFocused()
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
    await expect(code(page)).toBeFocused()
  })

  test('typing fills the boxes and keeps focus', async ({ page }) => {
    await openStory(page, 'keyboard')
    const submits = await recordSubmits(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('481')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '', '', ''])
    // The caret is in the next box.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([3])
    await page.keyboard.type('920')
    await expect(code(page)).toHaveValue('481920')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '9', '2', '0'])
    // Complete: no focus moved, nothing submitted.
    await expect(code(page)).toBeFocused()
    await expect(root(page)).toHaveAttribute('data-complete', '')
    expect(await submits()).toBe(0)
  })

  test('a letter in a digits code is refused', async ({ page }) => {
    await openStory(page, 'keyboard')
    const announcements = await recordAnnouncements(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('48a1')
    await expect(code(page)).toHaveValue('481')
    await expect.poll(() => characters(page)).toEqual(['4', '8', '1', '', '', ''])
    await expect(page.getByRole('status')).toHaveText('Här kan du bara skriva siffror.')
    expect(await announcements()).toEqual(['Här kan du bara skriva siffror.'])
  })

  test('a seventh digit is refused', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('4819207')
    await expect(code(page)).toHaveValue('481920')
    await expect(page.getByRole('status')).toHaveText('Du har skrivit alla 6 tecken.')
    await expect(code(page)).toBeFocused()
  })

  test('paste normalises the code', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    for (const pasted of ['481 920', '481-920', 'Your code is 481920', ' 481  920 ']) {
      await page.keyboard.press('ControlOrMeta+A')
      await paste(page, pasted)
      await expect(code(page), pasted).toHaveValue('481920')
      await expect
        .poll(() => characters(page), { message: pasted })
        .toEqual(['4', '8', '1', '9', '2', '0'])
    }
    await expect(code(page)).toBeFocused()
  })

  test('Backspace deletes before the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    expect(await caret(code(page))).toEqual([3, 3])
    await page.keyboard.press('Backspace')
    await expect(code(page)).toHaveValue('48920')
    // Later characters move back one box.
    await expect.poll(() => characters(page)).toEqual(['4', '8', '9', '2', '0', ''])
    expect(await caret(code(page))).toEqual([2, 2])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([2])
  })

  test('Delete deletes after the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Delete')
    await expect(code(page)).toHaveValue('48920')
    expect(await caret(code(page))).toEqual([2, 2])
  })

  test('arrows move the caret', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    // A complete code, the caret after the last character: the last box, caret after.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([5])
    await expect(slots(page).nth(5)).toHaveAttribute('data-caret', 'after')
    await page.keyboard.press('ArrowLeft')
    await expect(slots(page).nth(5)).toHaveAttribute('data-caret', 'before')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([5])
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([4])
    await expect(slots(page).nth(4)).toHaveAttribute('data-filled', '')
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([5])
    expect(await caret(code(page))).toEqual([5, 5])
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
    const first = await slots(page).nth(0).boundingBox()
    const second = await slots(page).nth(1).boundingBox()
    expect(second?.x).toBeGreaterThan(first?.x ?? Number.POSITIVE_INFINITY)
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
  })

  test('Home and End move to the ends', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('4819')
    await page.keyboard.press('Home')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
    expect(await caret(code(page))).toEqual([0, 0])
    await page.keyboard.press('End')
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([4])
    expect(await caret(code(page))).toEqual([4, 4])
  })

  test('Shift extends the selection', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    await page.keyboard.press('Home')
    await page.keyboard.press('Shift+ArrowRight')
    await page.keyboard.press('Shift+ArrowRight')
    expect(await caret(code(page))).toEqual([0, 2])
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1])
    // No box is active while there is a selection: no caret is drawn.
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([])
    await page.keyboard.press('Shift+End')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2, 3, 4, 5])
    await page.keyboard.press('ArrowLeft')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([0])
  })

  test('select all highlights every box', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.type('4819')
    await page.keyboard.press('ControlOrMeta+A')
    await expect.poll(() => withAttribute(page, 'data-selected')).toEqual([0, 1, 2, 3])
    await expect.poll(() => withAttribute(page, 'data-active')).toEqual([])
    // The selected boxes have the 2px ring-coloured edge, and typing replaces the code.
    expect((await edgeOf(slots(page).nth(0))).width).toBe(2)
    await page.keyboard.type('7')
    await expect(code(page)).toHaveValue('7')
  })

  test('undo restores the code', async ({ page }) => {
    await openStory(page, 'keyboard')
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
    await page.keyboard.type('481')
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowUp']) {
      await page.keyboard.press(key)
      await expect(code(page)).toHaveValue('481')
    }
    await expect(code(page)).toBeFocused()
  })

  test('Enter submits the form', async ({ page }) => {
    await openStory(page, 'keyboard')
    const submits = await recordSubmits(page)
    await page.keyboard.press('Tab')
    await page.keyboard.type('481920')
    expect(await submits()).toBe(0)
    // The component never prevents it: the form's implicit submission runs.
    await page.keyboard.press('Enter')
    expect(await submits()).toBe(1)
    await expect(code(page)).toBeFocused()
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
})

/** The centre of an element, as the two arguments of `page.mouse.click`. */
async function centerPoint(locator: Locator): Promise<[number, number]> {
  const { x, y } = await center(locator)
  return [x, y]
}

test.describe('OneTimeCode focus, states and modes', () => {
  test('the ring is the input’s, around the whole row, and no box has an outline', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    const input = code(page)
    expect(await ringOf(input)).toEqual({ style: 'solid', width: 2, offset: 2 })
    // The input's box is the row: the first box's start to the last box's end.
    const inputBox = await input.boundingBox()
    const first = await slots(page).first().boundingBox()
    const last = await slots(page).last().boundingBox()
    expect(inputBox?.x).toBeCloseTo(first?.x ?? 0, 0)
    expect((inputBox?.x ?? 0) + (inputBox?.width ?? 0)).toBeCloseTo(
      (last?.x ?? 0) + (last?.width ?? 0),
      0,
    )
    for (const slot of await slots(page).all()) {
      expect((await ringOf(slot)).style).toBe('none')
    }
  })

  test('the input is invisible and under the boxes: it has no edge and transparent text', async ({
    page,
  }) => {
    await openStory(page, 'partly-filled')
    const style = await code(page).evaluate((element) => {
      const computed = getComputedStyle(element)
      return {
        position: computed.position,
        border: Number.parseFloat(computed.borderTopWidth),
        textFill: computed.webkitTextFillColor,
        caretColor: computed.caretColor,
      }
    })
    expect(style.position).toBe('absolute')
    expect(style.border).toBe(0)
    expect(style.textFill).toBe('rgba(0, 0, 0, 0)')
    expect(style.caretColor).toBe('rgba(0, 0, 0, 0)')
  })

  test('the active box has a 2px ring-coloured edge and a caret, and its character does not move', async ({
    page,
  }) => {
    await openStory(page, 'partly-filled')
    const before = await characterOffset(slots(page).nth(1))
    await page.keyboard.press('Tab')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    const active = slots(page).nth(1)
    await expect(active).toHaveAttribute('data-active', '')
    const edge = await edgeOf(active)
    expect(edge.width).toBe(2)
    expect(edge.color).not.toBe((await edgeOf(slots(page).nth(0))).color)
    const caretBox = await active.evaluate((element) => {
      const style = getComputedStyle(element, '::before')
      return { content: style.content, width: Number.parseFloat(style.width) }
    })
    expect(caretBox).toEqual({ content: '""', width: 2 })
    // The edge goes from 1px to 2px inside the box, and the caret cancels its own width.
    expect(await characterOffset(active)).toEqual(before)
  })

  test('the caret never blinks', async ({ page }) => {
    await openStory(page, 'partly-filled')
    await page.keyboard.press('Tab')
    // Tab into a filled field selects the code: End puts the caret after it, in the next box.
    await page.keyboard.press('End')
    await expect(slots(page).nth(3)).toHaveAttribute('data-active', '')
    // Nothing repeats on the page (a blink would), and the bar has no animation. A finished or
    // running transition of an edge colour is not a loop.
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
            .length,
      ),
    ).toBe(0)
    expect(
      await slots(page)
        .nth(3)
        .evaluate((element) => getComputedStyle(element, '::before').animationName),
    ).toBe('none')
  })

  test('invalid: every box has a 2px edge, and the characters do not move', async ({ page }) => {
    await openStory(page, 'complete')
    const valid: { x: number; y: number }[] = []
    for (let index = 0; index < 6; index += 1) {
      valid.push(await characterOffset(slots(page).nth(index)))
    }
    const validEdge = await edgeOf(slots(page).nth(0))
    expect(validEdge.width).toBe(1)
    await openStory(page, 'invalid')
    for (let index = 0; index < 6; index += 1) {
      const slot = slots(page).nth(index)
      const edge = await edgeOf(slot)
      expect(edge.width, `box ${index}`).toBe(2)
      expect(edge.style).toBe('solid')
      expect(edge.color).not.toBe(validEdge.color)
      expect(await characterOffset(slot), `box ${index}`).toEqual(valid[index])
    }
    await expect(code(page)).toHaveAttribute('aria-invalid', 'true')
  })

  test('invalid and active: the active box shows the ring colour, the others stay danger', async ({
    page,
  }) => {
    await openStory(page, 'invalid')
    const danger = (await edgeOf(slots(page).nth(0))).color
    await page.keyboard.press('Tab')
    await page.keyboard.press('Home')
    expect((await edgeOf(slots(page).nth(0))).color).not.toBe(danger)
    expect((await edgeOf(slots(page).nth(0))).width).toBe(2)
    expect((await edgeOf(slots(page).nth(1))).color).toBe(danger)
  })

  test('disabled: a dashed edge, and the field is not focusable', async ({ page }) => {
    await openStory(page, 'disabled')
    expect((await edgeOf(slots(page).nth(0))).style).toBe('dashed')
    await expect(code(page)).toBeDisabled()
    await page.keyboard.press('Tab')
    await expect(code(page)).not.toBeFocused()
  })

  test('complete has no look of its own', async ({ page }) => {
    await openStory(page, 'complete')
    const complete = await edgeOf(slots(page).nth(0))
    expect(complete.width).toBe(1)
    expect(complete.style).toBe('solid')
    await expect(root(page)).toHaveAttribute('data-complete', '')
    expect(await ringOf(root(page))).toMatchObject({ style: 'none' })
  })

  test('right to left: the boxes read left to right, at the right of the column', async ({
    page,
  }) => {
    await openStory(page, 'rtl', { globals: 'dir:rtl;locale:en' })
    const first = await slots(page).first().boundingBox()
    const last = await slots(page).last().boundingBox()
    expect(first?.x).toBeLessThan(last?.x ?? 0)
    const field = await page.locator('.kv-field').boundingBox()
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeCloseTo(
      (field?.x ?? 0) + (field?.width ?? 0),
      0,
    )
    await expect(code(page, 'Code from the text message')).toHaveAttribute('dir', 'ltr')
    // The input covers the row on the right.
    const inputBox = await code(page, 'Code from the text message').boundingBox()
    expect((inputBox?.x ?? 0) + (inputBox?.width ?? 0)).toBeCloseTo(
      (last?.x ?? 0) + (last?.width ?? 0),
      0,
    )
  })

  test('grouped: an even code has a wider gap in the middle', async ({ page }) => {
    await openStory(page, 'letters-and-digits')
    expect(await isDrawn(page)).toBe(true)
    const boxes = await slots(page).evaluateAll((elements) =>
      elements.map((element) => {
        const { x, width } = element.getBoundingClientRect()
        return { x, width }
      }),
    )
    const gaps = boxes
      .slice(1)
      .map((box, index) => box.x - ((boxes[index]?.x ?? 0) + (boxes[index]?.width ?? 0)))
    expect(gaps.filter((gap) => gap > 12)).toHaveLength(1)
    expect(gaps[3]).toBeGreaterThan(12)
  })

  test('compact: 32px boxes, and the input is at least 24px high', async ({ page }) => {
    await openStory(page, 'compact')
    const box = await slots(page).first().boundingBox()
    const inputBox = await code(page, 'Kod från din autentiseringsapp').boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(24)
    expect(inputBox?.height).toBeGreaterThanOrEqual(24)
    expect(box?.width).toBeCloseTo(32, 0)
  })

  test('forced colours: the plain field shows and the boxes are hidden', async ({ page }) => {
    await openStory(page, 'forced-colors', {
      forcedColors: 'active',
      globals: 'forcedColors:active',
    })
    expect(await isDrawn(page)).toBe(false)
    for (const slot of await slots(page).all()) {
      await expect(slot).toBeHidden()
    }
    const inputs = page.locator('.kv-one-time-code-input')
    await expect(inputs).toHaveCount(4)
    for (const input of await inputs.all()) {
      await expect(input).toBeVisible()
      const style = await input.evaluate((element) => {
        const computed = getComputedStyle(element)
        return {
          position: computed.position,
          width: Number.parseFloat(computed.borderTopWidth),
          style: computed.borderTopStyle,
          edgeDiffers: computed.borderTopColor !== computed.backgroundColor,
          textVisible: computed.color !== computed.backgroundColor,
        }
      })
      expect(style.position).toBe('static')
      expect(style.edgeDiffers).toBe(true)
      expect(style.textVisible).toBe(true)
    }
    // The width and the dashes carry the state, not the colour (1.4.1, 1.4.11).
    const edges = await Promise.all(
      (await inputs.all()).map((input) =>
        input.evaluate((element) => {
          const computed = getComputedStyle(element)
          return {
            width: Number.parseFloat(computed.borderTopWidth),
            style: computed.borderTopStyle,
          }
        }),
      ),
    )
    expect(edges[0]).toEqual({ width: 1, style: 'solid' })
    expect(edges[2]).toEqual({ width: 2, style: 'solid' })
    expect(edges[3]).toEqual({ width: 1, style: 'dashed' })
    // The focus ring is a system colour outline, and the value is kept.
    await page.keyboard.press('Tab')
    await expect(inputs.first()).toBeFocused()
    expect(await ringOf(inputs.first())).toMatchObject({ style: 'solid', width: 2 })
    await expect(inputs.nth(1)).toHaveValue('481')
  })

  test('reduced motion: the boxes do not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'partly-filled')
    await expect(slots(page).first()).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px: six boxes shrink to fit, in every story', async ({
    page,
  }) => {
    for (const story of ['default', 'partly-filled', 'invalid', 'compact', 'rtl', 'keyboard']) {
      await openStory(page, story, { viewport: { width: 320, height: 640 } })
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
    await openStory(page, 'default', { viewport: { width: 320, height: 640 } })
    expect(await isDrawn(page)).toBe(true)
    const last = await slots(page).last().boundingBox()
    expect((last?.x ?? 0) + (last?.width ?? 0)).toBeLessThanOrEqual(320)
    const first = await slots(page).first().boundingBox()
    expect(first?.width).toBeGreaterThanOrEqual(32)
    expect(first?.width).toBeLessThan(44)
  })

  test('at 320px eight characters do not fit at 32px: the plain field shows', async ({ page }) => {
    await openStory(page, 'letters-and-digits', { viewport: { width: 320, height: 640 } })
    expect(await isDrawn(page)).toBe(false)
    expect(await hasHorizontalScroll(page)).toBe(false)
    const input = code(page, 'Kod från e-postmeddelandet')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('K7QX2M9P')
    expect(await input.evaluate((element) => getComputedStyle(element).position)).toBe('static')
  })

  test('at 200% text on a phone the plain field shows, and on a desktop the boxes grow', async ({
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
    expect((await slots(page).first().boundingBox())?.width).toBeGreaterThanOrEqual(88)
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

  test('text spacing (1.4.12): each character stays inside its box, and nothing overlaps', async ({
    page,
  }) => {
    await openStory(page, 'complete')
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
    })
    const boxes = await slots(page).evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect()
        const range = document.createRange()
        range.selectNodeContents(element)
        const text = range.getBoundingClientRect()
        return {
          box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
          text: { left: text.left, right: text.right, top: text.top, bottom: text.bottom },
          clipped:
            element.scrollWidth > element.clientWidth ||
            element.scrollHeight > element.clientHeight,
        }
      }),
    )
    for (const [index, { box, text, clipped }] of boxes.entries()) {
      expect(text.left, `box ${index}`).toBeGreaterThanOrEqual(box.left)
      expect(text.right, `box ${index}`).toBeLessThanOrEqual(box.right)
      expect(text.top, `box ${index}`).toBeGreaterThanOrEqual(box.top)
      expect(text.bottom, `box ${index}`).toBeLessThanOrEqual(box.bottom)
      expect(clipped, `box ${index}`).toBe(false)
      const next = boxes[index + 1]
      if (next !== undefined) {
        expect(box.right, `box ${index}`).toBeLessThanOrEqual(next.box.left + 0.5)
      }
    }
  })

  test('not ready: the plain field shows, and typed text is visible', async ({ page }) => {
    await openStory(page, 'keyboard')
    // Before the script has run there is no data-ready: the theme shows the plain field.
    await root(page).evaluate((element) => element.removeAttribute('data-ready'))
    expect(await isDrawn(page)).toBe(false)
    const input = code(page)
    expect(await input.evaluate((element) => getComputedStyle(element).position)).toBe('static')
    await input.focus()
    await page.keyboard.type('48')
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

  // The mount path ("481 920" typed before the script runs) is in one-time-code.test.tsx. This is
  // the other half: a form reset puts the markup's default back, and it goes through the mask too.
  for (const [written, shown] of [
    ['481 920', ['4', '8', '1', '9', '2', '0']],
    ['4819207', ['4', '8', '1', '9', '2', '0']],
  ] as const) {
    test(`a form reset to "${written}" goes through the mask`, async ({ page }) => {
      await openStory(page, 'keyboard')
      await code(page).evaluate((element, defaultValue) => {
        const input = element as HTMLInputElement
        input.defaultValue = defaultValue
        input.form?.reset()
      }, written)
      await expect(code(page)).toHaveValue('481920')
      await expect.poll(() => characters(page)).toEqual([...shown])
    })
  }
})

test.describe('OneTimeCode accessibility', () => {
  test('a11y tree: one textbox named by the label, with the hint as its description', async ({
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

  test('the input is at least 44px high and as wide as the row', async ({ page }) => {
    await openStory(page, 'default')
    const box = await code(page).boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
    expect(box?.width).toBeGreaterThanOrEqual(160)
  })

  const stories = [
    'default',
    'partly-filled',
    'complete',
    'invalid',
    'disabled',
    'letters-and-digits',
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
