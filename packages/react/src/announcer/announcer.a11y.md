# Accessibility contract: Announcer

- **APG pattern:** none. The Announcer is not a widget. It is the pair of live regions that WCAG 4.1.3 Status Messages needs ([ARIA `status` role](https://www.w3.org/TR/wai-aria-1.2/#status), [`alert` role](https://www.w3.org/TR/wai-aria-1.2/#alert), [technique ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) and [ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)).
- **Deviations:** none. ADR-0040 records the decisions.
- **Native elements used:** `<output>` for the polite region (its implicit role is `status`) and a `<div role="alert">` for the assertive one, which has no native element.
- **Status:** in progress (Plan 0014, Phase 2 prerequisite). Gates 1–5 run, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `announcer.test.tsx` next to this file, and `announcer.test.ts` in `packages/core/src/announcer/`. `announcer.stories.tsx` in `apps/storybook/src/components/announcer/`. There is no e2e spec: the component has no keys.

The Announcer is how a component tells a screen reader that something changed without moving focus (4.1.3). The outermost `KvirnProvider` renders two live regions once, empty, after its children. Components and apps call `useAnnouncer().announce(message, options)`. The regions are the only part, and `Announcer` is not exported: rendering a second pair would make a screen reader read every message twice.

The Announcer has no strings of its own. The caller passes text already resolved from i18n (ADR-0007), in the provider's language.

## Roles, states, properties

| Part             | Element / role          | ARIA                                              | Notes                                                                                                                                                                                       |
| ---------------- | ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Polite region    | `<output>` → `status`   | `aria-live="polite"`, `aria-atomic="true"`        | Default for `announce`. Waits for the screen reader to finish speaking. Empty on the server and on first render                                                                             |
| Assertive region | `<div>` → `alert`       | `aria-live="assertive"`, `aria-atomic="true"`     | `announce(message, { politeness: 'assertive' })`. Interrupts the screen reader: only for what the user must act on right now. Empty on the server and on first render                       |
| both regions     | visually hidden         | no `aria-hidden`, no `hidden`, no `display: none` | Hidden with inline styles only (a 1px clipped box), so they stay in the accessibility tree and the headless packages ship no CSS. No `tabindex`, no focusable content, no text of their own |
| the text         | a text node in a region | none                                              | Added after the region was already in the page, and emptied first, so that a repeated message is read again. Removed after 5 seconds, so stale text isn't found in browse mode              |

## Keyboard

This component has no focusable parts and handles no keys.

The regions are never focusable and never change the Tab order. These rows prove Tab passes over them.

| Key       | Context                | Action                                                                           | Test                                                                                                   |
| --------- | ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Tab       | A page with a provider | The regions are skipped: no `tabindex`, no focusable content, nothing to land on | `announcer.test.tsx › the regions take no space and are not focusable`                                 |
| Shift+Tab | A page with a provider | The regions are skipped in reverse order as well                                 | `announcer.test.tsx › the regions take no space and are not focusable`                                 |
| –         | Calling `announce`     | Focus doesn't move. A message is information, never a change of context (3.2.1)  | `announcer.test.tsx › a polite message is added to the polite region after it was already in the page` |

## Focus management

- Initial focus: not moved. The Announcer never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the regions are a clipped 1px box, out of the layout flow, and are never focused.

## Announcements

The Announcer carries other components' announcements. It says nothing by itself.

| Event                               | Message key (i18n) | Politeness                                                                                                                    |
| ----------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `announce(message)`                 | the caller's key   | polite (default)                                                                                                              |
| `announce(message, { politeness })` | the caller's key   | `'assertive'` for something to act on now                                                                                     |
| `announce(message, { key })`        | the caller's key   | as above. The same `key` is dropped for 3000 ms (or `throttleMilliseconds`), so holding a key doesn't flood the screen reader |

Rules for callers (4.1.3):

- Announce a change the user can't otherwise perceive without moving focus: a count, a result, a rejected character, a finished upload. Don't announce what focus already reads (a focused control's own label or state).
- Call `announce` from an event handler or an effect, never during render.
- Keep messages short, in the provider's language, with the number or name in them. Use `assertive` rarely.
- Use a `key` for anything that can repeat quickly (typing, holding a key): the field's id, plus a suffix if one field has several messages.
- A second message for the same politeness inside 100 ms replaces the first. Batch related changes into one sentence.

## Consumer responsibilities

- **Mount `KvirnProvider`.** Without a provider `useAnnouncer()` warns in development and `announce` does nothing, so screen reader users get nothing. The provider is where the regions are.
- **One provider at the top.** Nested providers share the outermost one's regions.
- **Language.** The regions have no `lang`: they inherit the page's. Set `<html lang>` to the root provider's locale (3.1.1). A message in another language than the page's is read with the page's voice (3.1.2), a known issue below.
- **`<output>` is form-associated.** The polite region sits after the provider's children. If you mount the provider inside a `<form>`, it joins that form's `elements` (it is never submitted). Mount the provider at the top of the app.
- **Don't add your own `role="status"` or `aria-live` for the same message.** It would be read twice.
- **Don't render the Announcer's text yourself.** Showing the same information visibly is right, but it is a separate element.

## Visual / modes

- Focus indicator: none. The regions are never focused.
- Target size: not applicable.
- forced-colors behaviour: nothing is visible, so nothing changes. The text is real DOM text, so Windows Narrator and NVDA read it in any contrast theme.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: a 1px clipped box that never affects layout, scrolling or reflow (1.4.10, 1.4.12).

## WCAG SCs covered

- 4.1.3 Status Messages: a polite and an assertive live region that exist before their text (`announcer.test.tsx › a polite message is added to the polite region after it was already in the page`, `› an assertive message goes to the alert region`).
- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: `status` and `alert` are the roles for these messages. The regions are never `aria-hidden`.
- 3.2.1 On Focus: announcing never moves focus.
- 2.1.1 Keyboard, 2.4.3 Focus Order: the regions add no stop to the Tab order (`announcer.test.tsx › the regions take no space and are not focusable`).
- 3.1.2 Language of Parts: strings come from i18n in the provider's language (`announcer.test.tsx › text is passed through unchanged, in the provider language (sv and fi)`). A message in another language is a known issue.
- Axe: no violations with both regions empty and with both holding a message (`announcer.test.tsx › axe`).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

What to check by ear: a polite message is read after the current speech, an assertive one interrupts it, the same message twice is read twice, a throttled message is read once, and nothing is read twice in any screen reader and browser pair (the `role` plus `aria-live` pairing is the usual cause).

## Known issues

- **Language of a message.** The regions inherit the page's `lang`. A message from a nested `KvirnProvider` with another locale is read with the page's voice. Fix later with a per-message `lang` (ADR-0040 follow-up).
- **Latest wins.** Two messages for the same politeness inside 100 ms: the second replaces the first. There is no queue yet.
- **Without a provider nothing is announced.** Components that announce (Input masks, Plan 0014) do nothing for screen reader users when no provider is mounted. ADR-0040 follow-up.
- **Nested providers with their own `env`** (an iframe) share the outermost provider's regions, which live in the outer document.
