# Plan 0031: Pointer focus on text inputs

- **Status:** In progress
- **Owner:** Maintainer / Claude
- **Created:** 2026-10-04 · **Target:** M1
- **Related:** Plan 0013 (form fields), Plan 0019 (OneTimeCode), Plan 0026 (Combobox, Autocomplete)

## Goal

A click or tap in a text input shows focus as a primary-coloured edge only. Keyboard focus keeps the 2px focus ring with its 2px offset. Today every text input draws the ring on a click as well, because browsers match `:focus-visible` on any element that takes text, whatever moved the focus. On a drawn OneTimeCode, the ring goes around the whole row.

## Non-goals

- No change to buttons, checkboxes, radios, links or the listbox trigger. For those, the browser's `:focus-visible` already leaves out pointer focus.
- ~~No new token.~~ Changed at the maintainer's request: the click edge is a new token, `border-focus` (`primary-600` in light, a step darker than the ring; the ring's step in dark and the contrast themes, where a darker step would lose contrast). It is held to everything `border-control` is.

## Design

**Modality.** `useFocusVisible` (internal, `packages/react/src/focus-visible/`) notes a `pointerdown` anywhere in the document, and clears it at the next `focusin` (bubble phase on the document, after React's handlers have read it), one task after the `click` (so a click on page text marks no later focus), on `pointercancel`, or at any key other than a lone modifier. A text-entry element (`textarea`, or an `input` that takes text) shows the ring when it matches `:focus-visible` and no pointer went down since the last focus. Every other element follows the browser, so Button, Link, Checkbox, Listbox and FileUpload are unchanged. The listeners are installed once, from an effect, so the module stays SSR-safe.

- A focus with no pointer before it shows the ring: a screen reader's browse-mode focus, Tab back from the browser chrome, an access key, Ctrl+K, or a script after a click elsewhere. A script focus inside the click's own task still counts as a click (in Safari and macOS Firefox a button click doesn't focus the button), which affects only mouse users. This follows React Aria's "virtual" modality, and keeps 2.4.7 for those users (accessibility-reviewer, blocking finding 1).
- Decision: keys pressed after a click (arrows in a Combobox) don't bring the ring back until the next focus. The edge and the caret stay.

**State.** Text-entry parts (Input, OneTimeCode.Input, the Combobox and Autocomplete input) also get `data-focused` while they have focus. It is the theme's signal that the script has run. InputGroup.Root reads the same modality for its `data-focus-visible`.

**Theme.** For `.kv-input`, `.kv-one-time-code-input`, `.kv-combobox-input` and `.kv-autocomplete-input`, and for the boxes `.kv-input-group`, `.kv-combobox-control` and `.kv-autocomplete-control`:

- **Any focus** (`:focus`, or `:has(> input:focus)` for a box): the edge becomes `border-focus` at 2px, and the browser's own ring (`outline: auto`) is replaced by a transparent one, which forced colours paint. The width goes through the edge-width variable, so the padding gives the pixel back and nothing moves. The maintainer first chose 1px, then 2px: at 1px the change from `border-control` was colour only (about 1.2:1 between the states). In forced colours it stays 1px `Highlight`, because there 2px alone means invalid. An invalid control keeps its 2px `danger` edge, and a disabled one keeps its dashed edge.
- **Keyboard focus**: the ring is drawn on `[data-focus-visible]`, or on `:focus-visible:not([data-focused])`, so it still shows before the script runs (no JS: a click shows the ring as it does today).
- **Forced colours**: the focused edge is `Highlight`, and so is the ring.
- On a drawn OneTimeCode, a click shows only the active box's 2px `focus-ring` edge, which is already drawn. Keyboard focus adds the ring around the row.

### Options weighed

1. **Mirror `:focus-visible` (today).** The ring shows on a click in a text input. This is what the maintainer asked to change.
2. **Ring only from `data-focus-visible`.** Simple, but there's no ring before the script runs. Rejected: focus would be invisible to keyboard users on a slow page (2.4.7).
3. **Modality in the hook, with `data-focused` as the no-JS fallback.** Chosen.

## Accessibility contract changes

- 2.4.7 Focus Visible: keyboard focus still shows the ring, and it also shows before hydration. Pointer focus shows the primary edge and the caret.
- 2.4.13 Focus Appearance (AAA, which the default theme meets) applies to keyboard focus. The pointer edge is an extra cue, not the focus indicator.
- `input.a11y.md` stopped saying "also on click in text inputs". DESIGN.md (Focus ring, Inputs) is updated in the same change, with the maintainer's approval.

## Tasks

- [x] Plan
- [x] Tests: the modality in `use-focus-visible.test.tsx`, the theme rules in `theme-css.test.ts`, and the e2e for a click in Input, InputGroup, Autocomplete and the drawn OneTimeCode
- [x] `useFocusVisible`: modality and `isFocused`. Input, OneTimeCode and Combobox: `data-focused`. InputGroup: modality
- [x] theme.css: the edge on focus, the ring on keyboard focus, and forced colours
- [x] Docs: DESIGN.md, `input.a11y.md`, `input-group.a11y.md`, `one-time-code.a11y.md`, the styling contract in `architecture.md`, and the `theme-css` skill
- [x] Changeset (theme: minor, because `colorTokenNames` gains `border-focus`; react: patch)
- [x] Gates, 2026-10-04: `vp check` 0 errors; `vp test run` 382; e2e chromium input 48, input-group 31, one-time-code 60, combobox 85, autocomplete 72; `theme:check` 628 pairs
- [x] accessibility-reviewer: APPROVE on the fourth pass, 2026-10-04, after the Combobox and Autocomplete contracts were fixed (the third pass's APPROVE was followed by a CHANGES REQUIRED re-review). Earlier: APPROVE on the third pass (first pass: CHANGES REQUIRED, the three blocking findings fixed: modality reset per focus, text entry only, Autocomplete and drawn OneTimeCode click e2e. Second pass: the flag is also cleared after the click)

## Verification

- Tab into an Input: the 2px ring, 2px outside, and the edge turns primary.
- Click in an Input: the edge turns primary, with no ring. Then press Shift+Tab and Tab: the ring is back.
- The same in InputGroup, Combobox, Autocomplete and OneTimeCode (plain and drawn).
- Invalid: the danger edge stays on focus.
- Forced colours: the focused edge and the ring are `Highlight`.

## Review 2026-10-04

accessibility-reviewer re-reviewed 3ab7a38. It found the Combobox and Autocomplete contracts stale: they still described a 2px `focus-ring` outline on any focus. Fixed in this change (`combobox.a11y.md`, `autocomplete.a11y.md`), together with the 2.4.13 wording in DESIGN.md and the `theme-css` skill. Non-blocking findings, open follow-ups:

- [ ] (a) In forced colours, a click inside a box (InputGroup, Combobox and Autocomplete Control) shows only a 1px `ButtonBorder` to `Highlight` change. Add a transparent outline to the box's `:has(…:focus)` rules, for parity with the Input.
- [ ] (b) `use-focus-visible` treats screen-reader-synthesised "virtual" pointer events as a pointer. Treat them as keyboard, as React Aria does.
- [ ] (c) An invalid field that is click-focused has no visual change besides the caret.
- [ ] (d) The e2e test names say "focus-ring edge", but the edge is `border-focus`. (No test with that name was found in the tree on 2026-10-04: check the names when this is picked up.)
- [ ] (e) No component test proves `data-focused` on the Combobox input.
