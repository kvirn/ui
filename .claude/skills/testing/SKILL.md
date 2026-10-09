---
name: testing
description: KvirnUI testing procedure — Vitest (unit + browser-mode component tests with axe and every keyboard row), Storybook stories, and the quality gates. Use when writing or fixing tests, adding stories, running gates, or debugging a failing check.
when_to_use: write tests, TDD a component, failing CI, flaky test, add story, run quality gates, verify a change
---

# Testing

Tests are the definition of done. They come from the accessibility contract (`<name>.a11y.md`), not from the implementation.

## What we test, and what we never test

We test **behaviour, accessibility and requirements**. We never test CSS. Before you write a test, name what it proves: a contract row, a WCAG success criterion, or a requirement in the plan. If you can't, don't write it.

**Test:**

- Behaviour: state, values, events and callbacks, keys, focus moves, open and close, what's rendered and what isn't (`toBeVisible`, `toBeHidden`).
- Accessibility: roles, accessible names and descriptions, ARIA states, `aria-describedby` and reading order, focus management, announcements, axe, and strings in at least 2 locales.
- Requirements: the public API from the plan (props, `as`, refs, `mergeProps`, dev warnings) and the part-class contract, in **one** test per component.

**Never test:**

- Computed styles or CSS values: border, outline, line height, padding, margin, font, colour, display, overflow, transition, radius, shadow (`toHaveCSS`, `getComputedStyle`).
- Layout and geometry: whether a part sits above, under or beside another, heights, widths, alignment, bounding boxes.
- The text of `theme.css`: no parsing it for properties or values. `theme:check` covers contrast, fallbacks and the forced-colour mapping. That is the only theme test.
- Class lists beyond the one part-class test, `tagName`s that aren't a role, and anything React or the browser already guarantees.
- The same fact twice. Each fact is proved once, in the cheapest layer that can prove it: core, then component, then story. Keyboard rows are proved in the component test.
  - One standing exception (maintainer, 2026-10-04): a story's `play` may check the state it renders even when a component test proves it too. Don't delete these as duplicates.

**The one exception: a WCAG criterion that can only be measured visually.** Assert the criterion's threshold on the outcome, never the theme's value, and put the SC number in the test name:

| SC                      | Assert                                                  | Never assert                     |
| ----------------------- | ------------------------------------------------------- | -------------------------------- |
| 2.5.8 Target size       | the target is at least 24×24 CSS px                     | its padding or height            |
| 2.4.7 Focus visible     | a focused part shows an indicator (outline is not none) | outline width, offset or colour  |
| 1.4.10 Reflow           | no horizontal scroll at 320px (sweep project)           | grid or flex rules               |
| 1.4.12 Text spacing     | with the SC's spacing applied, no text is clipped       | line height or `overflow` values |
| 1.4.11 / forced colours | the boundary stays visible in forced colours (sweep)    | border width or system colours   |

The look is reviewed by eye in Storybook, never by test. When a test you meet breaks these rules, delete it in the change that touches it, and say so in the summary.

## Layers and file names

| Layer     | File                                                      | Runner                                                                                                                  | Proves                                                                                             |
| --------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Machine   | `packages/core/src/<name>/<name>.test.ts`                 | Vitest (node)                                                                                                           | State transitions, pure logic                                                                      |
| Component | `packages/react/src/<name>/<name>.test.tsx`               | Vitest browser mode (Playwright provider)                                                                               | Rendering, ARIA, props, **axe**, **every keyboard-table row** (incl. Shift+Tab, RTL arrows), focus |
| Stories   | `apps/storybook/src/components/<name>/<name>.stories.tsx` | `vp test run` (Storybook `addon-vitest`, a11y addon: axe violations fail), once per theme in four `storybook*` projects | Every visual state, plus play functions, in every theme                                            |

Vitest projects (root `vite.config.ts`): `node` (core, i18n, theme, tooling), `browser` (react, testing and the docs-site components, in Chromium) and the four `storybook*` projects. Stories live in the Storybook app, not the package. They import components the way an adopter does (`@kvirn-ui/react`). A fixture that the package's own tests also use stays in the package, and the story imports it by relative source path. It's never exported.

## TDD loop

1. Turn each contract row (keyboard, ARIA state, announcement, focus rule) into a test. Name the test after the row, for example `ArrowDown moves highlight to next option`.
2. Run it and **confirm it fails for the right reason.**
3. Implement until it passes. Refactor while it stays green.

## Rules

- **Query by role and name** (`getByRole('button', { name: 'Stäng' })`). Only use `data-testid` for things that have no role.
- **Every story state gets an axe run** with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
- **Assert the accessibility tree** with `expect(locator).toMatchAriaSnapshot(...)` for complex widgets.
- **Assert what is read aloud** with `readAloud(container)` and `readAnnouncements(container, act, { timeout? })` from `@kvirn-ui/testing/read-aloud`, one named test per row of the contract's Read aloud table. Use `toMatchAriaSnapshot` for role, name and state (no dependency), axe for rule violations, and these two for spoken phrases, order and live-region text. Limits: built on `@guidepup/virtual-screen-reader` (MIT, optional peer of the sub-entry, pre-1.0, phrases can change between versions); its own approximation of an accessibility tree, not NVDA or JAWS wording; it doesn't enforce or prove modality or focus containment; label and description text can be read as extra stops. Assert the key phrase, not the whole transcript.
- **Test focus explicitly**: `toBeFocused()` after every interaction that moves focus, and restore on close.
- **Test RTL in the component test** (`dir="rtl"` in the render). Forced-colors, reduced-motion and 320px are a dedicated sweep (planned, Plan 0051). Assert the outcome (keys still work, nothing scrolls sideways, the boundary is visible), not CSS values.
- **Test in at least 2 locales** (`sv` + `en`) so hard-coded strings get caught.
- **No mocking of the DOM or of focus.** Use browser mode, not jsdom, for components.
- **Keyboard docs are checked:** `tooling/keyboard-docs` fails when a stories file doesn't pass its contract as `parameters.a11yContract`, a Keyboard section is malformed, a row has no test, or a focusable component has no `Keyboard` story. See the `keyboard` skill.
- **Behaviour, accessibility and requirements only.** No CSS, layout or `theme.css` tests (see "What we test, and what we never test").
- **Never weaken a gate.** No `.skip`/`.only`, no disabled axe rules, no raised timeouts to hide flakiness, and no snapshot updates without reading the diff. Fix flaky tests at the root cause, which is usually a missing `await expect(...)` auto-wait.

## Stories and themes

Every story runs once per theme in four Vitest projects (`storybook`, `storybook-dark`, `storybook-light-contrast`, `storybook-dark-contrast`), and the initial toolbar globals come from `VITE_STORYBOOK_MODE` and `VITE_STORYBOOK_CONTRAST`. So a story state is checked with axe in all four themes, and story tests take about four times as long as one project. Docs pages share one `<html>`.

- **No fixed-theme exports** (`Light`, `Dark`, …). A story that is only valid in one theme pins it with `globals` and a play check, and says why.
- **Toolbars** are Mode (light, dark, system) and Contrast (standard, more). The shared play checks for the visual WCAG thresholds (`expectMinimumTargetSize`, 2.5.8, and `expectNoHorizontalOverflow`, 1.4.10) are in `apps/storybook/src/components/theme-story-assertions.ts`: use them instead of measuring by hand.
- **One decorator, no wrapper.** The story view sets `lang`, `dir` and `data-forced-colors` on `<html>`, and Docs pages scope them per story on a `display: contents` div. The decorator connects the theme store and resets both axes to `system` on cleanup. A story that drives the store itself sets `parameters.themeStore: 'story'`.
- **No initial Backgrounds value.** The addon's 0.3s transition races axe's contrast check. `preview.css` supplies the canvas colour and stays in the raw-colour check.
- **Docs pages** use `@storybook/addon-docs` with `tags: ['autodocs']`. See the `storybook-docs` skill.

## Test budget

Run the smallest thing that proves the point. Each full gate run happens **once per change**, by one agent.

**While iterating:**

- Run only the files you touched, or a single test:
  - `vp test run <file>`
  - `vp test run --project browser <file> -t "<name>"`
- No full-suite runs, and no `--changed` sweeps after every edit.
- **Pass paths while working** (AGENTS.md rule 11): `vp check <files>` and `vp test run <files>`, or `vp test related <files>`. Never run `vp check --fix` or `vp fmt` without paths. Run the whole-tree gates once, at the end.
- A failure that predates your branch isn't caused by you, but the tree has one owner: fix it if it blocks the gates, or report it with the file names. Never skip or disable it.
- No stress or repeat runs, unless a test actually flaked and you're investigating it.
- **Worker caps.** Vitest runs at most 2 workers per project (`VITEST_MAX_WORKERS` overrides it for a one-off). The caps are politeness for the machine, not gates: don't change a test, threshold or timeout to fit them. A whole-tree local run takes the Storybook projects one at a time, because running them in parallel flakes on dynamic imports.

**Who runs what:** the orchestrator runs the gates, once, after every subagent has reported done (AGENTS.md rule 12). While working, `component-engineer` runs `vp check <files>` and `vp test run <file>` on its own files, and `test-runner` runs one scoped gate for triage: one module per command, real paths, in the foreground, never while another run is going. Every other command in this section is the orchestrator's.

**Final gates:** the orchestrator runs them once, at the end, in this order, stopping at the first failure:

1. `vp check` (lint and types block, formatting is advisory; on your files while others may be editing; the whole tree only when you're the only one working)
2. `vp run test` (whole tree)
3. `vp run i18n:check`
4. `vp run theme:check`

Run `vp run build` only if package config or exports changed.

**No one repeats it:**

- Run the gates once per change. Re-run only the failed gate after a fix.
- `accessibility-reviewer` runs nothing. It reads the orchestrator's gate output. If it lists a `NEEDS RUN` command, the orchestrator runs just that, e.g. the component's test file.

## Maintainer preferences

- Stories follow the args-first convention: the real component as `meta.component`, shared `args`, autodocs, and themes as test projects (see `references/templates.md`).
- Test behaviour, accessibility and requirements. Never CSS: no borders, line heights, spacing or "is this above that". Fewer tests that each prove something.

## Debugging failures

1. Read the whole error, then reproduce it with a single test (`vp test run <file> -t "<name>"`).
2. For axe failures, read `violation.help`, `helpUrl` and the `nodes[].target`. Fix the markup, not the rule.
3. For a keyboard or focus failure, check `toHaveFocus()` after each key press and inspect the accessibility tree (`toMatchAriaSnapshot`) at the failing step.
4. After two failed fixes, stop, go back to the contract and re-plan.

## Templates

See [references/templates.md](references/templates.md) for machine, component+axe, and story skeletons.
