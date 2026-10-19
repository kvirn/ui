# Accessibility contract: Stepper

- **APG pattern:** none. Stepper is static text: native semantics only.
- **Deviations:** none. Design decisions: one line of text, not a list; its own element directly after the page heading; no live region, no `aria-describedby`, no hidden text in the heading.
- **Native elements used:** `<p>`. The consumer can pick `<div>` with `as` (allowed elements below), and its own semantics apply.
- **Status:** alpha candidate. Reviewer findings fixed, accessibility-reviewer re-review pending. Manual AT is `pending`.
- **Tests:** `stepper.test.tsx` next to this file. `stepper.stories.tsx` in `apps/storybook/src/components/stepper/`.

Stepper says where the user is in a multi-page form: "Step 2 of 5: Your vehicle". It is orientation, not navigation. A step is a section that may span pages, so the total does not change when an answer adds a page. If sections can't be counted reliably, leave the Stepper out: never "Step 3 of ?".

## Roles, states, properties

| Part         | Element / role                               | ARIA                           | Notes                                                                                                                                                                                                          |
| ------------ | -------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stepper      | `<p>` → implicit paragraph, no explicit role | none                           | `class="kv-stepper"`. No `data-*`: it has no state. Attributes (`id`, `aria-*`) and the ref reach the element unchanged. The text is the message, never children                                               |
| Stepper      | `as`                                         | the chosen element's own       | One element, chosen with a string. A value outside the list is a type error and, in JS, warns once (`as-not-allowed:Stepper:<tag>`) and renders the default element. The text is the message, never `children` |
| Stepper      | never                                        | no `role`, `tabindex`          | No `role="status"`, no `aria-live`, no `aria-current`, no list, no link, no `aria-describedby` from the heading: the text is one reading stop in the page's order                                              |
| `useStepper` | the same, for your own markup                | `text`, `element`, `rootProps` | `text` can be reused, for example in `<title>`                                                                                                                                                                 |

Rules the automated tests check:

- **Placement.** The Stepper is the next element after the page heading, outside the heading, `label` and `legend`, so it never joins a control's or group's name (1.3.1 Info and Relationships, A; 1.3.2 Meaningful Sequence, A). In a label or legend that is the heading, it comes after the `h1` or the `legend`, before the description and the control.
- **Text.** `stepper.status` without a `name`, `stepper.statusWithName` with one. Each locale owns its word order and punctuation; numbers follow the language's number format. A blank `name` counts as none.
- **Dev warnings (once):** `stepper-invalid-position` (`current` or `total` not a positive whole number, or `current > total`); `stepper-in-name` (rendered inside an `h1`–`h6` or `role="heading"`, `label`, `legend`, `summary`, `button`, `a` or `caption`).

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1 Info and Relationships, A; 4.1.2 Name, Role, Value, A). `as` is a string, so it works from a Server Component.

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

No live region: the new page is content reached by navigation and carried by focus, so it is not a status message (4.1.3 Status Messages, AA, does not apply). A live region would also queue behind or interrupt the heading.

### Read aloud

| State or action                    | Expected phrase(s) as read aloud                                                                 | Live region politeness | Test                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------- |
| A question page read top to bottom | `heading, Which vehicle is the permit for?, level 1` → `paragraph` → `Step 2 of 5: Your vehicle` | none                   | `stepper.test.tsx › is the reading stop right after the heading`                      |
| Without a name, or a blank name    | `paragraph` → `Step 2 of 5`, no colon                                                            | none                   | `stepper.test.tsx › reads without a name and with a blank name as the position alone` |
| Label or legend as the heading     | the Stepper after the `h1` or the legend, before the control: not read in that state             | none                   | none (the placement is checked by the dev warnings only)                              |

The phrases are the virtual screen reader's approximation, not NVDA or JAWS wording.

## Consumer responsibilities

- **Count sections, not pages.** The total stays the same when branching adds a page.
- **Short names in plain words.** Wrap, never truncate: long Finnish names hyphenate.
- **Never navigation.** No links to steps. Going back is a Back link, and Change links on the check-answers page keep answers (3.3.7 Redundant Entry, A).
- **Focus order and consistency are the flow's work.** The Stepper is no Tab stop, and focus moves to the new page's heading through `useRouteFocus` (2.4.3 Focus Order, A). Put it in the same place on every step (3.2.3 Consistent Navigation, AA). Keep the answers when the user goes back (3.3.7 Redundant Entry, A).
- **Not on** a start page, a confirmation, an exit page or a one-page form.
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2 Language of Parts, AA).

## Visual / modes

Headless: Stepper ships no CSS. With the default theme the Stepper is body text in the normal text colour. It has no margin (the page layout sets the spacing), it wraps and hyphenates long words, and it looks the same in every density. It adds no new colour pair: the text colour on the page backgrounds is already measured (1.4.3 Contrast (Minimum), AA). Sizes follow the browser's text size (1.4.4 Resize Text, AA), and the text reflows at 320px (1.4.10 Reflow, AA). Text spacing (1.4.12 Text Spacing, AA) is not checked by a story. Forced colours: it uses the system text colour, and nothing is carried by colour (1.4.1 Use of Color, A). Target size, focus indicator and motion do not apply, because Stepper is not a control.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A), 1.3.2 Meaningful Sequence (A): a paragraph that follows the heading, outside any name (`stepper.test.tsx › is the reading stop right after the heading`, and the `dev warnings` tests for a Stepper inside a heading, label or legend).
- 1.4.1 Use of Color (A): the words say it (story `Default`, axe in every theme).
- 1.4.3 Contrast (Minimum) (AA), 1.4.4 Resize Text (AA), 1.4.10 Reflow (AA): text on measured pairs, in rem, wrapping. 1.4.12 Text Spacing (AA): no text-spacing story or automated check covers it.
- 4.1.3 Status Messages (AA): not a status message.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                                    |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | stepper.stories.tsx, every story, 4 themes                                                                                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | stepper.test.tsx › renders one p with the position and a class, no role or ARIA, and passes attributes and the ref through; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | stepper.test.tsx › keyboard › Tab passes over it                                                                                                   |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                                                        |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                                      |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                                    |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                    |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                                    |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                                    |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                    |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                                    |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                                    |

## Known issues

None.
