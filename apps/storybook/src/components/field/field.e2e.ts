import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/field/field.a11y.md › Keyboard, Focus management and Visual /
// modes. One test per row, named after it. Field handles no keys: these prove it never gets in
// the controls' way. The Label, Hint (`Field.Hint`, and `Field.Prose` as the description) and
// ErrorMessage pages are covered here too: they are the same parts. KvirnUI holds no form state, so every story sets `invalid` itself.

/** `globals` selects the theme like the toolbar does, such as `mode:dark;contrast:more`. */
const storyUrl = (page: string, story: string, globals?: string) =>
  `/iframe.html?id=components-form-${page}--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, pageName: string, story: string, globals?: string) {
  await page.goto(storyUrl(pageName, story, globals))
  await expect(page.locator('.kv-field, .kv-fieldset').first()).toBeVisible()
  if (globals !== undefined) {
    // The theme store resolved the selected theme onto <html>.
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

test.describe('Field keyboard contract', () => {
  test('Tab moves through the controls in DOM order', async ({ page }) => {
    // The Keyboard story shows every state: the disabled input is skipped, the read-only
    // one is a Tab stop. Label, hint and error text never are.
    await openStory(page, 'field', 'keyboard')
    const names = ['Fullständigt namn', 'E-postadress', 'Telefonnummer (valfritt)', 'Personnummer']
    for (const name of names) {
      await page.keyboard.press('Tab')
      await expect(page.getByRole('textbox', { name })).toBeFocused()
    }
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('textbox', { name: 'Telefonnummer (valfritt)' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(page.getByRole('textbox', { name: 'E-postadress' })).toBeFocused()
  })

  test('Tab moves through the controls in DOM order in right to left', async ({ page }) => {
    await openStory(page, 'field', 'rtl')
    // Right to left changes the layout, not the order: Tab still follows the DOM.
    for (const name of ['Full name', 'Email address', 'Phone number (optional)']) {
      await page.keyboard.press('Tab')
      await expect(page.getByRole('textbox', { name })).toBeFocused()
    }
  })

  test('Tab goes to the control on the Label, Hint and ErrorMessage pages', async ({ page }) => {
    // The Hint page's fixture is a field with a description above and a hint under the input.
    for (const [pageName, name] of [
      ['label', 'Fullständigt namn'],
      ['hint', 'Personnummer'],
      ['errormessage', 'Fullständigt namn'],
    ] as const) {
      await openStory(page, pageName, 'keyboard')
      const input = page.getByRole('textbox', { name })
      await page.keyboard.press('Tab')
      await expect(input).toBeFocused()
      // The next Tab leaves the page or wraps to the control: never to the label or the text.
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.tagName)).toMatch(/^(?:INPUT|BODY)$/)
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => document.activeElement?.tagName)).toMatch(/^(?:INPUT|BODY)$/)
    }
  })

  test('clicking the label focuses the input', async ({ page }) => {
    await openStory(page, 'field', 'default')
    await page.getByText('Fullständigt namn').click()
    await expect(page.getByRole('textbox', { name: 'Fullständigt namn' })).toBeFocused()
  })

  test('clicking the optional text in the label focuses the input', async ({ page }) => {
    await openStory(page, 'field', 'optional')
    await page.locator('.kv-field-optional').click()
    await expect(page.getByRole('textbox', { name: 'Telefonnummer (valfritt)' })).toBeFocused()
  })

  test('Tab skips the hint and the error message', async ({ page }) => {
    // The description above, the hint under the input and the error are all text.
    await openStory(page, 'field', 'invalid-with-hint-under')
    const input = page.getByRole('textbox', { name: 'Fordonets registreringsnummer' })
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    // Past the only control, focus leaves the page or wraps back to it: it never lands on the
    // label, the hint or the error. Browsers differ on which, so only the tag is asserted.
    for (let count = 0; count < 3; count += 1) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.tagName)).toMatch(/^(?:INPUT|BODY)$/)
    }
    for (const text of await page
      .locator('.kv-field > .kv-prose, .kv-field-hint, .kv-field-error-message, .kv-field-label')
      .all()) {
      await expect(text).not.toHaveAttribute('tabindex', /.*/)
    }
  })

  test('the error is read with the input: its name, state and description', async ({ page }) => {
    await openStory(page, 'field', 'invalid')
    const input = page.getByRole('textbox', { name: 'E-postadress' })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    // The hint first, then the error with its prefix.
    await expect(input).toHaveAccessibleDescription(
      'Vi skickar beslutet till den här adressen. Fel: Ange en e-postadress i rätt format, till exempel namn@exempel.se',
    )
  })
})

test.describe('Field focus and modes', () => {
  test('the focus ring is visible on the input, and on an invalid input with its edge', async ({
    page,
  }) => {
    await openStory(page, 'field', 'invalid')
    const input = page.getByRole('textbox', { name: 'E-postadress' })
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await expect(input).toHaveCSS('outline-style', 'solid')
    await expect(input).toHaveCSS('outline-width', '2px')
    await expect(input).toHaveCSS('outline-offset', '2px')
    // Focused and invalid: the ring and the 2px edge together.
    await expect(input).toHaveCSS('border-top-width', '2px')
  })

  test('the focus ring is not clipped by the field', async ({ page }) => {
    await openStory(page, 'field', 'default')
    await page.keyboard.press('Tab')
    for (const part of await page.locator('.kv-field').all()) {
      await expect(part).toHaveCSS('overflow', 'visible')
    }
  })

  test('forced colours: the invalid input keeps a 2px border', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'field', 'forced-colors')
    const valid = page.getByRole('textbox', { name: 'Fullständigt namn' })
    const invalid = page.getByRole('textbox', { name: 'E-postadress' })
    const disabled = page.getByRole('textbox', { name: 'Fordonets registreringsnummer' })
    const edge = (input: typeof valid) =>
      input.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          width: Number.parseFloat(style.borderTopWidth),
          style: style.borderTopStyle,
          differsFromBackground: style.borderTopColor !== style.backgroundColor,
        }
      })
    // The width and the message carry the state, not the colour (1.4.1, 1.4.11).
    expect(await edge(valid)).toEqual({ width: 1, style: 'solid', differsFromBackground: true })
    expect(await edge(invalid)).toEqual({ width: 2, style: 'solid', differsFromBackground: true })
    // Disabled is dashed, not only a different colour.
    expect(await edge(disabled)).toEqual({ width: 1, style: 'dashed', differsFromBackground: true })
  })

  test('forced colours: the error message and its prefix stay visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await openStory(page, 'errormessage', 'in-field')
    const message = page.locator('.kv-field-error-message')
    await expect(message).toBeVisible()
    await expect(message.getByText('Ange ditt fullständiga namn')).toBeVisible()
    // The text colour is the system text colour, like the label's, and the icon follows it.
    const label = page.locator('.kv-field-label')
    expect(await message.evaluate((element) => getComputedStyle(element).color)).toBe(
      await label.evaluate((element) => getComputedStyle(element).color),
    )
    await expect(message.locator('.kv-icon')).toBeVisible()
    // The prefix is for screen readers: 1px, and never display: none (3.3.1).
    const prefix = message.locator('.kv-field-error-prefix')
    await expect(prefix).toHaveText('Fel:')
    await expect(prefix).not.toHaveCSS('display', 'none')
    expect(await prefix.boundingBox()).toMatchObject({ width: 1, height: 1 })
  })

  test('reduced motion: the input does not transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page, 'field', 'default')
    await expect(page.getByRole('textbox')).toHaveCSS('transition-duration', '0s')
  })

  test('no horizontal scrolling at 320px with the Finnish label (1.4.10)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const [pageName, story] of [
      ['field', 'long-finnish'],
      ['label', 'long-finnish'],
      ['hint', 'long-finnish'],
      ['errormessage', 'long-message'],
    ] as const) {
      await openStory(page, pageName, story)
      await expect(page.locator('.kv-field').first()).toBeVisible()
      expect(await hasHorizontalScroll(page), `${pageName}: ${story}`).toBe(false)
    }
  })

  test('no horizontal scrolling at 320px with the full-width input and every state', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'field', 'forced-colors')
    expect(await hasHorizontalScroll(page)).toBe(false)
    const field = await page.locator('.kv-field').first().boundingBox()
    // The input fills the 288px column: 16px gutters on both sides.
    expect(field?.width).toBeGreaterThan(280)
  })

  test('the Finnish label wraps over more than one line at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await openStory(page, 'label', 'long-finnish')
    const label = page.locator('.kv-field-label')
    const lineHeight = await label.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).lineHeight),
    )
    expect((await label.boundingBox())?.height).toBeGreaterThan(lineHeight * 1.5)
  })

  // The WCAG 1.4.12 overrides (.storybook/preview.css: .kv-story-text-spacing), at 320px.
  for (const [pageName, story] of [
    ['field', 'long-finnish'],
    ['hint', 'long-finnish'],
    ['field', 'invalid'],
    ['errormessage', 'long-message'],
  ] as const) {
    test(`text spacing overrides clip nothing at 320px (1.4.12): ${pageName} ${story}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await openStory(page, pageName, story)
      await page.evaluate(() => {
        document.body.classList.add('kv-story-text-spacing')
      })
      await expect(page.locator('.kv-field > .kv-prose, .kv-field-label').first()).toHaveCSS(
        'letter-spacing',
        /^[1-9]/,
      )
      const problems = await page.evaluate(() => {
        const found: string[] = []
        const root = document.documentElement
        if (root.scrollWidth > root.clientWidth) {
          found.push(`page scrolls sideways: ${root.scrollWidth} > ${root.clientWidth}`)
        }
        for (const field of document.querySelectorAll<HTMLElement>('.kv-field')) {
          const fieldBox = field.getBoundingClientRect()
          for (const element of field.querySelectorAll<HTMLElement>('*')) {
            if (element.closest('.kv-field-error-prefix') !== null) {
              continue
            }
            const style = getComputedStyle(element)
            if (style.display === 'inline' || style.display === 'contents') {
              continue
            }
            const box = element.getBoundingClientRect()
            const name = `${element.tagName.toLowerCase()}${[...element.classList].map((className) => `.${className}`).join('')}`
            if (box.left < fieldBox.left - 0.5 || box.right > fieldBox.right + 0.5) {
              found.push(`${name} sticks out of its field`)
            }
            if (element.tagName !== 'INPUT' && element.scrollHeight > element.clientHeight + 1) {
              found.push(`${name} overflows its height`)
            }
          }
        }
        return found
      })
      expect(problems).toEqual([])
    })
  }

  test('right to left: the label, hint and error start at the right, and the icon does not mirror', async ({
    page,
  }) => {
    await openStory(page, 'field', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    const boxes = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect()
        return rect === undefined ? undefined : { left: rect.left, right: rect.right }
      }
      return {
        field: box('.kv-field'),
        label: box('.kv-field-label'),
        icon: box('.kv-field-error-message > .kv-icon'),
        message: box('.kv-field-error-message'),
        // A width-class input keeps to the inline start: the right.
        narrow: box('.kv-input--width-20'),
      }
    })
    expect(boxes.field && boxes.label && boxes.icon && boxes.message && boxes.narrow).toBeTruthy()
    expect(Math.abs((boxes.label?.right ?? 0) - (boxes.field?.right ?? 1))).toBeLessThan(2)
    // The error icon is on the right, at the inline start of the message.
    expect(Math.abs((boxes.icon?.right ?? 0) - (boxes.message?.right ?? 1))).toBeLessThan(2)
    expect(Math.abs((boxes.narrow?.right ?? 0) - (boxes.field?.right ?? 1))).toBeLessThan(2)
  })
})

test.describe('Field accessibility', () => {
  test('a11y tree of an invalid field', async ({ page }) => {
    await openStory(page, 'field', 'invalid')
    await expect(page.locator('.kv-field')).toMatchAriaSnapshot(`
      - text: E-postadress
      - paragraph: Vi skickar beslutet till den här adressen.
      - textbox "E-postadress" [invalid]: anna@
      - paragraph: "Fel: Ange en e-postadress i rätt format, till exempel namn@exempel.se"
    `)
  })

  // The Field stories in each of the four themes, selected like the Mode and Contrast toolbars.
  const themes = [
    'mode:light;contrast:standard',
    'mode:dark;contrast:standard',
    'mode:light;contrast:more',
    'mode:dark;contrast:more',
  ] as const
  const stories: readonly (readonly [string, string, string?])[] = [
    ['field', 'default'],
    ['field', 'with-description'],
    ['field', 'optional'],
    ['field', 'required'],
    ['field', 'invalid'],
    ['field', 'disabled'],
    ['field', 'read-only'],
    ['field', 'as-page-heading'],
    ['field', 'inside-prose'],
    ['field', 'compact'],
    ['field', 'long-finnish'],
    ['field', 'rtl'],
    ['field', 'forced-colors'],
    ['label', 'default'],
    ['label', 'optional'],
    ['label', 'without-marker'],
    ['label', 'as-page-heading'],
    ['label', 'long-finnish'],
    ['label', 'compact'],
    ['field', 'with-hint-under'],
    ['field', 'invalid-with-hint-under'],
    ['hint', 'keyboard'],
    ['hint', 'under-the-control'],
    ['hint', 'with-description'],
    ['hint', 'invalid'],
    ['hint', 'in-fieldset'],
    ['hint', 'option-hints'],
    ['hint', 'size-follows-the-part'],
    ['hint', 'disabled'],
    ['hint', 'read-only'],
    ['hint', 'compact'],
    ['hint', 'long-finnish'],
    ['hint', 'rtl'],
    ['hint', 'forced-colors'],
    ['errormessage', 'in-field'],
    ['errormessage', 'not-invalid'],
    ['errormessage', 'in-fieldset'],
    ['errormessage', 'long-message'],
    ['errormessage', 'compact'],
    ...themes.map((theme) => ['field', 'forced-colors', theme] as const),
  ]

  for (const [pageName, story, globals] of stories) {
    const name =
      globals === undefined ? `${pageName} ${story}` : `${pageName} ${story} (${globals})`

    test(`no axe violations: ${name}`, async ({ page }) => {
      await openStory(page, pageName, story, globals)
      const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(axeResults.violations).toEqual([])
    })
  }
})
