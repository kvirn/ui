import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/tabs/tabs.a11y.md › Keyboard. One test per row, named after it. The
// Keyboard story is the fixture: a button before, the tabs (Uppgifter, Handlingar, a disabled
// Historik and Kontakt, whose Handlingar panel starts with a link and so has tabIndex -1) and a
// button after. Manual, Vertical and RTL are the other fixtures the rows drive.

const storyUrl = (story: string) => `/iframe.html?id=components-tabs--${story}&viewMode=story`

async function openStory(page: Page, story: string, listName = 'Ärendet') {
  await page.goto(storyUrl(story))
  const list = page.getByRole('tablist', { name: listName })
  await expect(list).toBeVisible()
  // One tab is selected, and it is the one Tab stop.
  await expect(list.getByRole('tab', { selected: true })).toHaveCount(1)
  await expect(list.locator('[role="tab"][tabindex="0"]')).toHaveCount(1)
  return list
}

const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true })
const panel = (page: Page, name: string) => page.getByRole('tabpanel', { name, exact: true })
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

/** The tab is focused, selected, and the only panel shown is its own. */
async function expectSelectedAndFocused(page: Page, name: string) {
  await expect(tab(page, name)).toBeFocused()
  await expect(tab(page, name)).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await expect(panel(page, name)).toBeVisible()
}

test.describe('Tabs keyboard contract', () => {
  test('Tab enters at the selected tab', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(button(page, 'Före')).toBeFocused()
    // The first time: the selected tab, which is the first here. The other tabs are not Tab stops.
    await page.keyboard.press('Tab')
    await expect(tab(page, 'Uppgifter')).toBeFocused()
    // Select the last tab, leave the list and come back: Tab enters at the selected tab, not the first.
    await page.keyboard.press('End')
    await expect(tab(page, 'Kontakt')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Shift+Tab')
    await expect(button(page, 'Före')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(tab(page, 'Kontakt')).toBeFocused()
  })

  test('Tab leaves the tab list for the panel', async ({ page }) => {
    await openStory(page, 'keyboard')
    await tab(page, 'Uppgifter').focus()
    await page.keyboard.press('Tab')
    // A panel is a Tab stop of its own, so the next Tab after the selected tab is its panel.
    await expect(panel(page, 'Uppgifter')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(button(page, 'Efter')).toBeFocused()

    // From a tab that is not selected. Historik is disabled: it takes focus, but the selected tab
    // is Kontakt, which comes after it in the list. Tab leaves the list for Kontakt's panel, and
    // doesn't move to the selected tab.
    await tab(page, 'Uppgifter').focus()
    await page.keyboard.press('End')
    await expectSelectedAndFocused(page, 'Kontakt')
    await page.keyboard.press('ArrowLeft')
    await expect(tab(page, 'Historik')).toBeFocused()
    await expect(tab(page, 'Kontakt')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Tab')
    await expect(panel(page, 'Kontakt')).toBeFocused()

    // A panel that starts with a link sets tabIndex -1: Tab goes straight to the link.
    await tab(page, 'Kontakt').focus()
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Handlingar')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Läs beslutet' })).toBeFocused()
    await expect(panel(page, 'Handlingar')).not.toBeFocused()
  })

  test('Shift+Tab returns to the selected tab and leaves the list', async ({ page }) => {
    await openStory(page, 'keyboard')
    await tab(page, 'Uppgifter').focus()
    await page.keyboard.press('Tab')
    await expect(panel(page, 'Uppgifter')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(tab(page, 'Uppgifter')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(button(page, 'Före')).toBeFocused()
  })

  test('ArrowRight and ArrowLeft move, wrap and select', async ({ page }) => {
    await openStory(page, 'keyboard')
    await tab(page, 'Uppgifter').focus()
    // From the first tab ArrowLeft wraps to the last: it is selected, and its panel shows.
    await page.keyboard.press('ArrowLeft')
    await expectSelectedAndFocused(page, 'Kontakt')
    // From the last tab ArrowRight wraps to the first.
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Uppgifter')
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Handlingar')
    await page.keyboard.press('ArrowLeft')
    await expectSelectedAndFocused(page, 'Uppgifter')
  })

  test('right to left: the arrows flip', async ({ page }) => {
    await openStory(page, 'rtl', 'Case')
    await tab(page, 'Details').focus()
    // ArrowLeft is the next tab, and ArrowRight the previous.
    await page.keyboard.press('ArrowLeft')
    await expectSelectedAndFocused(page, 'Documents')
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Details')
    // It wraps the flipped way: ArrowRight from the first tab goes to the last.
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Contact')
  })

  test('vertical: ArrowDown and ArrowUp move', async ({ page }) => {
    await openStory(page, 'vertical', 'Inställningar')
    await expect(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    await tab(page, 'Konto').focus()
    await page.keyboard.press('ArrowDown')
    await expectSelectedAndFocused(page, 'Behörigheter')
    // Left and Right are not taken in a vertical list.
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Behörigheter')
    await page.keyboard.press('ArrowUp')
    await expectSelectedAndFocused(page, 'Konto')
    // They don't flip, and they wrap.
    await page.keyboard.press('ArrowUp')
    await expectSelectedAndFocused(page, 'Aviseringar')
    await page.keyboard.press('ArrowDown')
    await expectSelectedAndFocused(page, 'Konto')
  })

  test('Home and End go to the ends', async ({ page }) => {
    await openStory(page, 'keyboard')
    await tab(page, 'Uppgifter').focus()
    await page.keyboard.press('End')
    await expectSelectedAndFocused(page, 'Kontakt')
    await page.keyboard.press('Home')
    await expectSelectedAndFocused(page, 'Uppgifter')
  })

  test('manual activation: arrows move focus, Enter and Space select', async ({ page }) => {
    await openStory(page, 'manual', 'Granskning')
    await tab(page, 'Handlingar').focus()
    await page.keyboard.press('ArrowLeft')
    // Focus moved and nothing was selected: Handlingar is still the selected tab, with its panel.
    await expect(tab(page, 'Översikt')).toBeFocused()
    await expect(tab(page, 'Översikt')).toHaveAttribute('aria-selected', 'false')
    await expect(tab(page, 'Handlingar')).toHaveAttribute('aria-selected', 'true')
    await expect(panel(page, 'Handlingar')).toBeVisible()
    await page.keyboard.press('Enter')
    await expectSelectedAndFocused(page, 'Översikt')
    // Space selects too, and Home and End only move focus.
    await page.keyboard.press('End')
    await expect(tab(page, 'Beslut')).toBeFocused()
    await expect(tab(page, 'Beslut')).toHaveAttribute('aria-selected', 'false')
    await expect(tab(page, 'Översikt')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press(' ')
    await expectSelectedAndFocused(page, 'Beslut')
    await page.keyboard.press('Home')
    await expect(tab(page, 'Översikt')).toBeFocused()
    await expect(tab(page, 'Beslut')).toHaveAttribute('aria-selected', 'true')
  })

  test('a disabled tab is reachable and never selected', async ({ page }) => {
    await openStory(page, 'keyboard')
    await tab(page, 'Uppgifter').focus()
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Handlingar')
    await page.keyboard.press('ArrowRight')
    const history = tab(page, 'Historik')
    await expect(history).toBeFocused()
    await expect(history).toHaveAttribute('aria-disabled', 'true')
    await expect(history).toHaveAttribute('aria-selected', 'false')
    // Focus is on it, and the selection stayed where it was.
    await expect(tab(page, 'Handlingar')).toHaveAttribute('aria-selected', 'true')
    await expect(panel(page, 'Handlingar')).toBeVisible()
    await page.keyboard.press('Enter')
    await page.keyboard.press(' ')
    await history.click({ force: true })
    await expect(history).toHaveAttribute('aria-selected', 'false')
    await expect(tab(page, 'Handlingar')).toHaveAttribute('aria-selected', 'true')
    await expect(panel(page, 'Handlingar')).toBeVisible()
    // It doesn't stop the arrows.
    await page.keyboard.press('ArrowRight')
    await expectSelectedAndFocused(page, 'Kontakt')
  })
})

test.describe('Tabs focus and modes', () => {
  test('a key-focused tab and panel show a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'default')
    await page.keyboard.press('Tab')
    const selected = tab(page, 'Uppgifter')
    await expect(selected).toBeFocused()
    expect(await selected.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
    await page.keyboard.press('Tab')
    const selectedPanel = panel(page, 'Uppgifter')
    await expect(selectedPanel).toBeFocused()
    expect(
      await selectedPanel.evaluate((element) => getComputedStyle(element).outlineStyle),
    ).not.toBe('none')
  })

  test('no horizontal scrolling at 320px with the Finnish labels (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-text', 'Rakennuslupa')
    await expect(tab(page, 'Rakennus- ja toimenpidelupahakemuksen liitteet')).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Tabs accessibility', () => {
  test('a11y tree of the tab list', async ({ page }) => {
    await openStory(page, 'default')
    await expect(page.getByRole('tablist', { name: 'Ärendet' })).toMatchAriaSnapshot(`
      - tablist "Ärendet":
        - tab "Uppgifter" [selected]
        - tab "Handlingar"
        - tab "Historik"
    `)
    await expect(panel(page, 'Uppgifter')).toBeVisible()
  })

  const stories = [
    ['default', 'Ärendet'],
    ['keyboard', 'Ärendet'],
    ['manual', 'Granskning'],
    ['vertical', 'Inställningar'],
    ['disabled-tab', 'Ansökan'],
    ['controlled', 'Ärendet'],
    ['long-finnish-text', 'Rakennuslupa'],
    ['compact-density', 'Ärendet'],
    ['in-a-card', 'Ärendet'],
    ['rtl', 'Case'],
    ['forced-colors', 'Ärendet'],
  ] as const

  for (const [story, listName] of stories) {
    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, listName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
