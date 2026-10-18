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

The matrix has three tiers. **Automated** rows are proved by re-runnable tests (anyone can run them with `vp test run`) and need no person. All of it runs in CI, the Display modes sweeps in one serial step. **Core** rows must pass before `beta`. **Release** rows are tested before 1.0, and before every minor release after it, for all changed components. Results go in `<name>.a11y.md`, dated and with versions, and are published on the docs site.

`alpha` and `beta` are the internal roadmap ladder only (`docs/roadmap.md`). On the docs site the same facts show as the derived status below: `alpha` is roughly `Automated`, and `beta` is `AT-verified`.

**Automated (re-runnable tests)** (maintainer, 2026-10-18):

| Row                                                                        | Proved by                                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | the Storybook projects                                               |
| Markup and ARIA (roles, names, ids, states)                                | the component test's role and state tests, and axe's structure rules |
| Keyboard contract rows (Vitest browser)                                    | the named keyboard tests in `<name>.test.tsx`                        |
| Focus order and management                                                 | the component test and the `Keyboard` story                          |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | the four sweep projects, for the components in the sweep list        |

| AT        | Browser | OS      | Tier    |
| --------- | ------- | ------- | ------- |
| NVDA      | Chrome  | Windows | Core    |
| VoiceOver | Safari  | iOS     | Core    |
| JAWS      | Chrome  | Windows | Release |
| TalkBack  | Chrome  | Android | Release |
| VoiceOver | Safari  | macOS   | Release |

The rows are the screen readers most widely used in public surveys such as the WebAIM screen reader survey, so a component is tested by a person on a few combinations instead of ten (maintainer, 2026-10-18). NVDA is Core because it is free, so anyone can repeat the test. Windows Contrast Themes, keyboard only with 400% zoom and 320px reflow, NVDA + Firefox, Narrator and Dragon / Voice Control are no longer rows. The trade-off: forced colours and Contrast Themes emulation, 320px reflow and text spacing are meant to be covered by the Display modes row: an emulated, opt-in sweep that runs on the components in `sweepComponents` in `vite.config.ts`, in CI after `vp run test`. For every other component they are untested until the sweep is extended. Keyboard operation is covered by the keyboard contract rows (Vitest). No person tests the real Windows Contrast Themes or zoom setting. Voice control and the other screen reader and browser pairs are not tested by a person.

**Static components.** A component that renders only native static elements, with no role override of its own (a role the consumer passes through, such as `role="presentation"`, is theirs), state, live region, focus or key handling, gets `n/a` on every human row (Core and Release), each with a Notes reason naming that fact. The `accessibility-reviewer` must agree. Its Automated rows (axe, markup test) stay (maintainer, 2026-10-18). Native semantics the consumer picks (the landmark element, the heading level) map through the browser, and no person verifies them for these components. A tier whose rows are all `n/a` shows `n/a`, never a verified word.

### When a row passes

A **Core** or **Release** row passes only when **both** checks pass (maintainer, 2026-10-13). An **Automated** row needs only the agent check: its Human check is `n/a` (maintainer, 2026-10-18). AI and LLM validation counts, as long as it can be proved and re-run.

| Check       | Who                                          | Counts when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent check | `accessibility-reviewer`, in a fresh context | Every behaviour the row covers is proved by a test in the repo that anyone can re-run, named in the record: keyboard rows in `<name>.test.tsx`, forced colours, reduced motion, reflow and text spacing by the four sweep projects (`testing` skill; the components in the sweep list), and screen reader rows by `readAloud` / `readAnnouncements` against the contract's Read aloud table. The reviewer returns APPROVE on that evidence. An agent's reading with no test behind it doesn't count |
| Human check | A person, on the real AT, browser and OS     | Done by hand on the real combination, recorded with the date, the tester and the AT, browser and OS versions. Agents never write or claim a human check                                                                                                                                                                                                                                                                                                                                             |

A Core or Release row with only the agent check is `agent-verified`, not passed: the virtual screen reader and browser emulation approximate the real AT, they don't replace it.

### Cell vocabulary and `n/a`

A cell is `pending`, `pass`, `agent-verified` (agent check only, Core and Release rows) or `n/a`. `n/a` means the row cannot apply, for example a native `<hr>` has nothing to operate. It needs a non-empty Notes reason and the `accessibility-reviewer` must agree with it. It counts as done, and is shown as `n/a`, never as `pass` (maintainer, 2026-10-18). A row with a missing or unproven reason is `pending`.

### Derived status

No page or contract states a status by hand: it is computed from the table (maintainer, 2026-10-18). Per tier, done is the rows whose Result is `pass` or `n/a`. The page shows the counts (`Automated 5 of 5, Core 0 of 2, Release 0 of 3`; `Core n/a` or `Release n/a` when every row of that tier is `n/a`) and the highest word that holds. `AT-verified` and `Release-tested` also need at least one row of the tier with Human check `pass`, because a person must have tested it; a tier of only `n/a` rows never earns a word (lead decision, 2026-10-18; the maintainer may overrule):

| Word             | When                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| (none)           | The Automated tier is not all done: counts only                                                         |
| `Automated`      | Every Automated row is done                                                                             |
| `Agent-verified` | Automated done and every Core row has its Agent check done, and Core is not all `n/a`                   |
| `AT-verified`    | Automated done, every Core row has its Result done, and at least one Core row has Human check `pass`    |
| `Release-tested` | AT-verified, every Release row has its Result done, and at least one Release row has Human check `pass` |

### Screen reader approximation

`readAloud` and `readAnnouncements` (`@kvirn-ui/testing/read-aloud`, optional peer `@guidepup/virtual-screen-reader`) walk a rendered subtree with a virtual screen reader (`@guidepup/virtual-screen-reader`) and return the phrases it speaks, such as "button, Menu, not expanded" or "polite: Saved". Component tests and the `accessibility-reviewer` use them to check names, states, reading order and live-region text against the contract's Read aloud table.

This is an approximation, not a screen reader. Its accessibility tree is its own, its wording is not NVDA's, JAWS's, VoiceOver's or TalkBack's, it doesn't prove modality or focus containment (that stays a component test), and its phrases can change between versions. It supports "designed and tested to meet WCAG 2.2 AA" and makes no compliance claim. On its own it never passes a matrix row: it is evidence for the agent check, and the human check still runs on the real AT. Orca can be used for local Linux checks, outside the matrix.

## User testing

- At least twice a year, test with disabled users recruited through Nordic disability organisations, and pay them.
- Blocks get plain-language review: _klarspråk_ in Sweden, _selkokieli_ in Finland. <!-- kv-lang-ok: national plain-language terms -->
