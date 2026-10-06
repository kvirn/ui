# Accessibility contract: Alert

- **APG pattern:** none for the visible block. APG's [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) is a live region, which the [Announcer](../announcer/announcer.a11y.md) already provides, so the Alert never renders one.
- **Deviations:** none. No role on the box, `announce` goes through the Announcer, and there is a plain Root and four ready-made status roots. The optional Close is a native button (maintainer decision 2026-10-05, Plan 0045): dismissing never changes how the alert is announced.
- **Native elements used:** `<div>` for the roots, Body and Actions; `<h2>` for the Title (`render` changes it to another heading or to `<p>`); `<svg>` for the decorative icon; `<span>` for the status word; `<button type="button">` for the optional Close.
- **Status:** in progress (Plan 0020). Gates run and green on the Alert files, accessibility-reviewer follow-up pending. Manual AT is `pending`.
- **Tests:** `alert.test.tsx` next to this file. `alert.stories.tsx` in `apps/storybook/src/components/alert/`. Design spec: `docs/design/alert.md`.

An Alert is a status message in the content: something people need to know now, or the result of what they just did. It shows its status with an icon, a word and a colour, never with colour alone (1.4.1). It doesn't announce itself unless the consumer asks (`announce`), and it never takes focus on its own. It can have one optional close button (`Alert.Close`). The alert owns no open or closed state: the consumer removes it in the button's `onClick` and moves focus on.

There are five roots. `Alert.Root` is plain: `kv-alert` only, no status class, no icon and no status word. `Alert.Info`, `.Success`, `.Warning` and `.Danger` (also exported as `AlertInfo` and so on) are ready-made: each renders its status class, its icon and the status word from one internal table, so the colour, the icon and the word cannot disagree. Status is a class, not a prop: you choose it by choosing the component, and there is no prop that changes a ready-made root's status.

## Roles, states, properties

| Part                                    | Element / role                        | ARIA                                                                   | Notes                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alert.Root                              | `<div>` → `generic`                   | none                                                                   | `class="kv-alert"`. No status class, no icon, no status word. Takes `announce`. Also exported as `AlertRoot`                                                                                                                                                                                                                                      |
| Alert.Info, .Success, .Warning, .Danger | `<div>` → `generic`                   | none                                                                   | `class="kv-alert kv-alert--<status>"`, the status icon first (`info`, `success`, `warning`, `error`), and the status word for the Title. Take `announce` and `messages`. Also exported as `AlertInfo`, `AlertSuccess`, `AlertWarning` and `AlertDanger`                                                                                           |
| Icon (ready-made roots only)            | `<svg class="kv-icon kv-alert-icon">` | `aria-hidden="true"`                                                   | Decorative: the status is in text. The consumer's own `<Icon>` on a plain Root is decorative the same way                                                                                                                                                                                                                                         |
| Alert.Title                             | `<h2>` by default → `heading` level 2 | none                                                                   | `class="kv-alert-title"`. Required. `render` sets the level (`<h3>`) or a `<p>` for a one-sentence alert. Inside a ready-made root it starts with `<span class="kv-alert-status">` (the status word from i18n), then a normal space, then the children. Inside a plain Root it adds nothing                                                       |
| Status word                             | `<span class="kv-alert-status">`      | none                                                                   | Text, never `aria-hidden`. Visually hidden by the theme (1px, `clip-path`, never `display: none`), so screen readers read it and it is in the heading list. Without the theme it shows, which is correct unstyled                                                                                                                                 |
| Alert.Body                              | `<div>` → `generic`                   | none                                                                   | `class="kv-alert-body"`. Optional                                                                                                                                                                                                                                                                                                                 |
| Alert.Actions                           | `<div>` → `generic`                   | none                                                                   | `class="kv-alert-actions"`. Optional. Links and Buttons inside keep their own roles and names                                                                                                                                                                                                                                                     |
| Alert.Close                             | `<button type="button">` → `button`   | `aria-label` from `alert.close` (`Stäng meddelandet`)                  | `class="kv-alert-close"`. Optional, at most one, last in the root. Its content is the decorative `<Icon name="close" />` (`aria-hidden`), so the name is the `aria-label`. `children` replace the icon with visible text, which then names the button and drops the `aria-label`. `onClick` is gated by `disabled`. Also exported as `AlertClose` |
| every root                              | never                                 | no `role`, `aria-live`, `aria-atomic`, `aria-label`, `aria-labelledby` | Not a landmark and not a live region by default. No `tabindex` either. A development warning fires when a root is given `role="alert"`, `role="status"` or `aria-live`                                                                                                                                                                            |
| every part                              | `render` (element, function)          | the rendered element's own                                             | One element per part. The part's class joins a `className` prop and a render element's own class, never replaced. In the `render` function form, keep `className` to keep the theme's look, or set your own to drop it: the icon and the status word stay                                                                                         |
| every part                              | attributes                            | passed through                                                         | `id`, `lang`, `data-*`, `aria-*` and every other attribute reach the element unchanged                                                                                                                                                                                                                                                            |

`useAlert({ variant?, announce?, messages? })` gives the same props for your own elements: `rootProps`, `titleProps`, `bodyProps`, `actionsProps`, `closeProps` (`className`, `type`, and the resolved `aria-label`), and with `variant` also `iconProps` and `statusProps`, all from the same table as the components.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

An Alert is never a Tab stop of its own. Its only key handling is the optional close button's, a native `<button>`: Enter and Space press it, with no key code of ours. Links and buttons in its Body and Actions keep their own keys (see `button.a11y.md` and `link.a11y.md`). The close button comes last in the DOM, so it is the last Tab stop of the alert.

| Key       | Context                                         | Action                                                                                       | Test                                                                                                       |
| --------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tab       | Before an alert with a link in its Actions      | Moves to the link. The alert itself is skipped                                               | `alert.test.tsx › keyboard › Tab skips the alert and reaches its link`                                     |
| Tab       | On the last link or button in the alert         | Moves to the close button, after the actions                                                 | `alert.test.tsx › keyboard › Tab reaches the close button after the actions`                               |
| Shift+Tab | On the close button                             | Moves back to the alert's last link or button                                                | `alert.test.tsx › keyboard › Shift+Tab from the close button goes back to the link`                        |
| Shift+Tab | On the control after the alert                  | Moves back to the alert's last button or link                                                | `alert.test.tsx › keyboard › Shift+Tab reaches the alert’s action`                                         |
| Enter     | On the close button                             | Presses it: the consumer's `onClick` runs, removes the alert and moves focus to a set target | `alert.test.tsx › keyboard › Enter on the close button dismisses the alert and moves focus to the heading` |
| Space     | On the close button                             | Presses it, like Enter                                                                       | `alert.test.tsx › keyboard › Space on the close button dismisses the alert and moves focus to the heading` |
| Enter     | On a button inside the alert, such as a retry   | Activates it. Focus stays on the button                                                      | `alert.test.tsx › keyboard › Enter on a button inside the alert keeps focus on it`                         |
| Tab       | On an alert focused by script (`tabIndex={-1}`) | Moves to the first link or button inside it                                                  | `alert.test.tsx › keyboard › Tab from a focused alert goes to its first action`                            |
| –         | Every root                                      | No `tabindex` is rendered by default                                                         | `alert.test.tsx › the alert box stays without a role, a live region, a tabindex or a name of its own`      |
| –         | A disabled close button                         | Skipped by Tab, and click runs no handler                                                    | `alert.test.tsx › Alert.Close › disabled is native: no handler on click, skipped by Tab`                   |

Escape, arrow keys and Home / End are not handled. Children handle their own keys.

## Focus management

- Initial focus: not moved. An Alert never moves focus, never traps it and is not a Tab stop.
- Trap: no.
- Focus target: the consumer may make a root a focus target with `tabIndex={-1}` (an arrival message, the later error summary block). It then shows the focus ring on `:focus-visible`, Tab from it goes to the first link or button inside, and it never gets `tabIndex={0}`. Moving focus to an alert and setting `announce` on it would read it twice: use one of them.
- Inserting an alert never moves focus away from the control the user pressed (3.2.2). Removing one that holds focus is the consumer's bug: move focus first (see Restore to).
- Restore to: not applicable. **After dismissing, the consumer moves focus (2.4.3).** The close button is removed with the alert, and a removed element that had focus sends focus to the page. In the same `onClick`, move focus to a sensible place first: the heading of the part of the page the alert belonged to (`tabIndex={-1}`), the control that caused the alert, or a control that brings the message back. Never leave it on a removed element. Alert cannot do this for you, because it doesn't know what the page is. Tests: `alert.test.tsx › keyboard › Enter on the close button dismisses the alert and moves focus to the heading`.
- Never obscured by: the default theme never sets `overflow` or `clip-path` on an alert, so a link's or button's focus ring inside is never clipped (2.4.11, 2.4.13). With a sticky header, the page sets `scroll-padding` so a focused alert isn't hidden.

## Announcements

The visible alert is never a live region. When an alert must be heard without focus, a root with `announce="polite"` or `announce="assertive"` calls the shared Announcer once, when it mounts (4.1.3). The announced text is the alert's own visible text: the Title (which starts with the status word on a ready-made root), then the Body, with block boundaries as spaces. Actions and the close button aren't announced: they're controls the user reaches with Tab, and the close button's name is never part of the announced text.

| Event                                                               | Message key (i18n)                                                                                                                                                      | Politeness                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| A root with `announce` mounts                                       | none: the visible Title and Body text, already translated. The status word is `alert.infoPrefix`, `successPrefix`, `warningPrefix` or `dangerPrefix` (ready-made roots) | the `announce` value, `polite` or `assertive` |
| A root without `announce` mounts, re-renders, or is present at load | none                                                                                                                                                                    | nothing is announced                          |
| The close button is pressed and the consumer removes the alert      | none: removing content is not a status message, and focus moves to the target the consumer chose (`alert.close` only names the button)                                  | nothing is announced                          |

Rules:

- **Present at load: no `announce`, no role, no focus.** It is content, read in reading order and found by heading navigation. A live region announces changes, not what's there at load.
- **Inserted after an action, focus stays where it is:** `announce="polite"`, near the control that caused it. Polite waits for the screen reader to finish its own feedback on the button.
- **Urgent, not caused by the current action, and the user must act now:** `Alert.Danger announce="assertive"`. Rare. Never for Info or Success (a development warning fires).
- **Arrival after a page load or route change:** move focus to the root once (`tabIndex={-1}`) and don't set `announce`.
- **Errors on submit:** the error summary moves focus and doesn't set `announce`. Field errors are read when each field gets focus.
- **Its text changes while shown:** not supported by `announce`, which announces on mount, once. To announce again, call `useAnnouncer()` yourself. Remounting it with a new React `key` also announces again, but **only if nothing inside it holds focus**: if the action that causes the change is a button inside the alert (a "Try again" that fails again), a remount destroys the focused button and focus falls to the page (2.4.3). Keep the instance and use `useAnnouncer()` instead, or move focus to a stable target first.
- Without a `KvirnProvider`, announcements are dropped after one development warning: `announce` needs a provider. Inside a modal dialog the Announcer's regions are silenced (a follow-up for modal dialogs), so an alert in a dialog isn't heard until that is fixed.
- An alert that is server-rendered with `announce` is announced after hydration. Set `announce` only from the state of the action that just happened.

## Message keys

`alert.infoPrefix`, `alert.successPrefix`, `alert.warningPrefix` and `alert.dangerPrefix` (the status words), and `alert.close` (the close button's name). Each can be overridden per provider and per instance (`messages` on a root for a word or the close name, on `Alert.Close` for its own name).

## Consumer responsibilities

- **Language of the status word.** The word follows the provider's locale, not the alert's own `lang`. When an alert's content is in another language, set `messages` on that alert (for example `messages={{ warningPrefix: 'Warning:' }}`), so the word and the text agree (3.1.2).
- **A Title.** Every alert has one: it holds the status word and names the message. A development warning fires without one.
- **The heading level** is yours (1.3.1, 2.4.6): one level below the heading of the part of the page it is in, so usually `h2` directly under the page's `h1`, `h3` inside a section with an `h2`. Never skip levels. A one-sentence alert renders the Title as `<p>` with `render={<p />}`.
- **Write the Title as the outcome** in the user's words ("Vi kunde inte skicka din ansökan"), never only the status word. The Body says what to do and by when. One alert per region at a time. Never on a timer (2.2.1, 2.2.3): a transient message is a [Toast](../toast/toast.a11y.md), and a warning or danger message never toasts.
- **Pick the status by what happened,** not by the colour you want. Choose by component. Don't pass a status class of another status to a ready-made root, and don't put one of our status classes on the plain Root (development warnings).
- **The plain Root is yours to complete:** a status word first in the Title (in all your locales, in a `kv-alert-status` span), an icon with a distinct shape, both agreeing with your colour (1.3.1, 1.4.1).
- **The heading list and the landmark option.** An alert isn't a landmark. For one site-wide alert only (a service outage), render it as a named region: `render={<section aria-labelledby={titleId} />}`, with the Title's `id`. Never for messages about a part of the page.
- **Actions:** at most two, verbs, Links for navigation and Buttons for actions. Don't put a destructive button in an alert.
- **Dismissing is optional** (`Alert.Close`, Plan 0045). Offer it only on a message the user can safely be done with: a tip, an info, a saved confirmation. Don't offer it on an error or a warning the user still has to act on: the problem doesn't go away when the message does. The alert owns no state and writes no storage, so whether it comes back on the next page (persistence) is yours to decide.
- **On press:** remove the alert and move focus to a sensible place in the same handler (Focus management). Never on a timer (2.2.1).
- **The name** (`alert.close`, "Stäng meddelandet") follows the provider's locale. When the alert's content is in another language, set `messages={{ close: … }}` on the root or the button, like the status word (3.1.2). A visible label of your own goes in the `children`.
- **Replacement icons** (`defineIcons`) for `info`, `success`, `warning` or `error` must keep a distinct shape from the other three.
- **Language.** `lang` on any text in another language (3.1.2). The status word follows the provider's locale.

## Visual / modes

Headless: Alert ships no CSS. With `@kvirn-ui/theme/theme.css` (design spec `docs/design/alert.md`):

- Focus indicator: the root has none of its own unless the consumer made it focusable (`tabIndex={-1}`): the 2px `focus-ring` with a 2px offset, outside the box. The close button has the same ring on `:focus-visible`. Children keep their own rings, never clipped.
- Target size: the close button uses the control-size token (44px, 32px in `kv-compact`), always at least 24 by 24 CSS px (2.5.8). It is centred on the title's first line and reaches into the alert's padding, so the title keeps its height.. Buttons and links in Actions keep their own sizes.
- Contrast: the close button's cross is `text` and its focus ring `focus-ring`, on the four `-subtle` backgrounds. Text, link, muted text, focus-ring, button edges and the status's own bar and icon (3:1) are held to their minimums on the four `-subtle` backgrounds by `theme:check` (1.4.3, 1.4.11). The lowest pairs are 3.13:1 and 3.32:1 in dark on `primary-subtle`; a rebrand of `--kv-primary-*` can break them first.
- forced-colors behaviour: the background becomes `Canvas`, text `CanvasText`, links `LinkText`, and all four edges are drawn in `CanvasText` with the 4px bar kept. The close button's icon is drawn in `ButtonText` and its ring in `Highlight`. All four statuses then share one colour, so the status is carried by the icon's shape (square, circle, triangle, octagon), the status word in the accessibility tree and the title's words.
- reduced-motion behaviour: no motion at all. It appears and disappears instantly.
- Reflow and text spacing: no fixed sizes, no `overflow`, `min-inline-size: 0`, hyphenation then `overflow-wrap: break-word`; the icon stays on the title's first line. No horizontal scrolling at 320 CSS px with the Finnish fixture (`reflow-320`, 1.4.10). Text spacing grows the height and clips nothing (1.4.12).
- RTL: logical properties only. The bar and icon sit on the inline start, and the close button on the inline end. Status icons never mirror, and neither does the cross.
- Print: the 4px bar (a border) and the icon print, so the status stays visible on paper. The close button is hidden in print.
- Without `theme.css`: no colour, no bar, no hidden word. The icon and "Varning: …" show as plain text, which is a correct unstyled alert.

## WCAG SCs covered

- 1.1.1 Non-text Content: the status icon and the close icon are decorative, the status and the button's name are text.
- 1.3.1 Info and Relationships: the Title is a heading (or a paragraph by choice), the status word is text in it. 1.3.2 Meaningful Sequence, 2.4.3 Focus Order: DOM order is the reading and focus order. The close button is last in it (after the Actions), while the theme shows it at the inline end of the first line: it is reached last, which keeps the Title and Body together for a screen reader (2.4.3 allows a visual position that differs when the order is still meaningful).
- 1.4.1 Use of Color: icon shape, the status word and the title's words, never colour alone.
- 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast: `theme:check` pairs on the four `-subtle` backgrounds.
- 2.2.1 Timing Adjustable, 2.2.3 No Timing: no timers, nothing disappears.
- 2.4.6 Headings and Labels: the Title describes the topic.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance: a focused root's and a focused close button's ring, never clipped.
- 2.1.1 Keyboard, 2.4.3 Focus Order: the close button is a native button, last in DOM order, and the consumer moves focus on dismissing.
- 2.5.8 Target Size (Minimum): the close button is at least 24 by 24 CSS px.
- 3.2.2 On Input: inserting an alert never moves focus.
- 3.3.1 Error Identification, 3.3.3 Error Suggestion: a danger alert names what happened and what to do (consumer's content).
- 4.1.2 Name, Role, Value: the box has no role or name of its own to get wrong. The close button is a native button with a name from i18n (`alert.close`).
- 4.1.3 Status Messages: `announce` through the Announcer. Known risk below.

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

- **4.1.3 and the box having no role.** The criterion asks that a status message be programmatically determinable through role or properties. Here the message reaches assistive technology through the Announcer's `status` or `alert` region with the same text, and the visible box has no role. The name Alert is the component: `role="alert"` stays an implementation detail of the Announcer's assertive region, never of the box (Plan 0042). We believe this meets the intent. The manual AT matrix must confirm it, in particular whether a polite announcement after Send is heard in time and not lost to the screen reader's own feedback on the button.
- **Hidden status word (decision D4).** The word is visually hidden, as `ErrorMessage`'s "Fel:". The usability test (design spec §8, task 5) checks that people with colour-vision deficiency and in Contrast Themes tell the statuses apart by icon shape. Result: pending.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
