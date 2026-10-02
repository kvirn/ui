# Test templates

Verified 2026-09-30 against Vite+ 1.0 (Vitest 5 browser mode), Playwright 1.63 and Storybook 10.6. Import test APIs from `vite-plus/test*`, never from `vitest`. Update this file when they change.

## Machine (core)

```ts
import { describe, expect, it } from 'vite-plus/test'
import { createDisclosureMachine } from './disclosure'

describe('disclosure machine', () => {
  it('toggles open on TOGGLE', () => {
    const disclosureMachine = createDisclosureMachine({ defaultOpen: false })
    expect(disclosureMachine.send({ type: 'TOGGLE' }).open).toBe(true)
  })
})
```

## Component + axe (Vitest browser mode)

```tsx
import { expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { Disclosure } from './disclosure'

const Fixture = () => (
  <Disclosure.Root>
    <Disclosure.Trigger>Visa mer</Disclosure.Trigger>
    <Disclosure.Panel>Innehåll</Disclosure.Panel>
  </Disclosure.Root>
)

test('trigger exposes aria-expanded and toggles panel', async () => {
  const { container } = await render(<Fixture />)
  const trigger = page.getByRole('button', { name: 'Visa mer' })
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(trigger)
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  await expectNoA11yViolations(container)
})
```

`expectNoA11yViolations` wraps `axe.run(element, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] } })` and fails with a readable list of violations.

## Story

`apps/storybook/src/components/<name>/<name>.stories.tsx`, following ADR-0023:

- `meta.component` is the real component, with shared `args`, so the Docs page (autodocs) shows its props. `satisfies Meta<typeof X>`.
- Most stories are `{}` or `{ args }`, with a one-line JSDoc that says what the story shows. `render` only for compositions (a matrix, a form, a navigation list). No `<main><h1>` page wrapper.
- Play functions take `canvas` and `userEvent` from the story context.
- No fixed-theme exports (`Light`, `Dark`, …): `vp test run` runs every story in four theme projects. A story that is only valid in one theme pins it with `globals: { mode: 'light', contrast: 'standard' }` and says why.
- Visible fixture text is in one locale, with a matching `globals: { locale }` (3.1.2).
- Keep `RTL` and `ForcedColors`, and every story an e2e spec targets.
- Pass the contract as `parameters.a11yContract` (a `?raw` import), so the Docs page renders its Keyboard section. A component with a focusable part has a story named `Keyboard`, the fixture its e2e keyboard tests drive (ADR-0039, the `keyboard` skill).

```tsx
import { Disclosure } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/react/src/disclosure/disclosure.a11y.md?raw'

const meta = {
  title: 'Components/Disclosure',
  component: Disclosure.Root,
  args: {
    children: (
      <>
        <Disclosure.Trigger>Visa mer</Disclosure.Trigger>
        <Disclosure.Panel>Innehåll</Disclosure.Panel>
      </>
    ),
  },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract },
} satisfies Meta<typeof Disclosure.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Closed: the panel is hidden and the trigger says so with `aria-expanded`. */
export const Default: Story = {}

/** Open from the start. */
export const Open: Story = { args: { defaultOpen: true } }

/** The keyboard fixture: try the keys in the Keyboard section. Enter toggles the panel and keeps focus on the trigger. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('button', { name: 'Visa mer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  },
}

/** Right to left, in English. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: {
    children: (
      <>
        <Disclosure.Trigger>Show more</Disclosure.Trigger>
        <Disclosure.Panel>Content</Disclosure.Panel>
      </>
    ),
  },
}

/** With the forced-colors marker. The e2e suite checks it with real emulation. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
```

Stories that drive the theme store themselves (the `KvirnProvider` stories) opt out of the preview's Mode and Contrast with `parameters: { themeStore: 'story' }`.

## E2E (Playwright)

`apps/storybook/src/components/<name>/<name>.e2e.ts` (Playwright finds `**/*.e2e.ts` under `apps/storybook/src`):

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { wcagTags } from '@kvirn-ui/testing'

const url = '/iframe.html?id=components-disclosure--keyboard'

test.describe('Disclosure keyboard contract', () => {
  test('Enter toggles', async ({ page }) => {
    await page.goto(url)
    const trigger = page.getByRole('button', { name: 'Visa mer' })
    await expect(trigger).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(trigger).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  test('Space toggles', async ({ page }) => {
    /* … */
  })

  test('a11y tree', async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
      - button "Visa mer" [expanded=false]
    `)
  })

  test('no axe violations', async ({ page }) => {
    await page.goto(url)
    const axeResults = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
    expect(axeResults.violations).toEqual([])
  })
})
```

Playwright projects: `chromium`, `firefox`, `webkit`, `chromium-forced-colors`, `chromium-reduced-motion`, `mobile-safari`, `mobile-chrome`, `reflow-320`.

Wait for the story to render (`await expect(locator).toBeVisible()`) before pressing keys. Otherwise the first `Tab` can land before the story mounts.

Stories need no axe code: the a11y addon runs axe with the WCAG 2.2 AA tags on every story in `vp test run`, once in each of the four `storybook*` projects (light, dark, light and dark with more contrast), and any violation fails the test (`parameters.a11y.test: 'error'` in `apps/storybook/.storybook/preview.tsx`).

An e2e spec selects a theme the way the toolbar does: `/iframe.html?id=<story-id>&viewMode=story&globals=mode:dark;contrast:more`. Assert that `<html>` got `data-kv-color-scheme` and `data-kv-contrast`, so an ignored parameter can't pass silently.
