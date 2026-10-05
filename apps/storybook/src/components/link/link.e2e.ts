import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/link/link.a11y.md › Keyboard. One test per row, named after it.

const storyUrl = (story: string) => `/iframe.html?id=components-link--${story}&viewMode=story`

async function openStory(page: Page, story: string, linkName: string) {
  await page.goto(storyUrl(story))
  const link = page.getByRole('link', { name: linkName })
  await expect(link).toBeVisible()
  return link
}

test.describe('Link keyboard contract', () => {
  test('Tab moves focus to the link', async ({ page }) => {
    const link = await openStory(page, 'keyboard', 'Ansök om bygglov')
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
    await expect(link).toHaveAttribute('data-focus-visible', '')
  })

  test('Shift+Tab moves focus off the link', async ({ page }) => {
    const link = await openStory(page, 'keyboard', 'Ansök om bygglov')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Kontakta oss' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(link).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(link).not.toBeFocused()
  })

  test('Enter follows the link', async ({ page }) => {
    await openStory(page, 'same-page-link', 'Ansök om bygglov')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#ansok$/)
    // Native fragment navigation: the target becomes the focus navigation starting point.
    await expect(page.locator(':target')).toHaveAccessibleName('Ansök')
  })

  test('Enter follows a router link without a page load', async ({ page }) => {
    await openStory(page, 'routed-links', 'Start')
    const apply = page.getByRole('link', { name: 'Ansök' })
    const urlBefore = page.url()
    await page.evaluate(() => {
      Reflect.set(window, 'kvirnPageMarker', true)
    })
    await apply.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Nuvarande sida: /ansok')).toBeVisible()
    await expect(apply).toHaveAttribute('aria-current', 'page')
    await expect(apply).toBeFocused()
    expect(page.url()).toBe(urlBefore)
    expect(await page.evaluate(() => Reflect.get(window, 'kvirnPageMarker'))).toBe(true)
  })

  test('Enter opens a new-tab link in a new tab', async ({ page, context }) => {
    // Answered locally: tests make no third-party network calls (AGENTS.md, hard rule 7).
    await context.route('https://www.digg.se/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>Digg</title>' }),
    )
    const link = await openStory(page, 'new-tab', 'Digg (öppnas i en ny flik)')
    await link.focus()
    const newPagePromise = context.waitForEvent('page')
    await page.keyboard.press('Enter')
    const newPage = await newPagePromise
    await newPage.waitForLoadState()
    expect(newPage.url()).toBe('https://www.digg.se/')
    expect(page.url()).toContain(storyUrl('new-tab'))
  })

  test('Space does not follow the link', async ({ page }) => {
    const link = await openStory(page, 'same-page-link', 'Ansök om bygglov')
    const urlBefore = page.url()
    await page.keyboard.press('Tab')
    await page.keyboard.press(' ')
    await expect(link).toBeFocused()
    expect(page.url()).toBe(urlBefore)
  })
})

test.describe('Link service look', () => {
  test('the service link edge and icon divider are visible in forced colours (1.4.11)', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'service', 'Ansök om bygglov (öppnas i en ny flik)')
    const edges = await page.locator('.kv-link--service').evaluate((link) => {
      const icon = link.querySelector('.kv-link-icon')
      const isDrawn = (element: Element, side: string) => {
        const style = getComputedStyle(element)
        return (
          Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
          !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`))
        )
      }
      // The block isn't filled in forced colours, so its divider (the right edge in this
      // left-to-right story) keeps its edge.
      return {
        link: ['top', 'right', 'bottom', 'left'].every((side) => isDrawn(link, side)),
        icon: icon !== null && isDrawn(icon, 'right'),
      }
    })
    expect(edges).toEqual({ link: true, icon: true })
  })

  test('a key-focused service link shows a focus indicator (2.4.7)', async ({ page }) => {
    const link = await openStory(page, 'service', 'Ansök om bygglov (öppnas i en ny flik)')
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
    expect(await link.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('no horizontal scrolling at 320px with the Finnish service link (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'service-long-finnish-text', 'Hae rakennuslupaa sähköisesti')
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Link accessibility', () => {
  test('the new-tab notice is part of the name, in the provider’s language', async ({ page }) => {
    const link = await openStory(page, 'new-tab', 'Digg (öppnas i en ny flik)')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('the language link has its own lang and hreflang', async ({ page }) => {
    const link = await openStory(page, 'other-language', 'Suomeksi')
    await expect(link).toHaveAttribute('lang', 'fi')
    await expect(link).toHaveAttribute('hreflang', 'fi')
  })

  const stories = [
    ['default', 'Ansök om bygglov'],
    ['same-page-link', 'Ansök om bygglov'],
    ['service', 'Ansök om bygglov (öppnas i en ny flik)'],
    ['service-long-finnish-text', 'Hae rakennuslupaa sähköisesti'],
    ['new-tab', 'Digg (öppnas i en ny flik)'],
    ['new-tab-notice-overrides', 'Digg (öppnas i nytt fönster)'],
    ['routed-links', 'Start'],
    ['other-language', 'Suomeksi'],
    ['rtl', 'Digg (opens in a new tab)'],
    ['forced-colors', 'Starta e-tjänsten'],
  ] as const

  for (const [story, linkName] of stories) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await openStory(page, story, linkName)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story, linkName)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
