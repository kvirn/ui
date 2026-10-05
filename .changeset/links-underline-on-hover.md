---
'@kvirn-ui/theme': minor
---

Underline links on hover only. At rest the link colour is told apart from body text by 3:1 contrast (1.4.1), which `theme:check` now measures in the light and dark themes. The dark `--kv-primary-400` is `#7784f2` (was `#828fff`) to reach it. The contrast themes can't reach 3:1 and 7:1 on the canvas together, so they keep the underline at rest through `--kv-link-decoration-line`. A rebrand's dark `--kv-color-link` must now be 3:1 against `--kv-color-text`; the documented teal `--kv-primary-400` is `#1e9ca4`.
