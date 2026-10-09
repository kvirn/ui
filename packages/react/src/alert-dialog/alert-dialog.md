# AlertDialog

> **Draft** (Plan 0067). The accessibility contract is [alert-dialog.a11y.md](alert-dialog.a11y.md). It shares its hook and behaviour with [Dialog](../dialog/dialog.md).

An AlertDialog is a Dialog for a message that needs an answer: a confirm-before-delete, a session timeout warning. It has `role="alertdialog"`, it is read out together with its description, it starts on the safe or primary action, and **a press outside never dismisses it**.

- Eight parts: `AlertDialog.Root`, `.Trigger`, `.Popup`, `.Title`, `.Description`, `.Body`, `.Actions` and `.Close`, each also exported on its own (`AlertDialogRoot`, …). The hook is `useAlertDialog`. `AlertDialog.Close` is a plain `<button type="button">` that closes with `'close-press'`: its children are its name, there is no icon and no default text, and you style it (Button classes) or use your own buttons.
- **Always give a `Description`** (the consequence, and whether it can be undone) and an **`initialFocusRef`**: the least destructive action ("Behåll utkastet"), or the primary one when nothing is destroyed ("Fortsätt vara inloggad"). A development warning fires without either, and without `initialFocusRef` focus starts on the Title, never the first control.
- **Escape** reports `'escape'` to `onOpenChange`. Answer it with the cancel outcome, never a destructive one, or keep the dialog open by not changing `open`.
- `AlertDialog.Close` closes it uncontrolled too, and takes `as` (a component such as `Button`). Title, Description, Body and Actions take the tag `as` of the matching Dialog parts. With `open` and `onOpenChange` you can refuse, or close from your own buttons by setting `open` to `false`.
- A system-opened alert dialog (a timer) has no trigger: pass `finalFocusRef`, so focus has somewhere to return to.
- Classes: the parts carry the shared `kv-dialog*` classes (the theme styles those) and their own `kv-alert-dialog*` classes as hooks.

```tsx
import { AlertDialog } from '@kvirn-ui/react'

;<AlertDialog.Root open={isOpen} onOpenChange={setIsOpen} initialFocusRef={keepRef}>
  <AlertDialog.Popup>
    <AlertDialog.Title>Vill du ta bort utkastet?</AlertDialog.Title>
    <AlertDialog.Description>Det går inte att ångra. Dina svar tas bort.</AlertDialog.Description>
    <AlertDialog.Actions>
      <button onClick={remove}>Ta bort utkastet</button>
      <button ref={keepRef} onClick={() => setIsOpen(false)}>
        Behåll utkastet
      </button>
    </AlertDialog.Actions>
  </AlertDialog.Popup>
</AlertDialog.Root>
```

Root options are Dialog's without `dismissOnOutsidePress`: `open`, `defaultOpen`, `onOpenChange`, `initialFocusRef`, `finalFocusRef`, `messages`.
