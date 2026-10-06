---
'@kvirn-ui/i18n': minor
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `SkipLink` and `VisuallyHidden`, with `useSkipLink` and `useVisuallyHidden`. `SkipLink` is a bypass link that is hidden until it has focus and moves focus to the main content. `@kvirn-ui/theme` styles `kv-skip-link` and `kv-visually-hidden`. `@kvirn-ui/i18n` adds the `skipLink.label` message in all six locales (`se` is an English placeholder). The `KvirnMessages` type gains the `skipLink` namespace, so a full custom catalog must add it.
