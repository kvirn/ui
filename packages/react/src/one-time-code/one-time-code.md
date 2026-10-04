# OneTimeCode

> **Draft** (Plan 0014, Phase 3; the pattern is Plan 0019). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [one-time-code.a11y.md](one-time-code.a11y.md), the design spec is [docs/design/one-time-code.md](../../../../docs/design/one-time-code.md), and the decisions are in the forms skill (OneTimeCode).

**KvirnUI holds no form state; bring your own form logic.** OneTimeCode renders what it's given. It keeps no value of its own and doesn't check the code: the value lives in your form state, or in the native input.

A OneTimeCode shows a code sent by text message or email, or made by an authenticator app, as **a row of boxes, one per character**, shaped by a `pattern` such as `999999`, `****-****` or `AA-9999`. Underneath it is **one native `<input>`**. Typing, paste, SMS autofill, password managers, dictation, undo and the screen reader all work on that one field. The boxes only draw its value, its caret and its selection.

- Three parts: `OneTimeCode.Root` (`<div>`, the row), `OneTimeCode.Input` (the one `<input>`) and `OneTimeCode.Slot` (`<span>`, one box, or the dash between two groups). Each is also exported on its own (`OneTimeCodeRoot`, `OneTimeCodeInput`, `OneTimeCodeSlot`), and the hook is `useOneTimeCode`.
- **One field to name, describe, fill and dictate into.** The label names it, the hint describes it. The boxes are `aria-hidden` and never focusable, so a screen reader sees a plain text field.
- **Nothing moves or submits on its own** (3.2.2). Typing the last character leaves focus where it is. There's no auto-advance between boxes, and no auto-submit. `onComplete` is a callback only.
- **A pasted `123 456`, `123-456` or "Your code is 123456" ends as `123456`** (for `999999`), **and `abcd1234`, `abcd-1234` or `abcd 1234` all end as `abcd-1234`** (for `****-****`). An SMS suggestion fills the whole code. There's no `maxlength`, and the field is never `type="password"`: the user has to see the code (3.3.8).
- **It degrades to a plain input.** In forced colours, on a screen too narrow for 32px boxes, at large text sizes and before the script has run, the theme shows an ordinary numeric input with the same value and focus instead of the boxes.
- Headless: no CSS. The parts render `kv-one-time-code`, `kv-one-time-code-input`, `kv-one-time-code-slot` and `kv-one-time-code-separator`, and your `className` joins them. With `@kvirn-ui/theme/theme.css` imported they are styled.

## Component

```tsx
import { Field, OneTimeCode } from '@kvirn-ui/react'

;<Field.Root invalid={codeError !== undefined}>
  <Field.Label>Kod från sms:et</Field.Label>
  <Field.Prose>
    <p>
      Koden har 8 tecken i två grupper om 4. Du hittar den i sms:et som vi just skickade till dig.
    </p>
  </Field.Prose>
  <OneTimeCode.Root
    pattern="&&&&-&&&&"
    onComplete={(value, unmaskedValue) => verifyCode(unmaskedValue)}
  >
    <OneTimeCode.Input name="code" />
    {[...'&&&&-&&&&'].map((_, index) => (
      <OneTimeCode.Slot key={index} index={index} />
    ))}
  </OneTimeCode.Root>
  <Field.ErrorMessage>{codeError}</Field.ErrorMessage>
</Field.Root>
```

`OneTimeCode.Root` takes the options. They're also the options of the hook:

| Option                             | Default    | Meaning                                                                                                                                                                                                  |
| ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pattern`                          | `'999999'` | The shape of the code, see the symbols below. One box for each character symbol, and a dash for each `-`                                                                                                 |
| `value` / `defaultValue`           |            | Controlled with `onValueChange`, or uncontrolled: the native input keeps the value and a form submit sends it                                                                                            |
| `onValueChange(value, details)`    |            | Every change, with `{ reason: 'input', event }` and the mask's `unmaskedValue`, `isComplete` and `rejected`. It only reports                                                                             |
| `onComplete(value, unmaskedValue)` |            | A change left the code complete and different from before: the last character, a paste, an autofill. `value` has the dashes, `unmaskedValue` has none. It never submits and never moves focus. See below |
| `disabled`                         |            | Native `disabled`. A disabled Field disables it too. Prefer `readOnly` on the Input while a code is being checked                                                                                        |
| `announceRejections`, `messages`   | `true`     | The mask says politely, at most once every three seconds, when it drops a character ("Only digits can be entered here"). Needs a `KvirnProvider`                                                         |

### The pattern

| Symbol | Accepts                                                             |
| ------ | ------------------------------------------------------------------- |
| `9`    | A digit (0 to 9)                                                    |
| `*`    | A letter or digit (A to Z, a to z, 0 to 9), kept as typed           |
| `a`    | A letter (A to Z, a to z), kept as typed                            |
| `A`    | A letter: a typed `a` becomes `A`                                   |
| `&`    | A letter or digit, in upper case: a typed `a` becomes `A`           |
| `-`    | A separator, drawn between two boxes. Not part of the unmasked code |

- Every symbol is ASCII only: `å`, `ø` and `đ` aren't letters in a code (a code is an identifier, not a name).
- **A pattern that isn't valid throws a `RangeError` that names the character and its position:** an unknown character (a space, a `\`, a lower-case `x`), a `-` first, last or doubled, or no character symbol. A pattern is a literal in your code, so it fails in development.
- **The value includes the dash:** `****-****` holds `abcd-1234`, as the boxes and the message show it. The mask puts the dash in as the first character of the next group is placed, accepts a typed `-` once, and drops dashes and spaces from pasted text. `onValueChange` details and `onComplete`'s second argument carry the `unmaskedValue` (`abcd1234`) for a service that wants the plain code.
- **Render one `OneTimeCode.Slot` per position of the pattern, the dashes included:** `index` is the position in the pattern, which is also the position in the value. A slot for a `-` is a separator: it shows `-`, is `aria-hidden`, and is never filled, active or selected.
- The input's `inputmode="numeric"` is set only when every symbol is `9`, and `autocapitalize="characters"` when no symbol is `a` or `*`. There's no `maxlength` and no `pattern` attribute.

`OneTimeCode.Input` takes `name`, `readOnly`, `required`, `aria-describedby` and the rest of an `<input>`'s props, and merges them with its own: handlers chain, class names join and refs merge. Inside a Field, its id is the Field's.

### Your part

- **The label says where the code is,** in the user's words: "Kod från sms:et", "Code from your authenticator app". Not "OTP", "verification code" or "PIN".
- **The description (a `Field.Prose`) is above the boxes and says how long the code is, how it is grouped, and where to find it** ("The code has 8 characters in two groups of 4"). The boxes are hidden from screen readers and disappear in the fallback, so the description is the only place they learn the length and the groups (3.3.2). Screen readers read the dash in the value ("A B C D dash 1 2 3 4"). A dev warning fires without a hint (a `Field.Prose` in the Field).
- **Errors say what's wrong and how to fix it,** under the row: "Enter all 6 digits of the code", "The code doesn't match the one we sent. Check the text message and enter the code again." Never blame. **Keep the code in the field after a wrong-code error,** so the user can compare it with the message and fix one digit.
- **Keep a Continue button.** `onComplete` can verify early, but say so in the hint ("We check the code as soon as you have entered all 6 digits", 3.2.2) and never remove the button.
- **While the code is being checked, use `readOnly`, not `disabled`.** A disabled input loses focus, which lands on `body`. Say "Checking the code" through the Announcer.
- **Write the pattern the way the message groups the code:** `****-****` for "ABCD-1234", `999999` for "481920". There is no `kv-one-time-code--grouped` modifier any more: the dash is part of the pattern.
- **Letters-and-digits codes avoid look-alikes** (`0` and `O`, `1`, `I` and `l`). The theme's dotted zero helps, but can't fix a code that uses both. The boxes show exactly the value: no `text-transform`. Use `A` or `&` for a code that is always in capitals (typed lower case is upper-cased), and `a` or `*` where the service takes the case as typed.
- **Countdowns, "Send a new code" and timeouts aren't part of it.** They belong to the login and verification blocks (M4), which must warn before a code expires (2.2.1).
- **Don't disable paste, don't use `type="password"`,** and keep `autocomplete="one-time-code"` (3.3.8).

A plain `<Input mask={masks.oneTimeCode({ pattern: '999999' })} />` is a valid choice too (the GOV.UK "security code" pattern), and is what the theme shows in the fallback anyway.

### Classes and state for the default theme

| Class / attribute            | On                          | Sets                                                                                                                                                          |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-one-time-code`           | Root                        | the row of boxes, and the container that decides whether they fit                                                                                             |
| `kv-one-time-code-input`     | Input                       | the one input: invisible and under the boxes, or in the fallback exactly an `Input` with the code's width                                                     |
| `kv-one-time-code-separator` | Slot (a `-` of the pattern) | the dash between two groups: `aria-hidden`, shows `-`, no state                                                                                               |
| `kv-one-time-code-slot`      | Slot                        | one box: 44px (32px compact) and shrinks to 32px, `md` radius, a 1px `border-control` edge                                                                    |
| `data-character-count`       | Root                        | the number of character symbols in the pattern (`8` for `****-****`), always rendered. The theme sizes the row and picks the fallback from it                 |
| `data-separator-count`       | Root                        | the number of `-` in the pattern (`1` for `****-****`, `0` for none), always rendered                                                                         |
| `data-ready`                 | Root                        | the hook has started and read the input's value. The theme draws the boxes only then, so typing before the script runs shows                                  |
| `data-complete`              | Root                        | every box is filled. The theme draws nothing for it: complete isn't correct, and a tick would read as "verified"                                              |
| `data-invalid`               | Root, Slot                  | a 2px `danger` edge on every box. From the Field                                                                                                              |
| `data-disabled`              | Root                        | a dashed edge on the `surface` colour                                                                                                                         |
| `data-filled`                | Slot                        | the box holds a character                                                                                                                                     |
| `data-active`                | Slot                        | the field has focus, nothing is selected, and the next character goes in this box (never a separator): a 2px `focus-ring` edge and a static caret             |
| `data-caret`                 | Slot                        | on the active box: `before` the character, or `after` it on the last box of a complete code, or on the box before a dash that the caret has stepped back over |
| `data-selected`              | Slot                        | the selection covers this box's character: a `primary-subtle` fill and a 2px `focus-ring` edge                                                                |

The focus ring is the input's own, drawn around the whole row. The theme draws 4 to 10 characters in up to 3 groups (2 dashes). It falls back to the plain input, as wide as the pattern (dashes included), in forced colours, when the row doesn't fit at 32px boxes (2.5rem a character plus 1.25rem a dash, less half a rem: `AA-9999` needs 15.75rem), outside those limits, and before `data-ready`.

## Hook

For your own elements, `useOneTimeCode` returns the props:

```tsx
import { useOneTimeCode } from '@kvirn-ui/react'

function Code() {
  const oneTimeCode = useOneTimeCode({ pattern: '999999', onComplete: verifyCode })
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

It returns `rootProps`, `inputProps`, `getSlotProps(index)`, `slots` (one per position of the pattern, each `{ kind, character, isFilled, isActive, caret, isSelected }`, where `kind` is `'character'` or `'separator'`), `value`, `pattern`, `characterCount` (the pattern without its dashes), `isComplete`, `isReady`, `isInvalid` and `isDisabled`. It reads the nearest Field, and builds on [`useMask`](../input/input.md) with `masks.oneTimeCode({ pattern })`. Use `mergeProps` when you have your own ref or handlers on the input: handlers chain and refs merge.

### `render`

All three parts take `render` to change their element. The part's props are merged into yours: class names join, handlers chain and refs merge. The Slot's second argument is the slot's state.

```tsx
<OneTimeCode.Slot index={0} render={(props, slot) => <b {...props}>{slot.character}</b>} />
```
