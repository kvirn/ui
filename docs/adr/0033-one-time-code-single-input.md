# ADR-0033: OneTimeCode is one native input, with presentational slots

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer asked for an OTP field component. The approach below was proposed with Plan 0014 and is open to change.
- **Tags:** api, a11y
- **Amended by:** ADR-0045 (items 1 to 3: a `pattern` replaces `length` and `characters`)

## Context

E-services confirm a phone number or an email address, or sign the user in, with a one-time code sent by SMS or email. Many design systems show the code as a row of boxes, one per character. There's no APG pattern for it.

The common build is one `<input>` per box, with focus moving to the next box after each character. That build has known failures:

- iOS and some password managers fill an `autocomplete="one-time-code"` value into the first box only.
- Paste needs custom code, and paste into the "wrong" box breaks.
- A screen reader announces six unlabelled or identically labelled fields. Voice control users have to say each box.
- Moving focus on input is a change of context (3.2.2) that users don't expect, and Backspace across boxes rarely works like it does in a text field.
- Six tab stops, or a roving tabindex that hides how many boxes there are.

WCAG 2.2 3.3.8 (Accessible Authentication) requires that a code can be pasted or filled in by a password manager, not retyped from memory.

## Decision drivers

- One field to name, describe, fill, paste into and dictate into.
- Autofill from SMS (`autocomplete="one-time-code"`) and password managers on every platform.
- The boxes are a visual aid only. Everything works without them.
- No change of context on input.
- Built on the mask engine (ADR-0032) and the Field wiring (ADR-0029).

## Options considered

### Option A: one native input, with presentational slots (chosen)

- ✅ Native editing, paste, autofill, undo and dictation. One accessible name and one tab stop.
- ✅ The slots are `aria-hidden` drawings of the value, so assistive technology sees a plain text field.
- ❌ The slots must stay aligned with the real input under zoom, text spacing (1.4.12) and forced colours, so the theme needs a fallback (item 5).

### Option B: one input per character, with auto-advance

- ✅ The common look, and easy to style.
- ❌ All the failures listed in the context. Rejected.

### Option C: a plain Input with `masks.oneTimeCode()`

- ✅ The simplest and most robust (the GOV.UK "security code" pattern).
- ❌ No boxes. Kept as the fallback in forced colours, and documented as a valid choice on its own.

## Decision

We will use Option A, built so that it degrades to Option C.

1. **Parts.** `OneTimeCode.Root` (`<div>`, `kv-one-time-code`) holds the options. `OneTimeCode.Input` is the native `<input>`, inside a Field. `OneTimeCode.Slot` (`<span>`, `kv-one-time-code-slot`) draws one character. Each part is also a named export. The hook is `useOneTimeCode()`, which returns `inputProps`, `getSlotProps(index)`, `slots` (each `{ character, isFilled, isActive }`) and `isComplete`. The name is written out, not "OTP" (`docs/architecture.md`, naming).
2. **The input.** `type="text"`, `autoComplete="one-time-code"`, `spellCheck={false}`, `autoCorrect="off"`, and `inputMode="numeric"` for `characters="digits"` (the default) or `autoCapitalize="characters"` for `characters="lettersAndDigits"`. It uses `masks.oneTimeCode({ length, characters })` (ADR-0032), so a pasted `123 456`, `123-456` or "Your code is 123456" ends as `123456`. No `maxlength` and no `pattern`. Never `type="password"`: the user has to see what they paste or type (3.3.8).
3. **The slots** are `aria-hidden="true"` and not focusable. They show the character, `data-filled`, `data-active` at the caret while the input has focus, `data-caret="before" | "after"` on the active slot (so the caret position on a complete code is unambiguous), `data-selected` on slots inside the input's selection (so a selection is visible), and `data-invalid` from the Field. A pointer press on a slot lands on the input, so it focuses the field. A press on an empty slot puts the caret at the end of the code, and a press on a filled slot puts it before that character.
4. **Labelling.** The input needs a visible `Field.Label` ("Code from the text message") and a `Field.Description` with the length ("The code has 6 digits"). The consumer writes both, because the wording depends on the service. The mask's dev warning (ADR-0032, item 10) applies.
5. **Ready flag.** `OneTimeCode.Root` has `data-ready` once the hook has started, and the hook reads the input's current value when it starts and runs it through the mask once, writing it back only if it changed (so separators and characters past `length` are dropped, and the boxes draw exactly what the field holds). A form reset does the same. Until then the theme shows the plain input, so typing and SMS autofill that happen before the script has loaded are visible as the browser draws them, without the mask. A controlled `value` is the consumer's and is drawn as it is.
6. **Fallbacks.** In `forced-colors: active`, and wherever the slots can't stay aligned with the text, the default theme shows the input as a normal text field and hides the slots. The design spec decides how the slots are drawn, as long as the input is the only operable element and its value stays readable.
7. **No auto-submit.** The component never submits or moves focus. `onComplete(value)` fires when the code is complete, for consumers who verify early. The docs say: keep a submit button, say in the hint that the code is checked as soon as it's entered (3.2.2), and keep the code in the field after a wrong-code error instead of clearing it.
8. **No form state** (ADR-0029, item 0): `value`, `defaultValue` and `onValueChange` work as on Input.
9. **Out of scope:** the countdown, "Send a new code" and timeouts belong to the login and verification blocks (M4). Those blocks must meet 2.2.1, so an expiring code never ends the session without warning.

### Implementation notes (Phase 3)

Details the implementation settled that the decision above leaves open. None changes it.

- The hook builds on `useMask` with `masks.oneTimeCode({ length, characters })`. It draws from the input, not from what it last heard: a layout effect reads the input's value on mount and whenever the `value` prop or its own state changes, so a controlled `value`, an autofill before hydration and a form reset (read one task after the `reset` event) are drawn as they are. The first read is what sets `data-ready`.
- The caret and selection come from React's `onSelect` (which also fires on `selectionchange`) and are read again after each masked change. `data-active` is on `min(caret, length - 1)` only while the input has focus and nothing is selected.
- Pointer placement (item 3) runs on `click`, not `mousedown`, so a double click, a drag and a long press keep the browser's own selection. It maps the press to the nearest drawn slot by its box, and does nothing when the slots aren't displayed (the plain-field fallback).
- `masks.oneTimeCode` doesn't change case: the boxes show exactly what the input holds. A service that treats codes as case-insensitive normalises before it compares.
- The input is anchored with physical `left` or `right`, because it is always `dir="ltr"` and the row sits at the start of the column in either direction.

## Accessibility impact

- 3.3.8: paste, SMS autofill and password managers work, and the code is visible.
- 3.2.2: no focus moves and no submit on input.
- 1.3.1, 3.3.2 and 4.1.2: one input, named by its visible label and described by its hint. The slots are hidden from assistive technology, and the input is never hidden.
- 1.4.10, 1.4.12 and forced colours: the theme falls back to a plain field rather than misalign the slots.
- 2.5.8: the whole row is one target, far larger than 24×24px.
- 2.5.3: the accessible name is the visible label.
- No APG deviation: there's no APG pattern, and the control is a native text input.

## Consequences

- Positive: the boxes users expect, without the failures of one input per box.
- Negative / trade-offs:
  - The overlay of slots and input is the hardest part to style, and it needs the fallback.
  - Screen readers read a digits value as a number ("one hundred twenty-three thousand…") until the user moves through it by character. This is the same as any numeric field.
- Follow-ups: the M4 login entry block, and a "confirm your phone number" or "confirm your email" flow, with the design spec covering the resend link and timeouts.

## Validation

- Component tests: the input attributes, the slots' `aria-hidden` and data attributes, the paste normalisation, `onComplete`, and axe in every state.
- e2e: typing, paste, Backspace, arrow keys and selection on the one input. The forced-colors, RTL and 320px projects.
- Manual: SMS autofill on iOS Safari and Android Chrome, a password manager, NVDA, JAWS, VoiceOver, TalkBack and Dragon (pending).

## References

- WCAG 2.2: Understanding 3.3.8 Accessible Authentication (Minimum), 3.2.2 On Input
- WHATWG HTML: `autocomplete="one-time-code"`
- GOV.UK Design System: "Confirm a phone number" and "Confirm an email address" patterns (one input for the code)
- `input-otp` (React): one input with visual slots, as prior art for Option A
- ADR-0029, ADR-0032
