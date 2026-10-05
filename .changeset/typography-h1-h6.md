---
'@kvirn-ui/theme': minor
'@kvirn-ui/react': minor
---

Every heading level, `h1` to `h6`, has its own type role (Plan 0045).

- `@kvirn-ui/theme`: new roles `heading-4`, `heading-5` and `heading-6`, each with the five tokens (`--kv-font-heading-4-size` and so on: size, weight, line height, letter spacing, feature settings). All three are 1rem, because essential content is never below 16px, and are told apart by weight and tracking: `heading-4` is 600 with line height 1.4, `heading-5` is 500 with 1.5, and `heading-6` is 500 with 0.03em tracking. They never step down on a small screen. Prose `h4`, `h5` and `h6` use them instead of one shared style, and keep them in every prose size (`--small`, `--large`, `--xl`, `--2xl`), so in `kv-prose--small` they are no longer 14px. The modifier classes `kv-heading--heading-4|5|6` are new, and a bare `kv-heading` now looks like `heading-4`. In the large sizes they are smaller than the body text: stop at `h3` in text a resident reads.
- `@kvirn-ui/react`: `HeadingSize` adds `'heading-4' | 'heading-5' | 'heading-6'`, and `Heading` and `useHeading` default levels 4 to 6 to their own size, so `<Heading level={5}>` renders `kv-heading kv-heading--heading-5`. `HeadingState.size` and `UseHeadingResult.size` are always set (they were `undefined` for levels 4 to 6).
