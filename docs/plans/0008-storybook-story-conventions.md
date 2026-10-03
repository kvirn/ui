# Plan 0008: Storybook story conventions (args-first, autodocs, themes as test projects)

- **Status:** Implemented, accessibility review pending
- **Owner:** Magnus Vike / component-engineer
- **Created:** 2026-10-01 · **Target:** M1
- **Related:** [storybook-presentation.md](../design/storybook-presentation.md)

## Goal

Every story in `apps/storybook` reads and renders like the stories in the maintainer's reference Storybook (`opti-react/frontend/apps/storybook`): short, args-first stories on the real component, a Docs page per component, and each story axe-tested in every theme without per-theme story exports.

## Non-goals

- No change to components, tokens or `theme.css`.
- Foundation pages keep their content and helpers. They only adopt the new preview (layout, toolbar, no fixed-theme exports).
- No change to the Playwright projects or the keyboard contracts. The e2e specs change only where a story ID or a theme selection changes.

## Background

Reference conventions (opti-react):

- `const meta = { title, component: X, args, argTypes } satisfies Meta<typeof X>` on the **real** component, so autodocs infers the props table. Shared `args` in meta; most stories are `{}` or `{ args: {...} }`.
- One short JSDoc line per story says what it shows. Names are the state (`Default`, `Disabled`, `LongLabels`, `RequiredOnly`).
- `render` only when a story needs several components (a matrix, a form). No page wrapper (`<main><h1>`).
- Play functions take `({ canvas, userEvent })` from the story context.
- `layout` is Storybook's default (`padded`). `fullscreen` only for page-level stories.
- `parameters.backgrounds` uses semantic tokens, so the canvas follows the theme.
- `tags: ['autodocs']` and `@storybook/addon-docs`. `Introduction.mdx` explains the Storybook.
- Toolbar: **Mode** (light / dark / system) and **Contrast** (standard / more), each with icons and `dynamicTitle`.
- Themes are covered by **Vitest projects**: the same stories run once per theme, with the initial globals set from `VITE_STORYBOOK_*` env vars.
- Shared fixtures live in one folder with an `index.ts` barrel.

## Design

### Preview (`apps/storybook/.storybook/`)

- `main.ts`: `stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)']`, addons `addon-vitest`, `addon-a11y`, `addon-docs`. Telemetry stays disabled.
- `preview.tsx`:
  - globals `mode` (`light` | `dark` | `system`, icons sun/moon/browser) and `contrast` (`standard` | `more`, icon contrast), both with `dynamicTitle`. `initialGlobals` read `import.meta.env.VITE_STORYBOOK_MODE` / `VITE_STORYBOOK_CONTRAST`, defaulting to `light` / `standard`.
  - Keep `locale`, `dir` and `forcedColors` globals.
  - One decorator: selects the theme through the theme store (as today), and sets `lang` and `dir` on `<html>`. No wrapper div. Stories that drive the theme store themselves (KvirnProvider) opt out with `parameters: { themeStore: 'story' }`.
  - `parameters.layout` stays the default (`padded`). `backgrounds.options` use `--kv-color-canvas` and `--kv-color-surface`.
  - `tags: ['autodocs']`. `a11y.test: 'error'` with the WCAG tags, unchanged.
  - Sidebar order: Introduction, Foundation, Components.
- `preview.css` (moved from `src/story-canvas.css`): body font and canvas colours from tokens, plus the `kv-story-*` helpers the Foundation pages still use. Helpers no story uses any more are deleted.
- `Introduction.mdx` replaces `introduction.stories.tsx`, same content, plus how theme coverage works.

### Vitest projects (root `vite.config.ts`)

`storybook` (light), `storybook-dark`, `storybook-light-contrast`, `storybook-dark-contrast`: the same plugin and browser config, `env` sets the two globals. Four projects, not opti's three, so dark with more contrast keeps its axe run (gate 2 is not weakened). If the projects race on Vite's dependency cache when run in parallel, cap `maxWorkers` per project rather than dropping a project.

### Story shape

```tsx
const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Spara' },
  argTypes: { className: { control: 'inline-radio', options: [...variant classes] } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** The base look is secondary: a primary button is always an explicit choice. */
export const Default: Story = {}

/** Natively disabled: skipped by Tab. */
export const Disabled: Story = { args: { disabled: true } }

export const KeyboardFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button')).toHaveFocus()
  },
}
```

- Removed from every file: `Light`, `Dark`, `LightHighContrast`, `DarkHighContrast` exports and the `fixedTheme` helper. `expectThemeApplied` goes unless a story still needs it (the provider stories).
- Removed: `StoryPage` (`<main><h1>`). The WCAG tag set doesn't include the best-practice `region` / `page-has-heading-one` rules, so axe coverage is unchanged.
- Kept: `RTL` and `ForcedColors` stories (gate 5), stories the e2e specs target, and the play-function assertions (rewritten to the context `canvas`/`userEvent`).
- Visible fixture text stays per locale, with `globals.locale` matching it (3.1.2).

### Foundation hierarchy

The sidebar is at most one level deep under Foundation: a folder only where a page has several stories.

- `Foundation/Colors` is one title with three stories, _Palette_, _Semantic tokens_ and _Text on surface_, in `colors.stories.tsx`. The pages are plain modules (`colors-palette.tsx`, `colors-semantic.tsx`, `colors-matrix.tsx`, no `.stories`) that export the page and its play check. Autodocs stays on.
- `Foundation/Typography` (`typography.stories.tsx`) splits the Type scale page into _Type roles_, _Font families_, _Glyphs_ and _Tabular figures_, one per section, each measured live where it was before. Autodocs stays on.
- `Foundation/Prose` (`prose.stories.tsx`) moves up from `Foundation/Typography/Prose`. Its stories are unchanged.
- The single-story pages (Overview, Spacing, Radius, Borders and elevation, Focus ring, Motion, Density, Layout, Theming) set `tags: ['!autodocs']` and name their story like the title's last segment. Storybook 10.6 hoists a component whose only child is a story with that name (`isStoryHoistable` in the manager), so each is a leaf. The former _Current theme_ stories keep their play functions under the new names.
- `storySort` orders titles only (`includeNames` is off), so the stories inside Colors and Typography keep their export order.
- Overview links to story ids (`foundation-colors--text-on-surface`), not component ids, because a component id opens only its first story.

### Accessibility contract

Unchanged for every component. Coverage after the change: each story × 4 themes in Vitest (was: one fixed-theme matrix story per theme).

## Tasks

- [x] Story conventions decision (Proposed)
- [x] Add `@storybook/addon-docs` to the catalog and the Storybook app
- [x] `main.ts`, `preview.tsx`, `preview.css`, `Introduction.mdx`
- [x] Four Vitest projects in `vite.config.ts`
- [x] Rewrite `button.stories.tsx`, `link.stories.tsx`, `card.stories.tsx`, `kvirn-provider.stories.tsx`
- [x] Foundation pages: drop fixed-theme exports and `layout: 'fullscreen'`, keep content
- [x] Update the e2e specs for changed story IDs; select themes with `&globals=mode:dark;contrast:more`
- [x] Update `.claude/skills/testing/references/templates.md` (Story template) and the testing SKILL row for stories
- [x] Update note in `docs/design/storybook-presentation.md` pointing to the storybook-docs skill
- [x] Foundation hierarchy: `Foundation/Colors` with three stories from plain page modules
- [x] Foundation hierarchy: `Foundation/Typography` split into Type roles, Font families, Glyphs and Tabular figures, with the play assertions split to match
- [x] Foundation hierarchy: Prose moved to `Foundation/Prose`
- [x] Foundation hierarchy: single-story pages as sidebar leaves (`!autodocs`, story named like the title), hoisting confirmed in the built Storybook
- [x] Foundation hierarchy: `storySort`, Overview links and play check, `DESIGN.md`, the theme README and the foundations design spec follow the new titles
- [x] Changeset (Storybook is private: `none` bump is not possible, so note it in the existing default-theme changeset only if a public package changed; otherwise no changeset). No public package changed, so no changeset

## Risks & open questions

- Four projects multiply story-test time by four. Mitigated by caching; measured in Verify.
- Autodocs renders every story on one page: stories that set `<html>` attributes (dir, theme) affect the whole Docs page. Acceptable for a workbench; documented in the Introduction.
- Story IDs change where exports are renamed; the e2e specs and any docs links must follow.

## Verification

```sh
vp check
vp test run          # all four storybook projects, 0 axe violations
vp run e2e --project chromium
vp run e2e --project chromium-forced-colors
vp run i18n:check
vp run theme:check
```

### Results (2026-10-01)

- `vp check`: clean (250 files formatted, 146 linted and type-checked).
- `vp test run`, as two disjoint halves: `node` + `browser` 29 files, 360 tests passed; the four `storybook*` projects 72 files, 312 tests passed, **11.9s Vitest duration, 13.5s wall-clock** for all four projects in parallel (no dependency-cache race seen, so no `maxWorkers` cap). The 4 skipped files are `introduction.mdx`, once per project: the plugin collects it through the `*.mdx` stories glob and finds no stories.
- `vp run e2e` on chromium, firefox, chromium-forced-colors, chromium-reduced-motion, mobile-chrome and reflow-320: 726 passed.
- `vp run i18n:check` and `vp run theme:check`: passed.
- Manual AT matrix: `pending`.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] accessibility-reviewer returns APPROVE
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
