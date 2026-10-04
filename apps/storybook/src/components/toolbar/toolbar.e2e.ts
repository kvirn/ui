import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/toolbar/toolbar.a11y.md › Keyboard. One test per row,
// named after it. The Keyboard story is the fixture: a button before, the toolbar (Ångra, a
// disabled Gör om, Fet, Kursiv, the Texttyp Listbox, the Länk Popover), a button after and a counter.

const storyUrl = (story: string) => `/iframe.html?id=components-toolbar--${story}&viewMode=story`

async function openStory(page: Page, story: string, toolbarName = 'Formatering') {
  await page.goto(storyUrl(story))
  const toolbar = page.getByRole('toolbar', { name: toolbarName })
  await expect(toolbar).toBeVisible()
  // The controls register after the first render: wait until one is the Tab stop.
  await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1)
  return toolbar
}

const control = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

/** Tab to the button before the toolbar, and on into the toolbar: its first control has focus. */
async function enterToolbar(page: Page, firstName: string) {
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(control(page, firstName)).toBeFocused()
}

test.describe('Toolbar keyboard contract', () => {
  test('Tab enters at the last focused control and leaves the toolbar', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(control(page, 'Före')).toBeFocused()
    // The first time: the first control.
    await page.keyboard.press('Tab')
    await expect(control(page, 'Ångra')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Kursiv')).toBeFocused()
    // The next Tab leaves the toolbar: one Tab stop.
    await page.keyboard.press('Tab')
    await expect(control(page, 'Efter')).toBeFocused()
    // Back in, at the control that last had focus.
    await page.keyboard.press('Shift+Tab')
    await expect(control(page, 'Kursiv')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(control(page, 'Före')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(control(page, 'Kursiv')).toBeFocused()
  })

  test('ArrowRight and ArrowLeft move and wrap', async ({ page }) => {
    await openStory(page, 'keyboard')
    await enterToolbar(page, 'Ångra')
    // Across groups and controls: the disabled Gör om is reached, then the toggles, the Listbox and the Popover.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Gör om')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Fet')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Kursiv')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('combobox', { name: 'Texttyp' })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Länk')).toBeFocused()
    // From the last control to the first, and back.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Ångra')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(control(page, 'Länk')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('combobox', { name: 'Texttyp' })).toBeFocused()
  })

  test('right to left: the arrows flip', async ({ page }) => {
    await openStory(page, 'rtl', 'Formatting')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(control(page, 'Undo')).toBeFocused()
    // ArrowLeft is the next control, and ArrowRight the previous.
    await page.keyboard.press('ArrowLeft')
    await expect(control(page, 'Redo')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(control(page, 'Bold')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Redo')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Undo')).toBeFocused()
    // It wraps the flipped way: ArrowRight from the first control goes to the last.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Link')).toBeFocused()
  })

  test('vertical: ArrowDown and ArrowUp move', async ({ page }) => {
    await openStory(page, 'vertical', 'Åtgärder för raden')
    await page.keyboard.press('Tab')
    await expect(control(page, 'Flytta upp')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(control(page, 'Flytta ned')).toBeFocused()
    // Left and Right are not taken in a vertical toolbar.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Flytta ned')).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(control(page, 'Ta bort')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(control(page, 'Flytta upp')).toBeFocused()
  })

  test('Home and End go to the ends', async ({ page }) => {
    await openStory(page, 'keyboard')
    await enterToolbar(page, 'Ångra')
    await page.keyboard.press('End')
    await expect(control(page, 'Länk')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(control(page, 'Ångra')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('End')
    await expect(control(page, 'Länk')).toBeFocused()
  })

  test('Enter and Space activate and focus stays', async ({ page }) => {
    await openStory(page, 'keyboard')
    await enterToolbar(page, 'Ångra')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Antal åtgärder: 1')).toBeVisible()
    await page.keyboard.press(' ')
    await expect(page.getByText('Antal åtgärder: 2')).toBeVisible()
    await expect(control(page, 'Ångra')).toBeFocused()
    // A toggle switches aria-pressed, keeps its name and keeps focus.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const bold = control(page, 'Fet')
    await expect(bold).toBeFocused()
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Enter')
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press(' ')
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await expect(bold).toBeFocused()
  })

  test('a disabled control is reachable and inert', async ({ page }) => {
    await openStory(page, 'keyboard')
    await enterToolbar(page, 'Ångra')
    await page.keyboard.press('ArrowRight')
    const redo = control(page, 'Gör om')
    await expect(redo).toBeFocused()
    await expect(redo).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Enter')
    await page.keyboard.press(' ')
    await expect(page.getByText('Antal åtgärder: 0')).toBeVisible()
    await expect(redo).toBeFocused()
    // It doesn't stop the arrows.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Fet')).toBeFocused()
  })

  test("an item's own keys win, and Left and Right still move", async ({ page }) => {
    await openStory(page, 'keyboard')
    await enterToolbar(page, 'Ångra')
    for (let presses = 0; presses < 4; presses += 1) {
      await page.keyboard.press('ArrowRight')
    }
    const blockType = page.getByRole('combobox', { name: 'Texttyp' })
    await expect(blockType).toBeFocused()
    // ArrowDown opens the Listbox, and focus stays on its trigger.
    await page.keyboard.press('ArrowDown')
    await expect(blockType).toHaveAttribute('aria-expanded', 'true')
    await expect(blockType).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(blockType).toHaveAttribute('aria-expanded', 'false')
    // Home on the closed Listbox opens it, as its contract says: it doesn't go to the first control.
    await page.keyboard.press('Home')
    await expect(blockType).toHaveAttribute('aria-expanded', 'true')
    await expect(blockType).toBeFocused()
    await page.keyboard.press('Escape')
    // Left and Right still move.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Länk')).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(blockType).toBeFocused()
  })
})

test.describe('Toolbar accessibility', () => {
  const stories = [
    ['default', 'Formatering'],
    ['keyboard', 'Formatering'],
    ['vertical', 'Åtgärder för raden'],
    ['wrapping', 'Muotoilu'],
    ['compact-density', 'Formatering'],
    ['rtl', 'Formatting'],
    ['forced-colors', 'Formatering'],
  ] as const

  for (const [story, toolbarName] of stories) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await openStory(page, story, toolbarName)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, toolbarName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
