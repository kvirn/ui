# Plan 0097: Icon `size` is a pixel string, converted to rem by a class

- **Status:** Approved (maintainer, 2026-10-10)
- **Owner:** lead
- **Related:** Plan 0044 (the step scale, reversed here), Plan 0096 (`size` picks a `kv-<part>--<option>` class), `docs/design/icon.md`

## Goal

`size` on a component is never a bare number of steps (`4`, `5`, `6`, `8`). It is the size in pixels, written as a string: `size="20"`, `size="24"`. The theme turns it into rem with a class.

## Scope

Icon is the only component whose `size` is a numeric step. `Heading.size` and `Container.size` are named unions, `Listbox`/`Combobox` `size` is the native visible-row count and `Table`'s spacer `size` is internal. None of these change.

## Design

- `IconSize` is a closed union of pixel strings: `'12' | '14' | '16' | '20' | '24' | '28' | '32' | '40' | '48' | '56' | '64' | '80' | '96'`. `IconScale` is removed. A bare number and a CSS length (`'48px'`, `'2rem'`) are no longer accepted: another size is a class the consumer adds (Plan 0096).
- Default `'20'` (was step 5). Old steps map by × 4: `4`→`'16'`, `5`→`'20'`, `6`→`'24'`, `8`→`'32'`, `10`→`'40'`, `12`→`'48'`.
- `useIcon` returns `className: 'kv-icon kv-icon--size-20'`, plus `width` and `height` as `<px / 16>rem`, so an unthemed icon is still sized. `data-size` is removed (`data-*` is state, never a choice).
- `theme.css`: `.kv-icon--size-<px>` for each value in the union sets `inline-size` and `block-size` in rem (`1.25rem` for 20). Vertical alignment in running text moves from `[data-size]` to the same classes and is computed from the rem size, so it stays centred on the capital height in any text size.
- Icons no longer grow with the surrounding text size, only with the root font size (1.4.4 holds: rem scales with the user's setting).
- `iconDefaults.size` takes `IconSize`.

## Tasks

- [x] `icon.test.tsx` first: each size sets the class, `width`, `height` in rem; the default is `'20'`; a nested `KvirnProvider` merges `iconDefaults.size`; a type test rejects `4`, `'48px'` and `'13'`
- [x] `use-icon.ts`, `icon.tsx`, `kvirn-provider.tsx` (doc comment), `index.ts` exports (`IconScale` out)
- [x] `theme.css` section 11 and `theme:check`
- [x] Every call site: `apps/docs`, `apps/storybook`, `packages/patterns`, `packages/rich-text`, `packages/react` (`size={5}` → `size="20"`, `'48px'` → `'48'`, `'2.5rem'` → `'40'`)
- [x] Docs: `icon.md`, `icon.a11y.md`, `kvirn-provider.md`, `apps/docs/content/icon.api.ts`, `apps/docs/examples/icon/*`, `DESIGN.md` (Icon), `docs/design/icon.md`, the design skill if it names steps
- [x] `accessibility-reviewer` on the diff (findings fixed, pending re-review)

## Decisions

| Option                                   | Verdict                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Pixel string, closed union, class in rem | **Chosen.** One readable unit, typed, the theme owns the value          |
| Any `${number}` string, inline width     | Rejected: no class to map to, and a free value is a presentation prop   |
| Keep the em step scale                   | Rejected by the maintainer: a bare `5` reads as nothing without a table |

### Taken during implementation

- `IconPartProps.className` is the template type `` `kv-icon kv-icon--size-${IconSize}` ``, and `width`/`height` are `string` (`<px / 16>rem`).
- Vertical alignment: `calc((0.7em - <size>) / 2)` per size class; `'24'` floors at `-0.375em` (`max(...)`), so it fits the line box from line height 1.5. At 16px text: `'16'` -0.15em, `'20'` -0.275em, `'24'` -0.375em, the same as before; `'28'` and up use the plain formula and grow the line box.
- `.kv-field-error-message` and `.kv-character-count` centre their icon with `1.25rem` (was `1.25em`), as the icon is rem now.
