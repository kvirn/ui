---
'@kvirn-ui/i18n': minor
'@kvirn-ui/react': minor
---

`DateInput` moves focus to the next box when the user's typing fills a box (Plan 0040). **This changes a default: it is on unless you pass `autoAdvance={false}`.** Alpha.

- **Behaviour change.** Typing `1990` in the year box of `ÅÅÅÅ-MM-DD` now moves focus to the month box, and `12` on to the day box, with the next box's text selected. Before, typing never moved focus. Pass `autoAdvance={false}` on `DateInput.Root` (or `useDateInput`) for the old behaviour. The maintainer approved the trade-off against WCAG 3.2.2 On Input for `DateInput` only: `OneTimeCode`, `TextInput` and every other control still never move focus on typing.
- **Guards.** It moves only when the user's own typing makes a box full (two digits for day and month, four for year, digits only) and never from the last box, to the next box in the DOM (the Tab order) and never to a disabled one. It never moves on paste, drop, autofill, deletion, a prefilled or controlled `value`, or an edit of a box that was already full. Backspace and Delete never move focus, and Tab and Shift+Tab are unchanged.
- **Advance notice (3.2.2).** `DateInput.Root` renders a visible hint under the boxes while `autoAdvance` is on, `dateInput.autoAdvanceHint` ("Focus moves to the next box when a box is full."), and lists it in the group's `aria-describedby` before your own `Fieldset.HelpText`. `autoAdvance={false}` removes both. Tests and stories that read the group's accessible description now see the hint first. With `useDateInput`, render `autoAdvanceHint` and list its id in the group's description yourself.
- `@kvirn-ui/i18n`: the new message `dateInput.autoAdvanceHint` in all six locales (`se` is an English placeholder until reviewed). Custom catalogs must add it.
- `@kvirn-ui/react`: `useDateInput({ autoAdvance })` (default `true`) returns `autoAdvanceHint` (`string | undefined`), and `DateInput.Root` takes `autoAdvance`.
