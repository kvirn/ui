# ADR-0004: WCAG 2.2 AA as release baseline

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Maintainer
- **Tags:** a11y, compliance

## Context

EN 301 549 v3.2.1 references WCAG 2.1 AA, and the next revision is expected to adopt 2.2. Nordic public-sector adopters need to be ready for that. Manual assistive-technology testing is the most reliable evidence we can produce, but it's also the most expensive, and the project has a single maintainer.

## Decision

1. **Baseline.** Every component and block must meet WCAG 2.2 AA. The default theme additionally meets 2.4.13 Focus Appearance and 2.5.5 Target Size (Enhanced), and the high-contrast theme meets 1.4.6.
2. **`alpha`** requires quality gates 1–6 in AGENTS.md: automated checks plus an independent review.
3. **`beta`** requires alpha plus a pass on the **core AT set**:

   | AT                                     | Browser | OS      |
   | -------------------------------------- | ------- | ------- |
   | NVDA                                   | Firefox | Windows |
   | VoiceOver                              | Safari  | macOS   |
   | VoiceOver                              | Safari  | iOS     |
   | TalkBack                               | Chrome  | Android |
   | Windows Contrast Themes                | Edge    | Windows |
   | Keyboard only, 400% zoom, 320px reflow | any     | any     |

4. **Before 1.0, and before every minor release after it,** JAWS (Chrome), NVDA (Chrome), Narrator and voice control must be tested across all changed components.
5. **Results are recorded** in each `<name>.a11y.md`, dated and with the versions tested. Agents never mark AT rows as passed.

## Consequences

- **Positive:** a clear, auditable bar that one person can sustain, and that covers the most-used screen readers in the Nordics on every platform.
- **Negative:** JAWS-specific bugs may surface late, at minor-release checkpoints rather than per component. Releases are slower than with automated checks alone.
- **Follow-ups:** ✓ The tiers in the matrix in `docs/accessibility.md` now match this ADR.
