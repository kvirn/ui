---
'@kvirn-ui/react': minor
'@kvirn-ui/core': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

`Calendar` range mode (Plans 0086, 0087): `mode="range"` chooses a start and an end with two ordinary presses (Enter, Space or a click), so no key is added. `value`, `defaultValue` and `onValueChange(range, { reason, step, endCleared })` are a `{ start, end }` (`''` for a day not chosen; a start alone is valid). New props: `selects` (`both`, `start` or `end`, for a from/to pair of Calendars sharing one range), `minimumDays` and `maximumDays` (inclusive days), `allowUnavailableInRange`, and `visibleMonths` (`1` or `2`: two months side by side from 64rem, one below it and on the server). `Calendar.Heading` and `Calendar.Grid` take `offset={1}` for the second month; `Calendar.Grid` prepends your own `aria-labelledby` to its name. `Calendar.RangeHint` now also says the span limits and the next step. A day that can't be the end becomes the new start, announced. Range grids are `aria-multiselectable` with `aria-selected` on every day from the start to the end; day names add the start date, end date, the length of a possible end, or why a day can't be the end; the start press, a restart and the finished range are announced politely.

- React: `useCalendar` returns `months`, `rangeHintLines`, `range`, `rangeStep` and `visibleMonths`; day state attributes `data-range-start`, `data-range-end`, `data-in-range`, `data-preview`, `data-preview-end`; types `CalendarMonth`, `UseCalendarSingleOptions`, `UseCalendarRangeOptions`, `UseCalendarBaseOptions`, `DateRange`, `RangeSelects` and `CalendarRangeChange`. `CalendarRootProps` is now a union of the single and the range props.
- Core: the range functions and the store's range state (`createCalendar` options `mode`, `range`, `selects`, `minimumDays`, `maximumDays`, `allowUnavailableInRange`, `visibleMonths`, `onRangeChange`).
- i18n: the `calendar.*` range keys in `KvirnMessages` and all six catalogs (`se` is English, to be reviewed). A custom catalog must add them, and may use the new optional `rangePosition` and `rangeNote` parts in `calendar.dayName`.
- Theme: the range band, its edges and corners, the preview, two-month layout and forced colours, with no new token.
