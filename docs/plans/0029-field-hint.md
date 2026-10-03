# Plan 0029: Field.Hint

- **Status:** Draft
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** Plan 0028 (names), changes the hint rule in the forms skill, design spec `docs/design/` (ux-designer, first task)

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
- The rule `.kv-field > .kv-prose ~ …` that sets 14px is removed. `theme-css.test.ts` lines 734 to 800 are rewritten for the Hint.
- DESIGN.md (lines 274, 334, 489–493 and 512) is updated: the hint is `kv-field-hint` in body-small, and the description is `kv-prose` in body.

## Tasks

- [ ] ux-designer: design spec. Hint placement under the control, spacing, option hints for Checkbox and Radio (14px as well, or an exception), the compact density, and the DESIGN.md text
- [ ] Failing tests:
  - the hint registers and `aria-describedby` follows DOM order
  - `data-*` attributes
  - the outside-Field warning
  - axe
- [ ] `Field.Hint` and `Fieldset.Hint` (react), using the shared `useDescriptionPart`
- [ ] Theme: `.kv-field-hint`, remove the position-based Prose rule, `theme-css.test.ts`, `theme:check`
- [ ] Stories:
  - `Components/Form/Hint` becomes the Hint page (above versus under, option hints, compact, long Finnish text, RTL, forced colours)
  - form fixtures move under-control Prose to `Field.Hint`
- [ ] `field.md`, `fieldset.md`, `field.a11y.md`, DESIGN.md
- [ ] Record the rule in the `forms` skill and DESIGN.md (Plan 0027)
- [ ] accessibility-reviewer
- [ ] Changeset (minor)

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
