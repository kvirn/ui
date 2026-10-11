# Accessibility contract: Site search

- **APG pattern:** none: a native search landmark and form, with [Field](../../../../react/src/field/field.a11y.md), [TextInput](../../../../react/src/text-input/text-input.a11y.md), [ButtonGroup](../../../../react/src/button-group/button-group.a11y.md) and [Button](../../../../react/src/button/button.a11y.md).
- **Deviations:** none
- **Native elements used:** `<search>`, `<form method="get">`, `<label>`, `<input type="search">`, `<button type="submit">`.
- **Status:** alpha candidate (plan 0095). Manual AT is `pending`.
- **Tests:** none of its own: patterns aren't unit tested. WCAG is proved by axe in every story state in every theme (`site-search.stories.tsx`); the keys and parts are proved in the components' tests that the rows below name.

## Roles, states, properties

| Part         | Element / role                  | ARIA / state                        | Notes                                                                                |
| ------------ | ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `SiteSearch` | `<search>` (search landmark)    | none                                | Around a GET `<form>` to `action`. Proved by axe in the stories.                     |
| the field    | `<input type="search">`         | named by its `<label>` from `label` | The label is visually hidden: the button's word is the visible cue.                  |
| the strip    | `<div class="kv-button-group">` | no role: unnamed                    | Only joins the field and the button visually.                                        |
| the button   | `<button type="submit">`        | none                                | Its word, written as children, is its name and its text (2.5.3), never an icon alone |

`name` (default `q`) is the query parameter and `defaultValue` the query on the results page. The other props reach the `<search>`. The pattern has no strings: `label` and the button's word come from the caller.

## Keyboard

<!-- Format and rules: the `keyboard` skill. Shown on the Storybook Docs page. -->

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context    | Action                           | Test                                                              |
| ------------- | ---------- | -------------------------------- | ----------------------------------------------------------------- |
| Tab           | the field  | Moves focus to the Search button | `site-search.stories.tsx › Keyboard`                              |
| Shift+Tab     | the button | Moves focus back to the field    | `text-input.test.tsx › Tab moves through the inputs in DOM order` |
| Enter         | the field  | Submits the form (native)        | `site-search.stories.tsx › Keyboard`                              |
| Enter / Space | the button | Submits the form                 | `button.test.tsx › Enter on a submit button submits the form`     |

The pattern handles no key itself.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not needed.
- Never obscured by: nothing. A focused field is raised above the button so its ring shows in full.

## Announcements

None.

## Consumer responsibilities

- `label` and the button's word in the page's language, such as `Search the site` and `Search`.
- A results page that says how many results there are.

## Visual / modes

- Focus indicator: the token ring on the field and the button; on a `primary` band of the Site header it is `on-primary` (`focus-ring` is about 1:1 there).
- The field and the button keep their own tokens and look: one strip, the field's end corners squared.
- Target size: 44px controls (2.5.8).
- forced-colors behaviour: the field and the button keep their system edges.
- reduced-motion behaviour: nothing animates.
- RTL: logical properties; the button is at the inline end.

## WCAG SCs covered

1.3.1, 1.4.10, 1.4.11, 2.1.1, 2.4.7, 2.5.3, 2.5.8, 3.3.2, 4.1.2.

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
