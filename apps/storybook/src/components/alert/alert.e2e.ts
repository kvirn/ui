import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/alert/alert.a11y.md › Keyboard, Focus management,
// Announcements and Visual / modes. One test per row, named after it. An alert is never a Tab
// stop; its only key handling is the optional close button's (a native button: Enter and Space).

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-alert--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  // SendFailed shows its alert only after Send, so a button is enough to be ready.
  await expect(page.locator('.kv-alert, .kv-button').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

test.describe('Alert keyboard contract', () => {
  test('Tab skips the alert and reaches its link', async ({ page }) => {
    await openStory(page, 'with-actions')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Förnya parkeringstillstånd' })).toBeFocused()
    // The alert itself is never a Tab stop.
    await expect(page.locator('.kv-alert:focus')).toHaveCount(0)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Försök igen' })).toBeFocused()
    await expect(page.locator('.kv-alert:focus')).toHaveCount(0)
  })

  test("Shift+Tab reaches the alert's action", async ({ page }) => {
    await openStory(page, 'send-failed')
    // The story's play function has pressed Send, so the danger alert is above Send,
    // and Send keeps focus when it appears (3.2.2).
    const send = page.getByRole('button', { name: 'Skicka ansökan' })
    await expect(page.locator('.kv-alert--danger')).toBeVisible()
    await expect(send).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('button', { name: 'Försök igen' })).toBeFocused()
    await expect(page.locator('.kv-alert:focus')).toHaveCount(0)
  })

  test('Enter on Försök igen keeps focus on Försök igen', async ({ page }) => {
    await openStory(page, 'send-failed')
    await expect(page.locator('.kv-alert--danger')).toBeVisible()
    await page.keyboard.press('Shift+Tab')
    const retry = page.getByRole('button', { name: 'Försök igen' })
    await expect(retry).toBeFocused()
    // The action sits inside the alert, so the alert is kept, never remounted:
    // a remount would drop the focus to the page (2.4.3).
    await page.keyboard.press('Enter')
    await expect(retry).toBeFocused()
    await expect(page.getByRole('status')).toContainText('Vi kunde inte skicka din ansökan')
  })

  test('Tab from a focused alert goes to its first action', async ({ page }) => {
    await openStory(page, 'focus-target')
    const root = page.getByTestId('focus-target')
    await expect(root).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Försök igen' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Förnya parkeringstillstånd' })).toBeFocused()
    // It was focused by script only: `tabindex` is -1, never 0.
    await expect(root).toHaveAttribute('tabindex', '-1')
  })

  test('Tab reaches the close button after the actions', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Se driftinformation' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Stäng meddelandet' })).toBeFocused()
    // The alert itself is never a Tab stop.
    await expect(page.locator('.kv-alert:focus')).toHaveCount(0)
  })

  test('Shift+Tab from the close button goes back to the link', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Stäng meddelandet' }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('link', { name: 'Se driftinformation' })).toBeFocused()
  })

  test('Enter on the close button dismisses the alert and moves focus to the heading', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Stäng meddelandet' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('dismissible')).toHaveCount(0)
    // Never the page (2.4.3): the consumer moved focus on before the button went.
    await expect(page.getByTestId('dismissible-heading')).toBeFocused()
  })

  test('Space on the close button dismisses the alert and moves focus to the heading', async ({
    page,
  }) => {
    await openStory(page, 'keyboard')
    await page.getByRole('button', { name: 'Stäng meddelandet' }).focus()
    await page.keyboard.press('Space')
    await expect(page.getByTestId('dismissible')).toHaveCount(0)
    await expect(page.getByTestId('dismissible-heading')).toBeFocused()
    // Tab goes on to the control that brings the message back, not back to the top of the page.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Visa meddelandet igen' })).toBeFocused()
  })
})

test.describe('Alert announcements', () => {
  test('an alert present at load puts nothing in the live regions', async ({ page }) => {
    await openStory(page, 'default')
    await expect(page.getByRole('status')).toBeEmpty()
    await expect(page.getByRole('alert')).toBeEmpty()
  })

  test('the polite region receives the text once after Save', async ({ page }) => {
    // The story's play function has pressed Save: the success alert is inserted after it.
    await openStory(page, 'announced')
    const region = page.getByRole('status')
    await expect(region).toHaveText('Klart: Dina ändringar är sparade')
    await expect(page.getByRole('alert')).toBeEmpty()
    // The visible box has no role, so a screen reader doesn't read it a second time.
    await expect(page.locator('.kv-alert[role], .kv-alert [aria-live]')).toHaveCount(0)
  })

  test('an alert that is focused on arrival is not announced', async ({ page }) => {
    await openStory(page, 'focus-target')
    await expect(page.getByTestId('focus-target')).toBeFocused()
    await expect(page.getByRole('status')).toBeEmpty()
    await expect(page.getByRole('alert')).toBeEmpty()
  })

  test('the heading name starts with the status word, and no box has a role', async ({ page }) => {
    await openStory(page, 'statuses')
    for (const word of ['Information:', 'Klart:', 'Varning:', 'Fel:']) {
      await expect(page.getByRole('heading', { name: `${word} Något du bör veta` })).toBeVisible()
    }
    await expect(page.locator('.kv-alert[role]')).toHaveCount(0)
    await expect(page.locator('.kv-alert-icon[aria-hidden="true"]')).toHaveCount(4)
  })
})

test.describe('Alert focus and modes', () => {
  /** A focused action shows a focus indicator (2.4.7). */
  async function expectFocusIndicator(page: Page, name: string, role: 'button' | 'link') {
    const control = page.getByRole(role, { name })
    await expect(control).toBeFocused()
    expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  }

  test('a key-focused action shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'with-actions')
    await page.keyboard.press('Tab')
    await expectFocusIndicator(page, 'Förnya parkeringstillstånd', 'link')
    await page.keyboard.press('Tab')
    await expectFocusIndicator(page, 'Försök igen', 'button')
  })

  test('a key-focused close button shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expectFocusIndicator(page, 'Stäng meddelandet', 'button')
  })

  test('the close button is at least 24 by 24 CSS pixels (2.5.8)', async ({ page }) => {
    await openStory(page, 'with-close-button')
    const buttons = await page.getByRole('button', { name: 'Stäng meddelandet' }).all()
    expect(buttons).toHaveLength(4)
    for (const button of buttons) {
      const box = await button.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(24)
      expect(box?.height).toBeGreaterThanOrEqual(24)
    }
  })

  test('a key-focused close button keeps a focus indicator in forced colours (2.4.7)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expectFocusIndicator(page, 'Stäng meddelandet', 'button')
  })

  test('a focused root shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'focus-target')
    const root = page.getByTestId('focus-target')
    await expect(root).toBeFocused()
    // Put keyboard modality first, then focus the root by script, as a route change would.
    await page.keyboard.press('Tab')
    await root.evaluate((element) => element.focus())
    await expect(root).toBeFocused()
    expect(await root.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('the alert border is visible in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const alerts = await page.locator('.kv-alert').all()
    expect(alerts.length).toBeGreaterThanOrEqual(7)
    for (const alert of alerts) {
      // A visible edge on every side (1.4.11).
      const border = await alert.evaluate((element) => {
        const style = getComputedStyle(element)
        const sides = ['top', 'right', 'bottom', 'left'].map((side) => ({
          width: Number.parseFloat(style.getPropertyValue(`border-${side}-width`)),
          style: style.getPropertyValue(`border-${side}-style`),
        }))
        return {
          isDrawn: sides.every(
            (side) => side.width > 0 && !['none', 'hidden'].includes(side.style),
          ),
        }
      })
      expect(border).toEqual({ isDrawn: true })
    }
  })

  test('the four statuses stay apart in forced colours by icon shape and word', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'statuses')
    const shapes = await page
      .locator('.kv-alert-icon')
      .evaluateAll((icons) =>
        icons.map((icon) =>
          [...icon.querySelectorAll('path')].map((path) => path.getAttribute('d')).join('|'),
        ),
      )
    expect(new Set(shapes).size).toBe(4)
    for (const word of ['Information:', 'Klart:', 'Varning:', 'Fel:']) {
      await expect(page.getByRole('heading', { name: `${word} Något du bör veta` })).toBeVisible()
    }
  })

  test('no horizontal scrolling at 320px with the Finnish text (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-text')
    await expect(page.getByRole('heading', { name: /^Tiedoksi: Asunnonmuutostyö/ })).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Alert reflow and text spacing', () => {
  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing), at 320px.
  for (const story of [
    'all-examples',
    'with-actions',
    'with-close-button',
    'long-finnish-text',
  ] as const) {
    test(`text spacing overrides clip nothing (1.4.12): ${story}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await openStory(page, story)
      await page.evaluate(() => {
        document.body.classList.add('kv-story-text-spacing')
      })
      await expect(page.locator('.kv-story-text-spacing')).toHaveCount(1)
      const problems = await page.evaluate(() => {
        const found: string[] = []
        const root = document.documentElement
        if (root.scrollWidth > root.clientWidth) {
          found.push(`page scrolls sideways: ${root.scrollWidth} > ${root.clientWidth}`)
        }
        for (const alert of document.querySelectorAll<HTMLElement>('.kv-alert')) {
          for (const element of [
            alert,
            ...alert.querySelectorAll<HTMLElement>(
              ':scope > *, .kv-alert-body *, .kv-alert-actions *',
            ),
          ]) {
            const style = getComputedStyle(element)
            if (style.display === 'inline' || style.display === 'contents') {
              continue
            }
            const name = `${element.tagName.toLowerCase()}${[...element.classList].map((className) => `.${className}`).join('')}`
            if (element.scrollWidth > element.clientWidth + 1) {
              found.push(`${name} overflows sideways`)
            }
            if (element.scrollHeight > element.clientHeight + 1) {
              found.push(`${name} overflows its height`)
            }
          }
        }
        return found
      })
      expect(problems).toEqual([])
    })
  }
})

test.describe('Alert accessibility', () => {
  // Examples in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['default'],
    ['statuses'],
    ['title-only'],
    ['with-actions'],
    ['announced'],
    ['send-failed'],
    ['focus-target'],
    ['keyboard'],
    ['with-close-button'],
    ['dynamic-status'],
    ['restyle-with-tokens'],
    ['bring-your-own'],
    ['messages-override'],
    ['in-prose-and-card'],
    ['compact'],
    ['long-finnish-text'],
    ...themes.map((theme) => ['all-examples', theme] as const),
    ...themes.map((theme) => ['statuses', theme] as const),
    ['rtl'],
    ['forced-colors'],
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no horizontal scrolling (1.4.10): ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }

  test('axe finds no violation after an error alert is inserted', async ({ page }) => {
    // The story's play function has pressed Send, so the alert is already inserted.
    await openStory(page, 'send-failed')
    await expect(page.locator('.kv-alert--danger')).toBeVisible()
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
