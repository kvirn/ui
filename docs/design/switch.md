# Design spec: Switch

- **Status:** Draft
- **Designer:** ux-designer agent · **Date:** 2026-10-06
- **Plan:** to be written (roadmap M1 "Switch": this spec assumes a separate `Switch`, not a Toggle option, see §9)
- **Type:** component default styling

`Switch` is a native `<input type="checkbox" role="switch">` in a `Field.Root`, styled by the theme as `kv-switch`. It reuses the Checkbox choice row (`theme.css` "Checkbox, radio and native listbox", [form-fields.md](form-fields.md) §6.5) and changes only the control's shape.

## 1. Brief

- **Users:** both. Residents change a setting on My pages once or twice a year; staff turn on views and filters daily.
- **Hardest-case user:** a resident on a phone at 400% zoom in a Windows contrast theme, who can't tell lavender from grey and must know whether "Text message reminders" is on. Second: a screen-reader user in their second language who needs to know the change was saved, or wasn't.
- **Job to be done:** When I want a service to behave differently, I want to turn one setting on or off and see it take effect, so I don't have to fill in and send a form.
- **Context:** any device; immediate effect, often saved to a server in the background; no submit button.
- **Constraints:** native semantics first (AGENTS.md rule 2); no strings of its own (the label is the consumer's); DESIGN.md tokens only.
- **Success:** the right state set first time; no settings changed by mistake; no support calls asking "did it save?".
- **Assumptions (no research yet):** the tick plus position is read as "on" without colour → RQ: do contrast-theme users name the state correctly? Residents expect a switch to save at once → RQ: do they look for a Save button?

## 2. Prior art

| Source                                                                                     | What we reuse                                                                                                                        | What we change and why                                                                                              |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| KvirnUI Checkbox (`theme.css`, form-fields.md §6.5, §6.8)                                  | The choice row (control at the start, label across the row as the target), the help text column, the error under the row, the states | The control is a pill track with a thumb, not a box. The shape tells a switch from a checkbox and a radio           |
| KvirnUI Toggle ([rich-text-editor.md](rich-text-editor.md) §6.4)                           | Its name never changes with its state; on is a solid `primary` fill                                                                  | Toggle is a `<button aria-pressed>` for tools ("Show map"); Switch is a labelled setting in a field                 |
| APG [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)                     | `role="switch"` on a checkbox; the label doesn't change with the state; Space toggles                                                | –                                                                                                                   |
| Designsystemet (NO) [Switch](https://designsystemet.no/en/components/docs/switch/overview) | Immediate effect only; form questions use checkboxes or radios; label names the feature and reads well with "on/off" after it        | We don't take its `readOnly`: a native checkbox has no read-only state (§6.2)                                       |
| GOV.UK Design System                                                                       | Publishes no switch: answers in a submitted form are checkboxes and radios                                                           | We ship a Switch for settings with immediate effect, and say in the docs that a submitted form uses a Checkbox (§3) |

## 3. When to use a switch, and the flow

| Use a **Switch**                                                                     | Use a **Checkbox** or **RadioGroup**                                                          |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A setting that takes effect at once, with no Save or Send button (My pages settings) | Any answer that is sent with a form, a declaration ("I confirm…"), consent, a required choice |
| On and off are the whole choice, and both are safe to try                            | The options aren't on/off ("Yes / No / Don't know"), or the choice needs a review before send |
| One setting per row, each independent                                                | Several answers to one question (a CheckboxGroup)                                             |

**Public-sector rule:** in a resident's e-service form that is submitted, never a Switch. A switch in a form makes people unsure whether the answer is already saved, and a "Yes / No" question is a RadioGroup. Switch has no `required`.

Flow (immediate effect, server save):

1. Resident opens Settings. Each switch shows the saved state.
2. Activates "Text message reminders". The state changes at once (thumb moves, tick appears); AT announces the new state ("on").
3. **Saved:** nothing more. The state is the confirmation; no toast, no announcement.
4. **Save fails** (offline, server error): the switch goes back to its previous state, an error message appears under the row (`settings.saveFailed`), the consumer announces it through the `Announcer` (4.1.3), and focus stays on the switch.
5. **While saving:** the switch stays enabled and focused. Never disable the focused switch: a disabled element loses focus to `body` (2.4.3). A second press while saving is the consumer's (queue or last-wins).
6. **Not available** (e.g. no mobile number): disabled, with the reason in the help text, never in a tooltip.
7. **Change of context:** a switch never navigates, reloads or moves focus (3.2.2). A setting that does belongs on a button.

## 4. Content

`Switch` has **no strings of its own**: the label, help text and error are the consumer's; "on/off" is spoken by the AT from the role. Story fixtures go in `apps/storybook/src/components/switch/switch.fixture.tsx` in all six locales (storybook-presentation.md §4).

| Key                         | en                                                                  | sv                                                                        | longest: fi (draft)                                                       | Element                              |
| --------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| `settings.legend`           | Notifications                                                       | Aviseringar                                                               | Ilmoitukset                                                               | Legend of the group                  |
| `settings.savedAtOnce`      | Changes are saved straight away.                                    | Ändringar sparas direkt.                                                  | Muutokset tallentuvat heti.                                               | Group description (`Fieldset` Prose) |
| `settings.smsReminders`     | Text message reminders                                              | Påminnelser via sms                                                       | Tekstiviestimuistutukset                                                  | Label                                |
| `settings.smsRemindersHint` | We send a text message the day before your appointment.             | Vi skickar ett sms dagen före din tid.                                    | Lähetämme tekstiviestin vastaanottoasi edeltävänä päivänä.                | Help text                            |
| `settings.emailDecisions`   | Decisions by email                                                  | Beslut via e-post                                                         | Päätökset sähköpostiin                                                    | Label                                |
| `settings.noMobileHint`     | Add a mobile number in Contact details to use this.                 | Lägg till ett mobilnummer under Kontaktuppgifter för att använda det här. | Lisää matkapuhelinnumero yhteystietoihin, jotta voit käyttää tätä.        | Help text of a disabled switch       |
| `settings.saveFailed`       | The setting was not saved. Check your connection and try again.     | Inställningen sparades inte. Kontrollera din anslutning och försök igen.  | Asetusta ei tallennettu. Tarkista verkkoyhteys ja yritä uudelleen.        | Error message, announced             |
| `settings.longLabel`        | Reminders by text message and email before every booked appointment | Påminnelser via sms och e-post före varje bokad tid                       | Muistutukset tekstiviestinä ja sähköpostina ennen jokaista varattua aikaa | Wrap test at 320px                   |

**Rules (sv and en):**

- The label **names the setting**, a noun phrase: "Påminnelser via sms", "Text message reminders". It reads correctly with "på/av", "on/off" after it.
- Not the action: never "Slå på påminnelser", "Turn on reminders", "Skicka mig sms".
- Never "På", "Av", "On", "Off" or "Aktiverad" as the label or inside it, and the label never changes with the state (APG).
- Not a question ("Vill du ha påminnelser?"): a question is a RadioGroup in a form.
- The help text says what happens when it is on, in `text`, under the label. A disabled switch's help text says why, and what to do.

## 5. Structure

The Checkbox choice row, unchanged except the first column is the track's width. Same at 320px, 40rem and 64rem.

```
[fieldset] legend: Notifications · Prose: Changes are saved straight away.
  [field ≥44px (32px compact), one target]  (○──) Text message reminders   ← label wraps beside the track
                                                  We send a text message…   ← help text, column 2, outside the target
                                            ⚠ The setting was not saved.    ← error, full row, last
  [field]                                   (──●✓) Decisions by email
```

Reading and focus order = DOM order; one Tab stop per switch. In RTL the track is on the right.

## 6. Visual specification

### 6.1 Parts

| Part      | Look (DESIGN.md tokens)                                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track     | The input itself (`appearance: none`). `--kv-choice-size` tall (24px), twice as wide (48px), `--kv-radius-full`, 1px `border-control` edge. Flat: no shadow, no depth (only buttons have depth) |
| Thumb     | A circle drawn on the input (as Checkbox's mark is: no extra DOM), 18px, 3px in from the track's outer edge, so it doesn't move when the edge goes 2px. Off: inline-start. On: inline-end       |
| Tick      | Checkbox's tick (same `clip-path`), two thirds of the thumb, centred in it, on only. Never mirrors                                                                                              |
| Label     | `Field.Label`, `label` type (`label-compact` in compact), weight 400, across the row, padded past the track; hyphenates                                                                         |
| Help text | `Field.HelpText`, `body-small`, `text`, column 2, directly under the label's box (Checkbox's negative margin)                                                                                   |
| Error     | `Field.ErrorMessage`, full row, last, the error icon and hidden "Error:" prefix                                                                                                                 |
| Target    | The whole label row: ≥44px tall comfortable, ≥32px compact (both ≥ 2.5.8's 24px). The track alone is 48×24, so it still meets 2.5.8 if a consumer drops the row                                 |

### 6.2 States

| State                       | Track fill / edge                                                                                                                                                 | Thumb / tick                        | Label        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------ |
| Off                         | `canvas` / 1px `border-control`                                                                                                                                   | `border-control`, start / none      | `text`       |
| Off, hover (track or label) | `canvas` / 1px `text`                                                                                                                                             | `text` / none                       | `text`       |
| On                          | `primary` / 1px `primary`                                                                                                                                         | `on-primary`, end / tick `primary`  | `text`       |
| On, hover                   | `primary-hover` / 1px `primary` (`primary-hover` is never an edge: 2.98:1 in dark)                                                                                | `on-primary` / tick `primary-hover` | `text`       |
| Active                      | As hover. No squash or stretch of the thumb                                                                                                                       | –                                   | –            |
| Focus-visible               | Adds a `focus-ring` outline, `--kv-focus-ring-width`, offset `--kv-focus-ring-offset`, following the pill. Keyboard only (`:focus-visible`, `data-focus-visible`) | –                                   | –            |
| Invalid                     | Edge 2px `danger` (`--kv-control-border-width-invalid`), off or on; plus the error message                                                                        | unchanged                           | `text`       |
| Disabled, off               | `surface` / 1px **dashed** `border-control`                                                                                                                       | `text-muted` / none                 | `text-muted` |
| Disabled, on                | `text-muted` / 1px solid `text-muted`                                                                                                                             | `canvas` / tick `text-muted`        | `text-muted` |

- **Read-only:** none. A native checkbox ignores `readonly`. A setting the user can't change is shown as text in a Summary list ("Text message reminders: On"), or disabled with a reason in the help text.
- **On vs off without colour (1.4.1):** two cues that aren't colour, in every theme: the thumb's position and the tick. Plus the fill change (empty vs solid), which survives as `Highlight` in forced colours.

### 6.3 Contrast (existing measured pairs only)

From form-fields.md §6.10 (`contrast.ts` against `theme.css`, 2026-10-02), lowest of `canvas` / `surface` / `surface-raised`. No new pair.

| Pair (1.4.11, 3:1)                          | light       | dark        | light-contrast | dark-contrast | Use                                                                 |
| ------------------------------------------- | ----------- | ----------- | -------------- | ------------- | ------------------------------------------------------------------- |
| `border-control` on the page                | 4.68        | 3.54        | 10.21          | 12.05         | Off track edge                                                      |
| `border-control` on `canvas`                | 4.98        | 4.19        | 10.86          | 14.28         | Off thumb on the track's `canvas` fill                              |
| `primary` on the page                       | 4.42        | 3.75        | 9.29           | 9.40          | On track fill and edge                                              |
| `on-primary` on `primary` / `primary-hover` | 4.70 / 5.91 | 4.70 / 5.91 | 9.89 / 12.65   | 11.14 / 13.97 | Thumb on the track; the tick on the thumb is the same pair reversed |
| `text` on the page                          | 17.90       | 16.55       | 19.61          | 17.61         | Hover edge and thumb, label                                         |
| `danger` on the page                        | 6.02        | 7.84        | 7.73           | 10.42         | Invalid edge                                                        |
| `focus-ring` on the page                    | 4.42        | 6.14        | 9.29           | 9.40          | Focus ring                                                          |

On panels: `primary` lowest 3.32 (dark, `primary-subtle`), `border-control` 3.13 (dark, `primary-subtle`). Disabled pairs (`text-muted` on `surface` 5.84, `canvas` on `text-muted` 6.21) are inactive and exempt, but pass anyway.

### 6.4 Modes

- **Dark:** the off track stays `canvas` (black), a hole in a `surface-raised` card, like the checkbox.
- **Contrast themes:** tokens only; every edge ≥ 9.29:1. The tick and position carry the state.
- **Forced colours:** set explicitly, like Checkbox. Off: `Field` fill, `ButtonBorder` edge, `ButtonText` thumb. On: `Highlight` fill and edge, `HighlightText` thumb, `Highlight` tick. Focus: `Highlight` outline. Invalid: 2px `CanvasText` edge. Disabled: dashed `GrayText` edge, `GrayText` thumb on `Field`; on: solid `GrayText` edge, `GrayText` thumb, `Field` tick; label `GrayText`. Hover changes nothing. The track keeps a real 1px border in every state.
- **RTL:** logical properties only. Off thumb on the right, on thumb on the left; it moves right to left. The tick doesn't mirror.
- **Motion:** the thumb slides and the fill fades over `--kv-duration-fast` with `--kv-easing-standard`, only under `prefers-reduced-motion: no-preference`. Otherwise the state changes instantly. The tick appears without drawing.
- **320px, 400% zoom, 1.4.12:** sizes in rem follow the text size; label, help text and error wrap and hyphenate beside the track (`settings.longLabel`); offsets use `1lh`; no fixed heights.

### 6.5 New tokens (maintainer decision; not added)

Two size aliases derived from `--kv-choice-size` (no new colour or base value, like form-fields.md §6.11): `--kv-switch-inline-size: calc(var(--kv-choice-size) * 2)` (track width and the row's first column) and `--kv-switch-thumb-size: calc(var(--kv-choice-size) * 0.75)` (18px, 3px inset). After approval, DESIGN.md "Checkboxes and radios" and "Radii" gain a line each ("a switch is a pill") and the class contract gains `kv-switch`.

## 7. Accessibility annotations

Draft for `packages/react/src/switch/switch.a11y.md`.

- **Role and state:** native `<input type="checkbox" role="switch">`, state from native `checked` (no `aria-checked`), never `indeterminate`. Native `disabled`, never set while focused (§3 step 5).
- **Name and description:** `Field.Label` (`<label for>`), visible label = name (2.5.3), unchanged by state; `aria-describedby` lists help texts in DOM order, then the error.
- **Keyboard** (`keyboard` skill, Switch): one Tab stop; Space toggles; Enter does nothing (native checkbox, not added). Clicking the label toggles.
- **Announcements:** the toggle itself is announced by AT from the role. A failed save is the consumer's `Announcer` call with its own string; the component announces nothing.
- **SCs of note:** 1.4.1, 1.4.11, 2.4.7/2.4.13, 2.5.3, 2.5.8 (2.5.5 in comfortable), 3.2.2, 4.1.2, 4.1.3.
- **Stories:** off, on, hover, focus (Keyboard story), disabled off/on with reason, invalid with error, help text, group in a fieldset, long Finnish label, compact, RTL, forced colours.

## 8. Validation

- [x] Self-review against `review-checklist.md`, no open blockers. No new colour pair (§6.3); the orchestrator runs `theme:check` once implemented.
- Manual AT matrix: `pending`. Risk: some screen readers speak `role="switch"` as a checkbox or toggle button; the state is still spoken.
- **Usability test plan (`pending`).** Participants: 6–8 residents using NVDA, VoiceOver iOS, 400% magnification, a Windows contrast theme; low digital confidence; second-language sv/fi speakers. Tasks: turn reminders on; say whether "Decisions by email" is on; recover from a failed save; find out why a setting can't be turned on. Measure: state named without colour, looking for a Save button, recovery, errors, time.

## 9. Open questions

1. **Separate component or Toggle's `role="switch"`** (roadmap)? Assumed separate, on a native checkbox, so Field's label, help and error come free.
2. **Visible state text** ("På"/"Av") beside the track: not proposed (new strings, risk of a name that changes with state). Revisit if testing shows the tick isn't enough.
3. **Track at the row's end** (as Designsystemet allows) and the **size aliases** in §6.5: out of brief / for the maintainer.
