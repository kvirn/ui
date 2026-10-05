# Plan 0030: Rich Listbox options

- **Status:** Implemented (2026-10-05); accessibility-reviewer and manual AT pending
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** Plan 0022, Plan 0028 (aliases on Combobox and Autocomplete), Plan 0026 (virtualization)

## Goal

An adopter can put an icon, a flag, an avatar or a second line in a Listbox, Combobox or Autocomplete option with a few small parts, and the option is still named correctly. For full control there is the `render` function, which receives the option's state, and the docs show it.

## Non-goals

- No rich content in the native `<select>` mode. A native `<option>` holds text only, so the native mode keeps the `itemToString` label. The docs say so, and `native="never"` keeps the popup on touch devices.
- No change to keyboard behaviour, typeahead or filtering. These keep using `itemToString`.
- No image loading, lazy loading or avatar component.

## Background

- **What works today.** `Listbox.Option` takes `children` (any node) and `render` with `ListboxOptionState` (`isActive`, `isSelected`, `isDisabled`, `item`, `label`). Combobox and Autocomplete reuse it.
- **The accessible name is the option's whole text content.** A second line becomes part of the name.
- **The theme has nothing for icons.** The option is a flex row with a gap, and has no icon, image or secondary-line rules. The selected tick is a CSS `::after` that can't be replaced.
- **The current `RichOptions` stories** use inline styles and a `<small>` with `var(--kv-listbox-option-hint)`. No option anywhere has an icon.
- **The trigger.** `Listbox.Value` takes a function child, `(selectedItems) => …`, so a trigger can show the selected option's icon. No story shows it.
- **Prior art.** React Aria ListBox `Text slot="label" | "description"` (`aria-labelledby` and `aria-describedby` on the option), Radix Select `ItemText` / `ItemIndicator`, and Base UI `Select.ItemText` / `ItemIndicator`.

## Design

### API sketch

```tsx
<Listbox.Option item={country}>
  <Listbox.OptionIcon>
    <img src={country.flag} alt="" />
  </Listbox.OptionIcon>
  <Listbox.OptionText>{country.name}</Listbox.OptionText>
  <Listbox.OptionDescription>{country.capital}</Listbox.OptionDescription>
  <Listbox.OptionIndicator />
</Listbox.Option>
```

Combobox and Autocomplete expose the same parts (`Combobox.OptionIcon`, …), following Plan 0028.

- **`OptionIcon`:**
  - A `<span class="kv-listbox-option-icon" aria-hidden="true">` at the start, for an `<Icon>`, an `<img alt="">` or an avatar.
  - It is decorative. Anything it means must also be in the text.
- **`OptionText`:**
  - A `<span>` with an id. When it is present, the option gets `aria-labelledby` pointing at it, so the name is the text alone.
  - When it is missing, the name is the content, as today.
- **`OptionDescription`:**
  - A `<span>` with an id. The option gets `aria-describedby` pointing at it.
  - Theme: body-small, in `--kv-listbox-option-hint`.
- **`OptionIndicator`:**
  - A `<span class="kv-listbox-option-indicator" aria-hidden="true">` at the end.
  - It shows the check when the option is selected. Its children replace the check.
  - When it is present, the CSS `::after` tick is hidden. Selection state is still `aria-selected`.
- **`render`:** the function form `(optionProps, state) => …` is documented as the way to build your own option. A story shows it.
- **Trigger:** a story shows `Listbox.Value` with a function child that renders the selected option's icon and text.
- **Native mode:** the parts don't render, and the `<option>` text is `itemToString`. If you use rich parts with `native="auto"`, a dev note in the `.md` tells you to pass `native="never"` if the icon carries meaning.

### Accessibility contract (draft)

- **Keyboard:** no change. Arrows, Home/End, typeahead and Enter/Space are unchanged.
- **Roles and ARIA:**
  - `role="option"` has `aria-labelledby` (pointing at OptionText) when an OptionText is present, and `aria-describedby` (pointing at OptionDescription) when an OptionDescription is present.
  - OptionIcon and OptionIndicator are `aria-hidden`. `aria-selected` is unchanged.
- **Announcements:**
  - The active option is read through `aria-activedescendant`.
  - **AT risk:** support for descriptions on an active descendant varies across NVDA, JAWS, VoiceOver and TalkBack. Add rows to the AT matrix. The fallback is that the description is not announced, and the name still is.
- **WCAG success criteria:**
  - 1.1.1 Non-text Content: decorative icons and images are hidden.
  - 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value.
  - 1.4.3 Contrast: the description in the active state uses `on-primary`.
  - 1.4.11 Non-text Contrast: the indicator.
  - 1.4.10 Reflow: two-line options wrap at 320px.
- **Typeahead and filtering** use `itemToString`, which must equal the OptionText. A dev warning `listbox-option-text-mismatch` fires when the text content of OptionText differs from `itemToString`.

### i18n strings

None.

### Theming surface

- Option layout becomes a grid with these areas: `icon text indicator`, and `icon description indicator` on a second row.
- Icon size is 1.25em. An image is at most 2rem and uses `object-fit: cover`.
- The description is body-small in `--kv-listbox-option-hint`, and `on-primary` when active.
- Forced colours: the indicator uses `CanvasText`, and `HighlightText` when active.
- Virtualized lists already measure each option, so a two-line option gets its real height.

## Tasks

- [x] Failing tests (Listbox, Combobox, Autocomplete):
  - name and description wiring
  - aria-hidden parts
  - the indicator replaces the tick
  - native mode drops the parts
  - the mismatch warning
  - axe
  - a virtualized two-line option
- [x] Parts in react (shared, aliased per Plan 0028)
- [x] Theme rules and `theme:check`
- [x] Stories:
  - Listbox: country with flag and capital, people with avatar and email, a custom indicator, `render` function form, the trigger showing the icon
  - Combobox and Autocomplete: one rich story each
  - Replace the inline-styled `RichOptions` stories
- [x] `listbox.md`, `combobox.md`, `autocomplete.md`, and the three `.a11y.md` files (name and description rows, AT matrix rows)
- [x] e2e: the active rich option reads its name. Run in Chromium per change, and the AT rows stay `pending`
- [ ] accessibility-reviewer
- [x] Changeset (minor)

## Risks & open questions

- **`aria-describedby` on options that are announced through `aria-activedescendant`** is not read everywhere. The name is always right, so it's acceptable. The AT matrix records what each reader does.
- **A long OptionText with a description at 320px.** Both lines wrap, and the indicator keeps its column.

## Testing strategy

Component tests with axe for every new part, in all three components. Chromium e2e for the keyboard and name rows that change.

## Rollout

Minor, and additive.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT may be `pending`): scoped runs 2026-10-05, `vp check`, `vp test run` (listbox, combobox, autocomplete, theme), the three e2e specs on chromium, `theme:check`
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

## Decisions during implementation

- **Any markup stays allowed (maintainer, 2026-10-05).** The four parts are optional helpers on top of free-form `children`. Nothing narrows or sanitises content. A test renders an `<Icon>`, an svg, divs and spans in every part and in a bare option.
- **The two-line layout** is a grid only when an option has an `OptionDescription` (`:has()`), so free-form children keep the flex row. `gap: 0` in the grid, because the row's own gap would become a row gap.
