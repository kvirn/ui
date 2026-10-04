import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/prose/prose.a11y.md › Visual / modes and Sizes, width and colour
// roles. Prose has no focusable part and handles no keys, so these are the display-mode checks
// (reflow, forced colours) that need a real viewport and real emulation. One test per row.

const storyUrl = (story: string) => `/iframe.html?id=components-prose--${story}&viewMode=story`

async function openStory(page: Page, story: string) {
  await page.goto(storyUrl(story))
  await expect(page.locator('.kv-prose').first()).toBeVisible()
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

test.describe('Prose reflow (1.4.10)', () => {
  test('the article has no horizontal scrolling at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'article')
    expect(await hasHorizontalScroll(page)).toBe(false)
    await page.goto(storyUrl('large'))
    await expect(page.locator('.kv-prose').first()).toBeVisible()
    expect(await hasHorizontalScroll(page)).toBe(false)
  })

  test('kv-prose--xl and --2xl do not scroll sideways at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'sizes')
    expect(await hasHorizontalScroll(page)).toBe(false)
  })
})

test.describe('Prose forced colours (1.4.11)', () => {
  test('the table rules, quote bar and rule stay borders, and a mark gets an outline', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const edges = await page.evaluate(() => {
      const widthOf = (selector: string, side: 'Top' | 'Bottom' | 'InlineStart') => {
        const element = document.querySelector(selector)
        if (element === null) return null
        return Number.parseFloat(
          getComputedStyle(element).getPropertyValue(
            side === 'InlineStart'
              ? 'border-inline-start-width'
              : `border-${side.toLowerCase()}-width`,
          ),
        )
      }
      return {
        quoteBar: widthOf('.kv-prose blockquote', 'InlineStart'),
        rule: widthOf('.kv-prose hr', 'Top'),
        cell: widthOf('.kv-prose td', 'Bottom'),
      }
    })
    expect(edges.quoteBar).toBeGreaterThan(0)
    expect(edges.rule).toBeGreaterThan(0)
    expect(edges.cell).toBeGreaterThan(0)
    // A highlight loses its background in forced colours, so it gets an outline.
    const mark = page.locator('.kv-prose mark').first()
    await expect(mark).toBeVisible()
    expect(await mark.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })
})

test.describe('Prose accessibility', () => {
  for (const story of ['article', 'large', 'sizes', 'forced-colors', 'full-width-and-roles']) {
    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
