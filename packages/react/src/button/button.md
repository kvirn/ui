# Button

A native `<button>` for actions. For navigation, use [Link](../link/link.md).

- `type="button"` by default, so a Button never submits a form by accident. Use `type="submit"` for the button that does. `type="reset"` puts the form's fields back to their starting values.
- `disabled` makes it natively disabled: skipped by Tab.
- `disabled` plus `focusableWhenDisabled` keeps it in the Tab order with `aria-disabled="true"`, so keyboard and screen-reader users can find it and read why. Click, Enter, Space and form submission stay blocked, and your `onClick` is not called.
- `busy` marks a running action: `aria-disabled="true"` and `data-busy`, never native `disabled`, so focus stays and every press is blocked. While busy it renders a decorative `<span class="kv-spinner" aria-hidden="true">` as its first child (theme: shown at once, `currentColor`, no new prop); the name and `aria-disabled` are unchanged. Put a [Progress](../progress/progress.md) with the words beside it, without a `Progress.Indicator`: one indicator per wait. `disabled` wins when both are set.
- Link look: add `className="kv-button--link"` for an action that changes something in place, in a row of links (Display settings in a top bar, a disclosure with its chevron, a toggle with `aria-expanded` or `aria-pressed`). It reads as a link: no fill, edge or depth, underlined on hover only, at least 24px tall. Never for submitting, going on a step or a destructive action: those stay buttons. In a `TopBar` it takes the bar's on-colour.
- Compact: add `className="kv-button--compact"` for a button as tall as a compact input (32px, 14px label), so the two line up in a staff tool. From 64rem only: below it, where touch is likely, it stays 44px like the inputs beside it.
- Headless: no CSS. It renders `class="kv-button"`, the part's stable class, and your `className` joins it. Style `.kv-button` and the state attributes `[data-disabled]`, `[data-busy]` (set only while `busy` and not `disabled`) and `[data-focus-visible]` (or `:focus-visible`). With `@kvirn-ui/theme/theme.css` imported, it is styled: add `className="kv-button--primary"` or `className="kv-button--danger"` for a variant.

## Component

```tsx
import { Button } from '@kvirn-ui/react'

<Button onClick={save}>Save</Button>
<Button type="submit">Submit application</Button>

<p id="submit-help">Fill in all required fields before you submit.</p>
<Button type="submit" disabled focusableWhenDisabled aria-describedby="submit-help">
  Submit application
</Button>
```

Prefer an enabled button that explains what's missing on submit. When you do disable one, say why in text next to it.

### Your own element

The Button renders a native `<button>`. To build your own element, use `useButton()` and spread `buttonProps` (see Hook below). Put your handler in `useButton({ onClick })`, not on top of `buttonProps.onClick`: it is what blocks activation while disabled.

If a button can be disabled while it has focus, for example one that disables itself when pressed, use `focusableWhenDisabled`. Otherwise focus drops to the page body.

## Hook

```tsx
import { useButton } from '@kvirn-ui/react'

function SaveButton({ isSaving }: { isSaving: boolean }) {
  const button = useButton({ disabled: isSaving, focusableWhenDisabled: true, onClick: save })
  return <button {...button.buttonProps}>Save</button>
}
```

Pass your click handler as `useButton({ onClick })`. A handler merged on top of `buttonProps` isn't blocked while disabled. `buttonProps.className` is `kv-button`: add a variant class with `mergeProps`, which joins class names, instead of overriding it.

```tsx
<button {...mergeProps(button.buttonProps, { className: 'kv-button--primary' })}>Send</button>
```

| Option                  | Type                                   | Default    |
| ----------------------- | -------------------------------------- | ---------- |
| `disabled`              | `boolean`                              | `false`    |
| `focusableWhenDisabled` | `boolean`                              | `false`    |
| `busy`                  | `boolean`                              | `false`    |
| `type`                  | `'button' \| 'submit' \| 'reset'`      | `'button'` |
| `onClick`               | `MouseEventHandler<HTMLButtonElement>` | –          |

| Result           | Type              |
| ---------------- | ----------------- |
| `buttonProps`    | `ButtonPartProps` |
| `isDisabled`     | `boolean`         |
| `isBusy`         | `boolean`         |
| `isFocusVisible` | `boolean`         |
