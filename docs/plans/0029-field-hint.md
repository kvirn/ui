# Plan 0029: Field.Hint

- **Status:** In progress
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** Plan 0028 (names), changes the hint rule in the forms skill, design spec [docs/design/field-hint.md](../design/field-hint.md)

## Goal

A hint and a description are different things, and the code says so:

- **A hint** is a short instruction, almost always placed under the control, in 14px body-small. Example: "Format: ÅÅÅÅMMDD-NNNN".
- **A description** is a Prose above the control, at body size. It may hold paragraphs, lists and links.

Both name the control's `aria-describedby`.

## Non-goals

- No change to how descriptions register, or to the `aria-describedby` order (DOM order, then the error).
- No muted hint colour. Hints stay in `text` colour (DESIGN.md, contrast).
- No rich content in a hint. Rich content goes in a Prose description.

## Background

Plan 0025 made a Prose inside a Field the description, and dropped `Field.Description`. The theme then sized a Prose by position: 16px above the control and 14px under it, using a `~` sibling selector in `theme.css` around line 2541. Option hints stay 16px.

That made one component carry two jobs. Its size depended on where it sat, and an adopter can't see that rule in the code. The maintainer's rule (2026-10-04) is: "a hint is a hint, 14px, almost always under the input; a Prose above the input is a description."

A Hint part has never existed (`git log -S "Field.Hint"` is empty). The old `Field.Description` was a `<p class="kv-field-description">`.

## Design

### API sketch

```tsx
<Field.Root>
  <Field.Label>Personnummer</Field.Label>
  <Field.Prose>
    <p>Vi använder ditt personnummer för att hämta dina uppgifter från Skatteverket.</p>
  </Field.Prose>
  <Input mask={masks.personalIdentityNumber()} />
  <Field.Hint>ÅÅÅÅMMDD-NNNN</Field.Hint>
  <Field.ErrorMessage>Skriv personnumret med 12 siffror.</Field.ErrorMessage>
</Field.Root>
```

- **`Field.Hint`** (and `Fieldset.Hint`, plus the group aliases from Plan 0028):
  - Renders `<p class="kv-field-hint">` with an id. `render` can swap the element, for example to a `<div>`.
  - Registers through `useDescriptionPart`, the same as Prose and `FileUpload.Limits`.
  - Gets `data-invalid` and `data-disabled` from the host.
- **Prose in a Field** is the description. It stays 16px wherever it sits. The position-based 14px rule is removed.
- **Outside a Field or Fieldset,** a Hint warns `hint-outside-field` and renders a plain `<p class="kv-field-hint">`.

### Design spec

Design spec: [docs/design/field-hint.md](../design/field-hint.md). Order: label, description (`Prose`, 16px, optional), control, hint (`Field.Hint`, `kv-field-hint`, `body-small` 14px, line height 1.5, `text`, prose measure), error last, so the visual order is the `aria-describedby` order. Every part is one `--kv-field-gap` apart (8px, 4px compact), except an option hint, which sits directly under its label's box (0 gap) in column 2. Option hints are 14px (no exception). A hint is always under the control, never above it (maintainer, 2026-10-04). The hint never changes with invalid, disabled or read-only. No new token. DESIGN.md text in §8 of the spec. Stories: §9.

### Decisions on the spec's open questions (2026-10-04)

The maintainer asked to build the spec. These are the defaults taken for its open questions, for the maintainer to confirm or change.

1. Compact option hints: accepted as specified (both 14px, told apart by position). Stays a research question.
2. The review checklist's `body-small` blocker is reworded: "…except the hint under a control, which is never the only place essential information lives".
3. No dev warning for rich content in a Hint. The docs say plain text only.
4. The date example moves under the boxes as a `Fieldset.Hint`.
5. `FileUpload.Limits` keeps its look. A later plan.
6. Digi stays unverified. Not blocking.
7. `se` has no fixture strings: `form.fixture.tsx` falls back to the English text with `lang="en"` (3.1.2), and says so in a comment.
8. Out of scope.

### Decisions taken in the library implementation (2026-10-04)

1. **One implementation, aliases wrap it.** `FieldHint` (in `field.tsx`) is the part. `FieldsetHint`, `CheckboxGroupHint` and `RadioGroupHint` are thin typed wrappers with their own display names (`Fieldset.Hint`, …), the same pattern as `Fieldset.ErrorMessage`. Types: `FieldHintProps` (a `<p>`'s props without `id`, plus `render`) and `FieldHintState` (the host's `FieldState`).
2. **The host's description props keep `className: 'kv-prose'`.** `useDescriptionPart` and `getDescriptionProps` are unchanged. The Hint takes the host's id and `data-*` and sets its own class `kv-field-hint` in place of the Prose class. No `getHintProps` was added to `useField` and `useFieldset`: a hook user sets `className="kv-field-hint"` after spreading `getDescriptionProps(name)` (documented in `field.md` and `fieldset.md`). A later plan can add `getHintProps` if adopters ask.
3. **Warning.** `warnOnce('hint-outside-field', …)` from an effect, when `useDescriptionPart` reports no host. The message names `Field.Hint` and `Fieldset.Hint`, WCAG 1.3.1 and 3.3.2. Outside a host it renders `<p class="kv-field-hint">` with no id and no `data-*`.
4. **Mask rule.** The masked-Input check looks for any element whose id starts with `<controlId>-description`, and a Hint registers its id through the same `getDescriptionProps`, so a Hint under the Input, or a Prose above it, already clears the warning. Only the message text changed (it now names `Field.Hint`), in `Input`, `OneTimeCode.Input` and `FileUpload` (limits). The OneTimeCode message names a `Field.Hint` and a `Prose`, so its existing test still matches.
5. **Option hint gap.** In a choice row (`.kv-field:has(> :is(.kv-checkbox, .kv-radio))`) a hint is in column 2, and the hint that directly follows the label (`.kv-field-label + .kv-field-hint`) gets `margin-block-start: calc(-1 * var(--kv-field-gap))`, which cancels the row gap (0 gap in both densities). A description (Prose) in the row keeps the gap. It needs the Hint right after the Label in the DOM, which is the documented order.
6. **`FileUpload.Limits` side effect to confirm.** Limits carries the class `kv-prose` through the host's props and sets its own 16px (`kv-file-upload-limits`). The removed position-based rule used to make it 14px when it came after the control. Now it is 16px wherever it sits, matching its own rule and its comment. Decision 5 of the spec questions (a later plan) is unchanged, but the maintainer may want to see this in the Storybook FileUpload page.
7. **Docs outside the plan's list, updated because they stated the old rule:** `packages/theme/README.md` (class list), `.claude/skills/theme-css/SKILL.md` (the Prose-boundary bullet and the Pending note), `.claude/skills/api-conventions/SKILL.md` (alias sets) and `references/dev-warnings.md` (the new warning and the mask row), and `docs/architecture.md` (the part vocabulary row). `prose.tsx`, `prose.md` and `prose.a11y.md` said a Prose "is the hint": corrected in the 2026-10-04 review (a Prose in a Field is the description; the hint is `Field.Hint`).
8. **DESIGN.md** was edited from the spec's §8 by meaning, since the file has moved on since the spec's line numbers (`text-muted` row, `body-small` rule, Text inputs, Parts, label line, Checkboxes and radios, the Theming list and sentence, Don't) and the front matter got `field-hint`.

### Accessibility contract (draft)

- **Roles and ARIA:**
  - The hint is a plain paragraph, referenced by the control's `aria-describedby`.
  - The order is the DOM order of the descriptions (Prose above, Hint below), then the error when the field is invalid.
- **Keyboard and focus:** no change. A hint is not focusable.
- **WCAG success criteria:**
  - 1.3.1 Info and Relationships: the hint is programmatically associated.
  - 3.3.2 Labels or Instructions.
  - 1.4.4 Resize Text and 1.4.12 Text Spacing: 14px with `rem` units, and reflow at 320px.
  - 1.4.3 Contrast: `text` colour on the surface.
- **Announcements:** none of its own. The hint is read as part of the control's description.

### i18n strings

None. Hint text is the adopter's.

### Theming surface

- `.kv-field-hint` uses `--kv-font-body-small-size` and line height, in `--kv-color-text`, in every density.
- Spacing between the control and the hint, and between the hint and the error, comes from the design spec.
- The rule `.kv-field > .kv-prose ~ …` that sets 14px is removed. The `theme-css.test.ts` tests for the old position-based rule (lines 734 to 800) were deleted in 383f811, not rewritten for the Hint: they asserted CSS text, which AGENTS.md rule 13 forbids. The look is reviewed by eye in Storybook, and `theme:check` covers contrast.
- DESIGN.md (lines 274, 334, 489–493 and 512) is updated: the hint is `kv-field-hint` in body-small, and the description is `kv-prose` in body.

## Tasks

- [x] ux-designer: design spec. Hint placement under the control, spacing, option hints for Checkbox and Radio (14px as well, or an exception), the compact density, and the DESIGN.md text
- [x] Failing tests (written, not yet run: the orchestrator runs the gates):
  - the hint registers and `aria-describedby` follows DOM order
  - `data-*` attributes
  - the outside-Field warning
  - axe
- [x] `Field.Hint` and `Fieldset.Hint` (react), using the shared `useDescriptionPart`, plus `CheckboxGroup.Hint` and `RadioGroup.Hint`
- [x] Theme: `.kv-field-hint`, remove the position-based Prose rule, `theme-css.test.ts` (`theme:check` pending, run by the orchestrator)
- [x] Stories (`apps/storybook/src/components/hint/hint.stories.tsx`; no Prose is left under a control in any story or fixture; the `SizeFollowsThePart` story was removed on 2026-10-04 because it put a Hint above the control):
  - `Components/Form/Hint` becomes the Hint page (above versus under, option hints, compact, long Finnish text, RTL, forced colours)
  - form fixtures move under-control Prose to `Field.Hint`
- [x] `field.md`, `fieldset.md`, `field.a11y.md`, `fieldset.a11y.md`, `checkbox-group.a11y.md`, `radio-group.a11y.md`, DESIGN.md (§8 of the design spec applied)
- [x] Record the rule in the `forms` skill and DESIGN.md (Plan 0027), the review checklist, the theme-css and api-conventions skills, and the dev-warnings list
- [x] accessibility-reviewer: APPROVE 2026-10-04 (re-review), the 383f811 condition met by the maintainer's approval
- [x] Maintainer confirms the 8 spec defaults ("Decisions on the spec's open questions"): Confirmed 2026-10-04: a hint is always under the control (the DateInput fixtures had it above; fixed)
- [x] Maintainer approval recorded for the 383f811 gate change: approved as is, 2026-10-04. Rule 13 stands; the deleted clipping, reduced-motion and checkbox-mark checks are not restored (AGENTS.md rule 13, the `theme-css.test.ts` test removal and the test pruning)
- [x] Changeset (minor): `.changeset/field-hint.md`

## Review 2026-10-04

An accessibility review of c4f1cac and 383f811 returned these findings. Fixed in the working tree (uncommitted):

- **Blocking: the same fact proved several times (rule 13).**
  - `field.test.tsx`: the part-class contract was asserted three times. The `rendering` test now covers `Field.Hint` and the consumer-class join (`egen kv-field-hint`) once. The class assertions in the `Field.Hint` block were dropped, and the id and description assertions kept.
  - `fieldset.test.tsx`: dropped the class assertion on `Fieldset.Hint`, and the `keeps its own ref and render` and `outside a Fieldset it warns once…` tests. `Fieldset.Hint` is a one-line wrapper over `Field.Hint`, which has those tests.
  - `hint.stories.tsx`: dropped the play assertions that repeat a component test. Kept the radio option-hint description (no radio test proves it), `expectNoHorizontalOverflow` in `LongFinnish` and the per-story axe run.
  - `field.e2e.ts`: removed the axe entries that the story layer already checks in four themes, and fixed the comment in `the error is read with the input…` (that text is a description, not a hint).
- **Non-blocking.**
  - The server-rendering test now asserts the hint's id in the HTML.
  - `Fieldset` main example, `Keyboard` and `Invalid` stories now have a real `Fieldset.Hint`, so the Tab row exercises one. The Invalid description in the story and e2e includes it.
  - The `CheckboxGroup` and `Fieldset` examples put "Välj alla som passar" in a Prose above the options, and use a real while-answering hint under them (design spec §4.1).
  - `prose.a11y.md`, `prose.md` and `prose.tsx` say a Prose in a Field is the description.
  - This plan's drift (the theme tests, the nb/nn/se fixture strings) and the design spec §9 (computed sizes, which rule 13 forbids) are corrected.
- **Still open (closed 2026-10-04):** the accessibility-reviewer item, the maintainer's confirmation of the 8 spec defaults, and the maintainer's approval of the 383f811 gate change are all ticked above.

Re-review: the two duplicate e2e tests deleted; otherwise APPROVE, on condition of the maintainer's approval of the 383f811 gate change. The maintainer approved it, so the condition is met.

### Hint placement fix 2026-10-04

The maintainer ruled that a hint is always under the control, never above it. The `DateInput` fixtures broke that, and an audit found the same mistake elsewhere. This change moved:

- **Fixtures and stories:** `BirthDate`, `PaperFormDate` and `VisitDate` (`date-input.fixture.tsx`) now render legend, boxes, `Fieldset.Hint`, error. In `hint.stories.tsx` the `SizeFollowsThePart` story (a Hint above the control) is removed.
- **Tests:** the `Birth` fixture in `date-input.test.tsx`, the class test in `field.test.tsx` (hint now after the `Input`), the late-mount order test in `field.test.tsx` (a late `Field.Prose` above, not a late hint), the mask test in `input.test.tsx` (the postal code hint under the `Input`) and the FileUpload description-order tests (`file-upload.test.tsx`: the Field's text is a `Field.Prose`, named `description` in the expected order). No expected `aria-describedby` order changed for the date: the Fieldset's hint and error keep their order.
- **Docs:** `date-input.md`, `date-input.a11y.md`, the JSDoc of `date-input.tsx` and `field.tsx`, `field.md`, `field.a11y.md`, `input-group.md`, the OneTimeCode contract, guide and fixture comments (that text is a description), the `theme.css` comments, the forms skill, DESIGN.md, `docs/design/field-hint.md` (§6.3 rewritten), `form-fields.md` and `one-time-code.md` (terminology notes).
- **Guard:** a dev warning, `hint-before-control`, when a `Field.Hint` or `Fieldset.Hint` is before its control in the DOM (`compareDocumentPosition` in an effect). In a Field the control is the one with the Field's control id. In a Fieldset it is the first `input`, `select` or `textarea` in the `<fieldset>`. Tests in `field.test.tsx` and `fieldset.test.tsx`. Listed in the dev-warnings reference.

## Risks & open questions

- **Option hints.** Today a hint under a checkbox or radio option stays 16px by decision. The maintainer's rule says a hint is 14px. The design spec decides, and the default here is 14px everywhere, for one simple rule.
- **Existing adopters.** A Prose under a control becomes 16px after this change. The changeset says to switch it to `Field.Hint`.

## Testing strategy

- Component tests with axe for the Hint in Field, Fieldset, CheckboxGroup and RadioGroup.
- e2e for the 320px reflow and forced colours runs in the sweep, not per change.

## Rollout

Minor. No deprecation: Prose keeps working, only its size under the control changes.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
