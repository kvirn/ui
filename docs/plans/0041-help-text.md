# Plan 0041: `Hint` becomes `HelpText`

- **Status:** Done (maintainer approved, 2026-10-04; gates green 2026-10-05)
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0029](0029-field-hint.md), [0028](0028-compound-naming-and-part-aliases.md), `forms`, `api-conventions` skills

## Goal

The part under a control that gives a format, an example or a limit has a name that says what it is: `Field.HelpText`.

## Non-goals

- `FileUpload.DropHint` and the Listbox option hints (`optionHint`, `--kv-listbox-option-hint`) are different things and keep their names.
- No change to behaviour, placement (under the control), size (14px) or `aria-describedby` wiring.
- Finished plans (0029) and their file names are history.

## Background

The part is `Field.Hint` (`field.tsx`), with typed wrappers `Fieldset.Hint`, `CheckboxGroup.Hint` and `RadioGroup.Hint`, class `kv-field-hint`, warnings `hint-outside-field` and `hint-before-control`, and a Storybook page `Components/…/Hint`. About 200 lines in `packages/react`, 73 in Storybook, 14 in `theme`, and the docs.

## Design

### Name

| Candidate               | Verdict                                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`HelpText`** (chosen) | Reads as what it is. Stays under `Field.*`, `Fieldset.*`, `CheckboxGroup.*` and `RadioGroup.*` like `Label` and `ErrorMessage`. Matches common usage (helper text in Material and Chakra). |
| `InputHint`             | Wrong for a Fieldset or a group: a group's text describes several controls, not an input. A top-level name also breaks the "parts live under their parent" rule (`api-conventions`).       |
| `InputSuggestion`       | Wrong meaning: a suggestion reads as Autocomplete or Combobox results.                                                                                                                     |

### Rename map

| Before                                                             | After                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `Field.Hint`, `FieldHint`, `FieldHintProps`, `FieldHintState`      | `Field.HelpText`, `FieldHelpText`, `FieldHelpTextProps`, `FieldHelpTextState` |
| `Fieldset.Hint`, `CheckboxGroup.Hint`, `RadioGroup.Hint` (+ types) | `….HelpText`                                                                  |
| `kv-field-hint`                                                    | `kv-field-help-text`                                                          |
| `field-hint` token in `DESIGN.md` (typography)                     | `field-help-text` (maintainer approval: a token rename)                       |
| warnings `hint-outside-field`, `hint-before-control:*`             | `help-text-outside-field`, `help-text-before-control:*`                       |
| `apps/storybook/src/components/hint/`, title `…/Hint`              | `…/help-text/`, `…/HelpText`                                                  |
| `docs/design/field-hint.md`                                        | `docs/design/field-help-text.md`                                              |

Hard rename, no deprecated alias (alpha, same as plan 0033). Other warnings that say "a hint" in their text say "help text".

## Tasks

- [x] Update `naming.test.tsx` first (display names and alias sets), then rename in `field`, `fieldset`, `checkbox-group`, `radio-group`, `index.ts`
- [x] `theme.css` class, `theme/README.md`, `DESIGN.md` token (`theme:check` is the orchestrator's run)
- [x] Stories, fixtures and e2e specs that use the part. Message keys such as `emailHint` may stay
- [x] Docs, contracts and skills: `forms`, `api-conventions` (+ `dev-warnings.md`), `theme-css`, `AGENTS.md` forms row, roadmap rows
- [x] Changeset (breaking, minor while 0.x)

## Decisions

- **`HelpText`** (table above). Accepted by the maintainer, 2026-10-04, including the `DESIGN.md` token rename `field-hint` to `field-help-text` (`theme:check` still to run: no token value changed, so no new contrast pair).
- **Hard rename, no alias.** The warning keys follow the part (`help-text-outside-field`, `help-text-before-control:*`), and so does `number-input-decimals-without-hint`, which becomes `number-input-decimals-without-help-text` because it names the same thing. The Storybook page id changes with the title (`components-form-helptext--*`), and the stories `WithOptionHints`, `WithHintUnder`, `InvalidWithHintUnder` and `UnderHint` become `WithOptionHelpTexts`, `WithHelpTextUnder`, `InvalidWithHelpTextUnder` and `UnderHelpText`.
- **What kept the word "hint" on purpose:** `FileUpload.DropHint` and its class, the Listbox `optionHint` and `--kv-listbox-option-hint`, `RichTextEditor.KeyboardHint` (an instruction under the box, not the Field part), message keys (`emailHint`, `linkUrlHint`, `richText.keyboardHint*`, `duration12Hint`, …), the fixtures' `hint` text fields (`text.hint` in the Combobox and Autocomplete fixtures), the DateInput `autoAdvanceHint` of Plan 0040 (another change in flight), and the history: finished plans, the changesets already written, and the maintainer's quoted rule in `field-help-text.md`.
- **Skills and docs** changed with the code: `forms`, `api-conventions` (alias table and `dev-warnings.md`), `theme-css`, the design review checklist, the `AGENTS.md` forms row, `DESIGN.md` (token and prose), `theme.css` comments and `theme/README.md`, the design specs (`field-help-text.md`, `form-fields.md`, `one-time-code.md`, `rich-text-editor.md`, `combobox.md`) and the contracts.

## Risks & open questions

- Rebase pain: `field.tsx`, `index.ts` and the stories are shared files. Do this in its own worktree and land it fast.

## Testing strategy

Existing tests carry over with new names. Nothing new.

## Rollout

Breaking in 0.x. Changeset lists the rename map.

## Done when

- [x] All quality gates in AGENTS.md pass (2026-10-05: `vp check`, `vp test run`, every `vp run e2e` spec on chromium, `i18n:check`, `theme:check` green)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
