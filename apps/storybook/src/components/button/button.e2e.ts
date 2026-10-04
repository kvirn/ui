import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/button/button.a11y.md › Keyboard. One test per row,
// named after it.

const storyUrl = (story: string) => `/iframe.html?id=components-button--${story}&viewMode=story`

async function openStory(page: Page, story: string, buttonName: string) {
  await page.goto(storyUrl(story))
  // The Depth stories repeat one label in every kind, state and surface: the first one will do.
  const button = page.getByRole('button', { name: buttonName }).first()
  await expect(button).toBeVisible()
  return button
}

test.describe('Button keyboard contract', () => {
  test('Tab moves focus to the button', async ({ page }) => {
    const button = await openStory(page, 'keyboard', 'Spara')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
  })

  test('Shift+Tab moves focus off the button', async ({ page }) => {
    const button = await openStory(page, 'keyboard', 'Spara')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Avbryt' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(button).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(button).not.toBeFocused()
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
    const button = await openStory(page, 'activation', 'Spara')
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
    const button = await openStory(page, 'activation', 'Spara')
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

test.describe('Site-wide compact density', () => {
  // kv-compact on <html> or <body> makes every control compact from 64rem. Never under 24 × 24 (2.5.8).
  for (const element of ['html', 'body'] as const) {
    test(`kv-compact on <${element}> keeps every button at least 24 × 24 (2.5.8)`, async ({
      page,
    }) => {
      const button = await openStory(page, 'activation', 'Spara')
      await page.evaluate((selector) => {
        document.querySelector(selector)?.classList.add('kv-compact')
      }, element)
      const box = await button.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(24)
      expect(box?.height).toBeGreaterThanOrEqual(24)
    })
  }
})

// Button depth (docs/design/button-depth.md section 10) is a look, reviewed in Storybook. WCAG
// depends on it in two places, and these assert the outcome: keyboard focus shows an indicator
// (2.4.7), and forced colours keep the button's boundary (1.4.11).

type Kind = 'secondary' | 'primary' | 'danger'
const kinds = ['secondary', 'primary', 'danger'] as const
const kindSelector: Record<Kind, string> = {
  secondary: '.kv-button:not(.kv-button--primary, .kv-button--danger)',
  primary: '.kv-button--primary',
  danger: '.kv-button--danger',
}

/** The Depth story's first section (on the page), and a button of one kind in one state. */
async function openDepth(page: Page) {
  await page.goto(`/iframe.html?id=components-button--depth&viewMode=story`)
  const section = page.getByRole('region', { name: 'På sidan' })
  await expect(section).toBeVisible()
  // Each kind is three buttons in DOM order: at rest, with a static focus ring, and disabled.
  const restButton = (kind: Kind) => section.locator(kindSelector[kind]).nth(0)
  const disabledButton = (kind: Kind) => section.locator(kindSelector[kind]).nth(2)
  return { restButton, disabledButton }
}

/** Real keyboard focus: Tab until the button has it, and check the browser calls it focus-visible. */
async function tabTo(page: Page, button: Locator) {
  for (let presses = 0; presses < 30; presses += 1) {
    await page.keyboard.press('Tab')
    if (await button.evaluate((element) => element === document.activeElement)) {
      expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      return
    }
  }
  throw new Error('Tab never reached the button')
}

test.describe('Button visual criteria', () => {
  // The chromium-forced-colors project forces them on: the focus test is about the default themes.
  for (const kind of kinds) {
    test(`${kind}: keyboard focus shows an indicator (2.4.7)`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'none' })
      const { restButton } = await openDepth(page)
      const button = restButton(kind)
      await tabTo(page, button)
      expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
        'none',
      )
    })

    test(`${kind}: forced colours keep the boundary, at rest and disabled (1.4.11)`, async ({
      page,
    }) => {
      await page.emulateMedia({ forcedColors: 'active' })
      const { restButton, disabledButton } = await openDepth(page)
      for (const button of [restButton(kind), disabledButton(kind)]) {
        const edge = await button.evaluate((element) => {
          const style = getComputedStyle(element)
          return { style: style.borderTopStyle, width: Number.parseFloat(style.borderTopWidth) }
        })
        expect(edge.style).not.toBe('none')
        expect(edge.width).toBeGreaterThan(0)
      }
    })
  }
})

test.describe('Button accessibility', () => {
  test('a11y tree of the focusable disabled button', async ({ page }) => {
    await openStory(page, 'focusable-when-disabled', 'Skicka')
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
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
    ['activation', 'Spara'],
    ['disabled', 'Skicka'],
    ['focusable-when-disabled', 'Skicka'],
    ['submit-in-form', 'Skicka ansökan'],
    ['rtl', 'Save'],
    ['forced-colors', 'Spara'],
    ['depth', 'Skicka ansökan'],
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
