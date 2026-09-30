---
name: accessibility
description: WCAG 2.2 AA / WAI-ARIA APG procedure for KvirnUI. Use when designing, implementing or reviewing any interactive behaviour — roles, ARIA, keyboard, focus, announcements, labelling, colour/contrast, motion, target size — or when writing a component's accessibility contract (*.a11y.md).
when_to_use: new component, a11y defect, keyboard/focus bug, ARIA question, contrast/theme tokens, review of a component diff
---

# Accessibility (WCAG 2.2 AA)

The bar is WCAG 2.2 AA with real assistive technology, not just a clean axe run. When the spec and AT behaviour disagree, choose what works for users and record the reason in an ADR.

## Procedure: designing or changing a component

1. **Find the pattern.** Look it up in [APG patterns](references/apg-patterns.md). If none fits, stop and write an ADR before designing your own.
2. **Native first.** Can `<button>`, `<input type=checkbox>`, `<dialog>`, `<details>`, `<select>` or `<fieldset>`/`<legend>` do the job? Only add ARIA where HTML falls short. No ARIA is better than bad ARIA.
3. **Write the contract** by copying [contract-template.md](references/contract-template.md) to `packages/react/src/<name>/<name>.a11y.md`. Fill in every section. The contract is the spec, and tests are derived from it.
4. **Keyboard.** Every pointer action needs a keyboard equivalent. Use roving `tabindex` or `aria-activedescendant` for composite widgets (pick one and document it). There is one Tab stop per composite widget. Arrow keys flip in RTL.
5. **Focus.** Specify initial focus, whether focus is trapped (modals only, with the background `inert`), and where focus goes on close (the trigger, or a documented fallback if the trigger is gone). Focus must never land on `body`, and must never be obscured (2.4.11).
6. **Name, role, value.** Every interactive element needs an accessible name. Prefer visible labels (`<label>`, `aria-labelledby`) over `aria-label`. Use `aria-describedby` for help and error text. State goes in `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-invalid`, `aria-disabled` (keep disabled items focusable when discoverability matters).
7. **Announcements (4.1.3).** Use the shared `Announcer` (a polite live region that already exists in the DOM). Never render a live region together with its content. Announced strings come from i18n.
8. **Visual.**
   - Focus indicator: at least 2px, with 3:1 contrast against adjacent colours (2.4.13 in the default theme).
   - Text contrast of 4.5:1, and 3:1 for UI and graphics.
   - Targets of at least 24×24px (2.5.8).
   - Content must survive 1.4.12 text spacing and reflow at 320px (1.4.10).
   - Hover and focus content must be dismissible, hoverable and persistent (1.4.13).
9. **Modes.**
   - `forced-colors: active`: use system colours, and never convey state only through background or box-shadow.
   - `prefers-reduced-motion`: no non-essential motion.
10. **Input.**
    - Dragging needs a single-pointer alternative (2.5.7).
    - No redundant entry (3.3.7).
    - Allow paste and autofill, and set the correct `autocomplete` (3.3.8).
    - Errors are identified in text and linked via `aria-describedby`. On submit, show an error summary and move focus to it.

## Common mistakes (reject in review)

- `role="menu"` used for site navigation. Use the disclosure navigation pattern instead.
- `aria-hidden="true"` on, or wrapping, focusable content.
- A placeholder used as the only label. Tooltips holding essential info, or placed on disabled buttons.
- A `div`/`span` with `onClick` instead of `<button>`. `tabindex` greater than 0.
- A combobox using the ARIA 1.0/1.1 structure. Use ARIA 1.2: `role=combobox` on the input and `aria-controls` pointing to the listbox.
- A focus trap that doesn't set the background `inert`, or a modal that doesn't restore focus.
- A live region added at the same moment as its message, which screen readers won't announce.
- Hard-coded English in `aria-label` or in announcements.
- Using `aria-disabled` without also blocking activation.
- Animations that ignore reduced motion. Focus rings removed with `outline: none` and no replacement.

## Review mode

When reviewing a diff, go through [wcag-22-checklist.md](references/wcag-22-checklist.md) and report findings as `file:line — defect — SC — affected users — fix`. Only flag real failures as blocking.

## References

- [references/apg-patterns.md](references/apg-patterns.md): component → APG pattern → key notes
- [references/wcag-22-checklist.md](references/wcag-22-checklist.md): SC checklist for component reviews
- [references/contract-template.md](references/contract-template.md): the `*.a11y.md` template
- `docs/accessibility.md`: AT matrix and definition of done
