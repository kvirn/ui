# Button

> **Draft** (Plan 0003). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [button.a11y.md](button.a11y.md).

A native `<button>` for actions. For navigation, use [Link](../link/link.md).

- `type="button"` by default, so a Button never submits a form by accident. Use `type="submit"` for the button that does. `type="reset"` puts the form's fields back to their starting values.
- `disabled` makes it natively disabled: skipped by Tab.
- `disabled` plus `focusableWhenDisabled` keeps it in the Tab order with `aria-disabled="true"`, so keyboard and screen-reader users can find it and read why. Click, Enter, Space and form submission stay blocked, and your `onClick` is not called.
- `busy` marks a running action: `aria-disabled="true"` and `data-busy`, never native `disabled`, so focus stays and every press is blocked. Put a [Progress](../progress/progress.md) beside it. `disabled` wins when both are set.
- Headless: no CSS. It renders `class="kv-button"`, the part's stable class, and your `className` joins it. Style `.kv-button` and the state attributes `[data-disabled]`, `[data-busy]` (set only while `busy` and not `disabled`) and `[data-focus-visible]` (or `:focus-visible`). With `@kvirn-ui/theme/theme.css` imported, it is styled: add `className="kv-button--primary"` or `className="kv-button--danger"` for a variant.

## Component

```tsx
import { Button } from '@kvirn-ui/react'

<Button onClick={save}>Spara</Button>
<Button type="submit">Skicka ansökan</Button>

<p id="skicka-hjalp">Fyll i alla obligatoriska fält innan du skickar.</p>
<Button type="submit" disabled focusableWhenDisabled aria-describedby="skicka-hjalp">
  Skicka ansökan
</Button>
```

Prefer an enabled button that explains what's missing on submit. When you do disable one, say why in text next to it.

### `render`

Change the element, which must still be a `<button>` (a dev warning says so otherwise):

```tsx
<Button render={<MyStyledButton />}>Spara</Button>
<Button render={(buttonProps, state) => <MyStyledButton {...buttonProps} isMuted={state.isDisabled} />}>
  Spara
</Button>
```

An element keeps its own props, and the Button's props are merged in: handlers chain, class names join. An element's own `onClick` goes through the Button too, so it's blocked while disabled.

In the function form, spread `buttonProps` and never override `buttonProps.onClick`: it is what blocks activation while disabled. Put your handler on the Button instead. `buttonProps.className` already holds `kv-button` and the Button's own `className`: keep it if you add a class of your own.

```tsx
<Button className="kv-button--primary" render={(buttonProps) => <button {...buttonProps} />}>
  Skicka
</Button>
```

If a button can be disabled while it has focus, for example one that disables itself when pressed, use `focusableWhenDisabled`. Otherwise focus drops to the page body.

## Hook

```tsx
import { useButton } from '@kvirn-ui/react'

function SaveButton({ isSaving }: { isSaving: boolean }) {
  const button = useButton({ disabled: isSaving, focusableWhenDisabled: true, onClick: save })
  return <button {...button.buttonProps}>Spara</button>
}
```

Pass your click handler as `useButton({ onClick })`. A handler merged on top of `buttonProps` isn't blocked while disabled. `buttonProps.className` is `kv-button`: add a variant class with `mergeProps`, which joins class names, instead of overriding it.

```tsx
<button {...mergeProps(button.buttonProps, { className: 'kv-button--primary' })}>Skicka</button>
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
| `isFocusVisible` | `boolean`         |
