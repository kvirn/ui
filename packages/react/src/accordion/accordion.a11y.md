# Accessibility contract: Accordion (Root, Item, Heading, Trigger, Panel)

- **APG pattern:** [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): a stack of headings whose buttons each show and hide one section. Each item is a [Disclosure](../disclosure/disclosure.a11y.md); the wiring, `hidden` and find-in-page rules are proved there.
- **Deviations:** none. APG makes the arrow keys, Home and End between headers optional, and Plan 0058 does not adopt them (Decisions in the plan): every trigger is a Tab stop, and the keys are the page's own.
- **Native elements used:** `<div>` (Root, Item), `<h1>` to `<h6>` (Heading, by `level`), `<button type="button">` (Trigger), `<div>` (Panel).
- **Status:** alpha candidate (Plan 0058). Manual AT is `pending`.
- **Tests:** `accordion.test.tsx` next to this file. `accordion.stories.tsx` in `apps/storybook/src/components/accordion/`.

An Accordion is a list of questions or sections, each a heading with a button, that a reader opens one by one. Items are independent: opening one never closes another. A "show all" button is not part of this version.

## Roles, states, properties

| Part              | Element / role                                                     | ARIA / state                                                                       | Notes                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion.Root    | `<div class="kv-accordion">`, no role (`role="list"` on `ul`/`ol`) | none                                                                               | `hiddenUntilFound` is the default for every item. `as="ul"` or `"ol"` makes it a list that adds `role="list"` when it renders a `ul` or `ol`, because WebKit and VoiceOver drop the list role under `list-style: none` |
| Accordion.Item    | `<div class="kv-accordion-item">`, no role                         | `data-open` while open                                                             | Owns its own state: `open`, `defaultOpen`, `onOpenChange`, `disabled`, `focusableWhenDisabled`, `hiddenUntilFound`                                                                                                     |
| Accordion.Heading | `<h1>` to `<h6>` by the required `level`                           | none                                                                               | Class `kv-accordion-heading`. The trigger is its only child. Screen reader users find the questions by heading                                                                                                         |
| Accordion.Trigger | `<button type="button">`                                           | `aria-expanded`, `aria-controls`. `data-open`, `data-disabled`                     | `Disclosure.Trigger` with the class `kv-accordion-trigger` added: chevron down closed, up open, at the inline end                                                                                                      |
| Accordion.Panel   | `<div>`, always rendered, `hidden` while closed                    | `data-open`. With `region`: `role="region"` and `aria-labelledby` the trigger's id | `Disclosure.Panel` with the class `kv-accordion-panel` added. `region` is off by default: APG advises it for about six or fewer                                                                                        |
| `useAccordion`    | the classes, for your own elements                                 | `rootProps`, `itemProps`, `headingProps`                                           | Pair it with one `useDisclosure()` per item                                                                                                                                                                            |

Rules, tested in `accordion.test.tsx`:

- **Heading around the button.** The trigger is the only child of a heading of the consumer's `level`, so the outline is theirs (1.3.1, 2.4.6).
- **Independent items.** Opening one item changes no other. `defaultOpen` and `open` are per item.
- **Same wiring as Disclosure.** `aria-controls` resolves to the item's panel, a closed panel is `hidden`, and a disabled item blocks.
- **Find-in-page.** `hiddenUntilFound` on the Root applies to every item, and an item can set its own.
- **Region is opt-in.** Without `region` a panel has no role. With it, it is a `region` named by its trigger.
- **Dev warnings:** as Disclosure (a part outside an Item, a Trigger that is not a `<button>`).

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
- Never obscured by: the sections are in flow, so a sticky header is the consumer's `scroll-padding` (2.4.11).

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | none       |

Accordion has no strings of its own. A screen reader reports the change of `aria-expanded` on the focused trigger.

## Consumer responsibilities

- **Pick the heading `level` that fits the page's outline** (a FAQ under an `h2` uses `3`). It is required: Accordion can't know where it sits.
- **Name every trigger with the question or section title,** the same open and closed (4.1.2, 2.5.3).
- **Render each panel right after its heading,** in the same item (2.4.3).
- **Use `region` only for a few sections.** More than about six open regions crowd a screen reader user's landmark list (APG).
- **Keep content that must be seen at once out of an accordion.** Hiding the answer behind a press costs every user a step.
- A list of items as a `<ul>` is `Accordion.Root as="ul"` (it adds `role="list"`) with `Accordion.Item as="li"`.
- Everything in `disclosure.a11y.md` and `button.a11y.md` applies.

## Visual / modes

- Focus indicator: the 2px ring with the 2px offset on the trigger (2.4.7, 2.4.13), drawn so the neighbouring item doesn't clip it.
- Target size: the whole row is the trigger, at least 44px high in comfortable density, 32px compact (2.5.8).
- Colour: `text` on the page, with `border-subtle` hairlines between items (not relied on as the only boundary: the heading and the chevron mark each row). No new colour pair. The open state is the chevron and `aria-expanded`, never colour (1.4.1).
- forced-colors behaviour: hairlines map to system colours, and the chevron is `currentColor`.
- reduced-motion behaviour: nothing animates.
- Reflow: at 320px the question wraps and the chevron stays at the inline end (1.4.10).
- RTL: the chevron moves to the left, the text starts at the right.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 2.4.6 Headings and Labels, 4.1.2 Name, Role, Value: headings, native buttons, `aria-expanded`, `aria-controls`.
- 1.4.1 Use of Color, 1.4.10 Reflow, 1.4.12 Text Spacing.
- 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.1.4 Character Key Shortcuts, 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.5.8 Target Size (Minimum).
- 3.2.1 On Focus, 3.2.2 On Input.

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

- **No arrow-key navigation between headers.** APG lists it as optional. Every trigger is a Tab stop, so a long FAQ costs more Tab presses. Revisit with the AT matrix.
- **No "show all" button and no "only one open" mode** in this version.
- **`hidden="until-found"` support differs** between browsers (see `disclosure.a11y.md`).
