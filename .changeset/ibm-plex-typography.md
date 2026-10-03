---
'@kvirn-ui/theme': minor
---

The default fonts are now IBM Plex Sans for text and controls and IBM Plex Serif for headings, instead of Inter. **Headings are now serif.** To keep sans headings, set `--kv-font-family-heading: var(--kv-font-family-sans)`. To keep Inter, self-host it and set `--kv-font-family-body` and `--kv-font-family-heading` to it, and set the body roles' `--kv-font-*-feature-settings` back to `'cv05', 'cv08'`.

What changed:

- `--kv-font-family-sans` starts with `'IBM Plex Sans'`, then the system stack.
- New `--kv-font-family-serif` (`'IBM Plex Serif'`, then `--kv-font-family-system-serif`) and `--kv-font-family-system-serif` (`ui-serif, Cambria, 'Noto Serif', Georgia, serif`), the serif twin of `--kv-font-family-system`.
- Prose headings (`h1` to `h6`) fall back to `--kv-font-family-serif` instead of sans. Use the same family wherever you apply the display tokens. `--kv-font-family-body` and `--kv-font-family-heading` are still yours to set.
- Retuned for Plex: display has line height 1.2 and tracking -0.01em, and heading-1 and heading-2 have no tracking. The body, lead, body-large and body-small roles no longer set `cv05` and `cv08`, and numeric keeps only `tnum`.

The theme still loads no font. Without the files, the system fonts are used. Self-host IBM's unmodified woff2 files, from [IBM Plex's GitHub releases](https://github.com/IBM/plex/releases) (or copy `apps/docs/fonts/ibm-plex/` from the repository, with its licence). Don't install `@ibm/plex-sans` or `@ibm/plex-serif` as dependencies: their `postinstall` script sends IBM telemetry.
