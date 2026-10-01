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
    const button = await openStory(page, 'activation', 'Spara')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
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
  // kv-compact on <html> or <body> makes every control compact from 64rem, and keeps the
  // comfortable 44px target below it, where touch is likely. Never under 24 × 24 (2.5.8).
  for (const element of ['html', 'body'] as const) {
    test(`kv-compact on <${element}> applies to every button, and keeps 44px below 64rem`, async ({
      page,
    }) => {
      const button = await openStory(page, 'activation', 'Spara')
      const comfortable = await button.boundingBox()
      await page.evaluate((selector) => {
        document.querySelector(selector)?.classList.add('kv-compact')
      }, element)
      const isWide = await page.evaluate(() => window.matchMedia('(width >= 64rem)').matches)
      if (isWide) {
        await expect
          .poll(async () => (await button.boundingBox())?.height)
          .toBeLessThan(comfortable?.height ?? 0)
      }
      const box = await button.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(24)
      expect(box?.height).toBeGreaterThanOrEqual(isWide ? 24 : 44)
    })
  }
})

// Button depth (ADR-0026, docs/design/button-depth.md section 10). Depth is a visual rule, but
// WCAG depends on it in four places, so these read computed styles: keyboard focus shows no
// shadow, so the ring sits on the plain page (2.4.7, 2.4.13); every tinted edge keeps its
// boundary (1.4.11); the contrast themes and forced colours stay flat (1.4.11, 1.4.1); and the
// shadow doesn't animate under reduced motion (2.3.3).

type Rgba = [red: number, green: number, blue: number, alpha: number]

/** The colour as it looks over a backdrop: how a translucent edge reads against its fill. */
function overBackdrop(color: Rgba, backdrop: Rgba): [number, number, number] {
  const [red, green, blue, alpha] = color
  const [backRed, backGreen, backBlue] = backdrop
  return [
    red * alpha + backRed * (1 - alpha),
    green * alpha + backGreen * (1 - alpha),
    blue * alpha + backBlue * (1 - alpha),
  ]
}

const hexToRgb = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
]

/** Within one step per channel: browsers round the mix differently. */
function expectColorClose(actual: readonly number[], expected: readonly number[]) {
  for (const [index, channel] of expected.entries()) {
    expect(Math.abs((actual[index] ?? Number.NaN) - channel)).toBeLessThanOrEqual(1.5)
  }
}

/** The same colour, within 1% per channel: a transition passes through slightly different spaces. */
const sameColor = (first: Rgba, second: Rgba) =>
  first.every(
    (channel, index) =>
      Math.abs(channel - (second[index] ?? 0)) < 0.01 * (index === 3 ? 1 : 255) + 0.5,
  )

/** Any computed colour (`rgb`, `color(srgb …)`, `oklab` mid-transition) as 0-255 channels and alpha. */
async function toRgba(page: Page, colors: readonly string[]): Promise<Rgba[]> {
  return page.evaluate((values) => {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    if (context === null) {
      throw new Error('No 2d canvas to resolve colours with')
    }
    return values.map((value): [number, number, number, number] => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = '#000000'
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      const [red = 0, green = 0, blue = 0, alpha = 0] = context.getImageData(0, 0, 1, 1).data
      return [red, green, blue, alpha / 255]
    })
  }, colors)
}

type Kind = 'secondary' | 'primary' | 'danger'
const kinds = ['secondary', 'primary', 'danger'] as const
const kindSelector: Record<Kind, string> = {
  secondary: '.kv-button:not(.kv-button--primary, .kv-button--danger)',
  primary: '.kv-button--primary',
  danger: '.kv-button--danger',
}

const depthUrl = (globals?: string) =>
  `/iframe.html?id=components-button--depth&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

/** The Depth story's first section (on the page), and a button of one kind in one state. */
async function openDepth(page: Page, globals?: string) {
  await page.goto(depthUrl(globals))
  const section = page.getByRole('region', { name: 'På sidan' })
  await expect(section).toBeVisible()
  if (globals !== undefined) {
    const { mode, contrast } = Object.fromEntries(globals.split(';').map((pair) => pair.split(':')))
    await expect(page.locator('html')).toHaveAttribute('data-kv-color-scheme', String(mode))
    await expect(page.locator('html')).toHaveAttribute('data-kv-contrast', String(contrast))
  }
  // Each kind is three buttons in DOM order: at rest, with a static focus ring, and disabled.
  const restButton = (kind: Kind) => section.locator(kindSelector[kind]).nth(0)
  const disabledButton = (kind: Kind) => section.locator(kindSelector[kind]).nth(2)
  return { restButton, disabledButton }
}

async function readButtonStyle(page: Page, button: Locator) {
  const style = await button.evaluate((element) => {
    const computed = getComputedStyle(element)
    return {
      boxShadow: computed.boxShadow,
      colors: [
        computed.borderTopColor,
        computed.borderRightColor,
        computed.borderBottomColor,
        computed.borderLeftColor,
        computed.backgroundColor,
      ],
      borderStyle: computed.borderTopStyle,
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      outlineOffset: computed.outlineOffset,
      transitionProperty: computed.transitionProperty,
      transitionDuration: computed.transitionDuration,
    }
  })
  const [top, right, bottom, left, fill] = (await toRgba(page, style.colors)) as [
    Rgba,
    Rgba,
    Rgba,
    Rgba,
    Rgba,
  ]
  const { colors: _colors, ...rest } = style
  return { ...rest, top, right, bottom, left, fill }
}

type ButtonStyle = Awaited<ReturnType<typeof readButtonStyle>>

const edges = (style: ButtonStyle) => [style.top, style.right, style.bottom, style.left]
const allEdgesEqual = (style: ButtonStyle) =>
  edges(style).every((edge) => sameColor(edge, style.top))

/** The theme's colour token as the browser resolves it. */
async function tokenColor(page: Page, token: string): Promise<Rgba> {
  const color = await page.evaluate((name) => {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const { color: resolved } = getComputedStyle(probe)
    probe.remove()
    return resolved
  }, token)
  return (await toRgba(page, [color]))[0] ?? [0, 0, 0, 0]
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

/** Moves the pointer onto it, and waits until the browser matches :hover. */
async function hover(button: Locator) {
  await button.hover()
  await expect.poll(() => button.evaluate((element) => element.matches(':hover'))).toBe(true)
}

const settled = (page: Page, button: Locator, check: (style: ButtonStyle) => boolean) =>
  expect.poll(async () => check(await readButtonStyle(page, button))).toBe(true)

test.describe('Button depth: light', () => {
  // The chromium-forced-colors project forces them on: these tests are about the default themes.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'none' })
  })

  for (const kind of kinds) {
    test(`${kind}: a shadow at rest that lifts on hover, and none when pressed`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
      const button = restButton(kind)
      const rest = await readButtonStyle(page, button)
      expect(rest.boxShadow).not.toBe('none')
      await button.hover()
      await settled(
        page,
        button,
        (style) => style.boxShadow !== 'none' && style.boxShadow !== rest.boxShadow,
      )
      await page.mouse.down()
      await settled(page, button, (style) => style.boxShadow === 'none' && allEdgesEqual(style))
      await page.mouse.up()
    })

    test(`${kind}: the bottom edge is tinted darker, the top and sides are the token edge`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
      const style = await readButtonStyle(page, restButton(kind))
      // docs/design/button-depth.md, "Resulting edges". A transparent edge shows over the fill.
      const bottom = { secondary: '#4b4e55', primary: '#424b8e', danger: '#7a1f2f' }[kind]
      expectColorClose(overBackdrop(style.bottom, style.fill), hexToRgb(bottom))
      expect(sameColor(style.top, style.left)).toBe(true)
      expect(sameColor(style.top, style.right)).toBe(true)
      expect(sameColor(style.top, style.bottom)).toBe(false)
      if (kind === 'secondary') {
        expect(sameColor(style.top, await tokenColor(page, '--kv-color-secondary'))).toBe(true)
      }
    })

    test(`${kind}: the hover edge is tinted from its hover colour, and primary keeps its border (ADR-0021)`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
      const button = restButton(kind)
      await button.hover()
      const bottom = { secondary: '#424b8e', primary: '#424b8e', danger: '#671a28' }[kind]
      await settled(page, button, (style) => {
        const mixed = overBackdrop(style.bottom, style.fill)
        return (
          bottom !== undefined &&
          hexToRgb(bottom).every((channel, index) => Math.abs((mixed[index] ?? 0) - channel) <= 1.5)
        )
      })
      const style = await readButtonStyle(page, button)
      if (kind !== 'danger') {
        expect(sameColor(style.top, await tokenColor(page, '--kv-color-primary'))).toBe(true)
      }
    })

    test(`${kind}: disabled is flat, dashed, with the same edge on all four sides`, async ({
      page,
    }) => {
      const { disabledButton } = await openDepth(page, 'mode:light;contrast:standard')
      const style = await readButtonStyle(page, disabledButton(kind))
      expect(style.boxShadow).toBe('none')
      expect(style.borderStyle).toBe('dashed')
      expect(allEdgesEqual(style)).toBe(true)
    })
  }
})

test.describe('Button depth: keyboard focus', () => {
  // The chromium-forced-colors project forces them on: these tests are about the default themes.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'none' })
  })

  for (const kind of kinds) {
    test(`${kind}: Tab shows the ring and no shadow, also while the pointer hovers it`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
      const button = restButton(kind)
      await tabTo(page, button)
      // The shadow fades out over the transition, so wait for it.
      await settled(page, button, (current) => current.boxShadow === 'none')
      let style = await readButtonStyle(page, button)
      // The ring is today's: 2px solid, 2px outside.
      expect(style.outlineStyle).toBe('solid')
      expect(style.outlineWidth).toBe('2px')
      expect(style.outlineOffset).toBe('2px')
      await button.hover()
      await settled(page, button, (current) => current.boxShadow === 'none')
      style = await readButtonStyle(page, button)
      expect(style.outlineStyle).toBe('solid')
      expect(style.outlineWidth).toBe('2px')
    })

    test(`${kind}: pressed while keyboard-focused has no shadow and the same edge on all four sides`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
      const button = restButton(kind)
      await tabTo(page, button)
      await hover(button)
      await page.mouse.down()
      // Both are true at once: pressed must still reset the edges under the focus rule.
      await expect
        .poll(() =>
          button.evaluate(
            (element) => element.matches(':active') && element.matches(':focus-visible'),
          ),
        )
        .toBe(true)
      await settled(page, button, (style) => style.boxShadow === 'none' && allEdgesEqual(style))
      await page.mouse.up()
    })
  }
})

test.describe('Button depth: dark', () => {
  // The chromium-forced-colors project forces them on: these tests are about the default themes.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'none' })
  })

  for (const kind of kinds) {
    test(`${kind}: the top edge is tinted lighter, the bottom keeps the token edge`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:dark;contrast:standard')
      const button = restButton(kind)
      const style = await readButtonStyle(page, button)
      expect(style.boxShadow).not.toBe('none')
      expect(sameColor(style.top, style.bottom)).toBe(false)
      expect(sameColor(style.bottom, style.left)).toBe(true)
      expect(sameColor(style.bottom, style.right)).toBe(true)
      // docs/design/button-depth.md, "Resulting edges". A transparent edge shows over the fill.
      const top = { secondary: '#90949b', primary: '#868fdd', danger: '#ffa7b3' }[kind]
      expectColorClose(overBackdrop(style.top, style.fill), hexToRgb(top))
      if (kind === 'secondary') {
        expect(sameColor(style.bottom, await tokenColor(page, '--kv-color-secondary'))).toBe(true)
      } else {
        // The bottom edge is the token edge, transparent: the fill is the boundary.
        expect(style.bottom[3]).toBe(0)
      }
    })

    test(`${kind}: a shadow that lifts on hover, and none when pressed or focused`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:dark;contrast:standard')
      const button = restButton(kind)
      const rest = await readButtonStyle(page, button)
      await button.hover()
      await settled(
        page,
        button,
        (style) => style.boxShadow !== 'none' && style.boxShadow !== rest.boxShadow,
      )
      await page.mouse.down()
      await settled(page, button, (style) => style.boxShadow === 'none' && allEdgesEqual(style))
      await page.mouse.up()
    })

    test(`${kind}: keyboard focus shows no shadow, also while the pointer hovers it`, async ({
      page,
    }) => {
      const { restButton } = await openDepth(page, 'mode:dark;contrast:standard')
      const button = restButton(kind)
      await tabTo(page, button)
      await settled(page, button, (style) => style.boxShadow === 'none')
      await hover(button)
      await settled(page, button, (style) => style.boxShadow === 'none')
      expect((await readButtonStyle(page, button)).outlineStyle).toBe('solid')
    })

    test(`${kind}: disabled is flat, dashed, with the same edge on all four sides`, async ({
      page,
    }) => {
      const { disabledButton } = await openDepth(page, 'mode:dark;contrast:standard')
      const style = await readButtonStyle(page, disabledButton(kind))
      expect(style.boxShadow).toBe('none')
      expect(style.borderStyle).toBe('dashed')
      expect(allEdgesEqual(style)).toBe(true)
    })
  }
})

test.describe('Button depth: contrast themes are flat', () => {
  // The chromium-forced-colors project forces them on: these tests are about the default themes.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'none' })
  })

  const themes = ['mode:light;contrast:more', 'mode:dark;contrast:more']

  for (const globals of themes) {
    for (const kind of kinds) {
      test(`${kind} (${globals}): no shadow and the same edge on all four sides, at rest and on hover`, async ({
        page,
      }) => {
        const { restButton, disabledButton } = await openDepth(page, globals)
        const button = restButton(kind)
        let style = await readButtonStyle(page, button)
        expect(style.boxShadow).toBe('none')
        expect(allEdgesEqual(style)).toBe(true)
        await hover(button)
        await settled(
          page,
          button,
          (current) => current.boxShadow === 'none' && allEdgesEqual(current),
        )
        style = await readButtonStyle(page, disabledButton(kind))
        expect(style.boxShadow).toBe('none')
        expect(style.borderStyle).toBe('dashed')
        expect(allEdgesEqual(style)).toBe(true)
      })
    }
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`prefers-contrast: more without the theme attributes is flat (${colorScheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, contrast: 'more' })
      const { restButton } = await openDepth(page)
      // What a page without KvirnProvider or KvirnThemeScript looks like: the OS chooses.
      await page.evaluate(() => {
        document.documentElement.removeAttribute('data-kv-color-scheme')
        document.documentElement.removeAttribute('data-kv-contrast')
      })
      for (const kind of kinds) {
        const button = restButton(kind)
        await settled(page, button, (style) => style.boxShadow === 'none' && allEdgesEqual(style))
        await hover(button)
        await settled(page, button, (style) => style.boxShadow === 'none' && allEdgesEqual(style))
      }
    })
  }
})

test.describe('Button depth: forced colours and reduced motion', () => {
  for (const kind of kinds) {
    test(`${kind}: forced colours are flat with a system edge on all four sides, at rest, on hover and disabled`, async ({
      page,
    }) => {
      await page.emulateMedia({ forcedColors: 'active' })
      const { restButton, disabledButton } = await openDepth(page)
      const button = restButton(kind)
      let style = await readButtonStyle(page, button)
      expect(style.boxShadow).toBe('none')
      expect(allEdgesEqual(style)).toBe(true)
      const flat = (current: ButtonStyle) => current.boxShadow === 'none' && allEdgesEqual(current)
      await hover(button)
      await settled(page, button, flat)
      await page.mouse.down()
      await expect.poll(() => button.evaluate((element) => element.matches(':active'))).toBe(true)
      await settled(page, button, flat)
      await page.mouse.up()
      style = await readButtonStyle(page, disabledButton(kind))
      expect(style.boxShadow).toBe('none')
      expect(style.borderStyle).toBe('dashed')
      expect(allEdgesEqual(style)).toBe(true)
    })
  }

  test('reduced motion: the shadow does not transition (2.3.3)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
    for (const kind of kinds) {
      const style = await readButtonStyle(page, restButton(kind))
      expect(
        style.transitionDuration.split(',').every((duration) => Number.parseFloat(duration) === 0),
      ).toBe(true)
    }
  })

  test('without a motion preference, the shadow transitions with the other button properties', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const { restButton } = await openDepth(page, 'mode:light;contrast:standard')
    for (const kind of kinds) {
      const style = await readButtonStyle(page, restButton(kind))
      expect(style.transitionProperty.split(', ')).toEqual(
        expect.arrayContaining(['background-color', 'border-color', 'color', 'box-shadow']),
      )
    }
  })
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
