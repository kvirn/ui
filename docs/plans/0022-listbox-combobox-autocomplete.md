# Plan 0022: Popover, Listbox, Combobox and Autocomplete

- **Status:** In progress
- **Owner:** main session (orchestrator) with component-engineer
- **Created:** 2026-10-02 · **Target:** M2 (Popover, Listbox) and M3 (Combobox, Autocomplete), built together
- **Related:** ADR-0037 (revised: Listbox replaces NativeSelect), ADR-0046 (overlay layer), ADR-0034, ADR-0036, ADR-0039, ADR-0040, ADR-0029
- **Design spec:** [`docs/design/combobox.md`](../design/combobox.md), written as a design review after the build (status In review). The default-theme styling uses existing `--kv-*` tokens.

## Goal

A user can pick one or several options from a list, filter a long list by typing, or get suggestions for free text, with the keyboard, a screen reader or touch, in all six locales. Developers get the parts as individual components (`Popover`, `Listbox`) and composed (`Combobox`, `Autocomplete`).

## Non-goals

- Inline completion (`aria-autocomplete="both"`), ADR-0037 item 6.
- Menu, Tooltip, Dialog, Portal (they reuse `usePopup` later).
- CSS anchor positioning (ADR-0046, item 6).
- ScrollArea (ADR-0036) and the virtualizer helper (ADR-0034). The popup scrolls natively (`overflow: auto`, max height) in this plan. Virtualization (`virtualizer` prop, `aria-setsize` and `aria-posinset`) is a follow-up plan, but the core API reserves the active-index and "always render active and selected" contract so it isn't a rewrite.
- The manual AT matrix. It stays `pending`.

## Background

APG: Select-Only Combobox, Editable Combobox With List Autocomplete, Listbox. ARIA 1.2 combobox. WCAG 2.4.11, 1.4.10, 4.1.2, 4.1.3. Prior art: GOV.UK accessible-autocomplete, Sarah Higley's "Select your poison", React Aria, Headless UI.

## Design

### API sketch

```tsx
// Listbox, single. Native `<select>` on touch (native="auto").
<Field.Root>
  <Field.Label>Municipality</Field.Label>
  <Listbox.Root items={municipalities} itemToString={(m) => m.name} itemToKey={(m) => m.code}
    value={code} onValueChange={setCode} name="municipality">
    <Listbox.Trigger><Listbox.Value placeholder="Choose" /></Listbox.Trigger>
    <Listbox.Popup>
      <Listbox.List>{(item) => <Listbox.Option item={item} />}</Listbox.List>
      <Listbox.Empty />
    </Listbox.Popup>
  </Listbox.Root>
</Field.Root>

// Combobox (multiple)
<Combobox.Root items={...} multiple value={codes} onValueChange={setCodes}>
  <Combobox.ValueList />
  <Combobox.Input />
  <Combobox.Popup>…same Listbox parts…</Combobox.Popup>
</Combobox.Root>
```

Hooks: `usePopup`, `useDismissableLayer`, `useListbox`, `useCombobox`. Core: `computePlacement`, `createDismissableLayerStack`, `createListbox`, `createCombobox`, `filterItems`. The exact prop names follow `docs/architecture.md#api-conventions` and are settled in the code review of the first phase.

### Accessibility contract (draft)

Focus strategy: Listbox (custom) and Combobox keep DOM focus on the trigger or input and use `aria-activedescendant`. Arrows don't wrap (ADR-0037 item 8).

| Key (open popup)            | Listbox (select-only)                         | Combobox, Autocomplete                                                                     |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tab                         | Selects the active option, moves on           | Closes the popup without selecting                                                         |
| Shift+Tab                   | Same, backwards                               | Same                                                                                       |
| ArrowDown / ArrowUp         | Next / previous option. No wrap               | Same. First press from the input activates the first (last) option                         |
| Home / End                  | First / last option                           | Move the caret in the input                                                                |
| Page Down / Page Up         | Ten options                                   | Ten options                                                                                |
| Enter                       | Selects the active option and closes (single) | Selects the active option. Does nothing if none is active (the form isn't submitted by us) |
| Space                       | Selects the active option (single)            | Types a space                                                                              |
| Escape                      | Closes, keeps the value                       | Closes, keeps the value and the text                                                       |
| Alt+ArrowDown / Alt+ArrowUp | Opens without moving / selects and closes     | Same                                                                                       |
| Printable characters        | Typeahead (start of label, locale-aware)      | Typed into the input, which filters                                                        |

Closed popup: ArrowDown, ArrowUp, Enter and Space (Listbox only) open it. In multiple mode the popup stays open after a choice, and each chosen value is a remove button (`combobox.removeValue`), with focus moving to the next remove button, else the previous, else the input.

- Roles / ARIA: `role="combobox"` on the trigger (`div`, `tabindex=0`) or the `<input>`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`, `aria-activedescendant` always pointing at a rendered option, `aria-autocomplete="list"` on the input. Popup `role="listbox"` (`aria-multiselectable` when multiple), options `role="option"` with `aria-selected` and `aria-disabled`. Groups use `role="group"` with `aria-labelledby`.
- Naming: the Combobox input by `<label for>`. The Listbox trigger by `aria-labelledby` to the Field label (the label needs a stable id, a gap in `use-field.ts` to check first), and `aria-describedby` and `aria-invalid` from Field.
- Focus management: opening never moves DOM focus. No option is active until an arrow key, so Enter never selects something the user didn't choose. Escape and outside press close without moving focus.
- Announcements (Announcer, debounced about 500 ms after typing stops): `combobox.resultCount`, `combobox.noResults`, `combobox.loading`. We never announce the active option.
- Typed text is never cleared silently (3.3.1, 3.3.3).
- Native rendering of Listbox: a `<select>` named by `<label for>`, with `<optgroup>`. Parity: same value, same `name`, same Field wiring.
- WCAG SCs: 1.3.1, 1.4.10, 1.4.11, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.8, 3.2.2, 3.3.1, 3.3.3, 4.1.2, 4.1.3.

### i18n strings

Add the `combobox` namespace in `packages/i18n/src/types.ts` and all six locales (others are editing the same files now, so add keys without touching existing lines):

| Key                    | en                         | sv                            |
| ---------------------- | -------------------------- | ----------------------------- |
| `combobox.resultCount` | 1 result / {count} results | 1 resultat / {count} resultat |
| `combobox.noResults`   | No results                 | Inga resultat                 |
| `combobox.loading`     | Loading results            | Laddar resultat               |
| `combobox.removeValue` | Remove {label}             | Ta bort {label}               |
| `combobox.clear`       | Clear                      | Rensa                         |
| `combobox.showOptions` | Show options               | Visa alternativ               |

### Theming surface

Classes and `data-*` as in ADR-0037 item 14 and ADR-0046 item 3. `kv-native-select` becomes `kv-listbox-native`. Popup: level 3 elevation (`--kv-shadow-popup`), `xl` radius, 8px padding, items at least 44px (32px compact), per `DESIGN.md`.

## Tasks

Phase 1, core (pure, node tests, two engineers in parallel on separate folders):

- [x] `core/src/overlay/`: `computePlacement` and `createDismissableLayerStack` + unit tests (ADR-0046)
- [x] `core/src/listbox/` (`createListbox`: items, active index, selection single and multiple, typeahead, disabled, page jumps) and `core/src/combobox/` (`createCombobox`: modes, open state, input value, filter, no-silent-clear) and `filterItems` (`Intl.Collator`, sv/fi/en tests with å ä ö) + unit tests

Phase 2, React (after phase 1):

- [x] `usePopup`, `Popover`, `useDismissableLayer` (React, tests, `popover.a11y.md`, `popover.md`, stories and e2e written; gates not yet run)
- [ ] `Listbox` custom and native rendering, replacing `NativeSelect` (rename files, stories, e2e, theme class, `index.ts`, Field docs, changeset)
  - [x] Rename, native rendering only (superseded: the native select is no longer a public part, see ADR-0037 notes): `kv-listbox-native`, stories and e2e under `components/listbox/`, breaking changeset
  - [x] Custom popup rendering (`Listbox.Root` and the popup parts), `native="auto"`, `useListbox`, an internal native select (not exported), contract `listbox.a11y.md`, `listbox.md`, stories (`listbox.stories.tsx`, with the Native… stories for `native="always"`), e2e `listbox.e2e.ts`, default-theme `kv-listbox-*` styles; gates not yet run
- [x] `Combobox` (single, multiple) and `Autocomplete` (`useCombobox`, `useAutocomplete`, the compound parts, contracts `combobox.a11y.md` and `autocomplete.a11y.md`, `combobox.md` and `autocomplete.md`, tests, default-theme `kv-combobox-*` and `kv-autocomplete-*` styles, stories and e2e under `components/combobox/` and `components/autocomplete/`, ADR-0050; gates not yet run, manual AT `pending`)
- [x] i18n keys in all six locales (`combobox` namespace; `se` machine-drafted, marked for native review)

Phase 3:

- [ ] Stories (every state, RTL, forced colors, `Keyboard` story), e2e per contract row, 320px, reduced motion
- [ ] `listbox.a11y.md`, `combobox.a11y.md`, `autocomplete.a11y.md`, `popover.a11y.md` and component `.md` docs
- [ ] Changesets, roadmap rows (Listbox, Popover, Combobox, Autocomplete), `docs/plans/README.md`
- [ ] Review: `accessibility-reviewer` on the diff, then `ux-designer` design review (and write `docs/design/combobox.md` if the review asks for one)

## Risks & open questions

- `aria-activedescendant` on VoiceOver and TalkBack. Mitigation: the AT matrix, and `native="auto"` on touch for single choice. Combobox on touch stays custom and needs the matrix.
- `popover="manual"` light dismiss is ours, so outside press and Escape must be tested on Safari 17.
- Hydration switch of the Listbox rendering on touch (one frame of the custom trigger). Documented, with `native="always"`.
- The Field label id for `aria-labelledby` (check `use-field.ts`).
- Others are editing `i18n` locale files, `roadmap.md` and `plans/README.md` at the same time. Edit those additively, never overwrite.

## Testing strategy

Core: node unit tests. React: browser-mode component tests with axe in every state (`expectNoA11yViolations`), `aria-activedescendant` always pointing at a rendered option, hidden inputs and `FormData`. e2e: one test per contract row, plus the forced-colors, reduced-motion and 320px projects.

## Rollout

Minor changesets for `core` and `react`. The `NativeSelect` to `Listbox` rename is breaking, marked as such.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
