---
name: testing
description: KvirnUI testing procedure — Vitest (unit + browser-mode component tests with axe), Storybook stories, Playwright keyboard/AT e2e, and the quality gates. Use when writing or fixing tests, adding stories, running gates, or debugging a failing check.
when_to_use: write tests, TDD a component, failing CI, flaky test, add story, run quality gates, verify a change
---

# Testing

Tests are the definition of done. They come from the accessibility contract (`<name>.a11y.md`), not from the implementation.

## Layers and file names

| Layer     | File                                                      | Runner                                                                                                                             | Proves                                                                   |
| --------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Machine   | `packages/core/src/<name>/<name>.test.ts`                 | Vitest (node)                                                                                                                      | State transitions, pure logic                                            |
| Component | `packages/react/src/<name>/<name>.test.tsx`               | Vitest browser mode (Playwright provider)                                                                                          | Rendering, ARIA, props, **axe**                                          |
| Stories   | `apps/storybook/src/components/<name>/<name>.stories.tsx` | `vp test run` (Storybook `addon-vitest`, a11y addon: axe violations fail), once per theme in four `storybook*` projects (ADR-0023) | Every visual state, plus play functions, in every theme                  |
| E2E       | `apps/storybook/src/components/<name>/<name>.e2e.ts`      | Playwright                                                                                                                         | **Every keyboard-table row** (incl. Shift+Tab, RTL arrows), focus, modes |

Stories and e2e specs live in the Storybook app, not the package. They import components the way an adopter does (`@kvirn-ui/react`). A fixture that the package's own tests also use stays in the package, and the story imports it by relative source path. It's never exported.

## TDD loop

1. Turn each contract row (keyboard, ARIA state, announcement, focus rule) into a test. Name the test after the row, for example `ArrowDown moves highlight to next option`.
2. Run it and **confirm it fails for the right reason.**
3. Implement until it passes. Refactor while it stays green.

## Rules

- **Query by role and name** (`getByRole('button', { name: 'Stäng' })`). Only use `data-testid` for things that have no role.
- **Every story state gets an axe run** with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
- **Assert the accessibility tree** with `expect(locator).toMatchAriaSnapshot(...)` for complex widgets.
- **Test focus explicitly**: `toBeFocused()` after every interaction that moves focus, and restore on close.
- **Test RTL, forced-colors, reduced-motion and 320px** using the Playwright projects or `page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })`.
- **Test in at least 2 locales** (`sv` + `en`) so hard-coded strings get caught.
- **No mocking of the DOM or of focus.** Use browser mode, not jsdom, for components.
- **Keyboard docs are checked** (ADR-0039): `tooling/keyboard-docs` fails when a stories file doesn't pass its contract as `parameters.a11yContract`, a Keyboard section is malformed, a row has no test, or a focusable component has no `Keyboard` story. See the `keyboard` skill.
- **Test functionality and WCAG only.** Don't assert styles (computed values, tokens, class lists beyond the part-class contract): the look is reviewed visually, not tested.
- **Never weaken a gate.** No `.skip`/`.only`, no disabled axe rules, no raised timeouts to hide flakiness, and no snapshot updates without reading the diff. Fix flaky tests at the root cause, which is usually a missing `await expect(...)` auto-wait.

## Test budget

Run the smallest thing that proves the point. Each full gate run happens **once per change**, by one agent.

**While iterating:**

- Run only the files you touched, or a single test:
  - `vp test run <file>`
  - `vp test run --project browser <file> -t "<name>"`
- No full-suite runs, and no `--changed` sweeps after every edit.
- **Pass paths while working** (ADR-0051, AGENTS.md rule 11): `vp check <files>` and `vp test run <files>`, or `vp test related <files>`. Never run `vp check --fix` or `vp fmt` without paths. Run the whole-tree gates once, at the end.
- A failure that predates your branch isn't caused by you, but the tree has one owner: fix it if it blocks the gates, or report it with the file names. Never skip or disable it.
- No stress or repeat runs, unless a test actually flaked and you're investigating it.
- E2E: one spec on one project, `vp run e2e <spec> --project chromium`, and only if story, fixture or keyboard behaviour changed.
  - Keep `vp run storybook` running in the background, so Playwright reuses it instead of booting a new server each run.

**Who runs what:** only the main session (orchestrator) runs checks, and only after every subagent has reported done (AGENTS.md rule 12). Subagents never run them. Everything in this section describes what the orchestrator runs, scoped and sequential. Ignore "while iterating" advice if you are a subagent.

**Final gates:** the orchestrator runs them once, at the end, in this order, stopping at the first failure:

1. `vp check` (lint and types block, formatting is advisory; on your files while others may be editing; the whole tree only when you're the only one working)
2. `vp test run`
3. `vp run e2e <spec> --project chromium`: the `chromium` baseline (ADR-0048), for the specs you changed. A path-less run is blocked (ADR-0057); CI runs the whole suite. The display-mode projects and other browsers only for a dedicated sweep, with `E2E_BROWSERS=sweep|all`
4. `vp run i18n:check`
5. `vp run theme:check`

Run `vp run build` only if package config or exports changed.

**No one repeats it:**

- Run the gates once per change. Re-run only the failed gate after a fix.
- `accessibility-reviewer` runs nothing. It reads the orchestrator's gate output. If it lists a `NEEDS RUN` command, the orchestrator runs just that, e.g. the component's e2e spec on `chromium`, or on the sweep projects when a dedicated sweep is requested.
- The Stop hook skips work when nothing changed since its last green run.

## Debugging failures

1. Read the whole error, then reproduce it with a single test (`vp test run <file> -t "<name>"`).
2. For axe failures, read `violation.help`, `helpUrl` and the `nodes[].target`. Fix the markup, not the rule.
3. For e2e failures, run with `--trace on` and inspect the trace. Check focus and the accessibility tree at the failure step.
4. After two failed fixes, stop, go back to the contract and re-plan.

## Templates

See [references/templates.md](references/templates.md) for machine, component+axe, story and e2e skeletons.
