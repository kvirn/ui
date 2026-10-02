---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

Add the shared Announcer (ADR-0040, Plan 0014 Phase 2 prerequisite).

- `@kvirn-ui/core`: `createAnnouncer(env)`, a pure store of `{ polite, assertive }` text with `announce(message, { politeness?, key?, throttleMilliseconds? })` and `clear()`. The region is emptied first and filled 100 ms later, so a repeated message is read again, and removed after 5 seconds. A `key` (such as a field's id) throttles that key for `throttleMilliseconds` (default 3000, `0` turns it off), so holding a key doesn't flood a screen reader. `announce` returns `true` when accepted and `false` when dropped. Types: `Announcer`, `AnnouncerActions`, `AnnouncerEnv`, `AnnouncerPoliteness`, `AnnouncerState`, `AnnounceOptions`, and `defaultThrottleMilliseconds`.
- `@kvirn-ui/react`: `useAnnouncer()` returns `{ announce }`. The outermost `KvirnProvider` now renders two empty, visually hidden live regions after its children (`role="status"` and `role="alert"`, inline styles, no CSS), once per document. Outside a provider `announce` does nothing and a development warning says why. The strings come from the caller's i18n. Types: `UseAnnouncerResult`, `AnnounceOptions` and `AnnouncerPoliteness`.
