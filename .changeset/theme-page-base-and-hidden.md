---
'@kvirn-ui/theme': minor
---

Paint the page: `theme.css` now sets `background-color` (`canvas`), `color` (`text`), the body font family and type role, and `overflow-wrap` on `body`, at zero specificity (`:where(body)`) in `@layer kv`, so any CSS of yours overrides it and the dark themes no longer sit on the browser's own canvas. Fix a hidden Card or Section showing: `:is(.kv-card, .kv-section)[hidden]` restates `display: none`.
