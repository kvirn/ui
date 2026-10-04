# Plan 0033: TextInput and NumberInput

- **Status:** Done
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0013](0013-form-fields.md), [0014](0014-input-masks-and-one-time-code.md), [0028](0028-compound-naming-and-part-aliases.md), [0032](0032-date-mask-and-masked-stories.md), `forms`, `api-conventions` and `storybook-docs` skills

## Goal

A team picks the control by what it asks for: `TextInput` for text, `NumberInput` for a quantity or an amount. A NumberInput doesn't take letters, and that needs no extra prop. The two Docs pages follow the Docs page template, and every "Show code" is code an adopter can copy.

## Non-goals

- The `kv-input` class and its modifiers stay as they are. They name the text box's look, which TextInput, NumberInput, DateInput's boxes, OneTimeCode and InputGroup share. No theme change.
- Part names stay: `InputGroup.Input`, `Combobox.Input` and `Autocomplete.Input` are parts, not the component. `InputGroup.Input` now renders a TextInput.
- No spinbutton. NumberInput is a text box: no stepping with the arrow keys, no spinner buttons (GOV.UK, and plan 0013).
- Codes (postcodes, case numbers, personal identity numbers) stay a TextInput with a mask (`masks.digits()`, `masks.postalCode()`), because a number would drop their leading zeros.
- Finished plans aren't rewritten. They're history.

## Decisions (the maintainer, 2026-10-04)

- **`Input` becomes `TextInput`, a hard rename with no deprecated alias.** We're in alpha, and the changeset says it's breaking.
- **NumberInput is a real component,** a TextInput with `masks.number()` built in, in the provider's locale.
- **`kv-input` stays.**
- **The stories take no code shortcuts:** no story-only wrapper components without `showSource`, no `pick()` or mapping helpers that hide the JSX, no `argTypes.mapping` that hands a component an object its "Show code" can't print.

## Design

### The rename

| Before                                                            | After                                                                                                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/src/input/` (`input.tsx`, `use-input.ts`, …)      | `packages/react/src/text-input/` (`text-input.tsx`, `use-text-input.ts`, `text-input.md`, `text-input.a11y.md`, `text-input.test.tsx`) |
| `Input`, `useInput`                                               | `TextInput`, `useTextInput`                                                                                                            |
| `InputProps`, `InputState`, `InputType`, `InputChangeDetails`     | `TextInputProps`, `TextInputState`, `TextInputType`, `TextInputChangeDetails`                                                          |
| `InputPartProps`, `UseInputOptions`, `UseInputResult`             | `TextInputPartProps`, `UseTextInputOptions`, `UseTextInputResult`                                                                      |
| `displayName` `Input`                                             | `TextInput`                                                                                                                            |
| dev warnings "An Input …", warning ids `input-*`                  | "A TextInput …", ids `text-input-*`. `type="number"` now says "Use NumberInput"                                                        |
| `Components/Form/Input`, `apps/storybook/src/components/input/`   | `Components/Form/TextInput`, `…/components/text-input/` (stories and e2e)                                                              |
| `Components/Form/Number`, `apps/storybook/src/components/number/` | `Components/Form/NumberInput`, `…/components/number-input/` (stories, fixture, e2e)                                                    |

Every consumer is updated: other components' imports (InputGroup, DateInput, OneTimeCode, Combobox and Autocomplete where they import the component, not the part name), tests, stories, fixtures, e2e story ids, the naming and keyboard-docs tooling tests, and the living docs (skills, agents, `docs/design/*`, `docs/roadmap.md`, `packages/theme/README.md`, the `theme.css` comments, the package `.md` files).

### NumberInput

```tsx
<Field.Root required>
  <Field.Label>Hur mycket hyra betalar du per månad?</Field.Label>
  <NumberInput name="rent" decimals={2} grouping min={0} className="kv-input--width-10" />
  <Field.Hint>I kronor, till exempel 1 250,50.</Field.Hint>
</Field.Root>
```

- **Flat, one element** (plan 0028 rule 2): `NumberInput` renders a TextInput with `type="text"`, `spellCheck={false}`, and the classes `kv-input kv-input--numeric`. Your `className` is added to them. `useNumberInput` serves your own `<input>`.
- **Props:** everything TextInput takes except `type` and `mask`, plus `decimals` (default 0), `allowNegative` (default false), `grouping` (default false), `min` and `max`. These go to `masks.number()`, in the provider's locale. `inputMode` follows the mask: `numeric`, `decimal`, or `text` when negatives are allowed, because iOS numeric pads have no minus sign.
- **Values:** `onValueChange(value, details)` as TextInput's, where `details.unmaskedValue` is the machine form (`-1234.5`) and `details.isWithinRange` reports `min` and `max`. The range is reported, never enforced. `min` and `max` aren't written as attributes, because they're invalid on a text input.
- **The hint warning:** a whole number (`decimals` 0) needs no format hint, so NumberInput warns only when `decimals > 0`, where the decimal mark needs an example (3.3.2).
- **In an InputGroup:** NumberInput works in `InputGroup.Root` like `InputGroup.Input` does (a unit such as "kr" as an Addon).

### Accessibility contract (draft)

`number-input.a11y.md`: a native `textbox`, not a `spinbutton`. The Keyboard section matches TextInput's, plus the ArrowUp and ArrowDown rows: they move the caret and never step the value. A rejected character is announced politely, throttled (the mask's messages). WCAG: 1.3.1, 1.3.5, 3.3.1, 3.3.2, 3.3.8 (paste is never blocked), 4.1.2, 4.1.3. One new string, `mask.maximumDecimals` (see Decisions: accessibility-reviewer finding).

### Stories (the `storybook-docs` template, with no code shortcuts)

- **TextInput:** `Default` is the main example. Every prop in `text-input.tsx` is in `meta.argTypes` with a control and a description, and `meta.args` holds the defaults. `mask` is `control: false`, with a description that links the masked examples, because a control can't print a preset call in "Show code". Each example after it shows one thing (types, widths, invalid, disabled, read-only, controlled, a plain form, on surfaces, compact, masked: personal identity number, postcode, date, long Finnish, RTL, forced colours). Inline JSX where it fits; a masked example is a fixture function with `showSource`, so "Show code" shows `mask={masks.postalCode({ country: 'SE' })}`. No `maskExampleFor`, `pick()` or `unmappedArgs`.
- **NumberInput:** `Default` has controls for `decimals`, `allowNegative`, `grouping`, `min`, `max`, `disabled`, `readOnly`, `className` and the rest, all plain values, so "Show code" is copyable. The examples are a whole number, an amount, an amount with a unit (InputGroup), negative numbers, out of range (an error under the field), Finnish, `Keyboard`, RTL and forced colours. The "Codes are not numbers" guidance (reference number, postcode) moves to the TextInput page as masked examples, and the NumberInput notes link to it. No `WholeNumberField`-style wrappers without `showSource`.
- Both: `parameters.a11yContract`, `description.component = usageGuide(guide)`, a one-line JSDoc per story, real Swedish text with the locale toolbar.

## Tasks

- [x] Rename `Input` to `TextInput` across `packages/react` (files, names, types, displayName, dev warnings, tests) and every consumer
- [x] Storybook: move `input/` to `text-input/` and `number/` to `number-input/`, update titles and story ids in every e2e spec
- [x] Living docs: skills, agents, design specs, roadmap, theme README and comments, the package `.md` files
- [x] `NumberInput` and `useNumberInput`, tests first: props to mask, the provider's locale, inputMode, classes, range reported, no `min`/`max` attributes, the hint warning only with decimals, inside InputGroup
- [x] `number-input.md` and `number-input.a11y.md`
- [x] TextInput stories, fixture, `text-input.md` and `text-input.a11y.md` rewritten to the template, with no code shortcuts
- [x] NumberInput stories rewritten to the template, with no code shortcuts
- [x] `text-input.e2e.ts` updated (the ArrowUp/ArrowDown and number-mask tests moved out, ids `components-form-textinput--*`, every story in the axe loop)
- [x] `number-input.e2e.ts` (the ArrowUp/ArrowDown row moves from `text-input.e2e.ts`, plus axe on every story)
- [x] Changeset: `@kvirn-ui/react` minor, BREAKING (Input → TextInput), plus NumberInput (`text-input-rename.md` and `number-input.md`)
- [x] Gates, then accessibility-reviewer APPROVE (2026-10-04). The manual AT matrix stays `pending`

## Decisions taken during implementation

- **Rename (tasks 1-3):** `useTextInput` still returns `inputProps` (the part is an `<input>`, and `useMask` returns `inputProps` too). The hook and component keep their prop-object names. In `docs/design/form-fields.md` the headings §6.3 and §6.4 became "TextInput" and the story rows were renamed. Prose that says "the Input" for the text box of an InputGroup, a OneTimeCode or the visual spec (the `input` token in DESIGN.md) was left, because it names the element or the part and not the component.
- `theme.css`: only the usage comment was changed (`<TextInput>`, and `<InputGroup.Input>` in the unit example). The `kv-input` class and its modifiers are untouched.

- **TextInput stories (task 6):**
  - `Default` renders `<TextInput {...args} />` in a Field, and `meta.args` and `meta.argTypes` cover every prop in `text-input.tsx` and `use-text-input.ts`. `mask` is `control: false`, pointing to the masked examples. `maskChoices`, `maskExampleFor`, `pick()`, `unmappedArgs` and `argTypes.mapping` are gone.
  - Examples that need state or a mask are functions in `text-input.fixture.tsx` with `showSource`, so "Show code" prints `mask={masks.postalCode({ country: 'SE' })}`: `ControlledName`, `NameAndEmailForm` (PlainForm and Keyboard), `PersonalIdentityNumberField`, `PostcodeField`, `StartDateField`, `ReferenceNumberField`. `RTL` and `ForcedColors` show `FieldStates` from `form.fixture.tsx`. The masked fixtures take their label and hint from `maskTextsFor` (mask fixture) and `dateTextsFor` (date-input fixture), so no strings are duplicated.
  - Story renames: `Masked` is now `MaskedPersonalIdentityNumber`, and `ReferenceNumber` moved here from the old Number page. `MaskedDate`'s hint example is `masks.date().withLocale(locale).format('2026-10-27')` (a day above 12, from the field's own mask), as plan 0032 decided.
  - Test plumbing left the examples: no `data-testid` on `Widths`, `LongFinnish`, `Controlled` or `PlainForm`. The plays and e2e find the text or the `.kv-story-narrow` column instead. `Widths` writes its five fields out instead of mapping over an array.
  - `text-input.e2e.ts`: the Characters contract row now cites `without a mask nothing is filtered, and a mask leaves out what it cannot take` (default story, then `masked-postcode`). The 320px test is titled `…widths, Finnish label and masked fields (1.4.10)`, and the contract cites the new title.

- **NumberInput (hook, component, contract, docs, stories, e2e):**
  - `useNumberInput` composes `useTextInput` and the mask's internal `useMaskedInput` with `masks.number()` built from its options, and returns `inputProps` (the Field's wiring, `kv-input kv-input--numeric`, `type="text"`, `inputMode`, `spellCheck={false}`, the mask's handlers and ref), the `mask`, `format`, `unmask` and the state. `NumberInput` renders through `renderPart` and does not wrap `TextInput`, so its dev warnings say "A NumberInput …" and carry `number-input-*` ids, and the TextInput masked-without-hint warning (which would fire for a whole number) does not apply. Its hint warning fires only when `decimals > 0`.
  - A consumer's `inputMode` or `spellCheck` wins over the mask's suggestion, as in TextInput. `min` and `max` are redefined as numbers on `NumberInputProps` (the native attributes are strings), and are never written to the DOM.
  - `onValueChange` reuses `TextInputChangeDetails`: there is no `NumberInputChangeDetails` alias, to keep the API small.
  - **Contract:** `number-input.a11y.md` is its own contract. Its Keyboard rows name component tests for Tab, paste and Enter (`number-input.test.tsx`), because they need no real page, and e2e tests for the rest. `text-input.a11y.md` no longer carries the NumberInput rows.
  - **Stories:** `Default` is a whole number (the children question) with every option as a control, and every example is inline JSX with no fixture, so there is no `showSource`. Two strings were added to `form.fixture.tsx` for `Negative` (`balance`, `balanceHint`, in sv, en, fi, nb and nn). `ReferenceNumber` and `Postcode` live on the TextInput page.
  - **Reviewer finding (4.1.3, 3.3.1): the decimals overflow.** The number engine refused a digit past `decimals` with the reason `length`, so the mask announced "You've entered all 7 characters" for `1 250,505`, which says nothing useful about the decimals. Decision: a new core rejection reason `decimals` (`MaskRejectionReason`, used for a digit past the decimals, in both places the number engine refused one), and a new message `mask.maximumDecimals` (no parameters, "No more decimals can be entered here.", in all six locales; `se` is the English placeholder like the rest of its mask strings). `useMask` announces it, throttled like the others. `MaskAllowedCharacters` excludes `decimals`. Core number tests that asserted `length` for too many decimals now assert `decimals`. This reverses the draft's "no new strings".
  - Known issues added to the contract after the review: a negative number may show its minus on the right in an RTL page (number masks don't set `dir="ltr"`), and a typed space with `grouping` on is announced as not allowed.

## Risks & open questions

- **A flaky e2e test, not caused by this plan:** `mask.e2e.ts › right to left: identifiers stay left to right` loses typed keys about once in three runs (`19900101-2199` for `199001012385`). This diff changes only the describe titles in that file. Follow up in its own fix.

- Story ids change (`components-form-input--*` → `components-form-textinput--*`). Every e2e spec that opens them is updated in the same change.
- Another session's uncommitted nb/nn work touches `mask.*` and some docs. The rename edits those files too, so its hunks stay out of this commit and the other session commits its own.
