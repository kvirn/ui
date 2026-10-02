---
name: keyboard
description: KvirnUI keyboard interaction procedure (ADR-0039) — the WAI-ARIA APG keyboard interface practice made binding, plus documenting every key in the contract, the tests and the Storybook Docs page. Use when designing, implementing, documenting or reviewing anything a user can focus or operate with a keyboard.
when_to_use: new component, form input or control, keyboard or focus bug, Tab order, arrow-key navigation, roving tabindex, aria-activedescendant, disabled items, shortcuts, the Keyboard table in a *.a11y.md, the Keyboard story or Docs section, review of keyboard behaviour
---

# Keyboard

Every component with a focusable or keyboard-operable part follows the APG practice [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) **and** its APG pattern's key table. Every key it handles is documented in its contract, tested in e2e and shown on its Storybook Docs page. This is ADR-0039. A deviation needs its own ADR (hard rule 2).

Load this together with the `accessibility` skill (roles, names, focus visibility) and the `testing` skill (how to write the tests).

## Procedure

1. **Find the key table.** Look up the component in [references/key-tables.md](references/key-tables.md). Re-check the live APG pattern page, because APG gets updated. No pattern fits: stop and write an ADR before inventing keys.
2. **Native first.** A native control already has its keys: text editing in `<input>`, Space on a checkbox, arrows in a native radio group, Enter submitting a form. Don't re-implement them, don't `preventDefault` them, and document them anyway, because users read the table to learn the component.
3. **Apply the practice rules** below. Decide and write down the focus strategy, whether selection follows focus, and whether arrows wrap.
4. **Write the Keyboard table** in `<name>.a11y.md` (format below). Every key the component handles, plus Tab and Shift+Tab. Every row names its e2e test.
5. **Tests first.** One e2e test per row in `apps/storybook/src/components/<name>/<name>.e2e.ts`, named after the row. Arrow rows get an RTL test as well.
6. **Storybook** (Plan 0015). Never copy the table into a story or MDX by hand.
   - The stories file imports its contract and passes it to the Docs page:
     ```tsx
     import contract from '../../../../../packages/react/src/input/input.a11y.md?raw'
     const meta = { …, parameters: { a11yContract: contract } } satisfies Meta<typeof Input>
     ```
     Parts documented in another component's contract (Label, Description and ErrorMessage in `field.a11y.md`, Number in `input.a11y.md`) import that one.
   - The Docs page template renders the contract's Keyboard section (`<KeyboardSection />`, after Controls): the focus lines, and the table with Key, Context and Action. Keys show in `<kbd>`.
   - A component with a focusable part has a story named `Keyboard`: the fixture its e2e keyboard tests drive, with a JSDoc that says to try the keys in the table.
   - `tooling/keyboard-docs` fails `vp test run` when a stories file has no contract, a contract has no valid Keyboard section, or a row has no test.

## Practice rules (ADR-0039)

1. **Tab sequence.** Every interactive part is reachable with Tab and Shift+Tab, in DOM order, which matches the visual order. Never `tabindex` > 0. A composite widget (radio group, tabs, listbox, menu, menubar, toolbar, grid, tree) is **one** Tab stop. Arrow keys move inside it.
2. **Focus inside composites.** Roving `tabindex` by default: the current item has `tabindex="0"`, the rest `-1`, and moving calls `.focus()`. `aria-activedescendant` only where DOM focus must stay on a text input (combobox), and the active item must be scrolled into view. The contract says which.
3. **Discernible and predictable.** Focus is always visible and never on `body`. It moves on its own only where the pattern says so (opening and closing a dialog or menu). Focusing never changes context (3.2.1), and typing in a field never moves focus (3.2.2): no auto-advance between fields.
4. **Selection versus focus.** In a single-select composite, selection follows focus only when the result is instant and harmless. Otherwise Enter or Space selects (tabs with manual activation). The contract says which.
5. **Disabled controls.** A standalone control uses native `disabled` and leaves the Tab sequence. A disabled item inside a composite stays focusable with `aria-disabled="true"`, and activation is blocked.
6. **Key conventions.** The APG key assignments, with the platform's modifier (Control on Windows and Linux, Command on macOS). Arrows that mean next and previous in the reading direction flip in RTL. Home and End go to the first and last item. Wrapping is stated in the contract. Escape closes the innermost open thing and returns focus to its trigger.
7. **Shortcuts.** None by default. A component that offers them makes them opt-in, never uses a single character key without a way to turn it off or remap it (2.1.4), avoids keys taken by assistive technology (Insert and Caps Lock as modifiers), the browser (Control+L, F5, Control+F) or the OS, and exposes them with `aria-keyshortcuts` and in visible text from i18n.
8. **No traps.** Tab always leaves a component, except a modal dialog, which keeps focus inside and sets the background `inert` (2.1.2).

## The Keyboard table

In `<name>.a11y.md`, under `## Keyboard`:

```md
- **Focus strategy:** native | roving tabindex | aria-activedescendant
- **Selection follows focus:** n/a | yes | no (Enter or Space selects)
- **Arrows wrap:** n/a | yes | no
- **Shortcuts:** none

| Key       | Context        | Action                                | Test                                   |
| --------- | -------------- | ------------------------------------- | -------------------------------------- |
| Tab       | before the box | Moves focus into the input            | `input.e2e.ts › Tab focuses the input` |
| Shift+Tab | in the input   | Moves focus to the previous focusable | `input.e2e.ts › Shift+Tab leaves …`    |
```

- Key names: `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `PageUp`, `PageDown`, `Control+Home`, and `Control/Command+A` for platform pairs. RTL flips are their own rows or say "(flips in RTL)".
- **Action** says what the user gets, not what the code does.
- A component with no focusable part starts the section with exactly `This component has no focusable parts and handles no keys.` and has no focus lines. It may keep Tab rows that prove Tab passes over it. The Docs page shows the sentence.
- A wrapper whose focusable part is another component (Field around Input) says which component owns the keys and links that contract.

## Common mistakes (reject in review)

- Every item in a composite in the Tab sequence, or `tabindex` > 0.
- `preventDefault` on Home, End or the arrows in a text input, or on Enter so a form can't submit.
- Arrow keys that change a number value in a text field (ADR-0030: numbers are text).
- Auto-advancing focus to the next field when one is full (DateInput, one-time code).
- A disabled composite item removed from navigation with native `disabled`, so it can't be discovered.
- Single character shortcuts that can't be turned off. Shortcuts with no `aria-keyshortcuts`.
- Escape that closes more than the innermost layer, or doesn't return focus.
- A keyboard row with no e2e test, a test with no row, or arrows with no RTL test.
- Keys documented in a story's JSDoc or MDX by hand instead of in the contract.

## Review mode

Check, in order: the contract's table against the APG pattern and the rules above; the code against the table (press every key in the `Keyboard` story); every row against its e2e test; and the Docs page shows the Keyboard section. Report findings as `file:line — defect — SC (2.1.1, 2.1.2, 2.1.4, 2.4.3, 2.4.7, 3.2.1, 3.2.2) — affected users — fix`.

## References

- [references/key-tables.md](references/key-tables.md): key tables per component and pattern, including native form inputs
- ADR-0039, `docs/adr/0039-apg-keyboard-interface-and-documented-keys.md`
- APG keyboard practice: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
