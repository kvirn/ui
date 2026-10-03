# ADR-0054: Prose is the description of a Field or Fieldset

- **Status:** Proposed
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (asked for Prose instead of Description), proposed with Plan 0025
- **Tags:** api, a11y, breaking

## Context

`Field.Description` (and `Fieldset.Description`, the same component) is a `<p>` that registers its id so the control gets `aria-describedby` (ADR-0029, ADR-0031). It is a second way to write text set for reading, next to `Prose` (ADR-0052), with its own class and its own copy of the body-text rules.

## Decision drivers

- One way to write text set for reading.
- Keep the association mechanism (ids in DOM order, then the error).
- No silent change for a Prose outside a form.

## Decision

1. **`Prose` inside a `Field.Root` or `Fieldset.Root` is the description.** It registers with the host like `Field.Description` did, gets the id from it, and is listed in `aria-describedby` in DOM order. Registration is automatic: a Prose in a Field that isn't a hint goes outside the Field or into a `kv-not-prose` element.
2. **`Field.Description`, `Fieldset.Description` and their types are removed** (breaking, pre-1.0, no deprecation). `useField` and `useFieldset` keep `descriptionProps` and `getDescriptionProps`, and their class is `kv-prose`.
3. **`Field.Prose` and `Fieldset.Prose` are aliases of `Prose`** (the same component, like `Prose.Root`), so the hint reads as part of the Field. They add nothing: a `Prose` in a Field registers either way.
4. **The registration is one internal hook** shared by Prose and `FileUpload.Limits`, which stays.
5. **Outside a Field or Fieldset, Prose is unchanged** and does not warn.
6. **Theme:** `.kv-field-description` is removed. A `kv-prose` inside a field or fieldset is prose again (the nearest boundary wins, as for cards). A hint above the control stays the body size, and a hint under it is `body-small` (14px), both in the text colour in every density and never muted. This changes DESIGN.md's "hints are never `body-small`" (Magnus Vike, 2026-10-03).

## Consequences

- Positive: one text component, one set of rules, a hint can have several paragraphs.
- Positive: less API and less CSS.
- Negative: breaking. Every `Field.Description` becomes `<Prose><p>…</p></Prose>`, which is more to type for the common one-line hint.
- Negative: an accessible description is plain text, so a heading, list or link inside the hint loses its structure. The contract says to keep a hint short.
- Negative: a Prose that isn't a hint can't sit directly in a Field.

## Validation

Tests for id registration, DOM order, several hints, and no registration outside a host. axe in every story state. `theme:check`. The manual AT matrix stays `pending`.

## References

- Plan 0025, ADR-0029, ADR-0031, ADR-0052
