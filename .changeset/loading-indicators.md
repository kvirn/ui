---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

New `Progress.Indicator` (`ProgressIndicatorProps`): a decorative `kv-spinner` for an unknown wait, rendered only without a `value`. A busy `Button` now renders a decorative `kv-spinner` as its first child, `Toast` has a `busy` option (a spinner in the icon slot, shown without an auto-dismiss timer), the ready-made Alert roots take an `icon` prop, and `FileUpload.Progress` renders a decorative `kv-progress-track` instead of a value-less `<progress>` when the size is unknown.

`@kvirn-ui/theme`: new tokens `--kv-color-accent` (all four themes) and `--kv-duration-loop`; new classes `kv-spinner` (`--sm`, `--lg`) and `kv-progress-track` (`--thin`); `kv-progress-bar` is now a primary-to-accent gradient with a sheen; the Table busy state sweeps its head. Every indicator loops for as long as the wait lasts and shows a still rest shape under `prefers-reduced-motion: reduce`. The library ships no stop control: to meet WCAG 2.2.2 (Pause, Stop, Hide) the app offers its own, see the docs page "Theming", section "Moving indicators and WCAG 2.2.2".
