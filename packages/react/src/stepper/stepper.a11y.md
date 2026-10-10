# Accessibility contract: Stepper

- **APG pattern:** none. Stepper is static text: native semantics only.
- **Deviations:** none. Decisions (Plan 0083, design spec `docs/design/stepper.md`): one line of text, not a list; its own element directly after the page heading; no live region, no `aria-describedby`, no hidden text in the heading.
- **Native elements used:** `<p>`. The consumer can pick `<div>` with `as` (allowed elements below), and its own semantics apply.
- **Status:** alpha candidate (Plan 0083). Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `stepper.test.tsx` next to this file. `stepper.stories.tsx` in `apps/storybook/src/components/stepper/`.

Stepper says where the user is in a multi-page form: "Step 2 of 5: Your vehicle". It is orientation, not navigation. A step is a section that may span pages, so the total does not change when an answer adds a page. If sections can't be counted reliably, leave the Stepper out: never "Step 3 of ?".

## Roles, states, properties

| Part         | Element / role                               | ARIA                           | Notes                                                                                                                                                                                                          |
| ------------ | -------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stepper      | `<p>` → implicit paragraph, no explicit role | none                           | `class="kv-stepper"`. No `data-*`: it has no state. Attributes (`id`, `lang`, `aria-*`) and the ref reach the element unchanged. The text is the message, never children                                       |
| Stepper      | `as`                                         | the chosen element's own       | One element, chosen with a string. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Stepper:<tag>`) and renders the default element. The text is the message, never `children` |
| Stepper      | never                                        | no `role`, `tabindex`          | No `role="status"`, no `aria-live`, no `aria-current`, no list, no link, no `aria-describedby` from the heading: the text is one reading stop in the page's order                                              |
| `useStepper` | the same, for your own markup                | `text`, `element`, `rootProps` | `text` can be reused, for example in `<title>`                                                                                                                                                                 |

Rules, tested in `stepper.test.tsx`:

- **Placement.** The Stepper is the next element after the page heading, outside the heading, `label` and `legend`, so it never joins a control's or group's name (1.3.1, 1.3.2). In a label or legend that is the heading, it comes after the `h1` or the `legend`, before the description and the control.
- **Text.** `stepper.status` without a `name`, `stepper.statusWithName` with one. Each locale owns its word order and punctuation; numbers go through `format.number`. A blank `name` counts as none.
- **Dev warnings (once):** `stepper-invalid-position` (`current` or `total` not a positive whole number, or `current > total`); `stepper-in-name` (rendered inside an `h1`–`h6` or `role="heading"`, `label`, `legend`, `summary`, `button`, `a` or `caption`).

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part    | `as`                 | Why                                                                                                                                                                                                                                                        |
| ------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stepper | `p` (default), `div` | A line of text. No `span` (it would sit inline in a heading, which the placement check forbids), no heading and no list. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Stepper:<tag>`) and renders the default element. |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context          | Action                                           | Test                                                     |
| --------- | ---------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Tab       | before a Stepper | Passes over it to the next focusable element     | `stepper.test.tsx › keyboard › Tab passes over it`       |
| Shift+Tab | after a Stepper  | Passes over it to the previous focusable element | `stepper.test.tsx › keyboard › Shift+Tab passes over it` |

## Focus management

- Initial focus: not moved. Stepper never moves focus.
- Trap: no.
- Restore to: not applicable.
- On a step change the flow moves focus (`useRouteFocus` to the `h1`; the ErrorSummary after a failed submit). The Stepper is the next item in reading order.

## Announcements

| Event | Message key (i18n)                                             | Politeness |
| ----- | -------------------------------------------------------------- | ---------- |
| none  | `stepper.status`, `stepper.statusWithName` (visible text only) | –          |

No live region: the new page is content reached by navigation and carried by focus, so it is not a status message (4.1.3 does not apply). A live region would also queue behind or interrupt the heading.

### Read aloud

| State or action                 | Expected phrase(s) as read aloud                                                                 | Live region politeness | Test                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------- |
| T4 page read top to bottom      | `heading, Which vehicle is the permit for?, level 1` → `paragraph` → `Step 2 of 5: Your vehicle` | none                   | `stepper.test.tsx › is the reading stop right after the heading`                      |
| Without a name, or a blank name | `paragraph` → `Step 2 of 5`, no colon                                                            | none                   | `stepper.test.tsx › reads without a name and with a blank name as the position alone` |
| Label or legend as the heading  | the Stepper after the `h1` or the legend, before the control: not read in that state             | none                   | none yet (the placement is checked by the dev warnings only)                          |

The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording.

## Consumer responsibilities

- **Count sections, not pages.** The total stays the same when branching adds a page.
- **Short names in plain words.** Wrap, never truncate: long Finnish names hyphenate.
- **Never navigation.** No links to steps. Going back is a Back link, and Change links on the check-answers page keep answers (3.3.7).
- **Not on** a start page, a confirmation, an exit page or a one-page form.
- **Language.** `lang` on a Stepper in a text of another language (3.1.2).

## Visual / modes

Headless: Stepper ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-stepper` is body text in `text`, with no margin (the layout owns the rhythm), that wraps and hyphenates and is the same in every density. No new colour pair: `text` on `canvas`, `surface` and `surface-raised` is already measured (1.4.3). Sizes follow the browser's text size (1.4.4), and the text reflows at 320px and with the 1.4.12 spacing overrides (1.4.10, 1.4.12). Forced colours: inherited `CanvasText`; nothing is carried by colour (1.4.1). Target size, focus indicator and motion: not applicable, because Stepper is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 1.3.2 Meaningful Sequence: a paragraph that follows the heading, outside any name (`stepper.test.tsx › is the reading stop right after the heading`, and the `dev warnings` tests for a Stepper inside a heading, label or legend).
- 1.4.1 Use of Color: the words say it (story `Default`, axe in every theme).
- 1.4.3, 1.4.4, 1.4.10: text on measured pairs, in rem, wrapping. 1.4.12: `pending` (no text-spacing story; the Plan 0051 sweep).
- 2.4.3 Focus Order: no Tab stop; focus moves by `useRouteFocus`.
- 3.1.2 Language of Parts: the consumer's `lang` reaches the element.
- 3.2.3 Consistent Navigation: the same place on every step.
- 3.3.7 Redundant Entry: the flow keeps the answers.
- 4.1.3 Status Messages: not a status message.

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

None.
