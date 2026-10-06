# Accessibility contract: Tag and TagGroup

- **APG pattern:** none. APG has no chip or tag pattern, so no key is invented. A removable tag is a native `<button>`: the [APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) keys apply (Enter, Space) and nothing else.
- **Deviations:** none. Delete and Backspace are not taken on a remove button: that is not an APG deviation (APG defines nothing for a chip), see the `keyboard` skill.
- **Native elements used:** `<ul role="list">` with `<li>` items, `<button type="button">`, `<span>`, `<p>`.
- **Status:** alpha candidate (Plan 0075). Gates pending. Manual AT is `pending`.
- **Tests:** `tag.test.tsx` next to this file. `tag.stories.tsx` in `apps/storybook/src/components/tag/`. Design: `docs/design/tag-and-filters.md`.

A tag is a short fact in words, such as an applied filter. A static tag is text in a list item. A removable tag is one button: the whole chip, text and cross, so there is no small cross to hit (2.5.8) and no text that does nothing when pressed. TagGroup holds the focus rule for removal and the removal announcement. It holds no tag state: the consumer keeps the tags and removes one in `onRemove`.

## Roles, states, properties

| Part                | Element / role                                                | ARIA                                                           | Notes                                                                                                                                         |
| ------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `TagGroup.Root`     | `<div>` → no role                                             | none                                                           | Options `announceRemoval` (default `true`), `focusFallback` (default: the label), `messages`                                                  |
| `TagGroup.Label`    | `<span>` (`render` for a heading)                             | `id`; `tabindex="-1"` only once it receives the fallback focus | `filters.applied` in the filter block                                                                                                         |
| `TagGroup.List`     | `<ul role="list">`                                            | `aria-labelledby` the label                                    | "Applied filters, list, 2 items". Not rendered while it has no tag                                                                            |
| `TagGroup.Empty`    | `<p>`                                                         | none                                                           | Shown while the list has no tag. Not announced                                                                                                |
| `TagGroup.ClearAll` | `Button`                                                      | none                                                           | Shown while the list has a tag. Text defaults to `filters.clearAll`                                                                           |
| `Tag.Root`          | `<li>`                                                        | none                                                           |                                                                                                                                               |
| `Tag.Label`         | `<span>`                                                      | none                                                           | The text of a static tag. A locked filter is a static tag, never a disabled button                                                            |
| `Tag.Remove`        | `<button type="button">` with the text and a decorative cross | `aria-label` = `tag.remove` with the text                      | The name contains the visible text (2.5.3). The cross is `aria-hidden`. A dev warning when `children` is not a string and there is no `label` |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Every remove button is its own Tab stop: no composite, no roving tabindex. Static tags are skipped.

| Key                | Context                   | Action                                                                                        | Test                                                                             |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tab                | before the group          | Moves to the first remove button, then each in order, then Clear all. Static tags are skipped | `tag.test.tsx › Tab reaches every remove button in order, then Clear all`        |
| Shift+Tab          | in the group              | The same, backwards                                                                           | `tag.test.tsx › Shift+Tab goes back through the remove buttons`                  |
| Enter / Space      | on a remove button        | Removes the tag. Focus moves to the next remove button                                        | `tag.test.tsx › Enter and Space remove the tag and focus the next remove button` |
| Enter / Space      | on the last remove button | Removes it. Focus moves to the previous remove button                                         | `tag.test.tsx › removing the last tag focuses the previous remove button`        |
| Enter / Space      | on the only remove button | Removes it. Focus moves to the fallback (the label, or `focusFallback`)                       | `tag.test.tsx › removing the only tag focuses the fallback, never body`          |
| Enter / Space      | on Clear all              | Removes every tag. Focus moves to the fallback                                                | `tag.test.tsx › Clear all focuses the fallback`                                  |
| Delete / Backspace | on a remove button        | Nothing: the keys are not taken                                                               | `tag.test.tsx › Delete and Backspace on a remove button remove nothing`          |

## Focus management

- Initial focus: not moved. Adding a tag never moves focus.
- Focus never lands on `body` (2.4.3): every removal ends on a remove button or the fallback. The fallback is the label (it gets `tabindex="-1"` when it is first used) or the element `focusFallback` returns.
- The consumer's state must change in the same event as `onRemove`: focus is placed after the render that follows the click. A removal (or Clear all) the consumer refuses leaves focus where it was and announces nothing (`tag.test.tsx › a removal the consumer refuses leaves focus where it was and announces nothing`, `› Clear all refused by the consumer leaves focus where it was`).
- `Tag.Remove` must be inside a `TagGroup.Root`: outside it throws, because focus could not be managed (`› Tag.Remove outside a TagGroup throws…`).
- A group needs a `TagGroup.Label` or a `focusFallback`; with neither, a dev warning says so (`› warns in development when a group has neither a label nor a focusFallback`).
- `focusFallback` must return a focusable element (a button, or `tabindex="-1"`). If it can't take focus, the label is used and a dev warning is logged (`› a focusFallback that cannot take focus falls back to the label and warns`).
- Trap: no. Restore to: not applicable.

## Announcements

| Event                         | Message key (i18n)                               | Politeness                                    |
| ----------------------------- | ------------------------------------------------ | --------------------------------------------- |
| A tag is removed              | `tag.removed`                                    | polite, unless `announceRemoval={false}`      |
| A filter is removed (pattern) | `filters.removedResultCount` (removal and count) | polite, by the consumer, after results settle |
| Clear all (pattern)           | `filters.clearedResultCount`                     | polite, by the consumer                       |

The live region keeps only the last message, so the filter pattern sets `announceRemoval={false}` and says one combined message. Clear all announces nothing by itself.

## Consumer responsibilities

- **Words, always.** A tag says its fact in text: `År: 2025`, not `2025`, so it is clear out of context (`filters.appliedValue`).
- **Keep the visible text and the name equal.** Pass `label` when `children` is richer than a string (2.5.3).
- **Change the tags in `onRemove`, synchronously.** Announce a combined message, as the "Filter a list" pattern does, when other content changes with the removal (4.1.3).
- **Selectable filters are checkboxes** (CheckboxGroup), not a tag state. A Badge is never put in a TagGroup.
- **Long text wraps** and is never truncated.

## Visual / modes

Headless: no CSS. With `@kvirn-ui/theme/theme.css`, a static `kv-tag` is a `surface` chip with a decorative `border-subtle` hairline, no cross and no hover. A removable chip is `kv-tag-remove`: a `surface` button with a `border-control` edge (1.4.11), a cross drawn with borders, a 44px minimum height (32px in compact: 2.5.8), a hover fill and the focus ring (2.4.7). Text is `text` on `surface`, measured by `theme:check` (1.4.3). In forced colours the edge is `ButtonText` (`Highlight` on hover) and the cross, being borders, shows. Nothing is shown by fill alone (1.4.1). Long text wraps (1.4.10); RTL uses logical properties; there is no motion.

## WCAG SCs covered

- 1.3.1 Info and Relationships: a list of items under a name (`tag.test.tsx › the list is named by the label and is not rendered while empty`).
- 2.4.3 Focus Order: focus never lands on `body` (the Enter / Space and Clear all rows).
- 2.4.7 Focus Visible: the theme's focus ring on the button.
- 2.5.3 Label in Name: `tag.test.tsx › the remove button's name contains its visible text`.
- 2.5.8 Target Size: the whole chip is the target.
- 4.1.2 Name, Role, Value: a native button with a name (axe test).
- 4.1.3 Status Messages: `tag.test.tsx › removing a tag announces tag.removed` and `announceRemoval={false}` says nothing.

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
