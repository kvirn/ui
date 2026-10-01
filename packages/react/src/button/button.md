# Button

> **Draft** (Plan 0003). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [button.a11y.md](button.a11y.md).

A native `<button>` for actions. For navigation, use [Link](../link/link.md).

- `type="button"` by default, so a Button never submits a form by accident. Use `type="submit"` for the button that does.
- `disabled` makes it natively disabled: skipped by Tab.
- `disabled` plus `focusableWhenDisabled` keeps it in the Tab order with `aria-disabled="true"`, so keyboard and screen-reader users can find it and read why. Click, Enter, Space and form submission stay blocked.
- Headless: no CSS. It renders `data-kv="button"`, a stable part name. Style `[data-kv='button']`, `[data-disabled]` and `[data-focus-visible]` (or `:focus-visible`). With `@kvirn-ui/theme/theme.css` imported, it is styled: pass `data-variant="primary"` or `data-variant="danger"` as a plain attribute.

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

An element keeps its own props, and the Button's props are merged in: handlers chain, class names join (ADR-0015). An element's own `onClick` goes through the Button too, so it's blocked while disabled (ADR-0016).

In the function form, spread `buttonProps` and never override `buttonProps.onClick`: it is what blocks activation while disabled. Put your handler on the Button instead.

If a button can be disabled while it has focus, for example one that disables itself when pressed, use `focusableWhenDisabled`. Otherwise focus drops to the page body.

## Hook

```tsx
import { useButton } from '@kvirn-ui/react'

function SaveButton({ isSaving }: { isSaving: boolean }) {
  const button = useButton({ disabled: isSaving, focusableWhenDisabled: true, onClick: save })
  return <button {...button.buttonProps}>Spara</button>
}
```

Pass your click handler as `useButton({ onClick })`. A handler merged on top of `buttonProps` isn't blocked while disabled (ADR-0016).

| Option                  | Type                                   | Default    |
| ----------------------- | -------------------------------------- | ---------- |
| `disabled`              | `boolean`                              | `false`    |
| `focusableWhenDisabled` | `boolean`                              | `false`    |
| `type`                  | `'button' \| 'submit' \| 'reset'`      | `'button'` |
| `onClick`               | `MouseEventHandler<HTMLButtonElement>` | –          |

| Result           | Type              |
| ---------------- | ----------------- |
| `buttonProps`    | `ButtonPartProps` |
| `isDisabled`     | `boolean`         |
| `isFocusVisible` | `boolean`         |
