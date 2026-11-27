# Accessibility contract: Tag and TagGroup

- **APG pattern:** none. APG has no chip or tag pattern, so no key is invented. A removable tag is a native `<button>`: the [APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) keys apply (Enter, Space) and nothing else.
- **Deviations:** none. Delete and Backspace are not taken on a remove button: that is not an APG deviation (APG defines nothing for a chip).
- **Native elements used:** `<ul role="list">` with `<li>` items, `<button type="button">`, `<span>`, `<p>`.
- **Tests:** `tag.test.tsx` next to this file. `tag.stories.tsx` in `apps/storybook/src/components/tag/`.

A tag is a short fact in words, such as an applied filter. A static tag is text in a list item. A removable tag is one button: the whole chip, text and cross, so there is no small cross to hit (2.5.8) and no text that does nothing when pressed. TagGroup holds the focus rule for removal and the removal announcement. It holds no tag state: the consumer keeps the tags and removes one in `onRemove`.

## Roles, states, properties

| Part                | Element / role                                                | ARIA                                                           | Notes                                                                                                                                          |
| ------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `TagGroup.Root`     | `<div>` → no role                                             | none                                                           | Options `announceRemoval` (default `true`), `focusFallback` (default: the label), `messages`                                                   |
| `TagGroup.Label`    | `<span>`                                                      | `id`; `tabindex="-1"` only once it receives the fallback focus | `filters.applied` in the filter block                                                                                                          |
| `TagGroup.List`     | `<ul role="list">`                                            | `aria-labelledby` the label                                    | "Applied filters, list, 2 items". Not rendered while it has no tag                                                                             |
| `TagGroup.Empty`    | `<p>`                                                         | none                                                           | Shown while the list has no tag. Not announced                                                                                                 |
| `TagGroup.ClearAll` | `Button`                                                      | none                                                           | Shown while the list has a tag. Render it only while a tag can be cleared (see Consumer responsibilities). Text defaults to `filters.clearAll` |
| `Tag.Root`          | `<li>`                                                        | none                                                           |                                                                                                                                                |
| `Tag.Label`         | `<span>`                                                      | none                                                           | The text of a static tag. A locked filter is a static tag, never a disabled button                                                             |
| `Tag.Remove`        | `<button type="button">` with the text and a decorative cross | `aria-label` = `tag.remove` with the text                      | The name contains the visible text (2.5.3). The cross is `aria-hidden`. A dev warning when `children` is not a string and there is no `label`  |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Every remove button is its own Tab stop: no composite, no roving tabindex. Static tags are skipped.

| Key                | Context                         | Action                                                                                        | Test                                                                                               |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Tab                | before the group                | Moves to the first remove button, then each in order, then Clear all. Static tags are skipped | `tag.test.tsx › Tab reaches every remove button in order, then Clear all`                          |
| Shift+Tab          | in the group                    | The same, backwards                                                                           | `tag.test.tsx › Shift+Tab goes back through the remove buttons`                                    |
| Enter / Space      | on a remove button              | Removes the tag. Focus moves to the next remove button                                        | `tag.test.tsx › Enter and Space remove the tag and focus the next remove button`                   |
| Enter / Space      | on the last remove button       | Removes it. Focus moves to the previous remove button                                         | `tag.test.tsx › removing the last tag focuses the previous remove button`                          |
| Enter / Space      | on the only remove button       | Removes it. Focus moves to the fallback (the label, or `focusFallback`)                       | `tag.test.tsx › removing the only tag focuses the fallback, never body`                            |
| Enter / Space      | on Clear all                    | Removes every tag. Focus moves to the fallback                                                | `tag.test.tsx › Clear all focuses the fallback`                                                    |
| Enter / Space      | on Clear all, with a locked tag | Your `onClear` keeps the locked tag. Focus moves to the fallback, as after a full clear       | `tag.test.tsx › Clear all with a locked tag removes the removable ones, then focuses the fallback` |
| Delete / Backspace | on a remove button              | Nothing: the keys are not taken                                                               | `tag.test.tsx › Delete and Backspace on a remove button remove nothing`                            |

## Focus management

- Initial focus: not moved. Adding a tag never moves focus.
- Focus never lands on `body` (2.4.3): every removal ends on a remove button or the fallback. The fallback is the label (it gets `tabindex="-1"` when it is first used) or the element `focusFallback` returns.
- The consumer's state must change in the same event as `onRemove`: focus is placed after the render that follows the click. A removal (or Clear all) the consumer refuses leaves focus where it was and announces nothing.
- Clear all keeps a locked tag when your `onClear` does. Focus still moves to the fallback once any tag has gone. If only locked tags remain, Clear all would do nothing, so the consumer leaves it out (see Consumer responsibilities).
- `Tag.Remove` must be inside a `TagGroup.Root`: outside it throws, because focus could not be managed.
- A group needs a `TagGroup.Label` or a `focusFallback`; with neither, a dev warning says so.
- `focusFallback` must return a focusable element (a button, or `tabindex="-1"`). If it can't take focus, the label is used and a dev warning is logged.
- Trap: no. Restore to: not applicable.

## Announcements

| Event                                      | Message key (i18n)                                                | Politeness                                    |
| ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------- |
| A tag is removed                           | `tag.removed` ("Kultur removed.")                                 | polite, unless `announceRemoval={false}`      |
| A filter is removed, with the result count | `filters.removedResultCount` ("Kultur removed. 12 results.")      | polite, by the consumer, after results settle |
| Clear all, with the result count           | `filters.clearedResultCount` ("All filters cleared. 40 results.") | polite, by the consumer                       |

The live region keeps only the last message, so a filtered list sets `announceRemoval={false}` and says one combined message. Clear all announces nothing by itself, so say what was cleared yourself. Locked tags stay, so do not say they were cleared.

## Consumer responsibilities

- **Words, always.** A tag says its fact in text: `Year: 2025`, not `2025`, so it is clear out of context (`filters.appliedValue`).
- **Keep the visible text and the name equal.** Pass `label` when `children` is richer than a string (2.5.3).
- **Change the tags in `onRemove`, synchronously.** Announce one combined message when other content changes with the removal, such as a result count (4.1.3 Status Messages, AA).
- **Selectable filters are checkboxes** (CheckboxGroup), not a tag state. A Badge is never put in a TagGroup.
- **Render `TagGroup.ClearAll` only while a tag can be cleared.** Leave it out when only locked tags remain: the group can't tell a locked tag from a clearable one.
- **Long text wraps** and is never truncated.

## Visual / modes

- Focus indicator: a visible ring on the remove button and on Clear all, in every theme (2.4.7 Focus Visible, AA).
- Target size: the whole chip is the target, at least 44px high (32px in the compact size), above the 24px minimum (2.5.8 Target Size (Minimum), AA).
- Contrast: tag text and the edge of a remove button meet the AA ratios (1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, AA), checked for every theme by the theme contrast check. A locked tag has only a faint outline, because it is not a control.
- Forced colours: the edge of a remove button stays visible and turns to the highlight colour on hover, and the cross still shows.
- Nothing is shown by colour alone (1.4.1 Use of Color, A): a removable tag has a cross, a locked one has none.
- Long text wraps instead of being cut off, down to a 320px wide screen (1.4.10 Reflow, AA). Right-to-left languages mirror the layout. There is no motion.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): a list of items under a name.
- 1.4.1 Use of Color (A), 1.4.3 Contrast (Minimum) (AA), 1.4.10 Reflow (AA), 1.4.11 Non-text Contrast (AA): see Visual / modes.
- 2.4.3 Focus Order (A): focus never lands on `body` (the Enter / Space and Clear all rows).
- 2.4.7 Focus Visible (AA): a visible focus ring on the button.
- 2.5.3 Label in Name (A): the remove button's name contains its visible text.
- 2.5.8 Target Size (Minimum) (AA): the whole chip is the target.
- 4.1.2 Name, Role, Value (A): a native button with a name.
- 4.1.3 Status Messages (AA): removing a tag announces `tag.removed`, and `announceRemoval={false}` says nothing.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                      |
| axe, WCAG 2.2 A and AA, every story, light theme                           | pass        | n/a         | pass    | every Tag story, light theme                                                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | the list is named by the label and is not rendered while empty                                       |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | every Keyboard row above names a test                                                                |
| Focus order and management                                                 | pass        | n/a         | pass    | tests check where `document.activeElement` is after each removal, and that it is never `body`        |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four display-mode checks (forced colours, reduced motion, 320px reflow, text spacing), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                      |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                      |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                      |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                      |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                      |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                      |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                      |

### What to check

With the keyboard and a screen reader, try:

- Tab through the tags: each remove button is one stop, and locked (static) tags are skipped.
- Press Enter or Space on a remove button: the tag goes and focus moves to the next remove button.
- Remove the only remaining tag: focus moves to the label, or to the fallback you set.
- Press Delete or Backspace on a remove button: nothing happens.
- With a screen reader, remove a tag and listen for "Kultur removed."
- With a locked tag in the group, press Clear all: the removable tags go, the locked tag stays, and focus moves to the label or the fallback.
- Remove or clear until only the locked tag is left: Clear all is no longer on screen.

## Known issues

None.
