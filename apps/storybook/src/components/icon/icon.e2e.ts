import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/icon/icon.a11y.md › Keyboard, Visual / modes. One test per row,
// named after it. An icon handles no keys: these prove it never takes a Tab stop. The mode
// checks (forced colours, reflow, RTL, text resize) are about what the theme guarantees, so
// they read computed values.

const storyUrl = (story: string) => `/iframe.html?id=components-icon--${story}&viewMode=story`

async function openStory(page: Page, story: string) {
  await page.goto(storyUrl(story))
  await expect(page.locator('svg.kv-icon').first()).toBeVisible()
}

/** Whether the focused element is an `<svg>` or inside one. */
const isFocusOnIcon = (page: Page) =>
  page.evaluate(() => document.activeElement?.closest('svg') != null)

test.describe('Icon keyboard contract', () => {
  test('Tab never stops on an icon', async ({ page }) => {
    // Buttons and a link are the stops. The icons in and next to them are not.
    const stories = [
      ['in-buttons', 'button'],
      ['in-running-text-and-links', 'a'],
      ['decorative-and-meaningful', undefined],
      ['built-in-set', undefined],
    ] as const
    for (const [story, focusable] of stories) {
      await openStory(page, story)
      await expect(page.locator('svg[tabindex]')).toHaveCount(0)
      const stops = focusable === undefined ? 0 : await page.locator(focusable).count()
      // One Tab more than there are stops: focus leaves the page, and still isn't on an icon.
      for (let count = 0; count <= stops; count += 1) {
        await page.keyboard.press('Tab')
        expect(await isFocusOnIcon(page), `${story}: Tab stop ${count + 1}`).toBe(false)
      }
      await expect(page.locator('svg:focus, svg :focus')).toHaveCount(0)
    }
  })

  test('Shift+Tab never stops on an icon', async ({ page }) => {
    await openStory(page, 'in-buttons')
    const stops = await page.locator('button').count()
    for (let count = 0; count <= stops; count += 1) {
      await page.keyboard.press('Shift+Tab')
      expect(await isFocusOnIcon(page), `Shift+Tab stop ${count + 1}`).toBe(false)
    }
  })
})

test.describe('Icon forced colours', () => {
  const hardCodedRed = 'rgb(204, 0, 0)'

  /** The colour-bearing computed values of an icon's root and of every shape in it. */
  const paintOf = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll<SVGSVGElement>('svg.kv-icon')].map((svg) => ({
        group: svg.closest('[data-testid^="forced-"]')?.getAttribute('data-testid') ?? '',
        color: getComputedStyle(svg).color,
        parentColor: getComputedStyle(svg.parentElement ?? svg).color,
        values: [svg, ...svg.querySelectorAll('*')].flatMap((element) => {
          const style = getComputedStyle(element)
          return [style.fill, style.stroke]
        }),
      })),
    )

  test('a hard-coded colour is drawn red without forced colours', async ({ page }) => {
    // The control: without it, the next test could pass for the wrong reason.
    await page.emulateMedia({ forcedColors: 'none' })
    await openStory(page, 'forced-colors')
    const paint = await paintOf(page)
    const reds = paint.filter((icon) => icon.values.includes(hardCodedRed))
    expect(reds.length).toBeGreaterThanOrEqual(9)
  })

  test('a hard-coded color, fill and stroke render in the system colour', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    const paint = await paintOf(page)
    // Four groups (color, fill, stroke, token), each with an icon in text, a Button and a Link.
    expect(paint).toHaveLength(12)
    for (const icon of paint) {
      expect(icon.color, `${icon.group} color`).not.toBe(hardCodedRed)
      // The icon takes its parent's system colour: CanvasText, ButtonText or LinkText.
      expect(icon.color, `${icon.group} color`).toBe(icon.parentColor)
      expect(icon.values, `${icon.group} fill and stroke`).not.toContain(hardCodedRed)
    }
  })
})

test.describe('Icon reflow and target size', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
  })

  test('the icon-only button stays square at 320px (1.4.10, 2.5.8)', async ({ page }) => {
    await openStory(page, 'in-buttons')
    const buttons = await page.locator('.kv-button--icon-only').all()
    expect(buttons.length).toBeGreaterThanOrEqual(9)
    for (const button of buttons) {
      const box = await button.boundingBox()
      expect(box).not.toBeNull()
      expect(Math.abs((box?.width ?? 0) - (box?.height ?? 0))).toBeLessThanOrEqual(1)
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(24)
    }
  })

  test('a long Finnish label wraps and the icon keeps its size at 320px', async ({ page }) => {
    await openStory(page, 'in-buttons')
    const button = page.getByTestId('download-button')
    await button.scrollIntoViewIfNeeded()
    const { buttonBox, iconBox, lineHeight } = await button.evaluate((element) => {
      const icon = element.querySelector('svg')?.getBoundingClientRect()
      const box = element.getBoundingClientRect()
      return {
        buttonBox: { width: box.width, height: box.height },
        iconBox: { width: icon?.width ?? 0, height: icon?.height ?? 0 },
        lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
      }
    })
    // The label wraps: the button is taller than one line. The icon is still 20px.
    expect(buttonBox.height).toBeGreaterThan(lineHeight * 1.5)
    expect(iconBox.width).toBeCloseTo(20, 0)
    expect(iconBox.height).toBeCloseTo(20, 0)
  })

  const stories = [
    'default',
    'built-in-set',
    'sizes-next-to-text',
    'in-buttons',
    'status-with-text',
    'colors',
    'decorative-and-meaningful',
    'stroke-widths',
    'rtl',
    'forced-colors',
    'your-own-svg',
    'library-icons-via-the-registry',
    'in-running-text-and-links',
    'unstyled',
  ] as const

  for (const story of stories) {
    test(`no horizontal scrolling at 320px (1.4.10): ${story}`, async ({ page }) => {
      await page.goto(storyUrl(story))
      await expect(page.locator('#storybook-root > *').first()).toBeVisible()
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)
    })
  }
})

test.describe('Icon in right-to-left text', () => {
  const scaleOf = (page: Page, selector: string) =>
    page.locator(selector).evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).scale))

  test('an icon with data-mirror-in-rtl is flipped under dir="rtl"', async ({ page }) => {
    await openStory(page, 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const mirrored = await scaleOf(page, 'svg.kv-icon[data-mirror-in-rtl]')
    // Five in the gallery, the arrow in the button and the two chevrons in the pagination row.
    expect(mirrored).toHaveLength(8)
    expect(new Set(mirrored)).toEqual(new Set(['-1 1']))
  })

  test('an icon without data-mirror-in-rtl is not flipped under dir="rtl"', async ({ page }) => {
    await openStory(page, 'rtl')
    const staying = await scaleOf(page, 'svg.kv-icon:not([data-mirror-in-rtl])')
    expect(staying.length).toBeGreaterThanOrEqual(3)
    expect(new Set(staying)).toEqual(new Set(['none']))
  })

  test('no icon is flipped in left-to-right text', async ({ page }) => {
    await openStory(page, 'built-in-set')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    const all = await scaleOf(page, 'svg.kv-icon')
    expect(all.length).toBeGreaterThan(24)
    expect(new Set(all)).toEqual(new Set(['none']))
  })

  test('an overridden built-in name still flips, because mirroring belongs to the name', async ({
    page,
  }) => {
    await openStory(page, 'library-icons-via-the-registry')
    await expect(page.getByTestId('overridden-arrow')).toHaveCSS('scale', '-1 1')
  })
})

test.describe('Icon text resize (1.4.4)', () => {
  test('an md icon is 20px at 16px text and 40px at 32px text', async ({ page }) => {
    await openStory(page, 'sizes-next-to-text')
    const widthOf = (testId: string) =>
      page
        .getByTestId(testId)
        .locator('section[aria-label="body"] svg[data-size="md"]')
        .first()
        .evaluate((icon) => ({
          width: icon.getBoundingClientRect().width,
          height: icon.getBoundingClientRect().height,
          fontSize: Number.parseFloat(getComputedStyle(icon).fontSize),
        }))
    const normal = await widthOf('sizes-body')
    const zoomed = await widthOf('sizes-200')
    expect(normal.fontSize).toBe(16)
    expect(normal.width).toBeCloseTo(20, 1)
    expect(normal.height).toBeCloseTo(20, 1)
    expect(zoomed.fontSize).toBe(32)
    expect(zoomed.width).toBeCloseTo(40, 1)
    expect(zoomed.height).toBeCloseTo(40, 1)
  })

  test('sm, md and lg are 16, 20 and 24px next to 16px text', async ({ page }) => {
    await openStory(page, 'sizes-next-to-text')
    const body = page.getByTestId('sizes-body').locator('section[aria-label="body"]')
    for (const [size, pixels] of [
      ['sm', 16],
      ['md', 20],
      ['lg', 24],
    ] as const) {
      const box = await body.locator(`svg[data-size="${size}"]`).first().boundingBox()
      expect(box?.width).toBeCloseTo(pixels, 1)
      expect(box?.height).toBeCloseTo(pixels, 1)
    }
  })
})

test.describe('Icon accessibility', () => {
  test('a11y tree of decorative and meaningful icons', async ({ page }) => {
    await openStory(page, 'decorative-and-meaningful')
    // The decorative icon is not in the tree. The labelled one is an image with its name, which
    // the story prints below it.
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
      - paragraph:
        - text: Nästa tömning är
        - time: 14 oktober 2026
        - text: .
      - paragraph:
        - img "Exempelby kommun"
      - paragraph:
        - status: Exempelby kommun
    `)
  })

  const stories = [
    'default',
    'built-in-set',
    'sizes-next-to-text',
    'in-buttons',
    'status-with-text',
    'colors',
    'decorative-and-meaningful',
    'stroke-widths',
    'rtl',
    'forced-colors',
    'your-own-svg',
    'library-icons-via-the-registry',
    'in-running-text-and-links',
    'unstyled',
  ] as const

  for (const story of stories) {
    test(`no axe violations: ${story}`, async ({ page }) => {
      await page.goto(storyUrl(story))
      await expect(page.locator('#storybook-root > *').first()).toBeVisible()
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
