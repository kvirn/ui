---
'@kvirn-ui/core': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/react': minor
---

`useFormat()` (Plan 0046): the provider's formatter, for numbers, dates, lists and plurals, in one hook call. It is the same `format` that message functions receive, so a value reads the same in a message and in a table cell. You build no `Intl.*` object, keep no locale map and set no time zone by hand.

```tsx
const format = useFormat()
format.number(1250.5, { minimumFractionDigits: 2 }) // "1 250,50" in sv
format.date('2026-01-23', { dateStyle: 'long' }) // "23 januari 2026" in sv
```

- React: `useFormat()` and the type `UseFormatResult`. Without a provider it is `en` and the runtime's time zone. The object stays the same until the locale or the time zone changes. `locale` is used as given: `Intl` reads a bare `en` as US English, so pass `en-GB` for EU English.
- Core: `format.date` also takes a calendar date, a `YYYY-MM-DD` string. It is shown on that day in every zone (read and shown as UTC), so a date of birth never moves a day. A `Date` or milliseconds is still an instant in the provider's `timeZone`. `options.timeZone` wins when given, and an `options.timeZone` of `undefined` now counts as not given (it used to switch an instant to the runtime's zone). Any other string, and a day that does not exist, throws a `RangeError`. `createMessageFormat` also reuses its `Intl` objects, keyed by options, so formatting every cell of a table builds one formatter per kind of cell.
- i18n: `MessageFormat['date']` takes `Date | number | string`. A hand-written `MessageFormat` has to accept a string.
