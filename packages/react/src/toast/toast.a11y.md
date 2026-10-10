# Accessibility contract: Toast (`useToast`, and the region `KvirnProvider` renders)

- **APG pattern:** none for a toast. The announcement is APG's [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) in the Announcer's polite region, which already exists; the region of toasts is never a live region. The items are the [Alert](../alert/alert.a11y.md)'s parts.
- **Deviations:** none from APG. Two defaults pending the maintainer (`docs/design/toast.md`; `docs/roadmap.md` "Open maintainer decisions"): toasts are **persistent by default** (`autoDismiss: false`), and a toast is only info or success, never a warning or an error.
- **Native elements used:** `<section>` (the region, a `popover="manual"` in the top layer), `<ul role="list">` and `<li>`, the Alert's `<div>` root, `<p>` (the Title), `<span>` (the status word), `<button type="button">` (the action and Close).
- **Status:** alpha candidate. Manual AT is `pending`.
- **Tests:** `toast.test.tsx` next to this file, `@kvirn-ui/core` `toast-queue.test.ts` (the timing rules). `toast.stories.tsx` in `apps/storybook/src/components/toast/`. Design spec: `docs/design/toast.md`.

A toast is a short status message after something worked: "Utkastet sparades". It looks like an Alert, is heard through the Announcer, never moves focus on its own and stays until dismissed by default. With `autoDismiss` a toast goes after the app's chosen time and pauses on hover, focus, a hidden tab and a blurred window. **Nothing needed to finish a task lives only in a toast**: the result is also shown in place, and an action (Undo) has a persistent alternative on the page. `Alert` with `announce` stays the default for a message in the content, and for every error.

One shared list serves the whole page: every `KvirnProvider` uses the same controller, and exactly one region exists. The first provider that mounted is the host: its `toast={{ limit, autoDismiss }}`, locale and messages apply and it renders the region after its children. A later provider's `toast` is ignored with a development warning (`toast-multiple-providers`). When the host unmounts the next provider takes over: the toasts stay, nothing is announced again, and focus and the pointer pause carry over. Make the host the page-level provider: an `inert` or `aria-hidden` container around the first provider would make the page-wide region inert too. A nested provider takes no part (its `toast` is ignored with `nested-toast`). `useToast()` returns `{ show, dismiss, dismissAll, focus }`.

## Roles, states, properties

| Part   | Element / role                                                   | ARIA                                                                                    | Notes                                                                                                                                                                                                                                                                                                                                |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Region | `<section class="kv-toast-region" popover="manual">` → `region`  | `aria-label` from `toast.regionLabel` (`Meddelanden`), `lang` and `dir` of the provider | Rendered only while at least one toast shows, so the landmark exists only then. `showPopover()` while it exists, feature-detected (the theme falls back to `position: fixed`). **No `role`, no `aria-live`, no `aria-atomic`**                                                                                                       |
| List   | `<ul role="list" class="kv-toast-list">` → `list`                | none                                                                                    | Oldest first: DOM order, visual order and Tab order agree                                                                                                                                                                                                                                                                            |
| Item   | `<li class="kv-toast-item">` → `listitem`                        | none                                                                                    | Wraps the toast                                                                                                                                                                                                                                                                                                                      |
| Toast  | `<div class="kv-alert kv-alert--<status> kv-toast">` → `generic` | none                                                                                    | `Alert.Info` or `Alert.Success`, so the colour, the icon and the status word agree. No `tabindex`, no role                                                                                                                                                                                                                           |
| Icon   | `<span class="kv-alert-icon kv-spinner">` (job)                  | `aria-hidden="true"`                                                                    | With `busy: true` the spinner replaces the status icon (Plan 0080). Decorative: the status word and the title carry the meaning. Loops until the result replaces it, still under reduced motion (2.2.2: see Consumer responsibilities); the same `id` with the result replaces it. Show a `busy` toast without an auto-dismiss timer |
| Title  | `<p class="kv-alert-title" tabindex="-1">`                       | none                                                                                    | The status word (`alert.infoPrefix`, `alert.successPrefix`) first, then `title`. `tabindex="-1"` makes it a target for script (`focus: true`, `toast.focus()`) and never a Tab stop                                                                                                                                                  |
| Body   | `<div class="kv-alert-body">`                                    | none                                                                                    | Only when `body` is given                                                                                                                                                                                                                                                                                                            |
| Action | `<div class="kv-alert-actions">` with a `<button>` (the Button)  | the button's own name (`action.label`)                                                  | At most one. A toast with an action never times out. Pressing it runs `onPress`, then dismisses the toast                                                                                                                                                                                                                            |
| Close  | `<button type="button" class="kv-alert-close">` → `button`       | `aria-label` from `alert.close` (`Stäng meddelandet`)                                   | Always present and last in the toast: the user can always dismiss                                                                                                                                                                                                                                                                    |

Rules, tested in `toast.test.tsx`:

- **Persistent by default.** With `autoDismiss: false` no toast has a timer. With `autoDismiss` a number of milliseconds, only an info or success toast **without an action** times out, after exactly that time. There is **no minimum floor**: a short value can remove a toast before it is read. This is a maintainer-approved trade-off against 2.2.1 (Timing Adjustable); the mitigations are below. `0`, a negative number or `NaN` acts as `false` and warns once in development. A toast with an action stays until dismissed, and a development warning says when a requested timer was dropped.
- **The timer pauses** while the pointer is over the region, while focus is inside it, while the tab is hidden and while the window is blurred. When it resumes at least 5 s remain. A toast the user focused is never removed under them.
- **Limit.** At most `limit` (default 10) toasts show, at any width. When full, the oldest toast that may time out is evicted for the new one, never a toast that cannot time out and never while the pointer or focus is on a toast. Otherwise the new toast is **ignored**, not queued: `show` returns `''` and a development warning (`toast-limit-reached`) says so; with `focus: true` the caller must place focus itself then. The region is capped in height and scrolls, and a new toast scrolls into view in the region only (never the page, never animated), unless the user is hovering or focused in it.
- **The timer ring is decorative.** A timed toast draws a ring around Close that drains over the time left (a `<span aria-hidden="true">` inside Close: no text, no role, no Tab stop; Close keeps its name `alert.close`). Nothing is announced about the time. Under `prefers-reduced-motion: reduce` it steps in quarters instead of moving. A toast with an action or without a timer has no ring.
- **The same `id` updates in place:** the text changes, the timer restarts, and it is announced once.
- **No toast while a modal is open.** A new toast is held while a `<dialog>` is shown modally (the live regions behind it are inert) and shown, then announced, when it closes or is removed. **Timers stop while a modal is open** (the `modal` pause reason: nobody can read or pause a toast behind it) and resume when it closes, with at least 5 s left, so nothing expires unread behind it. A held toast loses `focus: true` (the dialog returns focus to its trigger). A message raised inside a dialog uses that dialog's own Alert.
- **Outside a provider** `useToast()` returns functions that do nothing and warns once. A toast shown before the provider has mounted (server rendering, or in the first render) is dropped with a warning.
- **The region uses the host provider's locale and messages.** A toast shown from a provider in another language gets `lang` on its title text and its body (3.1.2), not on the list item: the status word and Close name follow the host's messages and stay in its language.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

There is no hotkey and no key that jumps to the region (an F6 or a shortcut is out of scope): Tab reaches it in DOM order after the page's content, and screen reader users also find the named `region` landmark while a toast shows. Showing a toast never moves focus. No toast is a Tab stop of its own, and no roving focus or trap exists.

| Key             | Context              | Action                                                                                                                                    | Test                                                                                                                                                                                                                                                 |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab             | before the region    | Enters the first toast: its action, then its Close, then the next toast's. While the region overflows the region itself is the first stop | `toast.test.tsx › keyboard › Tab from the page enters the first toast at its action, then its Close, then the next toast`, `toast.test.tsx › keyboard › Tab from the page stops on the region first while it overflows, then enters the first toast` |
| Shift+Tab       | after the region     | Enters the last toast at its Close, and goes back in reverse order, to the region last while it overflows                                 | `toast.test.tsx › keyboard › Shift+Tab from after the region enters the last toast at its Close and goes back in reverse order`, `toast.test.tsx › keyboard › Shift+Tab from the first toast goes back to the region while it overflows`             |
| Tab / Shift+Tab | inside the region    | Plain DOM order. Nothing traps focus: Tab from the last Close leaves the region                                                           | `toast.test.tsx › keyboard › Tab and Shift+Tab inside the region follow DOM order and never trap`                                                                                                                                                    |
| Enter / Space   | on Close             | Dismisses the toast. Focus returns to the element that had it before it entered the toast                                                 | `toast.test.tsx › keyboard › Enter on Close dismisses the toast and returns focus to the element focused before`, `toast.test.tsx › keyboard › Space on Close dismisses the toast and returns focus to the element focused before`                   |
| Enter / Space   | on the action        | Runs the action, then dismisses the toast. Focus returns as for Close                                                                     | `toast.test.tsx › keyboard › Enter on the action runs onPress, then dismisses the toast`, `toast.test.tsx › keyboard › Space on the action runs onPress, then dismisses the toast`                                                                   |
| Escape          | focus inside a toast | Dismisses that toast only (a layer on the stack only while focus is inside). Focus returns as above                                       | `toast.test.tsx › keyboard › Escape with focus inside a toast dismisses that toast only`                                                                                                                                                             |
| Escape          | focus elsewhere      | Not handled: the toasts stay and the page's own Escape handling is untouched                                                              | `toast.test.tsx › keyboard › Escape with focus outside the region is not handled`                                                                                                                                                                    |

The toast handles no other key. Enter and Space on the buttons are native.

## Focus management

- Initial focus: **never moved** by showing a toast (3.2.2). Two ways to move it, both opt-in: `show({ focus: true })`, for a **user-initiated** action whose trigger is gone, focuses the toast's Title and skips the announcement (focus reads it); `toast.focus()` focuses the newest toast's Title, for a button of the consumer's own.
- Trap: no.
- Restore to, when a toast that holds focus is removed (Close, the action, Escape, `dismiss`, `dismissAll`): the element that had focus before focus entered the region, if it is still in the document and takes focus, else the Close of the next toast, else of the previous one, else nothing: the component never moves focus to `body` itself, so the browser puts it where it does (the page), and a development warning (`toast-return-focus-lost`) says the user lost their place. A press with the pointer returns focus without scrolling the page. A toast that does not hold focus is removed without moving anything.
- A toast the user focused is never removed by its timer: focus inside pauses it.
- Never obscured by (2.4.11): the region sits at the block-end edge, up to 10 toasts show, the region is capped in height and scrolls, and the theme sets `scroll-padding-block-end` while a region exists. When the focused element would sit under the region, the region moves to block-start (`data-placement="block-start"`). Close is always reachable. A region taller than the viewport (400% zoom, a long body) scrolls, and is a Tab stop (`tabindex="0"`, named by `toast.regionLabel`) only while it overflows (1.4.10, 2.1.1), and it keeps the tabindex while it has focus, so focus never falls to `body`: when its last toast goes, focus returns to the element focused before.

## Announcements

The visible toast is never a live region, and the toast never uses `Alert announce`: the provider announces once, after the commit that showed it.

| Event                                                                    | Message key (i18n)                                                                                                                                                                        | Politeness           |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| One or more toasts shown in one commit (also held ones, when they mount) | none: the visible text, already translated: status word (`alert.infoPrefix`, `alert.successPrefix`), Title, Body. Not the action. The texts of one commit are joined into **one** message | polite               |
| A toast shown again with the same `id`                                   | the same                                                                                                                                                                                  | polite, once         |
| `show({ focus: true })`                                                  | none: focus reads it                                                                                                                                                                      | nothing is announced |
| Dismissed, timed out, evicted                                            | none                                                                                                                                                                                      | nothing is announced |

Always polite: no toast needs to interrupt. The region has no `aria-live`, so nothing is read twice. The region's name is `toast.regionLabel`.

## Message keys

`toast.regionLabel` (the region's name), and the reused `alert.infoPrefix`, `alert.successPrefix` and `alert.close`. All can be overridden per provider (`messages`).

## Consumer responsibilities

- **Use a toast sparingly, as a second channel.** The result is also shown in place (a switch's state, the copy button's "Kopierat"). Never for an error to fix (`Field.ErrorMessage` and the error summary), the outcome of a submit (an `Alert` or a confirmation page), or a decision (`AlertDialog`). No warning or danger toast exists.
- **An action (Undo, Open) needs a persistent alternative** on the page: the toast can be closed, and a screen reader user may never reach it.
- **`autoDismiss` is an app switch.** Tie it to a user setting ("Låt meddelanden stå kvar tills jag stänger dem", and a longer time for "keep them longer"), and never time out content the user must act on. Screen reader browse mode does not trigger the pause rules, so a timed toast can vanish under a reader: that is why the default is persistent (2.2.1).
- **`focus: true` only for a user-initiated action** whose trigger no longer exists (3.2.2).
- **Write one sentence in the user's words,** past tense, naming the thing, at most 80 characters where possible, in the language of the provider (3.1.2). `title` is a string.
- **Toast sparingly:** persistent toasts fill the limit and later ones are ignored.
- **No toast while an error summary is up.** The component does not know about the page's `ErrorSummary`: do not show a toast on a failed submit, or call `dismissAll()` first, so nothing competes with the summary.
- **A sticky header or footer of the page** is the consumer's: keep `scroll-padding` for it.
- **WCAG 2.2.2 (Pause, Stop, Hide).** The indicators (spinner, bar sheen, busy Button, job Toast, FileUpload track, Table busy sweep) move for as long as the wait lasts, which can be more than 5 s. `prefers-reduced-motion: reduce` is honoured and shows a still rest shape, but to meet WCAG 2.2.2 the app must also offer its own visible control that stops moving content (the library ships none) and applies the stop CSS. [Moving indicators and WCAG 2.2.2](/foundation/theming#moving-indicators). The text, the percent and the 10 s slow sentence carry the wait. Show a `busy` toast without an auto-dismiss timer.

## Visual / modes

Headless: no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/toast.md`):

- Focus indicator: Close and the action keep their own rings; the Title has none (a `tabindex="-1"` target that is focused by script only shows the ring on `:focus-visible`).
- Target size: Close uses the control-size token (44px, 32px compact), at least 24 by 24 CSS px (2.5.8).
- Contrast: the Alert's pairs, held by `theme:check` (1.4.3, 1.4.11). The toast adds a `border-subtle` edge and a level 3 shadow in light.
- forced-colors behaviour: the Alert's: `Canvas`, `CanvasText`, an edge on all four sides, the status in the icon's shape and the status word.
- reduced-motion behaviour: a fade in only under `prefers-reduced-motion: no-preference`; removal is instant. The timer ring steps in quarters (75, 50, 25 % left) instead of moving.
- Timer ring (decorative): the toast's accent on `primary-subtle` or `success-subtle`, and on `surface-raised` when Close is hovered, held by `theme:check` (1.4.11). `ButtonText` in forced colours. A clock, so not mirrored in RTL.
- Reflow: full width below 40rem, no fixed sizes, a capped region that scrolls: no horizontal scrolling at 320 CSS px with Finnish text (1.4.10). Text spacing grows the height (1.4.12).
- RTL: logical properties: inline-end is the left. Hidden in print.
- Without `theme.css`: the region is a `popover` in the top layer with the browser's default popover box; the toasts are plain Alerts. Usable, unstyled.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: a named region, an ordered list, DOM order = visual order = Tab order.
- 1.4.1 Use of Color, 1.4.3 Contrast (Minimum), 1.4.10 Reflow, 1.4.11 Non-text Contrast: the Alert's icon shape and word, `theme:check` pairs, one column below 40rem, a capped region.
- 2.1.1 Keyboard: Close, the action and Escape; no trap (2.1.2).
- 2.2.1 Timing Adjustable, 2.2.2 Pause, Stop, Hide: persistent by default; timers only by an app switch the user can turn off, paused by hover, focus, hidden tab and blurred window, a visible timer ring, Close and Escape always. There is no minimum time: a maintainer-approved trade-off against 2.2.1.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: block-end edge, a limit, `scroll-padding`, block-start placement when the focus is under it.
- 2.5.8 Target Size (Minimum): Close and the action.
- 3.1.2 Language of Parts: the region carries the host provider's `lang` and `dir`; a toast from another language marks its title and body.
- 3.2.2 On Input: showing never moves focus; `focus: true` is for a user-initiated action only.
- 4.1.2 Name, Role, Value: the region's name, Close's name from i18n, no role on the box.
- 4.1.3 Status Messages: one polite announcement through the Announcer. Known risk below.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
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

## Known issues

- **A timed toast can vanish under a screen reader in browse mode,** which triggers neither hover nor focus. With no minimum floor a short `autoDismiss` makes this worse. The default is persistent for this reason, and the docs tell the app to tie `autoDismiss` to a user setting and keep the value long enough to read (2.2.1, trade-off approved by the maintainer). The manual AT matrix must confirm.
- **4.1.3 and the region having no live role.** The message reaches assistive technology through the Announcer's `status` region, not through the visible box (as for `Alert`). The manual matrix must confirm that the joined message is heard in time after the action that caused it.
- **Joined messages.** The provider joins the toasts of one commit into one message, because the Announcer replaces a second one inside 100 ms. Two `show` calls in separate commits within 100 ms: the second replaces the first one if it was not spoken yet.
- **The Announcer replaces a message of the same politeness spoken within 100 ms,** whoever sent it: a CopyButton's "Kopierat" and a toast shown in the same moment replace each other. The provider already joins the toasts of one commit; a toast and another component's `announce` in separate commits within 100 ms are the app's to avoid.
- **A handover while a modal is open** shows the new host's region in the top layer above the modal (rare: it needs the first provider to unmount while a dialog is open).
- **Server rendering:** the region is not rendered on the server, and a toast shown before mount is dropped (with a warning).
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium; the manual AT matrix is `pending`.
