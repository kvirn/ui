import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/toggle/toggle.a11y.md › Keyboard. One test per row,
// named after it.

const storyUrl = (story: string) => `/iframe.html?id=components-toggle--${story}&viewMode=story`

async function openStory(page: Page, story: string, toggleName = 'Visa bara olästa') {
  await page.goto(storyUrl(story))
  // The States and ForcedColors stories repeat one label in every state: the first one will do.
  const toggle = page.getByRole('button', { name: toggleName }).first()
  await expect(toggle).toBeVisible()
  // A pressed toggle fades to its fill: let the transition finish before axe samples colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
  return toggle
}

test.describe('Toggle keyboard contract', () => {
  test('Tab moves to and from the toggle', async ({ page }) => {
    const toggle = await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Före' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('data-focus-visible', '')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Efter' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(toggle).not.toBeFocused()
    await expect(page.getByRole('button', { name: 'Före' })).toBeFocused()
  })

  test('Enter and Space switch pressed, name is kept', async ({ page }) => {
    const toggle = await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press(' ')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('Antal ändringar: 2')).toBeVisible()
    // Still found by the same name: it never changes with the state, and focus stays.
    await expect(
      page.getByRole('button', { name: 'Visa bara olästa', pressed: false }),
    ).toBeFocused()
  })

  test('a focusable disabled toggle ignores Enter and Space', async ({ page }) => {
    const toggle = await openStory(page, 'focusable-when-disabled')
    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-disabled', 'true')
    await page.keyboard.press('Enter')
    await page.keyboard.press(' ')
    await expect(page.getByText('Antal ändringar: 0')).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle).toBeFocused()
  })
})

// The pressed state is a WCAG matter (1.4.1 Use of Color, 1.4.11 Non-text Contrast): it is
// reviewed by eye in Storybook. The forced-colours test asserts the outcome there, where a pressed
// toggle must not be drawn the same as an unpressed one: it checks forced colours, not 1.4.1 itself.
test.describe('Toggle visual criteria', () => {
  test('forced colours: a pressed toggle is drawn differently from an unpressed one', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto(storyUrl('forced-colors'))
    const toggles = page.getByRole('button', { name: 'Visa bara olästa' })
    const unpressed = toggles.nth(0)
    const pressed = toggles.nth(1)
    await expect(pressed).toHaveAttribute('aria-pressed', 'true')
    await expect(unpressed).toHaveAttribute('aria-pressed', 'false')
    const paint = (toggle: Locator) =>
      toggle.evaluate((element) => {
        const style = getComputedStyle(element)
        return { background: style.backgroundColor, color: style.color }
      })
    expect(await paint(pressed)).not.toEqual(await paint(unpressed))
  })

  test('keyboard focus shows an indicator on a pressed toggle (2.4.7)', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'none' })
    const toggle = await openStory(page, 'pressed')
    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    expect(await toggle.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })
})

test.describe('Toggle accessibility', () => {
  const stories = [
    ['default', 'Visa bara olästa'],
    ['pressed', 'Visa bara olästa'],
    ['controlled', 'Visa karta'],
    ['icon-only', 'Visa lösenord'],
    ['disabled', 'Visa bara olästa'],
    ['focusable-when-disabled', 'Visa bara olästa'],
    ['keyboard', 'Visa bara olästa'],
    ['states', 'Visa bara olästa'],
    ['rtl', 'Show unread only'],
    ['forced-colors', 'Visa bara olästa'],
  ] as const

  for (const [story, toggleName] of stories) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await openStory(page, story, toggleName)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, toggleName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
