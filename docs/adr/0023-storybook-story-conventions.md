# ADR-0023: Storybook story conventions: args-first, autodocs, themes as test projects

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Magnus Vike
- **Tags:** tooling | a11y

## Context

The component stories grew page-shaped: a wrapper component as `meta.component`, a `<main><h1>` page per story, custom `render` on nearly every story, and four fixed-theme exports per component (`Light`, `Dark`, `LightHighContrast`, `DarkHighContrast`) as the axe gate for themes. That makes stories long (500+ lines), hides the real props from Storybook, and only checks themes on one matrix story per component.

The maintainer's reference Storybook (opti-react) uses a different convention that they want here: args-first stories on the real component, autodocs, separate Mode and Contrast toolbars, and themes covered by running every story in several Vitest projects. See [Plan 0008](../plans/0008-storybook-story-conventions.md).

## Decision drivers

- Gate 2 (0 axe violations in every story state) must not get weaker.
- Stories should document the component's real API.
- No new runtime dependency (hard rule 6). Dev tooling may add a Storybook addon with an ADR.

## Options considered

### Option A: keep the fixed-theme story exports

- ✅ No test config change
- ❌ Only one story per component is checked per theme
- ❌ Four near-identical exports in every file

### Option B: one Vitest project per theme

- ✅ Every story runs in all four themes, a stronger gate
- ✅ Story files shrink
- ❌ Story-test time grows about 4×

## Decision

We will use Option B, plus the reference conventions:

1. `meta.component` is the real component, with shared `args`. Stories are `{}` or `{ args }`, each with a one-line JSDoc. `render` only for compositions.
2. No page wrapper in stories. `layout` is `padded` by default and `fullscreen` only for page-level stories.
3. `@storybook/addon-docs` (dev dependency) with `tags: ['autodocs']`, and `introduction.mdx`.
4. The Theme toolbar becomes **Mode** (light, dark, system) and **Contrast** (standard, more), matching the theme store's two axes.
5. Root `vite.config.ts` runs the stories in four projects (light, dark, light with more contrast, dark with more contrast), and the initial globals come from `VITE_STORYBOOK_MODE` and `VITE_STORYBOOK_CONTRAST`.
6. **Show code shows what an adopter writes** (revision, 2026-10-02). A story whose `render` is a fixture component (`<DeadlineNotification locale="sv" />`) would show that wrapper in "Show code", which says nothing about the component. Such a story passes `parameters: showSource('<name>/<name>.fixture.tsx', 'FunctionName')` (`apps/storybook/src/docs-source.ts`), which shows the fixture function's own source, so the code on the page is the code that renders the example. A component's Docs page opens with its package docs (`<name>.md`, through `usageGuide`): how to use it and how to build your own, written once. Stories that already render the component inline need nothing.

This revises the story structure in ADR-0017 decision 5 and in `docs/design/storybook-presentation.md`.

### Implementation notes (Plan 0008)

Decisions made while implementing, for review with this ADR:

- **One decorator, no wrapper.** In a story's own view it sets `lang`, `dir` and `data-forced-colors` on `<html>`; on a Docs page it scopes them per story on a `display: contents` `<div>` instead, so each story keeps its own. It connects the theme store and selects the Mode and Contrast globals through it, and resets both axes to `system` on cleanup. Stories that drive the theme store themselves set `parameters: { themeStore: 'story' }` (the `KvirnProvider` stories); for them the decorator selects nothing.
- **No initial Backgrounds value.** The Backgrounds options use `--kv-color-canvas` and `--kv-color-surface`, but none is selected by default, unlike the reference. The addon's background has a 0.3s transition, and a theme change mid-transition would race axe's contrast check. The body gets the canvas colour from `preview.css` instead.
- **A story valid in one theme pins it.** `Components/Button › ThemeOverride` re-points `--kv-color-primary` to `accent-600` on a wrapper, a light-theme rebrand. In dark with more contrast the label fails 4.5:1 (2.62:1), so the story keeps its light pin (`globals: { mode: 'light', contrast: 'standard' }`), as before, and its play function checks the pin reached `<html>`.
- **Foundation theme stories check the theme.** The colour, border, focus-ring and theming stories (first named `CurrentTheme`, now named for their page) each first check that the toolbar's theme reached `<html>`, then run their theme-specific checks for that theme, so the four projects cover what the four fixed-theme exports did.
- **e2e themes through the URL.** The Card spec's former fixed-theme stories became `AllExamples` with `&globals=mode:…;contrast:…`, and the spec asserts `<html>` got the theme.
- **`preview.css` stays in the raw-colour check.** It moved to `.storybook/`, which the walk skipped as a dot directory, so `listCheckedCssFiles` now includes `apps/storybook/.storybook`.
- **Foundation hierarchy.** Foundation pages with several stories (Colors, Typography, Prose) keep autodocs and are a folder. Single-story pages turn autodocs off (`tags: ['!autodocs']`) and name their story like the title, so Storybook hoists them to a sidebar leaf; with a Docs entry they would be a folder of two.
- **`introduction.mdx`** is kebab-case like every other file (AGENTS.md conventions). It isn't a story, so it has no axe test; the old `introduction.stories.tsx` had one.

## Accessibility impact

Positive: axe (WCAG 2.2 AA tags, `test: 'error'`) runs on every story in every theme instead of one matrix per theme. Dropping `<main><h1>` affects only best-practice axe rules, which are not in the gate's tag set. RTL and forced-colors stories stay.

## Consequences

- Positive: shorter stories, a props table per component, wider theme coverage.
- Negative / trade-offs: story tests take about 4× as long. Docs pages share one `<html>`, so changing the theme in a story affects the whole Docs page. Language, direction and forced colours are scoped per story.
- Follow-ups: the testing skill's Story template follows this ADR.

## Validation

`vp test run` is green in all four storybook projects. Wall-clock time is recorded in Plan 0008 Verify.

## References

- Storybook Vitest addon: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- Storybook autodocs: https://storybook.js.org/docs/writing-docs/autodocs
