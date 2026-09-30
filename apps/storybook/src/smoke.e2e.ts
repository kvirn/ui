import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

const url = '/iframe.html?id=foundation-smoke--default&viewMode=story'

test.describe('Foundation smoke', () => {
  test('Tab moves focus to the button', async ({ page }) => {
    await page.goto(url)
    const button = page.getByRole('button', { name: 'Skicka' })
    await expect(button).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
  })

  test('a11y tree', async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
      - main:
        - heading "KvirnUI" [level=1]
        - button "Skicka"
    `)
  })

  test('no horizontal scrolling (1.4.10)', async ({ page }) => {
    await page.goto(url)
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })

  test('no axe violations', async ({ page }) => {
    await page.goto(url)
    await expect(page.getByRole('button', { name: 'Skicka' })).toBeVisible()
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
