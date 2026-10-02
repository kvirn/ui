# ADR-0040: A shared Announcer: core state, live regions in KvirnProvider, `useAnnouncer()`

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Magnus Vike
- **Tags:** a11y | api | architecture

## Context

WCAG 4.1.3 Status Messages needs changes that don't move focus (a result count, a saved form, a rejected character) to reach screen reader users. Several accepted or proposed ADRs already say "announce through the shared Announcer": ADR-0032 (mask rejections, item 6), ADR-0035 (table sort and counts), ADR-0037 (combobox results), ADR-0038 (uploads). `docs/architecture.md` lists "the announcer" as a core utility and the accessibility skill requires "a polite live region that already exists in the DOM, never rendered together with its content, strings from i18n". The roadmap lists it as planned. Plan 0014 Phase 2 needs it first (maintainer decision), so this ADR records a minimal version.

Facts that shape it:

- Screen readers announce a change to a live region, not a region that appears with its text. The region must be in the page first.
- Setting the same text again is not a change, so a repeated message is not read again unless the region is emptied first, and the browser and React get a turn in between.
- Holding a key in a masked input rejects the same character dozens of times a second. Unthrottled, that floods a screen reader.
- `core` is pure: no React, and the DOM only through an injected `Env` (ADR-0003). Headless packages ship no CSS (hard rule 5). Every string is in the catalogs (ADR-0007).

## Decision drivers

- 4.1.3 with real screen readers, in NVDA, JAWS, VoiceOver and TalkBack.
- SSR-safe: the regions must be in the server HTML, empty.
- A tiny public API that the later components (masks, Table, Combobox, FileUpload, Toast) can all call.
- No new dependency. No CSS. No strings of its own.

## Options considered

### Option A: each component renders its own live region

- ✅ No shared state
- ❌ A region that mounts with its component is added together with its text, which screen readers skip
- ❌ Many regions, duplicated throttling and clear-then-set logic, and double announcements are easy

### Option B: one pair of regions, rendered by the outermost `KvirnProvider`, driven by a core store (chosen)

- ✅ The regions are in the page from the first render, empty, so the first message is announced
- ✅ One place for clear-then-set, throttling and the visually hidden styles
- ✅ The logic is a pure store, tested in Node with a fake clock
- ❌ Announcements need a provider (mitigated: a development warning and a no-op)

### Option C: portal the regions into `document.body` from a hook, outside the provider

- ✅ Works without a provider
- ❌ The regions are not in the server HTML, so they appear after hydration, together with early messages
- ❌ Needs the DOM at hook time, and the first caller creates a node that nothing owns

## Decision

We will use Option B.

1. **Core.** `createAnnouncer(env)` in `packages/core/src/announcer/` returns a `ComponentStore` of `{ polite, assertive }` text with the actions `announce(message, options)` and `clear()`. `env` is the injected `Env`, narrowed to `window.setTimeout`, `window.clearTimeout` and `window.performance.now` (type `AnnouncerEnv`), so a Node test passes a fake clock. It is `undefined` while server rendering, and then `announce` does nothing and returns `false`. No DOM or timer is touched at import or at creation, only on `announce`.
2. **`announce(message, { politeness?, key?, throttleMilliseconds? })` returns a boolean.** `true` when accepted, `false` when dropped (blank message, throttled, or no env). The result lets a story or a test show a drop, and costs nothing.
   - `politeness` is `'polite'` (default, the `status` region) or `'assertive'` (the `alert` region).
   - **Clear, then set.** The region is emptied at once, and the message is set 100 ms later, in its own render. Both changes are visible to the browser, so a repeated message is read again. A message waiting for its 100 ms is replaced by a newer one for the same region (latest wins, no queue).
   - **Removal.** The text is removed 5 seconds after it was set, so stale text isn't found in browse mode.
   - **Throttle per key.** With a `key` (a field's id), a message is dropped while that key is inside its window: `throttleMilliseconds`, default 3000. `0` turns it off, and an invalid number falls back to the default. Without a `key`, nothing is throttled. The window is leading-edge and is not extended by dropped messages, so holding a key still gets a message through every 3 seconds. The key is shared by both politeness levels. A consumer with several messages per field adds a suffix to the key. The clock is `performance.now()`. Expired keys are pruned on the next keyed call.
   - Blank messages are ignored.
3. **React.** `KvirnProvider` creates the announcer (outermost provider only, memoised on `env`, cleared on unmount) and renders the internal `Announcer`: `<output aria-live="polite" aria-atomic="true">` (native, implicit role `status`; the repository's `jsx-a11y/prefer-tag-over-role` rule asks for it) and `<div role="alert" aria-live="assertive" aria-atomic="true">` (no native element), empty, after its children. Nested providers reuse the outermost's announcer and render nothing extra. `aria-live` is set explicitly next to the implicit or explicit role because that is the best-supported pairing; the regions are never `aria-hidden`, `hidden` or `display: none`.
4. **Visually hidden with inline styles** (a 1px clipped box, `position: absolute`), so the packages ship no CSS and the regions stay in the accessibility tree.
5. **`useAnnouncer()` returns `{ announce }`,** stable per provider. Outside a provider it logs one development warning (`warnOnce`, silent in production) and returns an `announce` that does nothing and returns `false`.
6. **`Announcer` is not exported.** A second pair of regions would make every message read twice. The public surface is `useAnnouncer`, `UseAnnouncerResult`, and the core types `AnnounceOptions` and `AnnouncerPoliteness` re-exported from `@kvirn-ui/react`; core also exports `createAnnouncer` and `defaultThrottleMilliseconds`.
7. **No strings of its own.** Callers pass text resolved from i18n (ADR-0007), so no catalog key is added by this ADR. Components that announce add their own keys (for example `mask.characterNotAllowed`).
8. **`KvirnProvider` now renders two hidden elements,** where before it rendered none. Tests and the provider's contract that said "no `status`, `alert` or `aria-live`" now say the regions stay empty.

## Accessibility impact

- 4.1.3 Status Messages is met by regions that exist before their text. 3.2.1 holds: announcing never moves focus.
- The regions are `status` and `alert`, per ARIA and technique ARIA22 and ARIA19. They have no focusable content and no tabindex, so Tab order is unchanged (2.1.1, 2.4.3).
- Clear-then-set and the throttle are behaviour choices for screen readers and need the manual AT matrix. Result: `pending`.
- No APG deviation. There is no APG pattern for the live region itself.

## Consequences

- **Positive:** Plan 0014 Phase 2 and ADR-0035, 0037 and 0038 can announce. One tested implementation of repeats and floods. SSR-safe. No new dependency or CSS.
- **Negative / trade-offs:**
  - Without a `KvirnProvider`, announcements are silently dropped (after one dev warning). ADR-0003 says components work without a provider, so any component that announces loses that feedback in a provider-less app. Follow-up: decide whether such components should document the provider as required, or whether the provider-less case needs its own region.
  - Latest wins: two messages for the same politeness inside 100 ms lose the first. Callers batch. A queue is a follow-up if a real case needs it.
  - The regions have no `lang`, so a message in another language than the page's is read with the page's voice (3.1.2). Follow-up: a per-message `lang` option.
  - A nested provider with its own `env` (an iframe) shares the outermost provider's regions, which are in the outer document.
  - `<output>` is form-associated: a provider mounted inside a `<form>` makes the polite region one of its `elements`. It is never submitted. Mount the provider at the top of the app.
  - `KvirnProvider` adds two DOM nodes after its children, which changes its "renders no element" statement.
- **Follow-ups:** the AT matrix; a queue; per-message `lang`; the provider-less case; Toast (roadmap M3) may use the same regions for non-modal messages or its own.

## Validation

- Core unit tests: clear-then-set, 100 ms delay, replace, removal after 5 s, throttle window and boundary, per key, `throttleMilliseconds` 0 and invalid, no key, `clear`, no env.
- Component tests: regions in the page and in server HTML, empty, not hidden, not focusable; polite and assertive; repeat is cleared and set again (MutationObserver); sv and fi text passed through; stable `announce`; nested provider, one pair; no-provider warning and no-op; axe with the regions empty and filled.
- Manual AT: a polite message after the current speech, an assertive interruption, a repeated message read twice, nothing read twice (NVDA + Firefox, VoiceOver + Safari, VoiceOver + iOS, TalkBack). Review when Plan 0014 Phase 2 lands.

## References

- WCAG 2.2 [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), techniques [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) and [ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)
- ADR-0003, ADR-0007, ADR-0032 item 6, ADR-0035, ADR-0037, ADR-0038; Plan 0014
