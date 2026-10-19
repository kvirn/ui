# Accessibility contract: Announcer

- **APG pattern:** none. The Announcer is not a widget. It is the pair of live regions that WCAG 4.1.3 Status Messages (AA) needs ([ARIA `status` role](https://www.w3.org/TR/wai-aria-1.2/#status), [`alert` role](https://www.w3.org/TR/wai-aria-1.2/#alert), [technique ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) and [ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)).
- **Deviations:** none.
- **Native elements used:** `<output>` for the polite region (its implicit role is `status`) and a `<div role="alert">` for the assertive one, which has no native element.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `announcer.test.tsx` next to this file, and `announcer.test.ts` in `packages/core/src/announcer/`. `announcer.stories.tsx` in `apps/storybook/src/components/announcer/`. The component has no keys.

The Announcer is how a component tells a screen reader that something changed without moving focus (4.1.3 Status Messages, AA). The outermost `KvirnProvider` renders two live regions once, empty, after its children. Components and apps call `useAnnouncer().announce(message, options)`. The regions are the only part, and `Announcer` is not exported: rendering a second pair would make a screen reader read every message twice.

The Announcer has no strings of its own. The caller passes text already resolved from i18n, in the provider's language.

## Roles, states, properties

| Part             | Element / role          | ARIA                                              | Notes                                                                                                                                                                                     |
| ---------------- | ----------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Polite region    | `<output>` → `status`   | `aria-live="polite"`, `aria-atomic="true"`        | Default for `announce`. Waits for the screen reader to finish speaking. Empty on the server and on first render                                                                           |
| Assertive region | `<div>` → `alert`       | `aria-live="assertive"`, `aria-atomic="true"`     | `announce(message, { politeness: 'assertive' })`. Interrupts the screen reader: only for what the user must act on right now. Empty on the server and on first render                     |
| both regions     | visually hidden         | no `aria-hidden`, no `hidden`, no `display: none` | Hidden with inline styles only (a clipped box one pixel across), so they stay in the accessibility tree and need no stylesheet. No `tabindex`, no focusable content, no text of their own |
| the text         | a text node in a region | none                                              | Added after the region was already in the page, and emptied first, so that a repeated message is read again. Removed after 5 seconds, so stale text isn't found in browse mode            |

## Keyboard

This component has no focusable parts and handles no keys.

The regions are never focusable and never change the Tab order. These rows prove Tab passes over them.

| Key       | Context                | Action                                                                                                | Test                                                 |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Tab       | A page with a provider | The regions are skipped: no `tabindex`, no focusable content, nothing to land on                      | `announcer.test.tsx › the regions are not focusable` |
| Shift+Tab | A page with a provider | The regions are skipped in reverse order as well                                                      | `announcer.test.tsx › the regions are not focusable` |
| –         | Calling `announce`     | The regions never take focus. A message is information, never a change of context (3.2.1 On Focus, A) | `announcer.test.tsx › announcing never moves focus`  |

## Focus management

- Initial focus: not moved. The Announcer never moves focus.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: the regions are tiny clipped boxes, out of the layout flow, and are never focused.

## Announcements

The Announcer carries other components' announcements. It says nothing by itself.

| Event                               | Message key (i18n) | Politeness                                                                                                                                         |
| ----------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `announce(message)`                 | the caller's key   | polite (default)                                                                                                                                   |
| `announce(message, { politeness })` | the caller's key   | `'assertive'` for something to act on now                                                                                                          |
| `announce(message, { key })`        | the caller's key   | polite or assertive, as above. The same `key` is dropped for 3000 ms (or `throttleMilliseconds`), so holding a key doesn't flood the screen reader |

Rules for callers (4.1.3 Status Messages, AA):

- Announce a change the user can't otherwise perceive without moving focus: a count, a result, a rejected character, a finished upload. Don't announce what focus already reads (a focused control's own label or state).
- Call `announce` from an event handler or an effect, never during render.
- Keep messages short, in the provider's language, with the number or name in them. Use `assertive` rarely.
- Use a `key` for anything that can repeat quickly (typing, holding a key): the field's id, plus a suffix if one field has several messages.
- A second message for the same politeness inside 100 ms replaces the first. Batch related changes into one sentence.

## Consumer responsibilities

- **Mount `KvirnProvider`.** Without a provider `useAnnouncer()` warns in development and `announce` does nothing, so screen reader users get nothing. The provider is where the regions are.
- **One provider at the top.** Nested providers share the outermost one's regions.
- **Language.** The regions have no `lang`: they inherit the page's. Set `<html lang>` to the root provider's locale (3.1.1 Language of Page, A). A message in another language than the page's is read with the page's voice (3.1.2 Language of Parts, AA), a known issue.
- **`<output>` is form-associated.** The polite region sits after the provider's children. If you mount the provider inside a `<form>`, it joins that form's `elements` (it is never submitted). Mount the provider at the top of the app.
- **Your own modal silences the provider's regions.** They sit in the app tree after the provider's children, so a modal that makes the rest of the page inert or hidden (a native `<dialog>` opened with `showModal()`, `inert` on the app root, `aria-modal` in Safari) also silences them, and nothing announced from inside it is heard (4.1.3 Status Messages, AA). KvirnUI's Dialog and AlertDialog host their own regions while open, so a component inside them announces as usual. In a modal you built yourself, put a live region of your own inside it.
- **Don't add your own `role="status"` or `aria-live` for the same message.** It would be read twice.
- **Don't render the Announcer's text yourself.** Showing the same information visibly is right, but it is a separate element.

## Visual / modes

- Focus indicator: none. The regions are never focused.
- Target size: not applicable.
- forced-colors behaviour: nothing is visible, so nothing changes. The text is real page text and does not depend on colour.
- reduced-motion behaviour: no motion.
- Reflow and text spacing: a clipped box one pixel across that never affects layout, scrolling or reflow (1.4.10 Reflow, AA; 1.4.12 Text Spacing, AA).

## WCAG SCs covered

- 4.1.3 Status Messages (AA): a polite and an assertive live region that exist before their text: tests check that a polite message is added to a region that was already in the page and that an assertive message goes to the alert region.
- 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A): `status` and `alert` are the roles for these messages. The regions are never `aria-hidden`.
- 3.2.1 On Focus (A): the regions can't take focus (a test checks that the regions are not focusable).
- 2.1.1 Keyboard (A), 2.4.3 Focus Order (A): the regions add no stop to the Tab order (a test checks that the regions are not focusable).
- 3.1.2 Language of Parts (AA): text is passed through unchanged, in the provider's language (a test checks that text is passed through unchanged in Swedish and Finnish). A message in another language than the page's is not marked up, which is a known issue.
- Axe finds no violations with both regions empty and with both holding a message.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                      |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | announcer.stories.tsx, every story, 4 themes                                                                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `announcer.test.tsx` (axe and role, name and state): `a polite and an assertive region exist, empty, as soon as the provider mounts` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 3 rows, each names a test in `announcer.test.tsx`                                                                                    |
| Focus order and management                                                 | pass        | n/a         | pass    | `announcer.test.tsx`: `the regions are not focusable`; `announcing never moves focus`                                                |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | n/a         | n/a         | n/a     | nothing is visible: the regions are clipped one-pixel boxes                                                                          |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                      |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                      |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                      |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                      |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                      |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                      |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                      |

### What to check

- A polite message sent while the screen reader is speaking is read after the current speech.
- An assertive message interrupts the speech.
- The same message sent twice with a pause between is read twice.
- A keyed message sent repeatedly is read once in the window.
- Nothing is read twice, in each screen reader and browser pair.

## Known issues

- **Language of a message.** The regions inherit the page's `lang`. A message from a nested `KvirnProvider` with another locale is read with the page's voice.
- **Latest wins.** Two messages for the same politeness inside 100 ms: the second replaces the first. There is no queue.
- **Without a provider nothing is announced.** Components that announce (a masked TextInput, for example) do nothing for screen reader users when no provider is mounted.
- **Nested providers with their own `env`** (an iframe) share the outermost provider's regions, which live in the outer document.
