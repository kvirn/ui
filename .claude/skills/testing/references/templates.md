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

## Keyboard rows (same component test)

One test per contract row, named after it. `userEvent` sends real key events, so these are the keyboard contract's proof (the Test cell names the file and the title).

```tsx
test('Enter toggles the panel and keeps focus on the trigger', async () => {
  await render(<Fixture />)
  const trigger = page.getByRole('button', { name: 'Visa mer' })
  await userEvent.tab()
  await expect.element(trigger).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect.element(trigger).toHaveFocus()
})

test('ArrowLeft moves to the next item in RTL', async () => {
  await render(
    <div dir="rtl">
      <Fixture />
    </div>,
  )
  /* press the key, then assert focus and the active item */
})
```

Press keys only after the element is in the page (`await expect.element(...).toBeVisible()`), and assert focus after every key that should move it.

## Story

`apps/storybook/src/components/<name>/<name>.stories.tsx`, following these conventions:

- `meta.component` is the real component, with shared `args`, so the Docs page (autodocs) shows its props. `satisfies Meta<typeof X>`.
- Most stories are `{}` or `{ args }`, with a one-line JSDoc that says what the story shows. `render` only for compositions (a matrix, a form, a navigation list). No `<main><h1>` page wrapper. `layout` stays `padded` (the default), and is `fullscreen` only for page stories.
- Play functions take `canvas` and `userEvent` from the story context.
- No fixed-theme exports (`Light`, `Dark`, …): `vp test run` runs every story in four theme projects. A story that is only valid in one theme pins it with `globals: { mode: 'light', contrast: 'standard' }` and says why.
- Visible fixture text is in one locale, with a matching `globals: { locale }` (3.1.2).
- Keep `RTL` and `ForcedColors`.
- Pass the contract as `parameters.a11yContract` (a `?raw` import), so the Docs page renders its Keyboard section. A component with a focusable part has a story named `Keyboard`, the fixture for trying the keys by hand (the `keyboard` skill).

```tsx
import { Disclosure } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/react/src/disclosure/disclosure.a11y.md?raw'

const meta = {
  title: 'Components/Content/Disclosure',
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

/** With the forced-colors marker. The display-mode sweep checks it with real emulation. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
```

Stories that drive the theme store themselves (the `KvirnProvider` stories) opt out of the preview's Mode and Contrast with `parameters: { themeStore: 'story' }`.

Stories need no axe code: the a11y addon runs axe with the WCAG 2.2 AA tags on every story in `vp test run`, once in each of the four `storybook*` projects (light, dark, light and dark with more contrast), and any violation fails the test (`parameters.a11y.test: 'error'` in `apps/storybook/.storybook/preview.tsx`).
