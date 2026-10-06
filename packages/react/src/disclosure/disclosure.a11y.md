# Accessibility contract: Disclosure (Root, Trigger, Panel)

- **APG pattern:** [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): a button that shows and hides one panel of content.
- **Deviations:** none from the APG keyboard practice. Escape is not handled: APG does not require it for a disclosure, and a panel is not a layer. Decisions (Plan 0058): find-in-page is opt-in (`hiddenUntilFound`), and a panel that is shown from a breakpoint without JavaScript is not supported (see Consumer responsibilities).
- **Native elements used:** `<button type="button">` (Trigger), `<div>` (Panel). Nothing for Root: it renders no element.
- **Status:** alpha candidate (Plan 0058). Manual AT is `pending`.
- **Tests:** `disclosure.test.tsx` next to this file. `disclosure.stories.tsx` in `apps/storybook/src/components/disclosure/`.

A Disclosure is a button that shows and hides a panel of content. It holds the open state, wires the two together, and never moves focus. Accordion is a list of disclosures with headings (`accordion.a11y.md`).

## Roles, states, properties

| Part               | Element / role                             | ARIA / state                                                                                                 | Notes                                                                                                                                                       |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disclosure.Root    | none: it renders no element                | none                                                                                                         | Owns the open state: `open` / `defaultOpen` / `onOpenChange`, `disabled`, `focusableWhenDisabled`, `hiddenUntilFound`                                       |
| Disclosure.Trigger | `<button type="button">`                   | `aria-expanded="true" \| "false"`, `aria-controls` (the panel's id). `data-open` while open, `data-disabled` | Class `kv-disclosure-trigger`. A decorative `Icon` follows the content: `chevron-down` closed, `chevron-up` open, class `kv-disclosure-icon`, `aria-hidden` |
| Disclosure.Panel   | `<div>`, always rendered                   | `hidden` while closed (`hidden="until-found"` with `hiddenUntilFound`). `data-open` while open               | Class `kv-disclosure-panel`. No role: the panel is not a landmark, and the trigger names nothing for it                                                     |
| `useDisclosure`    | the same attributes, for your own elements | `triggerProps`, `panelProps`, `isOpen`, `isDisabled`, `isFocusVisible`, `triggerId`, `panelId`               | Options as the Root. `panelProps.ref` must reach the panel for find-in-page                                                                                 |

Rules, tested in `disclosure.test.tsx`:

- **Wiring.** `aria-controls` is the panel's id on every render (the panel is always in the DOM), `aria-expanded` follows the state, and the trigger is a real `<button type="button">`. Ids come from `useId`, so the server and the client agree.
- **Closed means hidden.** A closed panel is `hidden`, so its content is out of the Tab order and the accessibility tree. An open panel's content follows the trigger in the Tab order.
- **Controlled and uncontrolled.** `open` is the state when it is given, and `onOpenChange` only reports. `defaultOpen` starts it open.
- **Disabled.** `disabled` is the native attribute and takes the trigger out of the Tab order. With `focusableWhenDisabled` it is `aria-disabled="true"` and stays a Tab stop. Neither opens, and no handler runs.
- **Find-in-page.** With `hiddenUntilFound` the closed panel is `hidden="until-found"`. When the browser reveals it (a find-in-page match or a `#fragment` link), the hook opens the state and calls `onOpenChange(true, { reason: 'find-in-page', event })`. Browsers without support treat the value as `hidden`. A controlled consumer that ignores `onOpenChange(true)` keeps the panel closed: the hook puts `hidden="until-found"` back after the browser removed it, so the panel never shows under `aria-expanded="false"`.
- **The state is never colour alone.** The chevron flips (down to up) and `aria-expanded` changes. The chevron is `aria-hidden`: the name is the consumer's text.
- **`render` on every part,** with class and handlers merged and refs merged. An element's own `onClick` on the trigger is gated like the trigger's.
- **Dev warnings:** a Trigger or Panel outside a Root, and a Trigger whose `render` is not a `<button>`.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context                      | Action                                                                                | Test                                                                               |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Tab           | before the trigger           | Moves focus to the trigger. The trigger is one stop                                   | `disclosure.test.tsx › Tab focuses the trigger, and is one stop`                   |
| Shift+Tab     | on the trigger               | Moves focus to the previous focusable element                                         | `disclosure.test.tsx › Shift+Tab leaves the trigger backwards`                     |
| Enter / Space | on the trigger               | Opens the panel, or closes it when it is open. Focus stays on the trigger             | `disclosure.test.tsx › Enter and Space on the trigger toggle the panel`            |
| Tab           | on the trigger, panel open   | Moves focus into the panel, to its first focusable element, which follows the trigger | `disclosure.test.tsx › Tab goes from the trigger into an open panel`               |
| Tab           | on the trigger, panel closed | Skips the panel: its content is hidden and not focusable                              | `disclosure.test.tsx › Tab skips the content of a closed panel`                    |
| Enter / Space | on a disabled trigger        | Nothing: the panel does not change. A natively disabled trigger is not a Tab stop     | `disclosure.test.tsx › a disabled trigger does not open, and leaves the Tab order` |

The disclosure handles no other key. Escape is the page's own (APG does not require it), and the arrow keys, Home and End are the content's. The component prevents none of them.

## Focus management

- Initial focus: **not moved.** Opening or closing never moves focus: a keyboard user stays on the trigger, and Tab goes into the panel, which is next in the DOM (render `Disclosure.Panel` right after `Disclosure.Trigger`).
- Trap: no.
- Restore to: not needed. Focus is on the trigger when it closes. If the consumer closes the panel from inside it (a "Close" button in the content), they return focus to the trigger themselves.
- Never obscured by: the panel is in flow, so a sticky header is the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Disclosure has no strings of its own and announces nothing: the change of `aria-expanded` on the focused trigger is what a screen reader reports ("expanded", "collapsed"). Like Popover, the name is the consumer's text, in the page's language, and must not change with the state.

## Consumer responsibilities

- **Name the trigger with visible text that says what the panel holds** ("Öppettider"), the same open and closed (4.1.2, 2.5.3). Never "Visa mer" for one state and "Visa mindre" for the other: `aria-expanded` carries the state.
- **Render the Panel right after the Trigger,** in the same parent, so the Tab order matches the visual order (2.4.3).
- **Keep what the page needs to work out of a closed panel,** and do not hide an error message or the only way to complete a task in one (3.3.1).
- **A panel shown from a breakpoint, expanded without JavaScript, is not a Disclosure feature.** The trigger's `aria-expanded="false"` would lie while the panel is visible. A navigation menu that is always shown on a wide screen and a button on a narrow one is `NavigationMenu`'s job (roadmap, planned), or the consumer's own CSS: show the panel with an author rule on `.kv-disclosure-panel[hidden]` (`display: block`, and `content-visibility: visible` for `until-found`) and hide the trigger from that width with `display: none`, which also removes it from the accessibility tree. Nothing in the library supports or tests it.
- **Server rendering:** a closed panel is `hidden` in the markup, and without JavaScript the trigger does nothing. Content that must be readable without JavaScript is not in a Disclosure, or is `defaultOpen`.
- Everything in `button.a11y.md` applies to the trigger.

## Visual / modes

- Focus indicator: the trigger shows the 2px ring with the 2px offset (2.4.7, 2.4.13).
- Target size: the trigger is at least 44px high in comfortable density, 32px compact (2.5.8).
- Colour: the trigger's text is `text` on the page (4.5:1). The open state is shown by the chevron and `aria-expanded`, never by colour (1.4.1). No new colour pair.
- forced-colors behaviour: the chevron is `currentColor`, so it follows `ButtonText`/`CanvasText`. The state is the shape of the chevron.
- reduced-motion behaviour: nothing animates. The panel appears and disappears at once.
- Reflow: at 320px the trigger's text wraps (`overflow-wrap: anywhere`) and the chevron stays at the inline end (1.4.10).
- RTL: the chevron is at the left, the text starts at the right. A chevron pointing up or down needs no mirroring.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: native `<button>`, `aria-expanded`, `aria-controls`.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the chevron changes shape, and it is `currentColor`.
- 1.4.10 Reflow, 1.4.12 Text Spacing: wrapping text, no fixed heights.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.1.4 Character Key Shortcuts: native button keys, Tab leaves, no shortcuts.
- 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.5.8 Target Size (Minimum).
- 3.2.1 On Focus, 3.2.2 On Input: opening needs a press, and nothing moves focus.

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

Also pending, by hand: whether `hidden="until-found"` content is found and revealed by find-in-page in Chrome, Edge and (when supported) Safari and Firefox, and what screen readers announce when it opens.

## Known issues

- **`hidden="until-found"` support differs.** Chromium reveals the panel on a match. A browser without support treats the panel as `hidden`, so find-in-page misses it, and nothing else breaks. It is opt-in for that reason.
- **No Escape.** APG does not require it for a disclosure. Closing from inside a long panel is the trigger or the consumer's own button.
- **The chevron is part of `Disclosure.Trigger`.** A different icon or no icon means `useDisclosure` on your own button, or the `render` function form.
