# ADR-0055: Field, Label, ErrorMessage, Fieldset and Legend are flat names

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Magnus Vike (asked for `<Field required><Label>…`), proposed with ADR-0054
- **Tags:** api

## Context

A form question read `<Field.Root><Field.Label>…<Prose>…<Input>`: the root and the label carry a prefix, the hint and the control don't. Prose, Section and Link already export the component under its own name (`Prose`, with `Prose.Root` as an alias).

## Decision

1. **`Field` is the root component**, and `Field.Root`, `Field.Label`, `Field.Prose` and `Field.ErrorMessage` stay as aliases of the same components, as `Prose.Root` does.
2. **`Label` and `ErrorMessage` are exported on their own** (the same components as `Field.Label` and `Field.ErrorMessage`). **`Fieldset` is the root and `Legend` stands alone**, with `Fieldset.Root`, `.Legend`, `.Prose` and `.ErrorMessage` as aliases.
3. **The display names are the flat names** (`Field`, `Label`, `ErrorMessage`, `Fieldset`, `Legend`, `Prose`), so Storybook's "Show code" and test snapshots read `<Field>` and `<Prose>`, not `<Field.Root>` or `<ProseRoot>`.
4. The named exports `FieldRoot`, `FieldLabel`, `FieldErrorMessage`, `FieldsetRoot`, `FieldsetLegend`, `FieldsetErrorMessage` and `ProseRoot` stay. Nothing is removed, so there is no breaking change. Docs and stories show the flat form.

## Consequences

- Positive: shorter, and the same shape as Prose, Section and Link. Fewer imports of the form `Field.*`.
- Negative: `Label`, `ErrorMessage` and `Legend` are generic names in a consumer's namespace. Import them under another name if they clash.
- Negative: two ways to write the same thing, by design (aliases, not variants).

## Validation

Tests for identity of the aliases, the display names, and a render of the flat form (name, description, error).

## References

- ADR-0029, ADR-0044, ADR-0052, ADR-0054
