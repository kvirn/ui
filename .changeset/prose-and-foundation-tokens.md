---
'@kvirn-ui/theme': minor
---

Add prose styles and foundation tokens to `theme.css` (Plan 0006, ADR-0018).

- `data-kv-prose` on a wrapper styles articles from a CMS or Markdown: headings, paragraphs, links, lists, quotes, code, keys, tables, figures, definition lists and more, in every theme, with logical properties only. `data-kv-prose="large"` is the 18px size for long resident-facing text.
- `data-kv-lead` marks the lead paragraph. `data-kv-not-prose` leaves a subtree alone, apart from its block margin. Components (`[data-kv]`) and the contents of `data-kv-nav` and `data-kv-button-group` are never styled by prose. Every prose rule has zero specificity, so any other CSS wins.
- `data-kv-scroll-region` is a labelled, focusable horizontal scroll region with a focus ring, for wide tables, in or outside prose.
- New tokens: `--kv-prose-measure`, `--kv-prose-font-size`, `--kv-prose-line-height`, `--kv-prose-feature-settings`, `--kv-prose-lead-font-size`, `--kv-prose-lead-line-height`, `--kv-prose-space`, `--kv-prose-space-item`, `--kv-prose-space-block`, `--kv-prose-space-section`, `--kv-prose-list-indent` and `--kv-prose-code-size`; the `lead` type role (`--kv-font-lead-*`, 20px); and the elevation shadows `--kv-shadow-popup` and `--kv-shadow-dialog` (`none` in the dark themes).
- `contrastRequirements` and `checkThemeCss()` now also check `text-muted`, `link` and `link-hover` on the status panels, `link-hover` on `primary-subtle`, and `border-control` and `focus-ring` on the status panels.
