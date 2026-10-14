# Accessibility

## Baseline

- **Target:** WCAG 2.2 AA for every component and block. The default theme also meets 2.4.13 Focus Appearance for keyboard focus, and 2.5.5 Target Size (Enhanced), and the high-contrast theme meets 1.4.6.
- **Patterns:** WAI-ARIA APG, and the APG keyboard practice (the `keyboard` skill). A deviation needs the maintainer's approval and the skill or the pattern's key table updated in the same PR.
- **Legal mapping:** EN 301 549. See [compliance.md](compliance.md).
- **Procedure, checklist and contract template:** `.claude/skills/accessibility/`. These are plain Markdown and written for humans too.
- **Definition of done:** the quality gates in [AGENTS.md](../AGENTS.md#quality-gates).

## WCAG 2.2 additions and what we do about them

| SC                              | What we do                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------- |
| 2.4.11 Focus Not Obscured       | Floating layers never cover focus. Scroll-padding helpers handle sticky headers   |
| 2.4.13 Focus Appearance (AAA)   | Default ring of at least 2px at 3:1 contrast, enforced by `theme:check`           |
| 2.5.7 Dragging Movements        | Every drag has a single-pointer alternative                                       |
| 2.5.8 Target Size (Min)         | Default theme uses at least 24×24px. A dev warning fires when a target is smaller |
| 3.2.6 Consistent Help           | Help slot in header and footer blocks                                             |
| 3.3.7 Redundant Entry           | The form wizard carries answers forward                                           |
| 3.3.8 Accessible Authentication | Paste and autofill allowed, correct `autocomplete`, no cognitive tests            |

## Assistive technology matrix

A component is `alpha` when quality gates 1 to 6 pass, and `beta` when it is alpha and every **Core** row below has passed. **Release** rows are tested before 1.0, and before every minor release after it, for all changed components. Results go in `<name>.a11y.md`, dated and with versions, and are published on the docs site.

| AT                                     | Browser         | OS              | Tier    |
| -------------------------------------- | --------------- | --------------- | ------- |
| Windows Contrast Themes                | Edge            | Windows         | Core    |
| Keyboard only, 400% zoom, 320px reflow | all             | all             | Core    |
| VoiceOver                              | Safari          | macOS           | Core    |
| VoiceOver                              | Safari          | iOS             | Core    |
| TalkBack                               | Chrome          | Android         | Core    |
| NVDA                                   | Chrome          | Windows         | Core    |
| NVDA                                   | Firefox         | Windows         | Core    |
| Narrator                               | Edge            | Windows         | Core    |
| JAWS                                   | Chrome          | Windows         | Release |
| Dragon / Voice Control                 | Chrome / Safari | Windows / macOS | Release |

### When a row passes

A row passes only when **both** checks pass (maintainer, 2026-10-13). AI and LLM validation counts, as long as it can be proved and re-run.

| Check       | Who                                          | Counts when                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agent check | `accessibility-reviewer`, in a fresh context | Every behaviour the row covers is proved by a test in the repo that runs in CI, named in the record: keyboard rows in `<name>.test.tsx`, forced colours, zoom and reflow by a Vitest test (Plan 0110), and screen reader rows by `readAloud` / `readAnnouncements` against the contract's Read aloud table. The reviewer returns APPROVE on that evidence. An agent's reading with no test behind it doesn't count |
| Human check | A person, on the real AT, browser and OS     | Done by hand on the real combination, recorded with the date, the tester and the AT, browser and OS versions. Agents never write or claim a human check                                                                                                                                                                                                                                                            |

A row with only the agent check is `agent-verified`, not passed: the virtual screen reader and browser emulation approximate the real AT, they don't replace it.

### Screen reader approximation

`readAloud` and `readAnnouncements` (`@kvirn-ui/testing/read-aloud`, optional peer `@guidepup/virtual-screen-reader`) walk a rendered subtree with a virtual screen reader (`@guidepup/virtual-screen-reader`) and return the phrases it speaks, such as "button, Menu, not expanded" or "polite: Saved". Component tests and the `accessibility-reviewer` use them to check names, states, reading order and live-region text against the contract's Read aloud table.

This is an approximation, not a screen reader. Its accessibility tree is its own, its wording is not NVDA's, JAWS's, VoiceOver's or TalkBack's, it doesn't prove modality or focus containment (that stays a component test), and its phrases can change between versions. It supports "designed and tested to meet WCAG 2.2 AA" and makes no compliance claim. On its own it never passes a matrix row: it is evidence for the agent check, and the human check still runs on the real AT. Orca can be used for local Linux checks, outside the matrix.

## User testing

- At least twice a year, test with disabled users recruited through Nordic disability organisations, and pay them.
- Blocks get plain-language review: _klarspråk_ in Sweden, _selkokieli_ in Finland.
