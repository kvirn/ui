# Calendar

> **Draft** (Plan 0082). This page moves to the docs site. The accessibility contract is [calendar.a11y.md](calendar.a11y.md) and the design spec is [docs/design/date-picker-and-calendar.md](../../../../docs/design/date-picker-and-calendar.md).

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

## API

Dates are `YYYY-MM-DD` strings. A `minimum` after the `maximum` throws a `RangeError`.

| Prop                    | Type                            | Meaning                                                                                             |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `value`, `defaultValue` | `string`                        | The chosen day: controlled (`''` for none) with `onValueChange`, or the first day when uncontrolled |
| `onValueChange`         | `(date) => void`                | An available day was chosen                                                                         |
| `defaultFocusedDate`    | `string`                        | Where the grid opens when nothing is chosen, such as a typed date. Else today                       |
| `minimum`, `maximum`    | `string`                        | The range. Keys and the month buttons stop at it                                                    |
| `isDateUnavailable`     | `(date) => boolean`             | A day inside the range that can't be chosen                                                         |
| `getDateDescription`    | `(date) => string \| undefined` | Words added to a day's name, such as why it is unavailable                                          |
| `weekStart`             | `1`–`7`                         | First weekday, 1 = Monday. Else the provider's, the locale's, Monday                                |
| `weekNumbers`           | `boolean`                       | ISO 8601 week numbers. Monday start only: another start hides them and warns                        |
| `today`                 | `string`                        | Today, for tests and stories. Else the clock in the provider's time zone, read on mount             |
| `announce`              | `boolean`                       | Announce the new month and the chosen day. Default `true`                                           |
| `messages`              | `Partial<calendar>`             | Per-instance strings                                                                                |

Parts: `Calendar.Root` (`kv-calendar`), `Calendar.Heading` (`<h3 class="kv-calendar-heading">`, names the grid), `Calendar.PreviousMonth` and `Calendar.NextMonth` (icon buttons with a Tooltip; `aria-disabled` at the edge of the range), the optional `Calendar.PreviousYear` and `Calendar.NextYear`, `Calendar.RangeHint` (the range in words, describes the grid; renders only with a range), `Calendar.Grid` (`<table role="grid">`; with `children` you write the rows yourself). Every part takes `render`, `ref` and `className`.

Day state for CSS: `data-selected`, `data-today`, `data-unavailable`, `data-outside-range` on `td.kv-calendar-day`. Messages: `calendar.previousMonth`, `nextMonth`, `previousYear`, `nextYear`, `dayName`, `weekHeader`, `weekHeaderLong`, `weekName`, `rangeHint`, `selected`.

## Hook

`useCalendar(options)` returns the same behaviour for your own markup: `rootProps`, `headingProps`, `headingText`, the four step buttons' props, `rangeHintProps` and `rangeHint`, `gridProps`, `weekdays`, `weeks` (rows of `{ date, dayOfMonth }`, empty cells `undefined`) and `getDayProps(date)` for each day's `<td>`.

## Dev warnings

`calendar-heading-missing`, `calendar-range-hint-missing`, `calendar-week-numbers-need-monday` and `calendar-<part>-outside-root` are listed on Foundation / Dev warnings.
