# Plan 0032: A one-field date mask, and masks by default in the stories

- **Status:** Done
- **Owner:** orchestrator → component-engineer
- **Created:** 2026-10-04 · **Target:** M2
- **Related:** [0013](0013-form-fields.md), [0014](0014-input-masks-and-one-time-code.md), `forms` skill, [masks reference](../../.claude/skills/forms/references/masks.md), [form-fields design spec](../design/form-fields.md)

## Goal

A team can ask for a date in one text field (`DD.MM.ÅÅÅÅ`, `ÅÅÅÅ-MM-DD`) with a mask that follows the page's region. The Storybook examples show numeric fields with a mask by default, so the example people copy doesn't accept letters in a number field.

## Non-goals

- The library's defaults stay as they are. `Input type="number"` still warns and isn't turned into a masked text input (see Decisions). `inputMode="numeric"` doesn't add a mask.
- No DatePicker. It's a later component and will use `masks.date()` for its text field.
- No new i18n strings. Rejections use the existing `mask.characterNotAllowed` and `mask.maximumLength`.
- InputGroup stories stay as they are.

## Background

- DateInput (three boxes) stays the default for dates people know by heart (GOV.UK date input research). One field suits dates read off a document, people used to typing `19850412`, and the APG date picker's text field.
- The design spec says "the component never blocks keys" (form-fields.md, edge cases) and the Number stories say "never filter keys". Plan 0014 later brought in lenient masks: a rejected character is announced politely, paste and autofill are normalised, and checks are reported, not enforced. Showing a mask in the stories follows 0014. The wording in the spec and the stories is updated to match.

## Design

### API sketch

```tsx
import { Field, Input, masks, checks } from '@kvirn-ui/react'

;<Field.Root required>
  <Field.Label>Startdatum</Field.Label>
  <Input
    name="start"
    mask={masks.date()}
    className="kv-input--width-10"
    onValueChange={(value, details) => {
      // details.unmaskedValue: '2026-10-04' once complete, else ''
      checks.date(details.unmaskedValue, { min: '2026-01-01' }) // { isValid, reason }
    }}
  />
  <Field.Hint>Till exempel 2026-10-04</Field.Hint>
</Field.Root>
```

### `masks.date({ locale? })`, in `core/src/mask/date-engine.ts`

- **Order and separator from the locale through `Intl`.** The order logic moves from `react/src/date-input/date-order.ts` to `core/src/locale/date-order.ts` (pure, `Intl` only), and DateInput imports it from there: `sv-SE` is year, month, day; `fi`, `sv-FI`, `nb`, `nn` and `en-GB` are day, month, year; a result that starts with the month becomes day first. The separator is the `Intl` literal between the parts if it's `.`, `-` or `/`, otherwise `.`. Without its own `locale` the mask follows the provider's locale through `withLocale`, like a number mask. Default `en`.
- **Parts.** Day and month take 1 or 2 digits, the year 4. When a part is full, the locale's separator is inserted, following the pattern engine's convention for literals.
- **A separator closes the part.** `.`, `-`, `/` or a space typed after at least one digit of a day or month closes that part and is written as the locale's separator: `4.10.2026` stays as typed and isn't padded. A separator in any other place (a year with fewer than 4 digits, an empty part, after the last part) is rejected with reason `other`.
- **Paste, drop and autofill.** A whole ISO date (`2026-10-04`) or 8 digits in the locale's order is reformatted to the locale's form, so an ISO autofill lands in a `DD.MM.ÅÅÅÅ` field correctly. Anything else goes through the usual per-character rules.
- **Values.** `isComplete` once all three parts have digits and the year has 4. `unmaskedValue` and `unmask(value)` give ISO `YYYY-MM-DD`, padded there only, once complete, else `''`. `format(iso)` gives the locale's form, padded (`04.10.2026`). No range or calendar check in the mask: 31.02.2026 is complete.
- **Attributes.** `inputMode: 'numeric'`, `spellCheck: false`. iOS numeric pads have no `.` or `-`, so the short form (`4.10`) needs a hardware keyboard. Typing two digits per part always works, because the separator is inserted.

### `checks.date(isoValue, { min?, max? })`

`{ isValid, reason }` with reason `format` (not a complete ISO date), `date` (no such day, such as 2026-02-31) or `range` (before `min` or after `max`, both ISO and inclusive).

### Accessibility contract (draft)

No new keys or roles: the field is a native text input, and the Input contract's Keyboard section applies unchanged.

- Announcements: the mask's existing polite, throttled rejection message.
- 3.3.2: a masked Input in a Field without a hint already warns. Every date and number example has a hint with an example in the locale's form.
- 1.3.5: the stories don't set `bday` on a one-field date, because a date of birth belongs in DateInput.
- WCAG: 3.3.1, 3.3.2, 3.3.8 (paste is never blocked), 4.1.2.

### Stories (the user's choice, 2026-10-04)

- **Number** (`Components/Form/Number`): every field has a mask by default. `WholeNumber` uses `masks.number()`, `Amount` `masks.number({ decimals: 2, grouping: true })` or what the number engine does with "1 250,50" (the play test asserts the actual result), `ReferenceNumber` `masks.digits()` (keeps `004512`), `Postcode` `masks.postalCode({ country })` from the story locale (sv → SE, fi → FI, nb → NO, otherwise SE). `Invalid` shows a value the mask lets through but the form rejects (out of range), with a matching fixture error. The header comment's "never filter keys" becomes: the mask drops a character it can't take and says so politely, paste still works, the form validates.
- **Input** (`Components/Form/Input`): the `Default` (main example) gets a `mask` select control: none, `digits`, `number`, `number (2 decimals)`, `postalCode SE`, `personalIdentityNumber SE`, `date`. Choosing a mask shows a matching `Field.Hint`, so it never warns.
- **DateInput** (`Components/Form/DateInput`): a `OneField` example: a Field with a label, `Input mask={masks.date()}`, a `Field.Hint` with an example in the locale's form, and `kv-input--width-10`. Its docs prose says when to use one field instead of three, and that DatePicker will come later. The play test types `4.10.2026` in fi and `20261004` in sv and checks the value and `unmaskedValue`.

## Tasks

- [x] Move `dateInputOrder` to `core/src/locale/date-order.ts` (and its tests). DateInput imports it from there, with unchanged behaviour
- [x] `core/src/mask/date-engine.ts` and `masks.date()`, with unit tests: order and separator per locale, auto-insert, a separator closing a short part, rejected separators, ISO and 8-digit paste, `unmask`, `format`, `withLocale`
- [x] `checks.date` with unit tests
- [x] Export from `@kvirn-ui/core` and re-export from `@kvirn-ui/react` like the other presets and checks
- [x] Number stories masked by default, with the header rewritten
- [x] The Input `Default` `mask` control
- [x] The DateInput `OneField` story and its docs prose
- [x] Docs (part A done: masks reference, `forms` skill dates bullets, `input.md`, `date-input.md`; the design spec's "never blocks keys" lines and the Number and Input docs are the other engineer's): the masks reference (preset and check rows, remove "There is no date preset", `withLocale` covers date masks), the `forms` skill (dates: one field is an option; numbers: show a mask), the design spec's "never blocks keys" lines, `input.md` / `date-input.md` package docs
- [x] Changeset (`@kvirn-ui/core` minor, `@kvirn-ui/react` minor for the re-exports)
- [x] Gates: `vp check`, `vp test run`, e2e for the changed specs, `i18n:check`
- [x] accessibility-reviewer APPROVE (2026-10-04). The manual AT matrix stays `pending`

## Decisions

- **The library keeps `type="number"` out, and the stories carry the default.** Turning `<Input type="number">` into a masked text input would be convenient, but it rewrites a native attribute without saying so, a `min`/`max` that the browser enforces would become a reported check, and identifiers (postcodes, case numbers) would lose their leading zeros if they took the same route. The maintainer chose sane defaults in Storybook instead (2026-10-04).
- **A short day or month is closed by a separator, not padded** (the maintainer, 2026-10-04): the value stays as typed, and the ISO `unmaskedValue` is padded.
- **`dateInputOrder` and a new `dateSeparator` are public core exports** (a core module can't be imported from `react` without an export): `core/src/index.ts` exports them with the `DateInputPart` type, and `react` re-exports only the type, as before. `react/src/date-input/date-order.ts` is deleted, and its unknown-locale test moved to `core/src/locale/date-order.test.ts`.
- **An unsupported locale gives `en` in `masks.date`** (`Intl.DateTimeFormat.supportedLocalesOf`, like the number engine), so the mask doesn't depend on the machine. `dateInputOrder` itself is unchanged (an invalid tag gives day, month, year).
- **The ISO and digit-only paste are one rule:** a whole ISO date (`YYYY-MM-DD`, spaces allowed) in a bulk insert or a stored value is reordered. Eight digits need no special case: the per-character rules give the locale's form. A separator inside a pasted value closes a part like a typed one, and one that doesn't fit is refused silently (not announced), as in the pattern engine.
- **Rejection reasons:** a separator that doesn't fit, and `,`, `_`, `(` and the like, are `other`. A letter is `digits`. A digit into a full year is `length`.
- **A second story, `OneFieldFinnish`,** runs the `4.10.2026` play check, because a story's `play` runs in the toolbar's default locale (sv) only.
- **Worked in the main tree, not a worktree** (the maintainer, 2026-10-04): DateInput and the form fixture are still uncommitted on main.

- **Number stories: grouping is on for amounts** (engineer, 2026-10-04). Typing "1 250,50" in `Amount` (`masks.number({ decimals: 2, grouping: true })`) refuses the space (announced), takes `,` as the decimal mark and writes the page's grouping and decimal mark, so the value equals the hint's example (`rentExample`, from the same `Intl`). `AmountWithUnit` takes `masks.number({ grouping: true })`. The Postcode mask follows the story locale: sv/se/en SE, fi FI, nb and nn NO (nn is Norwegian, so NO rather than "else SE"). The English `postcodeHint` is now `123 45`, because English shows the SE mask. `Invalid` is `25` in a whole-number field: the mask can't know the limit of 12 (new fixture keys `childrenHint` and `childrenRangeError`, all five written locales; `childrenError` is now unused by the stories).
- **Input `Default` mask control** (engineer, 2026-10-04): the control holds a preset name, and `argTypes.mask.mapping` turns it into the preset. `render` reads the name from `unmappedArgs` to pick a matching label and `Field.Hint` (sv and en pairs; other locales show English with `lang="en"`), and sets `autoComplete="off"` when a mask is chosen. The date hint example comes from `masks.date({ locale }).format('2026-10-04')`.

- **Backspace after a separator deletes the digit and keeps the separator** (orchestrator, 2026-10-04). `deleteNeighbour` in `create-mask.ts`, shared by every mask, used to drop the literal along with its neighbour. That was harmless for patterns, but in a date the separator decides how the digits are read, so `04.|10.2026` became `01.0.2026`. Now only the neighbour goes. All 755 mask tests pass.
- **Local e2e runs serially** (the maintainer, 2026-10-04): Playwright uses 1 worker when `CI` isn't set and 3 in CI, and `E2E_WORKERS` overrides it. Updated in `docs/engineering.md` and the `testing` skill.

## Risks & open questions

From the accessibility review (2026-10-04). Fixed: the label's `lang` in the Input mask control, the date example built from the field's own mask, a day above 12 in the examples, a duplicated e2e test deleted, and one-digit ISO parts accepted on paste. Accepted for now, for the maintainer and the manual AT matrix:

- **"Field full" counts the ISO length for a date mask** (`use-mask.ts`): it says 10 characters, while a short form such as `4.1.2026` shows 8. The message still means "the field is full".
- **Amount: typing the hint's "1 250,50" announces the refused space**, though the value ends up right (the number engine's behaviour). An AT question for the matrix.
- **A date pasted in another locale's form is read per character**: `04.10.2026` pasted into an sv field becomes `0410-20-26`, with no message. Only ISO and the field's own form are recognised.

- The number engine's handling of spaces in "1 250,50" decides the Amount story's assertion. The test asserts what it does, and doesn't change the engine.
- Another session is active in the same tree. Edits stay inside the files this plan lists.
