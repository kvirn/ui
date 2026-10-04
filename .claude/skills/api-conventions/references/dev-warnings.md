# Developer warnings that exist

Each is a `warnOnce` call (see SKILL.md, Developer warnings). Format of the key is what dedupes it. All are development only.

## Wrong element or wrong place

| Where                                              | Fires when                                                                                                                                                                              | Detected                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `Button`                                           | `render` produced something that is not a `<button>`                                                                                                                                    | `ref.current.tagName`, effect              |
| `Toggle`                                           | `render` produced something that is not a `<button>` (`toggle-not-a-button:<element>`)                                                                                                  | `ref.current.tagName`, effect              |
| `Link`                                             | the registered component or `render` did not produce an `<a>`                                                                                                                           | `ref.current.tagName`, effect              |
| `Fieldset.Root`                                    | `render` did not produce a `<fieldset>`                                                                                                                                                 | `ref.current.tagName`, effect              |
| `Field.Label`                                      | outside a Field                                                                                                                                                                         | context is `null`                          |
| `Field.ErrorMessage`                               | outside a Field or Fieldset (it then always shows)                                                                                                                                      | context is `null`                          |
| `Fieldset.Legend`                                  | outside a Fieldset                                                                                                                                                                      | context is `null`                          |
| `Field.Hint` (and the group aliases)               | outside a Field or Fieldset (`hint-outside-field`)                                                                                                                                      | host context is `null`                     |
| `Field.Hint` (and the group aliases)               | before its control in the DOM (`hint-before-control:<text>`)                                                                                                                            | `compareDocumentPosition`, effect          |
| `InputGroup.Addon`                                 | outside an `InputGroup.Root`                                                                                                                                                            | context is `null`                          |
| `OneTimeCode.Input`, `OneTimeCode.Slot`            | outside a `OneTimeCode.Root`                                                                                                                                                            | context is `null`                          |
| any `FileUpload` part                              | outside `FileUpload.Root`, or an item part outside `FileUpload.Item`                                                                                                                    | context is `null`                          |
| `Toolbar.Button`, `Toolbar.Toggle`, `Toolbar.Item` | outside a `Toolbar.Root` (`toolbar-<part>-outside-root`)                                                                                                                                | context is `null`, effect                  |
| `Toolbar.Item`                                     | `render` produced an element that is not focusable by itself, so keyboard users cannot operate it (`toolbar-item-not-focusable:<tag>`)                                                  | `isFocusableByItself(element)`, effect     |
| `Toolbar.Item`                                     | `render` produced an element that is natively disabled, so it can't take focus and the arrows skip it (`toolbar-item-natively-disabled:<tag>`). Not for `focusableWhenDisabled={false}` | `hasAttribute('disabled')`, effect         |
| `Listbox.Root`                                     | renders its native `<select>` inside a `Toolbar.Root`, which drops the children, so the `Toolbar.Item` and the trigger's name are gone (`listbox-native-in-toolbar`)                    | `isNative` and the toolbar context, effect |

## Missing accessible name or text

| Where                                      | Fires when                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                   | the only content is hidden from assistive technology (a decorative `Icon`)                                                |
| `Toggle`                                   | the only content is hidden from assistive technology, such as a decorative `Icon` (`toggle-without-name`)                 |
| `Toolbar.Root`                             | no `aria-label` or `aria-labelledby` (`toolbar-without-name`)                                                             |
| `ButtonGroup`                              | in a `Toolbar.Root` with no `aria-label` or `aria-labelledby` (`button-group-in-toolbar-without-name`)                    |
| `TextInput`, `Checkbox` and other controls | no label, `aria-label`, `aria-labelledby` or `title`. The text differs inside a Field (add `Field.Label`) and outside one |
| `OneTimeCode.Input`                        | no accessible name                                                                                                        |
| `Link`                                     | `target="_blank"` and no `Link.NewTabNotice` inside (once per link text)                                                  |
| `FileUpload.Trigger`                       | no element with the `triggerTextId`, so the name does not start with the visible text (2.5.3)                             |
| `Field` / `Fieldset`                       | `invalid` and no `ErrorMessage` rendered (3.3.1, 3.3.3), checked in a layout effect                                       |
| `Field` / `Fieldset`                       | two `ErrorMessage`s (they share one id)                                                                                   |
| masked `TextInput`                         | in a Field with no hint or description (3.3.2). Any `Field.Hint` or `Field.Prose` clears it                               |
| `OneTimeCode.Input`                        | in a Field with no hint                                                                                                   |
| `FileUpload`                               | `accept`, `maxFiles` or `maxFileSize` set and no `FileUpload.Limits` or hint; or outside a Field                          |

## Wrong props or values

| Where                                            | Fires when                                                                                                                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mergeProps`                                     | two different `id`s                                                                                                                                                                                                               |
| `TextInput`                                      | `type="number"` or `type="date"`. The number text says "Use NumberInput", the date text "Use DateInput"                                                                                                                           |
| `TextInput`, `OneTimeCode.Input`, other controls | an `id` inside a Field (ignored: use `controlId` on the Field)                                                                                                                                                                    |
| `TextInput`                                      | a mask other than `masks.email()` on `type="email"` (no caret restore is possible)                                                                                                                                                |
| `NumberInput`                                    | no accessible name; an `id` inside a Field; `decimals` above 0 in a Field with no hint (`number-input-*`; a whole number needs no hint); a custom `mask` in a Field with no hint (`number-input-mask-without-description`, 3.3.2) |
| `Toolbar.Root`                                   | fewer than three controls: APG says a toolbar is for three or more (`toolbar-with-few-controls`, once the items have registered)                                                                                                  |
| `Textarea`                                       | no accessible name; an `id` inside a Field (`Textarea-*`); `characterCount` without `maxLength` (`textarea-character-count-without-limit`); a count with a limit below 1 (`character-count-invalid-limit`, `CharacterCount`)      |
| `OneTimeCode.Root`                               | fewer `OneTimeCode.Slot`s than pattern positions                                                                                                                                                                                  |
| `InputGroup.Addon`                               | contains focusable content                                                                                                                                                                                                        |
| messages                                         | an empty override (falls through); a missing translation for a non-`en` locale                                                                                                                                                    |
| `Announcer` use                                  | no `KvirnProvider`: `useAnnouncer` warns once and does nothing; a mask without one warns on the first refused character                                                                                                           |
| `FileUpload`                                     | the browser cannot set the native input's `files` through `DataTransfer`; `Trigger` activated with no `FileUpload.Input`                                                                                                          |

## Tooltip

| Where             | Fires when                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tooltip.Trigger` | the control has no accessible name of its own: a tooltip is never the only name, and a `title` doesn't count (`tooltip-trigger-without-name`, 4.1.2, 2.5.3, effect) |
| `Tooltip.Popup`   | it holds interactive content: a link, a button, a field or anything with a `tabindex` (`tooltip-interactive-content`, 1.4.13, 2.1.1, effect). A Popover is for that |
| `Tooltip.*`       | a part outside a `Tooltip.Root` (`tooltip-<part>-outside-root`, effect)                                                                                             |

## Throws instead of warns

- `masks.oneTimeCode({ pattern })` and `OneTimeCode.Root pattern`: an invalid pattern throws a `RangeError`, in production too.
