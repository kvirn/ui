# WCAG 2.2 AA component review checklist

Mark each item Pass / Fail / N/A. Any Fail is blocking.

## Perceivable

- [ ] 1.1.1 Non-text content: icons have a text alternative or are `aria-hidden` next to a visible label
- [ ] 1.3.1 Info and relationships: semantics and ARIA convey the structure, and labels are associated programmatically
- [ ] 1.3.2 Meaningful sequence: DOM order matches visual order (portals included)
- [ ] 1.3.5 Identify input purpose: correct `autocomplete` on user-data inputs
- [ ] 1.4.1 Use of colour: state isn't conveyed by colour alone
- [ ] 1.4.3 / 1.4.11 Contrast: text at least 4.5:1, UI and focus at least 3:1 (default theme)
- [ ] 1.4.4 / 1.4.10 Resize and reflow: works at 200% text and at 320px width with no 2D scroll
- [ ] 1.4.12 Text spacing: no clipping with the overrides applied
- [ ] 1.4.13 Content on hover or focus: dismissible (Escape), hoverable, persistent

## Operable

- [ ] 2.1.1 / 2.1.2 Keyboard, no keyboard trap (except a modal, which Escape closes)
- [ ] 2.1.4 Character key shortcuts: none, or they can be remapped or turned off
- [ ] 2.2.1 / 2.2.2 Timing and auto-updating content can be paused (toasts)
- [ ] 2.4.3 Focus order is logical, and focus is restored after overlays close
- [ ] 2.4.6 Headings and labels are descriptive
- [ ] 2.4.7 Focus is visible, in every theme including forced-colors
- [ ] **2.4.11 Focus not obscured (minimum)**: sticky or floating layers don't cover the focused element
- [ ] 2.5.1 / 2.5.2 Pointer gestures and pointer cancellation (activate on up-event)
- [ ] 2.5.3 Label in name: the accessible name contains the visible label
- [ ] **2.5.7 Dragging movements** have a single-pointer alternative
- [ ] **2.5.8 Target size (minimum)** is at least 24×24 CSS px, or meets the spacing exception

## Understandable

- [ ] 3.1.2 Language of parts: `lang` is set on text in other languages (language switcher)
- [ ] 3.2.1 / 3.2.2 No change of context on focus or input without warning
- [ ] **3.2.6 Consistent help** is in the same relative place (blocks)
- [ ] 3.3.1 / 3.3.3 Errors are identified in text, with suggestions
- [ ] 3.3.2 Labels or instructions are present
- [ ] **3.3.7 Redundant entry**: previously entered data is carried forward or selectable
- [ ] **3.3.8 Accessible authentication (minimum)**: no cognitive test, and paste and autofill are allowed

## Robust

- [ ] 4.1.2 Name, role, value are correct in the accessibility tree (check with `toMatchAriaSnapshot`)
- [ ] 4.1.3 Status messages are announced via the live region without moving focus

## Beyond WCAG (KvirnUI policy)

- [ ] forced-colors mode works
- [ ] Reduced motion is respected
- [ ] No hard-coded strings, and all 6 locales are present
- [ ] RTL arrow keys flip
