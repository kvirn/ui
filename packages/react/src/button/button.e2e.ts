import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: button.a11y.md › Keyboard. One test per row, named after it.

const storyUrl = (story: string) => `/iframe.html?id=components-button--${story}&viewMode=story`

async function openStory(page: Page, story: string, buttonName: string) {
  await page.goto(storyUrl(story))
  const button = page.getByRole('button', { name: buttonName })
  await expect(button).toBeVisible()
  return button
}

test.describe('Button keyboard contract', () => {
  test('Tab moves focus to the button', async ({ page }) => {
    const button = await openStory(page, 'default', 'Spara')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
  })

  test('Tab skips a disabled button', async ({ page }) => {
    const button = await openStory(page, 'disabled', 'Skicka')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Avbryt' })).toBeFocused()
    await expect(button).not.toBeFocused()
  })

  test('Tab moves focus to a focusable disabled button', async ({ page }) => {
    const button = await openStory(page, 'focusable-when-disabled', 'Skicka')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('data-focus-visible', '')
  })

  test('Enter activates the button and keeps focus', async ({ page }) => {
    const button = await openStory(page, 'default', 'Spara')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Antal klick: 1')).toBeVisible()
    await expect(button).toBeFocused()
  })

  test('Enter does not activate a focusable disabled button', async ({ page }) => {
    const button = await openStory(page, 'focusable-when-disabled', 'Skicka')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Antal klick: 0')).toBeVisible()
    await expect(button).toBeFocused()
  })

  test('Space activates the button on key up', async ({ page }) => {
    const button = await openStory(page, 'default', 'Spara')
    await page.keyboard.press('Tab')
    await page.keyboard.down(' ')
    await expect(page.getByText('Antal klick: 0')).toBeVisible()
    await page.keyboard.up(' ')
    await expect(page.getByText('Antal klick: 1')).toBeVisible()
    await expect(button).toBeFocused()
  })

  test('Space does not activate a focusable disabled button', async ({ page }) => {
    const button = await openStory(page, 'focusable-when-disabled', 'Skicka')
    await page.keyboard.press('Tab')
    await page.keyboard.press(' ')
    await expect(page.getByText('Antal klick: 0')).toBeVisible()
    await expect(button).toBeFocused()
  })

  test('Enter on a submit button submits the form', async ({ page }) => {
    const submitButton = await openStory(page, 'submit-in-form', 'Skicka ansökan')
    await page.getByRole('textbox', { name: 'Namn' }).fill('Anna')
    await submitButton.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toHaveText('Ansökan skickad för Anna')
    await expect(submitButton).toBeFocused()
  })

  test('Enter on a default button does not submit the form', async ({ page }) => {
    await openStory(page, 'submit-in-form', 'Skicka ansökan')
    const nameField = page.getByRole('textbox', { name: 'Namn' })
    await nameField.fill('Anna')
    const resetButton = page.getByRole('button', { name: 'Börja om' })
    await resetButton.focus()
    await page.keyboard.press('Enter')
    await expect(nameField).toHaveValue('')
    await expect(page.getByRole('status')).toHaveText('')
    await expect(resetButton).toBeFocused()
  })
})

test.describe('Button accessibility', () => {
  test('a11y tree of the focusable disabled button', async ({ page }) => {
    await openStory(page, 'focusable-when-disabled', 'Skicka')
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
      - main:
        - heading "Button" [level=1]
        - paragraph: Fyll i alla obligatoriska fält innan du skickar.
        - button "Skicka" [disabled]
        - paragraph: "Antal klick: 0"
    `)
  })

  test('a11y tree of the form', async ({ page }) => {
    await openStory(page, 'submit-in-form', 'Skicka ansökan')
    await expect(page.getByRole('form', { name: 'Ansökan' })).toMatchAriaSnapshot(`
      - form "Ansökan":
        - paragraph:
          - text: Namn
          - textbox "Namn"
        - button "Skicka ansökan"
        - button "Börja om"
    `)
  })

  const stories = [
    ['default', 'Spara'],
    ['disabled', 'Skicka'],
    ['focusable-when-disabled', 'Skicka'],
    ['submit-in-form', 'Skicka ansökan'],
    ['rtl', 'Save'],
    ['forced-colors', 'Spara'],
  ] as const

  for (const [story, buttonName] of stories) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await openStory(page, story, buttonName)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, buttonName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
