# Accessibility contract: Fieldset (Fieldset.Root, Fieldset.Legend, Fieldset.ErrorMessage, Fieldset.Prose as the description and Fieldset.HelpText as the help text)

- **APG pattern:** none. A fieldset is native HTML: `<fieldset>` with a `<legend>` is the group's name, and the browser maps it to the `group` role.
- **Deviations:** none from APG. A Prose in a Fieldset is the group's description (there is no Fieldset.Description), and the group's help text is `Fieldset.HelpText`.
- **Native elements used:** `<fieldset>` (Fieldset.Root), `<legend>` (Fieldset.Legend), `<p>` (Fieldset.ErrorMessage, which behaves like Field.ErrorMessage), a `<div class="kv-prose">` for the description (Fieldset.Prose), a `<p class="kv-field-help-text">` for the help text (Fieldset.HelpText), and a `<span>` for the optional marker.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `fieldset.test.tsx` next to this file. `fieldset.stories.tsx` in `apps/storybook/src/components/fieldset/`.

A Fieldset groups related questions or the options of one question. Its legend is the group's name, and its description (`Fieldset.Prose`), help text (`Fieldset.HelpText`) and error are the group's. Checkbox groups, radio groups and the date input are built on it.

## Roles, states, properties

| Part                  | Element / role                                                          | ARIA / state                                                                                                                                                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fieldset.Root         | `<fieldset>` → `group`                                                  | `aria-describedby` = every description id in DOM order, then the error id, only for parts rendered. Native `disabled`. `data-invalid`, `data-required`, `data-disabled` | Class `kv-fieldset`. Props: `invalid`, `required`, `disabled`, `group`, `messages`. The root is always a `<fieldset>`. No `aria-invalid`: ARIA doesn't support it on `group`, so the error reaches users through the description. `disabled` disables every control inside (native)                                                                                                                                           |
| Fieldset.Legend       | `<legend>`, the group's name                                            | `data-invalid`, `data-required`, `data-disabled`                                                                                                                        | Class `kv-fieldset-legend`. Takes `marker`: appends `<span class="kv-field-optional">(optional)</span>` (in `en`; each language has its own text) when `optional`. Default `optional` in a `group` fieldset that isn't `required`, and `none` in a plain Fieldset                                                                                                                                                             |
| Fieldset.Prose        | `<div class="kv-prose" id>`, or the element `as` gives                  | In the fieldset's `aria-describedby`, in DOM order, before the error. `data-invalid`, `data-disabled`                                                                   | A `Fieldset.Prose` inside a Fieldset, and not inside a Field in it, registers itself and describes the group. Several are allowed, each with its own id. There is no `Fieldset.Description`                                                                                                                                                                                                                                   |
| Fieldset.HelpText     | `<p class="kv-field-help-text" id>`, or the element `as` gives. No role | In the fieldset's `aria-describedby`, in DOM order (with the Proses), before the error. `data-invalid`, `data-disabled`                                                 | The `Field.HelpText` part under the group's name (see `field.a11y.md`): a short instruction or example under the controls, for example the format of a date. A `Fieldset.HelpText` inside a Fieldset, and not inside a Field in it, registers itself and describes the group. Outside a Fieldset or Field it warns (`help-text-outside-field`) and renders a plain paragraph with no id. Never focusable, never a live region |
| Fieldset.ErrorMessage | `<p id>`, only while the fieldset is invalid                            | In the fieldset's `aria-describedby`, after every description. `data-invalid`                                                                                           | Class `kv-field-error-message`. The same prefix and icon as Field's                                                                                                                                                                                                                                                                                                                                                           |
| `useFieldset`         | the same attributes, for your own elements                              | `fieldsetProps`, `legendProps`, `descriptionProps`, `getDescriptionProps(name)`, `errorMessageProps`                                                                    | Options: `invalid`, `required`, `disabled`, `hasDescription`, `descriptions` (names, in render order), `hasErrorMessage` (default: `invalid`), `group`, `marker`, `messages`. Also returns `optionalMarker` and `errorPrefix`                                                                                                                                                                                                 |

Rules, tested in `fieldset.test.tsx`:

- The legend is the first child of the fieldset in the DOM (the browser needs this for the name).
- A Fieldset's `invalid` marks its own parts only. It doesn't pass down to the Fields inside, so a group error doesn't mark every control.
- A Field inside a `group` fieldset defaults to `marker="none"`: an option or a date box is never "(optional)". The group's legend carries the marker instead, when the group isn't `required`.
- A plain Fieldset only groups questions (for example an address), so its legend has no marker, and its Fields mark themselves.
- Nested fieldsets: the nearest Fieldset's text parts win, and a plain Fieldset inside a group fieldset stops the group defaults.
- A Prose, a HelpText and the Fieldset.ErrorMessage attach to the nearest Field or Fieldset, as in `field.a11y.md`: a Prose or a HelpText in a Field in the Fieldset describes that Field's control, not the group.
- A `Fieldset.Prose` in a Fieldset is the group's description. It is the Prose's **text content**: a heading, list or link inside it is read as plain text, so keep a description short. A Prose that isn't a description goes outside the Fieldset. A help text is plain text only.
- Several descriptions and help texts are listed in DOM order, then the error, each with its own id. With the default order that is the description, the help text, then the error. A second Fieldset.ErrorMessage gives a dev warning. `useFieldset({ descriptions })` and `getDescriptionProps(name)` give the same markup on the server.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Fieldset handles no keys and moves no focus. A group's keys come from its controls (see the TextInput, CheckboxGroup and RadioGroup pages). Enter, Space, Escape, the arrow keys, Home and End are not handled by Fieldset.

| Key             | Context                | Action                                                                                                           | Test                                                                                                                                                 |
| --------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab / Shift+Tab | Fieldset with controls | Moves through the controls in DOM order. The fieldset, legend, description, help text and error aren't Tab stops | `fieldset.test.tsx › Tab moves through the controls in DOM order and never stops on the group, its legend, its help text or its error`               |
| –               | `fieldset[disabled]`   | Disabled controls inside are skipped (native)                                                                    | `fieldset.test.tsx › disabled disables every control inside, natively`, `fieldset.test.tsx › Tab skips the controls of a disabled fieldset (native)` |

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- On error: Fieldset never moves focus. After a failed submit, you move focus to the first invalid control, or to an `ErrorSummary` (see its contract).
- Never obscured by: Fieldset renders no overlay.

## Announcements

| Event                  | Message key (i18n)  | Politeness                                                                                                                                                                |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An error appears       | none                | None: errors are not live regions                                                                                                                                         |
| Focus enters the group | none                | Screen readers announce the legend and "group"; the description and error follow through `aria-describedby`, which depends on the assistive technology (see Known issues) |
| The error text is read | `field.errorPrefix` | Part of the message: "Error: Choose how long you need the permit", 3.3.1 Error Identification (A)                                                                         |
| The legend is read     | `field.optional`    | Part of the name when the marker shows: "How should we contact you? (optional)", 3.3.2 Labels or Instructions (A)                                                         |

Message keys are the Field's (`field.optional`, `field.errorPrefix`), resolved the same way: the part's children, then `<Fieldset.Root messages>` or `useFieldset({ messages })`, then the provider, then `en`.

## Consumer responsibilities

- Give every fieldset a Fieldset.Legend that asks the question or names the group. Put the Fieldset.Legend first inside the Fieldset.
- A legend that is the page's heading: `<Fieldset.Legend className="kv-fieldset-legend--heading"><h1>…</h1></Fieldset.Legend>`.
- Use a Fieldset for options and for one question asked in several controls. Don't wrap every Field in one: a fieldset announces itself, and nested ones get noisy.
- Set `invalid` and render a Fieldset.ErrorMessage together, with plain text that says what's wrong and how to fix it (3.3.1 Error Identification, level A; 3.3.3 Error Suggestion, level AA).
- Set `group` on a Fieldset that holds options or the parts of one answer, so its Fields drop the optional marker and its legend takes it.
- Mark which individual Fields inside are wrong with the Fields' own `invalid`: the Fieldset's doesn't cascade.

## Visual / modes

- Focus indicator: on the controls inside. The fieldset has none.
- Target size: no interactive area of its own.
- Colour: the legend, description, help text and marker use the normal text colour, and a help text keeps it when the group is invalid or disabled. The error uses the danger colour with a prefix and an icon, so colour is never the only signal (1.4.1 Use of Color, level A).
- forced-colors behaviour: nothing depends on colour. The error uses the system's text colour.
- reduced-motion behaviour: none.
- RTL: logical properties only.

## WCAG SCs covered

- 1.3.1 Info and Relationships (A): native `<fieldset>`/`<legend>`, the group's description and error in its accessible description (`fieldset.test.tsx › wiring: name and description per state`).
- 1.4.1 Use of Color (A): the error has a prefix and an icon.
- 2.5.3 Label in Name (A): the visible legend text, with the marker, is the group's name.
- 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A), 3.3.3 Error Suggestion (AA): as for Field.
- 4.1.2 Name, Role, Value (A): native `group`, with a name and a description.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                                              |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                                                    |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | fieldset.stories.tsx, every story, 4 themes                                                                                                        |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | `fieldset.test.tsx` (axe and role, name and state): `the legend is the group’s name, and the description is its description, in en`                |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 2 rows, each names a test in `fieldset.test.tsx`                                                                                                   |
| Focus order and management                                                 | pass        | n/a         | pass    | `fieldset.test.tsx`: `keyboard › Tab moves through the controls in DOM order and never stops on the group, its legend, its help text or its error` |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI                                      |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                                                    |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                    |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                                                    |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                                                    |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                                                    |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                                                    |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                                                    |

### What to check

With a screen reader and the keyboard, try:

- Tab in from outside: the legend and "group" are read, then the description or the error (support differs).
- A group that is not required reads "(optional)" at the end of its legend.
- There is no Tab stop on the legend, description, help text or error.
- Submit with a box empty: after focus lands on the first wrong box, the group's error can be heard.
- A disabled fieldset: Tab skips every control.

## Known issues

- **`aria-describedby` on a `<fieldset>` may not be announced consistently.** GOV.UK reports that NVDA, JAWS and VoiceOver announce it when the user enters the group and that TalkBack does not do so consistently. That is a report from others, not a result here: test all four with your users.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. WebKit is not covered by the automated tests, so check Safari with your own users and assistive technology.
