# Accessibility contract: Site footer

- **APG pattern:** none: native landmarks, [SummaryList](../../../../react/src/summary-list/summary-list.a11y.md), [Address](../../../../react/src/address/address.a11y.md) and the [List](../../../../react/src/list/list.a11y.md).
- **Deviations:** none
- **Native elements used:** `<footer>` (contentinfo), `<h2>`, `<dl>`, `<address>`, `<nav aria-labelledby>`, `<ul>`, `<a href>`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** the pattern adds no behaviour: the shipped parts' tests prove the links and `site-footer.stories.tsx` (axe, every theme) the composition. `site-footer.stories.tsx` in `apps/storybook/src/patterns/site-chrome/`.

## Roles, states, properties

| Part                      | Element / role              | ARIA / state                       | Notes                                                                              |
| ------------------------- | --------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `SiteFooter.Root`         | `<footer>` (contentinfo)    | none                               | One per page, outside `main`                                                       |
| `SiteFooter.Organisation` | `<p>`                       | none                               | The organisation's name and address, as text                                       |
| contact column            | `<h2>`, `<dl>`, `<address>` | none                               | `SummaryList` rows (phone `tel:`, e-mail `mailto:`, hours) and an `Address`        |
| link group                | `<nav>`                     | `aria-labelledby` the group's `h2` | A `nav` around a `Heading` (`h2`) and a `List.Root`. Each name is distinct (2.4.1) |

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key       | Context       | Action                               | Test                                                 |
| --------- | ------------- | ------------------------------------ | ---------------------------------------------------- |
| Tab       | in the footer | Moves through the links in DOM order | `link.test.tsx › Tab moves focus to the link`        |
| Shift+Tab | in the footer | Moves back through the links         | `link.test.tsx › Shift+Tab moves focus off the link` |

The footer handles no other key.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing is sticky; there is no back-to-top link.

## Announcements

None.

## Consumer responsibilities

- The organisation line, the contact details and the headings of your own groups (`Följ Kvirnby`) are the site's text, written as children. Give each `nav` an `aria-labelledby` that points at its `Heading`, with an `id` of your own.

## Visual / modes

- Focus indicator: the token ring on every link and button.
- Target size: at least 24px (2.5.8).
- forced-colors behaviour: sections keep a `CanvasText` border; links are `LinkText`.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the row starts at the right.

## WCAG SCs covered

1.3.1, 1.4.10, 2.4.1, 2.4.4, 2.5.8, 3.1.1.

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
