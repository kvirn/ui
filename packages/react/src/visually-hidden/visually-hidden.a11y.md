# Accessibility contract: VisuallyHidden

- **APG pattern:** none. WCAG technique C7 (hide text visually and keep it for assistive technology).
- **Deviations:** none
- **Native elements used:** `<span>`. The consumer can pick another with `as` (allowed elements below), and its own semantics apply.
- **Tests:** `visually-hidden.test.tsx` next to this file. `visually-hidden.stories.tsx` in `apps/storybook/src/components/visually-hidden/`.

VisuallyHidden is a span with a class, so the theme can clip it. It adds no role, ARIA, text or behaviour: its content stays in the accessibility tree and is read in the flow of the sentence.

## Roles, states, properties

| Part           | Element / role     | ARIA                     | Notes                                                                                                                                                                                             |
| -------------- | ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VisuallyHidden | `<span>` → no role | none                     | `class="kv-visually-hidden"`. Attributes (`id`, `aria-*`) and the ref reach the element unchanged. The text is yours                                                                              |
| VisuallyHidden | `as`               | the chosen element's own | One element, chosen with a string. `as="h2"` gives a heading nobody sees. A value outside the list is a type error and, in JavaScript, warns once in development and renders the default element. |

## Allowed elements

A tag outside the list changes the page's outline or meaning (1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)). `as` is a string, so it works from a Server Component.

| Part           | `as`                                       | Why                                                                                                                                                      |
| -------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VisuallyHidden | `span` (default), `div`, `p`, `h2` to `h6` | A hidden heading names a region in the outline; `div` and `p` hold block text. No `h1` (the page's title is visible), no landmark or interactive element |

## Keyboard

This component has no focusable parts and handles no keys.

| Key | Context        | Action                                     | Test                                                                                    |
| --- | -------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| –   | VisuallyHidden | Not a Tab stop: no `tabindex`, no handlers | `visually-hidden.test.tsx › VisuallyHidden › is not a Tab stop and adds only its class` |

## Focus management

- Initial focus: not moved. Trap: no. Restore to: not applicable.
- **Never put a focusable element inside it:** a control that takes focus and can't be seen fails 2.4.7 Focus Visible (AA). The bypass link is its own part, SkipLink.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

VisuallyHidden has no strings: its text is the consumer's. It is read as part of the page, not announced.

## Consumer responsibilities

- **Write the text in the page's language,** or put it in a nested `KvirnProvider` with `useLocale().localeProps` on your own element (3.1.2 Language of Parts (AA)).
- **Don't hide what everyone needs.** Text that only a screen reader gets is for context (a count, a status word, a name), not for instructions sighted users also need (3.3.2 Labels or Instructions (A): instructions go to all users, not only to those using assistive technology).
- **When hidden text is part of a control's name, start the name with the visible label** (2.5.3 Label in Name (A)), so people who use voice control can say what they see.

## Visual / modes

Headless: no CSS. With the default theme, the text is clipped to a tiny box and kept in the page, on one line. It is never `display: none` or `visibility: hidden`, which would remove it from the accessibility tree. The rule has no weight, so your own CSS wins. Forced colours, contrast, target size and motion: not applicable.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): context that sighted users get from the layout is also there for assistive technology, because the text stays in the accessibility tree (`visually-hidden.test.tsx`: its text stays in the accessibility tree).
- 4.1.2 Name, Role, Value (A): hidden text inside a control becomes part of the control's name (`visually-hidden.test.tsx › hidden text inside a control becomes part of the control’s name`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                              |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                    |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | visually-hidden.stories.tsx, every story, 4 themes                                                                 |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | visually-hidden.test.tsx › hidden text inside a control becomes part of the control’s name; expectNoA11yViolations |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | visually-hidden.test.tsx › is not a Tab stop and adds only its class                                               |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                        |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | n/a         | n/a         | n/a     | renders no visible part: its content is clipped away by design                                                     |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                    |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                    |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                    |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                    |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                    |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                    |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                    |

## Known issues

None.
