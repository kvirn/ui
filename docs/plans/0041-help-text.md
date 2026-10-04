# Plan 0041: `Hint` becomes `HelpText`

- **Status:** Draft
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

- [ ] Update `naming.test.tsx` first (display names and alias sets), then rename in `field`, `fieldset`, `checkbox-group`, `radio-group`, `index.ts`
- [ ] `theme.css` class, `theme/README.md`, `DESIGN.md` token, `theme:check`
- [ ] Stories, fixtures and e2e specs that use the part. Message keys such as `emailHint` may stay
- [ ] Docs, contracts and skills: `forms`, `api-conventions` (+ `dev-warnings.md`), `theme-css`, `AGENTS.md` forms row, roadmap rows
- [ ] Changeset (breaking, minor while 0.x)

## Decisions

- **`HelpText`** (table above). **Needs the maintainer's approval** since the name is the user's call between their two candidates and a third.
- Token rename in `DESIGN.md` needs approval and `theme:check`.

## Risks & open questions

- Rebase pain: `field.tsx`, `index.ts` and the stories are shared files. Do this in its own worktree and land it fast.

## Testing strategy

Existing tests carry over with new names. Nothing new.

## Rollout

Breaking in 0.x. Changeset lists the rename map.

## Done when

- [ ] All quality gates in AGENTS.md pass
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
