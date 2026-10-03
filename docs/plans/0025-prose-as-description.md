# Plan 0025: Prose is the description

- **Status:** Done (alpha. Manual AT pending before beta)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-03 · **Target:** M1
- **Related:** ADR-0054 (Accepted), ADR-0055 (Accepted), ADR-0029, ADR-0031, ADR-0052

## Goal

A hint in a form is text set for reading, which `Prose` already is. Remove `Field.Description` and `Fieldset.Description`, and let a `<Prose>` inside a `Field.Root` or `Fieldset.Root` be the description of its control or group.

```tsx
<Field.Root>
  <Field.Label>Personnummer</Field.Label>
  <Prose>
    <p>12 siffror, utan bindestreck.</p>
  </Prose>
  <Input name="pnr" />
</Field.Root>
```

## Non-goals

- A prop or part to opt out. A Prose that isn't a hint goes outside the Field (`kv-not-prose` is CSS only: a Prose registers at any depth).
- Changing how errors, labels or the control's own `aria-describedby` merge.
- A deprecation period (the maintainer chose to remove now, pre-1.0).

## Design

- `Prose.Root` reads the internal `FieldTextHostContext`. When there is a host (Field.Root or Fieldset.Root), it does what `FieldDescription` did: a `useId()` name, a merged element ref, `registerDescription(name, ref)` in a layout effect, and `id`, `data-invalid` and `data-disabled` from `host.getDescriptionProps(name)`. Ids stay in DOM order (ADR-0031). Outside a host it is exactly today's Prose, with no warning.
- Extract that logic into one internal hook, `useDescriptionPart`, used by Prose and by `FileUpload.Limits` (which stays, with class `kv-file-upload-limits`).
- Remove `FieldDescription`, `Field.Description`, `FieldsetDescription`, `Fieldset.Description`, `FieldDescriptionProps` and the `field-description-outside-field` warning from the exports. `useField` and `useFieldset` keep `descriptionProps` and `getDescriptionProps`, and the class they return is `kv-prose` (was `kv-field-description`).
- Default element stays `<div>`: a hint with several paragraphs is valid. `render` can still make it a `<p>`.
- Theme: delete `.kv-field-description`. A `.kv-prose` inside `.kv-field` or `.kv-fieldset` is prose again, so the boundary rule at theme.css (~1089) must let the nearest `kv-prose` win, as it does for cards. The hint keeps the text colour in every density, is body size above the control and for an option's hint, and body-small under the control (ADR-0054, decided after this plan), its measure is `--kv-prose-measure`, and the checkbox/radio grid rule targets `> .kv-prose`. The `.kv-file-upload-limits` rule stays.
- The `Components/Form/Description` story file becomes a `Components/Form/Hint` story file, or is merged into the Field stories. Keep the same behaviours: in a field, in a fieldset, above and under, compact, long Finnish, RTL, forced colours.

### Accessibility contract (draft)

- A Prose in a Field or Fieldset registers its id, and the control's (or group's) `aria-describedby` lists registered Proses in DOM order, then the error.
- The description's text is the Prose's text content. Headings, lists and links inside lose their structure in the accessible description, so the contract tells authors to keep a hint to plain text and short paragraphs.
- A Prose elsewhere has no role, ARIA or behaviour, as before.
- Update `field.a11y.md`, `fieldset.a11y.md`, `prose.a11y.md`, `input.a11y.md`, `checkbox-group.a11y.md` and `one-time-code.a11y.md`. The tests must match.

### i18n strings

None.

## Tasks

- [ ] `useDescriptionPart` hook, Prose registers, `FileUpload.Limits` uses the hook
- [ ] Remove `Field.Description`, `Fieldset.Description` and their types and exports
- [ ] Tests first: Prose in Field and Fieldset (id, DOM order, two hints, `aria-describedby`, outside a host, axe). Migrate the existing tests
- [x] `theme.css`: remove `.kv-field-description`, boundary rule, grid rule, theme tests (including the heading and field tests that name the old class)
- [ ] Migrate stories, fixtures, `*.md`, `*.a11y.md`, docs, `docs/design/form-fields.md`
- [x] ADR-0054, roadmap, changeset (breaking, `!`)
- [ ] Manual AT matrix: `pending`

## Verification

`vp check`, `vp test run` and `theme:check` on the changed files, then once on the whole tree. `vp run e2e` for the field, input, checkbox-group, radio-group, file-upload and one-time-code specs that mention the hint.

## Addendum: typography parity, reset and worker caps

Added after the first version (AGENTS.md rule 10: the plan follows the scope).

- **Typography parity (ADR-0054):** the colour roles `--kv-prose-color-*`, the sizes `kv-prose--small`, `--xl`, `--2xl` and `--full`, and the plugin's remaining element rules (bold and code in headings, links, quotes and table heads, `li` padding, flush table columns, `thead` and `tfoot`, `.kv-lead` on any element). Tests: `theme-css.test.ts` (roles, sizes, step-down, lead), `prose.stories.tsx` (`Sizes`, `Full width and colour roles`, `Forced colors`), `prose.e2e.ts` (320px reflow, step-down, forced colours, axe).
- **Hint size (ADR-0054 §6):** a hint under the control is `body-small`. A hint above it (also when the label is the page's `h1`) and an option's hint stay 16px. Test: `hint.stories.tsx › SixteenAboveAndForOptions`, `theme-css.test.ts`.
- **`reset.css` (ADR-0056):** an opt-in Preflight port in `@layer kv-reset`. Test: `theme-css.test.ts › reset.css`.
- **Worker caps (ADR-0058):** `maxWorkers` in `vite.config.ts` and `workers` in `playwright.config.ts`.
- **Review:** `accessibility-reviewer` found two blockers (the under-hint selector was too broad, and the forced-colours and reflow claims had no tests). Both are fixed and covered by the tests above.
