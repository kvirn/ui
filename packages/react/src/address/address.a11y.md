# Accessibility contract: Address

- **APG pattern:** none. Address is static content, not a widget.
- **Deviations:** none
- **Native elements used:** `<address>`. No `as`: the element is the semantics.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `address.test.tsx` next to this file. `address.stories.tsx` in `apps/storybook/src/components/address/`.

Address is the native `<address>` element with a class, so the theme can undo the browser's italic. It adds no role, ARIA, text or behaviour. `<address>` has the `group` role in some browsers and none in others, and a screen reader reads its text as part of the page.

## Roles, states, properties

| Part    | Element / role                 | ARIA                        | Notes                                                                                                                                             |
| ------- | ------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Address | `<address>` → native semantics | none                        | `class="kv-address"`. Attributes (`id`, `aria-*`) and the ref reach the element unchanged. Links inside it are ordinary links with their own text |
| Address | never                          | no `role`, `tabindex`, name | It needs no accessible name: a screen reader reads its content in the flow. Don't add `aria-label`, which `address` doesn't reliably expose       |

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context | Action                                                   | Test                                   |
| --------- | ------- | -------------------------------------------------------- | -------------------------------------- |
| Tab       | Address | Not a Tab stop: no `tabindex`, no handlers               | `address.test.tsx › is not a Tab stop` |
| Shift+Tab | Address | Not a Tab stop. Links inside it follow the Link contract | `address.test.tsx › is not a Tab stop` |

## Focus management

- Initial focus: not moved. Address never moves focus.
- Trap: no.
- Restore to: not applicable.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Address renders no text, so it has no message keys.

## Consumer responsibilities

- **Use it for contact details of the page or the article around it only** (1.3.1). Other postal-looking text is plain text.
- **Say what each address is.** Separate a visiting address and a postal address, with a label in words, never by position or colour alone (1.3.3).
- **Link text names the target.** A `tel:` link has the number as its text and a `mailto:` link has the email address, so the link makes sense out of context (2.4.4).
- **Language.** Text in another language goes in a nested `KvirnProvider`, with `useLocale().localeProps` on your own element (3.1.2).

## Visual / modes

Headless: Address ships no CSS. With `@kvirn-ui/theme/theme.css`, `kv-address` shows the address in upright text at the body text size and line height. Browsers set `address` in italic, and long italic text is harder to read, so the theme undoes it. Sizes are in rem (1.4.4). Target size and focus indicator belong to the links inside. Motion: none.

## WCAG SCs covered

- 1.3.1 Info and Relationships: contact details are marked up as `<address>` (`address.test.tsx › renders an address element…`).
- 1.4.4 Resize Text: the size is in rem.

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Known issues

None.
