# ADR-0031: Error below the control, several descriptions per field, and InputGroup for icons and add-ons

- **Status:** Proposed
- **Date:** 2026-10-02
- **Deciders:** Maintainer (field order and add-ons, 2026-10-02). Proposed with Plan 0013, Phase 1b.
- **Tags:** api, a11y, theming
- **Supersedes in part:** ADR-0029 (the visual order and "one Description per field"). DESIGN.md's "error message directly above the input".

## Context

Phase 1 followed GOV.UK: label, hint, error, then the control. The maintainer asked for the order most adopters know: label, description, control, a hint under the control, then the error message. Norway's Designsystemet, Material and most product UIs use this order. They also asked for icons and add-ons inside an input's box: currency and units ("kr", "%"), a search icon, a calendar icon.

The library doesn't enforce an order: the consumer owns the markup. The order is a default in DESIGN.md, the theme's spacing, the stories and the docs. Two things do need code:

- A field with a hint both above and below the control needs two Descriptions. Today they would share one id.
- Content inside the input's box needs a wrapper that carries the border, the focus ring and the invalid state.

## Decision drivers

- What adopters expect, as long as it doesn't cost assistive-technology users anything.
- `aria-describedby` reads in a fixed, predictable order.
- No form state (ADR-0029, item 0) and native elements first.
- A unit or icon shown inside the box must not be the only place its meaning lives.

## Decision

### 1. Default order: label, description, control, hint, error

- **DESIGN.md, the theme, the stories and the docs** show label, Description, control, an optional second Description (the hint under the control: a format, a character count), then ErrorMessage.
- **Fieldset:** legend, Description, the controls, then ErrorMessage.
- **The order stays the consumer's choice,** since they own the markup. The theme's spacing works in any order.
- **`aria-describedby`** lists every rendered Description in DOM order, then the error, whatever the visual order. Screen-reader users hear the hints first, then "Error: …".
- **Mobile mitigation, in the docs:** on submit, move focus to the first invalid field or the error summary (M4), and keep `scroll-padding` so the message under the field isn't hidden by the on-screen keyboard or an autocomplete list.

### 2. Several Descriptions per Field or Fieldset

- **Ids:** each Description gets its own id and registers it. The Root lists them in DOM order.
- **Hook users:** `useField` and `useFieldset` support more than one description, and their server-rendered markup stays complete. The plan sets the API.
- **Errors:** still one ErrorMessage per Field or Fieldset. A dev warning fires when two render.

### 3. InputGroup: add-ons inside the input's box

- **Parts:**
  - `InputGroup.Root` is a `<div>` that looks like the input box. It carries the border, the radius, the invalid and disabled state from the nearest Field, and the focus ring when its Input has keyboard focus.
  - `InputGroup.Addon` is a `<span>` for text ("kr", "%", "km") or a decorative Icon, before or after the Input.
  - The Input sits inside without its own border.
- **Start and end follow DOM order and reading direction.** An Addon before the Input is at the start, and it moves to the right in RTL. No `side` prop.
- **Addons are visual only:** `aria-hidden="true"`, never focusable, and never the only place the meaning lives. The label or description says it: "Månadshyra i kronor", like GOV.UK's prefix and suffix and Designsystemet's affixes. A dev warning fires when an Addon contains focusable content.
- **Clicking an Addon focuses the Input,** so the whole box is one target.
- **Interactive add-ons are real Buttons,** placed directly in `InputGroup.Root`, not inside an Addon. Examples are clear search, show password and open a calendar. Each has its own accessible name and Tab stop. The theme styles a `kv-button` inside the group to fit the box. The show-password and calendar behaviours themselves stay out of scope (Plan 0013, M4).
- **Classes and state:** `kv-input-group`, `kv-input-group-addon`, plus `data-invalid`, `data-disabled` and `data-focus-visible` on the Root.

### 4. Numbers

Unchanged: ADR-0030 still holds, and `type="number"` stays out of Input's type union. The maintainer chose not to change it now.

## Options considered

- **Error above the control (GOV.UK, the Phase 1 default):** the message is seen before the control, and the on-screen keyboard can't cover it. Rejected as the default because adopters expect it below. A consumer can still render it above.
- **Addon text linked through `aria-describedby`:** the unit can't be forgotten. Rejected because when the label already names the unit, users hear it twice. Mainstream systems hide affixes and put the unit in the label.
- **`InputGroup.Addon side="start|end"`:** explicit. Rejected because DOM order already decides it, and a prop could contradict it.

## Accessibility impact

- **1.3.1, 3.3.1, 4.1.2:** unchanged wiring. Every Description and the error are in the accessible description.
- **1.3.2 Meaningful sequence:** the DOM order matches the visual order in the default theme.
- **1.4.1, 1.4.11:** the group's edge and its 2px invalid edge use the same tokens as Input, checked by `theme:check`.
- **2.4.7, 2.4.11, 2.4.13:** the focus ring is drawn around the whole group, so it's never clipped by the box.
- **2.5.8:** an Addon makes the box larger, never smaller. Buttons in a group keep their 24×24 minimum.
- **Risk, error below the field on phones:** mitigated by moving focus on submit and by `scroll-padding`. This is listed as an AT and usability research question.

## Consequences

- DESIGN.md, the design spec, the theme, the stories and `field.md` change their default order.
- `useField` and `useFieldset` gain multiple-description support. The single-description API stays.
- The error summary block (M4) and DatePicker (M4) can put their calendar button in an InputGroup.

## Validation

- Component tests:
  - two Descriptions are both in `aria-describedby`, in DOM order, then the error;
  - Addons are `aria-hidden`, and clicking one focuses the input;
  - a Button inside a group keeps its name and its Tab stop.
- e2e: forced colours (the group's edge and focus ring), RTL (Addons swap sides) and 320px reflow.
- accessibility-reviewer. The manual AT run stays pending.
