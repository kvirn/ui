import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/rich-text/src/rich-text-editor.a11y.md › Keyboard. One test per row, named
// after it. The Keyboard story is the fixture (sv): a button before, an editor that holds a
// paragraph, a list (Öppettider, Lån), a table (Dag, Öppnar / Torsdag, 10:00) and a closing
// paragraph, and a button after. What the extensions decide with a real key press at a single
// ProseMirror position, and every AltGr character, is also covered in
// packages/rich-text/src/extensions/kvirn-keymap.test.tsx.

const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-rich-text-editor--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story = 'keyboard', globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.getByRole('textbox').first()).toBeVisible()
}

const text = (page: Page) => page.getByRole('textbox', { name: 'Nyhetstext' })
const toolbar = (page: Page) => page.getByRole('toolbar')
const control = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
/** The toolbar's one Tab stop. */
const tabStop = (page: Page) => toolbar(page).locator('[tabindex="0"]')

/** Clicks a text in the editor and moves the caret to the end of its line. */
async function caretAtEndOf(page: Page, words: string) {
  await text(page).getByText(words, { exact: true }).click()
  await page.keyboard.press('End')
}

/**
 * Waits until the page has a selection that is not collapsed, so ProseMirror has read it from the
 * DOM before the next key. A real user is never that fast, a test is.
 */
const selectionSettled = (page: Page) =>
  expect
    .poll(() => page.evaluate(() => globalThis.getSelection()?.isCollapsed === false))
    .toBe(true)

/** The text of the selection: after Tab in a table, the cell's own text. */
const selectedText = (page: Page) =>
  page.evaluate(() => globalThis.getSelection()?.toString() ?? '')

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

const focusIn = (locator: Locator) => expect(locator).toBeFocused()

test.describe('Rich text editor keyboard contract', () => {
  test('Tab goes to the toolbar, then the text, then the next field', async ({ page }) => {
    await openStory(page)
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Före'))
    await page.keyboard.press('Tab')
    // The toolbar is one Tab stop: its first control the first time.
    await focusIn(control(page, 'Ångra'))
    await page.keyboard.press('Tab')
    await focusIn(text(page))
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Efter'))
  })

  test('Shift+Tab on the toolbar goes to the previous focusable element', async ({ page }) => {
    await openStory(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Ångra'))
    await page.keyboard.press('Shift+Tab')
    await focusIn(control(page, 'Före'))
  })

  test('Escape on the toolbar hides an open tooltip and keeps focus', async ({ page }) => {
    await openStory(page)
    await text(page).click()
    await page.keyboard.press('Alt+F10')
    await focusIn(tabStop(page))
    // Arrow keys to Fetstil: focus that comes from the keyboard opens the control's tooltip at once.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await focusIn(control(page, 'Fetstil'))
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await focusIn(control(page, 'Fetstil'))
  })

  test('Escape on the toolbar goes back to the text at the selection', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Alt+F10')
    await focusIn(tabStop(page))
    await page.keyboard.press('Escape')
    // A tooltip that opened with the focus takes the first Escape: press again then.
    if (!(await text(page).evaluate((element) => element === document.activeElement))) {
      await page.keyboard.press('Escape')
    }
    await focusIn(text(page))
    await page.keyboard.type('!')
    await expect(text(page)).toContainText('Välkommen in.!')
  })

  test('Tab in a paragraph leaves forwards, and Shift+Tab goes back to the toolbar', async ({
    page,
  }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Efter'))
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Shift+Tab')
    await focusIn(tabStop(page))
  })

  test('Tab nests a list item, announces the level and keeps focus in the text', async ({
    page,
  }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Tab')
    await expect(text(page).locator('ul ul li')).toHaveCount(1)
    await focusIn(text(page))
    await expect.poll(announcements).toContain('Nivå 2')
  })

  test('Tab on the first list item leaves the editor', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Öppettider')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Efter'))
    await expect(text(page).locator('ul ul')).toHaveCount(0)
  })

  test('Shift+Tab outdents a nested list item and announces the level', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Tab')
    await expect(text(page).locator('ul ul li')).toHaveCount(1)
    const announcements = await recordAnnouncements(page)
    await page.keyboard.press('Shift+Tab')
    await expect(text(page).locator('ul ul')).toHaveCount(0)
    await focusIn(text(page))
    await expect.poll(announcements).toContain('Nivå 1')
  })

  test('Shift+Tab in a top-level list item goes to the toolbar and keeps the list', async ({
    page,
  }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Shift+Tab')
    await focusIn(tabStop(page))
    await expect(text(page).locator('ul > li')).toHaveCount(2)
  })

  test('Tab moves to the next table cell and selects its text', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('Dag', { exact: true }).click()
    await page.keyboard.press('Tab')
    await expect.poll(() => selectedText(page)).toBe('Öppnar')
    await focusIn(text(page))
    await page.keyboard.press('Tab')
    await expect.poll(() => selectedText(page)).toBe('Torsdag')
  })

  test('Tab in the last table cell leaves the editor and adds no row', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('10:00', { exact: true }).click()
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Efter'))
    await expect(text(page).locator('tr')).toHaveCount(2)
  })

  test('Shift+Tab moves to the previous table cell', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('Torsdag', { exact: true }).click()
    await page.keyboard.press('Shift+Tab')
    await expect.poll(() => selectedText(page)).toBe('Öppnar')
    await focusIn(text(page))
  })

  test('Shift+Tab in the first table cell goes to the toolbar', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('Dag', { exact: true }).click()
    await page.keyboard.press('Shift+Tab')
    await focusIn(tabStop(page))
  })

  test('Escape then Tab leaves the editor from a list item', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Efter'))
    // Tab would have nested the item: it left instead.
    await expect(text(page).locator('ul ul')).toHaveCount(0)
  })

  test('Escape then Shift+Tab goes to the toolbar from a list item', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Shift+Tab')
    await focusIn(tabStop(page))
    // Shift+Tab would have outdented the nested item: it left instead.
    await expect(text(page).locator('ul ul li')).toHaveCount(1)
  })

  test('Escape then another key cancels the way out', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Escape')
    await page.keyboard.type('x')
    await page.keyboard.press('Tab')
    await expect(text(page).locator('ul ul li')).toHaveCount(1)
    await expect(text(page)).toContainText('Lånx')
    await focusIn(text(page))
  })

  test('Alt+F10 moves focus to the toolbar', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('Biblioteket har öppet', { exact: false }).click()
    await page.keyboard.press('Alt+F10')
    await focusIn(tabStop(page))
    await expect(toolbar(page)).toHaveAttribute('aria-keyshortcuts', 'Alt+F10')
  })

  test('The arrow keys, Home and End move the caret in the text', async ({ page }) => {
    await openStory(page)
    await text(page).getByText('Biblioteket har öppet', { exact: false }).click()
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.type('X')
    await expect(text(page)).toContainText('BibXlioteket')
    await page.keyboard.press('End')
    await page.keyboard.type('Y')
    await expect(text(page)).toContainText('torsdagar.Y')
  })

  test('Enter starts a new paragraph and Shift+Enter a line break', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    const paragraphs = await text(page).locator(':scope > p').count()
    await page.keyboard.press('Enter')
    await page.keyboard.type('Ny')
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('Rad')
    await expect(text(page).locator(':scope > p')).toHaveCount(paragraphs + 1)
    await expect(text(page).locator('p br')).toHaveCount(1)
  })

  test('Control+B, I and U toggle the format and announce it', async ({ page }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Shift+Home')
    await selectionSettled(page)
    await page.keyboard.press('Control+b')
    await expect(text(page).locator('strong')).toHaveCount(1)
    await expect.poll(announcements).toContain('Fetstil på')
    await page.keyboard.press('Control+b')
    await expect(text(page).locator('strong')).toHaveCount(0)
    await expect.poll(announcements).toContain('Fetstil av')
    await page.keyboard.press('Control+i')
    await page.keyboard.press('Control+u')
    await expect(text(page).locator('em')).toHaveCount(1)
    await expect(text(page).locator('u')).toHaveCount(1)
  })

  test('Control+K opens the link form', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Shift+Home')
    await selectionSettled(page)
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'Lägg till länk' })).toBeVisible()
    await focusIn(page.getByRole('textbox', { name: 'Webbadress' }))
  })

  test('Control+Z undoes, and Control+Shift+Z and Control+Y redo', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.type('Z')
    await expect(text(page)).toContainText('Välkommen in.Z')
    await page.keyboard.press('Control+z')
    await expect(text(page)).not.toContainText('Välkommen in.Z')
    await page.keyboard.press('Control+Shift+z')
    await expect(text(page)).toContainText('Välkommen in.Z')
    await page.keyboard.press('Control+z')
    await expect(text(page)).not.toContainText('Välkommen in.Z')
    await page.keyboard.press('Control+y')
    await expect(text(page)).toContainText('Välkommen in.Z')
  })

  test('ArrowRight and ArrowLeft move between the toolbar controls and wrap', async ({ page }) => {
    await openStory(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Ångra'))
    await page.keyboard.press('ArrowRight')
    await focusIn(control(page, 'Gör om'))
    await page.keyboard.press('ArrowRight')
    await focusIn(page.getByRole('combobox', { name: 'Texttyp' }))
    await page.keyboard.press('ArrowRight')
    await focusIn(control(page, 'Fetstil'))
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    // From the first control back to the last one: the Table group's Rubrikrad.
    await page.keyboard.press('ArrowLeft')
    await focusIn(control(page, 'Rubrikrad'))
    await page.keyboard.press('ArrowRight')
    await focusIn(control(page, 'Ångra'))
  })

  test('Home and End on the toolbar go to its first and last control', async ({ page }) => {
    await openStory(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('End')
    await focusIn(control(page, 'Rubrikrad'))
    await page.keyboard.press('Home')
    await focusIn(control(page, 'Ångra'))
  })

  test('right to left: the toolbar arrows flip', async ({ page }) => {
    await openStory(page, 'rtl', 'locale:en;dir:rtl')
    await page.keyboard.press('Tab')
    await focusIn(control(page, 'Undo'))
    await page.keyboard.press('ArrowLeft')
    await focusIn(control(page, 'Redo'))
    await page.keyboard.press('ArrowRight')
    await focusIn(control(page, 'Undo'))
  })

  test('the picker opens with ArrowDown, Enter chooses, and focus goes back to the text', async ({
    page,
  }) => {
    await openStory(page)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const picker = page.getByRole('combobox', { name: 'Texttyp' })
    await focusIn(picker)
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Rubrik 2' })).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(text(page).locator('h2')).toHaveCount(1)
    await focusIn(text(page))
  })

  test('Enter on Öka indrag nests the item and focus stays on the button', async ({ page }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await caretAtEndOf(page, 'Lån')
    await page.keyboard.press('Alt+F10')
    await control(page, 'Öka indrag').focus()
    await page.keyboard.press('Enter')
    await expect(text(page).locator('ul ul li')).toHaveCount(1)
    await focusIn(control(page, 'Öka indrag'))
    await expect.poll(announcements).toContain('Nivå 2')
  })

  test('Enter on Länk opens the form with focus in its first field', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Shift+Home')
    await selectionSettled(page)
    await page.keyboard.press('Alt+F10')
    await control(page, 'Länk').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Lägg till länk' })).toBeVisible()
    await focusIn(page.getByRole('textbox', { name: 'Webbadress' }))
  })

  test('Enter in the link form adds the link and focus goes back to the text', async ({ page }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Shift+Home')
    await selectionSettled(page)
    await page.keyboard.press('Control+k')
    await focusIn(page.getByRole('textbox', { name: 'Webbadress' }))
    await page.keyboard.type('https://exempel.se')
    await page.keyboard.press('Enter')
    await expect(text(page).locator('a[href="https://exempel.se"]')).toHaveCount(1)
    await focusIn(text(page))
    await expect.poll(announcements).toContain('Länken är tillagd.')
  })

  test('Escape in the link form closes it and focus goes back to the text', async ({ page }) => {
    await openStory(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'Lägg till länk' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Lägg till länk' })).toHaveCount(0)
    await focusIn(text(page))
  })

  test('Enter on Tabell inserts a table and moves focus into it', async ({ page }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await caretAtEndOf(page, 'Välkommen in.')
    await page.keyboard.press('Alt+F10')
    await control(page, 'Tabell').focus()
    await page.keyboard.press('Enter')
    await expect(text(page).locator('table')).toHaveCount(2)
    await focusIn(text(page))
    await expect.poll(announcements).toContain('Tabell med 3 kolumner och 3 rader tillagd.')
  })

  test('Table group buttons work with Enter, and Ta bort tabellen moves focus to the text', async ({
    page,
  }) => {
    await openStory(page)
    const announcements = await recordAnnouncements(page)
    await text(page).getByText('Dag', { exact: true }).click()
    await page.keyboard.press('Alt+F10')
    await control(page, 'Lägg till rad nedanför').focus()
    await page.keyboard.press('Enter')
    await expect(text(page).locator('tr')).toHaveCount(3)
    await focusIn(control(page, 'Lägg till rad nedanför'))
    await control(page, 'Ta bort tabellen').focus()
    await page.keyboard.press('Enter')
    await expect(text(page).locator('table')).toHaveCount(0)
    await expect(page.getByRole('group', { name: 'Tabell' })).toHaveCount(0)
    await focusIn(text(page))
    await expect.poll(announcements).toContain('Tabellen är borttagen. Ångra med Ctrl+Z.')
  })
})

test.describe('Rich text editor display and axe', () => {
  const stories = [
    'default',
    'keyboard',
    'in-a-form',
    'invalid',
    'disabled',
    'read-only',
    'controlled-json',
    'custom-extension',
    'without-tables-and-images',
    'icon-and-text',
    'character-count',
    'long-finnish',
    'rtl',
    'forced-colors',
  ]
  for (const story of stories) {
    test(`${story} has no axe violations`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('the keyboard instruction is visible under the box, and a read-only editor has none', async ({
    page,
  }) => {
    await openStory(page)
    await expect(page.getByText('Lämna textfältet med Esc och sedan Tabb.')).toBeVisible()
    await openStory(page, 'read-only')
    await expect(page.getByText('Lämna textfältet')).toHaveCount(0)
    await expect(toolbar(page)).toHaveCount(0)
  })

  test('long Finnish names at 320px do not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await openStory(page, 'long-finnish')
    await expect(toolbar(page)).toBeVisible()
    const scrolls = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(scrolls).toBe(false)
  })

  test('a disabled editor is out of the Tab order', async ({ page }) => {
    await openStory(page, 'disabled')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox')).not.toBeFocused()
    await expect(toolbar(page).locator('button:not([disabled])')).toHaveCount(0)
  })
})
