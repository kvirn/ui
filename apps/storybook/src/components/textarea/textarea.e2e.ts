import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/textarea/textarea.a11y.md › Keyboard, Announcements and Visual /
// modes. One test per row, named after it. The Field wiring, the count's text and plural forms are
// component tests (textarea.test.tsx, character-count.test.tsx): here only what needs a real page.
// KvirnUI holds no form state: the Keyboard story keeps its output in the story, or in the browser.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-textarea--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-textarea').first()).toBeVisible()
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
 * after every handler in the page: a key Textarea intercepted would show up here. Returns a
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

/** Records every non-empty text the polite live region held, in order. */
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

const caretOf = (box: Locator) =>
  box.evaluate((element: HTMLTextAreaElement) => element.selectionStart)

const situation = (page: Page) => page.getByRole('textbox', { name: 'Beskriv din situation' })

test.describe('Textarea keyboard contract', () => {
  test('Tab moves in and out and never inserts a tab', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = situation(page)
    const send = page.getByRole('button', { name: 'Skicka' })
    await page.keyboard.press('Tab')
    await expect(box).toBeFocused()
    await page.keyboard.type('Hej')
    await page.keyboard.press('Tab')
    await expect(send).toBeFocused()
    await expect(box).toHaveValue('Hej')
    await page.keyboard.press('Shift+Tab')
    await expect(box).toBeFocused()
    await expect(box).toHaveValue('Hej')
  })

  test('Enter inserts a line break and does not submit', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = situation(page)
    await box.focus()
    await page.keyboard.type('Rad ett')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Rad två')
    await expect(box).toHaveValue('Rad ett\nRad två')
    await expect(box).toBeFocused()
    await expect(page.getByTestId('sent')).toHaveCount(0)
    // The button still submits, so the form works and the text arrives with its line break.
    await page.getByRole('button', { name: 'Skicka' }).click()
    await expect(page.getByTestId('sent')).toBeVisible()
  })

  test('caret keys are not intercepted', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = situation(page)
    await box.fill('Anna\nBritta')
    await box.focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('End')
    expect(await caretOf(box)).toBe(11)
    await page.keyboard.press('Home')
    expect(await caretOf(box)).toBe(5)
    await page.keyboard.press('ArrowRight')
    expect(await caretOf(box)).toBe(6)
    await page.keyboard.press('ArrowLeft')
    expect(await caretOf(box)).toBe(5)
    // Up and Down move between the lines, and Page Up and Page Down are the browser's too.
    await page.keyboard.press('ArrowUp')
    expect(await caretOf(box)).toBeLessThanOrEqual(4)
    await page.keyboard.press('ArrowDown')
    expect(await caretOf(box)).toBeGreaterThanOrEqual(5)
    await page.keyboard.press('PageUp')
    await page.keyboard.press('PageDown')
    await expect(box).toHaveValue('Anna\nBritta')
    await expect(box).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('caret keys are not intercepted in right to left', async ({ page }) => {
    await openStory(page, 'rtl')
    const box = page.getByRole('textbox', { name: 'Describe your situation', exact: true })
    await box.fill('abc')
    await box.focus()
    const prevented = await recordPreventedKeys(page)
    for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'ArrowUp', 'ArrowDown']) {
      await page.keyboard.press(key)
    }
    await expect(box).toHaveValue('abc')
    await expect(box).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('Control/Command+A selects all the text', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = situation(page)
    await box.fill('Anna\nAndersson')
    await box.focus()
    await page.keyboard.press('ControlOrMeta+A')
    const selection = await box.evaluate((element: HTMLTextAreaElement) => [
      element.selectionStart,
      element.selectionEnd,
    ])
    expect(selection).toEqual([0, 'Anna\nAndersson'.length])
  })

  test('Control/Command+V keeps a text that is longer than the limit', async ({ page }) => {
    await openStory(page, 'character-count')
    const box = situation(page)
    // The story's play function typed an example: wait for it, then start from an empty box.
    await expect(box).toHaveValue('Hej')
    await box.fill('')
    await box.focus()
    const long = 'Jag behöver hjälp. '.repeat(15)
    expect(long.length).toBe(285)
    await paste(page, long)
    // Nothing is cut: the native attribute would have stopped it at 200 without a word.
    await expect(box).toHaveValue(long)
    await expect(box).toHaveAttribute('data-over', '')
    await expect(page.getByText('Du har 85 tecken för mycket.')).toBeVisible()
    await expect(box).toBeFocused()
  })

  test('Escape does nothing: the value and the focus stay', async ({ page }) => {
    await openStory(page, 'keyboard')
    const box = situation(page)
    await box.fill('Anna')
    await box.focus()
    const prevented = await recordPreventedKeys(page)
    await page.keyboard.press('Escape')
    await expect(box).toHaveValue('Anna')
    await expect(box).toBeFocused()
    expect(await prevented()).toEqual([])
  })
})

test.describe('Textarea character count', () => {
  test('the count is announced from 80% and when the limit is crossed', async ({ page }) => {
    await openStory(page, 'character-count')
    const box = situation(page)
    await expect(box).toHaveValue('Hej')
    await box.fill('')
    await box.focus()
    const announced = await recordAnnouncements(page)
    const status = page.getByRole('status')

    // Below 80% of 200: nothing is said, however long the pause.
    await page.keyboard.insertText('a'.repeat(120))
    await page.waitForTimeout(900)
    expect(await announced()).toEqual([])
    await expect(status).toBeEmpty()

    // From 160, when typing pauses.
    await page.keyboard.insertText('a'.repeat(50))
    await expect(status).toHaveText('Du har 30 tecken kvar.')

    // Crossing the limit: said at once, without waiting for a pause.
    await page.keyboard.insertText('a'.repeat(31))
    await expect(status).toHaveText('Du har 1 tecken för mycket.')
  })
})

test.describe('Textarea focus and modes', () => {
  test('a key-focused box shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const box = page.getByRole('textbox', { name: 'Beskriv din situation' })
    await expect(box).toBeFocused()
    await expect(box).toHaveAttribute('data-focus-visible', '')
    expect(await box.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none')
  })

  test('forced colours keep the box edge and the focus indicator visible (1.4.11, 2.4.7)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const boxes = page.locator('.kv-textarea')
    expect(await boxes.count()).toBe(5)
    for (const box of await boxes.all()) {
      const edge = await box.evaluate((element) => {
        const style = getComputedStyle(element)
        return { width: Number.parseFloat(style.borderTopWidth), style: style.borderTopStyle }
      })
      expect(edge.style).not.toBe('none')
      expect(edge.width).toBeGreaterThan(0)
    }
    const first = boxes.first()
    await first.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    expect(await first.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('no horizontal scrolling at 320px: the box, the count and a Finnish label (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of [
      'default',
      'widths',
      'long-finnish',
      'character-count',
      'character-count-states',
      'forced-colors',
    ] as const) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })

  test('no horizontal scrolling at 320px and 200% text size (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'character-count-states')
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing).
  test('the box and the count wrap and nothing is clipped with the text spacing overrides (1.4.12)', async ({
    page,
  }) => {
    await openStory(page, 'character-count-states')
    await page.evaluate(() => {
      document.body.classList.add('kv-story-text-spacing')
    })
    for (const element of await page.locator('.kv-textarea, .kv-character-count').all()) {
      const fits = await element.evaluate((node) => node.scrollWidth <= node.clientWidth)
      expect(fits).toBe(true)
    }
  })
})

test.describe('Textarea accessibility', () => {
  // The Textarea stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['keyboard'],
    ['typing'],
    ['invalid'],
    ['disabled'],
    ['read-only'],
    ['controlled'],
    ['character-count'],
    ['character-count-states'],
    ['widths'],
    ['long-finnish'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['forced-colors', theme] as const),
    ...themes.map((theme) => ['character-count-states', theme] as const),
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
