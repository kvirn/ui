# Accessibility contract: Empty state

- **APG pattern:** none. An empty state is static text.
- **Deviations:** none
- **Native elements used:** the consumer's own markup: a heading, a `<p>` and a `kv-button-group`. The theme styles `kv-empty-state`, `kv-empty-state-title` and `kv-empty-state-body` (classes only, Plan 0074).
- **Status:** alpha candidate (Plan 0074). Manual AT is `pending`.
- **Tests:** none of its own: it has no code and no behaviour to test. `empty-state.stories.tsx` in `apps/storybook/src/components/empty-state/` renders the markup and its axe check runs in every theme.

An empty state is classes on your own markup. It adds no role, ARIA, string, live region or focus. A page that is empty on arrival is read in reading order. A filter that empties a list announces through the component that filtered (Table's row count, a search's result count).

## Roles, states, properties

| Part        | Element / role                  | ARIA | Notes                                                                            |
| ----------- | ------------------------------- | ---- | -------------------------------------------------------------------------------- |
| Empty state | the consumer's element, no role | none | `kv-empty-state`. Never centred. No illustration                                 |
| Title       | the consumer's `Heading`        | none | `kv-empty-state-title`. The level comes from the page's outline, not the class   |
| Body        | `<p>`                           | none | `kv-empty-state-body`. Say what isn't there and what to do next. Never "No data" |

## Keyboard

This component has no focusable parts and handles no keys.

Nothing in it is a Tab stop, so there are no key rows.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: it is in the flow.

## Visual / modes

- Colour: `text` and `heading`, never `text-muted`.
- forced-colors behaviour: text and heading only.
- RTL: start-aligned, logical properties.

## WCAG SCs covered

- 1.3.1 Info and Relationships, 1.4.1 Use of Color, 1.4.10 Reflow.

## AT test record

| AT + browser + OS          | Date    | Tester | Result | Notes |
| -------------------------- | ------- | ------ | ------ | ----- |
| NVDA + Firefox + Windows   | pending |        |        |       |
| VoiceOver + Safari + macOS | pending |        |        |       |
