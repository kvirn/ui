---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

Status patterns (Plan 0074): `Progress`, `busy` on Button, and the `kv-empty-state` classes.

- React: `Progress.Root`, `.Label` and `.Bar` (named exports `ProgressRoot`, `ProgressLabel`, `ProgressBar`) and `useProgress`, with the types `ProgressRootProps`, `ProgressLabelProps`, `ProgressBarProps`, `ProgressState`, `ProgressRootPartProps`, `ProgressLabelPartProps`, `ProgressBarPartProps`, `UseProgressOptions` and `UseProgressResult`. A wait is rendered only after `delayMilliseconds` (1000), announced once through the Announcer, gets a slow sentence after `slowAfterMilliseconds` (10000) that is announced once, and draws a native `<progress>` only when `value` is known. No spinner, no indeterminate bar, and the percent is never announced. `announce={false}` opts out. `Button` and `useButton` take `busy`: `aria-disabled="true"` and `data-busy`, never native `disabled`, so focus stays and every press is blocked. `useButton` also returns `isBusy`, and `ButtonState` gains `isBusy`.
- Core: `createProgressTimer(env, options)`, a pure timing store (`waiting`, `shown`, `slow`).
- i18n: the new keys `progress.loading`, `progress.slow` and `progress.valueText` in `KvirnMessages` and all six catalogs. A custom catalog must add them. `se` is an English placeholder that needs translator review.
- Theme: `kv-progress`, `kv-progress-label`, `kv-progress-percent`, `kv-progress-slow`, `kv-progress-bar`, `kv-empty-state`, `kv-empty-state-title` and `kv-empty-state-body`, and the `progress` cursor on `kv-button[data-busy]`. No new token.
