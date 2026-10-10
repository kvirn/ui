# Plan 0098: A shared API for the native input controls

- **Status:** Done
- **Owner:** lead → component-engineer
- **Created:** 2026-10-10 · **Target:** alpha
- **Related:** `api-conventions`, `forms` skills; plans 0093, 0096

## Goal

TextInput, Textarea, NumberInput and PhoneInput state the same field wiring, options and result flags
four times, and the copies have drifted. They share one hook and one set of types, so a new input
or a fix to the wiring is made once.

## Non-goals

- No merged `useInput`: elements, part classes (`kv-input`, `kv-textarea`) and details types differ, and
  the one-hook-per-part rule stays.
- No runtime or markup change. Every exported name, prop, `data-*` attribute and class stays as it is.
- No change to `core`, i18n strings, the theme or the a11y contracts.
- DateInput, Checkbox, Switch, Slider, OneTimeCode and Listbox are left alone. DateInput has no Field
  wiring of its own (each box sits in a `Field.Root`, whose control props go on its input) and reads
  `disabled` from the Fieldset; the others strip `aria-required` or add item state, so they need
  different rules. They can adopt `useFieldControl` in a later plan.

## Background

Scout facts (`path:line`):

- `text-input/use-text-input.ts:88-121` and `textarea/use-textarea.ts:74-97` hold the same body: read
  `FieldContext`, derive `isInvalid`, `isRequired` and `isDisabled`, `useFocusVisible`, a memoised props
  object. `TextInputPartProps` (`:46-65`) and `TextareaPartProps` (`:30-49`) restate the same members.
  The result types differ only by `isFocused`, which Textarea returns and TextInput does not.
- `FieldControlPartProps` is `field/use-field.ts:87-94`; `UseFocusVisibleResult` is
  `focus-visible/use-focus-visible.ts:9-13`.
- NumberInput and PhoneInput call `useTextInput` and `useMaskedInput` (`mask/use-mask.ts:97`) and
  `Omit<TextInputPartProps, …>`, then re-state `isInvalid`, `isRequired`, `isDisabled` and
  `isFocusVisible` in the result, and `mask`, `announceRejections` and `messages` in the options
  (`use-number-input.ts:35-52`, `use-phone-input.ts:29-43`, `use-mask.ts:26-40`).
- `onValueChange` is typed with `TextInputChangeDetails` in `use-mask.ts:32`, `use-number-input.ts:45`
  and `use-phone-input.ts:36`.

## Design

### Shared types and hook (new `field/use-field-control.ts`, internal)

```ts
/** The members every input control's options share. */
export interface FieldControlOptions<TDetails> {
  /** Native `disabled`. A disabled Field disables the control too. */
  disabled?: boolean | undefined
  onValueChange?: ((value: string, details: TDetails) => void) | undefined
}

/** The state every input control reports, next to its props. */
export interface FieldControlState {
  isInvalid: boolean
  isRequired: boolean
  isDisabled: boolean
  isFocused: boolean
  isFocusVisible: boolean
}

/** Spread on the control: what the Field and the focus tracking give every input. */
export interface FieldControlPartProps … // id?, aria-*, disabled?, data-*, onFocus, onBlur
```

`useFieldControl({ disabled })` returns `FieldControlState & { controlProps }`, where `controlProps` is the
Field's props, the `data-disabled`, `data-focused` and `data-focus-visible` attributes and the
focus-visible handlers, memoised, in the order the hooks build them today (focus handlers last).

- `useTextInput` and `useTextarea` call it and add `className`, `type` or `rows`, and `onChange`.
- `UseTextInputResult` and `UseTextareaResult` extend `FieldControlState`. `isFocused` is new on
  TextInput's result: additive.
- `TextInputPartProps` and `TextareaPartProps` extend the shared part props. Their exported names stay.
- `UseTextInputOptions`, `UseTextareaOptions` extend `FieldControlOptions<…>` and keep their own docs for
  `onValueChange` only where the wording differs.

### Mask (in `mask/use-mask.ts`)

- `MaskBehaviourOptions { announceRejections?, messages? }` is the one place the two options and their
  docs live. `UseMaskOptions`, `UseNumberInputOptions` and `UsePhoneInputOptions` extend it.
- `MaskedInputPartProps` = `Omit<TextInputPartProps, 'className' | 'type' | 'onChange' | 'onFocus'>` plus
  `MaskInputPartProps`. NumberInput's and PhoneInput's part props extend it and keep only what they add
  (`className`, `type`, and `dir`/`autoComplete` for phone).
- `UseNumberInputResult` and `UsePhoneInputResult` extend `FieldControlState`.
- `mask` keeps its own type per hook: Number and Phone accept `false`, `useMask` requires a mask.

### Accessibility contract

Unchanged. The rendered attributes and handlers are identical, so no contract row changes.

### i18n strings and theming surface

None.

## Tasks

- [x] `field/use-field-control.ts` with `FieldControlOptions`, `FieldControlState`, the part props type
      and `useFieldControl`, plus `use-field-control.test.tsx` (names under Testing strategy)
- [x] `useTextInput` and `useTextarea` use it; types extend the shared ones
- [x] Mask: `MaskBehaviourOptions`, `MaskedInputPartProps`; NumberInput and PhoneInput use them
- [x] Export the new public types from `index.ts` (`FieldControlOptions`, `FieldControlState`,
      `MaskBehaviourOptions`); the hook stays internal
- [x] Docs: `api-conventions` skill (the shared hook for a native input), `forms` skill, the four
      components' `.md` option tables only where the member list moved
- [x] `docs/roadmap.md`: no entry for this plan, nothing to update

## Decisions

- **Chosen:** one internal hook plus shared types, per component hooks kept. **Weighed:** a merged
  `useInput` (rejected: breaks one-hook-per-part, mixes elements) and types only (rejected: the body
  would stay copied).
- **DateInput out of scope** (see Non-goals): it has nothing to share beyond `disabled`.
- **`isFocused` added to `UseTextInputResult`** so every control's result is the same shape. No maintainer
  approval needed: additive.

## Risks & open questions

- The memo dependency lists must stay correct: a stale `controlProps` would drop `data-focus-visible`.
  The existing component tests cover each attribute, and the shared hook gets its own.
- Declaration output: extended interfaces must stay readable in the Docs page's API table
  (`storybook-docs`). Check one story's table after the change.

## Testing strategy

No new behaviour, so the existing `text-input`, `textarea`, `number-input` and `phone-input` tests are
the proof and must pass untouched. `use-field-control.test.tsx` adds one named test per member:
Field state becomes `data-*` and `aria-*`, a disabled option disables the control, focus and
focus-visible attributes follow the handlers, and without a Field the control still works.

## Rollout

Types only widen: no consumer change and no migration.

## Done when

- [x] `vp check`, `vp test run` (the four components and the new test), `vp run i18n:check` and
      `vp run theme:check` pass
- [x] Plan tasks ticked, `docs/roadmap.md` updated
