# Accessibility contract: Accordion (Root, Item, Heading, Trigger, Panel)

- **APG pattern:** [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): a stack of headings whose buttons each show and hide one section. Each item is a Disclosure: how its button, its hidden panel and find-in-page work is described on the Disclosure page.
- **Deviations:** none. APG makes the arrow keys, Home and End between headers optional. This version doesn't use them: every button is a Tab stop, and those keys stay the page's own.
- **Native elements used:** `<div>` (Root, Item), `<h1>` to `<h6>` (Heading, by `level`), `<button type="button">` (Trigger), `<div>` (Panel).
- **Tests:** `accordion.test.tsx` next to this file. `accordion.stories.tsx` in `apps/storybook/src/components/accordion/`.

An Accordion is a list of questions or sections, each a heading with a button, that a reader opens one by one. Items are independent: opening one never closes another. It has no "show all" button.

## Roles, states, properties

| Part              | Element / role                                                     | ARIA / state                                                                       | Notes                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion.Root    | `<div class="kv-accordion">`, no role (`role="list"` on `ul`/`ol`) | none                                                                               | `hiddenUntilFound` is the default for every item. `as="ul"` or `"ol"` makes it a list that adds `role="list"` when it renders a `ul` or `ol`, because WebKit and VoiceOver drop the list role under `list-style: none` |
| Accordion.Item    | `<div class="kv-accordion-item">`, no role                         | `data-open` while open                                                             | Owns its own state: `open`, `defaultOpen`, `onOpenChange`, `disabled`, `focusableWhenDisabled`, `hiddenUntilFound`                                                                                                     |
| Accordion.Heading | `<h1>` to `<h6>` by the required `level`                           | none                                                                               | Class `kv-accordion-heading`. The trigger is its only child. Screen reader users find the questions by heading                                                                                                         |
| Accordion.Trigger | `<button type="button">`                                           | `aria-expanded`, `aria-controls`. `data-open`, `data-disabled`                     | `Disclosure.Trigger` with the class `kv-accordion-trigger` added: chevron down closed, up open, at the inline end                                                                                                      |
| Accordion.Panel   | `<div>`, always rendered, `hidden` while closed                    | `data-open`. With `region`: `role="region"` and `aria-labelledby` the trigger's id | `Disclosure.Panel` with the class `kv-accordion-panel` added. `region` is off by default: APG advises it for about six or fewer                                                                                        |
| `useAccordion`    | the classes, for your own elements                                 | `rootProps`, `itemProps`, `headingProps`                                           | Pair it with one `useDisclosure()` per item                                                                                                                                                                            |

What the automated tests prove:

- **Heading around the button.** The trigger is the only child of a heading of the consumer's `level`, so the outline is theirs (1.3.1, 2.4.6).
- **Independent items.** Opening one item changes no other. `defaultOpen` and `open` are per item.
- **Same wiring as a Disclosure.** `aria-controls` points at the item's panel, a closed panel is `hidden`, and a disabled item can't be opened.
- **Find-in-page.** `hiddenUntilFound` on the Root applies to every item, and an item can set its own.
- **Region is opt-in.** Without `region` a panel has no role. With it, it is a `region` named by its trigger.
- **Development warnings,** as for a Disclosure: a part outside an Item, or a Trigger that is not a `<button>`.

## Allowed elements

A tag outside the list changes the page's outline or semantics (1.3.1, 4.1.2). `as` is a string, so it works from a Server Component.

| Part                    | `as`                        | Why                                                                                                           |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Root                    | `div` (default), `ul`, `ol` | A list of questions whose count is announced; the root adds `role="list"`. No landmark element                |
| Item                    | `div` (default), `li`       | A list item inside a `ul` or `ol` Root. No other element, so the heading and the panel stay its only children |
| Heading, Trigger, Panel | none                        | Heading is `h1` to `h6` by `level`, Trigger a `<button>`, Panel a `<div>` (4.1.2, 1.3.1)                      |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key                              | Context                    | Action                                                                                                        | Test                                                                              |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Tab                              | before the accordion       | Moves focus to the first trigger. Every trigger is its own Tab stop, in the order of the page                 | `accordion.test.tsx › Tab visits every trigger in order, and Shift+Tab goes back` |
| Shift+Tab                        | on a trigger               | Moves focus to the previous trigger, or out of the accordion from the first                                   | `accordion.test.tsx › Tab visits every trigger in order, and Shift+Tab goes back` |
| Enter / Space                    | on a trigger               | Opens the section, or closes it when it is open. Focus stays on the trigger. Other items don't change         | `accordion.test.tsx › Enter and Space toggle one item and leave the others`       |
| Tab                              | on a trigger, section open | Moves focus into the open section's content, then on to the next trigger                                      | `accordion.test.tsx › Tab goes through an open section before the next trigger`   |
| ArrowDown / ArrowUp / Home / End | on a trigger               | Nothing: APG's optional keys are not adopted, so they scroll the page as usual and the key is never prevented | `accordion.test.tsx › the arrow keys, Home and End are not handled`               |

The accordion handles no other key. Escape is the page's own.

## Focus management

- Initial focus: **not moved.** Opening or closing a section never moves focus.
- Trap: no.
- Restore to: not needed. Focus stays on the trigger.
- Never hidden by: the sections are part of the page, so nothing covers the focused button except what your page adds, such as a sticky header. Keep the button in view with `scroll-padding` (2.4.11 Focus Not Obscured (Minimum), AA).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Accordion has no strings of its own. A screen reader reports the change of `aria-expanded` on the focused trigger.

## Consumer responsibilities

- **Pick the heading `level` that fits the page's outline** (a FAQ under an `h2` uses `3`). It is required: Accordion can't know where it sits (1.3.1 Info and Relationships, 2.4.6 Headings and Labels).
- **Name every button with the question or section title,** and keep the same words open and closed (4.1.2 Name, Role, Value; 2.5.3 Label in Name).
- **Render each panel right after its heading,** in the same item, so the reading order and the focus order match (2.4.3 Focus Order).
- **Use `region` only for a few sections.** More than about six open regions crowd a screen reader user's list of landmarks (APG).
- **Keep content that must be seen at once out of an accordion.** Hiding the answer behind a press costs every user a step.
- **For a numbered or bulleted list of items,** use `Accordion.Root as="ul"` with `Accordion.Item as="li"`. The root adds `role="list"` itself.
- Everything the Disclosure and Button pages ask of you applies here too.

## Visual / modes

- Focus indicator: a ring on the button with at least 3:1 contrast against its background (2.4.7 Focus Visible, AA). It is drawn so the neighbouring item doesn't clip it. The default theme is designed to meet 2.4.13 Focus Appearance (AAA) as well.
- Target size: the whole row is the button, much larger than the 24 by 24 CSS pixel minimum (2.5.8 Target Size (Minimum), AA).
- Colour: the default theme keeps text at the minimum contrast on the page (1.4.3 Contrast (Minimum), AA), and no new colour pair is added. Thin lines between items are not the only boundary: the heading and the chevron mark each row. Open or closed is shown by the chevron and `aria-expanded`, never by colour alone (1.4.1 Use of Color).
- Forced colours: the lines use the system's colours, and the chevron follows the text colour.
- Reduced motion: nothing animates.
- Reflow: at 320px the question wraps and the chevron stays at the end of the line (1.4.10 Reflow).
- Right-to-left languages: the chevron moves to the left and the text starts at the right.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): each question is a real heading with a native button inside it.
- 2.4.6 Headings and Labels (AA): the heading level is yours, so the outline fits the page.
- 4.1.2 Name, Role, Value (A): native buttons with `aria-expanded` and `aria-controls`.
- 1.4.1 Use of Color (A): open or closed is a chevron and a state, not colour.
- 1.4.10 Reflow (AA) and 1.4.12 Text Spacing (AA): the text wraps and nothing is clipped.
- 2.1.1 Keyboard (A) and 2.1.2 No Keyboard Trap (A): every button is a Tab stop and focus can always leave.
- 2.1.4 Character Key Shortcuts (A): the accordion adds no single-key shortcuts.
- 2.4.3 Focus Order (A): the order of the buttons is the order of the page.
- 2.4.7 Focus Visible (AA) and 2.4.11 Focus Not Obscured (Minimum) (AA): the focus ring shows and isn't clipped by the component.
- 2.5.8 Target Size (Minimum) (AA): the whole row is the target.
- 2.5.3 Label in Name (A): the button's name is its visible text, the same open and closed (`accordion.test.tsx › a trigger keeps its name open and closed`). Choosing words that match is yours.
- 1.4.3 Contrast (Minimum) (AA) and 1.4.11 Non-text Contrast (AA): the text and the chevron use the page's text colour, and the theme adds no new colour pair. The text colours are checked automatically in every theme.
- 3.2.1 On Focus (A) and 3.2.2 On Input (A): focusing or pressing a button opens its panel and changes nothing else.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                           |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                 |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | accordion.stories.tsx, every story, 4 themes                                                                                    |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `accordion.test.tsx` (axe and role, name and state): `every item is a heading around a button, and no item or panel has a role` |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 5 rows, each names a test in `accordion.test.tsx`                                                                               |
| Focus order and management                                                 | pass        | n/a         | pass    | `accordion.test.tsx` asserts focus                                                                                              |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                   |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                 |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                 |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                 |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                 |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                 |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                 |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                 |

### What to check

With a screen reader and the keyboard, try:

- Each question is one Tab stop and appears in the headings list.
- Press Enter on a question: "expanded" is read, and focus stays on it.
- Opening a second question keeps the first open.
- Tab from an open question goes into its answer, then to the next question.
- The arrow keys, Home and End only scroll the page.
- With `region`, an open answer appears in the landmarks list, named by its question.

## Known issues

- **No arrow-key navigation between headers.** APG lists it as optional. Every button is a Tab stop, so a long FAQ costs a keyboard user more Tab presses.
- **No "show all" button and no "only one open" mode.**
- **Find-in-page support differs between browsers.** With `hiddenUntilFound`, Chromium browsers reveal a closed answer that matches. A browser without support treats the answer as hidden, so find-in-page misses it and nothing else breaks.
