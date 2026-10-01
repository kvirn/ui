import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: card.a11y.md › Keyboard, Focus management and Visual / modes. One test per row,
// named after it. Card handles no keys: these prove it never gets in the children's way.

const storyUrl = (story: string) => `/iframe.html?id=components-card--${story}&viewMode=story`

async function openStory(page: Page, story: string) {
  await page.goto(storyUrl(story))
  await expect(page.locator('.kv-card').first()).toBeVisible()
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
  test('the focus ring of a footer button is not clipped', async ({ page }) => {
    await openStory(page, 'service-card')
    const button = page.getByRole('button', { name: 'Beställ extra tömning' })
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(button).toHaveCSS('outline-style', 'solid')
    await expect(button).toHaveCSS('outline-width', '2px')
    // The ring's box: the button plus its offset and width. No ancestor may cut into it.
    const clipped = await button.evaluate((element) => {
      const style = getComputedStyle(element)
      const ring = Number.parseFloat(style.outlineOffset) + Number.parseFloat(style.outlineWidth)
      const rect = element.getBoundingClientRect()
      const ringBox = {
        top: rect.top - ring,
        right: rect.right + ring,
        bottom: rect.bottom + ring,
        left: rect.left - ring,
      }
      const clippingAncestors: string[] = []
      for (
        let ancestor = element.parentElement;
        ancestor !== null && ancestor !== document.body;
        ancestor = ancestor.parentElement
      ) {
        const ancestorStyle = getComputedStyle(ancestor)
        const clips = [ancestorStyle.overflowX, ancestorStyle.overflowY].some(
          (overflow) => overflow !== 'visible',
        )
        const box = ancestor.getBoundingClientRect()
        const contains =
          box.top <= ringBox.top &&
          box.right >= ringBox.right &&
          box.bottom >= ringBox.bottom &&
          box.left <= ringBox.left
        if (clips && !contains) {
          clippingAncestors.push(ancestor.getAttribute('class') ?? ancestor.tagName)
        }
      }
      const isInViewport =
        ringBox.top >= 0 &&
        ringBox.left >= 0 &&
        ringBox.right <= document.documentElement.clientWidth &&
        ringBox.bottom <= window.innerHeight
      return { clippingAncestors, isInViewport }
    })
    expect(clipped).toEqual({ clippingAncestors: [], isInViewport: true })
    // The card itself never clips: no overflow on any card part.
    for (const part of await page
      .locator('.kv-card, .kv-card-header, .kv-card-body, .kv-card-footer')
      .all()) {
      await expect(part).toHaveCSS('overflow', 'visible')
    }
  })

  test('the card border is visible in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const cards = await page.locator('.kv-card').all()
    expect(cards.length).toBeGreaterThanOrEqual(6)
    for (const card of cards) {
      // A visible edge on every side, in a colour other than the card's own (1.4.11).
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
          differsFromBackground: style.borderTopColor !== style.backgroundColor,
        }
      })
      expect(border).toEqual({ isDrawn: true, differsFromBackground: true })
    }
  })

  test('dividers are visible in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'dividers')
    const body = page.locator('.kv-card.kv-card--dividers > .kv-card-body').first()
    await expect(body).not.toHaveCSS('border-top-width', '0px')
    await expect(body).toHaveCSS('border-top-style', 'solid')
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
    const image = page.getByTestId('wide-image')
    const body = page.locator('.kv-card-body')
    const [imageBox, bodyBox] = [await image.boundingBox(), await body.boundingBox()]
    expect((imageBox?.x ?? 0) + (imageBox?.width ?? 0)).toBeLessThanOrEqual(
      (bodyBox?.x ?? 0) + (bodyBox?.width ?? 0),
    )
  })

  // The WCAG 1.4.12 overrides (story-canvas.css: .kv-story-text-spacing), at 320px.
  for (const story of ['service-card', 'news-list', 'long-finnish-text'] as const) {
    test(`text spacing overrides clip nothing at 320px (1.4.12): ${story}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await openStory(page, story)
      await page.evaluate(() => {
        document.querySelector('.kv-story-canvas')?.classList.add('kv-story-text-spacing')
      })
      await expect(page.locator('.kv-story-text-spacing')).toHaveCount(1)
      // 0.12em of the 16px body text: the overrides apply.
      await expect(page.locator('.kv-card p').first()).toHaveCSS('letter-spacing', '1.92px')
      const problems = await page.evaluate(() => {
        const found: string[] = []
        const root = document.documentElement
        if (root.scrollWidth > root.clientWidth) {
          found.push(`page scrolls sideways: ${root.scrollWidth} > ${root.clientWidth}`)
        }
        for (const card of document.querySelectorAll<HTMLElement>('.kv-card')) {
          const cardBox = card.getBoundingClientRect()
          for (const element of [card, ...card.querySelectorAll<HTMLElement>('*')]) {
            const style = getComputedStyle(element)
            if (style.display === 'inline' || style.display === 'contents') {
              continue
            }
            const box = element.getBoundingClientRect()
            const name = `${element.tagName.toLowerCase()}${[...element.classList].map((className) => `.${className}`).join('')}`
            if (box.left < cardBox.left - 0.5 || box.right > cardBox.right + 0.5) {
              found.push(`${name} sticks out of its card`)
            }
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

  test('a11y tree of the sidebar text block: a named complementary landmark', async ({ page }) => {
    await openStory(page, 'sidebar-text-block')
    await expect(page.getByRole('complementary', { name: 'Kontakta oss' })).toMatchAriaSnapshot(`
      - complementary "Kontakta oss":
        - heading "Kontakta oss" [level=2]
        - paragraph: Ring kundcenter på 0123-45 67 89.
        - paragraph:
          - text: Vi svarar måndag–fredag kl.
          - time: 08:00
          - text: –
          - time: 16:00
          - text: .
        - paragraph:
          - link "Mejla kundcenter"
    `)
  })

  const stories = [
    'service-card',
    'sidebar-text-block',
    'news-list',
    'nested-card',
    'surfaces',
    'radii',
    'padding',
    'dividers',
    'prose-and-cards',
    'plain-children',
    'image-in-padded-body',
    'long-finnish-text',
    'light',
    'dark',
    'light-high-contrast',
    'dark-high-contrast',
    'rtl',
    'forced-colors',
  ] as const

  for (const story of stories) {
    test(`no horizontal scrolling (1.4.10): ${story}`, async ({ page }) => {
      await openStory(page, story)
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })

    test(`no axe violations: ${story}`, async ({ page }) => {
      await openStory(page, story)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
