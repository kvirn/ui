---
'@kvirn-ui/theme': minor
---

Long words in prose and cards now break at hyphenation points, and the large type roles are smaller below 40rem.

- `kv-prose` and `kv-card` set `hyphens: auto` and `hyphenate-limit-chars: 10 4 4`, so words of 10 letters or more can split at the dictionary's points for the element's `lang`, with a visible hyphen. `overflow-wrap: break-word` stays as the fallback where the browser has no dictionary. Code (`code`, `kbd`, `samp`, `pre`) is never hyphenated. Set `lang` on `<html>` and on passages in another language. To turn it off, set `hyphens: manual` on `.kv-prose` or `.kv-card` in your CSS.
- Below 40rem: `--kv-font-display-size` 2rem (and `--kv-font-display-letter-spacing` 0em), `--kv-font-heading-1-size` 1.5rem, `--kv-font-heading-2-size` 1.25rem and `--kv-font-lead-size` 1.125rem. Body text and heading-3 don't change. A token you set on `:root` still applies at every width.
