# Accessibility contract: Input

- **APG pattern:** none needed. Input is a native `<input>` with a text-like `type`. There is no APG pattern for a text field: the name, description and state come from HTML and `aria-describedby`.
- **Deviations:** none from APG. `type="number"` and `type="date"` are not accepted by design (ADR-0030).
- **Native elements used:** `<input type="text | email | tel | url | password | search">`.
- **Status:** alpha candidate (Plan 0013, Phase 1). Gates pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `input.test.tsx` next to this file. `input.stories.tsx` and `input.e2e.ts` in `apps/storybook/src/components/input/`, and `number.stories.tsx` in `…/number/` (its stories are covered by `input.e2e.ts`).

Input is the text control of a Field (`field.a11y.md`). It is a native input: the browser supplies the role (`textbox`, `searchbox`), the keyboard, selection, paste and autofill. Input adds the Field's wiring and the part class.

## Roles, states, properties

| Part  | Element / role                                          | ARIA / state                                                                                                                                                                                         | Notes                                                                                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input | `<input>` → `textbox` (`searchbox` for `type="search"`) | From the nearest Field: `id`, `aria-describedby` (description id, then error id), `aria-invalid="true"`, `aria-required="true"`, native `disabled`, `data-invalid`, `data-required`, `data-disabled` | Class `kv-input`. `type` is `text` (the default), `email`, `tel`, `url`, `password` or `search`. Your own `aria-describedby` ids are kept, after the Field's. `data-focus-visible` while it matches `:focus-visible`. Native `required`, `readOnly`, `disabled` and `aria-invalid` pass through |
|       | no Field                                                | none added                                                                                                                                                                                           | Needs `aria-label` or `aria-labelledby`, or a `<label>`. Dev warning (4.1.2, 3.3.2)                                                                                                                                                                                                             |
|       | `type="number"` or `type="date"`                        | –                                                                                                                                                                                                    | Rejected by the type. At runtime: dev warning that explains why (ADR-0030). It still renders what was asked for                                                                                                                                                                                 |

Numbers are text with `inputMode`: `<Input inputMode="numeric" spellCheck={false} />` for whole numbers and codes (leading zeros are kept), `inputMode="decimal"` for amounts. No `pattern` (the browser's own message would appear in its language), and no key filtering, so paste and autofill work.

`useInput` gives the same `inputProps` for your own `<input>`: it reads the nearest Field too.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

All native: Input handles no keys itself and never calls `preventDefault` on one. Number is the same Input with `inputMode` (ADR-0030), so its rows are here too. In a Field, the Label, Description and ErrorMessage are not Tab stops (`field.a11y.md`).

| Key                                 | Context              | Action                                                                       | Test                                                                                                                                                                           |
| ----------------------------------- | -------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tab / Shift+Tab                     | Input                | Moves focus to and from the input, in DOM order                              | `input.e2e.ts › Tab moves through the inputs in DOM order`                                                                                                                     |
| Characters                          | Input                | Types them. Nothing is filtered, also for numbers                            | `input.test.tsx › typing calls onValueChange with the value and the reason, and onChange too`, `input.e2e.ts › any character types, and nothing is filtered, also for numbers` |
| ArrowLeft / ArrowRight / Home / End | Input                | Move the caret (flips in RTL: the browser's own). Never intercepted          | `input.e2e.ts › ArrowLeft, ArrowRight, Home and End move the caret and are not intercepted`                                                                                    |
| ArrowUp / ArrowDown                 | Number (`inputMode`) | Native caret movement only. Never steps or changes a number value (ADR-0030) | `input.e2e.ts › ArrowUp and ArrowDown never change a number value`                                                                                                             |
| Control/Command+A                   | Input                | Selects all the text. Native                                                 | `input.e2e.ts › Control/Command+A selects all the text`                                                                                                                        |
| Control/Command+V                   | Input                | Pastes. Never blocked (3.3.8)                                                | `input.test.tsx › paste is not blocked`                                                                                                                                        |
| Enter                               | Input in a `<form>`  | Submits the form (implicit submission). Native, never prevented              | `input.e2e.ts › Enter in a plain form submits it with the typed values (native)`                                                                                               |
| Escape                              | Input                | Does nothing: the value and the focus stay                                   | `input.e2e.ts › Escape does nothing: the value and the focus stay`                                                                                                             |
| –                                   | its Label            | A click on the label focuses the input (native `<label for>`)                | `input.e2e.ts › clicking the label focuses the input`                                                                                                                          |

Copy, cut and undo (Control/Command+C, X and Z) are native too. Input adds no shortcuts.

## Focus management

- Initial focus: not moved. No `autoFocus` by default.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Input renders no overlay. A sticky header needs the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event                  | Message key (i18n) | Politeness                                                                                       |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Focus enters the input | none               | None live. The name, role, "required", "invalid" and the description (hint, then error) are read |

Input announces nothing itself. Its texts are the Field's (`field.a11y.md`).

## Consumer responsibilities

- Put every Input in a Field with a Label, or give it `aria-label` or `aria-labelledby` from your translations (4.1.2).
- Never use the placeholder as the label (3.3.2). Put an example in the Description, not in the box.
- Set `autoComplete` on every input that asks for the user's own data (`name`, `email`, `tel`, `postal-code`, `bday`): 1.3.5. Never `autocomplete="off"` on a password, and never block paste (3.3.8).
- Use `inputMode` for numbers, with `spellCheck={false}`. Don't use `type="number"` or `type="date"` (ADR-0030). Validate ranges and formats yourself and say what's wrong in an ErrorMessage.
- Choose a width class that fits the answer: `kv-input--width-2`, `-4`, `-6`, `-10`, `-20`. Width is a hint, never a limit: no `maxlength` comes from it.
- Read-only is for staff tools showing a value the user can't change here. Say why in the Description. In a resident form, avoid both read-only and disabled.
- Don't pass an `id` inside a Field: the Field's id wins, so the label stays associated (dev warning). Use `<Field.Root controlId>`.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline, 2px offset, 3:1 against the adjacent colours (2.4.7, 2.4.13), also on click in text inputs. Focused and invalid shows both the 2px `danger` edge and the ring.
- Target size: 44px high, 32px in compact from 64rem, at least 51px wide (2.5.8). Value text stays 16px in compact.
- Boundary: 1px `border-control`, 3:1 on every surface (1.4.11, `theme:check`). Invalid: 2px `danger`, without moving the text.
- forced-colors behaviour: the input keeps a real border in `ButtonBorder`. Invalid is a 2px `CanvasText` border. Disabled is dashed `GrayText` (`input.e2e.ts › forced colours: border and invalid state are visible`).
- reduced-motion behaviour: colour transitions only under `no-preference`.
- Reflow: no fixed widths beyond the width classes, which have `max-inline-size: 100%`. No horizontal scrolling at 320 CSS px (`input.e2e.ts › no horizontal scrolling at 320px: widths, Finnish label and numbers (1.4.10)`). The width classes include the 1.4.12 letter-spacing allowance, so the expected answer stays visible.
- RTL: logical properties only.

## WCAG SCs covered

- 1.3.1 Info and Relationships: the label, description and error are programmatically associated (`input.test.tsx › in a Field`).
- 1.3.5 Identify Input Purpose: `autoComplete` passes through (`input.test.tsx › passes autoComplete, inputMode and spellCheck for numbers (ADR-0030)`).
- 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.13: invalid edge and message, text and edge contrast, the focus ring.
- 2.1.1 Keyboard: native input.
- 2.5.3 Label in Name: the visible label is the name.
- 3.3.2 Labels or Instructions, 3.3.1 Error Identification: through the Field.
- 3.3.8 Accessible Authentication (Minimum): paste and autofill work, and no cognitive test is added.
- 4.1.2 Name, Role, Value: native role, name, `aria-invalid`, `aria-required`, `disabled`.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

Research questions for the AT run: does `inputMode="numeric"` bring up the right keyboard with VoiceOver and TalkBack? Is a decimal comma accepted by the form's own parser (consumer)?

## Known issues

- **`se` (Northern Sámi) is a placeholder. Blocks `beta`.** See `field.a11y.md`.
- **No Textarea yet.** It comes later and reuses Field (Plan 0013, non-goals).
- **No prefix or suffix (`kr`, `€`), no show-password button.** Out of scope for this phase (design spec, open question 9). Put the unit in the label or hint.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
