# Plan 0028: Compound naming and part aliases

- **Status:** Done
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** Plan 0027 (where the rules are recorded), Plan 0029 (`Field.Hint`), changes the flat naming rule in the api-conventions skill

## Goal

An adopter can tell from a name alone how a component is built. A component with parts is always written `X.Root` + `X.Part`. A single element is always written flat. When one component is a part of another, the parent offers it under its own name, so a form question reads `Field.Root`, `Field.Label`, `Field.Prose`, `Field.Hint` and `Field.ErrorMessage`.

## Non-goals

- No behaviour change. Aliases are the same components. Only names, display names and docs change.
- No removal of any export. The old names stay as `@deprecated` aliases until 1.0.
- No alias for every component that can sit inside another. Controls (Input, Checkbox, Listbox, Combobox, FileUpload, OneTimeCode) are the content of a Field, not its parts. See rule 3.

## Background

The naming audit (2026-10-04) found:

- **Three shapes in use today.**
  - Namespace objects with `.Root`: Card, InputGroup, OneTimeCode, CheckboxGroup, RadioGroup, Listbox, Combobox, Autocomplete, Popover, FileUpload, Table and Notification.
  - Callable roots shown flat: Field, Fieldset and Link. Per the current flat naming rule, `Label`, `ErrorMessage` and `Legend` are also exported flat.
  - Single elements that also carry a redundant `.Root`: Prose and Section.
- **Missing display names.** Button, Card, Heading, Kbd, Icon, Input, Section and `LinkNewTabNotice` have none, so "Show code" prints `CardRoot` or `SectionRoot`.
- **Aliased parts print the source name.** `Combobox.Option` prints `Listbox.Option`, and `Autocomplete.Control` prints `Combobox.Control`.
- **Group components lack the fieldset parts.** CheckboxGroup and RadioGroup expose only `Root`, so their stories use flat `Legend`, `Prose` and `ErrorMessage`.
- **A name clash.** The core type `FileUploadItem` has the same name as the React component `FileUploadItem`.

## Design

### The rules

1. **A component with two or more public parts is a namespace.**
   - It is written `X.Root` + `X.Part` in docs, stories, fixtures and display names.
   - No callable root: `<Field>` becomes `<Field.Root>`. The old callable root stays as a deprecated alias.
2. **A component that is one element is flat,** with no `.Root`: Button, Heading, Kbd, Icon, Input, Checkbox, Prose and Section. Their existing `.Root` aliases are deprecated.
3. **A component that is a structural part of another is aliased onto the parent.**
   - Structural means the parent's contract registers it, names it or lays it out. Examples: a Field's description, hint and error; a group's legend; a Combobox's popup and options; a RadioGroup's radios.
   - Controls placed inside a Field are content, not parts, and get no alias.
4. **Every exported component has a display name,** and it is the name an adopter writes: `Field.Prose`, not `Prose`, and `Combobox.Option`, not `Listbox.Option`.
   - An alias that needs its own display name is a thin typed wrapper around the shared component. A generic `TItem` must still flow through.
5. **Flat named exports of parts** (`FieldRoot`, `CardHeader`, and so on) stay for tree-shaking and typing. Docs never show them.

### Name changes

| Component     | Today                                                         | After                                                                                                |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Field         | `<Field>`, `<Label>`, `<Prose>`, `<ErrorMessage>`             | `Field.Root`, `Field.Label`, `Field.Prose`, `Field.Hint` (Plan 0029), `Field.ErrorMessage`           |
| Fieldset      | `<Fieldset>`, `<Legend>`, `<Prose>`, `<ErrorMessage>`         | `Fieldset.Root`, `Fieldset.Legend`, `Fieldset.Prose`, `Fieldset.Hint`, `Fieldset.ErrorMessage`       |
| CheckboxGroup | `Root` only                                                   | adds `.Legend`, `.Prose`, `.Hint`, `.ErrorMessage`                                                   |
| RadioGroup    | `Root`, flat `Radio`                                          | adds `.Radio`, `.Legend`, `.Prose`, `.Hint`, `.ErrorMessage` (`Radio` only works inside a group)     |
| Link          | `<Link>`, `Link.NewTabNotice`                                 | `Link.Root`, `Link.NewTabNotice`                                                                     |
| InputGroup    | `Root`, `Addon`                                               | adds `.Input` (the group lays it out)                                                                |
| Combobox      | Listbox parts aliased, display names leak                     | own display names (`Combobox.Option`, `Combobox.Popup`, …), and the rich option parts from Plan 0030 |
| Autocomplete  | Combobox and Listbox parts aliased, display names leak        | own display names                                                                                    |
| Prose         | `Prose`, `Prose.Root`                                         | `Prose`; `.Root` deprecated                                                                          |
| Section       | `Section`, `Section.Root`                                     | `Section`; `.Root` deprecated                                                                        |
| core type     | `FileUploadItem` (core) clashes with `FileUploadItem` (react) | rename the core type to `FileUploadEntry`, and keep the old name as a deprecated type alias          |

Flat `Label`, `ErrorMessage` and `Legend` become deprecated aliases. Docs don't show them.

### Enforcement

- **A unit test over `packages/react/src/index.ts`** checks that:
  - every exported component has a display name;
  - every namespace part's display name is `X.Part`;
  - no single-element component is documented with `.Root`.
- **A test over `apps/storybook/src/components/**` and `packages/react/src/**/*.md`** fails if a multi-part component's flat root or part names appear in JSX. The deprecated aliases are listed in one place.
- The rules go into the `api-conventions` skill (Plan 0027), not into a decision record.

### Accessibility contract (draft)

No change. Same elements, roles and names. `*.a11y.md` files are updated only where they show code names.

### i18n strings

None.

### Theming surface

None. Classes stay `kv-<part>`.

## Tasks

- [x] Display names on every exported component (rule 4), and thin wrappers for the Combobox and Autocomplete aliases
- [x] Namespaces for Field, Fieldset and Link, and the new alias parts on CheckboxGroup, RadioGroup and InputGroup
- [x] Deprecate the callable roots, flat `Label`, `ErrorMessage` and `Legend`, `Prose.Root` and `Section.Root`, and the core `FileUploadItem` type
- [x] Rewrite stories, fixtures, `.md` and `.a11y.md` to the new names (about 450 usages, mechanical)
- [x] Update tests that assert alias identity to assert display names instead
- [x] Enforcement tests
- [x] Record the rules in the `api-conventions` skill (Plan 0027), update `docs/architecture.md#api-conventions`
- [x] Changeset (minor: new aliases and deprecations)

## Decisions

- **Callable roots stay callable.** `Field`, `Fieldset` and `Link` are `Object.assign(Root, parts)`. A JSDoc `@deprecated` can't target `<Field>` without also hitting `Field.Root`, and making them plain objects would break adopters. So `<Field>`, `<Fieldset>` and `<Link>` keep working. Docs and stories never show them, and the naming test bans them there.
- **Alias sets** (2026-10-04):
  - `Field`: `Root`, `Label`, `Prose`, `ErrorMessage`
  - `Fieldset`: `Root`, `Legend`, `Prose`, `ErrorMessage`
  - `CheckboxGroup`: `Root`, `Legend`, `Prose`, `ErrorMessage`
  - `RadioGroup`: `Root`, `Radio`, `Legend`, `Prose`, `ErrorMessage`
  - `InputGroup`: `Root`, `Addon`, `Input`
  - `Link`: `Root`, `NewTabNotice`
  - `Hint` joins the field and group sets in Plan 0029.
- **Flat part exports are the Server Component path** (2026-10-04). A Server Component can't dot into a client module, so every namespace part keeps a flat named export (`FieldRoot`, `FieldProse`, `RadioGroupRadio`, `LinkRoot`), the same component as the part, and none is deprecated. Only the bare `Label`, `ErrorMessage`, `Legend` and `Radio` are. The naming test checks `<Export><Key>` for every part, and the skill and the changeset say so.
- **Implementation choices** (2026-10-04):
  - `Fieldset.ErrorMessage` and `FieldsetErrorMessage` are a wrapper with their own display name, not a duplicate of `Field.ErrorMessage`, so `FieldsetErrorMessage` is not deprecated. The group parts (`CheckboxGroup.Legend|Prose|ErrorMessage`, `RadioGroup.…`) wrap the Fieldset's parts.
  - The flat `Radio` is deprecated too, in favour of `RadioGroup.Radio` (`RadioGroupRadio` in a Server Component), because it only works inside a group. `Fieldset.Prose` and `Field.Prose` wrap the shared `Prose`, which keeps the name `Prose` outside a host.
  - Autocomplete's popup parts wrap Combobox's wrappers, which wrap Listbox's, so each hop has its own display name.
  - `Link.Root` is the new `LinkRoot` export (it was a private function). Dev-warning text that says "a `<Prose>` in the Field" is unchanged.
  - No `XxxProps` aliases for the new wrappers: they take the shared part's props type.
- **Display names follow the alias.**
  - An alias that is a different name for a shared component (`Field.Prose`, `Combobox.Option`, `CheckboxGroup.Legend`) is a thin wrapper with its own `displayName`.
  - A callable root's own name is `X.Root`.

- **Flat part exports are the Server Component form.** A React Server Component can't dot into a client module, so `Field.Root` fails in Next's App Router. Every namespace part and alias also has a flat named export (`FieldRoot`, `RadioGroupRadio`, `ComboboxOption`, …). These are not deprecated, and the naming test checks that they exist. Only the bare names `Label`, `ErrorMessage`, `Legend` and `Radio` are deprecated. `apps/docs` keeps the callable `<Link>`.

- **One e2e change.** `input-group.e2e.ts` "a click on the Button keeps its own behaviour" now opens the `Keyboard` story. `SearchWithClear`'s play function types and clears the search itself, which raced the test. The meaning of the test is unchanged.

## Risks & open questions

- **Generic thin wrappers.** A wrapper around a generic component (`ListboxOption<TItem>`) must keep inference. Test the types with `expectTypeOf`.
- **Deprecation noise.** Adopters on `<Field>` get deprecation hints in their editor. That is intended.

## Testing strategy

- `vp test run` on react, plus the enforcement tests.
- A Storybook build: "Show code" prints the new names.
- No e2e change is expected. Run the specs for any story whose selectors use display names.

## Rollout

Minor version. Deprecated names are removed at 1.0, together with a codemod note in the changeset.

## Done when

- [x] Enforcement tests pass, and no story or `.md` uses a deprecated name
- [x] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [x] Plan tasks ticked, `docs/roadmap.md` status updated
