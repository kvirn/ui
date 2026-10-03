# Accessibility contract: Notification

- **APG pattern:** none for the visible block. APG's [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) is a live region, which the [Announcer](../announcer/announcer.a11y.md) already provides (ADR-0040), so the Notification never renders one.
- **Deviations:** none. ADR-0047 records the decisions (no role on the box, `announce` through the Announcer, a plain Root and four ready-made status roots).
- **Native elements used:** `<div>` for the roots, Body and Actions; `<h2>` for the Title (`render` changes it to another heading or to `<p>`); `<svg>` for the decorative icon; `<span>` for the status word.
- **Status:** in progress (Plan 0020). Gates run and green on the Notification files, accessibility-reviewer follow-up pending. Manual AT is `pending`.
- **Tests:** `notification.test.tsx` next to this file. `notification.stories.tsx` and `notification.e2e.ts` in `apps/storybook/src/components/notification/`. Design spec: `docs/design/notification.md`.

A Notification is a status message in the content: something people need to know now, or the result of what they just did. It shows its status with an icon, a word and a colour, never with colour alone (1.4.1). It doesn't announce itself unless the consumer asks (`announce`), and it never takes focus on its own.

There are five roots. `Notification.Root` is plain: `kv-notification` only, no status class, no icon and no status word. `Notification.Info`, `.Success`, `.Warning` and `.Danger` (also exported as `NotificationInfo` and so on) are ready-made: each renders its status class, its icon and the status word from one internal table, so the colour, the icon and the word cannot disagree. Status is a class, not a prop (ADR-0013): you choose it by choosing the component, and there is no prop that changes a ready-made root's status.

## Roles, states, properties

| Part                                           | Element / role                               | ARIA                                                                   | Notes                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notification.Root                              | `<div>` → `generic`                          | none                                                                   | `class="kv-notification"`. No status class, no icon, no status word. Takes `announce`. Also exported as `NotificationRoot`                                                                                                                                                                                       |
| Notification.Info, .Success, .Warning, .Danger | `<div>` → `generic`                          | none                                                                   | `class="kv-notification kv-notification--<status>"`, the status icon first (`info`, `success`, `warning`, `error`), and the status word for the Title. Take `announce` and `messages`. Also exported as `NotificationInfo`, `NotificationSuccess`, `NotificationWarning` and `NotificationDanger`                |
| Icon (ready-made roots only)                   | `<svg class="kv-icon kv-notification-icon">` | `aria-hidden="true"`                                                   | Decorative: the status is in text. The consumer's own `<Icon>` on a plain Root is decorative the same way                                                                                                                                                                                                        |
| Notification.Title                             | `<h2>` by default → `heading` level 2        | none                                                                   | `class="kv-notification-title"`. Required. `render` sets the level (`<h3>`) or a `<p>` for a one-sentence notification. Inside a ready-made root it starts with `<span class="kv-notification-status">` (the status word from i18n), then a normal space, then the children. Inside a plain Root it adds nothing |
| Status word                                    | `<span class="kv-notification-status">`      | none                                                                   | Text, never `aria-hidden`. Visually hidden by the theme (1px, `clip-path`, never `display: none`), so screen readers read it and it is in the heading list. Without the theme it shows, which is correct unstyled                                                                                                |
| Notification.Body                              | `<div>` → `generic`                          | none                                                                   | `class="kv-notification-body"`. Optional                                                                                                                                                                                                                                                                         |
| Notification.Actions                           | `<div>` → `generic`                          | none                                                                   | `class="kv-notification-actions"`. Optional. Links and Buttons inside keep their own roles and names                                                                                                                                                                                                             |
| every root                                     | never                                        | no `role`, `aria-live`, `aria-atomic`, `aria-label`, `aria-labelledby` | Not a landmark and not a live region by default. No `tabindex` either. A development warning fires when a root is given `role="alert"`, `role="status"` or `aria-live`                                                                                                                                           |
| every part                                     | `render` (element, function)                 | the rendered element's own                                             | One element per part. The part's class joins a `className` prop and a render element's own class, never replaced. In the `render` function form, keep `className` to keep the theme's look, or set your own to drop it: the icon and the status word stay                                                        |
| every part                                     | attributes                                   | passed through                                                         | `id`, `lang`, `data-*`, `aria-*` and every other attribute reach the element unchanged                                                                                                                                                                                                                           |

`useNotification({ variant?, announce?, messages? })` gives the same props for your own elements: `rootProps`, `titleProps`, `bodyProps`, `actionsProps`, and with `variant` also `iconProps` and `statusProps`, all from the same table as the components.

## Keyboard

This component has no focusable parts and handles no keys.

A Notification is never a Tab stop of its own. Links and buttons in its Body and Actions keep their own keys (see `button.a11y.md` and `link.a11y.md`). Dismissing isn't supported in this version.

| Key       | Context                                               | Action                                                | Test                                                                             |
| --------- | ----------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tab       | Before a notification with a link in its Actions      | Moves to the link. The notification itself is skipped | `notification.e2e.ts › Tab skips the notification and reaches its link`          |
| Shift+Tab | On the control after the notification                 | Moves back to the notification's last button or link  | `notification.e2e.ts › Shift+Tab reaches the notification's action`              |
| Enter     | On a button inside the notification, such as a retry  | Activates it. Focus stays on the button               | `notification.e2e.ts › Enter on Försök igen keeps focus on Försök igen`          |
| Tab       | On a notification focused by script (`tabIndex={-1}`) | Moves to the first link or button inside it           | `notification.e2e.ts › Tab from a focused notification goes to its first action` |
| –         | Every root                                            | No `tabindex` is rendered by default                  | `notification.test.tsx › rendering › adds no role, live region or tabindex`      |

Enter, Space, Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. A Notification never moves focus, never traps it and is not a Tab stop.
- Trap: no.
- Focus target: the consumer may make a root a focus target with `tabIndex={-1}` (an arrival message, the later error summary block). It then shows the focus ring on `:focus-visible`, Tab from it goes to the first link or button inside, and it never gets `tabIndex={0}`. Moving focus to a notification and setting `announce` on it would read it twice: use one of them. Test: `notification.e2e.ts › a focused root shows its focus ring`.
- Inserting a notification never moves focus away from the control the user pressed (3.2.2). Removing one that holds focus is the consumer's bug: move focus first.
- Restore to: not applicable.
- Never obscured by: the default theme never sets `overflow` or `clip-path` on a notification, so a link's or button's focus ring inside is never clipped (2.4.11, 2.4.13). With a sticky header, the page sets `scroll-padding` so a focused notification isn't hidden. Test: `notification.e2e.ts › the focus ring of an action is not clipped`.

## Announcements

The visible notification is never a live region. When a notification must be heard without focus, a root with `announce="polite"` or `announce="assertive"` calls the shared Announcer once, when it mounts (4.1.3, ADR-0040). The announced text is the notification's own visible text: the Title (which starts with the status word on a ready-made root), then the Body, with block boundaries as spaces. Actions aren't announced: they're controls the user reaches with Tab.

| Event                                                               | Message key (i18n)                                                                                                                                                             | Politeness                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| A root with `announce` mounts                                       | none: the visible Title and Body text, already translated. The status word is `notification.infoPrefix`, `successPrefix`, `warningPrefix` or `dangerPrefix` (ready-made roots) | the `announce` value, `polite` or `assertive` |
| A root without `announce` mounts, re-renders, or is present at load | none                                                                                                                                                                           | nothing is announced                          |

Rules:

- **Present at load: no `announce`, no role, no focus.** It is content, read in reading order and found by heading navigation. A live region announces changes, not what's there at load.
- **Inserted after an action, focus stays where it is:** `announce="polite"`, near the control that caused it. Polite waits for the screen reader to finish its own feedback on the button.
- **Urgent, not caused by the current action, and the user must act now:** `Notification.Danger announce="assertive"`. Rare. Never for Info or Success (a development warning fires).
- **Arrival after a page load or route change:** move focus to the root once (`tabIndex={-1}`) and don't set `announce`.
- **Errors on submit:** the error summary moves focus and doesn't set `announce`. Field errors are read when each field gets focus (ADR-0029).
- **Its text changes while shown:** not supported by `announce`, which announces on mount, once. To announce again, call `useAnnouncer()` yourself. Remounting it with a new React `key` also announces again, but **only if nothing inside it holds focus**: if the action that causes the change is a button inside the notification (a "Try again" that fails again), a remount destroys the focused button and focus falls to the page (2.4.3). Keep the instance and use `useAnnouncer()` instead, or move focus to a stable target first.
- Without a `KvirnProvider`, announcements are dropped after one development warning (ADR-0040): `announce` needs a provider. Inside a modal dialog the Announcer's regions are silenced (ADR-0040's modal follow-up), so a notification in a dialog isn't heard until that is fixed.
- A notification that is server-rendered with `announce` is announced after hydration. Set `announce` only from the state of the action that just happened.

## Consumer responsibilities

- **Language of the status word.** The word follows the provider's locale, not the notification's own `lang`. When a notification's content is in another language, set `messages` on that notification (for example `messages={{ warningPrefix: 'Warning:' }}`), so the word and the text agree (3.1.2).
- **A Title.** Every notification has one: it holds the status word and names the message. A development warning fires without one.
- **The heading level** is yours (1.3.1, 2.4.6): one level below the heading of the part of the page it is in, so usually `h2` directly under the page's `h1`, `h3` inside a section with an `h2`. Never skip levels. A one-sentence notification renders the Title as `<p>` with `render={<p />}`.
- **Write the Title as the outcome** in the user's words ("Vi kunde inte skicka din ansökan"), never only the status word. The Body says what to do and by when. One notification per region at a time. Never on a timer (2.2.1, 2.2.3).
- **Pick the status by what happened,** not by the colour you want. Choose by component. Don't pass a status class of another status to a ready-made root, and don't put one of our status classes on the plain Root (development warnings).
- **The plain Root is yours to complete:** a status word first in the Title (in all your locales, in a `kv-notification-status` span), an icon with a distinct shape, both agreeing with your colour (1.3.1, 1.4.1).
- **The heading list and the landmark option.** A notification isn't a landmark. For one site-wide notification only (a service outage), render it as a named region: `render={<section aria-labelledby={titleId} />}`, with the Title's `id`. Never for messages about a part of the page.
- **Actions:** at most two, verbs, Links for navigation and Buttons for actions. Don't put a destructive button in a notification.
- **Not dismissible** in this version. Don't build a close button that hides an error or a warning.
- **Replacement icons** (`defineIcons`) for `info`, `success`, `warning` or `error` must keep a distinct shape from the other three.
- **Language.** `lang` on any text in another language (3.1.2). The status word follows the provider's locale. The `se` words are machine-drafted and need a native speaker to verify them.

## Visual / modes

Headless: Notification ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/notification.md`):

- Focus indicator: none of its own unless the consumer made the root focusable (`tabIndex={-1}`): the 2px `focus-ring` with a 2px offset, outside the box. Children keep their own rings, never clipped.
- Target size: not applicable. Buttons and links in Actions keep their own sizes (2.5.8).
- Contrast: text, link, muted text, focus-ring, button edges and the status's own bar and icon (3:1) are held to their minimums on the four `-subtle` backgrounds by `theme:check` (1.4.3, 1.4.11). The lowest pairs are 3.13:1 and 3.32:1 in dark on `primary-subtle`; a rebrand of `--kv-primary-*` can break them first.
- forced-colors behaviour: the background becomes `Canvas`, text `CanvasText`, links `LinkText`, and all four edges are drawn in `CanvasText` with the 4px bar kept. All four statuses then share one colour, so the status is carried by the icon's shape (square, circle, triangle, octagon), the status word in the accessibility tree and the title's words. Test: `notification.e2e.ts › the notification border is visible in forced colours`.
- reduced-motion behaviour: no motion at all. It appears and disappears instantly.
- Reflow and text spacing: no fixed sizes, no `overflow`, `min-inline-size: 0`, hyphenation then `overflow-wrap: break-word`; the icon stays on the title's first line. No horizontal scrolling at 320 CSS px with the Finnish fixture (`reflow-320`, 1.4.10). Text spacing grows the height and clips nothing (1.4.12).
- RTL: logical properties only. The bar and icon sit on the inline start. Status icons never mirror.
- Print: the 4px bar (a border) and the icon print, so the status stays visible on paper.
- Without `theme.css`: no colour, no bar, no hidden word. The icon and "Varning: …" show as plain text, which is a correct unstyled notification.

## WCAG SCs covered

- 1.1.1 Non-text Content: the status icon is decorative, the status is in text.
- 1.3.1 Info and Relationships: the Title is a heading (or a paragraph by choice), the status word is text in it. 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order equals reading and focus order.
- 1.4.1 Use of Color: icon shape, the status word and the title's words, never colour alone.
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs on the four `-subtle` backgrounds.
- 1.4.10 Reflow, 1.4.12 Text Spacing: e2e at 320px with the Finnish fixture and the text-spacing overrides.
- 2.2.1 Timing Adjustable, 2.2.3 No Timing: no timers, nothing disappears.
- 2.4.6 Headings and Labels: the Title describes the topic.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance: a focused root's ring, never clipped.
- 3.2.2 On Input: inserting a notification never moves focus.
- 3.3.1 Error Identification, 3.3.3 Error Suggestion: a danger notification names what happened and what to do (consumer's content).
- 4.1.2 Name, Role, Value: no role or name of its own to get wrong.
- 4.1.3 Status Messages: `announce` through the Announcer. Known risk below.

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

## Known issues

- **4.1.3 and the box having no role.** The criterion asks that a status message be programmatically determinable through role or properties. Here the message reaches assistive technology through the Announcer's `status` or `alert` region with the same text, and the visible box has no role. We believe this meets the intent. The manual AT matrix must confirm it, in particular whether a polite announcement after Send is heard in time and not lost to the screen reader's own feedback on the button.
- **`se` status words are machine-drafted.** The four Northern Sámi words need a native speaker to verify them (`packages/i18n/src/locales/se.ts`).
- **Hidden status word (decision D4).** The word is visually hidden, as `ErrorMessage`'s "Fel:". The usability test (design spec §8, task 5) checks that people with colour-vision deficiency and in Contrast Themes tell the statuses apart by icon shape. Result: pending.
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
