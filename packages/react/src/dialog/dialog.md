# Dialog

> **Draft** (Plan 0067). This page moves to the docs site with the other components. The accessibility contract is [dialog.a11y.md](dialog.a11y.md), and the look is in `docs/design/dialog.md`.

A Dialog is a window on top of the page that asks for the user's attention: a form, a short read, a decision. It is a native `<dialog>` shown with `showModal()`, so it is in the **top layer** (no portal, no `z-index`) and the page behind it is **inert** for the keyboard, the pointer and screen readers. Focus moves in when it opens and returns when it closes.

- Eight parts: `Dialog.Root` (no element, it owns the open state), `Dialog.Trigger` (`<button>`, optional), `Dialog.Popup` (`<dialog>`), `Dialog.Title` (`<h2>`), `Dialog.Description` (`<p>`), `Dialog.Body` and `Dialog.Actions` (`<div>`) and `Dialog.Close` (`<button>`). Each is also exported on its own (`DialogRoot`, `DialogPopup`, …), and the hook is `useDialog`.
- **Modal.** For a panel that leaves the page reachable, use a Popover. For a message that needs an answer, use an AlertDialog.
- **Escape closes it,** the innermost layer first: a Popover or Listbox inside closes before the dialog, a nested dialog before its parent. Focus returns to the trigger, else the finalFocusRef, else what had it before.
- **A press on the backdrop does nothing by default,** so a tap or a tremor never loses what someone typed. Set `dismissOnOutsidePress` for a read-only dialog.
- **Name it** with a `Dialog.Title`, or `aria-label`. A development warning fires without a name.
- **Content stays mounted while closed,** hidden and inert, so uncontrolled fields keep what was typed (3.3.7). The cost: ids in it exist from the first render, so they must be unique on the page, and a heavy subtree is rendered while closed. Render the whole `Dialog.Root` conditionally to start fresh.
- **Initial focus** is `initialFocusRef`, else the first tabbable that is not a Close, else the Title.
- **Tab leaves to the browser's own UI before it wraps,** where the APG cycles inside. This is the native modal's behaviour and an approved deviation.
- **Scroll lock** is `data-kv-scroll-locked` on `<html>`, ref-counted. `@kvirn-ui/theme` turns it into `overflow: hidden`. Without the theme, add your own CSS: the headless package ships none.
- The dialog hosts its own live regions, because the provider's are inert while a modal is open: a Combobox, Table or FileUpload inside still announces.
- One string: `dialog.close`, the name of an icon-only `Dialog.Close`. A `Close` with children uses them as its name.
- Headless: no CSS. The parts render `kv-dialog`, `kv-dialog-trigger`, `kv-dialog-title`, `-description`, `-body`, `-actions` and `-close`, and your `className` joins them.

## API

```tsx
import { Dialog } from '@kvirn-ui/react'

;<Dialog.Root>
  <Dialog.Trigger>Ändra telefonnummer</Dialog.Trigger>
  <Dialog.Popup>
    <Dialog.Title>Ändra telefonnummer</Dialog.Title>
    <Dialog.Close />
    <Dialog.Description>Vi skickar en kod med sms.</Dialog.Description>
    <Dialog.Body>…fält…</Dialog.Body>
    <Dialog.Actions>…knappar…</Dialog.Actions>
  </Dialog.Popup>
</Dialog.Root>
```

| Option                        | Default | Meaning                                                                                                                                                                                                                                                |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open` / `defaultOpen`        | `false` | Controlled with `onOpenChange`, or uncontrolled                                                                                                                                                                                                        |
| `onOpenChange(open, details)` |         | Every request to open or close. `details.reason` is `'trigger-press'`, `'close-press'`, `'escape'`, `'outside-press'` or `'native-close'`, and `details.event` the native event. With `open` set, you change it. If you keep it open, the dialog stays |
| `initialFocusRef`             |         | Where focus goes on open                                                                                                                                                                                                                               |
| `finalFocusRef`               |         | Where focus goes on close. Default the trigger, else what had focus before                                                                                                                                                                             |
| `dismissOnOutsidePress`       | `false` | A press on the backdrop closes it (`'outside-press'`)                                                                                                                                                                                                  |
| `messages`                    |         | Overrides for `close`                                                                                                                                                                                                                                  |

Every part takes `render` to change its element, and `className`, `style`, handlers and refs merge with its own. `render` also receives the state: `{ isOpen }`. The children of `Dialog.Popup` stay mounted while it is closed (the browser hides it), so typed values are kept when it reopens.

## Hook

```tsx
import { useDialog } from '@kvirn-ui/react'

function Own() {
  const dialog = useDialog()
  useEffect(() => dialog.registerTitle(), [dialog.registerTitle])
  return (
    <>
      <button {...dialog.triggerProps}>Ändra</button>
      <dialog {...dialog.popupProps}>
        {dialog.isOpen ? <h2 {...dialog.titleProps}>Ändra telefonnummer</h2> : null}
      </dialog>
    </>
  )
}
```

`closeProps` always carries `aria-label` (the resolved `dialog.close`): a Close with visible text must override it (`aria-label={undefined}`), or the label replaces the visible name (2.5.3). It returns `isOpen`, `triggerProps`, `popupProps`, `titleProps`, `descriptionProps`, `closeProps`, `registerTitle()` and `registerDescription()`. Call a register function from an effect in your title or description: `aria-labelledby` and `aria-describedby` appear only while the part exists. The children of a closed `<dialog>` can stay mounted: the browser hides them. The live regions come with `Dialog.Root`: with the hook, render your own. Likewise a dialog inside another is closed with its parent only through `Dialog.Popup`: with `useDialog` alone, close the inner one yourself when the outer closes, and never open it in the same commit as its parent: its layer would join the stack first, and Escape would close the outer while the inner stays modal.

## Developer warnings

In development, a Dialog warns once when it has no accessible name, when a part is outside `Dialog.Root`, and when focus has nowhere to return to (no trigger, no `finalFocusRef`, nothing focused before it opened).

## Accessibility

Read the [contract](dialog.a11y.md). In short: name it with a Title, say what each button does, give a trigger or a `finalFocusRef`, and keep what was typed.
