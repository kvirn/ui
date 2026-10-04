import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/tooltip/tooltip.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per row, named after it. The tooltip is the browser's own `popover`
// element, so "open" is `:popover-open`, and `getByRole('tooltip')` only finds an open one. The
// keyboard fixture is a toolbar (Ångra, Gör om (disabled), Fetstil, Kursiv, Länk) between two buttons.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-tooltip--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-tooltip').first()).toBeAttached()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
  // An open tooltip fades in: let it finish before axe samples colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
}

/** Whether the open tooltip and the story's first button (its trigger) overlap (2.4.11). */
async function coversTrigger(page: Page): Promise<boolean> {
  const popupBox = await page.locator('.kv-tooltip').boundingBox()
  const triggerBox = await page.locator('.kv-button').first().boundingBox()
  if (popupBox === null || triggerBox === null) {
    throw new Error('the tooltip or its trigger has no box')
  }
  return (
    popupBox.x < triggerBox.x + triggerBox.width &&
    popupBox.x + popupBox.width > triggerBox.x &&
    popupBox.y < triggerBox.y + triggerBox.height &&
    popupBox.y + popupBox.height > triggerBox.y
  )
}

/** Whether the tooltip's last character is painted and hit-testable at its place: nothing clipped it. */
function lastCharacterIsVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const popup = document.querySelector('.kv-tooltip')
    if (popup === null) {
      return false
    }
    const walker = document.createTreeWalker(popup, NodeFilter.SHOW_TEXT)
    let last: Text | undefined
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if ((node.textContent ?? '').trim() !== '') {
        last = node as Text
      }
    }
    if (last === undefined) {
      return false
    }
    const range = document.createRange()
    const end = (last.textContent ?? '').trimEnd().length
    range.setStart(last, end - 1)
    range.setEnd(last, end)
    const rect = range.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
    return hit !== null && popup.contains(hit)
  })
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

const control = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
/** The open tooltip with this text. Only an open (not `display: none`) tooltip is in the accessibility tree. */
const tooltip = (page: Page, text: string) => page.getByRole('tooltip').filter({ hasText: text })
const anyTooltip = (page: Page) => page.getByRole('tooltip')
const isShown = (popup: Locator) => popup.evaluate((element) => element.matches(':popover-open'))

/** "At once" is well under the 500 ms hover delay. */
const atOnce = { timeout: 300 }

/** Listens for keys that a page handler cancelled, after every handler in the page has run. */
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

/** Tab into the toolbar of the Keyboard story: the first control, Ångra, with its tooltip open. */
async function tabIntoToolbar(page: Page) {
  await openStory(page, 'keyboard')
  await control(page, 'Före').focus()
  await page.keyboard.press('Tab')
  await expect(control(page, 'Ångra')).toBeFocused()
}

test.describe('Tooltip keyboard contract', () => {
  test('Tab focuses the trigger and its tooltip opens at once', async ({ page }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
  })

  test('Shift+Tab leaves the trigger and its tooltip closes', async ({ page }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
    await page.keyboard.press('Shift+Tab')
    await expect(control(page, 'Före')).toBeFocused()
    await expect(anyTooltip(page)).toHaveCount(0)
  })

  test('arrowing along a toolbar shows each tooltip at once', async ({ page }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
    // A disabled control stays focusable, so its tooltip opens too.
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Gör om')).toBeFocused()
    await expect(tooltip(page, 'Gör om')).toBeVisible(atOnce)
    await expect(anyTooltip(page)).toHaveCount(1)
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Fetstil')).toBeFocused()
    await expect(tooltip(page, 'Fetstil')).toBeVisible(atOnce)
    await expect(anyTooltip(page)).toHaveCount(1)
    await page.keyboard.press('ArrowRight')
    await expect(control(page, 'Kursiv')).toBeFocused()
    await expect(tooltip(page, 'Kursiv')).toBeVisible(atOnce)
    await expect(anyTooltip(page)).toHaveCount(1)
    // Tab never stops on a tooltip: it leaves the toolbar for the next control.
    await page.keyboard.press('Tab')
    await expect(control(page, 'Efter')).toBeFocused()
    await expect(anyTooltip(page)).toHaveCount(0)
  })

  test('right to left: arrowing along a toolbar shows each tooltip at once', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await control(page, 'Before').focus()
    await page.keyboard.press('Tab')
    await expect(control(page, 'Undo')).toBeFocused()
    await expect(tooltip(page, 'Undo')).toBeVisible(atOnce)
    // The toolbar's arrows flip: ArrowLeft is the next control.
    await page.keyboard.press('ArrowLeft')
    await expect(control(page, 'Redo')).toBeFocused()
    await expect(tooltip(page, 'Redo')).toBeVisible(atOnce)
    await page.keyboard.press('ArrowLeft')
    await expect(control(page, 'Bold')).toBeFocused()
    await expect(tooltip(page, 'Bold')).toBeVisible(atOnce)
    await expect(anyTooltip(page)).toHaveCount(1)
  })

  test('Enter and Space activate the trigger and the tooltip stays', async ({ page }) => {
    await tabIntoToolbar(page)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    const bold = control(page, 'Fetstil')
    await expect(bold).toBeFocused()
    await expect(tooltip(page, 'Fetstil')).toBeVisible(atOnce)
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Enter')
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await expect(bold).toBeFocused()
    await expect(tooltip(page, 'Fetstil')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    // Past the hover delay too: nothing closes it while focus is there.
    await page.waitForTimeout(700)
    await expect(tooltip(page, 'Fetstil')).toBeVisible()
  })

  test('a trigger that opens a popup closes its tooltip while the popup is open', async ({
    page,
  }) => {
    await tabIntoToolbar(page)
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('ArrowRight')
    }
    const link = control(page, 'Länk')
    await expect(link).toBeFocused()
    await expect(tooltip(page, 'Länk')).toBeVisible(atOnce)
    await page.keyboard.press('Enter')
    await expect(link).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(() => isShown(page.locator('.kv-popover-popup'))).toBe(true)
    await expect(anyTooltip(page)).toHaveCount(0)
    await page.waitForTimeout(700)
    await expect(anyTooltip(page)).toHaveCount(0)
    await expect(link).toBeFocused()
  })

  test('Escape hides the tooltip and focus stays', async ({ page }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
    await page.keyboard.press('Escape')
    await expect(anyTooltip(page)).toHaveCount(0)
    await expect(control(page, 'Ångra')).toBeFocused()
  })

  test('Escape closes only the tooltip when a popover is open underneath', async ({ page }) => {
    await openStory(page, 'under-a-popover')
    const popover = page.locator('.kv-popover-popup')
    await page.getByRole('button', { name: 'Fler åtgärder', exact: true }).click()
    await expect.poll(() => isShown(popover)).toBe(true)
    await page.keyboard.press('Tab')
    await expect(control(page, 'Kopiera')).toBeFocused()
    await expect(tooltip(page, 'Kopiera')).toBeVisible(atOnce)

    await page.keyboard.press('Escape')
    await expect(anyTooltip(page)).toHaveCount(0)
    expect(await isShown(popover)).toBe(true)
    await expect(control(page, 'Kopiera')).toBeFocused()

    // The next Escape belongs to the Popover.
    await page.keyboard.press('Escape')
    await expect.poll(() => isShown(popover)).toBe(false)
  })

  test('after Escape the tooltip stays hidden until focus leaves and comes back', async ({
    page,
  }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
    await page.keyboard.press('Escape')
    await expect(anyTooltip(page)).toHaveCount(0)
    await page.waitForTimeout(700)
    await expect(anyTooltip(page)).toHaveCount(0)
    await page.keyboard.press('Tab')
    await expect(control(page, 'Efter')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    // Back in the toolbar, at the control that last had focus.
    await expect(control(page, 'Ångra')).toBeFocused()
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
  })

  test('Escape does nothing when no tooltip is open', async ({ page }) => {
    await openStory(page, 'keyboard')
    const prevented = await recordPreventedKeys(page)
    await control(page, 'Före').focus()
    await page.keyboard.press('Escape')
    await expect(anyTooltip(page)).toHaveCount(0)
    await expect(control(page, 'Före')).toBeFocused()
    expect(await prevented()).toEqual([])
  })

  test('hover opens the tooltip after the delay', async ({ page }) => {
    await openStory(page, 'keyboard')
    const start = Date.now()
    await control(page, 'Kursiv').hover()
    await expect(tooltip(page, 'Kursiv')).toBeVisible({ timeout: 3000 })
    // Half a second of rest, not at once: a pointer passing over a toolbar flashes nothing.
    expect(Date.now() - start).toBeGreaterThanOrEqual(450)
    // Hovering moves no focus.
    await expect(control(page, 'Kursiv')).not.toBeFocused()
  })

  test('the pointer can move onto the tooltip and it stays (hoverable)', async ({ page }) => {
    await openStory(page, 'keyboard')
    await control(page, 'Kursiv').hover()
    const popup = tooltip(page, 'Kursiv')
    await expect(popup).toBeVisible({ timeout: 3000 })
    const box = await popup.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(
      (box?.x ?? 0) + (box?.width ?? 0) / 2,
      (box?.y ?? 0) + (box?.height ?? 0) / 2,
      {
        steps: 12,
      },
    )
    // Well past the 100 ms grace: the pointer is on the tooltip, so it stays (1.4.13 persistent).
    await page.waitForTimeout(500)
    await expect(popup).toBeVisible()
    await page.mouse.move(0, 0, { steps: 4 })
    await expect(anyTooltip(page)).toHaveCount(0)
  })

  test('after Escape the tooltip stays hidden until the pointer leaves and comes back', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await control(page, 'Kursiv').hover()
    await expect(tooltip(page, 'Kursiv')).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(anyTooltip(page)).toHaveCount(0)
    await page.waitForTimeout(800)
    await expect(anyTooltip(page)).toHaveCount(0)
    await page.mouse.move(0, 0, { steps: 4 })
    await page.waitForTimeout(400)
    await control(page, 'Kursiv').hover()
    await expect(tooltip(page, 'Kursiv')).toBeVisible({ timeout: 3000 })
  })

  test('a press on the trigger hides the tooltip', async ({ page }) => {
    await openStory(page, 'keyboard')
    await control(page, 'Kursiv').hover()
    await expect(tooltip(page, 'Kursiv')).toBeVisible({ timeout: 3000 })
    await control(page, 'Kursiv').click()
    await expect(anyTooltip(page)).toHaveCount(0)
    // The pointer still rests on it: it stays hidden until the pointer leaves and comes back.
    await page.waitForTimeout(800)
    await expect(anyTooltip(page)).toHaveCount(0)
  })
})

test.describe('Tooltip accessibility', () => {
  test('the tooltip never covers its trigger', async ({ page }) => {
    for (const story of ['open', 'flips-at-the-edge']) {
      await openStory(page, story)
      await expect.poll(() => isShown(page.locator('.kv-tooltip')), story).toBe(true)
      expect(await coversTrigger(page), `${story}: the tooltip covers its trigger (2.4.11)`).toBe(
        false,
      )
    }
    // Where there is no room above, it is below.
    await expect(page.locator('.kv-tooltip')).toHaveAttribute('data-placement', /^bottom/)
  })

  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['with-a-shortcut'],
    ['plain-description'],
    ['open'],
    ['in-a-toolbar'],
    ['keyboard'],
    ['under-a-popover'],
    ['flips-at-the-edge'],
    ['long-text'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['open', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }

  test('no axe violations: keyboard, a tooltip open', async ({ page }) => {
    await tabIntoToolbar(page)
    await expect(tooltip(page, 'Ångra')).toBeVisible(atOnce)
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState !== 'running'),
    )
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})

test.describe('Tooltip modes', () => {
  test('forced colours: the tooltip keeps a visible edge (1.4.11)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const popup = page.locator('.kv-tooltip')
    await expect.poll(() => isShown(popup)).toBe(true)
    const edge = await popup.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        width: Number.parseFloat(style.borderTopWidth),
        style: style.borderTopStyle,
      }
    })
    expect(edge.style).not.toBe('none')
    expect(edge.width).toBeGreaterThan(0)
    await expect(popup).toBeVisible()
  })

  test('at 320px the tooltip stays inside the viewport, and a short one loses no text', async ({
    page,
  }) => {
    for (const height of [640, 256]) {
      await page.setViewportSize({ width: 320, height })
      for (const story of ['open', 'long-text', 'flips-at-the-edge']) {
        const label = `${story} at 320x${height}`
        await openStory(page, story)
        const popup = page.locator('.kv-tooltip')
        await expect.poll(() => isShown(popup), label).toBe(true)
        const box = await popup.boundingBox()
        expect(box?.x, label).toBeGreaterThanOrEqual(0)
        expect((box?.x ?? 0) + (box?.width ?? 0), label).toBeLessThanOrEqual(320)
        expect(await hasHorizontalScroll(page), label).toBe(false)
        if (height === 640) {
          expect(await coversTrigger(page), `${label}: covers its trigger (2.4.11)`).toBe(false)
        } else {
          // A viewport shorter than the text needs: it may overlap its trigger (Escape hides it),
          // but no text is lost. Whatever is at the last character's point is the tooltip itself.
          expect(await lastCharacterIsVisible(page), `${label}: text is clipped`).toBe(true)
        }
      }
    }
  })
})
