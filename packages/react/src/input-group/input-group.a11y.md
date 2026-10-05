# Accessibility contract: InputGroup (Root, Addon)

- **APG pattern:** none. An input group is a visual wrapper around a native text input. The name, description and state come from HTML and the Field (`field.a11y.md`, `text-input.a11y.md`). A Button inside it follows the APG Button pattern (`button.a11y.md`).
- **Deviations:** none from APG. Decisions (forms skill): Addons are visual only and `aria-hidden`, interactive add-ons are real Buttons directly in the Root, start and end follow DOM order.
- **Native elements used:** `<div>` (Root, no role), `<span>` (Addon, `aria-hidden`), the `<input>` (Input), and an optional `<button>` (Button) placed directly in the Root.
- **Status:** alpha candidate (Plan 0013, Phase 1b). Gates pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `input-group.test.tsx` next to this file. `input-group.stories.tsx` in `apps/storybook/src/components/input-group/`, and `AmountWithUnit` in `number-input.stories.tsx`.

An InputGroup puts a unit ("kr", "%", "km"), a decorative icon or a Button inside the input's box. The Root draws the box: the edge, the radius, the invalid and disabled state and the focus ring. Addons are visual only. The label always carries the meaning, so a screen-reader user never needs the Addon: "Månadshyra i kronor", never "Månadshyra" plus a "kr" Addon.

## Roles, states, properties

| Part                | Element / role                                      | ARIA / state                                                                                                             | Notes                                                                                                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| InputGroup.Root     | `<div>`, no role                                    | none. `data-invalid` and `data-disabled` from the nearest Field, `data-focus-visible` while the Input has keyboard focus | Class `kv-input-group`. Props: `invalid`, `disabled` (default: the Field's), `render`. No role: it holds one control, and an unnamed `group` would only add noise. Holds no form state                                                                                |
| InputGroup.Addon    | `<span>`, hidden from the accessibility tree        | `aria-hidden="true"`                                                                                                     | Class `kv-input-group-addon`. A short unit or a decorative Icon. Never focusable (a dev warning fires when it contains focusable content), never the only place a meaning lives. At the start when it comes first in the DOM, and on the right in RTL. No `side` prop |
| the Input           | `<input>` (`text-input.a11y.md`)                    | as in `text-input.a11y.md`. The Addon's text is **not** in its name or description                                       | Width classes stay on the Input. The Input has no edge or ring of its own: the Root draws them                                                                                                                                                                        |
| a Button (optional) | `<button>` (`button.a11y.md`), directly in the Root | its own name and Tab stop                                                                                                | Never inside an Addon. A text Button's name is its visible text ("Rensa"). An icon-only Button has an `aria-label` from your translations ("Rensa sökningen")                                                                                                         |
| `useInputGroup`     | the same attributes, for your own elements          | `rootProps`, `addonProps`                                                                                                | Options: `invalid`, `disabled`. Also returns `isInvalid`, `isDisabled`, `isFocusVisible`. Spread `rootProps` on the box and `addonProps` on each Addon                                                                                                                |

Rules, tested in `input-group.test.tsx`:

- **Addons are `aria-hidden="true"`** and are never in the Input's accessible name or description. A unit shown in the box is also said by the label or a help text, a `Field.Prose` in the Field (if the Addon were linked to the Input, users would hear a unit the label already says, twice).
- **Clicking an Addon, or the Root's padding, focuses the Input** (`mousedown` on the box, outside any control inside it). The whole box is one target, and the keyboard reaches the Input directly, so no key is needed for it. Disabled groups don't move focus.
- **Dev warning on a mismatch:** when the Root's own `invalid` or `disabled` disagrees with the Input inside it (`aria-invalid`, `:disabled`), a warning fires once (`input-group-invalid-mismatch`, `input-group-disabled-mismatch`). Without own props the Root follows the Field, and nothing is compared.
- **Field state on the Root:** `data-invalid` and `data-disabled` come from the nearest Field (or the Root's own props). The Input keeps `aria-invalid` and native `disabled` from the Field: the theme draws the box from the Root's attributes and from `:has(> .kv-input…)`, so it doesn't wait for JavaScript.
- **`data-focus-visible` is set only while the Input has keyboard focus.** Text inputs also match `:focus-visible` on a click, so the hook tracks whether the last interaction was a pointer or a key. Focus on a Button inside the Root doesn't set it: the Button draws its own ring.
- **A Button keeps its name and its Tab stop.** Tab goes Input, then Button, in DOM order.
- **`render` on both parts,** with class and handlers merged, and refs merged.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

| Key           | Context          | Action                                                                                  | Test                                                                                                                                                                                                    |
| ------------- | ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab           | before the group | Moves focus into the input. The Addons are skipped                                      | `input-group.test.tsx › Tab goes to the input, then to the Button, and Shift+Tab goes back`                                                                                                             |
| Tab           | in the input     | Moves focus to the Button when the group has one, otherwise out of the group            | `input-group.test.tsx › Tab goes to the input, then to the Button, and Shift+Tab goes back`, `input-group.test.tsx › the Addon is never a Tab stop: Tab from the Input leaves a group without a Button` |
| Shift+Tab     | on the Button    | Moves focus back to the input                                                           | `input-group.test.tsx › Tab goes to the input, then to the Button, and Shift+Tab goes back`                                                                                                             |
| Enter / Space | on the Button    | Activates the Button (native), for example clearing the search                          | `input-group.test.tsx › Enter and Space on the Button activate it`                                                                                                                                      |
| any character | in the input     | Types it. Nothing is filtered, and a unit typed in the box is fine (the form parses it) | `input-group.test.tsx › any character types, and the unit can be typed too`                                                                                                                             |

Escape, arrow keys and Home / End keep the native text-field behaviour in the input. The Addons handle no keys and are never focusable.

## Pointer

A click is not a key, so it isn't in the Keyboard table. Clicking an Addon, or the box's padding, focuses the Input (the Addon isn't a control), and the keyboard reaches the Input directly with Tab. A disabled box ignores the click. Tested in `input-group.test.tsx › clicking an Addon focuses the Input`.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable. A clear Button that disappears when the box is empty is the consumer's: on activation, empty the value and move focus to the Input, so focus never lands on `body` (`input-group.stories.tsx › SearchWithClear`).
- Never obscured by: the focus ring is drawn around the whole box, outside it, and the Root has no overflow, so nothing clips it (2.4.11, 2.4.13). On a Button the ring is on the Button only. Consumers with a sticky header set `scroll-padding`.

## Announcements

None. Nothing is live. The Input's name, description and state are read on focus, as in `text-input.a11y.md`. Clearing a search announces nothing: the focused, empty Input is read as such.

## Consumer responsibilities

- **The label says the unit:** "Månadshyra i kronor", "Arbetstid i procent av heltid". An Addon is a visual repeat, never the only place a meaning lives (1.1.1, 3.3.2).
- **Addon text is a symbol or a widely known abbreviation,** at most 4 characters (`kr`, `€`, `%`, `km`, `m²`). Every Addon string comes from your translations, even `%`.
- **One Addon per side at most.** An icon Addon repeats something the label already says (a search, a date) and never looks like it does something it doesn't. A calendar icon is decorative until a date picker exists: it focuses the Input, nothing more.
- **Interactive add-ons are Buttons placed directly in `InputGroup.Root`,** never inside an Addon. Give each a visible text name or, if it is icon-only, an `aria-label` from your translations. Disable the Button when the Field is disabled.
- **`invalid` and `disabled` on the Root change only the box's look** (the edge, and a disabled box ignores clicks). They don't mark the Input: set `aria-invalid` and native `disabled` on it too (3.3.1, 4.1.2), or put the group in a Field, which sets both. A dev warning fires when they disagree.
- **A clear Button renders only while there's a value,** and on activation empties the value and moves focus to the Input. Don't add a clear Button to a read-only group.
- **Don't set `inputMode="numeric"` on a date field with separators:** the iOS number pad has no "-" or ".".
- Everything in `text-input.a11y.md` and `field.a11y.md` still applies: a visible label, `autocomplete`, errors in text, never blocking paste.

## Visual / modes

- Focus indicator: a 2px `focus-ring` outline, 2px offset, around the whole Root when the Input has keyboard focus (`[data-focus-visible]`, or `:has(> .kv-input:focus-visible)` before the script runs), and around the Button only when the Button has it. A click in the Input shows focus as the Root's 2px `border-focus` edge, with no ring. The Input inside has no ring of its own.
- Target size: the Root is 44px high (32px in `kv-compact` from 64rem), and the whole box is the click target for the Input. A Button in the group is 44×44px at least (32×32px compact), above 24×24px (2.5.8). An Addon makes the box larger, never smaller.
- Colour: the edge is `border-control` (3:1), 2px `danger` when invalid (never colour alone: the message under the group and its 2px width carry it), dashed when disabled. Addon text and icon are `text` (`text-muted` when disabled). The Button's divider is `border-control`. Every pair is already in `theme:check`.
- forced-colors behaviour: Root edge `ButtonBorder`, invalid `CanvasText` at 2px, disabled dashed `GrayText`, the focus outline `Highlight` and, on any focus in the Input, the edge `Highlight` at 1px, Addon `FieldText`, the Button's label `ButtonText` and its divider `ButtonText`.
- reduced-motion behaviour: the Root's border and fill and the Button's fill transition only under `no-preference`. The focus ring appears instantly.
- Reflow: the Root never exceeds its column (`max-inline-size: 100%`). The Input shrinks, Addons and the Button don't. At 320px with a Finnish label there's no horizontal scrolling (`reflow-320`). The text Button is one short word, or icon-only where the label is long.
- 1.4.12 text spacing: no fixed heights, and the Addon is centred with flex, so it isn't clipped.
- RTL: logical properties only. A start Addon is on the right, the divider and the Button's rounded corners swap, and icons in Addons don't mirror.

## WCAG SCs covered

- 1.1.1 Non-text Content: the icon Addon is decorative (`aria-hidden`), and the label says what it shows.
- 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value: the Input is named by its label, with no extra role or name from the wrapper.
- 1.4.1 Use of Color, 1.4.11 Non-text Contrast: the edge, the invalid width and the dashed disabled edge, never colour alone.
- 2.1.1 Keyboard, 2.4.3 Focus Order: Tab goes Input, then Button. Nothing is focusable in an Addon.
- 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance: a 2px ring that is never clipped.
- 2.5.3 Label in Name: a text Button's name is its visible text.
- 2.5.8 Target Size (Minimum): the box and the Button are at least 32px, 44px by default.
- 3.3.2 Labels or Instructions: the label carries the unit.

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

Research questions for the AT run: do screen-reader users know the unit from the label alone, with the Addon hidden? Is a screen reader's "click" or touch exploration on the Addon harmless? Do users type the unit ("kr", "%") anyway? Does a Voice Control user reach the clear Button by its visible name?

## Known issues

- **Autofill covers only the Input.** The browser's autofill fill doesn't paint behind an Addon. Known browser behaviour, accepted.
- **A Button's transparent edges show in forced colours,** so it looks like a bordered button attached to the inside of the box. Accepted: it's the shape Contrast Themes users expect of a button.
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
