import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/table/table.a11y.md › Keyboard, Focus management and Visual / modes.
// One test per Keyboard row, named after it. The Keyboard story is the fixture for the key rows:
// a region narrower than the table, select all, sortable headers, and in each row a checkbox, an
// expand button and a link. Virtualized is the fixture for the scroll and focus rows of a tall
// table. The baseline projects (forced colours, reduced motion, 320px) run every test when enabled
// with `E2E_BROWSERS=sweep`, set on `playwright test` directly.

const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-table--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('table.kv-table').first()).toBeVisible()
}

const region = (page: Page) => page.locator('.kv-table-scroll-region').first()
const status = (page: Page) => page.locator('output[aria-live="polite"]')
const sortButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const rowCheckbox = (page: Page, name: string) =>
  page.getByRole('checkbox', { name: `Välj ${name}`, exact: true })
const selectAll = (page: Page) =>
  page.getByRole('checkbox', { name: 'Välj alla rader', exact: true })
const expandButton = (page: Page, name: string) =>
  page.getByRole('button', { name: `Detaljer ${name}`, exact: true })

/** The scroll position of the region, as the keys move it. */
const scrollOf = (target: Locator) =>
  target.evaluate((element) => ({ top: element.scrollTop, left: element.scrollLeft }))

/** Waits until the region is a Tab stop: the table overflows and the state has caught up. */
const waitForTabStop = (page: Page) => expect(region(page)).toHaveAttribute('tabindex', '0')

/**
 * Scrolls a link of a static table to just under the sticky head, and focuses it: the browser has to
 * bring it out from under the head (2.4.11). A link that is out of view altogether would be centred
 * by any browser, so it is put where it is in view but covered.
 */
async function expectFocusedLinkClearOfHead(page: Page) {
  const link = page.locator('.kv-table-body a').nth(5)
  await link.evaluate((element) => {
    const scroller = element.closest('.kv-table-scroll-region')
    if (scroller === null) throw new Error('no region')
    const offset = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    scroller.scrollTop += offset - 2
  })
  const gapUnderHead = async () => {
    const head = await page.locator('.kv-table-head').boundingBox()
    const box = await link.boundingBox()
    if (head === null || box === null) throw new Error('no box')
    return box.y - (head.y + head.height)
  }
  // The set-up: the link is in the region and the head covers it.
  expect(await gapUnderHead()).toBeLessThan(0)
  await link.focus()
  await expect(link).toBeFocused()
  await expect.poll(gapUnderHead).toBeGreaterThanOrEqual(-1)
}

test.describe('Table: Keyboard', () => {
  test('Tab focuses the scroll region when the table overflows', async ({ page }) => {
    await openStory(page, 'keyboard')
    await waitForTabStop(page)
    await page.keyboard.press('Tab')
    await expect(region(page)).toBeFocused()
    await expect(page.getByRole('region', { name: 'Öppna ärenden' })).toBeFocused()
  })

  test('Tab skips the scroll region when nothing scrolls', async ({ page }) => {
    await openStory(page, 'sortable')
    await expect(region(page)).not.toHaveAttribute('tabindex')
    await page.keyboard.press('Tab')
    await expect(region(page)).not.toBeFocused()
    await expect(sortButton(page, 'Namn')).toBeFocused()
  })

  test('Tab moves through the controls in reading order', async ({ page }) => {
    await openStory(page, 'keyboard')
    await waitForTabStop(page)
    const inOrder = [
      region(page),
      selectAll(page),
      sortButton(page, 'Namn'),
      sortButton(page, 'Ärendenummer'),
      sortButton(page, 'Inkommet'),
      sortButton(page, 'Belopp (kr)'),
      rowCheckbox(page, 'Anna Svensson'),
      expandButton(page, 'Anna Svensson'),
      page.getByRole('link', { name: 'Anna Svensson' }),
      rowCheckbox(page, 'Matti Virtanen'),
    ]
    for (const control of inOrder) {
      await page.keyboard.press('Tab')
      await expect(control).toBeFocused()
    }
  })

  test('Shift+Tab moves back through the controls', async ({ page }) => {
    await openStory(page, 'keyboard')
    await waitForTabStop(page)
    await sortButton(page, 'Namn').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(selectAll(page)).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(region(page)).toBeFocused()
  })

  test('Enter on a sort button sorts the column and announces it', async ({ page }) => {
    await openStory(page, 'keyboard')
    await sortButton(page, 'Namn').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('th[aria-sort="ascending"]')).toHaveText('Namn')
    await expect(status(page)).toHaveText('Sorterad efter Namn, stigande.')
    // Focus stays on the button while the rows move under it.
    await expect(sortButton(page, 'Namn')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('th[aria-sort="descending"]')).toHaveText('Namn')
    await expect(status(page)).toHaveText('Sorterad efter Namn, fallande.')
    await page.keyboard.press('Enter')
    await expect(page.locator('th[aria-sort]')).toHaveCount(0)
    await expect(status(page)).toHaveText('Inte längre sorterad efter Namn.')
  })

  test('Space on a sort button sorts the column', async ({ page }) => {
    await openStory(page, 'keyboard')
    await sortButton(page, 'Ärendenummer').focus()
    await page.keyboard.press('Space')
    await expect(page.locator('th[aria-sort="ascending"]')).toHaveText('Ärendenummer')
    // Only one column is sorted: a second one replaces the first.
    await sortButton(page, 'Inkommet').focus()
    await page.keyboard.press('Space')
    await expect(page.locator('th[aria-sort]')).toHaveCount(1)
    await expect(page.locator('th[aria-sort]')).toHaveText('Inkommet')
  })

  test('Space on a row checkbox selects the row', async ({ page }) => {
    await openStory(page, 'keyboard')
    const checkbox = rowCheckbox(page, 'Anna Svensson')
    await checkbox.focus()
    await page.keyboard.press('Space')
    await expect(checkbox).toBeChecked()
    await expect(page.locator('tr[data-selected]')).toHaveCount(1)
    await expect(page.locator('[aria-selected]')).toHaveCount(0)
    await expect(checkbox).toBeFocused()
    await page.keyboard.press('Space')
    await expect(checkbox).not.toBeChecked()
    await expect(page.locator('tr[data-selected]')).toHaveCount(0)
  })

  test('Space on select-all selects every row and announces the count', async ({ page }) => {
    await openStory(page, 'keyboard')
    await selectAll(page).focus()
    await page.keyboard.press('Space')
    await expect(page.locator('tr[data-selected]')).toHaveCount(5)
    await expect(selectAll(page)).toBeChecked()
    await expect(status(page)).toHaveText('5 rader markerade.')
    await page.keyboard.press('Space')
    await expect(page.locator('tr[data-selected]')).toHaveCount(0)
    await expect(status(page)).toHaveText('0 rader markerade.')
  })

  test('Enter on an expand button shows the details', async ({ page }) => {
    await openStory(page, 'keyboard')
    const button = expandButton(page, 'Anna Svensson')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const controlled = await button.getAttribute('aria-controls')
    await expect(page.locator(`[id="${controlled}"]`)).toBeVisible()
    await expect(button).toBeFocused()
  })

  test('Space on an expand button hides the details', async ({ page }) => {
    await openStory(page, 'keyboard')
    const button = expandButton(page, 'Matti Virtanen')
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.kv-table-detail-row')).toHaveCount(1)
    await page.keyboard.press('Space')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('.kv-table-detail-row')).toHaveCount(0)
    await expect(button).toBeFocused()
  })

  test('A focused row stays rendered while the virtualized table scrolls', async ({ page }) => {
    await openStory(page, 'virtualized')
    const checkbox = rowCheckbox(page, 'Elle Sara 3')
    await expect(checkbox).toBeVisible()
    await checkbox.focus()
    await expect(checkbox).toBeFocused()
    await region(page).evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect(page.locator('tbody tr[aria-rowindex="10001"]')).toBeAttached()
    // Thousands of rows stay out of the DOM, and the focused one stays in it.
    expect(await page.locator('.kv-table-body > tr:not([aria-hidden])').count()).toBeLessThan(100)
    await expect(checkbox).toBeAttached()
    await expect(checkbox).toBeFocused()
    await expect(page.locator('tbody tr[aria-rowindex="4"]')).toBeAttached()

    // Tab leaves the kept row for the next control, which is in the rows now in view: never body.
    await page.keyboard.press('Tab')
    await expect(page.locator('tbody tr:has(:focus)')).toBeAttached()
    const focusedIndex = await page.locator('tbody tr:has(:focus)').getAttribute('aria-rowindex')
    expect(Number(focusedIndex)).toBeGreaterThan(1000)
    // The row is released once focus has left it, so Shift+Tab goes back to the previous control
    // that is rendered, in the rows in view: never body.
    await expect(checkbox).not.toBeAttached()
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('tbody tr:has(:focus)')).toBeAttached()
    const previousIndex = await page.locator('tbody tr:has(:focus)').getAttribute('aria-rowindex')
    expect(Number(previousIndex)).toBeGreaterThan(1000)
    expect(Number(previousIndex)).toBeLessThan(Number(focusedIndex))
  })

  test('ArrowDown scrolls the focused scroll region', async ({ page }) => {
    await openStory(page, 'virtualized')
    await waitForTabStop(page)
    await region(page).focus()
    const before = await scrollOf(region(page))
    await page.keyboard.press('ArrowDown')
    await expect.poll(async () => (await scrollOf(region(page))).top).toBeGreaterThan(before.top)
  })

  test('ArrowRight scrolls the focused scroll region sideways', async ({ page }) => {
    await openStory(page, 'keyboard')
    await waitForTabStop(page)
    await region(page).focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => (await scrollOf(region(page))).left).toBeGreaterThan(0)
  })

  test('ArrowLeft scrolls the scroll region sideways in right-to-left', async ({ page }) => {
    await openStory(page, 'keyboard', 'dir:rtl')
    await waitForTabStop(page)
    await region(page).focus()
    // In right to left the start edge is at the right, and scrolling forward goes negative.
    await page.keyboard.press('ArrowLeft')
    await expect.poll(async () => (await scrollOf(region(page))).left).toBeLessThan(0)
  })

  test('PageDown scrolls the focused scroll region a page', async ({ page }) => {
    await openStory(page, 'virtualized')
    await waitForTabStop(page)
    await region(page).focus()
    await page.keyboard.press('PageDown')
    await expect.poll(async () => (await scrollOf(region(page))).top).toBeGreaterThan(100)
  })

  test('Escape and letters do nothing', async ({ page }) => {
    await openStory(page, 'keyboard')
    const button = sortButton(page, 'Namn')
    await button.focus()
    for (const key of ['Escape', 'a', 'x', 'Home', 'End']) {
      await page.keyboard.press(key)
    }
    await expect(button).toBeFocused()
    await expect(page.locator('th[aria-sort]')).toHaveCount(0)
    await expect(page.locator('tr[data-selected]')).toHaveCount(0)
    await expect(status(page)).toHaveText('')
  })
})

test.describe('Table: the sticky head and reflow', () => {
  test('the sticky head never covers a focused control (2.4.11)', async ({ page }) => {
    await openStory(page, 'virtualized')
    await expect(page.locator('.kv-table-body > tr:not([aria-hidden])').first()).toBeVisible()
    await region(page).evaluate((element) => {
      element.scrollTop = 5000
    })
    const first = page
      .locator('.kv-table-body > tr:not([aria-hidden]) input[type="checkbox"]')
      .first()
    await expect(first).toBeAttached()
    await expect.poll(async () => (await scrollOf(region(page))).top).toBeGreaterThan(4000)
    await first.focus()
    // Focusing scrolls the region, and the virtualizer re-renders after the scroll: poll until it settles.
    const gapUnderHead = async () => {
      const head = await page.locator('.kv-table-head').boundingBox()
      const control = await page.locator(':focus').boundingBox()
      if (head === null || control === null) throw new Error('no box')
      return control.y - (head.y + head.height)
    }
    await expect.poll(gapUnderHead).toBeGreaterThanOrEqual(-1)
  })

  test('the sticky head never covers a focused link in a static table (2.4.11)', async ({
    page,
  }) => {
    await openStory(page, 'static-scrolling')
    await waitForTabStop(page)
    await expectFocusedLinkClearOfHead(page)
  })

  test('the sticky head of a table that mounts after the region never covers a focused link (2.4.11)', async ({
    page,
  }) => {
    await openStory(page, 'static-late-head')
    await expect(page.locator('.kv-table-head')).toBeVisible()
    await waitForTabStop(page)
    await expectFocusedLinkClearOfHead(page)
  })

  test('forced colours: the sticky head ends in a line the rows can be told from (1.4.11)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'static-scrolling')
    await waitForTabStop(page)
    // A threshold, not a theme value: the line is drawn, and it is not the colour of the head's own fill.
    const line = await page
      .locator('.kv-table-head th')
      .first()
      .evaluate((cell) => {
        const style = getComputedStyle(cell)
        return {
          width: Number.parseFloat(style.borderBottomWidth),
          style: style.borderBottomStyle,
          color: style.borderBottomColor,
          fill: style.backgroundColor,
        }
      })
    expect(line.width).toBeGreaterThan(0)
    expect(line.style).not.toBe('none')
    expect(line.color).not.toBe(line.fill)
  })

  test('no horizontal scrolling at 320px: only the region scrolls (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'narrow-screen')
    const named = page.getByRole('region', { name: 'Avoimet asiat' })
    await expect(named).toHaveAttribute('tabindex', '0')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false)
    expect(await named.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
  })
})

test.describe('Table: accessibility', () => {
  for (const story of [
    'static',
    'always-region',
    'static-scrolling',
    'static-late-head',
    'sortable',
    'selectable',
    'expandable',
    'empty',
    'loading',
    'paginated-recipe',
    'virtualized',
    'narrow-screen',
    'right-to-left',
    'forced-colors',
    'keyboard',
  ]) {
    test(`no axe violations on ${story}`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
