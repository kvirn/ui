# Calendar

> **Draft** (Plans 0082, 0087). This page moves to the docs site. The accessibility contract is [calendar.a11y.md](calendar.a11y.md) and the design spec is [docs/design/date-picker-and-calendar.md](../../../../docs/design/date-picker-and-calendar.md).

A month as a grid of days, for choosing one date near today: a booking, a start date, "last Thursday". It is a companion to typed entry, never a replacement: a [DateInput](../date-input/date-input.md) beside it is always the way that works for every user. For a date of birth or any date far from today, use only the DateInput. When many days are unavailable, prefer radio buttons.

- The grid is one Tab stop, on the focused day, and the arrow, Home, End and Page keys move through the days, across months. Enter, Space or a click chooses a day.
- Days of other months are empty cells. Unavailable days stay focusable and struck through, and say why in their name.
- Month and weekday names come from `Intl` in the provider's `locale`, in the Gregorian calendar with Latin digits. Weeks start on the provider's `weekStart` (Monday unless the locale names a region such as `en-US`).
- **Set `weekStart` explicitly on the provider (or the Calendar) for server rendering:** the locale-derived default reads `Intl`, which can differ between server and browser.
- After a month or year button the new month is announced, and after a day is chosen "{date} selected", both politely through the Announcer. Wrap the app in a `KvirnProvider`.

```tsx
import { Calendar } from '@kvirn-ui/react'

;<Calendar.Root
  value={date}
  onValueChange={setDate}
  minimum="2026-10-01"
  maximum="2026-12-31"
  isDateUnavailable={(day) => closedDays.has(day)}
  getDateDescription={(day) => (closedDays.has(day) ? 'Återvinningen stängd' : undefined)}
>
  <Calendar.PreviousMonth />
  <Calendar.Heading />
  <Calendar.NextMonth />
  <Calendar.RangeHint />
  <Calendar.Grid />
</Calendar.Root>
```

## Inline, no dialog

A Calendar is a page section you can render anywhere, next to a typed field or two side by side (a "from" and a "to" Calendar, the second with `minimum` set to the first's value). Give each its own `Fieldset.Root group` and legend so the two are told apart. The Inline and FromAndTo stories show both.

## Range mode

`mode="range"` chooses a start and an end with two ordinary presses (Enter, Space or a click), so no key is added and it works by touch, switch and voice. A day that can't be the end (before the start, too short, too long, past an unavailable day) becomes the new start and is announced: never a silent dead end.

```tsx
<Calendar.Root
  mode="range"
  value={range}
  onValueChange={setRange}
  minimumDays={2}
  maximumDays={15}
  visibleMonths={2}
>
  <Calendar.PreviousMonth />
  <Calendar.Heading />
  <Calendar.Heading offset={1} />
  <Calendar.NextMonth />
  <Calendar.RangeHint />
  <Calendar.Grid />
  <Calendar.Grid offset={1} />
</Calendar.Root>
```

- `value` / `defaultValue` is `{ start, end }`, `''` for a day not chosen; a start alone and an end alone are valid, and an end before the start shows as the start alone. `onValueChange(range, { reason, step, endCleared })` runs after every press that changed it, so a start alone is reported at once; `step` is `complete` when the range is finished.
- Spans are in inclusive days: a one-day range is 1 and a booking of 14 nights is `maximumDays={15}` (the messages know the nights too). `minimumDays` or `maximumDays` below 1, or a minimum above the maximum, is ignored with a warning.
- An unavailable day between the ends blocks the range; `allowUnavailableInRange` lets it pass (leave across a holiday). The day itself stays unavailable.
- `selects="start"` and `selects="end"` are the two Calendars of a from/to pair sharing one `value`. Give each Grid your own visible heading with `aria-labelledby` ("End date, oktober 2026"). An impossible end of the end Calendar is `aria-disabled` with its reason; the end Calendar follows the start's month. The RangeFromToPair story shows both.
- `visibleMonths={2}` is a maximum: two months from 64rem wide, one below it and on the server (the Calendar reads the viewport itself), so it never breaks 320px. The two grids are one Tab stop. Render `<Calendar.Heading offset={1} />` and `<Calendar.Grid offset={1} />`: they render nothing while one month shows.
- The RangeHint lines (the limits, the span, the next step) describe the grid. The start press, a restart and the finished range are announced politely; a preview of the end is drawn only, and each candidate's name carries its length ("7 dagar"). `aria-selected` is on every day in the range with `aria-multiselectable` on the grid; screen reader behaviour is a manual AT question.
- Day state for CSS: `data-range-start`, `data-range-end`, `data-in-range`, `data-preview`, `data-preview-end`.

## API

Dates are `YYYY-MM-DD` strings. A `minimum` after the `maximum` throws a `RangeError`.

| Prop                         | Type                            | Meaning                                                                                             |
| ---------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `value`, `defaultValue`      | `string`                        | The chosen day: controlled (`''` for none) with `onValueChange`, or the first day when uncontrolled |
| `onValueChange`              | `(date) => void`                | An available day was chosen                                                                         |
| `defaultFocusedDate`         | `string`                        | Where the grid opens when nothing is chosen, such as a typed date. Else today                       |
| `minimum`, `maximum`         | `string`                        | The range. Keys and the month buttons stop at it                                                    |
| `isDateUnavailable`          | `(date) => boolean`             | A day inside the range that can't be chosen                                                         |
| `getDateDescription`         | `(date) => string \| undefined` | Words added to a day's name, such as why it is unavailable                                          |
| `weekStart`                  | `1`–`7`                         | First weekday, 1 = Monday. Else the provider's, the locale's, Monday                                |
| `weekNumbers`                | `boolean`                       | ISO 8601 week numbers. Monday start only: another start hides them and warns                        |
| `today`                      | `string`                        | Today, for tests and stories. Else the clock in the provider's time zone, read on mount             |
| `announce`                   | `boolean`                       | Announce the new month and what a press did. Default `true`                                         |
| `mode`                       | `'single' \| 'range'`           | Default `single`. `range`: `value`, `defaultValue` and `onValueChange` are a `{ start, end }`       |
| `selects`                    | `'both' \| 'start' \| 'end'`    | Range: which end a press sets. Default `both`                                                       |
| `minimumDays`, `maximumDays` | `number`                        | Range: the span in inclusive days                                                                   |
| `allowUnavailableInRange`    | `boolean`                       | Range: a range may pass over an unavailable day. Default `false`                                    |
| `visibleMonths`              | `1 \| 2`                        | The most months side by side; two from 64rem only. Default `1`                                      |
| `messages`                   | `Partial<calendar>`             | Per-instance strings                                                                                |

Parts: `Calendar.Root` (`kv-calendar`), `Calendar.Heading` (`<h3 class="kv-calendar-heading">`, names the grid; `offset={1}` the second month), `Calendar.PreviousMonth` and `Calendar.NextMonth` (icon buttons with a Tooltip; `aria-disabled` at the edge of the range), the optional `Calendar.PreviousYear` and `Calendar.NextYear`, `Calendar.RangeHint` (the range, span limits and next step in words, describes the grid; renders only with a line), `Calendar.Grid` (`<table role="grid">`; `offset={1}` the second month; with `children` you write the rows yourself). Every part takes `render`, `ref` and `className`.

Day state for CSS: `data-selected`, `data-today`, `data-unavailable`, `data-outside-range` on `td.kv-calendar-day`. Messages: `calendar.previousMonth`, `nextMonth`, `previousYear`, `nextYear`, `dayName`, `weekHeader`, `weekHeaderLong`, `weekName`, `rangeHint`, `selected`, and for a range `rangeStart`, `rangeEnd`, `rangeStartAndEnd`, `rangeLength`, `rangeTooShort`, `rangeTooLong`, `rangeBlocked`, `rangeBeforeStart`, `rangeSpanHint`, `rangeChooseStart`, `rangeChooseEnd`, `rangeSelected`, `rangeEndSelected`, `rangeEndCleared`, `visibleMonths`.

## Hook

`useCalendar(options)` returns the same behaviour for your own markup: `rootProps`, `headingProps`, `headingText`, the four step buttons' props, `rangeHintProps` and `rangeHint`, `gridProps`, `weekdays`, `weeks` (rows of `{ date, dayOfMonth }`, empty cells `undefined`), `months` (each month's heading, grid props and weeks: one, or two in range-wide view), `range` and `rangeStep` and `getDayProps(date)` for each day's `<td>`.

## Dev warnings

`calendar-heading-missing`, `calendar-range-hint-missing`, `calendar-week-numbers-need-monday`, `calendar-range-days-invalid` and `calendar-<part>-outside-root` are listed on Foundation / Dev warnings.
