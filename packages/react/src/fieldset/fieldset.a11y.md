# Accessibility contract: Fieldset (Fieldset.Root, Fieldset.Legend, Fieldset.ErrorMessage, and Fieldset.Prose as the hint)

- **APG pattern:** none. A fieldset is native HTML: `<fieldset>` with a `<legend>` is the group's name, and the browser maps it to the `group` role.
- **Deviations:** none from APG. Decisions (forms skill): parts, wiring, nesting, the legend marker, the default order, several hints, and a Prose in a Fieldset is the group's description (there is no Fieldset.Description).
- **Native elements used:** `<fieldset>` (Fieldset.Root), `<legend>` (Fieldset.Legend), `<p>` (Fieldset.ErrorMessage, which behaves like Field.ErrorMessage), a `<div class="kv-prose">` for the hint (Fieldset.Prose), and a `<span>` for the optional marker.
- **Status:** alpha candidate (Plan 0013, Phases 1 and 1b). Accessibility-reviewer pending for Phase 1b. Manual AT is `pending`.
- **Tests:** `fieldset.test.tsx` next to this file. `fieldset.stories.tsx` and `fieldset.e2e.ts` in `apps/storybook/src/components/fieldset/`.

A Fieldset groups related questions or the options of one question. Its legend is the group's name, and its hint (`Fieldset.Prose`) and error are the group's. Checkbox groups, radio groups and the date input (later phases) are built on it.

## Roles, states, properties

| Part                  | Element / role                                             | ARIA / state                                                                                                                                                            | Notes                                                                                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fieldset.Root         | `<fieldset>` → `group`                                     | `aria-describedby` = every description id in DOM order, then the error id, only for parts rendered. Native `disabled`. `data-invalid`, `data-required`, `data-disabled` | Class `kv-fieldset`. Props: `invalid`, `required`, `disabled`, `group`, `messages`. `render` must stay a `<fieldset>`. No `aria-invalid`: ARIA doesn't support it on `group`, so the error reaches users through the description. `disabled` disables every control inside (native) |
| Fieldset.Legend       | `<legend>`, the group's name                               | `data-invalid`, `data-required`, `data-disabled`                                                                                                                        | Class `kv-fieldset-legend`. Takes `marker`: appends `<span class="kv-field-optional">(valfritt)</span>` when `optional`. Default `optional` in a `group` fieldset that isn't `required`, and `none` in a plain Fieldset                                                             |
| Fieldset.Prose        | `<div class="kv-prose" id>`, or the element `render` gives | In the fieldset's `aria-describedby`, in DOM order, before the error. `data-invalid`, `data-disabled`                                                                   | A `Fieldset.Prose` inside a Fieldset, and not inside a Field in it, registers itself and describes the group. Several are allowed, each with its own id. There is no `Fieldset.Description`                                                                                         |
| Fieldset.ErrorMessage | `<p id>`, only while the fieldset is invalid               | In the fieldset's `aria-describedby`, after every description. `data-invalid`                                                                                           | Class `kv-field-error-message`. The same prefix and icon as Field's                                                                                                                                                                                                                 |
| `useFieldset`         | the same attributes, for your own elements                 | `fieldsetProps`, `legendProps`, `descriptionProps`, `getDescriptionProps(name)`, `errorMessageProps`                                                                    | Options: `invalid`, `required`, `disabled`, `hasDescription`, `descriptions` (names, in render order), `hasErrorMessage` (default: `invalid`), `group`, `marker`, `messages`. Also returns `optionalMarker` and `errorPrefix`                                                       |

Rules, tested in `fieldset.test.tsx`:

- The legend is the first child of the fieldset in the DOM (the browser needs this for the name).
- A Fieldset's `invalid` marks its own parts only. It doesn't pass down to the Fields inside, so a group error doesn't mark every control (`fieldset.test.tsx › invalid does not cascade: the Fields inside stay valid`).
- A Field inside a `group` fieldset defaults to `marker="none"`: an option or a date box is never "(optional)". The group's legend carries the marker instead, when the group isn't `required` (`fieldset.test.tsx › marker defaults in a group`).
- A plain Fieldset only groups questions (for example an address), so its legend has no marker, and its Fields mark themselves.
- Nested fieldsets: the nearest Fieldset's text parts win, and a plain Fieldset inside a group fieldset stops the group defaults.
- A Prose and the Fieldset.ErrorMessage attach to the nearest Field or Fieldset, as in `field.a11y.md`: a Prose in a Field in the Fieldset describes that Field's control, not the group (`prose.test.tsx › a Prose in a Field inside a Fieldset describes the Field’s control, not the group`).
- A `Fieldset.Prose` in a Fieldset is the group's description (`prose.test.tsx › a Prose in a Fieldset describes the group`). It is the Prose's **text content**: a heading, list or link inside it is read as plain text, so keep a hint short. A Prose that isn't a hint goes outside the Fieldset.
- Several hints are listed in DOM order, then the error, each with its own id. A second Fieldset.ErrorMessage gives a dev warning (`fieldset.test.tsx › several descriptions`). `useFieldset({ descriptions })` and `getDescriptionProps(name)` give the same markup on the server.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Fieldset handles no keys and moves no focus. A group's keys come from its controls (`input.a11y.md`, and later the checkbox and radio contracts). Enter, Space, Escape, the arrow keys, Home and End are not handled by Fieldset.

| Key             | Context                | Action                                                                                         | Test                                                                                                                                                    |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Fieldset with controls | Moves through the controls in DOM order. The fieldset, legend, hint and error aren't Tab stops | `fieldset.e2e.ts › Tab moves through the controls in DOM order`, `fieldset.e2e.ts › Tab never stops on the fieldset, its legend, its hint or its error` |
| –               | `fieldset[disabled]`   | Disabled controls inside are skipped (native)                                                  | `fieldset.test.tsx › disabled disables every control inside, natively`, `fieldset.e2e.ts › Tab skips the controls of a disabled fieldset (native)`      |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- On error: Fieldset never moves focus. The error summary block (M4) will, and until then the consumer moves focus to the first invalid control.
- Never obscured by: Fieldset renders no overlay.

## Announcements

| Event                  | Message key (i18n)  | Politeness                                                                                                  |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| An error appears       | none                | None: errors are not live regions                                                                           |
| Focus enters the group | none                | Screen readers announce the legend, "group", and in most cases the description and error (see Known issues) |
| The error text is read | `field.errorPrefix` | Part of the message: "Fel: Välj hur länge du behöver tillståndet" (3.3.1)                                   |
| The legend is read     | `field.optional`    | Part of the name when the marker shows: "Hur ska vi kontakta dig? (valfritt)" (3.3.2)                       |

Message keys are the Field's (`field.optional`, `field.errorPrefix`), resolved the same way: the part's children, then `<Fieldset.Root messages>` or `useFieldset({ messages })`, then the provider, then `en`.

## Consumer responsibilities

- Give every fieldset a Fieldset.Legend that asks the question or names the group. Put the Fieldset.Legend first inside the Fieldset.
- A legend that is the page's heading: `<Fieldset.Legend className="kv-fieldset-legend--heading"><h1>…</h1></Fieldset.Legend>` (design spec: `docs/design/form-fields.md` §6.2).
- Use a Fieldset for options and for one question asked in several controls. Don't wrap every Field in one: a fieldset announces itself, and nested ones get noisy.
- Set `invalid` and render a Fieldset.ErrorMessage together, with plain text that says what's wrong and how to fix it (3.3.1, 3.3.3).
- Set `group` on a Fieldset that holds options or the parts of one answer, so its Fields drop the optional marker and its legend takes it.
- Mark which individual Fields inside are wrong with the Fields' own `invalid`: the Fieldset's doesn't cascade.

## Visual / modes

- Focus indicator: on the controls inside. The fieldset has none.
- Target size: no interactive area of its own.
- Colour: the legend, hint and marker are `text`, the error `danger` with a prefix and an icon (1.4.1).
- forced-colors behaviour: nothing depends on colour. The error is `CanvasText` (`fieldset.e2e.ts › forced colours: the error message stays visible`).
- reduced-motion behaviour: none.
- Reflow: `min-inline-size: 0` on the fieldset, and the legend wraps, so a long Finnish legend never causes horizontal scrolling at 320px (`fieldset.e2e.ts › no horizontal scrolling at 320px with the Finnish legend and labels (1.4.10)`).
- RTL: logical properties only.

## WCAG SCs covered

- 1.3.1 Info and Relationships: native `<fieldset>`/`<legend>`, the group's description and error in its accessible description (`fieldset.test.tsx › wiring: name and description per state`).
- 1.4.1 Use of Color: the error has a prefix and an icon.
- 2.5.3 Label in Name: the visible legend text, with the marker, is the group's name.
- 3.3.1 Error Identification, 3.3.2 Labels or Instructions, 3.3.3 Error Suggestion: as for Field.
- 4.1.2 Name, Role, Value: native `group`, with a name and a description.

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

Research question for the AT run: is the group's description and error announced on entering the group in each screen reader?

## Known issues

- **`aria-describedby` on a `<fieldset>` isn't announced consistently by TalkBack.** NVDA, JAWS and VoiceOver announce it when the user enters the group (as on GOV.UK). The manual AT run checks all four.
- **`se` (Northern Sámi) is a placeholder. Blocks `beta`.** See `field.a11y.md`.
- **WebKit not run locally.** CI runs the `webkit` and `mobile-safari` projects.
