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

`apps/storybook/src/components/<name>/<name>.stories.tsx`:

```tsx
import { Disclosure } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

const meta = { title: 'Components/Disclosure', component: Disclosure.Root } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}
export const Open: Story = { args: { defaultOpen: true } }
export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect(canvas.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  },
}
```

## E2E (Playwright)

`apps/storybook/src/components/<name>/<name>.e2e.ts` (Playwright finds `**/*.e2e.ts` under `apps/storybook/src`):

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { wcagTags } from '@kvirn-ui/testing'

const url = '/iframe.html?id=primitives-disclosure--closed'

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

Stories need no axe code: the a11y addon runs axe with the WCAG 2.2 AA tags on every story in `vp test run`, and any violation fails the test (`parameters.a11y.test: 'error'` in `apps/storybook/.storybook/preview.tsx`).
