# Accessibility contract: Display settings

- **APG pattern:** [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) (inline) and a non-modal dialog opened by a button (floating); the choices are native radio groups.
- **Deviations:** none
- **Native elements used:** `<button>`, `<fieldset>` and `<legend>` through `RadioGroup`, `<input type="radio">`, `<label>`, `<div popover>` (floating).
- **Status:** alpha candidate (plan 0099). Manual AT is `pending`.
- **Tests:** `display-settings.test.tsx` next to this file, in Chromium with real key events and axe. Stories: `display-settings.stories.tsx` in `apps/storybook/src/components/display-settings/`.

## Roles, states, properties

| Part                       | Element / role                             | ARIA / state                                                                                 | Notes                                                                                    |
| -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DisplaySettings.Inline`   | `<button>` and a `<div>` panel             | `aria-expanded`, `aria-controls`                                                             | The panel opens in flow and pushes the content below it down. No overlay, no focus move. |
| `DisplaySettings.Floating` | `<button>` and `<div popover role=dialog>` | `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, popup named by the button's text | The popup is in the top layer. Non-modal: the page behind stays reachable.               |
| each group                 | `<fieldset>` with a `<legend>`             | native radio group                                                                           | Colour scheme, Contrast, Motion. The legend names the group (1.3.1).                     |
| each option                | `<input type="radio">` with a `<label>`    | `checked`                                                                                    | The checked radio is the only feedback: nothing is announced and focus stays.            |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key                   | Context                               | Action                                                                                         | Test                                                                                                         |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tab                   | before the control                    | Moves focus to the button, then through the open panel: one stop per group, the checked radio  | `display-settings.test.tsx › Tab has one stop per group and Shift+Tab goes back through them`                |
| Shift+Tab             | in the open panel                     | Moves back through the groups, then to the button                                              | `display-settings.test.tsx › Tab has one stop per group and Shift+Tab goes back through them`                |
| Enter                 | the button                            | Opens or closes the panel (inline) or the popup (floating, compact). Focus stays on the button | `display-settings.test.tsx › Enter opens the panel and Enter again closes it, and focus stays on the button` |
| Space                 | the button                            | Opens or closes it                                                                             | `display-settings.test.tsx › Space opens and closes the panel`                                               |
| ArrowDown, ArrowRight | on a radio                            | Moves to and selects the next option in the group                                              | `display-settings.test.tsx › ArrowDown moves to and selects the next radio in a group`                       |
| ArrowUp, ArrowLeft    | on a radio                            | Moves to and selects the previous option in the group                                          | `display-settings.test.tsx › ArrowUp moves to and selects the previous radio`                                |
| Escape                | in the open popup (floating, compact) | Closes the popup and returns focus to the button                                               | `display-settings.test.tsx › Enter opens a dialog named by the button, Escape closes it and focus returns`   |

The inline panel has no Escape: it is in flow, not an overlay (`display-settings.test.tsx › Escape does not close it: the panel is in flow, not an overlay`). Opening a popup never moves focus (`display-settings.test.tsx › opening the popup does not move focus`).

## Focus management

- Initial focus: not moved. Opening never moves focus.
- Trap: no.
- Restore to: the button, when the floating popup closes with focus inside it.
- Never obscured by: nothing: neither layout is sticky (2.4.11).

## Announcements

None. Choosing an option changes the page's appearance, which the user sees; it is not announced.

## Consumer responsibilities

- Message keys, in the `displaySettings` namespace: `displaySettings.button`, `colorSchemeLegend`, `colorSchemeLight`, `colorSchemeDark`, `colorSchemeSystem`, `contrastLegend`, `contrastStandard`, `contrastMore`, `contrastSystem`, `motionLegend`, `motionFull`, `motionReduce`, `motionSystem`, `forcedColors`, `systemShort`. Override per provider or with `messages` on the instance.
- Using a panel on its own: put it in a container you name (a Card with a heading, a Popover or Dialog with `aria-label`). The panel has no trigger and no landmark.
- Place it where a user looks for settings: the site header's masthead, or the footer.
- Notes of your own (what less motion does, where the choice is kept) are children, after the groups. The pattern has none; the only note it shows is the forced-colours one, while forced colours are on.
- The button's text is its name (2.5.3): override it with `messages.button`, never with an `aria-label`.
- Wrap the app in `KvirnProvider`: the choices go through `useTheme()` and are kept by the provider in this browser only.

## Visual / modes

- Inline: the panel is a Card in flow, on the content edge. Floating: the same Card in a popup of at most 40rem, with the popup shadow. Compact: a popup of at most 21rem, a row of segments per group; the radios are a transparent layer over their segment, so the browser's arrows, names and checked state stay. The checked segment is a primary fill and bolder, the ring is inset and `on-primary` on the checked one (the strip clips an outer ring); each segment is at least 32px high (2.5.8).
- 320px: the three groups wrap into one column (1.4.10); the floating popup stays inside the viewport and scrolls when it is too tall.
- forced-colors behaviour: the radios and the Card keep their system colours; the button keeps its `ButtonText` edge. A note says the device's colours replace the choices.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the popup opens towards the inline end.

## WCAG SCs covered

1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 3.2.2, 4.1.2.

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

## Known issues

- none
