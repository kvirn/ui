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

test.describe('Table: size, focus and the sticky head', () => {
  test('a row checkbox is a 24px box that a click on its centre toggles, in compact density (2.5.8)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openStory(page, 'selectable')
    const checkbox = rowCheckbox(page, 'Elle Sara')
    await expect(checkbox).toBeChecked()
    const box = await checkbox.boundingBox()
    expect(box?.width).toBe(24)
    expect(box?.height).toBe(24)
    await page.mouse.click((box?.x ?? 0) + 12, (box?.y ?? 0) + 12)
    await expect(checkbox).not.toBeChecked()
  })

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

  test('the head is sticky and the spacer rows draw nothing', async ({ page }) => {
    await openStory(page, 'virtualized')
    await expect(page.locator('.kv-table-head')).toHaveCSS('position', 'sticky')
    await expect(page.locator('table.kv-table')).toHaveCSS('table-layout', 'fixed')
    const spacer = page.locator('tr.kv-table-spacer > td').first()
    await expect(spacer).toHaveCSS('padding-top', '0px')
    await expect(spacer).toHaveCSS('border-top-width', '0px')
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
