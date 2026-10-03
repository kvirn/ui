# Developer warnings that exist

Each is a `warnOnce` call (see SKILL.md, Developer warnings). Format of the key is what dedupes it. All are development only.

## Wrong element or wrong place

| Where                                   | Fires when                                                           | Detected                      |
| --------------------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| `Button`                                | `render` produced something that is not a `<button>`                 | `ref.current.tagName`, effect |
| `Link`                                  | the registered component or `render` did not produce an `<a>`        | `ref.current.tagName`, effect |
| `Fieldset.Root`                         | `render` did not produce a `<fieldset>`                              | `ref.current.tagName`, effect |
| `Field.Label`                           | outside a Field                                                      | context is `null`             |
| `Field.ErrorMessage`                    | outside a Field or Fieldset (it then always shows)                   | context is `null`             |
| `Fieldset.Legend`                       | outside a Fieldset                                                   | context is `null`             |
| `InputGroup.Addon`                      | outside an `InputGroup.Root`                                         | context is `null`             |
| `OneTimeCode.Input`, `OneTimeCode.Slot` | outside a `OneTimeCode.Root`                                         | context is `null`             |
| any `FileUpload` part                   | outside `FileUpload.Root`, or an item part outside `FileUpload.Item` | context is `null`             |

## Missing accessible name or text

| Where                                  | Fires when                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Button`                               | the only content is hidden from assistive technology (a decorative `Icon`)                                                |
| `Input`, `Checkbox` and other controls | no label, `aria-label`, `aria-labelledby` or `title`. The text differs inside a Field (add `Field.Label`) and outside one |
| `OneTimeCode.Input`                    | no accessible name                                                                                                        |
| `Link`                                 | `target="_blank"` and no `Link.NewTabNotice` inside (once per link text)                                                  |
| `FileUpload.Trigger`                   | no element with the `triggerTextId`, so the name does not start with the visible text (2.5.3)                             |
| `Field` / `Fieldset`                   | `invalid` and no `ErrorMessage` rendered (3.3.1, 3.3.3), checked in a layout effect                                       |
| `Field` / `Fieldset`                   | two `ErrorMessage`s (they share one id)                                                                                   |
| masked `Input`                         | in a Field with no hint (3.3.2)                                                                                           |
| `OneTimeCode.Input`                    | in a Field with no hint                                                                                                   |
| `FileUpload`                           | `accept`, `maxFiles` or `maxFileSize` set and no `FileUpload.Limits` or hint; or outside a Field                          |

## Wrong props or values

| Where                                        | Fires when                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `mergeProps`                                 | two different `id`s                                                                                                      |
| `Input`                                      | `type="number"` or `type="date"`. The date text says "Use DateInput", which does not exist yet                           |
| `Input`, `OneTimeCode.Input`, other controls | an `id` inside a Field (ignored: use `controlId` on the Field)                                                           |
| `Input`                                      | a mask other than `masks.email()` on `type="email"` (no caret restore is possible)                                       |
| `OneTimeCode.Root`                           | fewer `OneTimeCode.Slot`s than pattern positions                                                                         |
| `InputGroup.Addon`                           | contains focusable content                                                                                               |
| messages                                     | an empty override (falls through); a missing translation for a non-`en` locale                                           |
| `Announcer` use                              | no `KvirnProvider`: `useAnnouncer` warns once and does nothing; a mask without one warns on the first refused character  |
| `FileUpload`                                 | the browser cannot set the native input's `files` through `DataTransfer`; `Trigger` activated with no `FileUpload.Input` |

## Throws instead of warns

- `masks.oneTimeCode({ pattern })` and `OneTimeCode.Root pattern`: an invalid pattern throws a `RangeError`, in production too.
