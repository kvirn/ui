# Disclosure

> **Draft** (Plan 0058). This page moves to the docs site once `apps/docs` has a page for it. The accessibility contract is [disclosure.a11y.md](disclosure.a11y.md).

A Disclosure is a button that shows and hides a panel of content (APG Disclosure): opening hours, a "read more", a help text. It holds the open state and wires the button and the panel together. It never moves focus.

- Three parts: `Disclosure.Root` (no element, it owns the open state), `Disclosure.Trigger` (`<button>` with `aria-expanded` and `aria-controls`, and a chevron at the inline end) and `Disclosure.Panel` (`<div>`, `hidden` while closed). Each is also exported on its own (`DisclosureRoot`, `DisclosureTrigger`, `DisclosurePanel`), and the hook is `useDisclosure`.
- **Name the trigger with text that says what the panel holds,** and don't change it with the state: `aria-expanded` says whether it is open.
- **Render the panel right after the trigger,** so the panel's content follows it in the Tab order.
- **Enter and Space are the button's own.** Escape is not handled (APG doesn't require it).
- **The open look** is the chevron: it points down while closed and up while open, at the inline end. Never colour alone.
- No strings of its own. With `@kvirn-ui/theme` the parts are styled; without it they carry `kv-disclosure-trigger`, `kv-disclosure-panel`, `kv-disclosure-icon` and `data-open`.

## API

```tsx
import { Disclosure } from '@kvirn-ui/react'

;<Disclosure.Root>
  <Disclosure.Trigger>Öppettider</Disclosure.Trigger>
  <Disclosure.Panel>
    <p>Måndag till fredag 10–19.</p>
  </Disclosure.Panel>
</Disclosure.Root>
```

`Disclosure.Root` takes the options. They're also the options of the hook:

| Option                        | Default | Meaning                                                                                                                                                                |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`        | `false` | Controlled with `onOpenChange`, or uncontrolled                                                                                                                        |
| `onOpenChange(open, details)` |         | `details.reason` is `'trigger-press'` or `'find-in-page'`, and `details.event` the event behind it. With `open` set, you change it                                     |
| `disabled`                    | `false` | The trigger is natively `disabled` and leaves the Tab order                                                                                                            |
| `focusableWhenDisabled`       | `false` | With `disabled`: `aria-disabled="true"` instead, so the trigger stays a Tab stop. Neither opens                                                                        |
| `hiddenUntilFound`            | `false` | A closed panel is `hidden="until-found"`, so the browser's find-in-page and `#fragment` links can reveal it, and `onOpenChange(true, { reason: 'find-in-page' })` runs |

Every part takes `render`, and `className`, `style`, handlers and refs merge with its own. `render` also receives `{ isOpen, isDisabled }`.

## Hook

```tsx
import { useDisclosure } from '@kvirn-ui/react'

function Hours() {
  const disclosure = useDisclosure()
  return (
    <>
      <button {...disclosure.triggerProps}>Öppettider</button>
      <div {...disclosure.panelProps}>Måndag till fredag 10–19.</div>
    </>
  )
}
```

It returns `triggerProps`, `panelProps`, `isOpen`, `isDisabled`, `isFocusVisible`, `triggerId` and `panelId`. The hook adds no chevron: draw your own, or use `Disclosure.Trigger`. With `hiddenUntilFound`, `panelProps.ref` must reach the panel.

## Find-in-page

`hiddenUntilFound` is off by default. Chromium reveals a `hidden="until-found"` panel when find-in-page matches its text. A browser without support treats it as `hidden`, so a match is simply not found. React renders `hidden` as a boolean attribute, so the server markup says plain `hidden` and the hook writes `until-found` after hydration.

## A panel shown from a breakpoint

Not supported. A navigation that is always shown on a wide screen and a button on a narrow one would leave `aria-expanded="false"` on a visible panel. Use `NavigationMenu` (planned), or your own CSS that shows the panel and hides the trigger from that width: see the contract's Consumer responsibilities.
