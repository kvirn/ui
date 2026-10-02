# ADR-0039: Follow the APG keyboard interface practice, and document every key in Storybook

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** a11y | api | tooling

## Context

Hard rule 2 says we follow the APG _pattern_ for each component, and the accessibility skill lists keyboard basics (one Tab stop per composite, arrows flip in RTL). The APG patterns only give each widget's key table. The cross-cutting rules sit in a separate APG practice, [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/): the Tab sequence, focus inside composites, focus versus selection, when selection follows focus, focusable disabled controls, key conventions and keyboard shortcuts. Nothing in our docs makes that practice binding, so each component would decide these on its own.

Keyboard behaviour is also invisible. Today it's written down only in `<name>.a11y.md` and tested in `<name>.e2e.ts`. A consumer reading the Storybook Docs page can't see which keys a component supports, and a keyboard user trying a story has to guess. The Button stories have a keyboard fixture, but no page says what the keys do.

## Decision drivers

- WCAG 2.2 AA: 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.1.4 Character Key Shortcuts, 2.4.3 Focus Order, 2.4.7 Focus Visible, 3.2.1 On Focus.
- Users who move between KvirnUI services and other sites should meet the same keys. Predictability matters more than cleverness.
- One source of truth. The contract, the tests and the docs must not drift apart.
- No new runtime dependency (hard rule 6). Headless packages ship no docs code.

## Options considered

### Option A: keep the APG patterns only, and leave keyboard docs to each story

- ✅ No new process
- ❌ Cross-cutting choices (disabled items, selection follows focus, shortcuts) are made ad hoc and differ between components
- ❌ Hand-written keyboard docs in stories drift from the contract and the tests

### Option B: make the APG keyboard practice binding, and render the contract's Keyboard table in Storybook

- ✅ Every component follows the same rules, and a deviation is visible because it needs an ADR
- ✅ The keyboard table is written once, in the contract, and shown on the Docs page
- ❌ The Storybook docs need a small doc block that reads the contract, and a check that it's present

## Decision

We will use Option B.

### 1. The APG keyboard practice is binding

Every component with a focusable or keyboard-operable part follows [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), in addition to its APG pattern. A deviation needs an ADR, as for patterns (hard rule 2). Concretely:

1. **Tab sequence.** Every interactive part is reachable with Tab and Shift+Tab, in DOM order. No `tabindex` greater than 0. A composite widget (radio group, tabs, listbox, menu, toolbar, grid) is one Tab stop, and arrow keys move inside it.
2. **Focus inside composites.** Roving `tabindex` is the default. `aria-activedescendant` is used only where DOM focus must stay on a text input (combobox). The contract states which one.
3. **Focus is discernible and predictable.** Focus never moves on its own except as the pattern requires (opening and closing a dialog or menu). Focusing something never changes context (3.2.1).
4. **Selection versus focus.** In a single-select composite, selection follows focus only when the result is instant and harmless. Otherwise Enter or Space selects. The contract states which, for example tabs with automatic or manual activation.
5. **Disabled controls.** Standalone controls use native `disabled` and leave the Tab sequence. Disabled items inside a composite (menu items, options, tabs, toolbar buttons) stay focusable with `aria-disabled="true"` so they can be discovered, and activation is blocked.
6. **Key conventions.** We use the APG's key assignments and the platform's modifiers (Control on Windows and Linux, Command on macOS). Arrow keys that mean "next" and "previous" in the reading direction flip in RTL. Home and End go to the first and last item. Whether arrows wrap is stated in the contract.
7. **Keyboard shortcuts.** Components define no global shortcuts by default. A component that offers shortcuts makes them opt-in, never uses a single character key without a way to turn it off or remap it (2.1.4), avoids keys taken by assistive technology (Insert, Caps Lock as modifiers), the browser or the OS, and exposes them with `aria-keyshortcuts` and in visible text from i18n.

### 2. All keyboard use is documented in Storybook

1. **The contract is the source.** The Keyboard table in `<name>.a11y.md` lists every key the component handles, including Tab and Shift+Tab, with the context, the action and the test that covers it. Gate 3 already requires an e2e test per row.
2. **Every Docs page shows it.** Each stories file passes its contract as `parameters.a11yContract` (a `?raw` import). The Docs page template renders the contract's Keyboard section through one shared doc block, `<KeyboardSection />`: the focus lines, and the table with Key, Context and Action. Keys are shown in `<kbd>`. Nobody copies the table into a story by hand.
3. **A component with no keyboard interaction says so.** Its contract starts the Keyboard section with `This component has no focusable parts and handles no keys.` (for example Card and Icon), and the Docs page shows it, so the absence is a fact rather than a gap. Parts documented in another contract (Label, Description and ErrorMessage in Field's) use that contract.
4. **There is a story to try it.** Each interactive component has a `Keyboard` story: the fixture the e2e keyboard spec drives, whose JSDoc points to the Keyboard section.
5. **A check enforces it.** `tooling/keyboard-docs` fails `vp test run` when a stories file passes no contract, a contract is used by no stories file, a Keyboard section is missing or malformed, a focusable component has no Tab or Shift+Tab row or no `Keyboard` story, or a row names no test.

The doc block and the check live in `apps/storybook` and `tooling`, so the packages ship nothing new. [Plan 0015](../plans/0015-keyboard-docs-and-backfill.md) builds them and brings every existing component, the form inputs first, up to this ADR. The procedure for agents and humans is the `keyboard` skill (`.claude/skills/keyboard/`).

## Accessibility impact

Positive. Keyboard behaviour becomes consistent across components and visible to consumers and keyboard users. Covers 2.1.1, 2.1.2, 2.1.4, 2.4.3, 2.4.7 and 3.2.1. It doesn't deviate from APG. It turns the APG practice from guidance into a rule.

## Consequences

- Positive: one keyboard model for the library, a deviation is always visible, and the docs can't drift from the tested contract.
- Negative / trade-offs: every interactive component needs a `Keyboard` story and a complete Keyboard table before gate 5 passes. The doc block and the check are new Storybook code to maintain.
- Follow-ups:
  - [Plan 0015](../plans/0015-keyboard-docs-and-backfill.md): the Keyboard doc block, the check, and the backfill of every existing component.
  - ✓ A `keyboard` skill, loaded by component-engineer, accessibility-reviewer and ux-designer, and listed in `AGENTS.md`.
  - ✓ The contract template has the focus lines and a Shift+Tab row. The accessibility skill, `apg-patterns.md`, the design skill, the testing skill's story template and the plan template point to the keyboard skill.
  - ✓ Hard rule 2 and gate 5 in `AGENTS.md` include the keyboard practice and the Docs page's Keyboard section.
  - Plan 0013's remaining phases (InputGroup, Checkbox, RadioGroup, DateInput) follow the keyboard skill.

## Validation

- `vp test run` includes the check, and it's green for every component.
- Gate 3 (`vp run e2e`) covers every Keyboard-table row, including Shift+Tab.
- accessibility-reviewer checks new component diffs against the practice.
- Keyboard-only rows in the manual AT matrix (ADR-0004) confirm it before `beta`.

## References

- WAI-ARIA APG, Developing a Keyboard Interface: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- WAI-ARIA APG patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- ADR-0004 (WCAG 2.2 AA baseline), ADR-0023 (Storybook story conventions)
