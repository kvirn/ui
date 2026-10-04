import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/card/card.a11y.md › Keyboard, Focus management and Visual /
// modes. One test per row, named after it. Card handles no keys: these prove it never gets in
// the children's way.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-card--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-card').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

test.describe('Card keyboard contract', () => {
  test('Tab moves through the children in DOM order', async ({ page }) => {
    await openStory(page, 'news-list')
    const names = [
      'Nya öppettider på återvinningscentralen',
      'Vinterväghållning: så plogar vi',
      'Ansök om föreningsbidrag senast 1 december',
    ]
    for (const name of names) {
      await page.keyboard.press('Tab')
      await expect(page.getByRole('link', { name })).toBeFocused()
    }
    // The cards themselves are never a Tab stop.
    await expect(page.locator('.kv-card:focus')).toHaveCount(0)
  })

  test('Shift+Tab moves back through the children', async ({ page }) => {
    await openStory(page, 'news-list')
    for (let count = 0; count < 3; count += 1) {
      await page.keyboard.press('Tab')
    }
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('link', { name: 'Vinterväghållning: så plogar vi' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(
      page.getByRole('link', { name: 'Nya öppettider på återvinningscentralen' }),
    ).toBeFocused()
  })
})

test.describe('Card focus and modes', () => {
  test('a key-focused footer button shows a focus indicator (2.4.7)', async ({ page }) => {
    await openStory(page, 'service-card')
    const button = page.getByRole('button', { name: 'Beställ extra tömning' })
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    )
  })

  test('the card border is visible in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const cards = await page.locator('.kv-card').all()
    expect(cards.length).toBeGreaterThanOrEqual(6)
    for (const card of cards) {
      // A visible edge on every side (1.4.11).
      const border = await card.evaluate((element) => {
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

  test('dividers are visible in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'dividers')
    const body = page.locator('.kv-card.kv-card--dividers > .kv-card-body').first()
    const edge = await body.evaluate((element) => {
      const style = getComputedStyle(element)
      return { style: style.borderTopStyle, width: Number.parseFloat(style.borderTopWidth) }
    })
    expect(edge.style).not.toBe('none')
    expect(edge.width).toBeGreaterThan(0)
  })

  test('no horizontal scrolling at 320px with the Finnish text (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'long-finnish-text')
    await expect(
      page.getByRole('button', { name: 'Keskeytä jäteastioiden tyhjennykset' }),
    ).toBeVisible()
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Card reflow and text spacing', () => {
  test('an image in a padded body fits at 320px (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'image-in-padded-body')
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing), at 320px.
  for (const story of ['service-card', 'news-list', 'long-finnish-text'] as const) {
    test(`text spacing overrides clip nothing at 320px (1.4.12): ${story}`, async ({ page }) => {
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
        for (const card of document.querySelectorAll<HTMLElement>('.kv-card')) {
          for (const element of [card, ...card.querySelectorAll<HTMLElement>('*')]) {
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

test.describe('Card accessibility', () => {
  test('a11y tree of the list of cards', async ({ page }) => {
    await openStory(page, 'news-list')
    // The published date is a <time>. A colon in a name needs YAML quotes.
    await expect(page.getByRole('list')).toMatchAriaSnapshot(`
      - list:
        - listitem:
          - heading "Nya öppettider på återvinningscentralen" [level=3]:
            - link "Nya öppettider på återvinningscentralen"
          - paragraph: Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar.
          - paragraph:
            - text: Publicerad
            - time: 28 september 2026
        - listitem:
          - 'heading "Vinterväghållning: så plogar vi" [level=3]':
            - 'link "Vinterväghållning: så plogar vi"'
          - paragraph: Vi plogar huvudgator och busslinjer först, sedan bostadsgator.
          - paragraph:
            - text: Publicerad
            - time: 21 september 2026
        - listitem:
          - heading "Ansök om föreningsbidrag senast 1 december" [level=3]:
            - link "Ansök om föreningsbidrag senast 1 december"
          - paragraph: Idrotts- och kulturföreningar kan söka bidrag för nästa år.
          - paragraph:
            - text: Publicerad
            - time: 14 september 2026
    `)
  })

  // Examples B–D in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['service-card'],
    ['news-list'],
    ['nested-card'],
    ['radii'],
    ['padding'],
    ['dividers'],
    ['prose-and-cards'],
    ['plain-children'],
    ['image-in-padded-body'],
    ['long-finnish-text'],
    ...themes.map((theme) => ['all-examples', theme] as const),
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
})
