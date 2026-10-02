# OneTimeCode

> **Draft** (Plan 0014, Phase 3). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [one-time-code.a11y.md](one-time-code.a11y.md), the design spec is [docs/design/one-time-code.md](../../../../docs/design/one-time-code.md), and the decision is in ADR-0033.

**KvirnUI holds no form state; bring your own form logic.** OneTimeCode renders what it's given. It keeps no value of its own and doesn't check the code: the value lives in your form state, or in the native input.

A OneTimeCode shows a code sent by text message or email, or made by an authenticator app, as **a row of boxes, one per character**. Underneath it is **one native `<input>`**. Typing, paste, SMS autofill, password managers, dictation, undo and the screen reader all work on that one field. The boxes only draw its value, its caret and its selection.

- Three parts: `OneTimeCode.Root` (`<div>`, the row), `OneTimeCode.Input` (the one `<input>`) and `OneTimeCode.Slot` (`<span>`, one box). Each is also exported on its own (`OneTimeCodeRoot`, `OneTimeCodeInput`, `OneTimeCodeSlot`), and the hook is `useOneTimeCode`.
- **One field to name, describe, fill and dictate into.** The label names it, the hint describes it. The boxes are `aria-hidden` and never focusable, so a screen reader sees a plain text field.
- **Nothing moves or submits on its own** (3.2.2). Typing the last character leaves focus where it is. There's no auto-advance between boxes, and no auto-submit. `onComplete` is a callback only.
- **A pasted `123 456`, `123-456` or "Your code is 123456" ends as `123456`,** and an SMS suggestion fills the whole code. There's no `maxlength`, and the field is never `type="password"`: the user has to see the code (3.3.8).
- **It degrades to a plain input.** In forced colours, on a screen too narrow for 32px boxes, at large text sizes and before the script has run, the theme shows an ordinary numeric input with the same value and focus instead of the boxes.
- Headless: no CSS. The parts render `kv-one-time-code`, `kv-one-time-code-input` and `kv-one-time-code-slot`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## Component

```tsx
import { Field, OneTimeCode } from '@kvirn-ui/react'

;<Field.Root invalid={codeError !== undefined}>
  <Field.Label>Kod från sms:et</Field.Label>
  <Field.Description>
    Koden har 6 siffror. Du hittar den i sms:et som vi just skickade till dig.
  </Field.Description>
  <OneTimeCode.Root length={6} onComplete={verifyCode}>
    <OneTimeCode.Input name="code" />
    {Array.from({ length: 6 }, (_, index) => (
      <OneTimeCode.Slot key={index} index={index} />
    ))}
  </OneTimeCode.Root>
  <Field.ErrorMessage>{codeError}</Field.ErrorMessage>
</Field.Root>
```

`OneTimeCode.Root` takes the options. They're also the options of the hook:

| Option                           | Default    | Meaning                                                                                                                                                     |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `length`                         | `6`        | How many characters the code has: one box each. The default theme draws 4 to 8                                                                              |
| `characters`                     | `'digits'` | `'digits'` (the number pad) or `'lettersAndDigits'` (capitals on the phone keyboard, and a dotted zero in the boxes)                                        |
| `value` / `defaultValue`         |            | Controlled with `onValueChange`, or uncontrolled: the native input keeps the value and a form submit sends it                                               |
| `onValueChange(value, details)`  |            | Every change, with `{ reason: 'input', event }` and the mask's `unmaskedValue`, `isComplete` and `rejected`. It only reports                                |
| `onComplete(value)`              |            | A change left the code complete and different from before: the last character, a paste, an autofill. It never submits and never moves focus. See below      |
| `disabled`                       |            | Native `disabled`. A disabled Field disables it too. Prefer `readOnly` on the Input while a code is being checked                                           |
| `announceRejections`, `messages` | `true`     | The mask says politely, at most once every three seconds, when it drops a character ("Only digits can be entered here"). Needs a `KvirnProvider` (ADR-0040) |

`OneTimeCode.Input` takes `name`, `readOnly`, `required`, `aria-describedby` and the rest of an `<input>`'s props, and merges them with its own: handlers chain, class names join and refs merge. Inside a Field, its id is the Field's.

### Your part

- **The label says where the code is,** in the user's words: "Kod från sms:et", "Code from your authenticator app". Not "OTP", "verification code" or "PIN".
- **The hint is above the boxes and says how long the code is and where to find it.** The boxes are hidden from screen readers and disappear in the fallback, so the hint is the only place they learn the length (3.3.2). A dev warning fires without a `Field.Description`.
- **Errors say what's wrong and how to fix it,** under the row: "Enter all 6 digits of the code", "The code doesn't match the one we sent. Check the text message and enter the code again." Never blame. **Keep the code in the field after a wrong-code error,** so the user can compare it with the message and fix one digit.
- **Keep a Continue button.** `onComplete` can verify early, but say so in the hint ("We check the code as soon as you have entered all 6 digits", 3.2.2) and never remove the button.
- **While the code is being checked, use `readOnly`, not `disabled`.** A disabled input loses focus, which lands on `body`. Say "Checking the code" through the Announcer.
- **Group the boxes only the way the message groups the code:** `kv-one-time-code--grouped` on the Root splits an even length into two halves (2+2, 3+3, 4+4). A code sent as "481920" gets ungrouped boxes.
- **Letters-and-digits codes avoid look-alikes** (`0` and `O`, `1`, `I` and `l`). The theme's dotted zero helps, but can't fix a code that uses both. The boxes show exactly the value: no `text-transform`. If your service treats codes as case-insensitive, normalise before you compare.
- **Countdowns, "Send a new code" and timeouts aren't part of it.** They belong to the login and verification blocks (M4), which must warn before a code expires (2.2.1).
- **Don't disable paste, don't use `type="password"`,** and keep `autocomplete="one-time-code"` (3.3.8).

A plain `<Input mask={masks.oneTimeCode({ length: 6 })} />` is a valid choice too (the GOV.UK "security code" pattern), and is what the theme shows in the fallback anyway.

### Classes and state for the default theme

| Class / attribute           | On         | Sets                                                                                                                         |
| --------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `kv-one-time-code`          | Root       | the row of boxes, and the container that decides whether they fit                                                            |
| `kv-one-time-code--grouped` | Root       | two halves with a wider gap between them (even lengths only). You add it                                                     |
| `kv-one-time-code-input`    | Input      | the one input: invisible and under the boxes, or in the fallback exactly an `Input` with the code's width                    |
| `kv-one-time-code-slot`     | Slot       | one box: 44px (32px compact) and shrinks to 32px, `md` radius, a 1px `border-control` edge                                   |
| `data-ready`                | Root       | the hook has started and read the input's value. The theme draws the boxes only then, so typing before the script runs shows |
| `data-complete`             | Root       | every box is filled. The theme draws nothing for it: complete isn't correct, and a tick would read as "verified"             |
| `data-invalid`              | Root, Slot | a 2px `danger` edge on every box. From the Field                                                                             |
| `data-disabled`             | Root       | a dashed edge on the `surface` colour                                                                                        |
| `data-filled`               | Slot       | the box holds a character                                                                                                    |
| `data-active`               | Slot       | the field has focus, nothing is selected, and the caret is at this box: a 2px `focus-ring` edge and a static caret           |
| `data-caret`                | Slot       | on the active box: `before` the character, or `after` it on the last box of a complete code                                  |
| `data-selected`             | Slot       | the selection covers this box's character: a `primary-subtle` fill and a 2px `focus-ring` edge                               |

The focus ring is the input's own, drawn around the whole row. The theme falls back to the plain input in forced colours, when the row doesn't fit at 32px boxes (each length has its own width: 2.5rem a character, so six characters need 15rem), and before `data-ready`.

## Hook

For your own elements, `useOneTimeCode` returns the props:

```tsx
import { useOneTimeCode } from '@kvirn-ui/react'

function Code() {
  const oneTimeCode = useOneTimeCode({ length: 6, onComplete: verifyCode })
  return (
    <div {...oneTimeCode.rootProps}>
      <input {...oneTimeCode.inputProps} name="code" />
      {oneTimeCode.slots.map((slot, index) => (
        <span key={index} {...oneTimeCode.getSlotProps(index)}>
          {slot.character}
        </span>
      ))}
    </div>
  )
}
```

It returns `rootProps`, `inputProps`, `getSlotProps(index)`, `slots` (each `{ character, isFilled, isActive, caret, isSelected }`), `value`, `length`, `isComplete`, `isReady`, `isInvalid` and `isDisabled`. It reads the nearest Field, and builds on [`useMask`](../input/input.md) with `masks.oneTimeCode({ length, characters })`. Use `mergeProps` when you have your own ref or handlers on the input: handlers chain and refs merge.

### `render`

All three parts take `render` to change their element. The part's props are merged into yours: class names join, handlers chain and refs merge (ADR-0015). The Slot's second argument is the slot's state.

```tsx
<OneTimeCode.Slot index={0} render={(props, slot) => <b {...props}>{slot.character}</b>} />
```
