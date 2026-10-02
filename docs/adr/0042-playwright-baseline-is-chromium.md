# ADR-0042: The Playwright baseline is Chromium only, other browsers are opt-in

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** tooling | testing

## Context

ADR-0002 set up eight Playwright projects: `chromium`, `firefox`, `webkit`, `chromium-forced-colors`, `chromium-reduced-motion`, `mobile-safari`, `mobile-chrome` and `reflow-320`. Running them all multiplies every e2e run by the number of projects. WebKit and mobile Safari can't even launch on a Linux dev machine without `sudo` and system libraries, so `vp run e2e` reports a hundred failures that say nothing about the code. The Vitest browser and Storybook projects already run in Chromium only. The manual AT matrix (`docs/accessibility.md`), not Playwright, is what covers the screen readers and the other engines.

## Decision

- **The baseline is Chromium.** `vp run e2e` runs four projects: `chromium`, `chromium-forced-colors`, `chromium-reduced-motion` and `reflow-320`. They cover the keyboard contract, focus, forced colours, reduced motion and 320px reflow, which is what AGENTS.md gate 3 names.
- **The other projects stay defined, and are off.** `firefox`, `webkit`, `mobile-safari` and `mobile-chrome` are in `playwright.config.ts`. `E2E_BROWSERS` turns them on: a comma-separated list of project names, or `all`. Example: `E2E_BROWSERS=firefox,webkit vp run e2e <spec> --project firefox`.
- **CI installs Chromium only.** To run more there, add the browsers to the `playwright install` line and set `E2E_BROWSERS` on the `vp run e2e` step.
- The baseline is a floor for development, not a claim about other browsers. Any statement about browser support must come from a run with those browsers on, or from the manual AT matrix.

## Consequences

- ✅ An e2e run is about a third of the size, and fails only for real reasons on a dev machine.
- ✅ Nothing is removed: turning a browser on is one variable.
- ⚠️ A Firefox or WebKit-only regression isn't caught by default. Run with `E2E_BROWSERS=all` before a release, and record it with the manual AT matrix.
- Supersedes ADR-0002 item 6 (eight projects) and the WebKit part of item 7.

## References

- ADR-0002, `docs/engineering.md`, `playwright.config.ts`
