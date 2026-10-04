import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Components/Form/Overview: the permit form with every control. The keys are each control's own
// (text-input.a11y.md, date-input.a11y.md, radio-group.a11y.md, checkbox-group.a11y.md): these tests
// prove the controls compose, so Tab walks them in reading order, and that the form fits 320px.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-overview--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('form').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

/** The focused control's label (an input) or text (a button). */
const focusedName = (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement
    if (element instanceof HTMLInputElement) {
      return element.labels?.[0]?.textContent?.trim() ?? ''
    }
    return element?.textContent?.trim() ?? ''
  })

test.describe('Overview form', () => {
  test('Tab walks every control once, in reading order', async ({ page }) => {
    await openStory(page, 'keyboard')
    const walked: string[] = []
    for (let step = 0; step < 13; step += 1) {
      await page.keyboard.press('Tab')
      walked.push(await focusedName(page))
    }
    expect(walked).toEqual([
      'Fullständigt namn',
      // The date: year, month, day in `sv`.
      'År',
      'Månad',
      'Dag',
      'Fordonets registreringsnummer',
      'E-postadress',
      'Telefonnummer (valfritt)',
      // The radio group is one stop, at its first radio when none is checked.
      '1 månad',
      // Each checkbox is its own stop.
      'E-post',
      'Sms',
      'Brev',
      'Jag intygar att uppgifterna jag har lämnat är korrekta',
      'Skicka ansökan',
    ])
  })

  test('no horizontal scrolling at 320px in the Finnish and error stories (1.4.10)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const story of ['short-form', 'short-form-with-errors', 'finnish']) {
      await openStory(page, story)
      expect(await hasHorizontalScroll(page), story).toBe(false)
    }
  })
})

test.describe('Overview accessibility', () => {
  // The Overview stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string?])[] = [
    ['short-form'],
    ['keyboard'],
    ['short-form-with-errors'],
    ['finnish'],
    ['compact'],
    ['rtl'],
    ['forced-colors'],
    ...themes.map((theme) => ['short-form-with-errors', theme] as const),
  ]

  for (const [story, globals] of stories) {
    const name = globals === undefined ? story : `${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
