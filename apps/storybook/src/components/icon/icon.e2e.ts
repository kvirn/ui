import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/icon/icon.a11y.md › Keyboard, Visual / modes. One test per row,
// named after it. An icon handles no keys: these prove it never takes a Tab stop. The mode
// checks (forced colours, reflow) assert the outcome, not the look. RTL mirroring and text
// resize are proven by attribute and size tests in icon.test.tsx, not here.

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
    for (const story of ['in-buttons', 'decorative-and-meaningful']) {
      await openStory(page, story)
      const stops = await page.locator('button').count()
      for (let count = 0; count <= stops; count += 1) {
        await page.keyboard.press('Shift+Tab')
        expect(await isFocusOnIcon(page), `${story}: Shift+Tab stop ${count + 1}`).toBe(false)
      }
    }
  })
})

// Rule-13 exception, approved by the maintainer 2026-10-04 (testing skill, "Named exceptions"):
// browser capability. The claim is that the engine resolves `var()` in SVG presentation
// attributes, which only a real engine can show. It runs on chromium by default and on WebKit
// with `E2E_BROWSERS=webkit vp run e2e icon.e2e.ts --project webkit`.
test.describe('Icon custom property paint', () => {
  test('a CSS custom property works as an icon colour in this engine (rule-13 exception: browser capability)', async ({
    page,
  }) => {
    await openStory(page, 'token-channels')
    const token = 'var(--kv-color-danger)'
    const channels = await page.evaluate((value) => {
      const svgNamespace = 'http://www.w3.org/2000/svg'
      return (['color', 'fill', 'stroke'] as const).map((channel) => {
        const icon = document.querySelector<SVGSVGElement>(`svg.kv-icon[${channel}="${value}"]`)
        if (icon === null || icon.parentElement === null) {
          return { channel, found: false, painted: '', resolvedToken: '', unset: '' }
        }
        const parent = icon.parentElement
        // Probes next to the icon resolve the same custom property in the same engine, and
        // serialise the colour the way the icon's own computed value is serialised.
        const resolve = (style: string) => {
          const probe = document.createElementNS(svgNamespace, 'svg')
          probe.setAttribute('style', style)
          parent.append(probe)
          const resolved = getComputedStyle(probe)[channel]
          probe.remove()
          return resolved
        }
        return {
          channel,
          found: true,
          painted: getComputedStyle(icon)[channel],
          resolvedToken: resolve(`${channel}: ${value}`),
          unset: resolve(''),
        }
      })
    }, token)
    for (const result of channels) {
      expect(result.found, `an icon sets ${result.channel}="${token}"`).toBe(true)
      // The token resolved to a colour: it is not the initial or inherited value.
      expect(result.resolvedToken, `${result.channel}: the token resolves`).not.toBe(result.unset)
      expect(result.painted, `${result.channel}: the icon paints the token`).toBe(
        result.resolvedToken,
      )
      expect(result.painted, `${result.channel}: not the fallback`).not.toBe(result.unset)
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
        values: [svg, ...svg.querySelectorAll('*')].flatMap((element) => {
          const style = getComputedStyle(element)
          return [style.fill, style.stroke]
        }),
      })),
    )

  test('a hard-coded color, fill and stroke render in the system colour', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'forced-colors')
    // Control: the story still hard-codes the colour on all three channels, so the test below
    // can fail. Without it, a story that dropped the red would pass vacuously.
    for (const channel of ['color', 'fill', 'stroke']) {
      expect(
        await page.locator(`svg.kv-icon[${channel}="#c00"]`).count(),
        `the story sets ${channel}="#c00"`,
      ).toBeGreaterThan(0)
    }
    const paint = await paintOf(page)
    // Four groups (color, fill, stroke, token), each with an icon in text, a Button and a Link.
    expect(paint).toHaveLength(12)
    for (const icon of paint) {
      expect(icon.color, `${icon.group} color`).not.toBe(hardCodedRed)
      expect(icon.values, `${icon.group} fill and stroke`).not.toContain(hardCodedRed)
    }
  })
})

test.describe('Icon reflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
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
    'token-channels',
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
