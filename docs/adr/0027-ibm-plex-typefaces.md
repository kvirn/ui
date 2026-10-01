# ADR-0027: IBM Plex Sans for text and IBM Plex Serif for headings

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (chose Plex after a side-by-side trial). Recorded by the main session.
- **Tags:** theming, typography, a11y
- **Amends:** ADR-0014 (the Type bullet: Inter as the substitute for Linear's fonts) and ADR-0017 decision 4 (which font the self-hosted `@font-face` CSS ships). Plan 0011.

## Context

The default theme, the docs site and Storybook set everything in Inter. In the maintainer's Brave on Ubuntu, button labels in Inter were drawn visibly high in the button. Inter's vertical metrics are clean: its capitals sit exactly in the middle of the line box. We couldn't reproduce the offset in headless or headed test browsers here. It's a rendering difference on that desktop, and real users have desktops like it.

A temporary Storybook toolbar compared eight typefaces on the maintainer's screen. Source Sans 3, IBM Plex Sans, Lato and the system font looked right. Inter, Roboto, Noto Sans and Open Sans didn't. The maintainer chose IBM Plex Sans, and IBM Plex Serif for headings.

## Decision drivers

- Labels look centred for the people using the service, on their setup.
- Every Nordic letter and every Northern Sámi letter (á č đ ŋ š ŧ ž) comes from the font, not a fallback.
- l, I and 1, and O and 0, can be told apart in case numbers, codes and names.
- No third-party requests and no telemetry (hard rule 7). Licence terms we can meet.
- The theme still loads no font, and adopters can override both families.

## Decision

1. **IBM Plex Sans** is the default for body text, labels and controls. `--kv-font-family-sans` starts with `'IBM Plex Sans'`, then the system stack.
2. **IBM Plex Serif** is the default for headings. A new `--kv-font-family-serif` is `'IBM Plex Serif'` then a new `--kv-font-family-system-serif` (`ui-serif, Cambria, 'Noto Serif', Georgia, serif`), so headings stay serif if the font doesn't load, and headings read `var(--kv-font-family-heading, var(--kv-font-family-serif))`. `--kv-font-family-heading` and `--kv-font-family-body` stay adopter overrides. The surfaces, token values and feature settings are in [`docs/design/typography-ibm-plex.md`](../design/typography-ibm-plex.md).
3. **IBM's own files, unmodified.** The licence (SIL OFL 1.1) reserves the name "Plex", so a file we subset or instance couldn't be called IBM Plex. We ship IBM's split woff2 (Latin1, Latin2, Pi) from `@ibm/plex-sans` 1.1.0 and `@ibm/plex-serif` 2.0.0. Weights: Sans 400, 500 and 600, Serif 500 and 600, upright only. That's about 240 KB in all, and a page loads only the subsets and weights it uses.
4. **Not as dependencies.** Those packages send IBM telemetry from a `postinstall` script, so we fetch them with `npm pack` (no scripts run) and commit the woff2 to `apps/docs/fonts/ibm-plex/`. Updating the font means repeating that by hand. The adopter docs say the same, and point to IBM's GitHub releases.
5. ADR-0017's decision 4 otherwise stands: plain `@font-face` CSS, one family name per typeface split by `unicode-range`, imported by the docs site and Storybook from `apps/docs/fonts/`.

## Options considered

- **Keep Inter.** ✅ No change, and its metrics are correct. ❌ Labels look wrong on the maintainer's desktop, and we can't fix rendering in a font we don't control.
- **Source Sans 3 or Lato.** ✅ Also looked right in the trial. ❌ The maintainer preferred Plex, and Lato's coverage of the Sámi letters would need checking.
- **The system font.** ✅ No download, always native. ❌ It differs by platform, so the theme can't promise a look or the l/I/1 distinction.
- **Plex, our own variable subset.** ✅ Smaller, one file per subset. ❌ The Reserved Font Name forbids calling a modified file Plex.

## Consequences

- ✅ Plex's `hhea` and `win` metrics agree (1025/275), so the line box is the same on Windows, macOS and Linux.
- ✅ Plex's figures are tabular by default, and its `l` has a tail.
- ⚠️ Plex's x-height (0.516em) is smaller than Inter's (0.546em), so text looks a little smaller at the same size. The spec handles it.
- ⚠️ Heading tracking, the Storybook text guide and the Icon's capital-height alignment were tuned to Inter. They're retuned.
- ⚠️ Adopters who relied on the default Inter get Plex, or the system fallback if they don't self-host it. Setting the two family tokens keeps Inter.
- ❌ Font updates are manual (`npm pack`, copy, check the `unicode-range` in IBM's CSS).

## Validation

The Glyphs story shows every Nordic and Sámi letter and l I 1 O 0 in each family. Browser checks confirm the self-hosted Plex is what renders. The maintainer confirms labels look centred in their Brave. The manual AT matrix is unaffected (`pending` as before).
