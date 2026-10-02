# Plan 0015: Keyboard section on every Docs page, and the backfill

- **Status:** Approved
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR-0039 (Proposed), ADR-0023, ADR-0004, Plan 0013, skill `.claude/skills/keyboard`

## Goal

A consumer or keyboard user opening any component's Storybook Docs page sees which keys it supports, taken from its tested contract. Every existing component, first the form inputs, meets ADR-0039 now, and a check keeps it that way.

## Non-goals

- No behaviour changes in the packages. If the backfill finds a component that breaks ADR-0039, stop and report it: it's a separate a11y defect with its own fix.
- No new components. Plan 0013's remaining phases (InputGroup, Checkbox, RadioGroup, DateInput) follow the keyboard skill as they're built.
- No new dependency. The Keyboard section is parsed with a small function, not a markdown library.

## Background

- Docs pages come from one template in `apps/storybook/.storybook/preview.tsx` (`parameters.docs.page`: Title, Subtitle, Description, Primary, Controls, Stories).
- `?raw` imports already work in Storybook (`theme.css?raw`). There's no `*.md?raw` type declaration yet.
- Eight contracts exist (`button`, `card`, `field`, `fieldset`, `icon`, `input`, `link`, `provider/kvirn-provider`), all with a Keyboard table `Key | Context | Action | Test`. Label, Description and ErrorMessage are covered by `field.a11y.md`, Number by `input.a11y.md`.
- Gaps found: no `Keyboard` story anywhere (Button's `Activation` is the closest), some rows with no test ("Native behaviour, not asserted", "Not handled"), no Shift+Tab row in Button, Link or Icon, and no focus lines.
- Precedent for a repo-walking check: `tooling/raw-colours/find-raw-colours.test.ts` (node project, `tooling/**/*.test.ts`).

## Design

### The pieces

1. **Parser**, `tooling/keyboard-docs/parse-keyboard-section.ts`, pure, no DOM. Input: a contract's markdown. Output: `{ noKeys: boolean, focusStrategy?, selectionFollowsFocus?, arrowsWrap?, shortcuts?, rows: { key, context, action, test }[] }`, or a list of problems. It reads only the `## Keyboard` section up to the next `## `. Unit-tested with inline fixtures.
2. **Check**, `tooling/keyboard-docs/keyboard-docs.test.ts`, following the raw-colours test (assert the walk found known files first, then `expect(problems).toEqual([])`). It fails when:
   - a `apps/storybook/src/components/*/*.stories.tsx` file has no `?raw` import of an `.a11y.md` or doesn't set `parameters.a11yContract`;
   - a `packages/react/src/**/*.a11y.md` is used by no stories file;
   - a contract's Keyboard section is missing, or has neither the four focus lines nor the exact no-keys sentence (`This component has no focusable parts and handles no keys.`);
   - a contract with focus lines has no `Tab` row and no `Shift+Tab` row;
   - a row's Test cell is empty or doesn't name a `*.e2e.ts ›` or `*.test.tsx ›` test;
   - a contract with focus lines has a stories file without a `Keyboard` story export.
3. **Doc block**, `apps/storybook/.storybook/keyboard-section.tsx`, `<KeyboardSection />`. It reads `a11yContract` from the current meta's parameters (`useOf('meta')`), parses it and renders:
   - an `<h2>` "Keyboard", in the same style as the Stories heading;
   - the no-keys sentence, or the focus lines as a short list and a `<table>` with a `<caption>` and the columns Key, Context and Action (no Test column). Each key is in `<kbd>`, and `Shift+Tab` shows as `<kbd>Shift</kbd>+<kbd>Tab</kbd>`;
   - nothing at all when the meta has no contract (foundation pages).
     It's added to the template after `<Controls />`. Docs strings are English, like the rest of the Docs pages (they're not component strings, hard rule 4).
4. **Types:** `declare module '*.md?raw'` next to the `*.css?raw` declarations, in both `css.d.ts` copies (or one new `md.d.ts` in each tree).

### Backfill, inputs first

| Component                               | Contract                       | Work                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Input, Number                           | `input.a11y.md`                | Focus lines (native). Rows from the skill's text-input table: Home/End and arrows not intercepted, ArrowUp/Down never step a number, paste, Enter submits, Shift+Tab. `Keyboard` story. A test per row |
| Field, Label, Description, ErrorMessage | `field.a11y.md`                | Focus lines (native, the control owns its keys, link `input.a11y.md`). Label, Description and ErrorMessage stories import this contract. Test per row                                                  |
| Fieldset                                | `fieldset.a11y.md`             | Focus lines. Disabled fieldset row tested. Test per row                                                                                                                                                |
| Button                                  | `button.a11y.md`               | Focus lines, Shift+Tab row. Rename `Activation` to `Keyboard` and update `button.e2e.ts` ids. Escape, arrows, Home/End "not handled" rows get tests                                                    |
| Link                                    | `link.a11y.md`                 | Focus lines, Shift+Tab row. `Keyboard` story. Space row tested                                                                                                                                         |
| Card, Icon                              | `card.a11y.md`, `icon.a11y.md` | The no-keys sentence. Existing Tab rows stay                                                                                                                                                           |
| KvirnProvider                           | `kvirn-provider.a11y.md`       | The no-keys sentence. The ThemeSwitcher rows describe the story's demo radios: keep them with tests, under a "In the ThemeSwitcher story" note                                                         |

Use the skill's row names and key names. Every e2e test is named after its row.

## Tasks

- [ ] Parser and its unit tests (failing first)
- [ ] The check, failing on today's tree, listing every gap
- [ ] `*.md?raw` types, `<KeyboardSection />`, added to the Docs template
- [ ] Backfill the form inputs: Input, Number, Field, Label, Description, ErrorMessage, Fieldset
- [ ] Backfill Button, Link, Card, Icon, KvirnProvider
- [ ] Add `tooling/keyboard-docs` to the root `tsconfig.json` `include` if needed
- [ ] Check passes. Every new or renamed row has its e2e test
- [ ] Changeset (none if no package changes, the contracts aren't published API) and `introduction.mdx` mentions the Keyboard section
- [ ] accessibility-reviewer APPROVE (the doc block is UI: heading, table semantics, `<kbd>`, axe on Docs pages)

## Risks & open questions

- Storybook's `useOf('meta')` must work inside a custom `docs.page`. If it doesn't, read `parameters` through `useOf('meta').preparedMeta.parameters` or the Docs context. Stop and report if neither works.
- Docs pages aren't axe-tested by `vp test run` (only stories are). Verify the Keyboard section with a story-free check: an e2e test that opens one Docs page (`viewMode=docs`) and asserts the table by role.

## Testing strategy

- Node: the parser and the check (`vp test run tooling/keyboard-docs`).
- e2e: one row-named test per Keyboard row, and one Docs page test (Input) for the rendered section, including axe with the gate's tags.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Every component's Docs page shows its Keyboard section, and the check is in `vp test run`
- [ ] Plan tasks ticked, `docs/plans/README.md` status updated
