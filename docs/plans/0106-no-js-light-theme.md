# Plan 0106: Without JavaScript, the theme is light

- **Status:** Approved
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-12 · **Target:** pre-alpha
- **Related:** `theme-css` skill, `docs/design/button-depth.md`, `kvirn-provider.md`

## Goal

`theme.css` writes each theme once. A page without JavaScript gets the default light theme
(standard contrast) and a `<noscript>` notice on the docs site says what JavaScript adds.

## Non-goals

- `light-dark()` or any other restructuring of the theme blocks.
- A library `<noscript>` component or new i18n strings in `@kvirn-ui/i18n`.
- Changing forced colours (`@media (forced-colors: active)` needs no JavaScript and stays).
- The docs site's own no-JS rules (`apps/docs/app/docs.css:440-452`): they use the missing
  attribute as a no-JS marker, which stays true.

## Background

`theme.css` section 4 (`:604-735`) repeats the dark, light-contrast and dark-contrast themes
under `@media (prefers-color-scheme / prefers-contrast) :root:not([data-kv-color-scheme])`, and
`theme:check` plus two tests keep the copies equal. With JavaScript the attributes are always
set, already resolved from the OS (`packages/core/src/theme/theme-store.ts:151-156`, `:298-315`,
`:407-426`): `KvirnProvider` (`kvirn-provider.tsx:227`) or `useTheme` (`use-theme.ts:84`) connect
the store and follow OS changes; `KvirnThemeScript` sets them before first paint.

### Options weighed

1. Keep the fallbacks (status quo): 3 duplicated blocks, a test to keep them equal.
2. `light-dark()` + `color-scheme`: fewer blocks, but Baseline only since 2024 (an older browser
   loses the tokens), colours only, and `theme:check` must learn to resolve it.
3. **Chosen (maintainer, 2026-10-12):** drop the fallbacks; no JavaScript means light.

### Decisions taken

- The maintainer accepts that a no-JS user with a dark or more-contrast OS setting gets the
  light, standard theme. It's still designed and tested to meet AA, and forced colours still apply.
- Accepted: a server-rendered app that sets `theme: 'system'` without `KvirnThemeScript` paints
  light and switches after hydration. A page with `theme.css` and no provider or `useTheme`
  has no dark theme. Both get a documented note: use `KvirnThemeScript` for first paint and
  `KvirnProvider` (or `useTheme`) for the attributes.
- The `<noscript>` notice is the docs site's own (its `messages/en.ts`), plus a recipe in the
  `KvirnProvider` docs. The library ships no new component or strings.
- `theme:check` no longer compares OS fallbacks. This is a gate change approved by the maintainer
  in this plan. `themeEnvironment`'s `'system'` source (public, `packages/theme/src/index.ts:18`)
  is removed because nothing in a theme answers to it any more. Pre-alpha, so no changeset;
  docs are updated (hard rule 9).

## Design

### Theming surface

- `theme.css`: delete section 4 (`:604-735`) and renumber section 5. Fix the header at `:65`
  and the section 3 comment at `:470-478`. It now says the attributes choose the theme and
  without them the page is light.
- The forced-colours selector `:root:is(*, [data-kv-color-scheme][data-kv-contrast])` (`:742`)
  stays: it must still outrank the attribute blocks.

### Tooling and tests

- `check-theme.ts:35-90`: remove the `system` resolution (`:52-54`), both "in the system fallback"
  messages and the doc bullet. The "equal in their fallback" wording also goes.
- `read-theme.ts:31-57`: `themeEnvironment(themeName)` only; remove `source`, plus the
  `source` threading at `:318` and in `resolveThemeColors`.
- `theme-css.test.ts`: the `theme:check` test name (`:58-61`) drops "every fallback"; delete
  the fallback regex assertions (`:213-240`) or re-point them at the attribute blocks if they
  prove a design requirement (button-depth.md), and delete "the system fallback equals the
  theme" (`:251-260`).
- New test in `theme-css.test.ts`: with no attributes and a dark, more-contrast OS
  (`media` set, `attributes: {}`), every `--kv-color-*` resolves to the light theme's value.
  This proves the new requirement.
- `read-theme.test.ts`: drop the `:root:not(...)` fixture rule and the system-fallback
  test (`:15-23`, `:40-47`, `:94-101`).
- Storybook: `apps/storybook/src/foundation/foundation-helpers.tsx:86-91, :172-173` and
  `colors-semantic.tsx` / `colors-palette.tsx`: drop any `'system'` source; keep the
  attribute path. `tooling/foundation-docs/foundation-docs.test.ts`: same.

### Docs site notice

- `apps/docs/app/layout.tsx`: a `<noscript>` as the first child of `<body>`, text from
  `apps/docs/messages/en.ts` (for example: "JavaScript is off. The page works, but dark mode,
  more contrast and the interactive examples need JavaScript."). Style it with an existing
  `docs.css` notice or `kv-alert` class. No inline style.

### Docs and skills (each fact in its home)

- `.claude/skills/theme-css/SKILL.md:25, 36, 41, 93, 105`; `.claude/skills/testing/SKILL.md:25`.
- `packages/theme/README.md:47, 228`; `packages/react/src/provider/kvirn-provider.md:299, 397`
  (plus the `<noscript>` recipe and the `KvirnThemeScript` first-paint note);
  `kvirn-provider.a11y.md:13`.
- `docs/architecture.md:151`; `apps/docs/components/rendering-page.tsx:334-336`;
  `apps/storybook/.storybook/preview.tsx:28` comment.
- Design specs (`docs/design/button-depth.md:284, 330, 340`, `default-theme-button-link.md:65,
97, 130`, `docs-site.md:105, 492`, `docs-code.md:41`, `docs-header-bands.md:35`,
  `docs-site-components.md:36`, `docs-landing-and-header.md:80`): fix only lines that state
  the current behaviour. Plans (`0090:61`) are history; leave them.

## Tasks

- [x] Test first: the no-JS light test fails today
- [x] `theme.css` section 4 removed, comments fixed
- [x] `check-theme.ts`, `read-theme.ts` and their tests; Storybook foundation helpers
- [x] Docs site `<noscript>` + `messages/en.ts`
- [x] Docs and skills listed above
- [ ] Gates: `vp check`, `vp test run packages/theme apps/storybook/src/foundation tooling/foundation-docs`, `vp run theme:check`, `vp run i18n:check`
- [ ] `accessibility-reviewer` on the diff
- [ ] `docs/roadmap.md` if it mentions OS fallbacks
