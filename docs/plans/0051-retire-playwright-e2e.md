# Plan 0051: Retire Playwright e2e, test in Vitest browser mode

- **Status:** In progress (e2e retired; the display-mode sweep is open)
- **Owner:** maintainer, main session
- **Created:** 2026-10-06 · **Target:** tooling
- **Related:** `AGENTS.md`, the `testing` and `keyboard` skills

## Goal

One test runner. Keyboard rows, focus, announcements and axe are proved in Vitest browser mode, and the flaky Playwright e2e layer is gone.

## Decisions (maintainer, 2026-10-06)

- A frontend-only package has no e2e layer. Keyboard-contract rows live in `<name>.test.tsx`; `userEvent` from `vite-plus/test/browser` sends real key events.
- Port only tests that prove a contract row, a WCAG criterion or a plan requirement. Everything else is dropped: CSS and geometry, focus-ring styles, axe loops over stories (stories and component tests already run axe), a11y-tree duplicates, theme-toolbar plumbing.
- `@playwright/test` and `@axe-core/playwright` are removed. `playwright` 1.63.0 is added as a dev dependency in the pnpm catalog, because `@vitest/browser-playwright` requires it as a peer and it used to arrive only through `@playwright/test`. Same package family, Apache-2.0, already installed, no install script.

## Done (2026-10-06)

- All 34 `*.e2e.ts` specs ported and deleted: about 194 tests ported, about 204 contract cells re-pointed at existing `<name>.test.tsx` titles, about 268 tests dropped (the specs held 638 tests; the rest were duplicates of existing component tests). Every contract row names a test that exists.
- `playwright.config.ts`, `e2e-text-spacing.ts`, the `e2e` script, the CI `e2e` job and the `.e2e.ts` branches of `tooling/keyboard-docs` are removed. `icon.e2e.ts`'s named rule-13 exception went with it; the `var()` colour claim is a known issue in the Icon contract.

## Open

- [ ] **Display-mode sweep** (forced colours, reduced motion, 320px reflow, 1.4.12 text spacing): Vitest browser projects with Playwright context options (`forcedColors`, `reducedMotion`, `viewport`). Prove it on one component first. Claims in the contracts that the e2e suite used to back now say "a later sweep checks it".
- [ ] Tests that gave way when ported: virtualized "in view" scroll geometry (now asserts the rendered window and `aria-posinset`), Link "opens in a new tab" (asserts the key isn't intercepted), FileUpload Enter and Space (asserts `showPicker` is called).
- [ ] The `design` skill's screenshot recipe uses `pnpm exec playwright screenshot`: check it still resolves with the plain `playwright` package.
- [ ] `docs/design/*.md` still mention the e2e suite in places. They are specs, left as the record of what was decided.

## Done when

- [x] No `*.e2e.ts`, no `@playwright/test`, no `vp run e2e`
- [ ] `vp test run` and `vp run i18n:check` and `vp run theme:check` green (running)
- [ ] The display-mode sweep exists, or the maintainer drops it
